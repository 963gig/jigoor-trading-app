
import React from 'react';
import { GroundingSource } from '../types';

interface SourceLinkProps {
    source: GroundingSource;
}

export const SourceLink: React.FC<SourceLinkProps> = ({ source }) => {
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${new URL(source.uri).hostname}&sz=32`;

    return (
        <a 
            href={source.uri} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-3 p-3 bg-white/50 hover:bg-white/80 backdrop-blur-sm rounded-lg transition-colors duration-200 group border border-gray-300"
        >
            <img src={faviconUrl} alt="favicon" className="h-6 w-6 rounded-full flex-shrink-0" />
            <span className="text-sm text-brand-subtext group-hover:text-brand-primary truncate" title={source.title}>
                {source.title}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 group-hover:text-brand-dark ml-auto transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
        </a>
    );
};