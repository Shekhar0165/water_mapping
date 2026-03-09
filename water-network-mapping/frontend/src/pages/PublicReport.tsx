import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Droplets, MapPin, Camera, CheckCircle2 } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import MapSearchControl from '../components/MapSearchControl';

// Fix for default marker icons in Leaflet with webpack/vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapEventsInterceptor({ setLocation }: { setLocation: any }) {
    useMapEvents({
        click(e) {
            setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });
    return null;
}

function LocationPickerMap({
    location,
    setLocation,
    nodes,
    pipes,
    selectedPipeId,
    setSelectedPipeId
}: {
    location: any,
    setLocation: any,
    nodes: any[],
    pipes: any[],
    selectedPipeId: string | null,
    setSelectedPipeId: any
}) {
    return (
        <div style={{ height: '400px', width: '100%', borderRadius: '0.5rem', overflow: 'hidden', position: 'relative', zIndex: 0, border: '1px solid #e2e8f0' }}>
            <MapContainer center={location ? [location.lat, location.lng] : [20.5937, 78.9629]} zoom={location ? 15 : 4} style={{ height: '100%', width: '100%' }}>
                <MapSearchControl />
                <MapEventsInterceptor setLocation={setLocation} />
                <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {location && (
                    <Marker position={[location.lat, location.lng]} />
                )}

                {/* Render Public Pipes */}
                {pipes.map((pipe) => {
                    const startCoords = pipe.start_node?.geometry?.coordinates;
                    const endCoords = pipe.end_node?.geometry?.coordinates;
                    if (!startCoords || !endCoords) return null;

                    const positions: [number, number][] = [
                        [startCoords[1], startCoords[0]],
                        [endCoords[1], endCoords[0]]
                    ];

                    const isSelected = selectedPipeId === pipe.id;
                    const color = isSelected ? '#ef4444' : (pipe.status === 'Active' ? '#3b82f6' : '#fbbf24');
                    const weight = isSelected ? 8 : 5;

                    return (
                        <Polyline
                            key={`pipe-${pipe.id}`}
                            positions={positions}
                            color={color}
                            weight={weight}
                            opacity={isSelected ? 1 : 0.6}
                            eventHandlers={{
                                click: (e) => {
                                    L.DomEvent.stopPropagation(e); // Prevent map click from moving the location pin
                                    setSelectedPipeId(pipe.id);
                                    toast.info(`Selected Pipe #${pipe.id.substring(0, 8)}`, { position: 'top-center' });
                                }
                            }}
                            className="cursor-pointer transition-all"
                        >
                            {isSelected && (
                                <Popup>
                                    <div className="text-center font-semibold text-red-600">Affected Pipe Selected!</div>
                                </Popup>
                            )}
                        </Polyline>
                    );
                })}

                {/* Render Public Nodes */}
                {nodes.map((node) => {
                    const coords = node.geometry?.coordinates;
                    if (!coords) return null;
                    return (
                        <Marker
                            key={`node-${node.id}`}
                            position={[coords[1], coords[0]]}
                            opacity={0.5}
                        />
                    );
                })}

            </MapContainer>
        </div>
    );
}

export default function PublicReport() {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isLocating, setIsLocating] = useState(false);

    // Form state
    const [type, setType] = useState('Leak');
    const [description, setDescription] = useState('');
    const [reporterEmail, setReporterEmail] = useState('');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);

    // Network Data state
    const [nodes, setNodes] = useState<any[]>([]);
    const [pipes, setPipes] = useState<any[]>([]);
    const [selectedPipeId, setSelectedPipeId] = useState<string | null>(null);

    // Fetch public infrastructure explicitly
    useEffect(() => {
        const fetchPublicData = async () => {
            try {
                const [nodesRes, pipesRes] = await Promise.all([
                    api.get('/public-maps/nodes'),
                    api.get('/public-maps/pipes')
                ]);
                setNodes(nodesRes.data);
                setPipes(pipesRes.data);
            } catch (err) {
                console.error("Failed to load public infrastructure data", err);
            }
        };
        fetchPublicData();
    }, []);

    const handleGetLocation = () => {
        setIsLocating(true);
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            setIsLocating(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setIsLocating(false);
                toast.success("Location captured!");
            },
            () => {
                toast.error("Unable to retrieve your location");
                setIsLocating(false);
            }
        );
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMediaFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setMediaPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!location && !selectedPipeId) {
            toast.error("Please provide your location or select a pipe");
            return;
        }

        // Make sure we have a location explicitly set, even if they just clicked a pipe.
        // If they clicked a pipe but didn't click the map, try to center it around the pipe logically.
        let finalLocation = location;
        if (!finalLocation && selectedPipeId) {
            const pipe = pipes.find(p => p.id === selectedPipeId);
            if (pipe?.start_node?.geometry?.coordinates) {
                finalLocation = { lat: pipe.start_node.geometry.coordinates[1], lng: pipe.start_node.geometry.coordinates[0] };
            }
        }

        setIsLoading(true);
        try {
            let mediaUrl = '';

            // 1. If there's a file, get presigned URL and upload to S3
            if (mediaFile) {
                try {
                    const { data: s3Data } = await api.post('/s3/presigned-url', {
                        fileName: mediaFile.name,
                        contentType: mediaFile.type
                    });

                    // Upload directly to S3
                    await axios.put(s3Data.uploadUrl, mediaFile, {
                        headers: { 'Content-Type': mediaFile.type }
                    });

                    mediaUrl = s3Data.fileKey;
                } catch (s3Error) {
                    console.error("S3 Upload Error. Proceeding without media:", s3Error);
                    toast.warning("Photo upload failed (check AWS credentials). Saving report without photo.", { position: 'top-center' });
                    mediaUrl = ''; // Default to no media so the report can still save!
                }
            }

            // 2. Submit the complaint to our backend
            await api.post('/complaints/public-report', {
                type,
                description,
                latitude: finalLocation?.lat || 0,
                longitude: finalLocation?.lng || 0,
                media_url: mediaUrl,
                nearest_pipe_id: selectedPipeId,
                reporter_email: reporterEmail,
            });

            setStep(2); // Success step
        } catch (error) {
            console.error("Submission error", error);
            toast.error("Failed to submit report. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (step === 2) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md text-center p-8 border-none shadow-xl">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl mb-2">Report Received!</CardTitle>
                    <CardDescription className="text-lg">
                        Thank you for helping keep our city's water safe. A field worker will be dispatched shortly.
                    </CardDescription>
                    <div className="mt-8">
                        <Button onClick={() => window.location.reload()} variant="outline" className="w-full py-6 text-lg">
                            Report Another Issue
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 py-12 px-4">
            <div className="max-w-xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <Droplets className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h1 className="text-3xl font-extrabold text-slate-900">City Water Portal</h1>
                    <p className="text-slate-500">Report leaks or water issues directly to city engineers.</p>
                </div>

                <Card className="border-none shadow-xl">
                    <CardHeader>
                        <CardTitle>Submit a Leak Report</CardTitle>
                        <CardDescription>All reports are routed directly to our 24/7 command center.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Issue Type */}
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-slate-700">Type of Issue</label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger className="h-12 text-lg">
                                    <SelectValue placeholder="What is the problem?" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Leak">💧 Major Water Leak</SelectItem>
                                    <SelectItem value="NoWater">🚫 No Water Supply</SelectItem>
                                    <SelectItem value="LowPressure">📉 Low Water Pressure</SelectItem>
                                    <SelectItem value="Contamination">⚠️ Contamination / Bad Smell</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Reporter Email */}
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-slate-700">Your Email Address</label>
                            <Input
                                type="email"
                                placeholder="citizen@example.com"
                                className="h-12 text-lg"
                                value={reporterEmail}
                                onChange={e => setReporterEmail(e.target.value)}
                                required
                            />
                            <p className="text-xs text-slate-500">We will notify you when your report is resolved.</p>
                        </div>

                        {/* Location Picker */}
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-slate-700 flex justify-between">
                                <span>Where is the problem?</span>
                                {location && <span className="text-green-600 flex items-center text-xs"><CheckCircle2 className="w-3 h-3 mr-1" /> Location set</span>}
                            </label>

                            <p className="text-xs text-slate-500 mb-2">Click on the map to place a pin, or use GPS.</p>

                            <LocationPickerMap
                                location={location}
                                setLocation={setLocation}
                                nodes={nodes}
                                pipes={pipes}
                                selectedPipeId={selectedPipeId}
                                setSelectedPipeId={setSelectedPipeId}
                            />

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full mt-2"
                                onClick={handleGetLocation}
                                disabled={isLocating}
                            >
                                <MapPin className="w-4 h-4 mr-2" />
                                {isLocating ? 'Detecting via GPS...' : 'Use Current GPS Location'}
                            </Button>
                        </div>

                        {/* Photo Evidence */}
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-slate-700">Upload Photo (Optional)</label>
                            {!mediaPreview ? (
                                <div
                                    onClick={() => document.getElementById('cameraInput')?.click()}
                                    className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:bg-slate-50 cursor-pointer transition-colors"
                                >
                                    <Camera className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                                    <p className="text-slate-500 font-medium">Capture or Upload Image</p>
                                    <input
                                        type="file"
                                        id="cameraInput"
                                        className="hidden"
                                        accept="image/*"
                                        capture="environment"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            ) : (
                                <div className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-50">
                                    <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        className="absolute top-2 right-2"
                                        onClick={() => { setMediaPreview(null); setMediaFile(null); }}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-slate-700">Short Description</label>
                            <Textarea
                                placeholder="Describe the severity or any landmarks nearby..."
                                className="min-h-[100px] text-lg py-3"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full py-8 text-xl font-bold bg-primary hover:bg-primary/90 shadow-lg"
                            disabled={isLoading || !location || !reporterEmail}
                            onClick={handleSubmit}
                        >
                            {isLoading ? 'Submitting...' : 'Report Issue Now'}
                        </Button>
                    </CardFooter>
                </Card>

                <div className="text-center">
                    <p className="text-slate-400 text-sm italic">Created by WaterNet Intelligent Systems Team</p>
                </div>
            </div>
        </div>
    );
}
