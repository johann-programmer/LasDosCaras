import { useState } from 'react'
import './App.css'
import useAush from './hooks/useAush'

function App() {
  const { isAuthenticated, user, login, logout } = useAush()
  const [email, setEmail] = useState('admin@lasdoscaras.com')
  const [password, setPassword] = useState('123456')
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    try {
      await login(email, password)
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Error al iniciar sesión.')
    }
  }

  if (isAuthenticated && user) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <p className="eyebrow">Dashboard</p>
          <h1>Bienvenido, {user.name}</h1>
          <p className="subtitle">Sesión activa</p>
          <p className="info-row">
            <strong>Email:</strong> {user.email}
          </p>
          <button type="button" onClick={logout}>Cerrar sesión</button>
        </section>
      </main>
    )
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">Acceso</p>
        <h1>Inicia sesión</h1>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            <span>Correo</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@lasdoscaras.com"
            />
          </label>

          <label>
            <span>Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="123456"
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit">Entrar</button>
        </form>
      </section>
    </main>
  )
}

export default App
