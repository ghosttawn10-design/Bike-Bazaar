import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, Save, Plus, X, Image as ImageIcon } from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetProduct, 
  useCreateProduct, 
  useUpdateProduct,
  useGetCategories,
  useGetBrands
} from "@workspace/api-client-react";

const SPEC_FIELDS = [
  { key: "engine", label: "Engine" },
  { key: "horsepower", label: "Horsepower" },
  { key: "torque", label: "Torque" },
  { key: "weight", label: "Weight" },
  { key: "fuelCapacity", label: "Fuel Capacity" },
  { key: "seatHeight", label: "Seat Height" },
  { key: "transmission", label: "Transmission" },
  { key: "brakes", label: "Brakes" },
  { key: "suspension", label: "Suspension" },
  { key: "yearModel", label: "Year Model" },
];

export default function AdminProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id && id !== "new";
  const productId = parseInt(id || "0", 10);
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: product, isLoading: isLoadingProduct } = useGetProduct(productId, { 
    query: { enabled: isEdit, queryKey: ['product', productId] } 
  });
  const { data: categories } = useGetCategories();
  const { data: brands } = useGetBrands();

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    price: 0,
    category: "",
    description: "",
    engineCapacity: "",
    topSpeed: "",
    images: [] as string[],
    model3dUrl: "",
    featured: false,
    specs: {} as Record<string, string>
  });

  const [newImageUrl, setNewImageUrl] = useState("");

  useEffect(() => {
    if (isEdit && product) {
      setFormData({
        name: product.name,
        brand: product.brand,
        price: product.price,
        category: product.category,
        description: product.description,
        engineCapacity: product.engineCapacity || "",
        topSpeed: product.topSpeed || "",
        images: product.images || [],
        model3dUrl: product.model3dUrl || "",
        featured: product.featured,
        specs: product.specs || {}
      });
    }
  }, [product, isEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clean up empty specs
    const cleanSpecs = { ...formData.specs };
    Object.keys(cleanSpecs).forEach(key => {
      if (!cleanSpecs[key]) delete cleanSpecs[key];
    });

    const payload = {
      ...formData,
      model3dUrl: formData.model3dUrl || null,
      specs: cleanSpecs
    };

    if (isEdit) {
      updateMutation.mutate({ id: productId, data: payload }, {
        onSuccess: () => {
          toast({ title: "Product updated successfully" });
          queryClient.invalidateQueries({ queryKey: ['/api/products'] });
          setLocation("/admin/products");
        }
      });
    } else {
      createMutation.mutate({ data: payload }, {
        onSuccess: () => {
          toast({ title: "Product created successfully" });
          queryClient.invalidateQueries({ queryKey: ['/api/products'] });
          setLocation("/admin/products");
        }
      });
    }
  };

  const addImage = () => {
    if (newImageUrl && !formData.images.includes(newImageUrl)) {
      setFormData({ ...formData, images: [...formData.images, newImageUrl] });
      setNewImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  if (isEdit && isLoadingProduct) return <AdminLayout><div className="p-8">Loading data...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/admin/products")} className="rounded-none">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">{isEdit ? 'Edit Machine' : 'Deploy New Machine'}</h1>
          <p className="text-muted-foreground font-mono text-sm">Configure vehicle telemetry and specifications.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-none border-border/50 bg-card">
            <CardContent className="p-6 md:p-8 space-y-6">
              <h3 className="text-xl font-bold uppercase tracking-widest border-b border-border/50 pb-2 mb-4">Core Identifiers</h3>
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs uppercase tracking-widest">Model Name</Label>
                <Input id="name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-none bg-background" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="brand" className="text-xs uppercase tracking-widest">Brand</Label>
                  <Input id="brand" required value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="rounded-none bg-background" list="brands-list" />
                  <datalist id="brands-list">
                    {brands?.map(b => <option key={b} value={b} />)}
                  </datalist>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-xs uppercase tracking-widest">Category</Label>
                  <Input id="category" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="rounded-none bg-background" list="categories-list" />
                  <datalist id="categories-list">
                    {categories?.map(c => <option key={c.category} value={c.category} />)}
                  </datalist>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs uppercase tracking-widest">Technical Description</Label>
                <Textarea id="description" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="rounded-none bg-background min-h-[150px]" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-xs uppercase tracking-widest">Price (USD)</Label>
                  <Input id="price" type="number" required min={0} value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="rounded-none bg-background font-mono" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="engineCapacity" className="text-xs uppercase tracking-widest">Engine CC (Optional)</Label>
                  <Input id="engineCapacity" value={formData.engineCapacity} onChange={e => setFormData({...formData, engineCapacity: e.target.value})} className="rounded-none bg-background font-mono" placeholder="e.g. 998cc" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topSpeed" className="text-xs uppercase tracking-widest">Top Speed (Optional)</Label>
                  <Input id="topSpeed" value={formData.topSpeed} onChange={e => setFormData({...formData, topSpeed: e.target.value})} className="rounded-none bg-background font-mono" placeholder="e.g. 186 mph" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none border-border/50 bg-card">
            <CardContent className="p-6 md:p-8 space-y-6">
              <h3 className="text-xl font-bold uppercase tracking-widest border-b border-border/50 pb-2 mb-4">Detailed Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {SPEC_FIELDS.map(field => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={`spec-${field.key}`} className="text-xs uppercase tracking-widest text-muted-foreground">{field.label}</Label>
                    <Input 
                      id={`spec-${field.key}`}
                      value={formData.specs[field.key] || ""} 
                      onChange={e => setFormData({
                        ...formData, 
                        specs: { ...formData.specs, [field.key]: e.target.value }
                      })} 
                      className="rounded-none bg-background h-9 text-sm" 
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="rounded-none border-border/50 bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold uppercase tracking-widest">Featured Status</h3>
                  <p className="text-xs text-muted-foreground font-mono">Display on homepage</p>
                </div>
                <Switch 
                  checked={formData.featured}
                  onCheckedChange={(c) => setFormData({...formData, featured: c})}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none border-border/50 bg-card">
            <CardContent className="p-6 space-y-6">
              <h3 className="text-xl font-bold uppercase tracking-widest border-b border-border/50 pb-2 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" /> Visual Assets
              </h3>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Image URL..." 
                    value={newImageUrl} 
                    onChange={e => setNewImageUrl(e.target.value)}
                    className="rounded-none bg-background"
                  />
                  <Button type="button" onClick={addImage} variant="secondary" className="rounded-none px-3">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative aspect-video bg-muted border border-border group overflow-hidden">
                      <img src={img} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      <button 
                        type="button" 
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {formData.images.length === 0 && (
                    <div className="col-span-2 py-8 text-center border border-dashed border-border/50 text-muted-foreground text-xs uppercase tracking-widest font-mono">
                      No Images Added
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-border/50">
                <Label htmlFor="modelUrl" className="text-xs uppercase tracking-widest">3D Model URL (.gltf / .glb)</Label>
                <Input id="modelUrl" value={formData.model3dUrl} onChange={e => setFormData({...formData, model3dUrl: e.target.value})} className="rounded-none bg-background font-mono text-xs" placeholder="https://..." />
              </div>
            </CardContent>
          </Card>

          <Button 
            type="submit" 
            disabled={createMutation.isPending || updateMutation.isPending}
            className="w-full h-14 rounded-none uppercase tracking-widest font-bold text-lg"
          >
            <Save className="w-5 h-5 mr-2" /> 
            {isEdit ? "Update Database" : "Commit to Network"}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}
