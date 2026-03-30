import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layout/public-layout";
import { ProductCard } from "@/components/product-card";
import { useGetProducts, useGetCategories, useGetBrands } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export default function Products() {
  const [searchParams] = useState(new URLSearchParams(window.location.search));
  
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [category, setCategory] = useState<string>(searchParams.get("category") || "");
  const [brand, setBrand] = useState<string>("");
  const [priceRange, setPriceRange] = useState<number[]>([0, 100000]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: productsData, isLoading } = useGetProducts({
    search: debouncedSearch || undefined,
    category: category || undefined,
    brand: brand || undefined,
    maxPrice: priceRange[1] < 100000 ? priceRange[1] : undefined,
    limit: 100,
  });

  const { data: categories } = useGetCategories();
  const { data: brands } = useGetBrands();

  const handleReset = () => {
    setSearch("");
    setCategory("");
    setBrand("");
    setPriceRange([0, 100000]);
  };

  return (
    <PublicLayout>
      <div className="bg-muted/10 py-12 border-b border-border/50">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">Inventory</h1>
          <p className="text-muted-foreground font-mono max-w-2xl">Find your perfect machine. Filter by category, brand, or performance specs.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0 space-y-8">
            <div>
              <h3 className="font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" /> Filters
              </h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase text-muted-foreground">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input 
                      placeholder="Model name..." 
                      className="pl-9 bg-card border-border/50 rounded-none"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase text-muted-foreground">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-card border-border/50 rounded-none">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories?.map((c) => (
                        <SelectItem key={c.category} value={c.category}>
                          {c.category} ({c.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase text-muted-foreground">Brand</label>
                  <Select value={brand} onValueChange={setBrand}>
                    <SelectTrigger className="bg-card border-border/50 rounded-none">
                      <SelectValue placeholder="All Brands" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                      <SelectItem value="all">All Brands</SelectItem>
                      {brands?.map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-mono uppercase text-muted-foreground">Max Price</label>
                    <span className="text-sm font-bold text-primary">${priceRange[1].toLocaleString()}</span>
                  </div>
                  <Slider 
                    value={[priceRange[1]]} 
                    max={100000} 
                    step={1000} 
                    onValueChange={(vals) => setPriceRange([0, vals[0]])} 
                    className="py-4"
                  />
                </div>

                <Button 
                  variant="outline" 
                  className="w-full rounded-none border-primary/20 hover:bg-primary/10 text-primary uppercase tracking-widest text-xs"
                  onClick={handleReset}
                >
                  <X className="w-4 h-4 mr-2" /> Reset Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="mb-6 flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Showing <span className="text-foreground font-bold">{productsData?.products?.length || 0}</span> vehicles
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-64 w-full rounded-none" />
                    <Skeleton className="h-6 w-3/4 rounded-none" />
                    <Skeleton className="h-4 w-1/2 rounded-none" />
                  </div>
                ))}
              </div>
            ) : productsData?.products?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {productsData.products.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            ) : (
              <div className="py-24 text-center bg-card border border-border/50">
                <p className="text-xl font-bold uppercase tracking-widest mb-2">No matches found</p>
                <p className="text-muted-foreground font-mono">Try adjusting your filters to find what you're looking for.</p>
                <Button 
                  variant="outline" 
                  className="mt-6 rounded-none uppercase tracking-widest border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={handleReset}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
