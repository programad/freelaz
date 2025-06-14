import { useEffect } from "react";

/**
 * Custom hook to lock/unlock body scroll when modals are open
 * Prevents background page scrolling when modal is visible
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (isLocked) {
      // Store the current scroll position
      const scrollY = window.scrollY;

      // Get the current body styles
      const body = document.body;
      const originalStyle = {
        position: body.style.position,
        top: body.style.top,
        left: body.style.left,
        right: body.style.right,
        overflow: body.style.overflow,
        width: body.style.width,
      };

      // Apply scroll lock styles
      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.overflow = "hidden";
      body.style.width = "100%";

      // Cleanup function to restore scroll
      return () => {
        // Restore original styles
        body.style.position = originalStyle.position;
        body.style.top = originalStyle.top;
        body.style.left = originalStyle.left;
        body.style.right = originalStyle.right;
        body.style.overflow = originalStyle.overflow;
        body.style.width = originalStyle.width;

        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isLocked]);
}
