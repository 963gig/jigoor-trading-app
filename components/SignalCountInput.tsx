
import React from 'react';

interface SignalCountInputProps {
  value: number;
  onChange: (value: number) => void;
}

export const SignalCountInput: React.FC<SignalCountInputProps> = ({ value, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let num = parseInt(e.target.value, 10);
    if (isNaN(num)) {
        num = 1; // Or handle as you see fit
    }
    if (num < 1) num = 1;
    if (num > 10) num = 10;
    onChange(num);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="signal-count" className="font-semibold text-dark-subtext text-sm">
        Signals:
      </label>
      <input
        id="signal-count"
        type="number"
        value={value}
        onChange={handleChange}
        min="1"
        max="10"
        className="w-16 bg-dark-card border border-gray-600 text-dark-text rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-300 px-2 py-1 text-center"
        aria-label="Number of signals to fetch"
      />
    </div>
  );
};
