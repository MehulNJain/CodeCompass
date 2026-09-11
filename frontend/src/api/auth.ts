import { api } from '@/api/client'
import type { SignInRequest, SignUpRequest, User } from '@/types/api'

/*
 * The session lives in an httpOnly cookie that the browser attaches to every
 * same-origin request by itself. Nothing here stores or sends a token, and no
 * script on the page can read one.
 */
export const authApi = {
  signUp: (payload: SignUpRequest) => api.post<User>('/auth/signup', payload),

  signIn: (payload: SignInRequest) => api.post<User>('/auth/login', payload),

  signOut: () => api.post<void>('/auth/logout', undefined),

  /** 401 when signed out. */
  me: () => api.get<User>('/auth/me'),
}
