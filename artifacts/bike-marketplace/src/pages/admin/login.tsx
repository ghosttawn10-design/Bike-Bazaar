import { useState } from "react";
import { useLocation } from "wouter";
import { Zap, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAdminLogin } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useAdminLogin();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({
      data: { email, password }
    }, {
      onSuccess: (data) => {
        const result = data as { success: boolean; token?: string };
        if (result.success) {
          localStorage.setItem("adminSession", "true");
          if (result.token) localStorage.setItem("adminToken", result.token);
          toast({ title: "Authentication successful" });
          setLocation("/admin");
        } else {
          toast({ title: "Authentication failed", variant: "destructive" });
        }
      },
      onError: () => {
        toast({ title: "Invalid credentials", variant: "destructive" });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary rounded-full blur-[150px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
            <Zap className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-widest">Apex<span className="text-primary">Admin</span></h1>
          <p className="text-muted-foreground font-mono mt-2 text-sm uppercase">Restricted Access Control</p>
        </div>

        <div className="bg-card border border-border/50 p-8 shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-mono uppercase text-muted-foreground">Admin ID (Email)</Label>
              <Input 
                id="email" 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="rounded-none bg-background/50 h-12 font-mono" 
                placeholder="admin@apexmoto.com" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-mono uppercase text-muted-foreground">Passcode</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="rounded-none bg-background/50 h-12 font-mono" 
              />
            </div>

            <Button 
              type="submit" 
              disabled={loginMutation.isPending} 
              className="w-full h-12 rounded-none uppercase tracking-widest font-bold mt-4"
            >
              {loginMutation.isPending ? "Authenticating..." : <><Lock className="w-4 h-4 mr-2" /> Authorize Access</>}
            </Button>
          </form>
        </div>
        
        <div className="mt-8 text-center">
          <Button variant="link" onClick={() => setLocation("/")} className="text-muted-foreground uppercase tracking-widest text-xs font-mono">
            ← Return to Public Network
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
