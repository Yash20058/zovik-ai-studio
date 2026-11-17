import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Globe, Check, ChevronDown } from 'lucide-react';

interface LanguageSelectorProps {
  compact?: boolean;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ compact = false, className = '' }) => {
  const { language, setLanguage, currentLanguage, supportedLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/40 text-sm text-gray-200 transition-all duration-200 backdrop-blur-md"
        title="Select Language"
      >
        <span className="text-base">{currentLanguage.flag}</span>
        {!compact && <span className="font-medium text-xs sm:text-sm">{currentLanguage.native}</span>}
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 max-h-80 overflow-y-auto rounded-xl bg-gray-900/95 border border-purple-500/30 shadow-2xl backdrop-blur-xl z-50 p-1.5 scrollbar-thin scrollbar-thumb-purple-600/40">
          <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-purple-400 uppercase border-b border-white/5 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            Language / Idioma / भाषा
          </div>
          <div className="py-1">
            {supportedLanguages.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                    isSelected
                      ? 'bg-purple-600/30 text-white font-semibold border border-purple-500/40'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{lang.flag}</span>
                    <div className="text-left">
                      <div className="font-medium">{lang.native}</div>
                      <div className="text-[10px] text-gray-400">{lang.label}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
