import React, { useState } from 'react';
import { Quotation, CompanyInfo } from '../types';
import { 
  downloadQuotationPdf, 
  openPrintableWindow, 
  triggerPrintOrExport 
} from '../utils/pdfExport';
import { 
  FileDown, 
  Printer, 
  ExternalLink, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  FileText,
  ShieldCheck
} from 'lucide-react';

interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: Quotation;
  company: CompanyInfo;
  onNotify: (message: string) => void;
}

export const ExportPdfModal: React.FC<ExportPdfModalProps> = ({
  isOpen,
  onClose,
  quotation,
  company,
  onNotify,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [successStatus, setSuccessStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const hasNoItems = quotation.items.length === 0;

  const handleDownloadPdf = async () => {
    if (hasNoItems) {
      setExportError('No se puede generar el PDF: debe registrar al menos un producto o servicio en la cotización.');
      return;
    }

    setIsGeneratingPdf(true);
    setExportError(null);
    setSuccessStatus(null);

    const safeCode = quotation.code.replace(/[/\\?%*:|"<>]/g, '-');
    const filename = `${safeCode}_${quotation.client.companyName || quotation.client.contactName || 'Cotizacion'}.pdf`
      .replace(/\s+/g, '_');

    try {
      const success = await downloadQuotationPdf('quotation-print-document', quotation.code, {
        fileName: filename,
        onStart: () => {},
        onSuccess: () => {
          setSuccessStatus(`¡Archivo ${filename} generado y descargado con éxito!`);
          onNotify(`PDF de cotización ${quotation.code} descargado correctamente.`);
        },
        onError: (err) => {
          console.error('PDF export error:', err);
          setExportError(`Inconveniente al exportar PDF: ${err.message || 'Error del navegador'}. Puedes usar "Imprimir en Impresora Local" o "Abrir en Nueva Pestaña".`);
        }
      });

      if (!success && !exportError) {
        setExportError('El navegador no completó la descarga directa. Puedes usar "Imprimir en Impresora Local" o "Abrir en Nueva Pestaña Limpia" para guardar como PDF.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error inesperado al crear el archivo PDF';
      setExportError(`Error: ${msg}. Prueba con "Abrir en Nueva Pestaña Limpia".`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDirectPrint = async () => {
    if (hasNoItems) {
      setExportError('No se puede imprimir: debe registrar al menos un producto o servicio en la cotización.');
      return;
    }

    setExportError(null);
    setSuccessStatus(null);
    
    try {
      // Check if inside iframe
      const isIframe = window.self !== window.top;
      if (isIframe) {
        try {
          window.print();
          setSuccessStatus('Enviado a diálogo de impresión.');
        } catch (e) {
          console.warn('Iframe blocked print:', e);
          setExportError('El navegador restringió el diálogo de impresión dentro del visor. Usa "Abrir en Nueva Pestaña Limpia" para imprimir o guardar como PDF.');
        }
      } else {
        window.print();
        setSuccessStatus('Diálogo de impresión activado.');
      }
    } catch (e) {
      setExportError('No fue posible abrir el diálogo de impresión directamente.');
    }
  };

  const handleOpenStandaloneTab = () => {
    setExportError(null);
    const opened = openPrintableWindow('quotation-print-document', `Cotización ${quotation.code} - ${quotation.client.companyName || 'RB Comunicaciones'}`);
    if (!opened) {
      setExportError('El navegador bloqueó la ventana emergente. Por favor, permite ventanas emergentes o usa "Descargar PDF".');
    } else {
      setSuccessStatus('Ventana de impresión independiente abierta. Puedes guardar como PDF usando Ctrl+P.');
      onNotify('Ventana de impresión abierta.');
    }
  };

  return (
    <div 
      id="export-pdf-modal-backdrop" 
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 print:hidden animate-fade-in"
    >
      <div 
        id="export-pdf-modal-card"
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-600/20 text-red-500 rounded-lg border border-red-500/30">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                Generar PDF / Imprimir Cotización
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {quotation.code} • {quotation.client.companyName || quotation.client.contactName || 'Sin cliente asignado'}
              </p>
            </div>
          </div>
          <button
            id="close-export-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs text-slate-600">
          {/* Status banners */}
          {isGeneratingPdf && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800">
              <Loader2 className="w-5 h-5 animate-spin text-red-600 shrink-0" />
              <div>
                <p className="font-bold text-xs">Renderizando documento en alta resolución...</p>
                <p className="text-[11px] text-red-600">Calculando proporciones A4, membrete y firmas digitales.</p>
              </div>
            </div>
          )}

          {successStatus && !isGeneratingPdf && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-xs font-semibold">{successStatus}</p>
            </div>
          )}

          {exportError && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-900">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs">Aviso del Navegador:</p>
                <p className="text-[11px] text-amber-800">{exportError}</p>
              </div>
            </div>
          )}

          {/* Warning banner when no items registered */}
          {hasNoItems && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5 text-amber-900">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs">Atención: Cotización sin productos o servicios</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Debe registrar al menos un producto o servicio en el formulario para habilitar la generación del PDF o la impresión.
                </p>
              </div>
            </div>
          )}

          {/* Action Options */}
          <div className="space-y-3 pt-1">
            {/* Primary Action: Download PDF Direct */}
            <button
              id="modal-direct-pdf-download-btn"
              type="button"
              disabled={isGeneratingPdf || hasNoItems}
              onClick={handleDownloadPdf}
              className={`w-full flex items-center justify-between p-4 text-white rounded-xl shadow-md transition-all group text-left ${
                hasNoItems
                  ? 'bg-slate-300 cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 cursor-pointer'
              }`}
              title={
                hasNoItems
                  ? 'Agregue al menos un producto o servicio para descargar el PDF'
                  : 'Descargar archivo PDF'
              }
            >
              <div className="flex items-center space-x-3.5">
                <div className="p-2.5 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                  <FileDown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                    Descargar Archivo PDF Directo
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono font-normal">
                      Recomendado
                    </span>
                  </h4>
                  <p className="text-[11px] text-red-100">
                    Genera y descarga el archivo .PDF listo para enviar por WhatsApp o correo.
                  </p>
                </div>
              </div>
              <Sparkles className="w-5 h-5 text-red-200 shrink-0 opacity-80 group-hover:opacity-100" />
            </button>

            {/* Secondary Action: Print or Save as PDF with System Dialog */}
            <button
              id="modal-system-print-btn"
              type="button"
              disabled={isGeneratingPdf || hasNoItems}
              onClick={handleDirectPrint}
              className={`w-full flex items-center justify-between p-3.5 border rounded-xl transition-colors text-left ${
                hasNoItems
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800 cursor-pointer'
              }`}
              title={
                hasNoItems
                  ? 'Agregue al menos un producto o servicio para imprimir'
                  : 'Imprimir con cuadro de diálogo del sistema'
              }
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-200 text-slate-700 rounded-lg">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs">
                    Imprimir en Impresora Local
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Abre el cuadro de diálogo de impresión nativo del sistema operativo.
                  </p>
                </div>
              </div>
            </button>

            {/* Third Action: Standalone Tab */}
            <button
              id="modal-open-tab-btn"
              type="button"
              disabled={isGeneratingPdf || hasNoItems}
              onClick={handleOpenStandaloneTab}
              className={`w-full flex items-center justify-between p-3.5 border rounded-xl transition-colors text-left ${
                hasNoItems
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800 cursor-pointer'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-200 text-slate-700 rounded-lg">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs">
                    Abrir en Nueva Pestaña Limpia
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Ideal si tu visor web bloquea popups o para imprimir sin marcos de pantalla.
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Technical Specs Guarantee */}
          <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/70 p-3 rounded-lg flex items-start gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              El documento se genera en formato ejecutivo compacto de media hoja (máximo 50% de hoja A4), con membrete oficial de RB Comunicaciones y RUC 0201771672001.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-200 text-slate-700 font-semibold rounded-lg border border-slate-300 transition-colors text-xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
