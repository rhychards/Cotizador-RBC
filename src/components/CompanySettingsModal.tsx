import React, { useState } from 'react';
import { CompanyInfo } from '../types';
import { X, Building2, Save, Upload, RotateCcw, CheckCircle2 } from 'lucide-react';
import { DEFAULT_COMPANY } from '../data/constants';
import { CompanyLogo } from './CompanyLogo';

interface CompanySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyInfo;
  onSave: (updated: CompanyInfo) => void;
}

export const CompanySettingsModal: React.FC<CompanySettingsModalProps> = ({
  isOpen,
  onClose,
  company,
  onSave,
}) => {
  const [formData, setFormData] = useState<CompanyInfo>(company);

  if (!isOpen) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({
        ...prev,
        logoUrl: event.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleResetDefaults = () => {
    setFormData(DEFAULT_COMPANY);
  };

  return (
    <div id="company-settings-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div id="company-settings-card" className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Datos de la Empresa Emisora</h3>
              <p className="text-xs text-slate-400">Información tributaria y de contacto en cotizaciones</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Identity Showcase Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 block">
                Identidad Corporativa Oficial RBCOMUNICACIONES
              </span>
              <CompanyLogo size="sm" showSubtitle={false} />
            </div>
            <div className="text-right">
              <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                Línea Gráfica Activa
              </span>
              <span className="block text-[10px] text-slate-400 mt-0.5">Emblema 3D + Isotipo WiFi</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Razón Social *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nombre Comercial</label>
              <input
                type="text"
                value={formData.tradeName}
                onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nombre del Representante Legal / Autorizado *
            </label>
            <input
              type="text"
              value={formData.representativeName || ''}
              placeholder="Mcs Richart Bermeo Bonilla"
              onChange={(e) => setFormData({ ...formData, representativeName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 bg-red-50/20 focus:bg-white focus:border-red-500"
            />
            <span className="text-[10px] text-slate-500">
              Nombre oficial para emisión de cotizaciones y firma electrónica FirmaEC.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">RUC *</label>
              <input
                type="text"
                value={formData.ruc}
                onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Teléfono / WhatsApp *</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Dirección Física *</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          {/* Bank transfer account details */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
            <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block border-b border-slate-200 pb-1.5">
              Datos de la Cuenta para Transferencias (Predeterminados)
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-700 text-[11px] mb-1">Nombre / Titular *</label>
                <input
                  type="text"
                  value={formData.bankAccount?.beneficiaryName ?? 'Richart Bermeo Bonilla'}
                  onChange={(e) => {
                    const current = formData.bankAccount || {
                      bankName: 'Banco Pichincha',
                      beneficiaryName: 'Richart Bermeo Bonilla',
                      accountType: 'Cuenta ahorros',
                      accountNumber: '3722419201',
                      email: 'rb.comunicaciones.ec@gmail.com',
                      idNumber: '0201771671',
                    };
                    setFormData({
                      ...formData,
                      bankAccount: { ...current, beneficiaryName: e.target.value },
                    });
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 text-[11px] mb-1">Banco</label>
                <input
                  type="text"
                  value={formData.bankAccount?.bankName ?? 'Banco Pichincha'}
                  onChange={(e) => {
                    const current = formData.bankAccount || {
                      bankName: 'Banco Pichincha',
                      beneficiaryName: 'Richart Bermeo Bonilla',
                      accountType: 'Cuenta ahorros',
                      accountNumber: '3722419201',
                      email: 'rb.comunicaciones.ec@gmail.com',
                      idNumber: '0201771671',
                    };
                    setFormData({
                      ...formData,
                      bankAccount: { ...current, bankName: e.target.value },
                    });
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 text-[11px] mb-1">Tipo de Cuenta</label>
                <input
                  type="text"
                  value={formData.bankAccount?.accountType ?? 'Cuenta ahorros'}
                  onChange={(e) => {
                    const current = formData.bankAccount || {
                      bankName: 'Banco Pichincha',
                      beneficiaryName: 'Richart Bermeo Bonilla',
                      accountType: 'Cuenta ahorros',
                      accountNumber: '3722419201',
                      email: 'rb.comunicaciones.ec@gmail.com',
                      idNumber: '0201771671',
                    };
                    setFormData({
                      ...formData,
                      bankAccount: { ...current, accountType: e.target.value },
                    });
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 text-[11px] mb-1">Cuenta Ahorros (N°) *</label>
                <input
                  type="text"
                  value={formData.bankAccount?.accountNumber ?? '3722419201'}
                  onChange={(e) => {
                    const current = formData.bankAccount || {
                      bankName: 'Banco Pichincha',
                      beneficiaryName: 'Richart Bermeo Bonilla',
                      accountType: 'Cuenta ahorros',
                      accountNumber: '3722419201',
                      email: 'rb.comunicaciones.ec@gmail.com',
                      idNumber: '0201771671',
                    };
                    setFormData({
                      ...formData,
                      bankAccount: { ...current, accountNumber: e.target.value },
                    });
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 text-[11px] mb-1">Correo electrónico *</label>
                <input
                  type="email"
                  value={formData.bankAccount?.email ?? 'rb.comunicaciones.ec@gmail.com'}
                  onChange={(e) => {
                    const current = formData.bankAccount || {
                      bankName: 'Banco Pichincha',
                      beneficiaryName: 'Richart Bermeo Bonilla',
                      accountType: 'Cuenta ahorros',
                      accountNumber: '3722419201',
                      email: 'rb.comunicaciones.ec@gmail.com',
                      idNumber: '0201771671',
                    };
                    setFormData({
                      ...formData,
                      bankAccount: { ...current, email: e.target.value },
                    });
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 text-[11px] mb-1"># Cédula *</label>
                <input
                  type="text"
                  value={formData.bankAccount?.idNumber ?? '0201771671'}
                  onChange={(e) => {
                    const current = formData.bankAccount || {
                      bankName: 'Banco Pichincha',
                      beneficiaryName: 'Richart Bermeo Bonilla',
                      accountType: 'Cuenta ahorros',
                      accountNumber: '3722419201',
                      email: 'rb.comunicaciones.ec@gmail.com',
                      idNumber: '0201771671',
                    };
                    setFormData({
                      ...formData,
                      bankAccount: { ...current, idNumber: e.target.value },
                    });
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono font-semibold text-xs"
                />
              </div>
            </div>
          </div>

          {/* Logo upload / preview */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-700 block">Logotipo Personalizado</span>
              <span className="text-[11px] text-slate-400">Si no se carga, se usará el emblema oficial vectorial.</span>
            </div>
            <label className="cursor-pointer inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-md text-xs font-medium text-slate-700 bg-white hover:bg-slate-50">
              <Upload className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Subir Logo
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex justify-between items-center">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center text-xs text-slate-500 hover:text-slate-800"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Restablecer Valores Iniciales
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-slate-300 text-xs rounded-lg text-slate-700 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                onSave(formData);
                onClose();
              }}
              className="inline-flex items-center px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-xs"
            >
              <Save className="w-3.5 h-3.5 mr-1" />
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
