
import React from 'react';

interface SearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEnter: () => void;
  placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, onEnter, placeholder }) => {
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onEnter();
    }
  };

  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder || "e.g., best altcoin signals today"}
      className="w-full flex-grow bg-dark-card border border-gray-600 text-dark-text placeholder-dark-subtext text-lg rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-300 px-4 py-3 shadow-sm"
    />
  );
};
