import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'cyber',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'cyber' ? 'dark' : 
               state.theme === 'dark' ? 'light' : 'cyber'
      }))
    }),
    {
      name: 'theme-storage',
    }
  )
);