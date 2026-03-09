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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import api from '../lib/api';

interface AddPipeModalProps {
    isOpen: boolean;
    onClose: () => void;
    startNode: any | null;
    endNode: any | null;
    onSuccess: () => void;
}

const MATERIALS = ['PVC', 'CastIron', 'Concrete'];

export default function AddPipeModal({ isOpen, onClose, startNode, endNode, onSuccess }: AddPipeModalProps) {
    const [material, setMaterial] = useState('PVC');
    const [diameter, setDiameter] = useState('');
    const [status, setStatus] = useState('Active');
    const [maintenanceStart, setMaintenanceStart] = useState('');
    const [maintenanceEnd, setMaintenanceEnd] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!startNode || !endNode) return;
        const width = parseInt(diameter, 10);
        if (!diameter || isNaN(width) || width <= 0) {
            toast.error('Please enter a valid positive diameter');
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post('/maps/pipes', {
                start_node_id: startNode.id,
                end_node_id: endNode.id,
                material,
                diameter_mm: width,
                status,
                maintenance_start_time: status === 'Maintenance' && maintenanceStart ? new Date(maintenanceStart).toISOString() : null,
                maintenance_end_time: status === 'Maintenance' && maintenanceEnd ? new Date(maintenanceEnd).toISOString() : null,
            });
            toast.success('Pipe connected successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to add pipe');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Connect Pipe</DialogTitle>
                    <DialogDescription>
                        Create a new pipe connection between the two selected nodes.
                    </DialogDescription>
                </DialogHeader>
                {startNode && endNode && (
                    <div className="bg-slate-100 p-3 rounded-md text-sm mb-2 text-slate-700">
                        <div className="font-semibold mb-1">Connecting:</div>
                        <div>Start: {startNode.type} (#{startNode.id.substring(0, 8)})</div>
                        <div>End: {endNode.type} (#{endNode.id.substring(0, 8)})</div>
                    </div>
                )}
                <div className="grid gap-4 py-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Material</label>
                        <Select value={material} onValueChange={setMaterial}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {MATERIALS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Diameter (mm)</label>
                        <Input
                            type="number"
                            placeholder="e.g. 200"
                            value={diameter}
                            onChange={(e) => setDiameter(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Initial Status</label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Maintenance">Maintenance</SelectItem>
                                <SelectItem value="Closed">Closed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {status === 'Maintenance' && (
                        <div className="grid grid-cols-2 gap-4 border border-orange-200 bg-orange-50 p-3 rounded-md">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-orange-800">Maint. Start</label>
                                <Input
                                    type="datetime-local"
                                    className="h-8 text-xs"
                                    value={maintenanceStart}
                                    onChange={(e) => setMaintenanceStart(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-orange-800">Maint. End</label>
                                <Input
                                    type="datetime-local"
                                    className="h-8 text-xs"
                                    value={maintenanceEnd}
                                    onChange={(e) => setMaintenanceEnd(e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !startNode || !endNode}>
                        {isSubmitting ? 'Connecting...' : 'Connect Pipe'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
