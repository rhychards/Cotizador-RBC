import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Escuchar el estado de autenticación en tiempo real
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Función para procesar el login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError('Correo o contraseña incorrectos.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
        <h3>Cargando aplicación...</h3>
      </div>
    );
  }

  // Si NO hay usuario logueado, se muestra estrictamente la pantalla de acceso
  if (!user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif', paddingTop: '100px' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '360px', boxSizing: 'border-box' }}>
          <h2 style={{ textAlign: 'center', margin: '0 0 20px 0', color: '#1f2937' }}>Iniciar Sesión</h2>
          <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>Cotizador Tecnológico RBC</p>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '14px', color: '#4b5563' }}>Correo electrónico</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db' }} placeholder="tu@correo.com" />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '14px', color: '#4b5563' }}>Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db' }} placeholder="••••••••" />
            </div>

            {error && <p style={{ color: '#ef4444', fontSize: '13px', margin: '0', textAlign: 'center' }}>{error}</p>}

            <button type="submit" style={{ padding: '12px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
              Ingresar al Sistema
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Si SÍ hay un usuario logueado, se desbloquea el aplicativo completo
  return (
    <>
      <div style={{ position: 'absolute', top: '15px', right: '15px', fontFamily: 'sans-serif' }}>
        <button onClick={() => auth.signOut()} style={{ padding: '8px 12px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
          Cerrar Sesión ({user?.email})
        </button>
      </div>

      <div style={{ padding: '20px', fontFamily: 'sans-serif', color: '#333' }}>
        <h2>Bienvenido al Cotizador RBC</h2>
        <p>El sistema se ha autenticado con éxito.</p>
      </div>
    </>
  );
}

export default App;
