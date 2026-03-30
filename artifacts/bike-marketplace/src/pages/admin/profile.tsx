import { useState, useEffect } from "react";
import { Save, User, Link as LinkIcon, Phone } from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { useGetAdminProfile, useUpdateAdminProfile } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminProfile() {
  const { data: profile, isLoading } = useGetAdminProfile();
  const updateMutation = useUpdateAdminProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    whatsappNumber: "",
    socialLinks: {
      instagram: "",
      twitter: "",
      facebook: "",
      website: ""
    }
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        whatsappNumber: profile.whatsappNumber || "",
        socialLinks: {
          instagram: profile.socialLinks?.instagram || "",
          twitter: profile.socialLinks?.twitter || "",
          facebook: profile.socialLinks?.facebook || "",
          website: profile.socialLinks?.website || ""
        }
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      data: formData
    }, {
      onSuccess: () => {
        toast({ title: "Profile configuration updated" });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/profile'] });
      },
      onError: () => {
        toast({ title: "Failed to update profile", variant: "destructive" });
      }
    });
  };

  if (isLoading) return <AdminLayout><div className="p-8">Loading configuration...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tight">System Administrator</h1>
          <p className="text-muted-foreground font-mono">Configure contact protocols and network identity.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="rounded-none border-border/50 bg-card">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="uppercase tracking-widest text-sm text-primary flex items-center gap-2">
                <User className="w-4 h-4" /> Core Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs uppercase tracking-widest text-muted-foreground">Admin Designation</Label>
                  <Input id="name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-none bg-background border-border/50 font-mono" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground">System Email</Label>
                  <Input id="email" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="rounded-none bg-background border-border/50 font-mono" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none border-border/50 bg-card">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="uppercase tracking-widest text-sm text-primary flex items-center gap-2">
                <Phone className="w-4 h-4" /> Communication Protocols
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs uppercase tracking-widest text-muted-foreground">Standard Voice Line</Label>
                  <Input id="phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="rounded-none bg-background border-border/50 font-mono" placeholder="+1..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="text-xs uppercase tracking-widest text-muted-foreground">Encrypted Text (WhatsApp)</Label>
                  <Input id="whatsapp" value={formData.whatsappNumber} onChange={e => setFormData({...formData, whatsappNumber: e.target.value})} className="rounded-none bg-background border-border/50 font-mono" placeholder="+1..." />
                  <p className="text-[10px] text-muted-foreground font-mono mt-1">Used for direct buyer inquiries from product pages.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none border-border/50 bg-card">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="uppercase tracking-widest text-sm text-primary flex items-center gap-2">
                <LinkIcon className="w-4 h-4" /> External Nodes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="text-xs uppercase tracking-widest text-muted-foreground">Instagram Node</Label>
                  <Input id="instagram" value={formData.socialLinks.instagram} onChange={e => setFormData({...formData, socialLinks: {...formData.socialLinks, instagram: e.target.value}})} className="rounded-none bg-background border-border/50 font-mono" placeholder="https://instagram.com/..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter" className="text-xs uppercase tracking-widest text-muted-foreground">X (Twitter) Node</Label>
                  <Input id="twitter" value={formData.socialLinks.twitter} onChange={e => setFormData({...formData, socialLinks: {...formData.socialLinks, twitter: e.target.value}})} className="rounded-none bg-background border-border/50 font-mono" placeholder="https://x.com/..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook" className="text-xs uppercase tracking-widest text-muted-foreground">Facebook Node</Label>
                  <Input id="facebook" value={formData.socialLinks.facebook} onChange={e => setFormData({...formData, socialLinks: {...formData.socialLinks, facebook: e.target.value}})} className="rounded-none bg-background border-border/50 font-mono" placeholder="https://facebook.com/..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-xs uppercase tracking-widest text-muted-foreground">Main HQ Site</Label>
                  <Input id="website" value={formData.socialLinks.website} onChange={e => setFormData({...formData, socialLinks: {...formData.socialLinks, website: e.target.value}})} className="rounded-none bg-background border-border/50 font-mono" placeholder="https://..." />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={updateMutation.isPending}
              className="h-14 px-12 rounded-none uppercase tracking-widest font-bold text-lg"
            >
              {updateMutation.isPending ? "Applying Changes..." : <><Save className="w-5 h-5 mr-2" /> Save Configuration</>}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
