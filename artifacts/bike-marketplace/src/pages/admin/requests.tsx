import { useState } from "react";
import { Link } from "wouter";
import { Eye, CheckCircle, Clock, Archive } from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { useGetRequests, useUpdateRequestStatus } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function AdminRequests() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: requests, isLoading } = useGetRequests(
    { status: statusFilter !== "all" ? statusFilter : undefined }
  );
  
  const updateStatusMutation = useUpdateRequestStatus();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleStatusChange = (id: number, newStatus: string) => {
    updateStatusMutation.mutate({
      id,
      data: { status: newStatus }
    }, {
      onSuccess: () => {
        toast({ title: "Status updated" });
        queryClient.invalidateQueries({ queryKey: ['/api/requests'] });
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending': return <Badge className="bg-orange-500/20 text-orange-500 hover:bg-orange-500/30 rounded-none uppercase text-[10px] tracking-widest border-orange-500/50"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>;
      case 'contacted': return <Badge className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 rounded-none uppercase text-[10px] tracking-widest border-blue-500/50"><Eye className="w-3 h-3 mr-1"/> Contacted</Badge>;
      case 'resolved': return <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 rounded-none uppercase text-[10px] tracking-widest border-green-500/50"><CheckCircle className="w-3 h-3 mr-1"/> Resolved</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Acquisition Requests</h1>
          <p className="text-muted-foreground font-mono">Incoming transmissions from prospective buyers.</p>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] rounded-none border-border/50 bg-card uppercase tracking-widest text-xs font-bold">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="rounded-none uppercase tracking-widest text-xs">
            <SelectItem value="all">All Requests</SelectItem>
            <SelectItem value="pending">Pending Only</SelectItem>
            <SelectItem value="contacted">Contacted Only</SelectItem>
            <SelectItem value="resolved">Resolved Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card border border-border/50 rounded-none overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="uppercase tracking-widest text-xs font-bold">Date</TableHead>
                <TableHead className="uppercase tracking-widest text-xs font-bold">Operative</TableHead>
                <TableHead className="uppercase tracking-widest text-xs font-bold">Target Machine</TableHead>
                <TableHead className="uppercase tracking-widest text-xs font-bold">Status</TableHead>
                <TableHead className="uppercase tracking-widest text-xs font-bold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground font-mono">Intercepting signals...</TableCell>
                </TableRow>
              ) : requests && requests.length > 0 ? (
                requests.map((req) => (
                  <TableRow key={req.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <p className="font-bold text-sm">{req.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{req.email}</p>
                    </TableCell>
                    <TableCell>
                      {req.bikeName ? (
                        <Link href={`/products/${req.bikeId}`} className="text-primary hover:underline font-medium text-sm">
                          {req.bikeName}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground text-sm italic">General Inquiry</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(req.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="text-xs uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground transition-colors px-3 py-1 border border-border/50 bg-background hover:bg-muted">
                            Inspect
                          </button>
                        </DialogTrigger>
                        <DialogContent className="rounded-none border-border/50 bg-card p-0 sm:max-w-[600px] overflow-hidden">
                          <div className={`h-2 w-full ${req.status === 'pending' ? 'bg-orange-500' : req.status === 'resolved' ? 'bg-green-500' : 'bg-blue-500'}`} />
                          <div className="p-6 space-y-6">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-black uppercase tracking-widest flex items-center justify-between">
                                Request Dossier #{req.id}
                                {getStatusBadge(req.status)}
                              </DialogTitle>
                            </DialogHeader>
                            
                            <div className="grid grid-cols-2 gap-6 bg-muted/20 p-4 border border-border/50 font-mono text-sm">
                              <div>
                                <p className="text-muted-foreground uppercase text-[10px] tracking-widest mb-1">Operative Name</p>
                                <p>{req.name}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground uppercase text-[10px] tracking-widest mb-1">Comms (Email)</p>
                                <p>{req.email}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground uppercase text-[10px] tracking-widest mb-1">Secure Line (Phone)</p>
                                <p>{req.phone}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground uppercase text-[10px] tracking-widest mb-1">Sector (Location)</p>
                                <p>{req.location}</p>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-muted-foreground uppercase text-[10px] font-mono tracking-widest mb-2">Transmission Log</p>
                              <div className="bg-background border border-border/50 p-4 min-h-[100px] text-sm leading-relaxed">
                                {req.message || "No additional data provided."}
                              </div>
                            </div>

                            <div className="border-t border-border/50 pt-4 flex flex-col gap-2">
                              <p className="text-muted-foreground uppercase text-[10px] font-mono tracking-widest mb-1">Update Protocol Status</p>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleStatusChange(req.id, 'pending')}
                                  className={`flex-1 py-2 text-xs uppercase tracking-widest font-bold border transition-colors ${req.status === 'pending' ? 'bg-orange-500/20 border-orange-500/50 text-orange-500' : 'border-border/50 hover:bg-muted'}`}
                                >
                                  Pending
                                </button>
                                <button 
                                  onClick={() => handleStatusChange(req.id, 'contacted')}
                                  className={`flex-1 py-2 text-xs uppercase tracking-widest font-bold border transition-colors ${req.status === 'contacted' ? 'bg-blue-500/20 border-blue-500/50 text-blue-500' : 'border-border/50 hover:bg-muted'}`}
                                >
                                  Contacted
                                </button>
                                <button 
                                  onClick={() => handleStatusChange(req.id, 'resolved')}
                                  className={`flex-1 py-2 text-xs uppercase tracking-widest font-bold border transition-colors ${req.status === 'resolved' ? 'bg-green-500/20 border-green-500/50 text-green-500' : 'border-border/50 hover:bg-muted'}`}
                                >
                                  Resolved
                                </button>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground font-mono">No active transmissions.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
