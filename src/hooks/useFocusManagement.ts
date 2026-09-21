import { useEffect, useCallback, useRef } from 'react';

export interface FocusManagementOptions {
  onFocusLoss?: () => void;
  onFocusRegain?: () => void;
}

export function useFocusManagement(options: FocusManagementOptions = {}) {
  const isFocused = useRef(true);

  const handleFocusLoss = useCallback(() => {
    if (!isFocused.current) return; // Prevent duplicate events
    isFocused.current = false;
    options.onFocusLoss?.();
  }, [options]);

  const handleFocusRegain = useCallback(() => {
    if (isFocused.current) return; // Prevent duplicate events
    isFocused.current = true;
    options.onFocusRegain?.();
  }, [options]);

  useEffect(() => {
    const onBlur = () => handleFocusLoss();
    const onFocus = () => handleFocusRegain();
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleFocusLoss();
      } else if (document.visibilityState === 'visible') {
        // visibilitychange to visible typically coincides with focus,
        // but we'll let the focus event handle true window focus to avoid false positives,
        // unless we want to trigger regain immediately on visibility.
        // We can just rely on focus/blur for the window state.
      }
    };
    const onPageHide = () => handleFocusLoss();

    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', onPageHide);

    return () => {
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, [handleFocusLoss, handleFocusRegain]);

  return { isFocused: isFocused.current };
}
