'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface FocusableOptions {
  onEnterPress?: () => void;
  onArrowPress?: (direction: 'up' | 'down' | 'left' | 'right') => void;
}

export const FocusContext = createContext<string | null>(null);

export function useFocusable(options: FocusableOptions = {}) {
  const ref = useRef<HTMLElement>(null);
  const [focused, setFocused] = useState(false);
  const focusKey = useRef(Math.random().toString(36).substring(2)).current;
  const parentFocusKey = useContext(FocusContext);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!focused) return;

      switch (e.key) {
        case 'Enter':
          options.onEnterPress?.();
          break;
        case 'ArrowUp':
          options.onArrowPress?.('up');
          break;
        case 'ArrowDown':
          options.onArrowPress?.('down');
          break;
        case 'ArrowLeft':
          options.onArrowPress?.('left');
          break;
        case 'ArrowRight':
          options.onArrowPress?.('right');
          break;
      }
    };

    const handleFocus = () => setFocused(true);
    const handleBlur = () => setFocused(false);

    element.addEventListener('keydown', handleKeyDown);
    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);

    // Make element focusable
    if (!element.getAttribute('tabindex')) {
      element.setAttribute('tabindex', '0');
    }

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
    };
  }, [focused, options]);

  return { ref, focused, focusKey };
}