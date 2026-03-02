import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../lib/api';

// Fix for default marker icons in Leaflet with webpack/vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// A custom component to automatically fit the map to the bounds of the pipes
function AutoBounds({ pipes }: { pipes: any[] }) {
    const map = useMap();

    useEffect(() => {
        if (pipes.length > 0) {
            const bounds = L.latLngBounds([]);
            pipes.forEach(pipe => {
                if (pipe.start_node?.geometry?.coordinates) {
                    bounds.extend([pipe.start_node.geometry.coordinates[1], pipe.start_node.geometry.coordinates[0]]);
                }
                if (pipe.end_node?.geometry?.coordinates) {
                    bounds.extend([pipe.end_node.geometry.coordinates[1], pipe.end_node.geometry.coordinates[0]]);
                }
            });
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        }
    }, [pipes, map]);

    return null;
}

export default function NetworkMap() {
    const [nodes, setNodes] = useState<any[]>([]);
    const [pipes, setPipes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNetworkData = async () => {
            try {
                // Fetch pipes and nodes from the NestJS backend
                const [nodesRes, pipesRes] = await Promise.all([
                    api.get('/maps/nodes'),
                    api.get('/maps/pipes')
                ]);

                setNodes(nodesRes.data);
                setPipes(pipesRes.data);
            } catch (error) {
                console.error("Failed to fetch map data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNetworkData();
    }, []);

    // New Delhi, India as absolute fallback
    const defaultCenter: [number, number] = [28.6139, 77.2090];

    return (
        <div className="w-full h-full relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm z-0">
            {isLoading && (
                <div className="absolute inset-0 bg-slate-100/50 dark:bg-slate-900/50 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-600 dark:text-slate-300 font-medium tracking-wide animate-pulse">Scanning Network Infrastructure...</p>
                    </div>
                </div>
            )}

            <MapContainer
                center={defaultCenter}
                zoom={13}
                style={{ height: '100%', width: '100%', zIndex: 0 }}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                {/* Dynamically adjust view to fit pipes if available */}
                <AutoBounds pipes={pipes} />

                {/* Render Pipes (Linestrings) */}
                {pipes.map((pipe) => {
                    const startCoords = pipe.start_node?.geometry?.coordinates;
                    const endCoords = pipe.end_node?.geometry?.coordinates;

                    if (!startCoords || !endCoords) return null;

                    // PostGIS stores as [longitude, latitude], Leaflet expects [latitude, longitude]
                    const positions: [number, number][] = [
                        [startCoords[1], startCoords[0]],
                        [endCoords[1], endCoords[0]]
                    ];

                    const color = pipe.status === 'Active' ? '#2563eb' : (pipe.status === 'Maintenance' ? '#fbbf24' : '#dc2626');

                    return (
                        <Polyline
                            key={`pipe-${pipe.id}`}
                            positions={positions}
                            color={color}
                            weight={6}
                            opacity={0.8}
                        >
                            <Popup>
                                <div className="p-1">
                                    <h3 className="font-bold text-sm mb-1">{pipe.id}</h3>
                                    <p className="text-xs text-slate-600">Material: <span className="font-semibold text-slate-900">{pipe.material}</span></p>
                                    <p className="text-xs text-slate-600">Diameter: <span className="font-semibold text-slate-900">{pipe.diameter_mm}mm</span></p>
                                    <p className="text-xs text-slate-600">Status: <span className="font-semibold text-slate-900">{pipe.status}</span></p>
                                </div>
                            </Popup>
                        </Polyline>
                    );
                })}

                {/* Render Nodes (Points) */}
                {nodes.map((node) => {
                    const coords = node.geometry?.coordinates;
                    if (!coords) return null;

                    // [longitude, latitude] -> [latitude, longitude]
                    const position: [number, number] = [coords[1], coords[0]];

                    return (
                        <Marker key={`node-${node.id}`} position={position}>
                            <Popup>
                                <div className="p-1">
                                    <h3 className="font-bold text-sm mb-1">{node.type}</h3>
                                    <p className="text-xs text-slate-600">ID: {node.id}</p>
                                    <p className="text-xs text-slate-600">Status: <span className="font-semibold text-slate-900">{node.status}</span></p>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
