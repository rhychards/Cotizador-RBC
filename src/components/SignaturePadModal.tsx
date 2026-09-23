import React, { useRef, useState, useEffect } from 'react';
import { PenTool, RotateCcw, Check, X, Upload, ShieldCheck } from 'lucide-react';
import { DigitalSignature } from '../types';

interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signature: DigitalSignature) => void;
  title: string;
  defaultData: DigitalSignature;
  isClient?: boolean;
}

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  defaultData,
  isClient = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [penColor, setPenColor] = useState('#0f172a');
  const [strokeWidth, setStrokeWidth] = useState(2.5);
  const [formData, setFormData] = useState<DigitalSignature>({
    name: defaultData.name || '',
    titleOrRole: defaultData.titleOrRole || '',
    idNumber: defaultData.idNumber || '',
    signatureImage: defaultData.signatureImage || '',
    signedAt: defaultData.signedAt || new Date().toISOString().split('T')[0],
    approved: defaultData.approved ?? true,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: defaultData.name || '',
        titleOrRole: defaultData.titleOrRole || '',
        idNumber: defaultData.idNumber || '',
        signatureImage: defaultData.signatureImage || '',
        signedAt: defaultData.signedAt || new Date().toISOString().split('T')[0],
        approved: defaultData.approved ?? true,
      });
      setHasDrawn(!!defaultData.signatureImage);

      // Initialize canvas
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Reset canvas size with device pixel ratio for sharp rendering
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        ctx.scale(2, 2);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // If existing signature exists, draw it
        if (defaultData.signatureImage) {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, rect.width, rect.height);
            ctx.drawImage(img, 0, 0, rect.width, rect.height);
          };
          img.src = defaultData.signatureImage;
        } else {
          clearCanvas();
        }
      }, 100);
    }
  }, [isOpen, defaultData]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const pos = getPos(e);
    ctx.beginPath();
    ctx.strokeStyle = penColor;
    ctx.lineWidth = strokeWidth;
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setFormData(prev => ({ ...prev, signatureImage: '' }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        const rect = canvas.getBoundingClientRect();
        ctx.clearRect(0, 0, rect.width, rect.height);
        // Draw centered and scaled
        ctx.drawImage(img, 20, 10, rect.width - 40, rect.height - 20);
        setHasDrawn(true);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    let signatureUrl = formData.signatureImage;

    if (canvas && hasDrawn) {
      signatureUrl = canvas.toDataURL('image/png');
    }

    onSave({
      ...formData,
      signatureImage: signatureUrl,
      signedAt: formData.signedAt || new Date().toISOString().split('T')[0],
      approved: true,
    });
    onClose();
  };

  return (
    <div 
      id="signature-modal-backdrop" 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
    >
      <div 
        id="signature-modal-card" 
        className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white tracking-wide">{title}</h3>
              <p className="text-xs text-slate-400">Autorización y validez formal del documento</p>
            </div>
          </div>
          <button
            id="close-sig-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Nombre Completo *
              </label>
              <input
                id="sig-signer-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={isClient ? "Ej: Ing. Carlos Pérez" : "Ej: Lic. Representante RB"}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                {isClient ? "Cargo o Empresa" : "Cargo / Departamento"}
              </label>
              <input
                id="sig-signer-role"
                type="text"
                value={formData.titleOrRole}
                onChange={(e) => setFormData({ ...formData, titleOrRole: e.target.value })}
                placeholder={isClient ? "Ej: Gerente de Operaciones" : "Ej: Dirección Técnica"}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Cédula / RUC del Firmante
              </label>
              <input
                id="sig-signer-doc"
                type="text"
                value={formData.idNumber || ''}
                onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                placeholder="1793209525001 / 1790272036001"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Fecha de Firma
              </label>
              <input
                id="sig-signer-date"
                type="date"
                value={formData.signedAt}
                onChange={(e) => setFormData({ ...formData, signedAt: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
            </div>
          </div>

          {/* Signature Canvas Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <span>Trazo de Firma Digital</span>
                <span className="text-slate-400 font-normal">(dibuje en el cuadro)</span>
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setPenColor('#0f172a')}
                  className={`w-5 h-5 rounded-full border ${penColor === '#0f172a' ? 'ring-2 ring-red-500 border-white' : 'border-slate-300'} bg-slate-900`}
                  title="Tinta Negra"
                />
                <button
                  type="button"
                  onClick={() => setPenColor('#1e40af')}
                  className={`w-5 h-5 rounded-full border ${penColor === '#1e40af' ? 'ring-2 ring-red-500 border-white' : 'border-slate-300'} bg-blue-800`}
                  title="Tinta Azul Notarial"
                />
                <button
                  id="sig-clear-btn"
                  type="button"
                  onClick={clearCanvas}
                  className="flex items-center text-xs text-red-600 hover:text-red-700 font-medium ml-2 px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Limpiar
                </button>
              </div>
            </div>

            <div className="relative border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 overflow-hidden touch-none h-44 shadow-inner">
              <canvas
                id="digital-signature-canvas"
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-full cursor-crosshair"
              />
              {!hasDrawn && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 space-y-1">
                  <PenTool className="w-6 h-6 stroke-[1.5]" />
                  <span className="text-xs">Firme aquí con su mouse, touchpad o pantalla táctil</span>
                </div>
              )}
              <div className="absolute bottom-2 left-3 pointer-events-none text-[10px] text-slate-400">
                Línea de firma legal autorizada
              </div>
            </div>
          </div>

          {/* Or Upload Image */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>¿Tiene su firma escaneada o sello digital?</span>
            <label className="cursor-pointer inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-md shadow-xs text-xs font-medium text-slate-700 bg-white hover:bg-slate-50">
              <Upload className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Subir imagen PNG / JPG
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600 mr-1.5" />
            Certificación para cotización formal
          </div>
          <div className="flex items-center space-x-2">
            <button
              id="sig-cancel-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              id="sig-save-btn"
              type="button"
              onClick={handleSave}
              disabled={!formData.name.trim()}
              className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Check className="w-4 h-4 mr-1.5" />
              Guardar Firma
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
