import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm as useReactHookForm } from 'react-hook-form';
import { apiFetch } from '../services/api';

interface RegisterForm {
  user: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  user: {
    id: string;
    email: string;
    name: string;
    status: string;
  };
  activationToken: string;
}

export const useForm = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useReactHookForm<RegisterForm>({
    defaultValues: {
      user: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    setServerError('');
    setLoading(true);

    try {
      // API espera { name, email, password }
      const response = await apiFetch<RegisterResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: data.user.trim(),
          email: data.email.trim(),
          password: data.password,
        }),
      });

      if (!response.activationToken) {
        throw new Error('No se recibió el token de activación.');
      }

      // Activar cuenta según el contrato del API
      await apiFetch(`/auth/activate/${response.activationToken}`, {
        method: 'GET',
      });

      reset();
      navigate('/login', {
        replace: true,
        state: {
          registered: true,
          email: data.email.trim(),
        },
      });
    } catch (error) {
      const raw =
        error instanceof Error
          ? error.message
          : 'No se pudo registrar el usuario';

      const messageMap: Record<string, string> = {
        'Email is already registered': 'Este correo ya está registrado',
        'Validation failed':
          'Revisa los datos: el correo debe ser válido y la contraseña tener al menos 8 caracteres',
        'Invalid activation token':
          'No se pudo activar la cuenta. Intenta de nuevo',
        'Account is already active': 'La cuenta ya estaba activa',
      };

      setServerError(messageMap[raw] ?? raw);
    } finally {
      setLoading(false);
    }
  };

  return {
    register,
    handleSubmit,
    errors,
    reset,
    onSubmit,
    serverError,
    loading,
  };
};
