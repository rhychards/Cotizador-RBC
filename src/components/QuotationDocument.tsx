import React from 'react';
import { 
  Quotation, 
  CompanyInfo 
} from '../types';
import { formatCurrency } from '../data/constants';
import { CompanyLogo } from './CompanyLogo';
import { BrandWatermark } from './brand/BrandWatermark';
import { 
  Wifi, 
  ShieldCheck, 
  CheckCircle2, 
  FileDown, 
  Printer, 
  Loader2,
  UploadCloud,
  Car
} from 'lucide-react';

interface QuotationDocumentProps {
  quotation: Quotation;
  company: CompanyInfo;
  onSignIssuer?: () => void;
  onSignClient?: () => void;
  onDownloadPdf?: () => void;
  onOpenExportModal?: () => void;
  onUploadSigned?: () => void;
  onOpenDriveModal?: () => void;
  isDownloadingPdf?: boolean;
}

export const QuotationDocument: React.FC<QuotationDocumentProps> = ({
  quotation,
  company,
  onSignIssuer,
  onSignClient,
  onDownloadPdf,
  onOpenExportModal,
  onUploadSigned,
  isDownloadingPdf = false,
}) => {
  // Financial calculations
  const itemsSubtotal = quotation.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  
  // Special requirements cost
  const specialReqCost = Object.values(quotation.specialRequirements).reduce((sum, req) => {
    return req.enabled && req.mode === 'cotizado' ? sum + (Number(req.cost) || 0) : sum;
  }, 0);

  // Internet cost if "cotizar"
  const internetCost = quotation.internetService.type === 'cotizar' ? (Number(quotation.internetService.cost) || 0) : 0;

  const rawSubtotal = itemsSubtotal + specialReqCost + internetCost;
  const discountAmount = (rawSubtotal * (quotation.discountPercentage || 0)) / 100;
  const netSubtotal = Math.max(0, rawSubtotal - discountAmount);
  const taxAmount = (netSubtotal * (quotation.taxRate || 15)) / 100;
  const grandTotal = netSubtotal + taxAmount;

  const enabledSpecialReqs = Object.entries(quotation.specialRequirements).filter(([_, req]) => req.enabled);

  const hasNoItems = quotation.items.length === 0;

  return (
    <div className="space-y-3">
      {/* Document Action Strip (Screen only) */}
      <div 
        id="quotation-document-action-bar"
        className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden"
      >
        <div className="flex items-center space-x-2">
          <span className={`w-2.5 h-2.5 rounded-full ${quotation.signedDocument?.fileName ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
          <span className="text-xs font-bold text-slate-800">
            Vista Previa: Formato Media Hoja A4
          </span>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            ({quotation.code})
          </span>
          {quotation.signedDocument?.fileName && (
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Firmada & Archivada
            </span>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Descargar PDF Button - Disabled if no items */}
          {onDownloadPdf && (
            <button
              id="doc-quick-download-pdf-btn"
              type="button"
              disabled={isDownloadingPdf || hasNoItems}
              onClick={onDownloadPdf}
              className={`inline-flex items-center px-3.5 py-1.5 text-white text-xs font-bold rounded-lg shadow-xs transition-colors ${
                hasNoItems
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
                  : 'bg-red-600 hover:bg-red-700 cursor-pointer'
              }`}
              title={
                hasNoItems
                  ? 'Debe registrar al menos un producto o servicio para descargar el PDF'
                  : 'Descargar documento en archivo PDF'
              }
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  <span>Generando PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5 mr-1.5" />
                  <span>Descargar PDF</span>
                </>
              )}
            </button>
          )}

          {/* Subir Cotización Firmada Button */}
          {onUploadSigned && (
            <button
              id="doc-quick-upload-signed-btn"
              type="button"
              onClick={onUploadSigned}
              className="inline-flex items-center px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg border border-slate-700 shadow-xs transition-colors cursor-pointer"
              title="Subir cotización firmada y guardarla en el sistema"
            >
              <UploadCloud className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              <span>Subir Cotización Firmada</span>
            </button>
          )}

          {/* Imprimir / Exportar Button */}
          {onOpenExportModal && (
            <button
              id="doc-open-print-modal-btn"
              type="button"
              disabled={isDownloadingPdf || hasNoItems}
              onClick={onOpenExportModal}
              className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                hasNoItems
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 cursor-pointer'
              }`}
              title={
                hasNoItems
                  ? 'Debe registrar al menos un producto o servicio para imprimir o exportar'
                  : 'Opciones de impresión y PDF'
              }
            >
              <Printer className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
              <span>Imprimir / Exportar</span>
            </button>
          )}
        </div>
      </div>

      {/* Signed Document Persistence Alert Banner */}
      {quotation.signedDocument && (
        <div 
          id="quotation-signed-backup-banner"
          className="bg-emerald-50 border border-emerald-300 rounded-xl p-2.5 shadow-xs flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-950 print:hidden"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-emerald-900 text-xs">
                  Emisión Oficial Cerrada con Respaldo Electrónico
                </span>
                <span className="text-[9px] bg-emerald-200 text-emerald-800 px-1.5 py-0.2 rounded font-mono font-bold">
                  BD ACTIVA
                </span>
              </div>
              <p className="text-[10px] text-emerald-800">
                Archivo: <strong>{quotation.signedDocument.fileName}</strong> • Por: <strong>{quotation.signedDocument.signedBy || 'Representante Autorizado'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {quotation.signedDocument.fileDataUrl && (
              <a
                href={quotation.signedDocument.fileDataUrl}
                download={quotation.signedDocument.fileName}
                className="inline-flex items-center px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-md text-[11px] shadow-xs transition-colors cursor-pointer"
                title="Descargar respaldo del documento firmado"
              >
                <FileDown className="w-3 h-3 mr-1" />
                Descargar PDF Firmado
              </a>
            )}
          </div>
        </div>
      )}

      {/* Media Hoja A4 Container - Exact preview design preserved for printing */}
      <div 
        id="quotation-print-document" 
        className="bg-white text-slate-800 shadow-xl border border-slate-200 print:border print:border-slate-300 print:shadow-none max-w-4xl mx-auto rounded-xl print:rounded-xl overflow-visible text-xs leading-normal relative min-h-[140mm] flex flex-col justify-between"
      >
        {/* Subtle Corporate Watermark */}
        <BrandWatermark opacity={0.035} scale={0.85} />

        {/* Compact Document Content */}
        <div className="p-4 sm:p-5 space-y-2.5 relative z-10 flex-1 flex flex-col justify-between">
          <div className="space-y-2.5">
            {/* Header: Un solo espacio para Identidad (Superior: Logos / Inferior: Datos Empresa, Sin Nombres de Persona) */}
            <div data-page-break-avoid className="flex justify-between items-start gap-4 pb-2.5 border-b border-slate-200 break-inside-avoid print:break-inside-avoid">
            {/* Left Block: Ubicado en un solo espacio: Superior Logos, Inferior Datos de la Empresa */}
            <div className="flex flex-col space-y-1.5 min-w-0">
              {/* Parte Superior: Logos */}
              <div className="flex items-center select-none">
                <CompanyLogo logoUrl={company.logoUrl} size="md" />
              </div>

              {/* Palabras clave identificadoras de la empresa */}
              <div className="text-[9px] font-bold uppercase tracking-wider flex flex-wrap items-center gap-1.5 pt-0.5 select-none">
                <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded border border-red-200/70 font-extrabold text-[8.5px]">
                  STREAMING
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-700 font-semibold text-[8.5px]">AUDIOVISUAL</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-700 font-semibold text-[8.5px]">SEGURIDAD ELECTRÓNICA</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-700 font-semibold text-[8.5px]">TELECOMUNICACIONES</span>
              </div>

              {/* Parte Inferior: Datos de la Empresa (Sin nombres del profesional) */}
              <div className="text-[10px] text-slate-600 leading-tight space-y-0.5 pt-0.5">
                <p className="font-mono text-slate-800">
                  <span className="font-bold text-slate-900 font-sans">RUC:</span> {company.ruc || '0201771672001'}
                </p>
                <p className="text-slate-600">
                  {company.address} - {company.city} • Tel: {company.phone}
                </p>
                <p className="text-slate-500 font-mono">
                  {company.email}
                </p>
              </div>
            </div>

            {/* Right: Quotation Code & Dates */}
            <div className="text-right shrink-0">
              <div className="inline-flex items-center gap-1.5 bg-slate-900 text-white px-2.5 py-1 rounded-md shadow-xs border border-slate-800">
                <span className="text-[9px] uppercase font-bold text-red-400 tracking-wider">
                  Cotización Nº:
                </span>
                <span className="text-xs sm:text-sm font-mono font-bold tracking-tight text-white">
                  {quotation.code}
                </span>
              </div>
              <div className="text-[10px] text-slate-600 space-y-0.5 mt-1.5">
                <div>
                  <span className="text-slate-500">Emisión:</span> <span className="font-semibold text-slate-800">{quotation.date}</span>
                  <span className="mx-1 text-slate-300">•</span>
                  <span className="text-slate-500">Validez:</span> <span className="font-bold text-red-700">{quotation.validityDays} días</span>
                </div>
                <div className="text-[9px] text-slate-400">
                  Vence: <span className="font-medium text-slate-600">{quotation.expiryDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Client Information Complete Strip */}
          <div data-page-break-avoid className="bg-slate-50/90 border border-slate-200 rounded-md px-3 py-2 space-y-1.5 text-[10px] break-inside-avoid print:break-inside-avoid">
            {/* Row 1: Razón Social, RUC / C.I., Atención / Contacto */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-start">
              <div className="sm:col-span-5">
                <span className="text-[8.5px] text-slate-400 uppercase font-bold block">Cliente / Razón Social</span>
                <p className="font-bold text-slate-900 text-[11px] leading-snug break-words">
                  {quotation.client.companyName || 'Consumidor Final'}
                </p>
              </div>
              <div className="sm:col-span-3">
                <span className="text-[8.5px] text-slate-400 uppercase font-bold block">RUC / C.I.</span>
                <p className="font-mono font-medium text-slate-800 text-[10.5px]">
                  {quotation.client.docId || '9999999999999'}
                </p>
              </div>
              <div className="sm:col-span-4">
                <span className="text-[8.5px] text-slate-400 uppercase font-bold block">Atención / Contacto</span>
                <p className="font-semibold text-slate-800 leading-snug break-words">
                  {quotation.client.contactName || 'A quien corresponda'}
                </p>
              </div>
            </div>

            {/* Row 2: Dirección, Teléfono, Correo Electrónico (en una sola línea) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1.5 border-t border-slate-200/80 items-baseline text-[9.5px]">
              <div className="sm:col-span-5">
                <span className="text-[8.5px] text-slate-400 uppercase font-bold block">Dirección</span>
                <p className="text-slate-700 leading-tight break-words">
                  {quotation.client.address?.trim() ? quotation.client.address : 'No indicada'}
                </p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[8.5px] text-slate-400 uppercase font-bold block">Teléfono</span>
                <p className="font-medium text-slate-800 whitespace-nowrap">
                  {quotation.client.phone || 'S/N'}
                </p>
              </div>
              <div className="sm:col-span-5">
                <span className="text-[8.5px] text-slate-400 uppercase font-bold block">Correo Electrónico</span>
                <p className="text-slate-800 font-medium whitespace-nowrap truncate" title={quotation.client.email || ''}>
                  {quotation.client.email || 'No registrado'}
                </p>
              </div>
            </div>
          </div>

          {/* Services Table - Full descriptions without clipping */}
          <div id="services-table-container" className="border border-slate-200 rounded-md overflow-hidden bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-[9px] uppercase tracking-wider font-bold">
                  <th className="py-1 px-2 text-center w-7">#</th>
                  <th className="py-1 px-2.5">Descripción del Servicio / Equipamiento</th>
                  <th className="py-1 px-2 text-center w-12">Cant.</th>
                  <th className="py-1 px-2 text-center w-16">Unidad</th>
                  <th className="py-1 px-2.5 text-right w-20">P. Unit.</th>
                  <th className="py-1 px-2.5 text-right w-20">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {quotation.items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-3 text-center text-slate-400 italic text-[11px]">
                      No se han agregado ítems a la cotización aún.
                    </td>
                  </tr>
                ) : (
                  quotation.items.map((item, index) => {
                    const lineTotal = (item.quantity || 0) * (item.unitPrice || 0);
                    return (
                      <tr key={item.id} data-page-break-avoid className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} break-inside-avoid print:break-inside-avoid`}>
                        <td className="py-1.5 px-2 text-center font-mono text-slate-400 text-[10px] align-top">
                          {index + 1}
                        </td>
                        <td className="py-1.5 px-2.5 align-top">
                          <div className="font-bold text-slate-900 text-[11px] leading-snug">
                            {item.serviceName}
                          </div>
                          {/* Toda la descripción completa de los servicios sin recortes */}
                          {item.description && (
                            <p className="text-slate-600 text-[9.5px] leading-snug mt-1 whitespace-pre-line">
                              {item.description}
                            </p>
                          )}
                        </td>
                        <td className="py-1.5 px-2 text-center font-semibold text-slate-800 text-[11px] align-top">
                          {item.quantity}
                        </td>
                        <td className="py-1.5 px-2 text-center text-slate-500 text-[10px] align-top">
                          {item.unit || 'Servicio'}
                        </td>
                        <td className="py-1.5 px-2.5 text-right font-mono text-slate-700 text-[11px] align-top">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="py-1.5 px-2.5 text-right font-mono font-bold text-slate-900 text-[11px] align-top">
                          {formatCurrency(lineTotal)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Conditions, Bank & Totals Block */}
          <div id="quotation-totals-block" data-page-break-avoid className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] break-inside-avoid print:break-inside-avoid">
            {/* Left: Conectividad, Condiciones y Cuenta Bancaria Reorganizada para visibilidad total */}
            <div className="space-y-1.5">
              {/* Internet & Logística Strip */}
              <div className="bg-slate-50 border border-slate-200 rounded p-1.5 space-y-0.5">
                <div className="flex items-center justify-between text-[9px]">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Wifi className="w-3 h-3 text-red-600" />
                    Internet:
                  </span>
                  <span className="font-semibold text-slate-700">
                    {quotation.internetService.type === 'cliente' && 'Suministrado por el Cliente'}
                    {quotation.internetService.type === 'cotizar' && `A cotizar (+${formatCurrency(quotation.internetService.cost)})`}
                    {quotation.internetService.type === 'no_requerido' && 'No Requerido'}
                  </span>
                </div>
                {enabledSpecialReqs.length > 0 && (
                  <div className="text-[9px] text-slate-700 border-t border-slate-200/60 pt-1 space-y-1">
                    <div className="font-bold text-slate-900 flex items-center justify-between text-[9px]">
                      <span className="flex items-center gap-1">
                        <Car className="w-3 h-3 text-red-600 shrink-0" />
                        <span>Logística & Requerimientos:</span>
                      </span>
                    </div>
                    <div className="space-y-0.5 text-[8.5px] leading-snug">
                      {enabledSpecialReqs.map(([k, r]) => {
                        const labelMap: Record<string, string> = {
                          transporte: 'Transporte',
                          viaticos: 'Viáticos',
                          alimentacion: 'Alimentación',
                          hospedaje: 'Hospedaje',
                          otros: 'Otros',
                        };
                        const name = labelMap[k] || (k.charAt(0).toUpperCase() + k.slice(1));
                        const modeText = r.mode === 'incluido'
                          ? 'Incluido'
                          : r.mode === 'cliente'
                          ? 'Por cuenta del Cliente'
                          : `Cotizado (+${formatCurrency(r.cost)})`;

                        return (
                          <div key={k} className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-slate-700">
                            <span className="font-bold text-slate-800">• {name}:</span>
                            <span className="font-semibold text-red-700">[{modeText}]</span>
                            {r.details && (
                              <span className="text-slate-600 italic">({r.details})</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Condiciones Comerciales & Banco con Cédula 100% visible sin cortes */}
              {(() => {
                const bank = quotation.bankAccount || company.bankAccount || {
                  bankName: 'Banco Pichincha',
                  beneficiaryName: 'Richart Bermeo Bonilla',
                  accountType: 'Cuenta de ahorros',
                  accountNumber: '3722419201',
                  email: 'rb.comunicaciones.ec@gmail.com',
                  idNumber: '0201771671',
                };

                return (
                  <div className="bg-slate-50 border border-slate-200 rounded p-1.5 text-[9px] space-y-1 leading-snug">
                    <div className="flex items-center justify-between border-b border-slate-200/70 pb-0.5">
                      <span className="font-bold text-slate-900 uppercase tracking-wide text-[9px]">
                        Forma de Pago & Banco
                      </span>
                      <span className="font-bold text-red-700">{bank.bankName}</span>
                    </div>
                    <p className="text-slate-600 text-[8.5px] leading-tight">
                      50% anticipo al confirmar • 50% al término del servicio. Precios en USD.
                    </p>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 pt-0.5 border-t border-slate-200/60 text-[9px]">
                      <div className="text-slate-700">
                        <span className="font-normal text-slate-600">{bank.accountType || 'Ahorros'}: </span>
                        <span className="font-mono font-normal text-slate-800">{bank.accountNumber}</span>
                      </div>
                      <div className="text-slate-700">
                        <span className="font-normal text-slate-600">C.I: </span>
                        <span className="font-mono font-normal text-slate-800">{bank.idNumber || '0201771671'}</span>
                      </div>
                      <div className="col-span-2 text-slate-700">
                        <span className="font-normal text-slate-600">Titular: </span>
                        <span className="font-normal text-slate-800">{bank.beneficiaryName}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Right: Resumen Económico */}
            <div className="bg-slate-50 border border-slate-200 rounded p-2 flex flex-col justify-between space-y-1">
              <div className="space-y-0.5 text-[10px]">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Servicios:</span>
                  <span className="font-mono font-medium">{formatCurrency(itemsSubtotal)}</span>
                </div>
                {specialReqCost > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Requerimientos Especiales:</span>
                    <span className="font-mono">{formatCurrency(specialReqCost)}</span>
                  </div>
                )}
                {internetCost > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Enlace Internet:</span>
                    <span className="font-mono">{formatCurrency(internetCost)}</span>
                  </div>
                )}
                {quotation.discountPercentage > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Descuento ({quotation.discountPercentage}%):</span>
                    <span className="font-mono">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-800 font-semibold pt-0.5 border-t border-slate-200">
                  <span>Subtotal Neto:</span>
                  <span className="font-mono">{formatCurrency(netSubtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>I.V.A. ({quotation.taxRate || 15}%):</span>
                  <span className="font-mono">{formatCurrency(taxAmount)}</span>
                </div>
              </div>

              {/* Grand Total Box */}
              <div className="bg-slate-900 text-white px-2.5 py-1.5 rounded flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[9px] text-red-400 font-bold uppercase tracking-wider block">
                    Valor Total a Cancelar
                  </span>
                  <span className="text-[8px] text-slate-400">Incluye impuestos vigentes</span>
                </div>
                <div className="flex items-baseline gap-1 justify-end font-mono">
                  <span className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {formatCurrency(grandTotal)}
                  </span>
                  <span className="text-xs font-bold text-slate-300">
                    USD
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer: Legal Acceptance & Subscription Space */}
          <div data-page-break-avoid className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] items-end break-inside-avoid print:break-inside-avoid">
            {/* Legal Framework & Protección de Datos Personales */}
            <div className="bg-slate-50/70 border border-slate-200 rounded p-2 text-left space-y-1.5">
              <div>
                <span className="text-[9.5px] font-bold text-slate-800 block">
                  Aceptación y Validez Formal
                </span>
                <p className="text-[8.5px] text-slate-600 leading-tight mt-0.5">
                  Esta cotización técnica y económica constituye una oferta formal de servicios y suministros. Para su confirmación, legalice la propuesta mediante suscripción autorizada.
                </p>
              </div>

              {/* Apartado de Protección de Datos Personales */}
              <div className="pt-1 border-t border-slate-200/80">
                <div className="flex items-center gap-1 text-[8.5px] font-bold text-slate-800">
                  <ShieldCheck className="w-3 h-3 text-red-600 shrink-0" />
                  <span>Protección de Datos Personales:</span>
                </div>
                <p className="text-[8px] text-slate-600 leading-tight mt-0.5">
                  En cumplimiento de la Ley Orgánica de Protección de Datos Personales (LOPDP), la información provista en este documento es estrictamente confidencial y será tratada con las debidas medidas de seguridad técnica y organizativa exclusivamente para la gestión comercial y contractual vinculada a esta propuesta.
                </p>
              </div>
            </div>

            {/* Signature Box */}
            <div className="border border-slate-300 rounded-lg p-2.5 text-center bg-white flex flex-col justify-between relative overflow-hidden min-h-[145px] shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                <span className="text-[8.5px] uppercase font-bold text-slate-500 tracking-wider">
                  Suscripción Autorizada
                </span>
                <span className="text-[8px] text-slate-400 font-mono">
                  Validez Legal
                </span>
              </div>

              {/* Generous and comfortable space for signature & seal */}
              <div 
                onClick={onSignIssuer}
                className={`h-16 sm:h-20 w-full flex flex-col items-center justify-center my-1.5 rounded transition-all ${
                  onSignIssuer ? 'cursor-pointer hover:bg-slate-50 group' : ''
                }`}
                title={onSignIssuer ? "Clic para gestionar firma o sello digital" : undefined}
              >
                {quotation.issuerSignature?.signatureImage ? (
                  <img
                    src={quotation.issuerSignature.signatureImage}
                    alt="Firma Autorizada"
                    className="max-h-16 sm:max-h-18 object-contain mx-auto"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-1">
                    {onSignIssuer && (
                      <span className="text-[8px] text-slate-400 font-medium print:hidden group-hover:text-red-600 transition-colors">
                        + Clic para estampar firma / sello
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Signer Legal Info - Without personal name */}
              <div className="border-t border-slate-800 pt-1.5 mt-auto">
                <p className="font-extrabold text-slate-900 text-[10px] tracking-tight uppercase leading-tight">
                  {quotation.issuerSignature?.name && quotation.issuerSignature.name !== 'Richart Oswaldo Bermeo Bonilla' && quotation.issuerSignature.name !== 'Ing. Richart Bermeo Bonilla' && quotation.issuerSignature.name !== 'Richart Bermeo'
                    ? quotation.issuerSignature.name
                    : 'Suscripción Autorizada'}
                </p>
                <p className="text-[9px] text-slate-600 leading-tight">
                  {quotation.issuerSignature?.titleOrRole || 'Representante Legal'} • Quito, Ecuador
                </p>
              </div>
            </div>
          </div>
        </div>

          {/* Pie de Página Oficial (Dentro del documento impreso y vista previa) */}
          <div data-page-break-avoid className="pt-2 border-t border-slate-300 mt-2 flex flex-wrap items-center justify-between text-[8px] text-slate-500 font-mono break-inside-avoid print:break-inside-avoid">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-bold text-slate-700">RUC: {company.ruc}</span>
              <span>•</span>
              <span className="truncate">{company.address} - {company.city}, Ecuador</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span>Tel: {company.phone}</span>
              <span>•</span>
              <span>{company.email}</span>
              <span>•</span>
              <span className="font-bold text-slate-700">Pág. 1/1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Indicator of 50% Sheet Cut Guide */}
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 text-[10px] text-slate-400 font-mono py-1.5 px-1 select-none print:hidden">
        <div className="border-t border-dashed border-slate-300 flex-1" />
        <span className="bg-slate-50 px-3 py-0.5 rounded border border-dashed border-slate-300 text-slate-500 font-semibold tracking-wide uppercase text-[9px]">
          ✂ Límite 50% Hoja A4 / Media Página
        </span>
        <div className="border-t border-dashed border-slate-300 flex-1" />
      </div>
    </div>
  );
};
