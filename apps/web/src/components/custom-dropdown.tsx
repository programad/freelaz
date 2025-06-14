import { useState, useEffect, useRef } from "react";
import { normalizeText } from "@brazilian-rate-calculator/shared";
import { DropdownPortal } from "./dropdown-portal";

interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  searchable?: boolean;
}

export function CustomDropdown({
  value,
  onChange,
  options,
  placeholder = "Selecione uma opção",
  searchable = false,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState<"down" | "up">(
    "down"
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        isOpen &&
        !target.closest(".custom-dropdown") &&
        !target.closest("[data-dropdown-portal]")
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Calculate dropdown position when opening
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      // Estimate dropdown height (max-height is 192px = 12rem)
      const estimatedDropdownHeight = Math.min(
        options.length * 48 + (searchable ? 60 : 0),
        192
      );

      // If there's not enough space below but more space above, flip it
      if (
        spaceBelow < estimatedDropdownHeight &&
        spaceAbove > estimatedDropdownHeight
      ) {
        setDropdownPosition("up");
      } else {
        setDropdownPosition("down");
      }
    }
  }, [isOpen, options.length, searchable]);

  const filteredOptions = searchable
    ? options.filter(
        (option) =>
          normalizeText(option.label).includes(normalizeText(search)) ||
          normalizeText(option.value).includes(normalizeText(search))
      )
    : options;

  const selectedOption = options.find((option) => option.value === value);

  const dropdownContent = (
    <div
      data-dropdown-portal
      className="w-full bg-white border-2 border-gray-300 rounded-lg shadow-lg"
    >
      {searchable && (
        <div className="p-2 border-b border-gray-200">
          <input
            type="text"
            placeholder="🔍 Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 text-sm border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all"
            autoFocus
          />
        </div>
      )}
      <div className="max-h-48 overflow-y-auto">
        {filteredOptions.map((option) => (
          <div
            key={option.value}
            className={`p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
              option.value === value
                ? "bg-blue-50 text-blue-600 font-semibold"
                : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onChange(option.value);
              setIsOpen(false);
              setSearch("");
            }}
          >
            {option.label}
          </div>
        ))}
        {filteredOptions.length === 0 && (
          <div className="p-3 text-gray-500 text-center">
            Nenhuma opção encontrada
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative custom-dropdown" ref={containerRef}>
      <div
        className="w-full p-3 border-2 border-gray-300 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all cursor-pointer bg-white flex items-center justify-between text-base leading-6 min-h-[3.5rem]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? "text-gray-900" : "text-gray-500"}>
          {selectedOption?.label || placeholder}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      <DropdownPortal
        isOpen={isOpen}
        triggerRef={containerRef}
        position={dropdownPosition}
      >
        {dropdownContent}
      </DropdownPortal>
    </div>
  );
}
