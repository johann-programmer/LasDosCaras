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

  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

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