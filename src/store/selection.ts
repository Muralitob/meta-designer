import { MetaPen } from '@/pages/MetaDesigner';
import { create } from 'zustand';

export enum SelectionMode {
  File,
  Pen,
}

interface useSelectionState {
  selections: {
    mode: SelectionMode
    pen: MetaPen | null
  }
  select: (pens?: MetaPen[]) => void;
}

export const useSelections = create<useSelectionState>((set) => ({
  selections: {
    mode: SelectionMode.File,
    pen: null,
  },
  select: (pens?: MetaPen[]) => {
    if (!pens || pens.length !== 1) {
      set({
        selections: {
          mode: SelectionMode.File,
          pen: null,
        },
      });
      return;
    }
    set({
      selections: {
        mode: SelectionMode.Pen,
        pen: pens[0],
      },
    });
  },
}));
