import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

// Avatar2 is the default (index 1).
export const AVATARS = [
  require('../../Elements/Avatar1.png'),
  require('../../Elements/Avatar2.png'),
  require('../../Elements/Avatar3.png'),
  require('../../Elements/Avatar4.png'),
  require('../../Elements/Avatar5.png'),
  require('../../Elements/Avatar6.png'),
] as const;

const DEFAULT_INDEX = 1;
const STORAGE_KEY = 'fitalarmly.avatar.v1';

interface AvatarStore {
  selectedIndex: number;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setIndex: (index: number) => void;
}

export const useAvatarStore = create<AvatarStore>((set, get) => ({
  selectedIndex: DEFAULT_INDEX,
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const index = raw != null ? parseInt(raw, 10) : DEFAULT_INDEX;
    set({ selectedIndex: Number.isNaN(index) ? DEFAULT_INDEX : index, hydrated: true });
  },

  setIndex: (index) => {
    set({ selectedIndex: index });
    AsyncStorage.setItem(STORAGE_KEY, String(index));
  },
}));
