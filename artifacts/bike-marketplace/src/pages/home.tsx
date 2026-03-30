import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Search, ArrowRight, ShieldCheck, Zap, Gauge } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layout/public-layout";
import { ProductCard } from "@/components/product-card";
import { useGetFeaturedProducts } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [search, setSearch] = useState("");
  const { data: featuredProducts, isLoading } = useGetFeaturedProducts();

  const categories = [
    { name: "Superbike", image: "/cat-superbike.png" },
    { name: "Adventure", image: "/cat-adventure.png" },
    { name: "Scooter", image: "/cat-scooter.png" },
    { name: "Naked Bike", image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80" },
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero-bg.png" 
            alt="Hero Background" 
            className="w-full h-full object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.9] text-white mb-6">
                Unleash <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">Pure Power.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl font-mono leading-relaxed">
                The premier destination for elite powersport machines. Engineered for adrenaline, crafted for dominance.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="h-14 px-8 text-lg uppercase tracking-wider font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-none relative overflow-hidden group">
                  <Link href="/products">
                    <span className="relative z-10 flex items-center gap-2">Explore Inventory <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                    <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  </Link>
                </Button>
                
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input 
                    placeholder="Search models, brands..." 
                    className="h-14 pl-12 bg-background/50 backdrop-blur-md border-border/50 text-lg rounded-none focus-visible:ring-primary/50"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && search.trim()) {
                        window.location.href = `/products?search=${encodeURIComponent(search.trim())}`;
                      }
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-y border-border/50 bg-muted/5 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 md:gap-24">
            {[
              { icon: ShieldCheck, label: "Verified Authenticity" },
              { icon: Zap, label: "Instant Valuation" },
              { icon: Gauge, label: "Performance Tested" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-muted-foreground">
                <item.icon className="w-6 h-6 text-primary" />
                <span className="font-mono text-sm uppercase tracking-wider">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-2">Featured Machines</h2>
              <div className="h-1 w-24 bg-primary" />
            </div>
            <Link href="/products" className="hidden md:flex items-center gap-2 text-primary hover:text-primary/80 font-medium uppercase tracking-wider text-sm transition-colors">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-64 w-full rounded-none" />
                  <Skeleton className="h-6 w-3/4 rounded-none" />
                  <Skeleton className="h-4 w-1/2 rounded-none" />
                </div>
              ))}
            </div>
          ) : featuredProducts?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No featured vehicles available at the moment.
            </div>
          )}
          
          <div className="mt-8 text-center md:hidden">
             <Button asChild variant="outline" className="w-full uppercase tracking-widest rounded-none border-primary/50">
               <Link href="/products">View All Inventory</Link>
             </Button>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-24 bg-card border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4">Choose Your Discipline</h2>
            <p className="text-muted-foreground font-mono max-w-2xl mx-auto">From tarmac domination to off-grid exploration, find the exact category that matches your riding style.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <Link key={i} href={`/products?category=${encodeURIComponent(cat.name)}`}>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative h-80 overflow-hidden cursor-pointer"
                >
                  <img 
                    src={cat.image} 
                    alt={cat.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-2xl font-black uppercase tracking-tight mb-2">{cat.name}</h3>
                      <div className="w-8 h-1 bg-primary mb-4 transition-all duration-300 group-hover:w-16" />
                      <span className="inline-flex items-center gap-2 text-sm font-mono text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Explore <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
