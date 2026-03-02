import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Droplets, MapPin, Camera, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';
import axios from 'axios';

export default function PublicReport() {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isLocating, setIsLocating] = useState(false);

    // Form state
    const [type, setType] = useState('Leak');
    const [description, setDescription] = useState('');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);

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
        if (!location) {
            toast.error("Please provide your location");
            return;
        }

        setIsLoading(true);
        try {
            let mediaUrl = '';

            // 1. If there's a file, get presigned URL and upload to S3
            if (mediaFile) {
                const { data: s3Data } = await api.post('/s3/presigned-url', {
                    fileName: mediaFile.name,
                    contentType: mediaFile.type
                });

                // Upload directly to S3
                await axios.put(s3Data.uploadUrl, mediaFile, {
                    headers: { 'Content-Type': mediaFile.type }
                });

                mediaUrl = s3Data.fileKey;
            }

            // 2. Submit the complaint to our backend
            await api.post('/complaints/public-report', {
                type,
                description,
                latitude: location.lat,
                longitude: location.lng,
                media_url: mediaUrl
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

                        {/* Location Picker */}
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-slate-700">Where is the problem?</label>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant={location ? "secondary" : "default"}
                                    className="flex-1 h-12 text-lg"
                                    onClick={handleGetLocation}
                                    disabled={isLocating}
                                >
                                    <MapPin className="w-5 h-5 mr-2" />
                                    {isLocating ? 'Detecting...' : location ? 'Location Captured' : 'Use Current GPS'}
                                </Button>
                                {location && (
                                    <div className="bg-green-100 rounded-md flex items-center justify-center p-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                    </div>
                                )}
                            </div>
                            {!location && (
                                <p className="text-xs text-slate-500 flex items-center">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Your location is required for engineers to find the leak.
                                </p>
                            )}
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
                            disabled={isLoading || !location}
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
