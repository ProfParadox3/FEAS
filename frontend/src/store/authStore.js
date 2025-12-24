import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: (userData, token) => set({ 
        user: userData, 
        token: token,
        isAuthenticated: true 
      }),
      
      logout: () => set({ 
        user: null, 
        token: null,
        isAuthenticated: false 
      }),
      
      updateUser: (userData) => set((state) => ({ 
        user: { ...state.user, ...userData }
      })),
      
      // Get current user data
      getUser: () => get().user,
    }),
    {
      name: 'auth-storage',
    }
  )
);
