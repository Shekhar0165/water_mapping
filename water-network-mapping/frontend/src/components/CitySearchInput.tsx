import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { searchCities, getCityById, type City } from '../data/indianCities';

interface CitySearchInputProps {
    value: string;
    onChange: (cityId: string) => void;
    required?: boolean;
}

function highlightMatch(text: string, query: string) {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
        <>
            {text.slice(0, idx)}
            <span className="bg-yellow-200 dark:bg-yellow-800 rounded-sm">{text.slice(idx, idx + query.length)}</span>
            {text.slice(idx + query.length)}
        </>
    );
}

export default function CitySearchInput({ value, onChange, required }: CitySearchInputProps) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<City[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const [activeIndex, setActiveIndex] = useState(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Sync display when value prop changes externally (e.g. form reset)
    useEffect(() => {
        if (value) {
            const city = getCityById(value);
            if (city) {
                setSelectedCity(city);
                setQuery(`${city.name}, ${city.state}`);
            }
        } else {
            setSelectedCity(null);
            setQuery('');
        }
    }, [value]);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setActiveIndex(-1);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        setSelectedCity(null);
        setActiveIndex(-1);
        onChange('');

        if (val.length >= 1) {
            const results = searchCities(val);
            setSuggestions(results);
            setIsOpen(results.length > 0);
        } else {
            setSuggestions([]);
            setIsOpen(false);
        }
    };

    const handleSelect = (city: City) => {
        setSelectedCity(city);
        setQuery(`${city.name}, ${city.state}`);
        onChange(city.id);
        setIsOpen(false);
        setActiveIndex(-1);
    };

    const handleClear = () => {
        setSelectedCity(null);
        setQuery('');
        onChange('');
        setSuggestions([]);
        setIsOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen || suggestions.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault();
            handleSelect(suggestions[activeIndex]);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            setActiveIndex(-1);
        }
    };

    // Scroll active item into view
    useEffect(() => {
        if (activeIndex >= 0 && listRef.current) {
            const items = listRef.current.querySelectorAll('[data-city-item]');
            items[activeIndex]?.scrollIntoView({ block: 'nearest' });
        }
    }, [activeIndex]);

    return (
        <div ref={wrapperRef} className="relative">
            <div className="relative">
                <Input
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => {
                        if (suggestions.length > 0 && !selectedCity) setIsOpen(true);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Search city... e.g. Saharanpur"
                    required={required}
                    className={`pr-20 ${selectedCity ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20' : ''}`}
                />
                {selectedCity ? (
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <span className="text-[10px] font-mono font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-1.5 py-0.5 rounded">
                            {selectedCity.id}
                        </span>
                        <button
                            type="button"
                            onClick={handleClear}
                            className="w-5 h-5 flex items-center justify-center rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors text-xs"
                        >
                            x
                        </button>
                    </div>
                ) : query.length > 0 ? (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors text-xs"
                    >
                        x
                    </button>
                ) : null}
            </div>

            {isOpen && (
                <div
                    ref={listRef}
                    className="absolute mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-64 overflow-y-auto overflow-x-hidden"
                    style={{ scrollbarWidth: 'thin', zIndex: 9999, minWidth: '360px', width: 'max-content', left: 0 }}
                >
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                            {suggestions.length} {suggestions.length === 1 ? 'city' : 'cities'} found
                        </p>
                    </div>
                    {suggestions.map((city, index) => (
                        <button
                            key={city.id}
                            type="button"
                            data-city-item
                            className={`w-full px-3 py-2.5 text-left flex items-center gap-3 transition-colors border-b border-slate-50 dark:border-slate-800/50 last:border-b-0 ${
                                index === activeIndex
                                    ? 'bg-primary/10 dark:bg-primary/20'
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                            }`}
                            onClick={() => handleSelect(city)}
                            onMouseEnter={() => setActiveIndex(index)}
                        >
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                    {city.name.charAt(0)}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                                    {highlightMatch(city.name, query)}
                                </p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                                    {highlightMatch(city.state, query)}
                                </p>
                            </div>
                            <span className="font-mono text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 dark:text-slate-500 px-1.5 py-0.5 rounded flex-shrink-0">
                                {city.id}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
