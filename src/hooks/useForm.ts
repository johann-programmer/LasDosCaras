import { useForm as useReactHookForm } from "react-hook-form";
import { apiFetch } from "../services/api";

interface RegisterForm {
  user: string;
  email: string;
  password: string;
}

export const useForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useReactHookForm<RegisterForm>({
    defaultValues: {
      user: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const response = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });

      console.log("Registro exitoso:", response);

      alert("Usuario registrado correctamente");

      reset();
    } catch (error) {
      console.error("Error al registrar usuario:", error);

      alert("No se pudo registrar el usuario");
    }
  };

  return {
    register,
    handleSubmit,
    errors,
    reset,
    onSubmit,
  };
};