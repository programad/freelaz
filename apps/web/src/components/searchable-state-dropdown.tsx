import { useState, useEffect, useRef } from "react";
import { stateData, normalizeText, type StateKey } from "@freelaz/shared";
import { DropdownPortal } from "./dropdown-portal";

interface SearchableStateDropdownProps {
  value: StateKey;
  onChange: (value: StateKey) => void;
}

export function SearchableStateDropdown({
  value,
  onChange,
}: SearchableStateDropdownProps) {
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
        !target.closest(".searchable-dropdown") &&
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

      // Estimate dropdown height (max-height is 192px = 12rem + search input)
      const estimatedDropdownHeight = Math.min(
        Object.keys(stateData).length * 48 + 60,
        252
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
  }, [isOpen]);

  const filteredStates = Object.entries(stateData)
    .filter(
      ([key, s]) =>
        normalizeText(s.name).includes(normalizeText(search)) ||
        normalizeText(key).includes(normalizeText(search))
    )
    .sort(([_, a], [__, b]) => a.name.localeCompare(b.name));

  const dropdownContent = (
    <div
      data-dropdown-portal
      className="w-full bg-white border-2 border-gray-300 rounded-lg shadow-lg"
    >
      <div className="p-2 border-b border-gray-200">
        <input
          type="text"
          placeholder="🔍 Buscar estado..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 text-sm border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all"
          autoFocus
        />
      </div>
      <div className="max-h-48 overflow-y-auto">
        {filteredStates.map(([key, s]) => (
          <div
            key={key}
            className={`p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
              key === value ? "bg-blue-50 text-blue-600 font-semibold" : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onChange(key as StateKey);
              setIsOpen(false);
              setSearch("");
            }}
          >
            {s.name}
          </div>
        ))}
        {filteredStates.length === 0 && (
          <div className="p-3 text-gray-500 text-center">
            Nenhum estado encontrado
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative searchable-dropdown" ref={containerRef}>
      <div
        className="w-full p-3 border-2 border-gray-300 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all cursor-pointer bg-white flex items-center justify-between text-base leading-6 min-h-[3.5rem]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{stateData[value]?.name || "Selecione um estado"}</span>
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
