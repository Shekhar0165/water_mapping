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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Wrench, MapPin, Calendar, Activity, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function AssetsTable() {
    const [nodes, setNodes] = useState<any[]>([]);
    const [pipes, setPipes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const [nodesRes, pipesRes] = await Promise.all([
                    api.get('/maps/nodes'),
                    api.get('/maps/pipes')
                ]);
                setNodes(nodesRes.data);
                setPipes(pipesRes.data);
            } catch (error) {
                console.error("Failed to fetch assets", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAssets();
    }, []);

    const handleReview = (asset: any, type: 'node' | 'pipe') => {
        setSelectedAsset({ ...asset, assetType: type });
        setIsSheetOpen(true);
    };

    const handleForceMaintenance = async () => {
        if (!selectedAsset) return;

        setIsLoading(true);
        try {
            // Simulated API call to update status
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success(`Maintenance requested for #${selectedAsset.id.substring(0, 8)}`);

            // Update local state to show 'Maintenance' status
            const updateStatus = (items: any[]) =>
                items.map(item => item.id === selectedAsset.id ? { ...item, status: 'Maintenance' } : item);

            setNodes(updateStatus(nodes));
            setPipes(updateStatus(pipes));
            setSelectedAsset({ ...selectedAsset, status: 'Maintenance' });

        } catch (error) {
            toast.error("Failed to schedule maintenance.");
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Maintenance': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
            case 'Active': return 'bg-green-500/20 text-green-700 dark:text-green-400';
            case 'Broken': return 'bg-red-500/20 text-red-700 dark:text-red-400';
            default: return 'bg-slate-500/20 text-slate-700 dark:text-slate-400';
        }
    };

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center p-8 text-slate-500">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3"></div>
                Loading Assets Data...
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden p-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-6">Network Assets Inventory</h2>

            <Tabs defaultValue="pipes" className="w-full">
                <TabsList className="grid w-[400px] grid-cols-2 mb-6">
                    <TabsTrigger value="pipes">Pipes Database</TabsTrigger>
                    <TabsTrigger value="nodes">Nodes Database</TabsTrigger>
                </TabsList>

                <TabsContent value="pipes">
                    <div className="border border-slate-200 dark:border-slate-800 rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50 dark:bg-slate-950/50">
                                    <TableHead className="w-[100px]">ID</TableHead>
                                    <TableHead>Material</TableHead>
                                    <TableHead>Diameter (mm)</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Install Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pipes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                            No pipes found in the system.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pipes.map((pipe) => (
                                        <TableRow key={pipe.id}>
                                            <TableCell className="font-medium text-slate-600 dark:text-slate-400">
                                                #{pipe.id.substring(0, 8)}
                                            </TableCell>
                                            <TableCell>{pipe.material}</TableCell>
                                            <TableCell>{pipe.diameter_mm}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`border-none ${getStatusColor(pipe.status)}`}>
                                                    {pipe.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{pipe.installed_at ? new Date(pipe.installed_at).toLocaleDateString() : 'N/A'}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8"
                                                    onClick={() => handleReview(pipe, 'pipe')}
                                                >
                                                    Review
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="nodes">
                    <div className="border border-slate-200 dark:border-slate-800 rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50 dark:bg-slate-950/50">
                                    <TableHead className="w-[100px]">ID</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Coordinates</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {nodes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                                            No nodes found in the system.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    nodes.map((node) => (
                                        <TableRow key={node.id}>
                                            <TableCell className="font-medium text-slate-600 dark:text-slate-400">
                                                #{node.id.substring(0, 8)}
                                            </TableCell>
                                            <TableCell>{node.type}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`border-none ${getStatusColor(node.status)}`}>
                                                    {node.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-slate-500 font-mono">
                                                [{node.geometry?.coordinates?.[1]?.toFixed(4)}, {node.geometry?.coordinates?.[0]?.toFixed(4)}]
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8"
                                                    onClick={() => handleReview(node, 'node')}
                                                >
                                                    Review
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Asset Detail Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-full sm:max-w-[540px] overflow-y-auto">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                            {selectedAsset?.assetType === 'pipe' ? <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" /> : <Wrench className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />}
                            Asset Deep Dive: #{selectedAsset?.id?.substring(0, 8)}
                        </SheetTitle>
                        <SheetDescription className="text-sm">
                            Detailed technical specifications and maintenance history for this network component.
                        </SheetDescription>
                    </SheetHeader>

                    {selectedAsset && (
                        <div className="space-y-8 pb-8">
                            {/* Technical Specs */}
                            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                                    <Info className="w-4 h-4" /> Technical Specs
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                                    <div className="space-y-1">
                                        <p className="text-xs text-slate-400">Current Status</p>
                                        <Badge variant="outline" className={`border-none px-2 py-0.5 text-xs ${getStatusColor(selectedAsset.status)}`}>
                                            {selectedAsset.status}
                                        </Badge>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-slate-400">{selectedAsset.assetType === 'pipe' ? 'Material' : 'Type'}</p>
                                        <p className="font-medium text-sm sm:text-base">{selectedAsset.material || selectedAsset.type}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-slate-400">{selectedAsset.assetType === 'pipe' ? 'Diameter' : 'Component'}</p>
                                        <p className="font-medium text-sm sm:text-base">{selectedAsset.diameter_mm ? `${selectedAsset.diameter_mm}mm` : 'Static Node'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-slate-400">Install Date</p>
                                        <p className="font-medium text-sm sm:text-base flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                            {selectedAsset.installed_at ? new Date(selectedAsset.installed_at).toLocaleDateString() : 'N/A (Legacy)'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Geographical Location */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" /> Geographical Context
                                </h3>
                                <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800 font-mono text-[11px] sm:text-xs break-all">
                                    {selectedAsset.assetType === 'node' ? (
                                        <p>Point: [{selectedAsset.geometry.coordinates[1]}, {selectedAsset.geometry.coordinates[0]}]</p>
                                    ) : (
                                        <p>Segment: {selectedAsset.geometry.coordinates.length} vertex points</p>
                                    )}
                                </div>
                                <p className="text-[11px] text-slate-400 italic leading-relaxed">This asset is part of the New Delhi central distribution grid segment.</p>
                            </div>

                            {/* Maintenance Logs */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    <Activity className="w-4 h-4" /> Compliance & Maintenance Log
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 p-3 rounded-md bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold text-green-900 dark:text-green-400">Initial Survey Complete</p>
                                            <p className="text-[11px] text-green-700/70">Verified by System Seeder • 10 mins ago</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 rounded-md border border-slate-200 dark:border-slate-800 opacity-60">
                                        <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-extrabold shrink-0">2</div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Scheduled Pressure Test</p>
                                            <p className="text-[11px] text-slate-500">Scheduled for March 15, 2026</p>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    className="w-full py-6 text-sm sm:text-base font-semibold transition-all hover:shadow-md"
                                    variant="outline"
                                    onClick={handleForceMaintenance}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Processing...' : 'Schedule Force Maintenance'}
                                </Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}

function CheckCircle2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}

