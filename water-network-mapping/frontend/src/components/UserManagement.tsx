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
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from 'sonner';

export default function UserManagement() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('worker');
    const [password, setPassword] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
            toast.error("Failed to load users database.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/users', { name, email, role, password });
            toast.success("User successfully invited!");
            setName('');
            setEmail('');
            setRole('worker');
            setPassword('');
            fetchUsers();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create user.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center p-8 text-slate-500">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3"></div>
                Loading User Sandbox...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Create User Form Section */}
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden p-6">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Invite New Employee</h2>
                <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                        <Input required value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                        <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@city.gov" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Super Admin</SelectItem>
                                <SelectItem value="planner">City Planner</SelectItem>
                                <SelectItem value="worker">Field Worker</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Temporary Password</label>
                        <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? 'Inviting...' : 'Invite User'}
                    </Button>
                </form>
            </div>

            {/* Users Table Section */}
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden p-6">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Active IAM Users</h2>
                <div className="border border-slate-200 dark:border-slate-800 rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 dark:bg-slate-950/50">
                                <TableHead className="w-[100px]">ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Joined At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((u) => (
                                    <TableRow key={u.id}>
                                        <TableCell className="font-medium text-slate-600 dark:text-slate-400">
                                            #{u.id.substring(0, 8)}
                                        </TableCell>
                                        <TableCell>{u.name}</TableCell>
                                        <TableCell>{u.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={u.role === 'admin' ? 'destructive' : u.role === 'planner' ? 'default' : 'secondary'} className="capitalize">
                                                {u.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" className="h-8 text-red-500 hover:bg-red-50 hover:text-red-600 border-red-200">Revoke Access</Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
