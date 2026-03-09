import { useEffect, useState } from 'react';
import api from '../lib/api';
import axios from 'axios';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface Complaint {
    id: string;
    type: string;
    status: string;
    description: string;
    reporter_email: string;
    created_at: string;
    assigned_at: string;
    resolved_at: string | null;
    media_url?: string;
    resolution_media_url?: string;
}

export default function WorkerComplaintsPanel() {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // Resolution image upload
    const [resolutionFile, setResolutionFile] = useState<File | null>(null);
    const [resolutionPreview, setResolutionPreview] = useState<string | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const fetchMyComplaints = async () => {
        try {
            const res = await api.get('/complaints/my-assignments/list');
            setComplaints(res.data);
        } catch (error) {
            console.error("Failed to fetch assigned complaints", error);
            toast.error("Failed to load your assigned complaints");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMyComplaints();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setResolutionFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setResolutionPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateStatus = async () => {
        if (!selectedComplaint || !newStatus) return;

        setIsUpdating(true);
        try {
            // If status is Resolved and there's a resolution image, upload it first
            if (newStatus === 'Resolved' && resolutionFile) {
                setIsUploadingImage(true);
                try {
                    // Get presigned URL
                    const { data: s3Data } = await api.post('/s3/presigned-url', {
                        fileName: resolutionFile.name,
                        contentType: resolutionFile.type
                    });

                    // Upload to S3
                    await axios.put(s3Data.uploadUrl, resolutionFile, {
                        headers: { 'Content-Type': resolutionFile.type }
                    });

                    // Call resolve endpoint with image URL
                    await api.patch(`/complaints/${selectedComplaint.id}/resolve`, {
                        resolutionMediaUrl: s3Data.fileKey
                    });

                    toast.success('Complaint resolved with photo uploaded!');
                } catch (uploadError) {
                    console.error("Image upload failed", uploadError);
                    toast.warning("Photo upload failed, resolving without image");
                    // Still resolve without image
                    await api.patch(`/complaints/${selectedComplaint.id}/status`, { status: newStatus });
                } finally {
                    setIsUploadingImage(false);
                }
            } else {
                // Regular status update
                await api.patch(`/complaints/${selectedComplaint.id}/status`, { status: newStatus });
                toast.success(`Status updated to ${newStatus}`);
            }

            // Refresh the list
            await fetchMyComplaints();
            setIsModalOpen(false);
            setResolutionFile(null);
            setResolutionPreview(null);
        } catch (error: any) {
            console.error('Failed to update status', error);
            toast.error(error.response?.data?.message || 'Failed to update status');
        } finally {
            setIsUpdating(false);
        }
    };

    const openComplaintModal = (complaint: Complaint) => {
        setSelectedComplaint(complaint);
        setNewStatus(complaint.status);
        setIsModalOpen(true);
        setResolutionFile(null);
        setResolutionPreview(null);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Open': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
            case 'InProgress': return 'bg-blue-500/20 text-blue-700 dark:text-blue-400';
            case 'Resolved': return 'bg-green-500/20 text-green-700 dark:text-green-400';
            default: return 'bg-slate-500/20 text-slate-700 dark:text-slate-400';
        }
    };

    const formatDate = (date: string) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString();
    };

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center p-8 text-slate-500">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3"></div>
                Loading Your Assigned Complaints...
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">My Assigned Complaints</h2>
                    <p className="text-sm text-slate-500 mt-1">All complaints assigned to you for resolution</p>
                </div>
                <Badge variant="outline" className="text-lg px-3 py-1">
                    {complaints.length} Total
                </Badge>
            </div>

            {complaints.length === 0 ? (
                <div className="p-12 text-center">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">All Clear!</h3>
                    <p className="text-slate-500">You have no complaints assigned to you at the moment.</p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-50 dark:hover:bg-slate-950/50">
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Reporter</TableHead>
                            <TableHead>Assigned</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {complaints.map((complaint) => (
                            <TableRow key={complaint.id}>
                                <TableCell className="font-medium text-slate-600 dark:text-slate-400">
                                    #{complaint.id.substring(0, 8)}
                                </TableCell>
                                <TableCell>{complaint.type}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={`border-none ${getStatusColor(complaint.status)}`}>
                                        {complaint.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{complaint.reporter_email || 'Public Citizen'}</TableCell>
                                <TableCell>{formatDate(complaint.assigned_at)}</TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8"
                                        onClick={() => openComplaintModal(complaint)}
                                    >
                                        Manage
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            {/* Complaint Management Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Manage Complaint #{selectedComplaint?.id.substring(0, 8)}</DialogTitle>
                        <DialogDescription>
                            Update the status or upload resolution proof for this complaint.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedComplaint && (
                        <div className="space-y-4 py-4">
                            {/* Complaint Info */}
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-2">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">{selectedComplaint.type}</Badge>
                                    <Badge variant="outline" className={`border-none ${getStatusColor(selectedComplaint.status)}`}>
                                        {selectedComplaint.status}
                                    </Badge>
                                </div>
                                {selectedComplaint.description && (
                                    <p className="text-sm text-slate-700 dark:text-slate-300">{selectedComplaint.description}</p>
                                )}
                                <p className="text-xs text-slate-500">Assigned: {formatDate(selectedComplaint.assigned_at)}</p>
                            </div>

                            {/* Original Photo */}
                            {selectedComplaint.media_url && (
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Original Photo</label>
                                    <p className="text-xs text-blue-600 break-all mt-1">{selectedComplaint.media_url}</p>
                                </div>
                            )}

                            {/* Status Update */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Update Status</label>
                                <Select value={newStatus} onValueChange={setNewStatus}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Open">Open</SelectItem>
                                        <SelectItem value="InProgress">In Progress</SelectItem>
                                        <SelectItem value="Resolved">Resolved</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Resolution Photo Upload (only when marking as Resolved) */}
                            {newStatus === 'Resolved' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Upload Resolution Photo (Optional but Recommended)
                                    </label>
                                    {!resolutionPreview ? (
                                        <div
                                            onClick={() => document.getElementById('resolutionInput')?.click()}
                                            className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                                        >
                                            <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                            <p className="text-sm text-slate-500">Capture or Upload Proof of Resolution</p>
                                            <input
                                                type="file"
                                                id="resolutionInput"
                                                className="hidden"
                                                accept="image/*"
                                                capture="environment"
                                                onChange={handleFileChange}
                                            />
                                        </div>
                                    ) : (
                                        <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 aspect-video bg-slate-50">
                                            <img src={resolutionPreview} alt="Resolution Preview" className="w-full h-full object-cover" />
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                className="absolute top-2 right-2"
                                                onClick={() => { setResolutionPreview(null); setResolutionFile(null); }}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isUpdating}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateStatus}
                            disabled={isUpdating || !newStatus || newStatus === selectedComplaint?.status}
                        >
                            {isUpdating ? (isUploadingImage ? 'Uploading...' : 'Updating...') : 'Update Status'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
