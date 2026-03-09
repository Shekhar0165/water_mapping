import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import api from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';

interface ComplaintDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    complaintId: string | null;
    onUpdate: () => void;
}

function formatDuration(startDate: string | null, endDate: string | null): string {
    if (!startDate || !endDate) return 'N/A';
    const diffMs = new Date(endDate).getTime() - new Date(startDate).getTime();
    if (diffMs < 0) return 'N/A';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours >= 24) {
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        return `${days}d ${remainingHours}h ${minutes}m`;
    }
    return `${hours}h ${minutes}m`;
}

function formatDate(date: string | null): string {
    if (!date) return 'Not yet';
    return new Date(date).toLocaleString();
}

const STATUS_OPTIONS = [
    { value: 'Open', label: 'Open' },
    { value: 'InProgress', label: 'In Progress' },
    { value: 'Resolved', label: 'Resolved' },
];

export default function ComplaintDetailModal({ isOpen, onClose, complaintId, onUpdate }: ComplaintDetailModalProps) {
    const { user } = useAuthStore();
    const [complaint, setComplaint] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [workers, setWorkers] = useState<any[]>([]);
    const [workersLoading, setWorkersLoading] = useState(false);
    const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
    const [isAssigning, setIsAssigning] = useState(false);
    const [newStatus, setNewStatus] = useState<string>('');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const isAdminOrPlanner = user?.role === 'super_admin' || user?.role === 'city_planner';

    useEffect(() => {
        if (!isOpen || !complaintId) {
            setComplaint(null);
            setWorkers([]);
            setSelectedWorkerId('');
            setNewStatus('');
            return;
        }

        const fetchComplaint = async () => {
            setIsLoading(true);
            try {
                const res = await api.get(`/complaints/${complaintId}`);
                setComplaint(res.data);
                setNewStatus(res.data.status);
            } catch (error) {
                console.error('Failed to fetch complaint', error);
                toast.error('Failed to load complaint details');
            } finally {
                setIsLoading(false);
            }
        };

        fetchComplaint();
    }, [isOpen, complaintId]);

    // Fetch workers when complaint is loaded and user is admin/planner
    useEffect(() => {
        if (!complaint || !isAdminOrPlanner || !complaint.cityId) {
            setWorkers([]);
            return;
        }

        const fetchWorkers = async () => {
            setWorkersLoading(true);
            try {
                const res = await api.get(`/users/workers/${complaint.cityId}`);
                setWorkers(res.data);
            } catch (error) {
                console.error('Failed to fetch workers', error);
            } finally {
                setWorkersLoading(false);
            }
        };

        fetchWorkers();
    }, [complaint?.cityId, complaint?.id, isAdminOrPlanner]);

    const handleAssignWorker = async () => {
        if (!selectedWorkerId || !complaintId) return;

        setIsAssigning(true);
        try {
            await api.patch(`/complaints/${complaintId}/assign`, { workerId: selectedWorkerId });
            toast.success('Worker assigned successfully. Email notification sent.');
            // Refetch complaint to update the UI
            const res = await api.get(`/complaints/${complaintId}`);
            setComplaint(res.data);
            setSelectedWorkerId('');
            onUpdate();
        } catch (error: any) {
            console.error('Failed to assign worker', error);
            toast.error(error.response?.data?.message || 'Failed to assign worker');
        } finally {
            setIsAssigning(false);
        }
    };

    const handleUpdateStatus = async () => {
        if (!newStatus || !complaintId) return;

        setIsUpdatingStatus(true);
        try {
            await api.patch(`/complaints/${complaintId}/status`, { status: newStatus });
            toast.success(`Status updated to ${newStatus}`);
            const res = await api.get(`/complaints/${complaintId}`);
            setComplaint(res.data);
            onUpdate();
        } catch (error: any) {
            console.error('Failed to update status', error);
            toast.error(error.response?.data?.message || 'Failed to update status');
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Open': return 'bg-yellow-500/20 text-yellow-700';
            case 'InProgress': return 'bg-blue-500/20 text-blue-700';
            case 'Resolved': return 'bg-green-500/20 text-green-700';
            default: return 'bg-slate-500/20 text-slate-700';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        Complaint Details {complaint ? `#${complaint.id.substring(0, 8)}` : ''}
                    </DialogTitle>
                    <DialogDescription>
                        View and manage complaint information.
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8 text-slate-500">
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                        Loading...
                    </div>
                ) : complaint ? (
                    <div className="space-y-6 py-2">
                        {/* Header Info */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <Badge variant="outline" className="text-sm">{complaint.type}</Badge>
                            <Badge variant="outline" className={`border-none ${getStatusColor(complaint.status)}`}>
                                {complaint.status}
                            </Badge>
                        </div>

                        {/* Description */}
                        {complaint.description && (
                            <div>
                                <label className="text-sm font-medium text-slate-500">Description</label>
                                <p className="mt-1 text-slate-800">{complaint.description}</p>
                            </div>
                        )}

                        {/* Reporter Info */}
                        <div>
                            <label className="text-sm font-medium text-slate-500">Reporter</label>
                            <p className="mt-1 text-slate-800">
                                {complaint.reporter?.email || complaint.reporter_email || 'Public Citizen (no email)'}
                            </p>
                        </div>

                        {/* Media */}
                        {complaint.media_url && (
                            <div>
                                <label className="text-sm font-medium text-slate-500">Attached Media</label>
                                <p className="mt-1 text-sm text-blue-600 underline break-all">{complaint.media_url}</p>
                            </div>
                        )}

                        {/* Timing Metrics */}
                        <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Timeline</label>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <span className="text-slate-500">Created:</span>
                                <span className="text-slate-800">{formatDate(complaint.created_at)}</span>

                                <span className="text-slate-500">Assigned:</span>
                                <span className="text-slate-800">{formatDate(complaint.assigned_at)}</span>

                                <span className="text-slate-500">Resolved:</span>
                                <span className="text-slate-800">{formatDate(complaint.resolved_at)}</span>

                                <span className="text-slate-500 font-medium">Resolution Time:</span>
                                <span className="text-slate-800 font-medium">
                                    {complaint.resolved_at
                                        ? formatDuration(complaint.created_at, complaint.resolved_at)
                                        : complaint.status === 'Resolved' ? 'N/A' : 'In progress'}
                                </span>
                            </div>
                        </div>

                        {/* Current Assignment */}
                        <div>
                            <label className="text-sm font-medium text-slate-500">Assigned Worker</label>
                            <p className="mt-1 text-slate-800">
                                {complaint.assigned_worker
                                    ? `${complaint.assigned_worker.name} (${complaint.assigned_worker.email})`
                                    : 'Unassigned'}
                            </p>
                        </div>

                        {/* Worker Assignment Section (admin/planner only) */}
                        {isAdminOrPlanner && (
                            <div className="border-t pt-4 space-y-3">
                                <label className="text-sm font-semibold text-slate-700">Assign Worker</label>

                                {!complaint.cityId ? (
                                    <p className="text-sm text-amber-600">
                                        This complaint has no city assigned -- cannot look up workers.
                                    </p>
                                ) : workersLoading ? (
                                    <p className="text-sm text-slate-500">Loading workers...</p>
                                ) : workers.length === 0 ? (
                                    <p className="text-sm text-red-600 font-medium">
                                        No workers available in this city.
                                    </p>
                                ) : (
                                    <div className="flex gap-2">
                                        <Select value={selectedWorkerId} onValueChange={setSelectedWorkerId}>
                                            <SelectTrigger className="flex-1">
                                                <SelectValue placeholder="Select a worker..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {workers.map((w) => (
                                                    <SelectItem key={w.id} value={w.id}>
                                                        {w.name} ({w.email})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            onClick={handleAssignWorker}
                                            disabled={!selectedWorkerId || isAssigning}
                                        >
                                            {isAssigning ? 'Assigning...' : 'Assign'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Status Change Section */}
                        <div className="border-t pt-4 space-y-3">
                            <label className="text-sm font-semibold text-slate-700">Update Status</label>
                            <div className="flex gap-2">
                                <Select value={newStatus} onValueChange={setNewStatus}>
                                    <SelectTrigger className="flex-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STATUS_OPTIONS.map((s) => (
                                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    onClick={handleUpdateStatus}
                                    disabled={!newStatus || newStatus === complaint.status || isUpdatingStatus}
                                >
                                    {isUpdatingStatus ? 'Updating...' : 'Update'}
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-8 text-center text-slate-500">Complaint not found.</div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
