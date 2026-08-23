<<<<<<< HEAD
/*
 * ------------------------------------------------------------
 * - Funcionalidades:
 * - Captura correo y contraseña.
 * - Ejecuta la autenticación.
 * - Muestra mensajes de error.
 * ------------------------------------------------------------
 */


import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import './login.css';
import logo from "../../assets/logo.png";

function Login() {

  // Obtiene la función login del hook de autenticación
  const { login } = useAuth();

  // Estados para almacenar los datos del formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Estado para mostrar mensajes de error
  const [error, setError] = useState("");

  /**
   * Ejecuta el proceso de inicio de sesión.
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError("");

      await login(email, password);

      console.log("Inicio de sesión exitoso");

    } catch (error) {
      setError("Correo o contraseña incorrectos.");
    }
  };


  return (
  <div className="login-page">
    
    <div className="login-card">

      <img
        src={logo}
        alt="Las Dos Caras"
        className="login-logo"
      />

      <h1>Inicia sesión</h1>

      <p>Accede a tu cuenta de Las Dos Caras</p>

      <form onSubmit={handleLogin}>

        <div className="input-group">
          <label>Correo</label>

          <input
            type="email"
            placeholder="Ingrese su correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Contraseña</label>

          <input
            type="password"
            placeholder="Ingrese su contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p className="login-error">
            {error}
          </p>
        )}

        <button type="submit">
          Iniciar sesión
        </button>

      </form>

    </div>
  </div>
);
}

export default Login;
=======
import { useState } from 'react';
import { login } from '../../services/auth';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await login({ email, password });
      console.log('Login exitoso:', response);
      alert('¡Bienvenido!');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div>
      <h1>Iniciar Sesión</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="Correo"
          required 
        />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Contraseña"
          required 
        />
        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
};
>>>>>>> 06ebe1e654e97562cb1b27b3347dc75f4aa00d06
