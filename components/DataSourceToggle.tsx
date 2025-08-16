
import React from 'react';

type DataSource = 'gemini' | 'api';

interface DataSourceToggleProps {
  dataSource: DataSource;
  setDataSource: (source: DataSource) => void;
}

export const DataSourceToggle: React.FC<DataSourceToggleProps> = ({ dataSource, setDataSource }) => {
  const isGemini = dataSource === 'gemini';

  const toggleClasses = `w-14 h-8 flex items-center bg-gray-700 rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out`;
  const switchClasses = `bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${isGemini ? 'translate-x-0' : 'translate-x-6'}`;

  return (
    <div className="flex items-center justify-center gap-4">
      <span className={`font-semibold transition-colors ${isGemini ? 'text-white' : 'text-gray-400'}`}>
        Gemini AI
      </span>
      <div className={toggleClasses} onClick={() => setDataSource(isGemini ? 'api' : 'gemini')}>
        <div className={switchClasses}></div>
      </div>
      <span className={`font-semibold transition-colors ${!isGemini ? 'text-white' : 'text-gray-400'}`}>
        External API
      </span>
    </div>
  );
};
