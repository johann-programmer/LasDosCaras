import { useForm as useReactHookForm } from "react-hook-form";

interface RegisterForm  {
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

  const onSubmit = (data: RegisterForm) => {
    console.log("Datos de registro:", data);
  };

  return {
    register,
    handleSubmit,
    errors,
    reset,
    onSubmit,
  };
};