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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import api from '../lib/api';

interface AddNodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    location: { lat: number; lng: number } | null;
    onSuccess: () => void;
}

const NODE_TYPES = ['Tank', 'Pump', 'ShutoffValve', 'Junction'];
const STATUSES = ['Active', 'Inactive', 'Maintenance'];

export default function AddNodeModal({ isOpen, onClose, location, onSuccess }: AddNodeModalProps) {
    const [type, setType] = useState('Tank');
    const [status, setStatus] = useState('Active');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!location) return;

        setIsSubmitting(true);
        try {
            await api.post('/maps/nodes', {
                type,
                status,
                latitude: location.lat,
                longitude: location.lng
            });
            toast.success('Node added successfully');
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Failed to add node');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Network Node</DialogTitle>
                    <DialogDescription>
                        Create a new node at {location ? `(${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})` : 'selected location'}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Node Type</label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {NODE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Initial Status</label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !location}>
                        {isSubmitting ? 'Adding...' : 'Add Node'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
