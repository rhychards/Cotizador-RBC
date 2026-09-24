/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Quotation, 
  CompanyInfo, 
  DigitalSignature,
  SignedDocumentInfo,
  ClientInfo
} from './types';
import { 
  DEFAULT_COMPANY, 
  DEFAULT_SPECIAL_REQUIREMENTS, 
  DEFAULT_INTERNET_SERVICE, 
  DEFAULT_PAYMENT_TERMS, 
  DEFAULT_BANK_ACCOUNT,
  getNextSequenceCode, 
  calculateExpiryDate 
} from './data/constants';
import { CompanyLogo } from './components/CompanyLogo';
import { QuotationForm } from './components/QuotationForm';
import { QuotationDocument } from './components/QuotationDocument';
import { SignaturePadModal } from './components/SignaturePadModal';
import { QuotationHistoryModal } from './components/QuotationHistoryModal';
import { CompanySettingsModal } from './components/CompanySettingsModal';
import { ExportPdfModal } from './components/ExportPdfModal';
import { UploadSignedQuotationModal } from './components/UploadSignedQuotationModal';
import { GoogleDriveArchiveModal } from './components/GoogleDriveArchiveModal';
import { downloadQuotationPdf } from './utils/pdfExport';
import { archiveQuotationToDrive, DRIVE_FOLDER_NAME, clearArchivedRecords } from './services/googleDriveService';
import { 
  Plus, 
  Save, 
  History, 
  Printer, 
  FileDown,
  Loader2,
  Settings, 
  Eye, 
  Edit3, 
  Columns, 
  Check, 
  Sparkles,
  Share2,
  UploadCloud,
  HardDrive,
  RotateCcw
} from 'lucide-react';

const STORAGE_QUOTATIONS_KEY = 'rbc_quotations_list_v1';
const STORAGE_COMPANY_KEY = 'rbc_company_profile_v1';
const STORAGE_LAST_CLIENT_KEY = 'rbc_last_client_v1';
const STORAGE_SYSTEM_RESET_FLAG = 'rbc_system_reset_v7_no_empty_quotes';

// Helper to retrieve the last saved/registered client data
const getStoredLastClient = (existingQuotes?: Quotation[]): ClientInfo => {
  try {
    const raw = localStorage.getItem(STORAGE_LAST_CLIENT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.companyName || parsed.contactName || parsed.docId)) {
        return parsed;
      }
    }
  } catch (_) {}

  if (existingQuotes && existingQuotes.length > 0) {
    for (const q of existingQuotes) {
      if (q.client && (q.client.companyName || q.client.contactName || q.client.docId)) {
        return { ...q.client };
      }
    }
  }

  return {
    type: 'normal',
    companyName: '',
    contactName: '',
    docId: '',
    phone: '',
    email: '',
    address: '',
  };
};

// Clean quote generator without dummy data
const createCleanQuotation = (code: string = 'COT-RBC-2026-001'): Quotation => {
  const today = new Date().toISOString().split('T')[0];
  return {
    id: 'quote-' + Date.now(),
    code: code,
    date: today,
    validityDays: 30,
    expiryDate: calculateExpiryDate(today, 30),
    client: {
      type: 'normal',
      companyName: '',
      contactName: '',
      docId: '',
      phone: '',
      email: '',
      address: '',
    },
    items: [],
    internetService: {
      type: 'cliente',
      technicalSpecs: 'Conexión cableada dedicada mediante puerto RJ45 (no Wi-Fi), ancho de banda simétrico mínimo recomendado: 20 Mbps de subida (Upload) exclusiva para transmisión.',
      cost: 0,
    },
    specialRequirements: {
      ...DEFAULT_SPECIAL_REQUIREMENTS,
    },
    generalNotes: '',
    paymentTerms: DEFAULT_PAYMENT_TERMS,
    taxRate: 15,
    discountPercentage: 0,
    status: 'borrador',
    issuerSignature: {
      name: 'Richart Oswaldo Bermeo Bonilla',
      titleOrRole: 'Representante Legal',
      idNumber: '1103986962',
      signedAt: today,
      approved: true,
    },
    clientSignature: {
      name: '',
      titleOrRole: '',
      idNumber: '',
      signedAt: '',
      approved: false,
    },
    bankAccount: DEFAULT_BANK_ACCOUNT,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export default function App() {
  // Company Profile state
  const [company, setCompany] = useState<CompanyInfo>(() => {
    const saved = localStorage.getItem(STORAGE_COMPANY_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const name = (!parsed.name || parsed.name.toUpperCase().includes('RBCOMUNICACIONES')) ? 'RICHART OSWALDO BERMEO BONILLA' : parsed.name;
        const tradeName = (parsed.tradeName && !parsed.tradeName.toUpperCase().includes('RBCOMUNICACIONES')) ? parsed.tradeName : '';
        const ruc = (!parsed.ruc || parsed.ruc === '0201771672') ? DEFAULT_COMPANY.ruc : parsed.ruc;
        return {
          ...DEFAULT_COMPANY,
          ...parsed,
          name,
          tradeName,
          ruc,
          representativeName: (!parsed.representativeName || parsed.representativeName.includes('Mcs') || parsed.representativeName === 'Richart Bermeo')
            ? 'Richart Oswaldo Bermeo Bonilla'
            : parsed.representativeName,
          bankAccount: parsed.bankAccount || DEFAULT_BANK_ACCOUNT,
        };
      } catch (e) {}
    }
    return DEFAULT_COMPANY;
  });

  // Quotations list state - strictly stores only non-empty saved quotations
  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    // If system reset flag is not set, perform immediate cleanup of past history
    const isResetDone = localStorage.getItem(STORAGE_SYSTEM_RESET_FLAG);
    if (!isResetDone) {
      try {
        localStorage.removeItem(STORAGE_QUOTATIONS_KEY);
        localStorage.removeItem(STORAGE_LAST_CLIENT_KEY);
        clearArchivedRecords();
        localStorage.setItem(STORAGE_SYSTEM_RESET_FLAG, 'true');
      } catch (_) {}
      return [];
    }

    const saved = localStorage.getItem(STORAGE_QUOTATIONS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Exclude any empty quotation (must have at least one product or service)
          return parsed
            .filter((q: Quotation) => q && Array.isArray(q.items) && q.items.length > 0)
            .map((q: Quotation) => ({
              ...q,
              bankAccount: q.bankAccount || DEFAULT_BANK_ACCOUNT,
              issuerSignature: {
                ...q.issuerSignature,
                name: (!q.issuerSignature?.name || q.issuerSignature.name.includes('Mcs') || q.issuerSignature.name === 'Comunicaciones')
                  ? 'Richart Oswaldo Bermeo Bonilla'
                  : q.issuerSignature.name,
                titleOrRole: (!q.issuerSignature?.titleOrRole || q.issuerSignature.titleOrRole.includes('RBCOMUNICACIONES') || q.issuerSignature.titleOrRole.includes('Gerencia General'))
                  ? 'Representante Legal'
                  : q.issuerSignature.titleOrRole,
              }
            }));
        }
      } catch (e) {}
    }
    return [];
  });

  // Active quotation
  const [activeQuotation, setActiveQuotation] = useState<Quotation>(() => {
    const validSaved = quotations.find(q => q.items && q.items.length > 0);
    const quote = validSaved || createCleanQuotation('COT-RBC-2026-001');
    const isClientBlank = !quote.client?.companyName && !quote.client?.contactName && !quote.client?.docId;
    const clientToUse = isClientBlank ? getStoredLastClient(quotations) : quote.client;

    return {
      ...quote,
      client: clientToUse,
      bankAccount: quote.bankAccount || DEFAULT_BANK_ACCOUNT,
      issuerSignature: {
        ...quote.issuerSignature,
        name: (!quote.issuerSignature?.name || quote.issuerSignature.name.includes('Mcs') || quote.issuerSignature.name === 'Comunicaciones')
          ? 'Richart Oswaldo Bermeo Bonilla'
          : quote.issuerSignature.name,
        titleOrRole: (!quote.issuerSignature?.titleOrRole || quote.issuerSignature.titleOrRole.includes('RBCOMUNICACIONES') || quote.issuerSignature.titleOrRole.includes('Gerencia General'))
          ? 'Representante Legal'
          : quote.issuerSignature.titleOrRole,
      }
    };
  });

  // UI View state: 'split' (side-by-side) | 'form' (only editor) | 'preview' (only doc)
  const [viewMode, setViewMode] = useState<'split' | 'form' | 'preview'>('split');

  // Modal states
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSignIssuerOpen, setIsSignIssuerOpen] = useState(false);
  const [isSignClientOpen, setIsSignClientOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isUploadSignedModalOpen, setIsUploadSignedModalOpen] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync with localStorage - NEVER save empty quotations
  useEffect(() => {
    const validQuotations = quotations.filter(q => q && Array.isArray(q.items) && q.items.length > 0);
    localStorage.setItem(STORAGE_QUOTATIONS_KEY, JSON.stringify(validQuotations));
  }, [quotations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_COMPANY_KEY, JSON.stringify(company));
  }, [company]);

  // Persist the latest client data so it's loaded by default
  useEffect(() => {
    if (
      activeQuotation.client &&
      (activeQuotation.client.companyName ||
        activeQuotation.client.contactName ||
        activeQuotation.client.docId)
    ) {
      try {
        localStorage.setItem(STORAGE_LAST_CLIENT_KEY, JSON.stringify(activeQuotation.client));
      } catch (_) {}
    }
  }, [activeQuotation.client]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Create brand new quotation (preloads the latest registered client by default)
  const handleNewQuotation = () => {
    const nextCode = getNextSequenceCode(quotations);
    const today = new Date().toISOString().split('T')[0];
    const lastClient = getStoredLastClient(quotations);

    const newQuote: Quotation = {
      id: 'quote-' + Date.now(),
      code: nextCode,
      date: today,
      validityDays: 30,
      expiryDate: calculateExpiryDate(today, 30),
      client: { ...lastClient },
      items: [],
      internetService: { ...DEFAULT_INTERNET_SERVICE },
      specialRequirements: { ...DEFAULT_SPECIAL_REQUIREMENTS },
      generalNotes: '',
      paymentTerms: DEFAULT_PAYMENT_TERMS,
      taxRate: 15,
      discountPercentage: 0,
      status: 'borrador',
      issuerSignature: {
        name: company.representativeName || 'Richart Oswaldo Bermeo Bonilla',
        titleOrRole: 'Representante Legal',
        idNumber: '1103986962',
        signedAt: today,
        approved: true,
      },
      clientSignature: {
        name: '',
        titleOrRole: '',
        idNumber: '',
        signedAt: '',
        approved: false,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setActiveQuotation(newQuote);
    // Note: Empty quotation is NOT added to quotations history until saved with signed document
    showToast(`Nueva cotización ${nextCode} iniciada.`);
  };

  // Reset system and delete all quotations history
  const handleResetSystem = () => {
    try {
      localStorage.removeItem(STORAGE_QUOTATIONS_KEY);
      localStorage.removeItem(STORAGE_LAST_CLIENT_KEY);
      clearArchivedRecords();
      localStorage.setItem(STORAGE_SYSTEM_RESET_FLAG, 'true');
    } catch (_) {}

    setQuotations([]);
    const cleanQuote = createCleanQuotation('COT-RBC-2026-001');
    setActiveQuotation(cleanQuote);
    showToast('¡Sistema reiniciado! Historial vaciado completamente.');
  };

  // Close quotation emission with signed backup in database
  const handleSaveSignedBackup = (signedDoc: SignedDocumentInfo) => {
    if (!activeQuotation.items || activeQuotation.items.length === 0) {
      showToast('No se pueden guardar cotizaciones vacías. Agregue productos o servicios primero.');
      return;
    }

    const updatedQuote: Quotation = {
      ...activeQuotation,
      status: 'firmada',
      signedDocument: signedDoc,
      updatedAt: new Date().toISOString(),
    };

    setActiveQuotation(updatedQuote);
    setQuotations(prev => {
      const filtered = prev.filter(q => q.id !== updatedQuote.id && q.items && q.items.length > 0);
      return [updatedQuote, ...filtered];
    });

    showToast(`¡Emisión cerrada! Cotización ${activeQuotation.code} guardada y archivada con firma electrónica en base de datos.`);
  };

  // Save current active quote - Only available when signed quotation is loaded
  const handleSaveActiveQuotation = () => {
    if (!activeQuotation.items || activeQuotation.items.length === 0) {
      showToast('No se pueden guardar cotizaciones vacías. Agregue productos o servicios primero.');
      return;
    }

    if (!activeQuotation.signedDocument?.fileName) {
      showToast('El guardado se habilita una vez que cargue la cotización firmada.');
      return;
    }

    const updatedQuote = {
      ...activeQuotation,
      updatedAt: new Date().toISOString(),
    };

    setQuotations(prev => {
      const filtered = prev.filter(q => q.id !== updatedQuote.id && q.items && q.items.length > 0);
      return [updatedQuote, ...filtered];
    });

    setActiveQuotation(updatedQuote);
    showToast(`Cotización firmada ${updatedQuote.code} guardada correctamente.`);
  };

  // Duplicate quotation
  const handleDuplicateQuotation = (source: Quotation) => {
    const nextCode = getNextSequenceCode(quotations);
    const today = new Date().toISOString().split('T')[0];
    const duplicated: Quotation = {
      ...source,
      id: 'quote-' + Date.now(),
      code: nextCode,
      date: today,
      expiryDate: calculateExpiryDate(today, source.validityDays),
      status: 'borrador',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      clientSignature: {
        name: '',
        titleOrRole: '',
        idNumber: '',
        signatureImage: undefined,
        signedAt: '',
        approved: false,
      },
    };

    setQuotations(prev => [duplicated, ...prev]);
    setActiveQuotation(duplicated);
    setIsHistoryOpen(false);
    showToast(`Cotización duplicada con el código ${nextCode}.`);
  };

  // Delete quote
  const handleDeleteQuotation = (id: string) => {
    const remaining = quotations.filter(q => q.id !== id);
    setQuotations(remaining);
    if (activeQuotation.id === id) {
      if (remaining.length > 0) {
        setActiveQuotation(remaining[0]);
      } else {
        handleNewQuotation();
      }
    }
    showToast('Cotización eliminada.');
  };

  // Open the detailed export options modal
  const handleOpenExportModal = () => {
    if (activeQuotation.items.length === 0) {
      showToast('Atención: agregue al menos un producto o servicio antes de exportar o imprimir.');
    }
    setIsExportModalOpen(true);
  };

  // Direct High-Resolution PDF Download with Auto-Archive in Google Drive
  const handleDirectDownloadPdf = async () => {
    if (activeQuotation.items.length === 0) {
      showToast('No es posible descargar el PDF: debe registrar al menos un producto o servicio.');
      return;
    }

    if (isDownloadingPdf) return;
    setIsDownloadingPdf(true);

    const safeCode = activeQuotation.code.replace(/[/\\?%*:|"<>]/g, '-');
    const safeClient = (activeQuotation.client.companyName || activeQuotation.client.contactName || 'RB_Comunicaciones')
      .replace(/[/\\?%*:|"<>]/g, '_')
      .replace(/\s+/g, '_');
    const filename = `${safeCode}_${safeClient}.pdf`;

    try {
      showToast('Generando documento PDF en alta resolución...');
      const ok = await downloadQuotationPdf('quotation-print-document', activeQuotation.code, {
        fileName: filename,
        onBlobGenerated: async (blob, finalFilename) => {
          try {
            await archiveQuotationToDrive(
              blob,
              finalFilename,
              'application/pdf',
              activeQuotation.code,
              'generada'
            );
          } catch (driveErr) {
            console.warn('Archive error:', driveErr);
          }
        },
        onSuccess: () => {
          showToast(`¡PDF de ${activeQuotation.code} descargado exitosamente!`);
        },
        onError: (err) => {
          console.error('Error al generar el PDF:', err);
          showToast('Inconveniente al generar PDF. Abriendo panel de opciones...');
          setIsExportModalOpen(true);
        }
      });
      if (!ok) {
        setIsExportModalOpen(true);
      }
    } catch (e) {
      console.error(e);
      setIsExportModalOpen(true);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Save issuer signature
  const handleSaveIssuerSignature = (sig: DigitalSignature) => {
    const updated = {
      ...activeQuotation,
      issuerSignature: sig,
    };
    setActiveQuotation(updated);
    setQuotations(prev => prev.map(q => q.id === updated.id ? updated : q));
    showToast('Firma del representante registrada.');
  };

  // Save client signature
  const handleSaveClientSignature = (sig: DigitalSignature) => {
    const updated = {
      ...activeQuotation,
      clientSignature: sig,
      status: 'aprobada' as const,
    };
    setActiveQuotation(updated);
    setQuotations(prev => prev.map(q => q.id === updated.id ? updated : q));
    showToast('Firma de aceptación del cliente registrada.');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-red-500 selection:text-white">
      {/* Top Application Navigation Header */}
      <header
        id="app-top-header"
        className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md print:hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          {/* Logo & Title - Preserving original logo colors and shapes without alteration */}
          <div className="flex items-center space-x-3">
            <div className="bg-white px-2.5 py-1 rounded-xl shadow-xs border border-slate-700/60 flex items-center">
              <CompanyLogo logoUrl={company.logoUrl} size="md" showSubtitle={false} />
            </div>
            <div className="hidden sm:block border-l border-slate-700 pl-3">
              <h1 className="text-xs font-bold uppercase tracking-widest text-red-500">
                Sistema de Cotizaciones
              </h1>
              <p className="text-[11px] text-slate-400">
                Propuestas Normales & Corporativas
              </p>
            </div>
          </div>

          {/* Quick Actions & Toolbar */}
          <div className="flex items-center space-x-2">
            {/* New Quote Button */}
            <button
              id="new-quote-top-btn"
              type="button"
              onClick={handleNewQuotation}
              className="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Nueva
            </button>

            {/* History Modal Button */}
            <button
              id="history-top-btn"
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="inline-flex items-center px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
              title="Historial de cotizaciones"
            >
              <History className="w-3.5 h-3.5 mr-1" />
              <span className="hidden md:inline">Historial</span>
              <span className="ml-1 px-1.5 py-0.2 bg-slate-900 rounded-full text-[10px] text-red-400 font-mono">
                {quotations.length}
              </span>
            </button>

            {/* Reset System Button */}
            <button
              id="reset-system-top-btn"
              type="button"
              onClick={() => {
                if (window.confirm('¿Está seguro de que desea REINICIAR EL SISTEMA y ELIMINAR EL HISTORIAL de cotizaciones generadas?\n\nEsta acción restablecerá el sistema a una cotización inicial en blanco (COT-RBC-2026-001) y vaciará todo el historial.')) {
                  handleResetSystem();
                }
              }}
              className="inline-flex items-center px-2.5 py-1.5 bg-slate-800 hover:bg-red-950/80 text-slate-300 hover:text-red-300 text-xs font-semibold rounded-lg border border-slate-700 hover:border-red-700 transition-colors cursor-pointer"
              title="Reiniciar el sistema y eliminar el historial de cotizaciones"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1 text-slate-400" />
              <span className="hidden lg:inline">Reiniciar</span>
            </button>

            {/* 1. Direct PDF Download Button */}
            <button
              id="download-pdf-top-btn"
              type="button"
              disabled={isDownloadingPdf || activeQuotation.items.length === 0}
              onClick={handleDirectDownloadPdf}
              className={`inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm transition-colors ${
                activeQuotation.items.length === 0
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                  : 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
              }`}
              title={
                activeQuotation.items.length === 0
                  ? 'Debe registrar al menos un producto o servicio para descargar el PDF'
                  : 'Descargar archivo PDF y archivar en Google Drive'
              }
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  <span>Generando...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5 mr-1.5" />
                  <span>Descargar PDF</span>
                </>
              )}
            </button>

            {/* 2. Subir Cotización Firmada */}
            <button
              id="upload-signed-top-btn"
              type="button"
              disabled={activeQuotation.items.length === 0}
              onClick={() => {
                if (activeQuotation.items.length === 0) {
                  showToast('Debe agregar al menos un producto o servicio antes de cargar la cotización firmada.');
                  return;
                }
                setIsUploadSignedModalOpen(true);
              }}
              className={`inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm transition-colors border ${
                activeQuotation.items.length === 0
                  ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-60'
                  : activeQuotation.signedDocument?.fileName
                  ? 'bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-600 cursor-pointer'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-700 cursor-pointer'
              }`}
              title={
                activeQuotation.items.length === 0
                  ? 'Debe registrar al menos un producto o servicio antes de cargar la cotización firmada'
                  : 'Subir cotización firmada y validar'
              }
            >
              <UploadCloud className={`w-3.5 h-3.5 mr-1.5 ${activeQuotation.signedDocument?.fileName ? 'text-emerald-300' : 'text-amber-400'}`} />
              <span className="hidden md:inline">{activeQuotation.signedDocument?.fileName ? 'Firmada Cargada' : 'Subir Cotización Firmada'}</span>
              <span className="md:hidden">Firmada</span>
            </button>

            {/* 3. Botón Guardar Cotización Firmada - DISPONIBLE UNA VEZ CARGADA LA COTIZACIÓN FIRMADA */}
            {activeQuotation.signedDocument?.fileName && (
              <button
                id="save-signed-quote-top-btn"
                type="button"
                onClick={handleSaveActiveQuotation}
                className="inline-flex items-center px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer border border-emerald-500"
                title="Guardar cotización firmada en el historial y base de datos"
              >
                <Save className="w-3.5 h-3.5 mr-1" />
                <span>Guardar Cotización Firmada</span>
              </button>
            )}

            {/* 3. Print / Export Options Modal */}
            <button
              id="print-pdf-top-btn"
              type="button"
              disabled={activeQuotation.items.length === 0}
              onClick={handleOpenExportModal}
              className={`inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm transition-colors ${
                activeQuotation.items.length === 0
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                  : 'bg-white text-slate-900 hover:bg-slate-100 cursor-pointer'
              }`}
              title={
                activeQuotation.items.length === 0
                  ? 'Debe registrar al menos un producto o servicio para imprimir o exportar'
                  : 'Imprimir cotización'
              }
            >
              <Printer className="w-3.5 h-3.5 mr-1 text-slate-700" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            {/* Settings Button */}
            <button
              id="settings-top-btn"
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Datos de la empresa emisora"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Secondary Subbar: Active Document Code & View Switcher */}
        <div id="app-action-toolbar" className="bg-slate-950/60 border-t border-slate-800/80 px-4 sm:px-6 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Editando:</span>
              <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                {activeQuotation.code}
              </span>
              <span className="hidden sm:inline text-slate-400">•</span>
              <span className="hidden sm:inline text-slate-300 font-medium truncate max-w-xs">
                {activeQuotation.client.companyName || activeQuotation.client.contactName || 'Sin cliente asignado'}
              </span>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('form')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                  viewMode === 'form' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Solo formulario de edición"
              >
                <Edit3 className="w-3 h-3" />
                <span className="hidden sm:inline">Editar</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`hidden lg:flex px-2.5 py-1 rounded text-[11px] font-semibold items-center gap-1 transition-colors ${
                  viewMode === 'split' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Vista dividida: formulario y documento"
              >
                <Columns className="w-3 h-3" />
                <span>Dividida</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                  viewMode === 'preview' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Solo vista previa del documento"
              >
                <Eye className="w-3 h-3" />
                <span className="hidden sm:inline">Vista Previa</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 print:p-0 print:max-w-none">
        {/* Layout according to viewMode */}
        {viewMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Interactive Form */}
            <div className="lg:col-span-6 xl:col-span-5 print:hidden">
              <QuotationForm
                quotation={activeQuotation}
                onChange={setActiveQuotation}
                onOpenSignIssuer={() => setIsSignIssuerOpen(true)}
                onOpenSignClient={() => setIsSignClientOpen(true)}
                onOpenUploadSigned={() => setIsUploadSignedModalOpen(true)}
                onOpenDriveModal={() => setIsDriveModalOpen(true)}
                onDownloadPdf={handleDirectDownloadPdf}
                isDownloadingPdf={isDownloadingPdf}
              />
            </div>

            {/* Right: Real-time Live Document */}
            <div className="lg:col-span-6 xl:col-span-7">
              <div className="sticky top-24">
                <QuotationDocument
                  quotation={activeQuotation}
                  company={company}
                  onSignIssuer={() => setIsSignIssuerOpen(true)}
                  onDownloadPdf={handleDirectDownloadPdf}
                  onOpenExportModal={handleOpenExportModal}
                  onUploadSigned={() => setIsUploadSignedModalOpen(true)}
                  onOpenDriveModal={() => setIsDriveModalOpen(true)}
                  isDownloadingPdf={isDownloadingPdf}
                />
              </div>
            </div>
          </div>
        )}

        {viewMode === 'form' && (
          <div className="max-w-3xl mx-auto">
            <QuotationForm
              quotation={activeQuotation}
              onChange={setActiveQuotation}
              onOpenSignIssuer={() => setIsSignIssuerOpen(true)}
              onOpenSignClient={() => setIsSignClientOpen(true)}
              onOpenUploadSigned={() => setIsUploadSignedModalOpen(true)}
              onOpenDriveModal={() => setIsDriveModalOpen(true)}
              onDownloadPdf={handleDirectDownloadPdf}
              isDownloadingPdf={isDownloadingPdf}
            />
            {/* Always keep quotation-print-document in DOM for PDF export and print */}
            <div 
              className="fixed -left-[99999px] top-0 w-[794px] opacity-0 pointer-events-none print:static print:left-auto print:opacity-100 print:pointer-events-auto"
              aria-hidden="true"
            >
              <QuotationDocument
                quotation={activeQuotation}
                company={company}
              />
            </div>
          </div>
        )}

        {viewMode === 'preview' && (
          <div className="max-w-4xl mx-auto">
            <QuotationDocument
              quotation={activeQuotation}
              company={company}
              onSignIssuer={() => setIsSignIssuerOpen(true)}
              onDownloadPdf={handleDirectDownloadPdf}
              onOpenExportModal={handleOpenExportModal}
              onUploadSigned={() => setIsUploadSignedModalOpen(true)}
              onOpenDriveModal={() => setIsDriveModalOpen(true)}
              isDownloadingPdf={isDownloadingPdf}
            />
          </div>
        )}
      </main>

      {/* Footer (Screen only) */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 print:hidden mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>
            RUC: {company.ruc} • {company.phone} • {company.email}
          </span>
          <span className="text-slate-400">
            Formato correlativo estandarizado: {activeQuotation.code}
          </span>
        </div>
      </footer>

      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl border border-slate-800 text-xs font-semibold flex items-center gap-2 animate-bounce print:hidden">
          <Check className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Signature Modals */}
      <SignaturePadModal
        isOpen={isSignIssuerOpen}
        onClose={() => setIsSignIssuerOpen(false)}
        onSave={handleSaveIssuerSignature}
        title="Firma Autorizada - RB Comunicaciones"
        defaultData={activeQuotation.issuerSignature}
        isClient={false}
      />

      <SignaturePadModal
        isOpen={isSignClientOpen}
        onClose={() => setIsSignClientOpen(false)}
        onSave={handleSaveClientSignature}
        title="Firma de Aceptación y Aprobación - Cliente"
        defaultData={{
          name: activeQuotation.clientSignature?.name || activeQuotation.client.contactName,
          idNumber: activeQuotation.clientSignature?.idNumber || activeQuotation.client.docId,
          titleOrRole: activeQuotation.clientSignature?.titleOrRole || activeQuotation.client.companyName,
          signedAt: activeQuotation.clientSignature?.signedAt || '',
          approved: activeQuotation.clientSignature?.approved || false,
          signatureImage: activeQuotation.clientSignature?.signatureImage,
        }}
        isClient={true}
      />

      {/* History Modal */}
      <QuotationHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        quotations={quotations}
        currentId={activeQuotation.id}
        onSelectQuotation={(selected) => setActiveQuotation(selected)}
        onDuplicateQuotation={handleDuplicateQuotation}
        onDeleteQuotation={handleDeleteQuotation}
        onImportQuotations={(imported) => {
          setQuotations(imported);
          if (imported.length > 0) setActiveQuotation(imported[0]);
        }}
        onOpenDriveModal={() => {
          setIsHistoryOpen(false);
          setIsDriveModalOpen(true);
        }}
        onResetHistoryAndSystem={handleResetSystem}
      />

      {/* Company Settings Modal */}
      <CompanySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        company={company}
        onSave={(updated) => {
          setCompany(updated);
          showToast('Datos de la empresa actualizados.');
        }}
      />

      {/* Export & Print Options Modal */}
      <ExportPdfModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        quotation={activeQuotation}
        company={company}
        onNotify={showToast}
      />

      {/* Upload Signed Quotation Modal with Google Drive Archiving */}
      <UploadSignedQuotationModal
        isOpen={isUploadSignedModalOpen}
        onClose={() => setIsUploadSignedModalOpen(false)}
        quotation={activeQuotation}
        onSaveSignedDocument={handleSaveSignedBackup}
        onNotify={showToast}
        onOpenDriveView={() => {
          setIsUploadSignedModalOpen(false);
          setIsDriveModalOpen(true);
        }}
      />

      {/* Google Drive Archive Management Modal */}
      <GoogleDriveArchiveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        onShowToast={showToast}
      />
    </div>
  );
}
