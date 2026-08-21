import { useState, useCallback } from 'react';

export type BottomSheetState = 'collapsed' | 'half' | 'full';

export function useBottomSheet(initialState: BottomSheetState = 'collapsed') {
  const [sheetState, setSheetState] = useState<BottomSheetState>(initialState);

  const collapse = useCallback(() => setSheetState('collapsed'), []);
  const expandHalf = useCallback(() => setSheetState('half'), []);
  const expandFull = useCallback(() => setSheetState('full'), []);

  const toggleNext = useCallback(() => {
    setSheetState((prev) =>
      prev === 'collapsed' ? 'half' : prev === 'half' ? 'full' : 'collapsed'
    );
  }, []);

  return {
    sheetState,
    setSheetState,
    collapse,
    expandHalf,
    expandFull,
    toggleNext,
    isCollapsed: sheetState === 'collapsed',
    isHalf: sheetState === 'half',
    isFull: sheetState === 'full',
  };
}
