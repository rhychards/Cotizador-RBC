import React, { useState, useEffect } from 'react';
import { 
  X, 
  HardDrive, 
  FolderCheck, 
  ExternalLink, 
  RefreshCw, 
  Key, 
  FileText, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { 
  DRIVE_FOLDER_NAME, 
  TARGET_DRIVE_FOLDER_ID,
  TARGET_DRIVE_FOLDER_URL,
  getArchivedRecords, 
  DriveFileRecord, 
  getStoredDriveToken, 
  requestDriveAccessToken, 
  clearStoredDriveToken,
  getStoredClientId,
  setStoredClientId
} from '../services/googleDriveService';

interface GoogleDriveArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const GoogleDriveArchiveModal: React.FC<GoogleDriveArchiveModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [records, setRecords] = useState<DriveFileRecord[]>([]);
  const [token, setToken] = useState<string | null>(getStoredDriveToken());
  const [clientId, setClientId] = useState<string>(getStoredClientId());
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRecords(getArchivedRecords());
      setToken(getStoredDriveToken());
      setClientId(getStoredClientId());
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnect = async () => {
    setIsConnecting(true);
    setErrorMsg(null);
    try {
      if (clientId) {
        setStoredClientId(clientId);
      }
      const newToken = await requestDriveAccessToken(clientId);
      setToken(newToken);
      onShowToast('Conexión con Google Drive establecida exitosamente.');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error al autorizar con Google Drive.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    clearStoredDriveToken();
    setToken(null);
    onShowToast('Sesión de Google Drive cerrada.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-tight flex items-center gap-2">
                <span>Google Drive • Archivo de Cotizaciones</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-mono">
                  {DRIVE_FOLDER_NAME}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Almacenamiento oficial de cotizaciones generadas y firmadas de RBCOMUNICACIONES
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Dedicated Folder Target Banner */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
                <FolderCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                  Carpeta Oficial de Destino en Google Drive
                </p>
                <p className="text-xs font-mono font-semibold text-blue-900 mt-0.5 break-all">
                  ID: {TARGET_DRIVE_FOLDER_ID}
                </p>
                <p className="text-[11px] text-blue-700 mt-0.5">
                  El historial de cotizaciones generadas y firmadas se almacena en esta carpeta compartida.
                </p>
              </div>
            </div>

            <a
              href={TARGET_DRIVE_FOLDER_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <span>Abrir Carpeta en Google Drive</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Connection Status & Auth */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${token ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-xs font-bold text-slate-800">
                  Estado: {token ? 'Conectado a Google Drive' : 'Requiere Autorización'}
                </span>
              </div>
              {token ? (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="text-xs text-slate-500 hover:text-red-600 underline font-medium cursor-pointer"
                >
                  Cerrar sesión
                </button>
              ) : null}
            </div>

            {!token && (
              <div className="space-y-3 pt-1">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Conecta tu cuenta de Google para que las cotizaciones se sincronicen directamente en la carpeta compartida de Google Drive al emitirse o descargarse.
                </p>
                <button
                  type="button"
                  disabled={isConnecting}
                  onClick={handleConnect}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Conectando con Google Drive...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-3.5 h-3.5 text-blue-200" />
                      <span>Conectar y Autorizar Google Drive</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Archived Quotations List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-600" />
                Historial de Cotizaciones Archivadas ({records.length})
              </h3>
              <button
                type="button"
                onClick={() => setRecords(getArchivedRecords())}
                className="text-[11px] text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Actualizar</span>
              </button>
            </div>

            {records.length === 0 ? (
              <div className="text-center py-8 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-500 text-xs">
                <HardDrive className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-slate-700">Aún no hay cotizaciones en el registro local</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Al generar o descargar el PDF de una cotización, se archivará automáticamente en la carpeta de Google Drive.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                {records.map((rec) => (
                  <div key={rec.id} className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{rec.quotationCode}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          rec.type === 'firmada' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {rec.type === 'firmada' ? 'Firmada' : 'Generada'}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                          rec.status === 'archivado' ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {rec.status === 'archivado' ? 'En Drive' : 'Pendiente Sync'}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] truncate mt-0.5 font-mono">{rec.fileName}</p>
                      <span className="text-slate-400 text-[10px]">{rec.uploadedAt}</span>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {rec.driveUrl ? (
                        <a
                          href={rec.driveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded text-[11px] font-medium inline-flex items-center gap-1 transition-colors"
                        >
                          <span>Ver en Drive</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <a
                          href={TARGET_DRIVE_FOLDER_URL}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded text-[11px] font-medium inline-flex items-center gap-1 transition-colors"
                        >
                          <span>Ver Carpeta</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <a
            href={TARGET_DRIVE_FOLDER_URL}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
          >
            <span>Ir a la carpeta de Google Drive</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
