import { useEffect, useState } from 'react';
import api from '../lib/api';
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

export default function ComplaintsTable() {
    const [complaints, setComplaints] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                const res = await api.get('/complaints');
                setComplaints(res.data);
            } catch (error) {
                console.error("Failed to fetch complaints", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchComplaints();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
            case 'InProgress': return 'bg-blue-500/20 text-blue-700 dark:text-blue-400';
            case 'Resolved': return 'bg-green-500/20 text-green-700 dark:text-green-400';
            default: return 'bg-slate-500/20 text-slate-700 dark:text-slate-400';
        }
    };

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center p-8 text-slate-500">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3"></div>
                Loading Complaints...
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Active Network Complaints</h2>
            </div>
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-50 dark:hover:bg-slate-950/50">
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Urgency</TableHead>
                        <TableHead>Reporter</TableHead>
                        <TableHead>Assigned</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {complaints.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                                No complaints found in the system.
                            </TableCell>
                        </TableRow>
                    ) : (
                        complaints.map((complaint) => (
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
                                <TableCell>
                                    <span className={complaint.is_urgent ? 'text-destructive font-semibold' : 'text-slate-500'}>
                                        {complaint.is_urgent ? 'High' : 'Normal'}
                                    </span>
                                </TableCell>
                                <TableCell>{complaint.reporter?.email || 'Public Citizen'}</TableCell>
                                <TableCell>{complaint.assigned_worker?.email || 'Unassigned'}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm" className="h-8">View Details</Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
