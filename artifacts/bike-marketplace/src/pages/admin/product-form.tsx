import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, Save, Plus, X, Image as ImageIcon, Upload, Link as LinkIcon } from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { getApiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  const imageFileRef = useRef<HTMLInputElement>(null);

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
  const [uploadingImage, setUploadingImage] = useState(false);

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
    const cleanSpecs = { ...formData.specs };
    Object.keys(cleanSpecs).forEach(key => { if (!cleanSpecs[key]) delete cleanSpecs[key]; });

    const payload = { ...formData, model3dUrl: formData.model3dUrl || null, specs: cleanSpecs };

    if (isEdit) {
      updateMutation.mutate({ id: productId, data: payload }, {
        onSuccess: () => {
          toast({ title: "Product updated" });
          queryClient.invalidateQueries({ queryKey: ['/api/products'] });
          setLocation("/admin/products");
        },
        onError: () => toast({ title: "Update failed", variant: "destructive" })
      });
    } else {
      createMutation.mutate({ data: payload }, {
        onSuccess: () => {
          toast({ title: "Product created" });
          queryClient.invalidateQueries({ queryKey: ['/api/products'] });
          setLocation("/admin/products");
        },
        onError: () => toast({ title: "Create failed", variant: "destructive" })
      });
    }
  };

  const addImageUrl = () => {
    if (newImageUrl.trim() && !formData.images.includes(newImageUrl.trim())) {
      setFormData({ ...formData, images: [...formData.images, newImageUrl.trim()] });
      setNewImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });
  };

  const setAsPrimary = (index: number) => {
    const imgs = [...formData.images];
    const [picked] = imgs.splice(index, 1);
    setFormData({ ...formData, images: [picked, ...imgs] });
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImage(true);
    const uploaded: string[] = [];

    for (const file of Array.from(files)) {
      try {
        const fd = new FormData();
        fd.append("image", file);
        const res = await fetch(getApiUrl("/api/products/upload-image"), { method: "POST", body: fd, credentials: "include" });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json() as { url: string };
        uploaded.push(data.url);
      } catch {
        toast({ title: `Failed to upload ${file.name}`, variant: "destructive" });
      }
    }

    if (uploaded.length > 0) {
      setFormData(prev => ({ ...prev, images: [...prev.images, ...uploaded] }));
      toast({ title: `${uploaded.length} image(s) uploaded` });
    }

    setUploadingImage(false);
    if (imageFileRef.current) imageFileRef.current.value = "";
  };

  if (isEdit && isLoadingProduct) return <AdminLayout><div className="p-8 font-mono text-muted-foreground">Loading vehicle data...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/admin/products")} className="rounded-none">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">{isEdit ? 'Edit Machine' : 'Add New Machine'}</h1>
          <p className="text-muted-foreground font-mono text-sm">Configure vehicle details and specifications.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Main info */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-none border-border/50 bg-card">
            <CardContent className="p-6 md:p-8 space-y-6">
              <h3 className="text-xl font-bold uppercase tracking-widest border-b border-border/50 pb-2">Vehicle Details</h3>
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs uppercase tracking-widest text-muted-foreground">Model Name</Label>
                <Input id="name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-none bg-background" placeholder="e.g. Yamaha Raptor 700R" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="brand" className="text-xs uppercase tracking-widest text-muted-foreground">Brand</Label>
                  <Input id="brand" required value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="rounded-none bg-background" list="brands-list" placeholder="e.g. Yamaha" />
                  <datalist id="brands-list">
                    {brands?.map(b => <option key={b} value={b} />)}
                  </datalist>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-xs uppercase tracking-widest text-muted-foreground">Category</Label>
                  <Input id="category" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="rounded-none bg-background" list="categories-list" placeholder="e.g. Quad Bike" />
                  <datalist id="categories-list">
                    {categories?.map(c => <option key={c.category} value={c.category} />)}
                  </datalist>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs uppercase tracking-widest text-muted-foreground">Description</Label>
                <Textarea id="description" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="rounded-none bg-background min-h-[130px]" placeholder="Describe the vehicle's key features..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-xs uppercase tracking-widest text-muted-foreground">Price (USD)</Label>
                  <Input id="price" type="number" required min={0} value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="rounded-none bg-background font-mono" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="engineCapacity" className="text-xs uppercase tracking-widest text-muted-foreground">Engine</Label>
                  <Input id="engineCapacity" value={formData.engineCapacity} onChange={e => setFormData({...formData, engineCapacity: e.target.value})} className="rounded-none bg-background font-mono" placeholder="e.g. 686cc" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topSpeed" className="text-xs uppercase tracking-widest text-muted-foreground">Top Speed</Label>
                  <Input id="topSpeed" value={formData.topSpeed} onChange={e => setFormData({...formData, topSpeed: e.target.value})} className="rounded-none bg-background font-mono" placeholder="e.g. 75 mph" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none border-border/50 bg-card">
            <CardContent className="p-6 md:p-8 space-y-4">
              <h3 className="text-xl font-bold uppercase tracking-widest border-b border-border/50 pb-2">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {SPEC_FIELDS.map(field => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={`spec-${field.key}`} className="text-xs uppercase tracking-widest text-muted-foreground">{field.label}</Label>
                    <Input 
                      id={`spec-${field.key}`}
                      value={formData.specs[field.key] || ""} 
                      onChange={e => setFormData({ ...formData, specs: { ...formData.specs, [field.key]: e.target.value } })} 
                      className="rounded-none bg-background h-9 text-sm" 
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Images + actions */}
        <div className="space-y-8">
          <Card className="rounded-none border-border/50 bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold uppercase tracking-widest">Featured</h3>
                  <p className="text-xs text-muted-foreground font-mono">Show on homepage</p>
                </div>
                <Switch checked={formData.featured} onCheckedChange={c => setFormData({...formData, featured: c})} />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none border-border/50 bg-card">
            <CardContent className="p-6 space-y-5">
              <h3 className="text-xl font-bold uppercase tracking-widest border-b border-border/50 pb-2 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" /> Photos
              </h3>

              {/* Upload from device */}
              <div>
                <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-widest mb-2">Upload from device</p>
                <input
                  ref={imageFileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageFileUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploadingImage}
                  onClick={() => imageFileRef.current?.click()}
                  className="w-full rounded-none border-dashed border-2 border-border/50 hover:border-primary/60 h-16 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-primary flex flex-col gap-1"
                >
                  <Upload className="w-5 h-5" />
                  {uploadingImage ? "Uploading..." : "Click to upload image(s)"}
                </Button>
                <p className="text-[10px] text-muted-foreground font-mono mt-1">Multiple files supported · JPG, PNG, WebP · max 5MB each</p>
              </div>

              {/* URL input */}
              <div>
                <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-widest mb-2">Or paste image URL</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      placeholder="https://..."
                      value={newImageUrl}
                      onChange={e => setNewImageUrl(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addImageUrl())}
                      className="rounded-none bg-background pl-8 text-sm"
                    />
                  </div>
                  <Button type="button" onClick={addImageUrl} variant="secondary" className="rounded-none px-3 shrink-0">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Image grid */}
              {formData.images.length > 0 ? (
                <div>
                  <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-widest mb-2">
                    {formData.images.length} image(s) — first is the primary photo
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className={`relative aspect-video bg-muted border group overflow-hidden ${idx === 0 ? 'border-primary' : 'border-border'}`}>
                        <img src={img} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        {idx === 0 && (
                          <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5">
                            Primary
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => setAsPrimary(idx)}
                              className="bg-primary text-primary-foreground text-[9px] font-bold uppercase px-2 py-1 hover:bg-primary/80"
                            >
                              Set Primary
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="bg-destructive text-destructive-foreground w-6 h-6 flex items-center justify-center hover:bg-destructive/80"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center border border-dashed border-border/40 text-muted-foreground text-[11px] uppercase tracking-widest font-mono">
                  No photos yet
                </div>
              )}

              {/* 3D Model */}
              <div className="pt-4 border-t border-border/50 space-y-2">
                <Label htmlFor="modelUrl" className="text-xs uppercase tracking-widest text-muted-foreground">3D Model URL (optional)</Label>
                <Input id="modelUrl" value={formData.model3dUrl} onChange={e => setFormData({...formData, model3dUrl: e.target.value})} className="rounded-none bg-background font-mono text-xs" placeholder=".gltf / .glb URL" />
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="w-full h-14 rounded-none uppercase tracking-widest font-bold text-lg"
          >
            <Save className="w-5 h-5 mr-2" />
            {isEdit ? "Save Changes" : "Add to Inventory"}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}
