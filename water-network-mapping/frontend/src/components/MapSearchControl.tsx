import { useState } from 'react';
import { useMap } from 'react-leaflet';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function MapSearchControl() {
    const map = useMap();
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        try {
            // Use Nominatim API for OpenStreetMap geocoding
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
                {
                    headers: {
                        'Accept-Language': 'en'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            if (data && data.length > 0) {
                const { lat, lon, display_name } = data[0];
                const latitude = parseFloat(lat);
                const longitude = parseFloat(lon);

                // Fly the map to the searched location
                map.flyTo([latitude, longitude], 13, {
                    duration: 1.5
                });

                toast.success(`Found: ${display_name.split(',')[0]}`, { position: 'top-center' });
            } else {
                toast.error('Location not found. Try a different city name.', { position: 'top-center' });
            }
        } catch (error) {
            console.error('Geosearch error:', error);
            toast.error('Search failed. Please try again.', { position: 'top-center' });
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
            <form
                onSubmit={handleSearch}
                className="flex items-center bg-white dark:bg-slate-900 rounded-full shadow-lg border border-slate-200 dark:border-slate-800 p-1 w-full max-w-sm transition-all focus-within:shadow-xl focus-within:ring-2 focus-within:ring-primary/20"
            >
                <div className="pl-3 pr-2 text-slate-400">
                    <Search className="w-5 h-5" />
                </div>
                <Input
                    type="text"
                    placeholder="Search city, e.g. Delhi"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 border-none shadow-none focus-visible:ring-0 px-0 h-10 w-64 bg-transparent outline-none"
                    disabled={isSearching}
                />
                <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    className="rounded-full mr-1 w-9 h-9"
                    disabled={isSearching || !query.trim()}
                >
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Search className="w-4 h-4 text-slate-600" />}
                </Button>
            </form>
        </div>
    );
}
