import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signInWithRedirect, GoogleAuthProvider } from 'firebase/auth';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      // Usamos redirección nativa en lugar de ventanas emergentes molestas
      await signInWithRedirect(auth, provider);
    } catch (err: any) {
      setError('Error al conectar con Google. Inténtalo de nuevo.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f3f4f6' }}>
        <h3>Cargando seguridad...</h3>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '360px', boxSizing: 'border-box', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>Acceso Autorizado</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '30px' }}>Cotizador Tecnológico RBC</p>
          
          {error && <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '15px' }}>{error}</p>}

          <button 
            onClick={handleGoogleLogin} 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '12px', backgroundColor: '#ffffff', color: '#374151', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7l2.86 2.22c1.67-1.54 2.63-3.8 2.63-6.55z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.2l-2.86-2.22c-.79.53-1.8.85-3.1.85-2.39 0-4.41-1.61-5.14-3.78H.95v2.3A9 9 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.86 10.65c-.19-.57-.3-1.17-.3-1.8s.11-1.23.3-1.8V4.75H.95A8.99 8.99 0 0 0 0 9c0 1.54.39 2.98 1.05 4.25l2.81-2.1z"/>
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.8 11.43 0 9 0 5.48 0 2.45 2.02.95 4.75l2.91 2.26c.73-2.17 2.75-3.78 5.14-3.78z"/>
            </svg>
            Ingresar con Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ position: 'absolute', top: '15px', right: '15px', fontFamily: 'sans-serif', zIndex: 999 }}>
        <button onClick={() => auth.signOut()} style={{ padding: '8px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
          Cerrar Sesión ({user?.email})
        </button>
      </div>

      <div style={{ padding: '20px', fontFamily: 'sans-serif', color: '#333' }}>
        <h2>Bienvenido al Cotizador RBC</h2>
        <p>El sistema se ha autenticado con éxito mediante tu cuenta autorizada de Google.</p>
      </div>
    </>
  );
}

export default App;
