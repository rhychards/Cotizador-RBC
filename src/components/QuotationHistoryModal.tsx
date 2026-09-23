import React, { useState } from 'react';
import { Quotation } from '../types';
import { formatCurrency } from '../data/constants';
import { 
  X, 
  Search, 
  FileText, 
  Copy, 
  Trash2, 
  FolderOpen, 
  Download, 
  Upload, 
  HardDrive,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { TARGET_DRIVE_FOLDER_URL, TARGET_DRIVE_FOLDER_ID } from '../services/googleDriveService';

interface QuotationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotations: Quotation[];
  currentId: string;
  onSelectQuotation: (quotation: Quotation) => void;
  onDuplicateQuotation: (quotation: Quotation) => void;
  onDeleteQuotation: (id: string) => void;
  onImportQuotations: (imported: Quotation[]) => void;
  onOpenDriveModal?: () => void;
  onResetHistoryAndSystem?: () => void;
}

export const QuotationHistoryModal: React.FC<QuotationHistoryModalProps> = ({
  isOpen,
  onClose,
  quotations,
  currentId,
  onSelectQuotation,
  onDuplicateQuotation,
  onDeleteQuotation,
  onImportQuotations,
  onOpenDriveModal,
  onResetHistoryAndSystem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  if (!isOpen) return null;

  const filtered = quotations.filter((q) => {
    if (!q || !Array.isArray(q.items) || q.items.length === 0) return false;

    const matchesSearch = 
      q.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.client.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.client.docId.includes(searchTerm);

    const matchesStatus = filterStatus === 'all' || q.status === filterStatus;
    const matchesType = filterType === 'all' || q.client.type === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleExportJSON = () => {
    const validOnly = quotations.filter(q => q && Array.isArray(q.items) && q.items.length > 0);
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(validOnly, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `respaldo_cotizaciones_rbc_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          const validOnly = parsed.filter(q => q && Array.isArray(q.items) && q.items.length > 0);
          onImportQuotations(validOnly);
          alert('Cotizaciones importadas exitosamente.');
        } else {
          alert('El archivo no contiene un formato de cotizaciones válido.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div id="history-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div id="history-modal-card" className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Historial de Cotizaciones Emitidas</h3>
              <p className="text-xs text-slate-400">
                Almacenamiento en Google Drive: <span className="font-mono text-blue-300 font-semibold">{TARGET_DRIVE_FOLDER_ID}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={TARGET_DRIVE_FOLDER_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              title="Abrir carpeta oficial de cotizaciones en Google Drive"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Carpeta Drive</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters and search */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código, cliente, RUC..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto text-xs">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 outline-none"
            >
              <option value="all">Todos los clientes</option>
              <option value="normal">Normal</option>
              <option value="corporativo">Corporativo</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 outline-none"
            >
              <option value="all">Todos los estados</option>
              <option value="borrador">Borrador</option>
              <option value="enviada">Enviada</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
              <option value="facturada">Facturada</option>
            </select>

            <a
              href={TARGET_DRIVE_FOLDER_URL}
              target="_blank"
              rel="noreferrer"
              className="sm:hidden p-1.5 text-blue-600 hover:text-blue-800 rounded-lg border border-blue-200 bg-blue-50"
              title="Abrir carpeta Google Drive"
            >
              <HardDrive className="w-4 h-4" />
            </a>

            <button
              onClick={handleExportJSON}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg border border-slate-300 bg-white"
              title="Descargar respaldo JSON"
            >
              <Download className="w-4 h-4" />
            </button>

            <label
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg border border-slate-300 bg-white cursor-pointer"
              title="Cargar respaldo JSON"
            >
              <Upload className="w-4 h-4" />
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* List of quotes */}
        <div className="p-4 overflow-y-auto divide-y divide-slate-100 flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-sm">No se encontraron cotizaciones</p>
              <p className="text-xs">Genere una nueva cotización en el panel principal.</p>
            </div>
          ) : (
            filtered.map((quote) => {
              const isSelected = quote.id === currentId;
              const itemsSub = quote.items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);
              const grandTotal = itemsSub * (1 + (quote.taxRate || 15) / 100);

              return (
                <div
                  key={quote.id}
                  className={`py-3 px-3 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors ${
                    isSelected ? 'bg-red-50/50 border border-red-200' : ''
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-sm">{quote.code}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        quote.client.type === 'corporativo' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {quote.client.type}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 font-medium">Emisión: {quote.date}</span>
                      {quote.signedDocument?.fileName && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          Firmada Digitalmente
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-700 font-medium">
                      {quote.client.companyName || quote.client.contactName}
                      <span className="text-slate-400 ml-1">({quote.client.docId})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Total con IVA</span>
                      <span className="text-sm font-bold text-slate-900">
                        {formatCurrency(grandTotal)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          onSelectQuotation(quote);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-xs"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        Abrir
                      </button>

                      <button
                        onClick={() => onDuplicateQuotation(quote)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded"
                        title="Duplicar como nueva cotización"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`¿Está seguro de eliminar la cotización ${quote.code}?`)) {
                            onDeleteQuotation(quote.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span>Total cotizaciones: {quotations.filter(q => q && Array.isArray(q.items) && q.items.length > 0).length}</span>
            <span className="text-slate-300">•</span>
            <a
              href={TARGET_DRIVE_FOLDER_URL}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Ver carpeta en Drive ({TARGET_DRIVE_FOLDER_ID})</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex items-center gap-2">
            {onResetHistoryAndSystem && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('¿Está seguro de que desea REINICIAR EL SISTEMA y ELIMINAR EL HISTORIAL de cotizaciones generadas?\n\nEsta acción borrará todas las cotizaciones guardadas y restablecerá el correlativo desde COT-RBC-2026-001.')) {
                    onResetHistoryAndSystem();
                    onClose();
                  }
                }}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 border border-red-200 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Reiniciar el sistema y eliminar todas las cotizaciones del historial"
              >
                <RotateCcw className="w-3.5 h-3.5 text-red-600" />
                <span>Reiniciar y Vaciar Historial</span>
              </button>
            )}
            {onOpenDriveModal && (
              <button
                type="button"
                onClick={onOpenDriveModal}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg font-medium transition-colors cursor-pointer"
              >
                Configurar Google Drive
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-700 font-semibold"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
