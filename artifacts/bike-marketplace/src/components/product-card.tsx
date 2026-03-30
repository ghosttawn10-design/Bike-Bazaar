import { Link } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@workspace/api-client-react";
import { Gauge, Info } from "lucide-react";

export function ProductCard({ product, index = 0 }: { product: Product, index?: number }) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Link href={`/products/${product.id}`}>
        <Card className="group overflow-hidden border border-border/50 bg-card hover:border-primary/50 transition-all duration-300 cursor-pointer h-full flex flex-col">
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            {product.images && product.images.length > 0 ? (
              <img 
                src={product.images[0]} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No image available
              </div>
            )}
            
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              <Badge className="bg-background/80 backdrop-blur-md text-foreground border border-border/50 uppercase tracking-widest text-[10px] rounded-none">
                {product.category}
              </Badge>
              {product.featured && (
                <Badge className="bg-primary text-primary-foreground uppercase tracking-widest text-[10px] rounded-none">
                  Featured
                </Badge>
              )}
            </div>
          </div>
          
          <CardContent className="p-5 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{product.brand}</p>
                  <h3 className="text-xl font-bold font-sans tracking-tight line-clamp-1">{product.name}</h3>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">{formatter.format(product.price)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-4 text-sm text-muted-foreground">
                {product.engineCapacity && (
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" />
                    <span>{product.engineCapacity}</span>
                  </div>
                )}
                {product.topSpeed && (
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-primary" />
                    <span>{product.topSpeed}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-sm font-medium">
              <span className="text-primary group-hover:underline underline-offset-4 decoration-2">View Details</span>
              <span className="text-muted-foreground transition-transform group-hover:translate-x-1">→</span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
