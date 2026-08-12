import { useEffect } from 'react';
import { testConnection } from './services/testApi';

export default function App() {
  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Probando conexión con la API de Docker...</h1>
      <p>Abre la consola de tu navegador presionando la tecla F12.</p>
    </div>
  );
}