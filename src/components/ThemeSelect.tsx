import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

interface ThemeSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
  icon: React.ElementType;
}

export default function ThemeSelect({ value, onChange, options, placeholder, icon: Icon }: ThemeSelectProps) {
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

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative group w-full" ref={dropdownRef}>
      <Icon className={`absolute left-5 md:left-6 top-1/2 -translate-y-1/2 transition-colors md:w-5 md:h-5 z-10 ${isOpen ? 'text-red-600' : value ? 'text-neutral-900' : 'text-neutral-400 group-hover:text-red-600'}`} size={18} />
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white border ${isOpen ? 'border-red-600 ring-4 ring-red-600/10' : value ? 'border-neutral-300' : 'border-neutral-200'} rounded-2xl py-4 md:py-5 pl-14 md:pl-16 pr-12 font-bold text-sm uppercase tracking-widest ${value ? 'text-neutral-900' : 'text-neutral-400'} transition-all cursor-pointer shadow-sm hover:border-red-300 flex items-center select-none`}
      >
        {selectedOption ? selectedOption.label : placeholder}
      </div>
      
      <ChevronDown className={`absolute right-5 md:right-6 top-1/2 -translate-y-1/2 pointer-events-none md:w-5 md:h-5 z-10 transition-transform duration-300 ${isOpen ? 'rotate-180 text-red-600' : 'text-neutral-400'}`} size={18} />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white border border-neutral-100 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden"
          >
            <div className="max-h-60 overflow-y-auto py-2 custom-scrollbar">
              {options.map((option) => (
                <div
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`px-5 py-3 md:py-4 text-sm font-bold uppercase tracking-widest cursor-pointer transition-colors flex items-center justify-between ${
                    value === option.value 
                      ? 'bg-red-50 text-red-600' 
                      : 'text-neutral-600 hover:bg-yellow-50 hover:text-yellow-600'
                  }`}
                >
                  {option.label}
                  {value === option.value && (
                    <div className="w-2 h-2 rounded-full bg-red-600" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
