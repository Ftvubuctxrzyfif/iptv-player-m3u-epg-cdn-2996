import { useEffect, useState, useCallback } from 'react';

interface TvNavigationOptions {
  enableArrowKeys?: boolean;
  enableEnterKey?: boolean;
  enableEscapeKey?: boolean;
  onEnterPress?: (focusedElement: HTMLElement) => void;
  onEscapePress?: () => void;
}

export const useTVNavigation = (options: TvNavigationOptions = {}) => {
  const {
    enableArrowKeys = true,
    enableEnterKey = true,
    enableEscapeKey = true,
    onEnterPress,
    onEscapePress,
  } = options;

  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null);

  const getFocusableElements = useCallback(() => {
    const focusableSelectors = [
      'button:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
    ].join(', ');

    return Array.from(document.querySelectorAll(focusableSelectors)) as HTMLElement[];
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!focusedElement) return;

    const focusableElements = getFocusableElements();
    const currentIndex = focusableElements.indexOf(focusedElement);

    if (currentIndex === -1) return;

    let nextIndex = currentIndex;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        nextIndex = (currentIndex + 1) % focusableElements.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        nextIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
        break;
      case 'Enter':
      case 'OK': // webOS TV uses 'OK' for Enter key
        if (enableEnterKey) {
          e.preventDefault();
          if (onEnterPress) {
            onEnterPress(focusedElement);
          } else {
            focusedElement.click();
          }
        }
        return; // Return early, don't update focus
      case 'Escape':
      case 'BACK': // webOS TV uses 'BACK' for Escape key
        if (enableEscapeKey && onEscapePress) {
          e.preventDefault();
          onEscapePress();
        }
        return; // Return early
      default:
        return;
    }

    const nextElement = focusableElements[nextIndex];
    if (nextElement) {
      nextElement.focus();
      setFocusedElement(nextElement);
    }
  }, [focusedElement, getFocusableElements, enableEnterKey, enableEscapeKey, onEnterPress, onEscapePress]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Initialize first focusable element
  useEffect(() => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0 && !focusedElement) {
      focusableElements[0].focus();
      setFocusedElement(focusableElements[0]);
    }
  }, [getFocusableElements, focusedElement]);

  return { focusedElement, setFocusedElement };
};

export default useTVNavigation;