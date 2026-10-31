import { useEffect, useRef, type RefObject } from 'react';

/**
 * Enterprise Accessibility Hook: Keyboard Focus Trap & Escape Handler
 * Enforces WCAG 2.1 AA compliant keyboard navigation:
 * 1. Automatically focuses the first interactive element upon modal open.
 * 2. Traps `Tab` and `Shift+Tab` cycles strictly inside the dialog.
 * 3. Handles `Escape` to close the dialog.
 * 4. Restores focus to the triggering element upon dialog close.
 */
export function useFocusTrap(
  isOpen: boolean,
  onClose: () => void
): RefObject<HTMLDivElement | null> {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const container = containerRef.current;
    if (!container) return;

    // Preserve previously active element to restore upon close
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusableSelectors =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    // Focus first element on next tick
    const timer = setTimeout(() => {
      if (!containerRef.current) return;
      const elements = containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors);
      if (elements.length > 0) {
        elements[0].focus();
      }
    }, 40);

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        if (!containerRef.current) return;
        const elements = containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors);
        if (elements.length === 0) return;

        const firstElement = elements[0];
        const lastElement = elements[elements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused && previouslyFocused.focus) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen, onClose]);

  return containerRef;
}

