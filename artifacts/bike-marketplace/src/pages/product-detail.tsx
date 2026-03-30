import { useState } from "react";
import { useParams, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ArrowLeft, Zap, Info, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layout/public-layout";
import { BikeModelViewer } from "@/components/bike-model-viewer";
import { 
  useGetProduct, 
  useGetAdminProfile, 
  useCreateRequest,
  useGetRelatedProducts
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ProductCard } from "@/components/product-card";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id || "0", 10);
  const { toast } = useToast();

  const { data: product, isLoading, isError } = useGetProduct(productId, { 
    query: { enabled: !!productId, queryKey: ['product', productId] } 
  });
  
  const { data: adminProfile } = useGetAdminProfile();
  const { data: relatedProducts } = useGetRelatedProducts(productId, {
    query: { enabled: !!productId, queryKey: ['related', productId] }
  });

  const [activeImage, setActiveImage] = useState(0);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", location: "", message: ""
  });

  const createRequest = useCreateRequest();

  const handleWhatsApp = () => {
    if (!product) return;
    const phone = (adminProfile as Record<string, unknown>)?.whatsappNumber as string || (adminProfile as Record<string, unknown>)?.phone as string || "1234567890";
    const productUrl = `${window.location.origin}/products/${product.id}`;
    const text = encodeURIComponent(
      `Hello, I am interested in the *${product.name}* listed on your website.\n\nView listing: ${productUrl}\n\nPlease let me know if it is still available.`
    );
    window.open(`https://wa.me/${phone.replace(/\D/g,'')}?text=${text}`, "_blank");
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    
    createRequest.mutate({
      data: {
        ...formData,
        bikeId: product.id,
        bikeName: product.name,
      }
    }, {
      onSuccess: () => {
        toast({ title: "Request sent successfully", description: "Our team will contact you shortly." });
        setRequestModalOpen(false);
        setFormData({ name: "", email: "", phone: "", location: "", message: "" });
      },
      onError: () => {
        toast({ title: "Failed to send request", variant: "destructive" });
      }
    });
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-8 w-32 mb-8 rounded-none" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Skeleton className="h-[500px] w-full rounded-none" />
            <div className="space-y-6">
              <Skeleton className="h-12 w-3/4 rounded-none" />
              <Skeleton className="h-8 w-1/4 rounded-none" />
              <Skeleton className="h-32 w-full rounded-none" />
              <Skeleton className="h-16 w-full rounded-none" />
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (isError || !product) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-3xl font-bold uppercase tracking-widest mb-4">Vehicle Not Found</h2>
          <p className="text-muted-foreground mb-8">The machine you are looking for does not exist or has been removed.</p>
          <Button asChild className="rounded-none">
            <Link href="/products">Back to Inventory</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <Link href="/products" className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-primary transition-colors mb-8 uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4" /> Back to Inventory
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-24">
          {/* Visuals */}
          <div className="space-y-6">
            <BikeModelViewer 
              modelUrl={product.model3dUrl} 
              imageUrl={product.images[activeImage]} 
              fallbackMode={!product.model3dUrl}
            />
            
            {product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImage(idx)}
                    className={`relative w-24 h-24 flex-shrink-0 border-2 transition-all ${activeImage === idx ? 'border-primary' : 'border-transparent hover:border-primary/50'}`}
                  >
                    <img src={img} alt={`${product.name} view ${idx+1}`} className="w-full h-full object-cover" />
                    {activeImage === idx && (
                      <div className="absolute inset-0 bg-primary/10" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-bold uppercase tracking-widest text-primary">{product.brand}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-border" />
                <span className="text-sm uppercase tracking-widest text-muted-foreground">{product.category}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">{product.name}</h1>
              <p className="text-3xl font-bold text-foreground">{formatter.format(product.price)}</p>
            </div>

            <div className="prose prose-invert max-w-none mb-10 text-muted-foreground">
              <p className="text-lg leading-relaxed">{product.description}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Dialog open={requestModalOpen} onOpenChange={setRequestModalOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="flex-1 h-14 rounded-none uppercase tracking-widest font-bold bg-primary hover:bg-primary/90 text-primary-foreground group">
                    <Zap className="w-5 h-5 mr-2 group-hover:animate-pulse" /> Request This Machine
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] rounded-none border-border/50 bg-card p-0 overflow-hidden">
                  <div className="h-2 w-full bg-primary" />
                  <div className="p-6 md:p-8">
                    <DialogHeader className="mb-6">
                      <DialogTitle className="text-2xl font-black uppercase tracking-tight">Acquire {product.name}</DialogTitle>
                      <p className="text-sm text-muted-foreground font-mono">Submit your details and our team will contact you to finalize the acquisition.</p>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmitRequest} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs uppercase tracking-widest">Full Name</Label>
                        <Input id="name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-none bg-background border-border/50" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-xs uppercase tracking-widest">Email</Label>
                          <Input id="email" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="rounded-none bg-background border-border/50" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-xs uppercase tracking-widest">Phone</Label>
                          <Input id="phone" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="rounded-none bg-background border-border/50" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-xs uppercase tracking-widest">Location / City</Label>
                        <Input id="location" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="rounded-none bg-background border-border/50" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-xs uppercase tracking-widest">Additional Notes</Label>
                        <Textarea id="message" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="rounded-none bg-background border-border/50 min-h-[100px]" placeholder="Any specific questions..." />
                      </div>
                      
                      <Button type="submit" disabled={createRequest.isPending} className="w-full h-12 mt-6 rounded-none uppercase tracking-widest font-bold">
                        {createRequest.isPending ? "Sending..." : "Submit Request"}
                      </Button>
                    </form>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button size="lg" variant="outline" onClick={handleWhatsApp} className="flex-1 h-14 rounded-none uppercase tracking-widest font-bold border-green-500/50 text-green-500 hover:bg-green-500/10 hover:text-green-400 group">
                <MessageSquare className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" /> Contact WhatsApp
              </Button>
            </div>

            {/* Specs Table */}
            {product.specs && (
              <div>
                <h3 className="text-xl font-bold uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-border pb-4">
                  <Info className="w-5 h-5 text-primary" /> Technical Specifications
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  {Object.entries(product.specs).map(([key, value]) => {
                    if (!value) return null;
                    const label = key.replace(/([A-Z])/g, ' $1').trim();
                    return (
                      <div key={key} className="flex flex-col py-2 border-b border-border/30">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</span>
                        <span className="font-mono text-sm">{value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="border-t border-border pt-16 mb-12">
            <h2 className="text-3xl font-black uppercase tracking-tight mb-8">Similar Machines</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
