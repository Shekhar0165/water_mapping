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
import { useAuthStore } from '../store/useAuthStore';
import CitySearchInput from './CitySearchInput';
import { getCityById } from '../data/indianCities';

export default function UserManagement() {
    const { user: currentUser } = useAuthStore();
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isSuperAdmin = currentUser?.role === 'super_admin';
    const isCityPlanner = currentUser?.role === 'city_planner';

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState(isCityPlanner ? 'worker' : 'worker');
    const [password, setPassword] = useState('');
    const [cityId, setCityId] = useState('');

    // Edit city state
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editCityId, setEditCityId] = useState('');
    const [isSavingCity, setIsSavingCity] = useState(false);

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

        // Super admin must provide cityId when creating city_planner or worker
        if (isSuperAdmin && !cityId && (role === 'city_planner' || role === 'worker')) {
            toast.error("City ID is required for City Planners and Workers.");
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post('/users', {
                name,
                email,
                role: isCityPlanner ? 'worker' : role,
                password,
                cityId: isCityPlanner ? null : (cityId || null),
            });
            toast.success("User successfully invited!");
            setName('');
            setEmail('');
            setRole(isCityPlanner ? 'worker' : 'worker');
            setPassword('');
            setCityId('');
            fetchUsers();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create user.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditCity = (userId: string, currentCityId: string | null) => {
        setEditingUserId(userId);
        setEditCityId(currentCityId || '');
    };

    const handleSaveCity = async () => {
        if (!editingUserId) return;
        setIsSavingCity(true);
        try {
            await api.patch(`/users/${editingUserId}`, { cityId: editCityId || null });
            toast.success("City updated successfully. User must re-login for changes to take effect.");
            setEditingUserId(null);
            setEditCityId('');
            fetchUsers();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update city.");
        } finally {
            setIsSavingCity(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingUserId(null);
        setEditCityId('');
    };

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center p-8 text-slate-500">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3"></div>
                Loading User Sandbox...
            </div>
        );
    }

    // Calculate grid columns based on visible form fields
    const gridCols = isCityPlanner ? 'md:grid-cols-4' : 'md:grid-cols-6';

    return (
        <div className="space-y-6">
            {/* Create User Form Section */}
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    {isCityPlanner ? 'Add New Worker' : 'Invite New Employee'}
                </h2>
                {isCityPlanner && currentUser?.cityId && (
                    <p className="text-sm text-slate-500 mb-4">
                        New workers will be assigned to your city: <span className="font-semibold text-primary">{getCityById(currentUser.cityId)?.name || currentUser.cityId}</span>
                        <span className="font-mono text-xs text-slate-400 ml-1">({currentUser.cityId})</span>
                    </p>
                )}
                <form onSubmit={handleCreateUser} className={`grid grid-cols-1 ${gridCols} gap-4 items-end mt-4`}>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                        <Input required value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                        <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@city.gov" />
                    </div>

                    {/* City: shown only for super_admin, required for planner/worker roles */}
                    {isSuperAdmin && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                City {(role === 'city_planner' || role === 'worker') && <span className="text-red-500">*</span>}
                            </label>
                            <CitySearchInput
                                value={cityId}
                                onChange={setCityId}
                                required={role === 'city_planner' || role === 'worker'}
                            />
                        </div>
                    )}

                    {/* Role: shown only for super_admin. City planner always creates workers. */}
                    {isSuperAdmin && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="super_admin">Super Admin</SelectItem>
                                    <SelectItem value="city_planner">City Planner</SelectItem>
                                    <SelectItem value="worker">Field Worker</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Temp Password</label>
                        <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? 'Inviting...' : isCityPlanner ? 'Add Worker' : 'Invite User'}
                    </Button>
                </form>
            </div>

            {/* Users Table Section */}
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden p-6">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                    {isCityPlanner ? 'City Team Members' : 'Active IAM Users'}
                </h2>
                <div className="border border-slate-200 dark:border-slate-800 rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 dark:bg-slate-950/50">
                                <TableHead className="w-[100px]">ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>City</TableHead>
                                <TableHead>Joined At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-slate-500">
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
                                            <Badge variant={u.role === 'super_admin' ? 'destructive' : u.role === 'city_planner' ? 'default' : 'secondary'} className="capitalize">
                                                {u.role.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {editingUserId === u.id ? (
                                                <div className="flex items-center gap-2 min-w-[220px]">
                                                    <div className="flex-1">
                                                        <CitySearchInput
                                                            value={editCityId}
                                                            onChange={setEditCityId}
                                                        />
                                                    </div>
                                                    <Button size="sm" className="h-7 px-2 text-xs" onClick={handleSaveCity} disabled={isSavingCity}>
                                                        {isSavingCity ? '...' : 'Save'}
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={handleCancelEdit}>
                                                        Cancel
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs">
                                                        {u.cityId ? (
                                                            <span title={u.cityId}>
                                                                {getCityById(u.cityId)?.name || u.cityId}
                                                                <span className="text-slate-400 ml-1">({u.cityId})</span>
                                                            </span>
                                                        ) : (
                                                            <span className="text-red-500">No city</span>
                                                        )}
                                                    </span>
                                                    {isSuperAdmin && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-6 px-1.5 text-[10px] text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                            onClick={() => handleEditCity(u.id, u.cityId)}
                                                        >
                                                            Edit
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
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
