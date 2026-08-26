import { Link } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import { PasswordInput } from '../../components/PasswordInput';
import './Register.css';

function Register() {
  const {
    register,
    handleSubmit,
    errors,
    reset,
    onSubmit,
    serverError,
    loading,
  } = useForm();

  return (
    <div className="register-page">
      <div className="register-card">
        <h1>Crear cuenta</h1>

        <p className="register-description">
          Regístrate para acceder a Las Dos Caras
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="register-input-group">
            <label htmlFor="user">Usuario</label>

            <input
              id="user"
              type="text"
              placeholder="Ingrese su usuario"
              autoComplete="username"
              disabled={loading}
              {...register('user', {
                required: 'El usuario es obligatorio',
                minLength: {
                  value: 1,
                  message: 'El usuario es obligatorio',
                },
              })}
            />

            {errors.user && (
              <p className="register-error">{errors.user.message}</p>
            )}
          </div>

          <div className="register-input-group">
            <label htmlFor="email">Correo</label>

            <input
              id="email"
              type="email"
              placeholder="Ingrese su correo"
              autoComplete="email"
              disabled={loading}
              {...register('email', {
                required: 'El correo es obligatorio',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Ingresa un correo válido',
                },
              })}
            />

            {errors.email && (
              <p className="register-error">{errors.email.message}</p>
            )}
          </div>

          <div className="register-input-group">
            <label htmlFor="password">Contraseña</label>

            <PasswordInput
              id="password"
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              disabled={loading}
              {...register('password', {
                required: 'La contraseña es obligatoria',
                minLength: {
                  value: 8,
                  message: 'La contraseña debe tener al menos 8 caracteres',
                },
              })}
            />

            {errors.password && (
              <p className="register-error">{errors.password.message}</p>
            )}
          </div>

          {serverError && (
            <p className="register-error register-server-error">
              {serverError}
            </p>
          )}

          <div className="register-buttons">
            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>

            <button
              type="button"
              className="register-clear"
              onClick={() => reset()}
              disabled={loading}
            >
              Limpiar
            </button>
          </div>
        </form>

        <p className="register-login-link">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
