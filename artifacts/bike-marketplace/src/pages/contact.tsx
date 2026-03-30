import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PublicLayout } from "@/components/layout/public-layout";
import { useCreateRequest } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();
  const createRequest = useCreateRequest();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bikeName: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRequest.mutate({
      data: formData
    }, {
      onSuccess: () => {
        toast({ title: "Message sent successfully", description: "Our team will be in touch shortly." });
        setFormData({ name: "", email: "", phone: "", location: "", bikeName: "", message: "" });
      },
      onError: () => {
        toast({ title: "Failed to send message", variant: "destructive" });
      }
    });
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">Contact Command</h1>
            <p className="text-muted-foreground font-mono max-w-2xl mx-auto">
              Ready to acquire your next machine? Need technical details? Connect with our elite support team.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-24">
            {/* Contact Info */}
            <div className="space-y-10 lg:col-span-1">
              <div>
                <h3 className="text-xl font-bold uppercase tracking-wider mb-6 border-b border-border/50 pb-4">Direct Lines</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Global Support</p>
                      <p className="font-mono text-lg">+1 (800) 555-APEX</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Inquiries</p>
                      <p className="font-mono text-lg">acquire@apexmoto.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">HQ Showroom</p>
                      <p className="font-mono text-lg leading-relaxed">
                        1000 Precision Drive<br />
                        Motorsport Valley<br />
                        CA 90000
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-card border border-border/50 p-8 md:p-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-orange-500" />
                
                <h2 className="text-2xl font-black uppercase tracking-tight mb-8 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-primary" /> Transmit Request
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-xs uppercase tracking-widest text-muted-foreground">Operative Name</Label>
                      <Input id="name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-none bg-background/50 h-12" placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground">Email Frequency</Label>
                      <Input id="email" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="rounded-none bg-background/50 h-12" placeholder="john@example.com" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-xs uppercase tracking-widest text-muted-foreground">Secure Comms (Phone)</Label>
                      <Input id="phone" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="rounded-none bg-background/50 h-12" placeholder="+1..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-xs uppercase tracking-widest text-muted-foreground">Current Sector (Location)</Label>
                      <Input id="location" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="rounded-none bg-background/50 h-12" placeholder="City, Country" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bike" className="text-xs uppercase tracking-widest text-muted-foreground">Target Machine (Optional)</Label>
                    <Input id="bike" value={formData.bikeName} onChange={e => setFormData({...formData, bikeName: e.target.value})} className="rounded-none bg-background/50 h-12" placeholder="e.g. Ducati Panigale V4" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-xs uppercase tracking-widest text-muted-foreground">Transmission Details</Label>
                    <Textarea id="message" required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="rounded-none bg-background/50 min-h-[150px] resize-y" placeholder="Enter your message..." />
                  </div>

                  <Button type="submit" disabled={createRequest.isPending} className="w-full h-14 rounded-none uppercase tracking-widest font-bold text-lg">
                    {createRequest.isPending ? "Transmitting..." : <><Send className="w-5 h-5 mr-2" /> Execute Transmission</>}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
