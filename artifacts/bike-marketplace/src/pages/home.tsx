import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Search, ArrowRight, ShieldCheck, Zap, Gauge } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layout/public-layout";
import { ProductCard } from "@/components/product-card";
import { useGetFeaturedProducts, useGetAdminProfile } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_HERO = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1600";

const categories = [
  {
    name: "Quad Bike",
    label: "Quad Bikes / ATV",
    description: "Dominate any terrain",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800",
    featured: true,
  },
  {
    name: "Superbike",
    label: "Superbikes",
    description: "Tarmac precision",
    image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=800",
    featured: false,
  },
  {
    name: "Quad Bike",
    label: "Off-Road ATVs",
    description: "Built for the wild",
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&q=80&w=800",
    featured: false,
  },
  {
    name: "Scooter",
    label: "Scooters",
    description: "Urban freedom",
    image: "https://images.unsplash.com/photo-1558981359-219d6364c9c8?auto=format&fit=crop&q=80&w=800",
    featured: false,
  },
  {
    name: "Adventure",
    label: "Adventure",
    description: "Go anywhere",
    image: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&q=80&w=800",
    featured: false,
  },
];

export default function Home() {
  const [search, setSearch] = useState("");
  const { data: featuredProducts, isLoading } = useGetFeaturedProducts();
  const { data: adminProfile } = useGetAdminProfile();

  const heroImage = (adminProfile as Record<string, unknown>)?.heroImage as string | undefined;
  const heroBg = heroImage && heroImage.trim() ? heroImage : DEFAULT_HERO;

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroBg}
            alt="Quad Bike Hero"
            className="w-full h-full object-cover object-center opacity-45"
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
              <div className="inline-block bg-primary/20 border border-primary/40 px-3 py-1 rounded-sm mb-6">
                <span className="text-primary font-mono text-xs uppercase tracking-[0.2em]">Quad Bikes · ATVs · Powersport</span>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.9] text-white mb-6">
                Conquer <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">Every Terrain.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl font-mono leading-relaxed">
                The premier destination for quad bikes, ATVs, and elite powersport machines. Built for those who refuse boundaries.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="h-14 px-8 text-lg uppercase tracking-wider font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-none relative overflow-hidden group">
                  <Link href="/products?category=Quad+Bike">
                    <span className="relative z-10 flex items-center gap-2">
                      Browse Quad Bikes <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
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

      {/* ATV / Quad Spotlight */}
      <section className="py-16 bg-primary/5 border-b border-primary/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <motion.div
              className="flex-1"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-block bg-primary/20 border border-primary/40 px-3 py-1 rounded-sm mb-4">
                <span className="text-primary font-mono text-xs uppercase tracking-[0.2em]">Primary Category</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">
                Quad Bikes &<br />
                <span className="text-primary">ATV Machines</span>
              </h2>
              <p className="text-muted-foreground font-mono mb-6 leading-relaxed max-w-md">
                From recreational trails to serious off-road competition, our ATV lineup delivers unmatched power and capability across every terrain type.
              </p>
              <Button asChild className="rounded-none uppercase tracking-widest font-bold h-12 px-8">
                <Link href="/products?category=Quad+Bike">
                  View All ATVs <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              className="flex-1 grid grid-cols-2 gap-3"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {[
                {
                  label: "Sport ATVs",
                  img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=500",
                },
                {
                  label: "Utility Quads",
                  img: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&q=80&w=500",
                },
                {
                  label: "Racing Quads",
                  img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=500",
                },
                {
                  label: "Off-Road Quads",
                  img: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&q=80&w=500",
                },
              ].map((item, i) => (
                <Link key={i} href="/products?category=Quad+Bike">
                  <div className="relative aspect-square overflow-hidden group cursor-pointer border border-border/30">
                    <img
                      src={item.img}
                      alt={item.label}
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    <p className="absolute bottom-2 left-3 text-xs font-bold uppercase tracking-widest text-white">{item.label}</p>
                  </div>
                </Link>
              ))}
            </motion.div>
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
              No featured vehicles yet. Add some from the admin dashboard.
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
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4">Browse by Category</h2>
            <p className="text-muted-foreground font-mono max-w-2xl mx-auto">
              From off-road quad domination to street performance — find the machine that matches your ride.
            </p>
          </div>

          {/* ATV hero card + 4 below */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Large ATV card spans 2 columns */}
            <Link href={`/products?category=${encodeURIComponent(categories[0].name)}`} className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="group relative h-80 overflow-hidden cursor-pointer"
              >
                <img
                  src={categories[0].image}
                  alt={categories[0].label}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-2 py-1">
                    Main Category
                  </span>
                </div>
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-3xl font-black uppercase tracking-tight mb-1">{categories[0].label}</h3>
                    <p className="text-muted-foreground text-sm font-mono mb-2">{categories[0].description}</p>
                    <div className="w-8 h-1 bg-primary mb-4 transition-all duration-300 group-hover:w-16" />
                    <span className="inline-flex items-center gap-2 text-sm font-mono text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Explore <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* Remaining 4 smaller cards */}
            {categories.slice(1).map((cat, i) => (
              <Link key={i} href={`/products?category=${encodeURIComponent(cat.name)}`}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i + 1) * 0.1 }}
                  className="group relative h-80 overflow-hidden cursor-pointer"
                >
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-2xl font-black uppercase tracking-tight mb-1">{cat.label}</h3>
                      <p className="text-muted-foreground text-xs font-mono mb-2">{cat.description}</p>
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
