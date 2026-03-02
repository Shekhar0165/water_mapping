import { useState, useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Droplets, Map as MapIcon, ShieldAlert, Database, Settings, LogOut, Wifi, WifiOff, Users } from 'lucide-react';
import NetworkMap from '../components/NetworkMap';
import ComplaintsTable from '../components/ComplaintsTable';
import AssetsTable from '../components/AssetsTable';
import UserManagement from '../components/UserManagement';
import { useSocket } from '../hooks/useSocket';
import { toast } from 'sonner';

type ActiveView = 'MAP' | 'COMPLAINTS' | 'ASSETS' | 'USERS' | 'SETTINGS';

export default function Dashboard() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState<ActiveView>('MAP');

    const handleSocketMessage = useCallback((event: string, data: any) => {
        if (event === 'complaintNew') {
            toast.error(`New Complaint: ${data.message || 'Check the Hub'}`, { duration: 6000 });
        } else if (event === 'pipeStatusChanged') {
            toast.warning(`Network Alert: Pipe #${data.pipeId} status is now ${data.status}`);
        } else if (event === 'adminAlert') {
            toast.info(`System Alert: ${data.message}`);
        } else {
            toast('Network Update', { description: JSON.stringify(data) });
        }
    }, []);

    const { isConnected } = useSocket(handleSocketMessage);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
            {/* Sidebar Placeholder */}
            <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex">
                <div className="h-16 flex items-center px-6 bg-slate-950 border-b border-slate-800 justify-between">
                    <div className="flex items-center">
                        <Droplets className="w-6 h-6 text-primary mr-3" />
                        <span className="text-lg font-bold text-white tracking-widest">WATERNET</span>
                    </div>
                    {isConnected ? (
                        <span title="Live Connection Active"><Wifi className="w-4 h-4 text-green-500" /></span>
                    ) : (
                        <span title="Disconnected"><WifiOff className="w-4 h-4 text-slate-600" /></span>
                    )}
                </div>

                <nav className="flex-1 py-6 px-4 space-y-2">
                    <button
                        onClick={() => setActiveView('MAP')}
                        className={`flex items-center w-full px-4 py-3 rounded-md transition-colors ${activeView === 'MAP' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
                    >
                        <MapIcon className="w-5 h-5 mr-3" />
                        Network Map
                    </button>
                    <button
                        onClick={() => setActiveView('COMPLAINTS')}
                        className={`flex items-center w-full px-4 py-3 rounded-md transition-colors ${activeView === 'COMPLAINTS' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
                    >
                        <ShieldAlert className="w-5 h-5 mr-3" />
                        Complaints Hub
                    </button>
                    <button
                        onClick={() => setActiveView('ASSETS')}
                        className={`flex items-center w-full px-4 py-3 rounded-md transition-colors ${activeView === 'ASSETS' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
                    >
                        <Database className="w-5 h-5 mr-3" />
                        Assets Database
                    </button>
                    {user?.role === 'admin' && (
                        <button
                            onClick={() => setActiveView('USERS')}
                            className={`flex items-center w-full px-4 py-3 rounded-md transition-colors ${activeView === 'USERS' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
                        >
                            <Users className="w-5 h-5 mr-3" />
                            User Management
                        </button>
                    )}
                    <button
                        onClick={() => setActiveView('SETTINGS')}
                        className={`flex items-center w-full px-4 py-3 rounded-md transition-colors ${activeView === 'SETTINGS' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
                    >
                        <Settings className="w-5 h-5 mr-3" />
                        Settings
                    </button>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="mb-4 text-sm px-2">
                        <p className="text-white font-medium truncate">{user?.email}</p>
                        <p className="text-slate-500 capitalize">{user?.role}</p>
                    </div>
                    <Button
                        variant="outline"
                        className="w-full justify-start text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content Area Placeholder */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="h-16 flex items-center justify-between px-8 bg-white dark:bg-slate-900 border-b">
                    <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                        {activeView === 'MAP' && 'Interactive Map Overview'}
                        {activeView === 'COMPLAINTS' && 'Complaints Management Hub'}
                        {activeView === 'ASSETS' && 'Network Inventory Database'}
                        {activeView === 'USERS' && 'User Management'}
                        {activeView === 'SETTINGS' && 'System Settings'}
                    </h1>
                    {/* Mobile Header elements here */}
                </header>

                <div className="flex-1 p-8 overflow-auto bg-slate-100 dark:bg-slate-950/50">
                    <div className="w-full h-full">
                        {activeView === 'MAP' && (
                            <div className="w-full h-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                                <NetworkMap />
                            </div>
                        )}
                        {activeView === 'COMPLAINTS' && (
                            <ComplaintsTable />
                        )}
                        {activeView === 'ASSETS' && (
                            <AssetsTable />
                        )}
                        {activeView === 'USERS' && (
                            <UserManagement />
                        )}
                        {activeView === 'SETTINGS' && (
                            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                                <Settings className="w-16 h-16 text-slate-400 mb-4" />
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">System Settings</h2>
                                <p className="text-slate-500 max-w-md">Configure map default coordinates, theme preferences, and module feature flags. Coming soon.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
