import { Pen } from '@meta2d/core';
import { create } from 'zustand';

export enum SelectionMode {
  File,
  Pen,
}

export const useSelections = create((set) => ({
  selections: {
    mode: SelectionMode.File,
    pen: null,
  },
  select: (pens?: Pen[]) => {
    if (!pens || pens.length !== 1) {
      set({
        selections: {
          mode: SelectionMode.File,
          pen: undefined,
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
