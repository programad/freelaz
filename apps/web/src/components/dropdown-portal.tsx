import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface DropdownPortalProps {
  children: React.ReactNode;
  isOpen: boolean;
  triggerRef: React.RefObject<HTMLDivElement | null>;
  position?: "down" | "up";
}

export function DropdownPortal({
  children,
  isOpen,
  triggerRef,
  position = "down",
}: DropdownPortalProps) {
  const [portalElement, setPortalElement] = useState<HTMLDivElement | null>(
    null
  );
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (isOpen) {
      // Create portal element
      const element = document.createElement("div");
      element.style.position = "fixed";
      element.style.zIndex = "9999";
      element.style.pointerEvents = "none";
      document.body.appendChild(element);
      setPortalElement(element);

      return () => {
        document.body.removeChild(element);
        setPortalElement(null);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && triggerRef.current && portalElement) {
      const updatePosition = () => {
        const triggerRect = triggerRef.current!.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        let top: number;
        let left = triggerRect.left;
        let width = triggerRect.width;

        // Ensure dropdown doesn't go off-screen horizontally
        if (left + width > viewportWidth) {
          left = viewportWidth - width - 10;
        }
        if (left < 10) {
          left = 10;
          width = Math.min(width, viewportWidth - 20);
        }

        if (position === "up") {
          top = triggerRect.top - 8; // 8px gap above trigger
        } else {
          top = triggerRect.bottom + 4; // 4px gap below trigger
        }

        // Ensure dropdown doesn't go off-screen vertically
        if (top < 10) {
          top = 10;
        }
        if (top > viewportHeight - 100) {
          top = viewportHeight - 100;
        }

        setDropdownStyle({
          position: "fixed",
          top: `${top}px`,
          left: `${left}px`,
          width: `${width}px`,
          pointerEvents: "auto",
        });
      };

      updatePosition();

      // Update position on scroll or resize
      const handleUpdate = () => updatePosition();
      window.addEventListener("scroll", handleUpdate, true);
      window.addEventListener("resize", handleUpdate);

      return () => {
        window.removeEventListener("scroll", handleUpdate, true);
        window.removeEventListener("resize", handleUpdate);
      };
    }
  }, [isOpen, triggerRef, portalElement, position]);

  if (!isOpen || !portalElement) {
    return null;
  }

  return createPortal(
    <div style={dropdownStyle}>{children}</div>,
    portalElement
  );
}
