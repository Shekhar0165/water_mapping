import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { MapPin } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import CitySearchInput from './CitySearchInput';

interface AdminComplaintModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const COMPLAINT_TYPES = [
    { value: 'Leak', label: 'Water Leak' },
    { value: 'NoWater', label: 'No Water' },
    { value: 'LowPressure', label: 'Low Pressure' },
    { value: 'Contamination', label: 'Contamination' }
];

export default function AdminComplaintModal({ isOpen, onClose, onSuccess }: AdminComplaintModalProps) {
    const { user } = useAuthStore();
    const [type, setType] = useState('Leak');
    const [description, setDescription] = useState('');
    const [cityId, setCityId] = useState('');
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isSuperAdmin = user?.role === 'super_admin';

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
                toast.error("Unable to retrieve location");
                setIsLocating(false);
            }
        );
    };

    const handleSubmit = async () => {
        if (!location) {
            toast.error("Location is required");
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post('/complaints', {
                type,
                description,
                latitude: location.lat,
                longitude: location.lng,
                cityId: cityId || undefined,
            });
            toast.success('Complaint logged successfully');
            onSuccess();
            onClose();
            // Reset state for next open
            setDescription('');
            setLocation(null);
            setType('Leak');
            setCityId('');
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to log complaint');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Log Admin Complaint</DialogTitle>
                    <DialogDescription>
                        Manually report an issue into the network tracker.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Issue Type</label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {COMPLAINT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* City selector: shown for super_admin who has no cityId */}
                    {isSuperAdmin && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">City <span className="text-red-500">*</span></label>
                            <CitySearchInput value={cityId} onChange={setCityId} required />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Location</label>
                        <Button
                            type="button"
                            variant={location ? "secondary" : "outline"}
                            className="w-full justify-start"
                            onClick={handleGetLocation}
                            disabled={isLocating}
                        >
                            <MapPin className="w-4 h-4 mr-2" />
                            {isLocating ? 'Detecting...' : location ? `Using GPS (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})` : 'Use GPS Location'}
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                            placeholder="Details about the issue (optional)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !location || (isSuperAdmin && !cityId)}>
                        {isSubmitting ? 'Logging...' : 'Submit Report'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
