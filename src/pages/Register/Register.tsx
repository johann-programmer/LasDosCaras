import { useForm } from "../../hooks/useForm";
import "./Register.css";

function Register() {
  const {
    register,
    handleSubmit,
    errors,
    reset,
    onSubmit,
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
            <label htmlFor="user">
              Usuario
            </label>

            <input
              id="user"
              type="text"
              placeholder="Ingrese su usuario"
              {...register("user", {
                required: "El usuario es obligatorio",
              })}
            />

            {errors.user && (
              <p className="register-error">
                {errors.user.message}
              </p>
            )}
          </div>

          <div className="register-input-group">
            <label htmlFor="email">
              Correo
            </label>

            <input
              id="email"
              type="email"
              placeholder="Ingrese su correo"
              {...register("email", {
                required: "El correo es obligatorio",
              })}
            />

            {errors.email && (
              <p className="register-error">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="register-input-group">
            <label htmlFor="password">
              Contraseña
            </label>

            <input
              id="password"
              type="password"
              placeholder="Ingrese su contraseña"
              {...register("password", {
                required: "La contraseña es obligatoria",
                minLength: {
                  value: 6,
                  message: "La contraseña debe tener al menos 6 caracteres",
                },
              })}
            />

            {errors.password && (
              <p className="register-error">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="register-buttons">
            <button
              type="submit"
              className="register-submit"
            >
              Registrarse
            </button>

            <button
              type="button"
              className="register-clear"
              onClick={() => reset()}
            >
              Limpiar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default Register;