import React, { useState } from 'react';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { 
  Lock, 
  Mail, 
  UserPlus, 
  LogIn, 
  AlertCircle, 
  Video, 
  ShieldCheck, 
  Radio, 
  Activity 
} from 'lucide-react';

interface AuthModalProps {
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isRegistering && password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      if (onSuccess) onSuccess();
    } catch (err: any) {
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('Este correo ya se encuentra registrado. Inicie sesión.');
          break;
        case 'auth/invalid-email':
          setError('El formato del correo electrónico no es válido.');
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Credenciales incorrectas. Verifique correo y contraseña.');
          break;
        case 'auth/weak-password':
          setError('La contraseña debe tener al menos 6 caracteres.');
          break;
        default:
          setError('Error al autenticar. Verifique sus credenciales.');
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950 p-4">
      {/* 1. Mosaico Collage Temático: Streaming, Seguridad Electrónica y Radiofrecuencia */}
      <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-3 opacity-80 select-none pointer-events-none">
        {/* Streaming Corporativo de Audio y Video */}
        <div className="relative h-full overflow-hidden border-r border-slate-700/60">
          <img 
            src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1200&auto=format&fit=crop" 
            alt="Streaming Corporativo Audiovisual" 
            className="w-full h-full object-cover contrast-115 brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-red-950/40 via-transparent to-slate-900/30" />
        </div>

        {/* Seguridad Electrónica y CCTV */}
        <div className="relative h-full overflow-hidden border-r border-slate-700/60">
          <img 
            src="https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=1200&auto=format&fit=crop" 
            alt="Seguridad Electrónica" 
            className="w-full h-full object-cover contrast-115 brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-transparent to-slate-950/50" />
        </div>

        {/* Radiofrecuencia y Telecomunicaciones */}
        <div className="relative h-full overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1200&auto=format&fit=crop" 
            alt="Radiofrecuencia y Telecomunicaciones" 
            className="w-full h-full object-cover contrast-115 brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-l from-cyan-950/40 via-transparent to-slate-900/30" />
        </div>
      </div>

      {/* 2. Filtro de balance suave para dar contraste sin tapar el collage */}
      <div className="absolute inset-0 bg-slate-950/40 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* 3. Etiquetas de especialidad técnica */}
      <div className="absolute top-6 left-0 right-0 flex justify-center items-center gap-3 sm:gap-6 text-[11px] font-bold uppercase tracking-wider text-white select-none z-10 px-4 text-center">
        <span className="flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700 shadow-md">
          <Video className="w-3.5 h-3.5 text-red-500" /> Streaming Audio & Video
        </span>
        <span className="hidden sm:inline text-slate-500">•</span>
        <span className="flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700 shadow-md">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Seguridad Electrónica
        </span>
        <span className="hidden sm:inline text-slate-500">•</span>
        <span className="flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700 shadow-md">
          <Radio className="w-3.5 h-3.5 text-cyan-400" /> Radiofrecuencia
        </span>
      </div>

      {/* 4. Tarjeta Principal de Autenticación */}
      <div className="relative z-20 w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/60 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Cabecera */}
        <div className="bg-slate-900 p-6 text-center text-white border-b border-slate-800 relative">
          <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full">
            <Activity className="w-2.5 h-2.5 animate-pulse" /> Servidor Activo
          </div>
          <div className="mx-auto w-12 h-12 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center mb-3 shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold tracking-tight">
            {isRegistering ? 'Crear Cuenta' : 'Acceso al Sistema'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Cotizador Tecnológico RBC
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@rbc.com"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-slate-900 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-slate-900 bg-white"
              />
            </div>
          </div>

          {isRegistering && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-slate-900 bg-white"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Procesando...</span>
            ) : isRegistering ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Registrarse</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Iniciar Sesión</span>
              </>
            )}
          </button>

          <div className="text-center pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(null);
              }}
              className="text-xs text-slate-600 hover:text-red-600 font-medium transition-colors cursor-pointer"
            >
              {isRegistering
                ? '¿Ya tienes una cuenta? Inicia sesión aquí'
                : '¿No tienes una cuenta? Regístrate aquí'}
            </button>
          </div>
        </form>
      </div>

      {/* Pie de pantalla */}
      <div className="absolute bottom-4 text-center text-[10px] text-white/90 font-medium drop-shadow-md select-none z-10">
        RB Comunicaciones • Infraestructura Tecnológica & Soluciones Especializadas
      </div>
    </div>
  );
};
