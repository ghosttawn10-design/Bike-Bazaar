import { useState, useEffect, useRef } from "react";
import { Save, User, Link as LinkIcon, Phone, Type, Lock, Image as ImageIcon, Bell, MapPin, Upload, Send } from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { useGetAdminProfile, useUpdateAdminProfile } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminProfile() {
  const { data: profile, isLoading } = useGetAdminProfile();
  const updateMutation = useUpdateAdminProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const p = profile as Record<string, unknown> | undefined;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    whatsappNumber: "",
    appName: "",
    heroImage: "",
    socialLinks: { instagram: "", twitter: "", facebook: "", website: "" },
    emailNotificationsEnabled: false,
    smtpHost: "",
    smtpPort: "587",
    smtpUser: "",
    smtpPassword: "",
    smtpFrom: "",
    contactInfo: { heading: "", subheading: "", phone: "", email: "", address: "" },
  });

  const [passwordData, setPasswordData] = useState({ newPassword: "", confirmPassword: "" });
  const [uploadingHero, setUploadingHero] = useState(false);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const heroFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (p) {
      const ci = (p.contactInfo as Record<string, string>) ?? {};
      const sl = (profile?.socialLinks as Record<string, string>) ?? {};
      setFormData({
        name: (p.name as string) || "",
        email: (p.email as string) || "",
        phone: (p.phone as string) || "",
        whatsappNumber: (p.whatsappNumber as string) || "",
        appName: (p.appName as string) || "ApexMoto",
        heroImage: (p.heroImage as string) || "",
        socialLinks: {
          instagram: sl.instagram || "",
          twitter: sl.twitter || "",
          facebook: sl.facebook || "",
          website: sl.website || "",
        },
        emailNotificationsEnabled: (p.emailNotificationsEnabled as boolean) || false,
        smtpHost: (p.smtpHost as string) || "",
        smtpPort: (p.smtpPort as string) || "587",
        smtpUser: (p.smtpUser as string) || "",
        smtpPassword: "",
        smtpFrom: (p.smtpFrom as string) || "",
        contactInfo: {
          heading: ci.heading || "",
          subheading: ci.subheading || "",
          phone: ci.phone || "",
          email: ci.email || "",
          address: ci.address || "",
        },
      });
    }
  }, [profile]);

  const handleHeroFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHero(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/admin/upload-hero", { method: "POST", body: fd, credentials: "include" });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json() as { url: string };
      setFormData(prev => ({ ...prev, heroImage: data.url }));
      toast({ title: "Image uploaded successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/profile'] });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploadingHero(false);
      if (heroFileRef.current) heroFileRef.current.value = "";
    }
  };

  const handleTestEmail = async () => {
    setSendingTestEmail(true);
    try {
      const res = await fetch("/api/admin/test-email", { method: "POST", credentials: "include" });
      const data = await res.json() as { success?: boolean; message?: string };
      if (!res.ok) throw new Error(data.message || "Failed");
      toast({ title: "Test email sent!", description: "Check your inbox to confirm notifications are working." });
    } catch (err) {
      toast({ title: "Test email failed", description: String(err), variant: "destructive" });
    } finally {
      setSendingTestEmail(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword && passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (passwordData.newPassword && passwordData.newPassword.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    const payload: Record<string, unknown> = { ...formData };
    if (passwordData.newPassword) payload.password = passwordData.newPassword;
    // Don't send empty password field
    if (!formData.smtpPassword) delete payload.smtpPassword;

    updateMutation.mutate({ data: payload as Parameters<typeof updateMutation.mutate>[0]["data"] }, {
      onSuccess: () => {
        toast({ title: "Configuration saved successfully" });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/profile'] });
        setPasswordData({ newPassword: "", confirmPassword: "" });
      },
      onError: () => {
        toast({ title: "Failed to save configuration", variant: "destructive" });
      }
    });
  };

  if (isLoading) return <AdminLayout><div className="p-8 font-mono text-muted-foreground">Loading configuration...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tight">System Configuration</h1>
          <p className="text-muted-foreground font-mono">Manage platform identity, branding, contact info, and notifications.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* App Branding */}
          <Card className="rounded-none border-primary/30 bg-card">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="uppercase tracking-widest text-sm text-primary flex items-center gap-2">
                <Type className="w-4 h-4" /> Platform Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="appName" className="text-xs uppercase tracking-widest text-muted-foreground">App / Brand Name</Label>
                <Input
                  id="appName"
                  required
                  value={formData.appName}
                  onChange={e => setFormData({ ...formData, appName: e.target.value })}
                  className="rounded-none bg-background border-border/50 font-bold text-lg tracking-wider max-w-sm"
                  placeholder="e.g. ApexMoto"
                />
                <p className="text-[11px] text-muted-foreground font-mono">Appears in the site header, footer, and browser tab.</p>
              </div>
            </CardContent>
          </Card>

          {/* Hero Image */}
          <Card className="rounded-none border-border/50 bg-card">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="uppercase tracking-widest text-sm text-primary flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Homepage Hero Image
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-5">
              {/* File Upload */}
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Upload from your computer</p>
                <div className="flex items-center gap-3">
                  <input
                    ref={heroFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleHeroFileUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploadingHero}
                    onClick={() => heroFileRef.current?.click()}
                    className="rounded-none border-dashed border-border/70 h-10 px-6 font-mono text-xs uppercase tracking-widest hover:border-primary/60"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingHero ? "Uploading..." : "Choose Image File"}
                  </Button>
                  <span className="text-[11px] text-muted-foreground font-mono">JPG, PNG, WebP — max 5MB</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-border/40" />
                <span className="text-[11px] text-muted-foreground font-mono uppercase tracking-widest">or paste URL</span>
                <div className="flex-1 h-px bg-border/40" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="heroImage" className="text-xs uppercase tracking-widest text-muted-foreground">Image URL</Label>
                <Input
                  id="heroImage"
                  value={formData.heroImage}
                  onChange={e => setFormData({ ...formData, heroImage: e.target.value })}
                  className="rounded-none bg-background border-border/50 font-mono text-sm"
                  placeholder="https://example.com/your-hero-image.jpg"
                />
                <p className="text-[11px] text-muted-foreground font-mono">Leave blank to use the default ATV image.</p>
              </div>

              {formData.heroImage && (
                <div className="relative h-48 overflow-hidden border border-border/50 rounded-none">
                  <img
                    src={formData.heroImage}
                    alt="Hero preview"
                    className="w-full h-full object-cover opacity-70"
                    onError={(e) => { (e.target as HTMLImageElement).src = ""; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent flex items-center pl-6">
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Preview</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Page Info */}
          <Card className="rounded-none border-border/50 bg-card">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="uppercase tracking-widest text-sm text-primary flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Contact Page Content
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-6">
              <p className="text-[11px] text-muted-foreground font-mono">These values appear on the public Contact Us page. Leave blank to use defaults.</p>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Page Heading</Label>
                <Input
                  value={formData.contactInfo.heading}
                  onChange={e => setFormData({ ...formData, contactInfo: { ...formData.contactInfo, heading: e.target.value } })}
                  className="rounded-none bg-background border-border/50 font-mono"
                  placeholder="e.g. Get In Touch"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Page Subheading</Label>
                <Textarea
                  value={formData.contactInfo.subheading}
                  onChange={e => setFormData({ ...formData, contactInfo: { ...formData.contactInfo, subheading: e.target.value } })}
                  className="rounded-none bg-background border-border/50 font-mono min-h-[80px]"
                  placeholder="Brief description under the heading..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Display Phone</Label>
                  <Input
                    value={formData.contactInfo.phone}
                    onChange={e => setFormData({ ...formData, contactInfo: { ...formData.contactInfo, phone: e.target.value } })}
                    className="rounded-none bg-background border-border/50 font-mono"
                    placeholder="+1 (800) 555-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Display Email</Label>
                  <Input
                    value={formData.contactInfo.email}
                    onChange={e => setFormData({ ...formData, contactInfo: { ...formData.contactInfo, email: e.target.value } })}
                    className="rounded-none bg-background border-border/50 font-mono"
                    placeholder="info@yourstore.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Display Address</Label>
                <Textarea
                  value={formData.contactInfo.address}
                  onChange={e => setFormData({ ...formData, contactInfo: { ...formData.contactInfo, address: e.target.value } })}
                  className="rounded-none bg-background border-border/50 font-mono min-h-[80px]"
                  placeholder="123 Main Street&#10;City, State&#10;Country"
                />
              </div>
            </CardContent>
          </Card>

          {/* Admin Identity */}
          <Card className="rounded-none border-border/50 bg-card">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="uppercase tracking-widest text-sm text-primary flex items-center gap-2">
                <User className="w-4 h-4" /> Admin Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs uppercase tracking-widest text-muted-foreground">Display Name</Label>
                  <Input id="name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="rounded-none bg-background border-border/50 font-mono" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground">Login Email</Label>
                  <Input id="email" type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="rounded-none bg-background border-border/50 font-mono" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card className="rounded-none border-border/50 bg-card">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="uppercase tracking-widest text-sm text-primary flex items-center gap-2">
                <Lock className="w-4 h-4" /> Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-xs uppercase tracking-widest text-muted-foreground">New Password</Label>
                  <Input id="newPassword" type="password" value={passwordData.newPassword} onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="rounded-none bg-background border-border/50 font-mono" placeholder="Leave blank to keep current" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-xs uppercase tracking-widest text-muted-foreground">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="rounded-none bg-background border-border/50 font-mono" placeholder="Re-enter new password" />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground font-mono mt-3">Minimum 6 characters. Leave blank to keep current password.</p>
            </CardContent>
          </Card>

          {/* Communication */}
          <Card className="rounded-none border-border/50 bg-card">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="uppercase tracking-widest text-sm text-primary flex items-center gap-2">
                <Phone className="w-4 h-4" /> Contact Channels
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs uppercase tracking-widest text-muted-foreground">Phone Number</Label>
                  <Input id="phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="rounded-none bg-background border-border/50 font-mono" placeholder="+1..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="text-xs uppercase tracking-widest text-muted-foreground">WhatsApp Number</Label>
                  <Input id="whatsapp" value={formData.whatsappNumber} onChange={e => setFormData({ ...formData, whatsappNumber: e.target.value })} className="rounded-none bg-background border-border/50 font-mono" placeholder="+1..." />
                  <p className="text-[10px] text-muted-foreground font-mono">Used for direct buyer contact on product pages.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Notifications */}
          <Card className="rounded-none border-primary/30 bg-card">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="uppercase tracking-widest text-sm text-primary flex items-center gap-2">
                <Bell className="w-4 h-4" /> Email Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between p-4 border border-border/50 bg-background/30">
                <div>
                  <p className="font-bold uppercase tracking-widest text-sm">Enable Email Notifications</p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">Receive an email when someone submits a contact request or inquiry.</p>
                </div>
                <Switch
                  checked={formData.emailNotificationsEnabled}
                  onCheckedChange={v => setFormData({ ...formData, emailNotificationsEnabled: v })}
                />
              </div>

              {formData.emailNotificationsEnabled && (
                <div className="space-y-5 pt-2">
                  <p className="text-xs text-muted-foreground font-mono border-l-2 border-primary pl-3">
                    Enter your SMTP details below. Use Gmail, Outlook, or any SMTP provider. For Gmail, generate an App Password at myaccount.google.com/apppasswords.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest text-muted-foreground">SMTP Host</Label>
                      <Input value={formData.smtpHost} onChange={e => setFormData({ ...formData, smtpHost: e.target.value })} className="rounded-none bg-background border-border/50 font-mono" placeholder="smtp.gmail.com" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest text-muted-foreground">SMTP Port</Label>
                      <Input value={formData.smtpPort} onChange={e => setFormData({ ...formData, smtpPort: e.target.value })} className="rounded-none bg-background border-border/50 font-mono" placeholder="587" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest text-muted-foreground">SMTP Username (Email)</Label>
                      <Input type="email" value={formData.smtpUser} onChange={e => setFormData({ ...formData, smtpUser: e.target.value })} className="rounded-none bg-background border-border/50 font-mono" placeholder="your@email.com" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest text-muted-foreground">SMTP Password / App Password</Label>
                      <Input type="password" value={formData.smtpPassword} onChange={e => setFormData({ ...formData, smtpPassword: e.target.value })} className="rounded-none bg-background border-border/50 font-mono" placeholder="Leave blank to keep saved value" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-xs uppercase tracking-widest text-muted-foreground">From Address (Optional)</Label>
                      <Input value={formData.smtpFrom} onChange={e => setFormData({ ...formData, smtpFrom: e.target.value })} className="rounded-none bg-background border-border/50 font-mono" placeholder="noreply@yourdomain.com — defaults to SMTP username" />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/30 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1">
                      <p className="text-[11px] text-muted-foreground font-mono">Save your settings first, then send a test email to verify everything works.</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={sendingTestEmail}
                      onClick={handleTestEmail}
                      className="rounded-none h-10 px-6 font-mono text-xs uppercase tracking-widest border-primary/50 hover:bg-primary/10 hover:border-primary shrink-0"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {sendingTestEmail ? "Sending..." : "Send Test Email"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card className="rounded-none border-border/50 bg-card">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="uppercase tracking-widest text-sm text-primary flex items-center gap-2">
                <LinkIcon className="w-4 h-4" /> Social & Web Links
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Instagram</Label>
                  <Input value={formData.socialLinks.instagram} onChange={e => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, instagram: e.target.value } })} className="rounded-none bg-background border-border/50 font-mono" placeholder="https://instagram.com/..." />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">X (Twitter)</Label>
                  <Input value={formData.socialLinks.twitter} onChange={e => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, twitter: e.target.value } })} className="rounded-none bg-background border-border/50 font-mono" placeholder="https://x.com/..." />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Facebook</Label>
                  <Input value={formData.socialLinks.facebook} onChange={e => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, facebook: e.target.value } })} className="rounded-none bg-background border-border/50 font-mono" placeholder="https://facebook.com/..." />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Website URL</Label>
                  <Input value={formData.socialLinks.website} onChange={e => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, website: e.target.value } })} className="rounded-none bg-background border-border/50 font-mono" placeholder="https://..." />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pb-8">
            <Button type="submit" disabled={updateMutation.isPending} className="h-14 px-12 rounded-none uppercase tracking-widest font-bold text-lg">
              {updateMutation.isPending ? "Saving..." : <><Save className="w-5 h-5 mr-2" /> Save All Changes</>}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
