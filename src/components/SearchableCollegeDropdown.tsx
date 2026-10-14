import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { College } from '../types';

interface SearchableCollegeDropdownProps {
  colleges: College[];
  selectedCollegeId: string;
  onChange: (collegeId: string) => void;
  defaultLabel?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

export const SearchableCollegeDropdown: React.FC<SearchableCollegeDropdownProps> = ({
  colleges,
  selectedCollegeId,
  onChange,
  defaultLabel = 'All Campuses (Universal Drive)',
  placeholder = 'Search by college name, word, or letter...',
  className = '',
  inputClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedCollege = colleges.find((c) => String(c.id) === String(selectedCollegeId));
  const currentLabel = selectedCollege ? selectedCollege.name : defaultLabel;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset keyboard highlight whenever search changes or dropdown opens
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchTerm, isOpen]);

  const handleFocus = () => {
    setIsOpen(true);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  // Case-insensitive, trimmed query matching anywhere in the text
  const query = searchTerm.trim().toLowerCase();

  // Show "All Campuses" if query is empty or if query matches part of defaultLabel
  const showDefault =
    !query ||
    defaultLabel.toLowerCase().includes(query);

  // Filter colleges matching the query anywhere in the name or location
  const filteredColleges = colleges.filter(
    (c) =>
      c.name.toLowerCase().includes(query) ||
      (c.location && c.location.toLowerCase().includes(query))
  );

  // Unified items list for keyboard navigation and rendering
  const items = [
    ...(showDefault ? [{ id: '', name: defaultLabel, location: '', isDefault: true }] : []),
    ...filteredColleges.map((c) => ({
      id: String(c.id),
      name: c.name,
      location: c.location || '',
      isDefault: false,
    })),
  ];

  const hasMatches = items.length > 0;

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
        return;
      }
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (items.length > 0) {
        setHighlightedIndex((prev) => {
          const next = prev < items.length - 1 ? prev + 1 : 0;
          scrollToItem(next);
          return next;
        });
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (items.length > 0) {
        setHighlightedIndex((prev) => {
          const next = prev <= 0 ? items.length - 1 : prev - 1;
          scrollToItem(next);
          return next;
        });
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < items.length) {
        handleSelect(items[highlightedIndex].id);
      } else if (items.length === 1) {
        handleSelect(items[0].id);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setSearchTerm('');
      setHighlightedIndex(-1);
    }
  };

  const scrollToItem = (index: number) => {
    if (listRef.current) {
      const element = listRef.current.children[index] as HTMLElement;
      if (element) {
        element.scrollIntoView({ block: 'nearest' });
      }
    }
  };

  // Helper function to highlight matching substrings in suggestions
  const renderHighlightedText = (text: string, searchStr: string) => {
    const trimmed = searchStr.trim();
    if (!trimmed) return text;

    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);

    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === trimmed.toLowerCase() ? (
            <mark
              key={i}
              className="bg-blue-100 text-[#2563EB] font-bold rounded-xs px-0.5 not-italic"
            >
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchTerm : currentLabel}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={handleFocus}
          onClick={() => {
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={isOpen ? currentLabel || placeholder : placeholder}
          className={
            inputClassName ||
            'w-full px-3.5 py-2 pr-9 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#2563EB] bg-white text-[#1E293B] cursor-pointer'
          }
        />
        <button
          type="button"
          onClick={() => {
            if (isOpen) {
              setIsOpen(false);
              setSearchTerm('');
              setHighlightedIndex(-1);
            } else {
              setIsOpen(true);
              inputRef.current?.focus();
            }
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
          tabIndex={-1}
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {isOpen && (
        <div
          ref={listRef}
          className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-72 overflow-y-auto py-1"
        >
          {query && hasMatches && (
            <div className="px-3.5 py-1.5 border-b border-slate-100 text-[10px] font-semibold text-slate-400 flex items-center justify-between">
              <span>{filteredColleges.length} {filteredColleges.length === 1 ? 'college' : 'colleges'} found</span>
            </div>
          )}

          {items.map((item, index) => {
            const isSelected = item.isDefault
              ? !selectedCollegeId
              : String(item.id) === String(selectedCollegeId);
            const isHighlighted = index === highlightedIndex;

            return (
              <div
                key={item.id || 'default'}
                onMouseEnter={() => setHighlightedIndex(index)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(item.id);
                }}
                className={`px-3.5 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                  isHighlighted
                    ? 'bg-blue-50 text-[#2563EB] font-medium'
                    : isSelected
                    ? 'bg-blue-50/70 text-[#2563EB] font-semibold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-[#2563EB]'
                }`}
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="truncate">
                    {renderHighlightedText(item.name, searchTerm)}
                  </span>
                  {item.location && !item.isDefault && (
                    <span className="text-[10px] text-slate-400 truncate mt-0.5">
                      {renderHighlightedText(item.location, searchTerm)}
                    </span>
                  )}
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                )}
              </div>
            );
          })}

          {!hasMatches && (
            <div className="px-3.5 py-3 text-xs text-slate-400 italic text-center">
              No matching colleges found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
