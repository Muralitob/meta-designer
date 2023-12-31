import { create } from 'zustand';

interface useMetaState {
  customSkinSet: Record<string, string[]>;
  setSkin: (type: string, data: string[]) => void;
}

export const useMetaStore = create<useMetaState>((set) => ({
  customSkinSet: {},
  setSkin: (itemType: string, data: string[]) => {
    set((state) => {
      return {
        customSkinSet: {
          ...state.customSkinSet,
          [itemType]: data,
        },
      };
    });
  },
}));
