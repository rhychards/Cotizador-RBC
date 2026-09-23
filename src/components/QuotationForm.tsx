import React, { useState } from 'react';
import { 
  Quotation, 
  QuotationItem, 
  ClientType, 
  SpecialRequirements,
  InternetServiceType,
  SpecialRequirementMode
} from '../types';
import { PREDEFINED_SERVICES, calculateExpiryDate, formatCurrency } from '../data/constants';
import { 
  Plus, 
  Trash2, 
  Building2, 
  User, 
  Calendar, 
  Wifi, 
  Car, 
  Utensils, 
  Hotel, 
  Coffee, 
  Sparkles, 
  PenTool, 
  Check, 
  Layers,
  FileSpreadsheet,
  ChevronDown,
  RotateCcw,
  FileDown,
  Loader2
} from 'lucide-react';

interface QuotationFormProps {
  quotation: Quotation;
  onChange: (updated: Quotation) => void;
  onOpenSignIssuer?: () => void;
  onOpenSignClient?: () => void;
  onOpenUploadSigned?: () => void;
  onOpenDriveModal?: () => void;
  onDownloadPdf?: () => void;
  isDownloadingPdf?: boolean;
}

export const QuotationForm: React.FC<QuotationFormProps> = ({
  quotation,
  onChange,
  onOpenSignIssuer,
  onOpenSignClient,
  onOpenUploadSigned,
  onOpenDriveModal,
  onDownloadPdf,
  isDownloadingPdf = false,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'servicios' | 'especiales' | 'condiciones'>('general');
  const [selectedPresetService, setSelectedPresetService] = useState('');

  // Update client data
  const handleClientChange = (field: string, value: any) => {
    onChange({
      ...quotation,
      client: {
        ...quotation.client,
        [field]: value,
      },
    });
  };

  // Change validity days
  const handleValidityChange = (days: 10 | 30 | 45 | 60) => {
    const newExpiry = calculateExpiryDate(quotation.date, days);
    onChange({
      ...quotation,
      validityDays: days,
      expiryDate: newExpiry,
    });
  };

  // Change date
  const handleDateChange = (newDate: string) => {
    const newExpiry = calculateExpiryDate(newDate, quotation.validityDays);
    onChange({
      ...quotation,
      date: newDate,
      expiryDate: newExpiry,
    });
  };

  // Add Item from Catalog
  const handleAddPredefinedService = (serviceName: string) => {
    const preset = PREDEFINED_SERVICES.find(s => s.name === serviceName);
    if (!preset) return;

    const newItem: QuotationItem = {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      serviceName: preset.name,
      description: preset.defaultDescription,
      category: preset.category,
      quantity: 1,
      unitPrice: preset.suggestedPrice,
      unit: preset.suggestedUnit,
    };

    onChange({
      ...quotation,
      items: [...quotation.items, newItem],
    });
    setSelectedPresetService('');
  };

  // Add Custom Item
  const handleAddCustomItem = () => {
    const newItem: QuotationItem = {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      serviceName: 'Nuevo Servicio Técnico',
      description: 'Descripción detallada del servicio o equipamiento.',
      quantity: 1,
      unitPrice: 100,
      unit: 'Servicio',
    };

    onChange({
      ...quotation,
      items: [...quotation.items, newItem],
    });
  };

  // Update Item
  const handleUpdateItem = (id: string, field: keyof QuotationItem, value: any) => {
    const updatedItems = quotation.items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });

    onChange({
      ...quotation,
      items: updatedItems,
    });
  };

  // Remove Item
  const handleRemoveItem = (id: string) => {
    onChange({
      ...quotation,
      items: quotation.items.filter(item => item.id !== id),
    });
  };

  // Special Requirement toggle/mode/cost/details
  const handleSpecialReqChange = (
    key: keyof SpecialRequirements,
    field: string,
    value: any
  ) => {
    onChange({
      ...quotation,
      specialRequirements: {
        ...quotation.specialRequirements,
        [key]: {
          ...quotation.specialRequirements[key],
          [field]: value,
        },
      },
    });
  };

  return (
    <div id="quotation-form-card" className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
      {/* Compact & Professional Stage Navigation */}
      <div className="flex border-b border-slate-200 bg-slate-100/90 p-1.5 gap-1.5 overflow-x-auto text-[11px] font-medium">
        <button
          id="tab-btn-general"
          type="button"
          onClick={() => setActiveTab('general')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === 'general'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
            activeTab === 'general' ? 'bg-red-600 text-white' : 'bg-slate-300 text-slate-700'
          }`}>
            1
          </span>
          <span>Cliente & Código</span>
        </button>

        <button
          id="tab-btn-servicios"
          type="button"
          onClick={() => setActiveTab('servicios')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === 'servicios'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
            activeTab === 'servicios' ? 'bg-red-600 text-white' : 'bg-slate-300 text-slate-700'
          }`}>
            2
          </span>
          <span>Equipos & Servicios ({quotation.items.length})</span>
        </button>

        <button
          id="tab-btn-especiales"
          type="button"
          onClick={() => setActiveTab('especiales')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === 'especiales'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
            activeTab === 'especiales' ? 'bg-red-600 text-white' : 'bg-slate-300 text-slate-700'
          }`}>
            3
          </span>
          <span>Requerimientos & Red</span>
        </button>

        <button
          id="tab-btn-condiciones"
          type="button"
          onClick={() => setActiveTab('condiciones')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === 'condiciones'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
            activeTab === 'condiciones' ? 'bg-red-600 text-white' : 'bg-slate-300 text-slate-700'
          }`}>
            4
          </span>
          <span>Finanzas & Banco</span>
        </button>
      </div>

      <div className="p-3.5 sm:p-4.5 space-y-4">
        {/* TAB 1: DATOS GENERALES Y CLIENTE */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            {/* Header: Sequential Code & Dates */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-red-600" />
                Parámetros de la Cotización
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Correlative Code */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Código Correlativo *
                  </label>
                  <input
                    id="quote-code-input"
                    type="text"
                    value={quotation.code}
                    onChange={(e) => onChange({ ...quotation, code: e.target.value })}
                    className="w-full px-3 py-2 font-mono font-bold text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    placeholder="COT-RBC-2026-001"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Secuencia oficial RB Comunicaciones
                  </span>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha de Emisión *
                  </label>
                  <input
                    id="quote-date-input"
                    type="date"
                    value={quotation.date}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estado Actual
                  </label>
                  <select
                    id="quote-status-select"
                    value={quotation.status}
                    onChange={(e) => onChange({ ...quotation, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none capitalize"
                  >
                    <option value="borrador">Borrador (En edición)</option>
                    <option value="enviada">Enviada al Cliente</option>
                    <option value="aprobada">Aprobada / Aceptada</option>
                    <option value="rechazada">Rechazada</option>
                    <option value="facturada">Facturada</option>
                  </select>
                </div>
              </div>

              {/* Validity Days Selector (Requirement: 10 / 30 / 45 / 60 días) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Validez de la Cotización (Seleccionable) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {([10, 30, 45, 60] as const).map((days) => (
                    <button
                      key={days}
                      type="button"
                      id={`validity-btn-${days}`}
                      onClick={() => handleValidityChange(days)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                        quotation.validityDays === days
                          ? 'bg-red-600 text-white border-red-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <span>{days} Días</span>
                      {quotation.validityDays === days && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
                <div className="mt-1.5 text-xs text-slate-500 flex items-center justify-between">
                  <span>Fecha calculada de caducidad:</span>
                  <span className="font-semibold text-slate-800">{quotation.expiryDate}</span>
                </div>
              </div>
            </div>

            {/* Client Information Form */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-red-600" />
                    Datos del Cliente (Normal / Corporativo)
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        const raw = localStorage.getItem('rbc_last_client_v1');
                        if (raw) {
                          const parsed = JSON.parse(raw);
                          if (parsed && (parsed.companyName || parsed.contactName || parsed.docId)) {
                            onChange({
                              ...quotation,
                              client: { ...parsed },
                            });
                          }
                        }
                      } catch (_) {}
                    }}
                    className="text-[10px] text-slate-500 hover:text-red-700 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 px-2 py-0.5 rounded flex items-center gap-1 transition-colors cursor-pointer"
                    title="Cargar los últimos datos del cliente guardados"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Último cliente</span>
                  </button>
                </div>

                {/* Client Type Toggle */}
                <div className="inline-flex p-1 bg-slate-200 rounded-lg text-xs">
                  <button
                    type="button"
                    id="client-type-normal-btn"
                    onClick={() => handleClientChange('type', 'normal')}
                    className={`px-3 py-1 rounded-md font-medium transition-colors ${
                      quotation.client.type === 'normal'
                        ? 'bg-white text-slate-900 font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Cliente Normal (Natural)
                  </button>
                  <button
                    type="button"
                    id="client-type-corp-btn"
                    onClick={() => handleClientChange('type', 'corporativo')}
                    className={`px-3 py-1 rounded-md font-medium transition-colors ${
                      quotation.client.type === 'corporativo'
                        ? 'bg-red-600 text-white font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Cliente Corporativo (Empresa)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nombre de la empresa */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {quotation.client.type === 'corporativo'
                      ? 'Nombre de la Empresa / Razón Social *'
                      : 'Empresa o Institución (Opcional)'}
                  </label>
                  <input
                    id="client-company-input"
                    type="text"
                    value={quotation.client.companyName}
                    onChange={(e) => handleClientChange('companyName', e.target.value)}
                    placeholder="Ej: Corporación Andina S.A. / Eventos Cía. Ltda."
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  />
                </div>

                {/* Nombre del contacto */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre del Contacto *
                  </label>
                  <input
                    id="client-contact-input"
                    type="text"
                    value={quotation.client.contactName}
                    onChange={(e) => handleClientChange('contactName', e.target.value)}
                    placeholder="Ej: Ing. Carlos Pérez / Dra. María Morales"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  />
                </div>

                {/* Cedula / RUC */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cédula / RUC *
                  </label>
                  <input
                    id="client-doc-input"
                    type="text"
                    value={quotation.client.docId}
                    onChange={(e) => handleClientChange('docId', e.target.value)}
                    placeholder="Ej: 1792345678001 o 0201771672"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teléfono de Contacto *
                  </label>
                  <input
                    id="client-phone-input"
                    type="text"
                    value={quotation.client.phone}
                    onChange={(e) => handleClientChange('phone', e.target.value)}
                    placeholder="Ej: 0992422082 / 022345678"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    id="client-email-input"
                    type="email"
                    value={quotation.client.email}
                    onChange={(e) => handleClientChange('email', e.target.value)}
                    placeholder="contacto@empresa.com"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dirección / Ubicación del Evento
                  </label>
                  <input
                    id="client-address-input"
                    type="text"
                    value={quotation.client.address || ''}
                    onChange={(e) => handleClientChange('address', e.target.value)}
                    placeholder="Ej: Av. 12 de Octubre y Cordero, Hotel Swissotel"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SERVICIOS Y EQUIPOS */}
        {activeTab === 'servicios' && (
          <div className="space-y-6">
            {/* Catalog Dropdown Selector */}
            <div className="bg-red-50/70 border border-red-200 rounded-xl p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-red-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-red-600" />
                    Catálogo Oficial de Servicios RB Comunicaciones
                  </h4>
                  <p className="text-xs text-red-700">
                    Seleccione un servicio predefinido para agregarlo automáticamente a la cotización:
                  </p>
                </div>
                <button
                  id="add-custom-service-btn"
                  type="button"
                  onClick={handleAddCustomItem}
                  className="inline-flex items-center px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 shadow-xs transition-colors shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 mr-1 text-red-600" />
                  + Servicio Personalizado
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <select
                    id="predefined-service-select"
                    value={selectedPresetService}
                    onChange={(e) => setSelectedPresetService(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 text-xs sm:text-sm bg-white border border-red-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none appearance-none"
                  >
                    <option value="">-- Seleccionar servicio del catálogo (13 servicios) --</option>
                    {PREDEFINED_SERVICES.map((serv, index) => (
                      <option key={index} value={serv.name}>
                        {serv.name} — (${serv.suggestedPrice} / {serv.suggestedUnit})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                </div>

                <button
                  id="insert-preset-btn"
                  type="button"
                  disabled={!selectedPresetService}
                  onClick={() => handleAddPredefinedService(selectedPresetService)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-lg shadow-xs transition-colors whitespace-nowrap"
                >
                  Agregar a Cotización
                </button>
              </div>
            </div>

            {/* List of current quotation items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Ítems Incluidos en la Propuesta ({quotation.items.length})
                </h4>
                <span className="text-xs text-slate-500">
                  Haga clic en cualquier campo para editar texto o valores.
                </span>
              </div>

              {quotation.items.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-500">
                  <Layers className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="font-semibold text-sm">No hay servicios agregados</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Elija un servicio del menú superior o cree uno personalizado.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {quotation.items.map((item, index) => (
                    <div
                      key={item.id}
                      className="border border-slate-200 rounded-xl p-4 bg-white hover:border-slate-300 transition-colors shadow-xs relative space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <input
                            type="text"
                            value={item.serviceName}
                            onChange={(e) => handleUpdateItem(item.id, 'serviceName', e.target.value)}
                            className="font-bold text-slate-900 text-sm border-b border-transparent hover:border-slate-300 focus:border-red-500 focus:bg-slate-50 px-1.5 py-0.5 rounded outline-none w-full max-w-md"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar ítem"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Description */}
                      <div>
                        <textarea
                          rows={2}
                          value={item.description}
                          onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                          placeholder="Especificaciones del servicio, equipamiento técnico, cámaras, personal..."
                          className="w-full text-xs p-2 border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                        />
                      </div>

                      {/* Numeric fields: Quantity, Unit, Price, Subtotal */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-2.5 rounded-lg text-xs">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                            Cantidad
                          </label>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(item.id, 'quantity', Math.max(1, parseFloat(e.target.value) || 1))}
                            className="w-full px-2 py-1 border border-slate-300 rounded bg-white font-semibold text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                            Unidad / Tipo
                          </label>
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => handleUpdateItem(item.id, 'unit', e.target.value)}
                            placeholder="Evento / Jornada"
                            className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                            Precio Unitario ($)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="5"
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateItem(item.id, 'unitPrice', Math.max(0, parseFloat(e.target.value) || 0))}
                            className="w-full px-2 py-1 border border-slate-300 rounded bg-white font-semibold text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                            Subtotal Ítem
                          </label>
                          <div className="px-2 py-1 font-mono font-bold text-slate-900 bg-slate-200/70 rounded text-right">
                            {formatCurrency((item.quantity || 0) * (item.unitPrice || 0))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: INTERNET Y REQUERIMIENTOS ESPECIALES */}
        {activeTab === 'especiales' && (
          <div className="space-y-6">
            {/* Internet Service Requirement */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Wifi className="w-4 h-4 text-red-600" />
                  Servicio de Internet (Requisito Crítico)
                </h4>
                
                {/* Select between por cliente / a cotizar */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'cliente', label: 'Por el Cliente' },
                    { id: 'cotizar', label: 'A Cotizar (Nosotros)' },
                    { id: 'no_requerido', label: 'No Requerido' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onChange({
                        ...quotation,
                        internetService: {
                          ...quotation.internetService,
                          type: opt.id as InternetServiceType,
                        },
                      })}
                      className={`px-3 py-1 text-xs rounded-md font-semibold border transition-all ${
                        quotation.internetService.type === opt.id
                          ? 'bg-red-600 text-white border-red-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Technical Specifications Text Area */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Especificaciones Técnicas de Conectividad e Internet Requeridas *
                </label>
                <textarea
                  rows={3}
                  value={quotation.internetService.technicalSpecs}
                  onChange={(e) => onChange({
                    ...quotation,
                    internetService: {
                      ...quotation.internetService,
                      technicalSpecs: e.target.value,
                    },
                  })}
                  placeholder="Detallar ancho de banda mínimo de subida/bajada (Mbps), conexión LAN cableada RJ45, IP pública, etc."
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none leading-relaxed"
                />
              </div>

              {quotation.internetService.type === 'cotizar' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-lg border border-red-200">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Costo a Cotizar por Enlace de Internet ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={quotation.internetService.cost || ''}
                      onChange={(e) => onChange({
                        ...quotation,
                        internetService: {
                          ...quotation.internetService,
                          cost: parseFloat(e.target.value) || 0,
                        },
                      })}
                      placeholder="Ej: 150"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md font-semibold"
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center">
                    Este valor se sumará al subtotal económico de la propuesta comercial.
                  </div>
                </div>
              )}
            </div>

            {/* Special Requirements List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Car className="w-4 h-4 text-red-600" />
                Apartado de Requerimientos Especiales
              </h4>
              <p className="text-xs text-slate-500">
                Active los requerimientos logísticos requeridos para este servicio (Transporte, Viáticos, Alimentación, Hospedaje, Otros):
              </p>

              <div className="space-y-3">
                {([
                  { key: 'transporte', label: 'Transporte', icon: Car, placeholder: 'Movilización de equipos y personal técnico' },
                  { key: 'viaticos', label: 'Viáticos', icon: Coffee, placeholder: 'Gastos operativos de viaje o estadía' },
                  { key: 'alimentacion', label: 'Alimentación', icon: Utensils, placeholder: 'Alimentación del personal técnico' },
                  { key: 'hospedaje', label: 'Hospedaje', icon: Hotel, placeholder: 'Alojamiento para el equipo técnico' },
                  { key: 'otros', label: 'Otros Requerimientos Especiales', icon: Layers, placeholder: 'Especificar requerimientos especiales adicionales' },
                ] as const).map(({ key, label, icon: Icon, placeholder }) => {
                  const req = quotation.specialRequirements[key];
                  return (
                    <div
                      key={key}
                      className={`border rounded-xl p-4 transition-all ${
                        req.enabled ? 'bg-white border-red-200 shadow-xs' : 'bg-slate-50 border-slate-200 opacity-80'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                        <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-800">
                          <input
                            type="checkbox"
                            checked={req.enabled}
                            onChange={(e) => handleSpecialReqChange(key, 'enabled', e.target.checked)}
                            className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                          />
                          <Icon className="w-4 h-4 text-slate-500" />
                          <span>{label}</span>
                        </label>

                        {req.enabled && (
                          <div className="flex items-center gap-2 text-xs">
                            <select
                              value={req.mode}
                              onChange={(e) => handleSpecialReqChange(key, 'mode', e.target.value as SpecialRequirementMode)}
                              className="px-2 py-1 text-xs border border-slate-300 rounded bg-white font-medium text-slate-700"
                            >
                              <option value="incluido">Incluido en la propuesta ($0 extra)</option>
                              <option value="cotizado">A cotizar (con costo adicional)</option>
                              <option value="cliente">A cargo del cliente</option>
                            </select>

                            {req.mode === 'cotizado' && (
                              <div className="flex items-center gap-1">
                                <span className="font-semibold text-slate-600">$</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="10"
                                  value={req.cost || ''}
                                  onChange={(e) => handleSpecialReqChange(key, 'cost', parseFloat(e.target.value) || 0)}
                                  placeholder="0.00"
                                  className="w-20 px-2 py-1 border border-slate-300 rounded font-semibold text-slate-800"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {req.enabled && (
                        <input
                          type="text"
                          value={req.details}
                          onChange={(e) => handleSpecialReqChange(key, 'details', e.target.value)}
                          placeholder={placeholder}
                          className="w-full mt-2 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: FINANZAS Y FIRMAS */}
        {activeTab === 'condiciones' && (
          <div className="space-y-6">
            {/* Taxes & Discounts */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Ajustes Financieros e Impuestos
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tarifa de I.V.A. (%)
                  </label>
                  <select
                    value={quotation.taxRate}
                    onChange={(e) => onChange({ ...quotation, taxRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="15">15% (Tarifa vigente Ecuador)</option>
                    <option value="12">12%</option>
                    <option value="0">0% (Exento de IVA)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Descuento Comercial (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={quotation.discountPercentage || ''}
                    onChange={(e) => onChange({ ...quotation, discountPercentage: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)) })}
                    placeholder="0"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Commercial terms & Payment conditions */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Condiciones Comerciales y Formas de Pago
              </label>
              <textarea
                rows={3}
                value={quotation.paymentTerms}
                onChange={(e) => onChange({ ...quotation, paymentTerms: e.target.value })}
                className="w-full p-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 leading-relaxed focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
            </div>

            {/* Datos de la cuenta para transferencias (deben ser editables) */}
            <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-red-600" />
                    Datos de la Cuenta para Transferencias (Editables)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Información bancaria visible en la cotización para pagos y transferencias del cliente.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nombre / Beneficiario *</label>
                  <input
                    type="text"
                    value={quotation.bankAccount?.beneficiaryName ?? 'Richart Bermeo Bonilla'}
                    onChange={(e) => {
                      const current = quotation.bankAccount || {
                        bankName: 'Banco Pichincha',
                        beneficiaryName: 'Richart Bermeo Bonilla',
                        accountType: 'Cuenta ahorros',
                        accountNumber: '3722419201',
                        email: 'rb.comunicaciones.ec@gmail.com',
                        idNumber: '0201771671',
                      };
                      onChange({
                        ...quotation,
                        bankAccount: { ...current, beneficiaryName: e.target.value },
                      });
                    }}
                    placeholder="Richart Bermeo Bonilla"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Banco</label>
                  <input
                    type="text"
                    value={quotation.bankAccount?.bankName ?? 'Banco Pichincha'}
                    onChange={(e) => {
                      const current = quotation.bankAccount || {
                        bankName: 'Banco Pichincha',
                        beneficiaryName: 'Richart Bermeo Bonilla',
                        accountType: 'Cuenta ahorros',
                        accountNumber: '3722419201',
                        email: 'rb.comunicaciones.ec@gmail.com',
                        idNumber: '0201771671',
                      };
                      onChange({
                        ...quotation,
                        bankAccount: { ...current, bankName: e.target.value },
                      });
                    }}
                    placeholder="Banco Pichincha"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Cuenta</label>
                  <input
                    type="text"
                    value={quotation.bankAccount?.accountType ?? 'Cuenta ahorros'}
                    onChange={(e) => {
                      const current = quotation.bankAccount || {
                        bankName: 'Banco Pichincha',
                        beneficiaryName: 'Richart Bermeo Bonilla',
                        accountType: 'Cuenta ahorros',
                        accountNumber: '3722419201',
                        email: 'rb.comunicaciones.ec@gmail.com',
                        idNumber: '0201771671',
                      };
                      onChange({
                        ...quotation,
                        bankAccount: { ...current, accountType: e.target.value },
                      });
                    }}
                    placeholder="Cuenta ahorros"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cuenta Ahorros (Número) *</label>
                  <input
                    type="text"
                    value={quotation.bankAccount?.accountNumber ?? '3722419201'}
                    onChange={(e) => {
                      const current = quotation.bankAccount || {
                        bankName: 'Banco Pichincha',
                        beneficiaryName: 'Richart Bermeo Bonilla',
                        accountType: 'Cuenta ahorros',
                        accountNumber: '3722419201',
                        email: 'rb.comunicaciones.ec@gmail.com',
                        idNumber: '0201771671',
                      };
                      onChange({
                        ...quotation,
                        bankAccount: { ...current, accountNumber: e.target.value },
                      });
                    }}
                    placeholder="3722419201"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Correo electrónico *</label>
                  <input
                    type="email"
                    value={quotation.bankAccount?.email ?? 'rb.comunicaciones.ec@gmail.com'}
                    onChange={(e) => {
                      const current = quotation.bankAccount || {
                        bankName: 'Banco Pichincha',
                        beneficiaryName: 'Richart Bermeo Bonilla',
                        accountType: 'Cuenta ahorros',
                        accountNumber: '3722419201',
                        email: 'rb.comunicaciones.ec@gmail.com',
                        idNumber: '0201771671',
                      };
                      onChange({
                        ...quotation,
                        bankAccount: { ...current, email: e.target.value },
                      });
                    }}
                    placeholder="rb.comunicaciones.ec@gmail.com"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1"># Cédula *</label>
                  <input
                    type="text"
                    value={quotation.bankAccount?.idNumber ?? '0201771671'}
                    onChange={(e) => {
                      const current = quotation.bankAccount || {
                        bankName: 'Banco Pichincha',
                        beneficiaryName: 'Richart Bermeo Bonilla',
                        accountType: 'Cuenta ahorros',
                        accountNumber: '3722419201',
                        email: 'rb.comunicaciones.ec@gmail.com',
                        idNumber: '0201771671',
                      };
                      onChange({
                        ...quotation,
                        bankAccount: { ...current, idNumber: e.target.value },
                      });
                    }}
                    placeholder="0201771671"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-semibold text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* General notes */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Observaciones Generales o Notas Adicionales
              </label>
              <textarea
                rows={2}
                value={quotation.generalNotes}
                onChange={(e) => onChange({ ...quotation, generalNotes: e.target.value })}
                placeholder="Notas de coordinación previa, visitas técnicas de inspección o cronograma..."
                className="w-full p-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 leading-relaxed focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
            </div>

            {/* Signatures Management - ONLY RB COMUNICACIONES & FIRMADOR */}
            <div className="bg-slate-900 text-white p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                    <PenTool className="w-4 h-4" />
                    Suscripción Formal & Control de Emisión
                  </h4>
                  <p className="text-xs text-slate-300">
                    Suscripción autorizada de la propuesta técnica y económica conforme a los términos comerciales.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* 1. Descargar PDF Button (replaces Firma Gráfica) */}
                <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase font-bold text-slate-400 block">
                      Representante RBCOMUNICACIONES
                    </span>
                    <span className="text-xs font-bold text-white block">
                      {quotation.issuerSignature.name || 'Richart Oswaldo Bermeo Bonilla'}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Descargar documento para firma formal
                    </span>
                  </div>
                  {onDownloadPdf && (
                    <button
                      id="form-download-pdf-btn"
                      type="button"
                      disabled={isDownloadingPdf || quotation.items.length === 0}
                      onClick={onDownloadPdf}
                      className={`inline-flex items-center px-3.5 py-2 text-white text-xs font-bold rounded-lg shadow-xs transition-all ${
                        quotation.items.length === 0
                          ? 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'
                          : 'bg-red-600 hover:bg-red-700 cursor-pointer shadow-sm hover:shadow'
                      }`}
                      title={
                        quotation.items.length === 0
                          ? 'Debe registrar al menos un producto o servicio para descargar el PDF'
                          : 'Descargar cotización en archivo PDF'
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
                  )}
                </div>

                {/* 2. Subir Cotización Firmada Button */}
                <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 bg-red-600 text-white font-bold text-[9px] rounded">PDF</span>
                      <span className="text-[11px] uppercase font-bold text-slate-200">
                        Cotización Firmada
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                      {quotation.signedDocument?.fileName ? 'Archivo subido y respaldado' : 'Subir documento suscrito'}
                    </span>
                  </div>

                  {onOpenUploadSigned && (
                    <button
                      type="button"
                      disabled={quotation.items.length === 0}
                      onClick={onOpenUploadSigned}
                      className={`px-3.5 py-2 text-white text-xs font-bold rounded-lg shadow-xs transition-all ${
                        quotation.items.length === 0
                          ? 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'
                          : 'bg-red-600 hover:bg-red-700 cursor-pointer'
                      }`}
                      title={
                        quotation.items.length === 0
                          ? 'Debe agregar productos o servicios primero'
                          : 'Subir archivo PDF con la cotización firmada'
                      }
                    >
                      {quotation.signedDocument?.fileName ? 'Ver Firmada' : 'Subir PDF Firmado'}
                    </button>
                  )}
                </div>

                {/* Signed Backup Status in Database / Google Drive */}
                {quotation.signedDocument?.fileName && (
                  <div className="col-span-1 sm:col-span-2 bg-emerald-950/70 border border-emerald-500/40 p-3 rounded-lg text-xs flex items-center justify-between">
                    <div className="text-emerald-200">
                      <span className="font-bold block">✓ Cotización Firmada Registrada</span>
                      <span className="text-[11px] text-emerald-400">
                        {quotation.signedDocument.fileName} • {quotation.signedDocument.signedBy || 'Representante'} • {quotation.signedDocument.uploadedAt}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {quotation.signedDocument.fileDataUrl && (
                        <a
                          href={quotation.signedDocument.fileDataUrl}
                          download={quotation.signedDocument.fileName}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded shadow-xs"
                        >
                          Descargar
                        </a>
                      )}
                      {onOpenDriveModal && (
                        <button
                          type="button"
                          onClick={onOpenDriveModal}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded shadow-xs"
                        >
                          Google Drive
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
