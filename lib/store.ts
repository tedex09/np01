import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  preferences: {
    layout: 'netflix' | 'classic';
    theme: 'dark' | 'light';
    effects: {
      parallax: boolean;
      motionBlur: boolean;
    };
  };
}

interface AuthState {
  isAuthenticated: boolean;
  profiles: UserProfile[];
  activeProfile: UserProfile | null;
  setAuthenticated: (value: boolean) => void;
  setProfiles: (profiles: UserProfile[]) => void;
  setActiveProfile: (profile: UserProfile | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      profiles: [],
      activeProfile: null,
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      setProfiles: (profiles) => set({ profiles }),
      setActiveProfile: (profile) => set({ activeProfile: profile }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

interface PlaylistState {
  channels: any[];
  movies: any[];
  series: any[];
  setChannels: (channels: any[]) => void;
  setMovies: (movies: any[]) => void;
  setSeries: (series: any[]) => void;
}

export const usePlaylistStore = create<PlaylistState>((set) => ({
  channels: [],
  movies: [],
  series: [],
  setChannels: (channels) => set({ channels }),
  setMovies: (movies) => set({ movies }),
  setSeries: (series) => set({ series }),
}));