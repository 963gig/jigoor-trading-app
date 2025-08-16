
import React, { useRef, KeyboardEvent } from 'react';

interface CoinInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddTag: (tag: string) => void;
}

export const CoinInput: React.FC<CoinInputProps> = ({ tags, setTags, placeholder, value, onChange, onAddTag }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ([',', ' '].includes(e.key)) {
      e.preventDefault();
      if (value.trim()) {
        onAddTag(value);
      }
    } else if (e.key === 'Backspace' && value === '') {
      if (tags.length > 0) {
        removeTag(tags[tags.length - 1]);
      }
    }
  };

  return (
    <div 
      className="w-full flex-grow bg-white border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-brand-primary focus-within:border-brand-primary transition duration-300 px-3 py-2 flex items-center flex-wrap gap-2 shadow-sm"
      onClick={() => inputRef.current?.focus()}
      role="combobox"
      aria-haspopup="listbox"
      aria-expanded="false"
    >
      {tags.map(tag => (
        <div key={tag} className="flex items-center bg-brand-primary text-white text-sm font-semibold px-3 py-1 rounded-full gap-2 animate-scale-in">
          <span>{tag}</span>
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation(); // Prevent the main div click handler
              removeTag(tag);
            }}
            className="text-white hover:bg-white/20 rounded-full h-4 w-4 flex items-center justify-center transition-colors"
            aria-label={`Remove ${tag}`}
          >
            &times;
          </button>
        </div>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder={tags.length > 0 ? '' : (placeholder || "Enter tickers or pairs")}
        className="flex-grow bg-transparent text-brand-dark placeholder-brand-subtext text-lg focus:outline-none min-w-[120px] h-8"
        aria-label="Crypto ticker or Forex pair input"
      />
    </div>
  );
};