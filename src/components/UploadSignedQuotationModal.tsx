import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileCheck, 
  FileText, 
  CheckCircle2, 
  HardDrive, 
  Loader2, 
  AlertCircle, 
  ExternalLink,
  Trash2,
  Download,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Check
} from 'lucide-react';
import { Quotation, SignedDocumentInfo } from '../types';
import { 
  uploadQuotationToDrive, 
  DRIVE_FOLDER_NAME, 
  TARGET_DRIVE_FOLDER_ID,
  TARGET_DRIVE_FOLDER_URL,
  getStoredDriveToken, 
  requestDriveAccessToken 
} from '../services/googleDriveService';
import { validatePdfElectronicSignature, PdfSignatureValidationResult } from '../utils/pdfSignatureValidator';

interface UploadSignedQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: Quotation;
  onSaveSignedDocument: (signedDoc: SignedDocumentInfo, updatedQuotationStatus?: string) => void;
  onShowToast?: (message: string) => void;
  onNotify?: (message: string) => void;
  onOpenDriveView?: () => void;
}

export const UploadSignedQuotationModal: React.FC<UploadSignedQuotationModalProps> = ({
  isOpen,
  onClose,
  quotation,
  onSaveSignedDocument,
  onShowToast,
  onNotify,
  onOpenDriveView,
}) => {
  const notify = (msg: string) => {
    if (onShowToast) onShowToast(msg);
    else if (onNotify) onNotify(msg);
  };

  const [file, setFile] = useState<File | null>(null);
  const [signerName, setSignerName] = useState<string>(
    quotation.signedDocument?.signedBy || quotation.issuerSignature.name || 'Richart Bermeo Bonilla'
  );
  const [signDate, setSignDate] = useState<string>(
    quotation.signedDocument?.uploadedAt || new Date().toISOString().split('T')[0]
  );
  const [signerDocId, setSignerDocId] = useState<string>(
    quotation.issuerSignature.idNumber || quotation.client.docId || ''
  );
  const [certEntity, setCertEntity] = useState<string>('FirmaEC / Banco Central / Security Data');
  const [notes, setNotes] = useState<string>(
    quotation.signedDocument?.notes || 'Cotización con firma electrónica autorizada'
  );
  const [archiveToDrive, setArchiveToDrive] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [driveUrl, setDriveUrl] = useState<string | null>(quotation.signedDocument?.driveLink || null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Electronic signature validation state
  const [isValidatingSignature, setIsValidatingSignature] = useState<boolean>(false);
  const [signatureValidation, setSignatureValidation] = useState<PdfSignatureValidationResult | null>(null);
  const [isSignatureAuthorized, setIsSignatureAuthorized] = useState<boolean>(
    !!quotation.signedDocument?.fileName
  );
  const [manualCertificationAccepted, setManualCertificationAccepted] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelected = async (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.pdf') && selectedFile.type !== 'application/pdf') {
      setErrorMsg('Por favor seleccione un archivo en formato PDF (.pdf).');
      return;
    }
    setErrorMsg(null);
    setFile(selectedFile);
    setIsSignatureAuthorized(false);
    setManualCertificationAccepted(false);

    // Validate electronic signature in the PDF
    setIsValidatingSignature(true);
    try {
      const result = await validatePdfElectronicSignature(selectedFile);
      setSignatureValidation(result);

      if (result.hasDigitalSignature && result.isValid) {
        setIsSignatureAuthorized(true);
        if (result.signerName) {
          setSignerName(result.signerName);
        }
        if (result.signedDate) {
          setSignDate(result.signedDate);
        }
        if (result.authority) {
          setCertEntity(result.authority);
        }
        notify('✓ Firma electrónica PKCS#7 verificada exitosamente en el documento PDF.');
      } else {
        setIsSignatureAuthorized(false);
      }
    } catch (err) {
      console.warn('Error al analizar firma electrónica:', err);
      setSignatureValidation({
        hasDigitalSignature: false,
        isValid: false,
        details: 'Verificación manual requerida.',
      });
      setIsSignatureAuthorized(false);
    } finally {
      setIsValidatingSignature(false);
    }
  };

  const handleAuthorizeManualSignature = () => {
    if (!manualCertificationAccepted) {
      setErrorMsg('Debe marcar la casilla certificando la validez de la firma electrónica.');
      return;
    }
    if (!signerName.trim()) {
      setErrorMsg('Indique el nombre del firmante para autorizar el documento.');
      return;
    }

    setIsSignatureAuthorized(true);
    setErrorMsg(null);
    notify('Firma electrónica validada y autorizada para el archivo de la cotización.');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!quotation.items || quotation.items.length === 0) {
      setErrorMsg('No se pueden guardar cotizaciones vacías. Agregue productos o servicios a la cotización primero.');
      return;
    }

    if (!file && !quotation.signedDocument?.fileDataUrl) {
      setErrorMsg('Debe adjuntar el archivo PDF de la cotización firmada.');
      return;
    }

    if (!isSignatureAuthorized) {
      setErrorMsg('Debe validar la firma electrónica para autorizar el Guardar y Archivar la cotización.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      let fileDataUrl = quotation.signedDocument?.fileDataUrl;
      let finalFileName = quotation.signedDocument?.fileName || `${quotation.code}_firmada.pdf`;
      let finalFileSize = quotation.signedDocument?.fileSize || 0;
      let fileBlob: Blob | null = null;

      if (file) {
        finalFileName = file.name;
        finalFileSize = file.size;
        fileBlob = file;

        // Convert to base64 for offline storage
        fileDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      let driveLink = driveUrl || undefined;
      let driveFileId: string | undefined = quotation.signedDocument?.driveFileId;

      // Archive to Google Drive if requested
      if (archiveToDrive && fileBlob) {
        try {
          let token = getStoredDriveToken();
          if (!token) {
            try {
              token = await requestDriveAccessToken();
            } catch (authErr: any) {
              console.warn('OAuth prompt dismissed or cancelled:', authErr);
            }
          }

          if (token) {
            const driveRes = await uploadQuotationToDrive(
              fileBlob,
              `[FIRMADA] ${quotation.code} - ${finalFileName}`,
              quotation.code,
              'firmada',
              token
            );
            driveFileId = driveRes.fileId;
            driveLink = driveRes.driveUrl;
            setDriveUrl(driveRes.driveUrl || null);
          }
        } catch (driveErr: any) {
          console.warn('Drive upload error:', driveErr);
          notify('Cotización guardada localmente. Conecte Google Drive para sincronizar.');
        }
      }

      const signedInfo: SignedDocumentInfo = {
        fileName: finalFileName,
        fileSize: finalFileSize,
        fileDataUrl,
        uploadedAt: signDate,
        signedBy: signerName,
        notes: notes ? `${notes} (Firma validada: ${signatureValidation?.authority || certEntity})` : `Firma validada: ${certEntity}`,
        driveFileId,
        driveLink,
      };

      onSaveSignedDocument(signedInfo, 'firmada');
      notify(`¡Cotización firmada ${quotation.code} guardada y archivada con éxito!`);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error al procesar el archivo firmado.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveExisting = () => {
    if (window.confirm('¿Está seguro de remover el archivo firmado de esta cotización?')) {
      setFile(null);
      setDriveUrl(null);
      setIsSignatureAuthorized(false);
      setSignatureValidation(null);
      onSaveSignedDocument({
        fileName: '',
        fileSize: 0,
        uploadedAt: '',
        signedBy: '',
      }, 'aprobada');
      notify('Se eliminó el registro de cotización firmada.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 my-8">
        {/* Header */}
        <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shrink-0">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Subir Cotización Firmada</h2>
              <p className="text-[11px] text-slate-300 font-mono">
                {quotation.code} • {quotation.client.companyName || quotation.client.contactName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Current Signed Document Card if exists */}
          {quotation.signedDocument?.fileName && !file && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-emerald-950">Documento Firmado Registrado</p>
                    <span className="text-[9px] font-bold bg-emerald-200 text-emerald-800 px-1.5 py-0.2 rounded">
                      Firma Autorizada
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 truncate max-w-[240px]">
                    {quotation.signedDocument.fileName}
                  </p>
                  <p className="text-[10px] text-emerald-700">
                    Firmado por: {quotation.signedDocument.signedBy || 'Autorizado'} • {quotation.signedDocument.uploadedAt}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {quotation.signedDocument.fileDataUrl && (
                  <a
                    href={quotation.signedDocument.fileDataUrl}
                    download={quotation.signedDocument.fileName}
                    className="p-1.5 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors"
                    title="Descargar archivo firmado"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleRemoveExisting}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar documento firmado"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Upload Drop Zone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Archivo PDF con Firma Electrónica *
            </label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                file
                  ? isSignatureAuthorized
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-amber-400 bg-amber-50/40'
                  : 'border-slate-300 hover:border-red-500 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelected(e.target.files[0]);
                  }
                }}
              />

              {file ? (
                <div className="flex flex-col items-center justify-center space-y-1">
                  <FileCheck className={`w-8 h-8 ${isSignatureAuthorized ? 'text-emerald-600' : 'text-amber-500'}`} />
                  <span className="text-xs font-bold text-slate-900">{file.name}</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • PDF Listo
                  </span>
                  <span className="text-[10px] text-red-600 underline font-semibold mt-1">
                    Clic para cambiar de archivo
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-1.5 text-slate-500">
                  <UploadCloud className="w-8 h-8 text-slate-400" />
                  <p className="text-xs font-semibold text-slate-700">
                    Arrastre el PDF firmado aquí o <span className="text-red-600 underline">explore en su equipo</span>
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Soporta documentos PDF con firma electrónica avanzada (FirmaEC, BCE, Security Data, ANFAC)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Validation of Electronic Signature Section */}
          {isValidatingSignature && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-xs text-slate-600">
              <Loader2 className="w-4 h-4 animate-spin text-red-600" />
              <span>Validando firma electrónica y certificados en el PDF...</span>
            </div>
          )}

          {/* If electronic signature is validated and authorized */}
          {file && !isValidatingSignature && isSignatureAuthorized && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-start gap-2.5 text-emerald-950 shadow-xs">
              <div className="p-1 bg-emerald-200 text-emerald-800 rounded-md shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-0.5 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900">Firma Electrónica Validada</span>
                  <span className="bg-emerald-600 text-white font-mono text-[9px] px-2 py-0.5 rounded-full font-bold uppercase">
                    Autorizada
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  {signatureValidation?.format || 'Firma Electrónica Certificada'} • {signatureValidation?.authority || certEntity}
                </p>
                <p className="text-[10px] text-emerald-700 leading-tight">
                  Documento validado conforme a la normativa legal de firma electrónica. Autorizado para Guardar y Archivar.
                </p>
              </div>
            </div>
          )}

          {/* If file uploaded but signature needs explicit validation/certification */}
          {file && !isValidatingSignature && !isSignatureAuthorized && (
            <div className="p-3.5 bg-amber-50/90 border border-amber-300 rounded-xl space-y-2.5 text-amber-950">
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-900">Validación de Firma Electrónica Requerida</p>
                  <p className="text-[11px] text-amber-800 leading-tight mt-0.5">
                    Para autorizar el guardado y archivo, verifique y valide formalmente la firma electrónica del documento.
                  </p>
                </div>
              </div>

              <div className="bg-white/80 border border-amber-200 rounded-lg p-2.5 space-y-2 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase">
                      Entidad Certificadora
                    </label>
                    <select
                      value={certEntity}
                      onChange={(e) => setCertEntity(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white outline-none"
                    >
                      <option value="FirmaEC - Gobierno del Ecuador">FirmaEC (Gobierno del Ecuador)</option>
                      <option value="Banco Central del Ecuador (BCE)">Banco Central del Ecuador (BCE)</option>
                      <option value="Security Data Seguridad en Datos">Security Data</option>
                      <option value="ANFAC Autoridad de Certificación">ANFAC Ecuador</option>
                      <option value="Consejo de la Judicatura - ICERT">Consejo de la Judicatura</option>
                      <option value="Uanataca Ecuador">Uanataca Ecuador</option>
                      <option value="Adobe Acrobat Sign / Digital ID">Adobe Acrobat Sign</option>
                      <option value="Otra Entidad Certificadora Autorizada">Otra Entidad Acreditada</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase">
                      C.I. / RUC del Firmante
                    </label>
                    <input
                      type="text"
                      value={signerDocId}
                      onChange={(e) => setSignerDocId(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white outline-none font-mono"
                      placeholder="Ej: 0201771671"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-1 border-t border-amber-100">
                  <input
                    type="checkbox"
                    id="manual-signature-certify-check"
                    checked={manualCertificationAccepted}
                    onChange={(e) => setManualCertificationAccepted(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 text-red-600 rounded border-slate-300 cursor-pointer"
                  />
                  <label htmlFor="manual-signature-certify-check" className="text-[11px] text-slate-700 cursor-pointer select-none">
                    Certifico que este documento PDF cuenta con firma electrónica válida y vigente conforme a la Ley de Comercio Electrónico.
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleAuthorizeManualSignature}
                  disabled={!manualCertificationAccepted}
                  className="w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-md shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Validar y Autorizar Firma Electrónica</span>
                </button>
              </div>
            </div>
          )}

          {/* Signer details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Firmado Por (Nombre) *
              </label>
              <input
                type="text"
                required
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="Richart Oswaldo Bermeo Bonilla"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha de Suscripción *
              </label>
              <input
                type="date"
                required
                value={signDate}
                onChange={(e) => setSignDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notas u Observaciones del Respaldo
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="Aprobado por el cliente con firma digital autorizada"
            />
          </div>

          {/* Google Drive Archiving Option */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-3">
            <input
              type="checkbox"
              id="archive-drive-checkbox"
              checked={archiveToDrive}
              onChange={(e) => setArchiveToDrive(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
            />
            <label htmlFor="archive-drive-checkbox" className="text-xs cursor-pointer select-none">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <HardDrive className="w-3.5 h-3.5 text-blue-600" />
                <span>Archivar en Google Drive</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Guarda automáticamente una copia en la nube en la carpeta oficial <a href={TARGET_DRIVE_FOLDER_URL} target="_blank" rel="noreferrer" className="text-blue-600 font-semibold underline hover:text-blue-800">"{DRIVE_FOLDER_NAME}" ({TARGET_DRIVE_FOLDER_ID})</a> para respaldo permanente.
              </p>
            </label>
          </div>

          {driveUrl && (
            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-semibold">Archivado en Google Drive</span>
              </div>
              <a
                href={driveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 font-bold underline text-[11px]"
              >
                <span>Abrir en Drive</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Action Buttons: Guardar y Archivar Cotización (Requires Electronic Signature Validation) */}
          <div className="flex items-center justify-between gap-2.5 pt-2 border-t border-slate-200">
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              {!isSignatureAuthorized ? (
                <span className="text-amber-700 font-medium flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-600" />
                  Requiere validar firma para autorizar
                </span>
              ) : (
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Firma autorizada para archivo
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isProcessing || !isSignatureAuthorized || (!file && !quotation.signedDocument?.fileDataUrl) || quotation.items.length === 0}
                className={`inline-flex items-center px-4 py-2 text-white text-xs font-bold rounded-lg shadow-sm transition-all ${
                  isSignatureAuthorized && (file || quotation.signedDocument?.fileDataUrl) && !isProcessing && quotation.items.length > 0
                    ? 'bg-red-600 hover:bg-red-700 cursor-pointer shadow-md'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
                }`}
                title={
                  quotation.items.length === 0
                    ? 'No se pueden guardar cotizaciones vacías'
                    : !isSignatureAuthorized
                    ? 'Debe validar la firma electrónica para autorizar el Guardar y Archivar'
                    : 'Guardar y Archivar Cotización'
                }
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    <span>Guardando & Archivando...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-3.5 h-3.5 mr-1.5" />
                    <span>Guardar y Archivar Cotización</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
