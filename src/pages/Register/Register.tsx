import { useForm } from "../../hooks/useForm";

function Register() {
  const {
    register,
    handleSubmit,
    errors,
    reset,
    onSubmit,
  } = useForm();

  return (
    <div>
      <h1>Crear cuenta</h1>

      <form onSubmit={handleSubmit(onSubmit)}>

        <div>
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
            <p>{errors.user.message}</p>
          )}
        </div>

        <div>
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
            <p>{errors.email.message}</p>
          )}
        </div>

        <div>
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
            <p>{errors.password.message}</p>
          )}
        </div>

        <button type="submit">
          Registrarse
        </button>

        <button
          type="button"
          onClick={() => reset()}
        >
          Limpiar
        </button>

      </form>
    </div>
  );
}

export default Register;