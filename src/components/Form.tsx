import { useForm } from "../hooks/useForm";

export default function Register() {
  const {
    register,
    handleSubmit,
    errors,
    onSubmit,
  } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Usuario</label>
        <input
          type="text"
          {...register("user", {
            required: "El usuario es obligatorio",
          })}
        />

        {errors.user && (
          <span>{errors.user.message}</span>
        )}
      </div>

      <div>
        <label>Correo</label>
        <input
          type="email"
          {...register("email", {
            required: "El correo es obligatorio",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Ingresa un correo válido",
            },
          })}
        />

        {errors.email && (
          <span>{errors.email.message}</span>
        )}
      </div>

      <div>
        <label>Contraseña</label>
        <input
          type="password"
          {...register("password", {
            required: "La contraseña es obligatoria",
            minLength: {
              value: 8,
              message: "La contraseña debe tener al menos 8 caracteres",
            },
          })}
        />

        {errors.password && (
          <span>{errors.password.message}</span>
        )}
      </div>

      <button type="submit">
        Registrarse
      </button>
    </form>
  );
}