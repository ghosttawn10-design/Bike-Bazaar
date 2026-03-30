import { useState } from "react";
import { Link } from "wouter";
import { Plus, Search, Edit, Trash2, Star, Eye } from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { useGetProducts, useDeleteProduct, useUpdateProduct } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminProducts() {
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  const { data, isLoading } = useGetProducts({ search: search || undefined });
  const deleteMutation = useDeleteProduct();
  const updateMutation = useUpdateProduct();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate({ id: deleteId }, {
      onSuccess: () => {
        toast({ title: "Product deleted" });
        queryClient.invalidateQueries({ queryKey: ['/api/products'] });
        setDeleteId(null);
      },
      onError: () => {
        toast({ title: "Failed to delete product", variant: "destructive" });
        setDeleteId(null);
      }
    });
  };

  const toggleFeatured = (id: number, currentStatus: boolean) => {
    updateMutation.mutate({
      id,
      data: { featured: !currentStatus }
    }, {
      onSuccess: () => {
        toast({ title: "Featured status updated" });
        queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      }
    });
  };

  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground font-mono">Manage vehicles, specs, and visibility.</p>
        </div>
        <Button asChild className="rounded-none uppercase tracking-widest font-bold shadow-[0_0_15px_rgba(255,50,0,0.2)]">
          <Link href="/admin/products/new"><Plus className="w-4 h-4 mr-2" /> Add Machine</Link>
        </Button>
      </div>

      <div className="bg-card border border-border/50 rounded-none overflow-hidden">
        <div className="p-4 border-b border-border/50 flex justify-between items-center bg-muted/20">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or brand..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 rounded-none bg-background border-border/50"
            />
          </div>
          <div className="text-sm text-muted-foreground font-mono">
            Total: {data?.total || 0}
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="uppercase tracking-widest text-xs font-bold">Machine</TableHead>
                <TableHead className="uppercase tracking-widest text-xs font-bold">Category</TableHead>
                <TableHead className="uppercase tracking-widest text-xs font-bold text-right">Price</TableHead>
                <TableHead className="uppercase tracking-widest text-xs font-bold text-center">Featured</TableHead>
                <TableHead className="uppercase tracking-widest text-xs font-bold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground font-mono">Loading telemetry...</TableCell>
                </TableRow>
              ) : data?.products && data.products.length > 0 ? (
                data.products.map((product) => (
                  <TableRow key={product.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-muted/50 overflow-hidden flex-shrink-0 border border-border/50">
                          {product.images[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground uppercase">No Img</div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold uppercase tracking-tight text-foreground">{product.name}</p>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">{product.brand}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-none uppercase text-[10px] tracking-widest">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium text-primary">
                      {formatter.format(product.price)}
                    </TableCell>
                    <TableCell className="text-center">
                      <button 
                        onClick={() => toggleFeatured(product.id, product.featured)}
                        className={`inline-flex p-2 transition-colors ${product.featured ? 'text-yellow-500 hover:text-yellow-600' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        <Star className="w-5 h-5" fill={product.featured ? "currentColor" : "none"} />
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-none">
                          <Link href={`/products/${product.id}`} target="_blank"><Eye className="w-4 h-4" /></Link>
                        </Button>
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-none text-blue-500 hover:text-blue-600 hover:bg-blue-500/10">
                          <Link href={`/admin/products/${product.id}/edit`}><Edit className="w-4 h-4" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(product.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground font-mono">No inventory records found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-none border-destructive/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="uppercase tracking-widest">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="font-mono">
              This action cannot be undone. This will permanently delete the vehicle record from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none uppercase tracking-widest text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 rounded-none uppercase tracking-widest text-xs">Purge Record</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
