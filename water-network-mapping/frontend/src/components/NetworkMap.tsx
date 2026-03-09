import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MousePointer2, MapPinPlus, Spline } from 'lucide-react';
import api from '../lib/api';
import AddNodeModal from './AddNodeModal';
import AddPipeModal from './AddPipeModal';
import MapSearchControl from './MapSearchControl';

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

type MapMode = 'VIEW' | 'ADD_NODE' | 'ADD_PIPE';

export default function NetworkMap() {
    const [nodes, setNodes] = useState<any[]>([]);
    const [pipes, setPipes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Interactive modes state
    const [mode, setMode] = useState<MapMode>('VIEW');
    const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
    const [clickLocation, setClickLocation] = useState<{ lat: number, lng: number } | null>(null);

    const [isPipeModalOpen, setIsPipeModalOpen] = useState(false);
    const [selectedNodes, setSelectedNodes] = useState<any[]>([]);

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

    useEffect(() => {
        fetchNetworkData();
    }, []);

    // Handle map clicks (for adding nodes)
    function MapClickInterceptor() {
        useMapEvents({
            click(e) {
                if (mode === 'ADD_NODE') {
                    setClickLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
                    setIsNodeModalOpen(true);
                }
            }
        });
        return null;
    }

    // Handle node clicks (for adding pipes)
    const handleNodeClick = (node: any) => {
        if (mode === 'ADD_PIPE') {
            const newSelected = [...selectedNodes];
            const alreadySelectedIndex = newSelected.findIndex(n => n.id === node.id);

            if (alreadySelectedIndex !== -1) {
                newSelected.splice(alreadySelectedIndex, 1);
                setSelectedNodes(newSelected);
            } else {
                newSelected.push(node);
                setSelectedNodes(newSelected);

                if (newSelected.length === 2) {
                    setIsPipeModalOpen(true);
                }
            }
        }
    };


    // New Delhi, India as absolute fallback
    const defaultCenter: [number, number] = [28.6139, 77.2090];

    return (
        <div className="w-full h-full relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm z-0">
            {/* Floating Toolbar */}
            <div className="absolute top-4 right-4 z-[1000] bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 p-1 flex flex-col gap-1">
                <button
                    onClick={() => { setMode('VIEW'); setSelectedNodes([]); }}
                    className={`p-2 rounded-md transition-colors ${mode === 'VIEW' ? 'bg-primary text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                    title="View Mode"
                >
                    <MousePointer2 className="w-5 h-5" />
                </button>
                <button
                    onClick={() => { setMode('ADD_NODE'); setSelectedNodes([]); }}
                    className={`p-2 rounded-md transition-colors ${mode === 'ADD_NODE' ? 'bg-primary text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                    title="Add Node Mode (Click Map)"
                >
                    <MapPinPlus className="w-5 h-5" />
                </button>
                <button
                    onClick={() => { setMode('ADD_PIPE'); setSelectedNodes([]); }}
                    className={`p-2 rounded-md transition-colors ${mode === 'ADD_PIPE' ? 'bg-primary text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                    title="Add Pipe Mode (Select 2 Nodes)"
                >
                    <Spline className="w-5 h-5" />
                </button>
            </div>

            {/* Mode Indicator Banner */}
            {mode !== 'VIEW' && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg font-medium text-sm animate-in fade-in slide-in-from-top-4">
                    {mode === 'ADD_NODE' && "Mode: Add Node - Click anywhere on the map"}
                    {mode === 'ADD_PIPE' && `Mode: Add Pipe - Select two nodes (${selectedNodes.length}/2 selected)`}
                </div>
            )}

            {isLoading && (
                <div className="absolute inset-0 bg-slate-100/50 dark:bg-slate-900/50 z-[1001] flex items-center justify-center backdrop-blur-sm">
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
                className={mode !== 'VIEW' ? 'cursor-crosshair' : ''}
            >
                <MapSearchControl />
                <MapClickInterceptor />
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
                                    {pipe.status === 'Maintenance' && pipe.maintenance_start_time && (
                                        <div className="mt-1 pt-1 border-t border-slate-200">
                                            <p className="text-xs text-orange-600 font-medium">Under Maintenance</p>
                                            <p className="text-[10px] text-slate-500">From: {new Date(pipe.maintenance_start_time).toLocaleString()}</p>
                                            {pipe.maintenance_end_time && (
                                                <p className="text-[10px] text-slate-500">To: {new Date(pipe.maintenance_end_time).toLocaleString()}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </Popup>
                        </Polyline>
                    );
                })}

                {/* Render Nodes (Points) */}
                {nodes.map((node) => {
                    const coords = node.geometry?.coordinates;
                    if (!coords) return null;

                    const position: [number, number] = [coords[1], coords[0]];
                    const isSelected = mode === 'ADD_PIPE' && (selectedNodes[0]?.id === node.id || selectedNodes[1]?.id === node.id);

                    // A simple visual indicator for selected nodes using opacity or custom icon style if we had one.
                    // For now, we update opacity and zIndexOffset to make them pop.
                    const opacity = mode === 'ADD_PIPE' ? (isSelected ? 1 : 0.4) : 1;

                    return (
                        <Marker
                            key={`node-${node.id}`}
                            position={position}
                            opacity={opacity}
                            zIndexOffset={isSelected ? 1000 : 0}
                            eventHandlers={{
                                click: () => handleNodeClick(node)
                            }}
                        >
                            {/* We only show popups in VIEW mode so they don't get in the way of adding pipes */}
                            {mode === 'VIEW' && (
                                <Popup>
                                    <div className="p-1">
                                        <h3 className="font-bold text-sm mb-1">{node.type}</h3>
                                        <p className="text-xs text-slate-600">ID: {node.id}</p>
                                        <p className="text-xs text-slate-600">Status: <span className="font-semibold text-slate-900">{node.status}</span></p>
                                    </div>
                                </Popup>
                            )}
                        </Marker>
                    );
                })}
            </MapContainer>

            {/* Modals */}
            <AddNodeModal
                isOpen={isNodeModalOpen}
                onClose={() => {
                    setIsNodeModalOpen(false);
                    setClickLocation(null);
                    setMode('VIEW');
                }}
                location={clickLocation}
                onSuccess={fetchNetworkData}
            />

            <AddPipeModal
                isOpen={isPipeModalOpen}
                onClose={() => {
                    setIsPipeModalOpen(false);
                    setSelectedNodes([]);
                    setMode('VIEW');
                }}
                startNode={selectedNodes[0]}
                endNode={selectedNodes[1]}
                onSuccess={fetchNetworkData}
            />
        </div>
    );
}
