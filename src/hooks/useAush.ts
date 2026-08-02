import { useCallback, useEffect, useMemo, useState } from 'react'

export type AuthUser = {
  id: string
  name: string
  email: string
}

const AUTH_STORAGE_KEY = 'lasdoscaras-auth-user'
const ADMIN_EMAIL = 'admin@lasdoscaras.com'
const ADMIN_PASSWORD = '123456'

const getStoredUser = (): AuthUser | null => {
  if (typeof window === 'undefined') {
    return null
  }

  const savedUser = window.localStorage.getItem(AUTH_STORAGE_KEY)

  if (!savedUser) {
    return null
  }

  try {
    const parsedUser = JSON.parse(savedUser) as Partial<AuthUser>

    if (!parsedUser.id || !parsedUser.name || !parsedUser.email) {
      return null
    }

    return {
      id: parsedUser.id,
      name: parsedUser.name,
      email: parsedUser.email,
    }
  } catch {
    return null
  }
}

// Hook de autenticación simple para la app.
// Guarda la sesión en localStorage y valida el acceso con un usuario fijo.
export function useAush() {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    if (user) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
      return
    }

    window.localStorage.removeItem(AUTH_STORAGE_KEY)
  }, [user])

  const login = useCallback(async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail || !password.trim()) {
      throw new Error('Debes ingresar correo y contraseña.')
    }

    if (normalizedEmail !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      throw new Error('Credenciales inválidas.')
    }

    const authenticatedUser: AuthUser = {
      id: '1',
      name: 'Administrador',
      email: ADMIN_EMAIL,
    }

    setUser(authenticatedUser)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  return useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, login, logout],
  )
}

export default useAush
