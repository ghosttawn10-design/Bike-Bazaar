import { useGetDashboardStats, useGetActivityData } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge, MessageSquare, Clock, Star, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell
} from "recharts";

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: activityData, isLoading: activityLoading } = useGetActivityData({ days: 30 });

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tight">Command Center</h1>
        <p className="text-muted-foreground font-mono">System status and operational metrics.</p>
      </div>

      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-none" />)}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Inventory" value={stats.totalProducts} icon={Gauge} />
          <StatCard title="Total Requests" value={stats.totalRequests} icon={MessageSquare} />
          <StatCard title="Pending Action" value={stats.pendingRequests} icon={Clock} highlight={stats.pendingRequests > 0} />
          <StatCard title="Featured Units" value={stats.featuredProducts} icon={Star} />
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Chart */}
        <Card className="lg:col-span-2 rounded-none border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="uppercase tracking-widest text-sm text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Network Activity (30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {activityLoading ? (
                <Skeleton className="h-full w-full rounded-none" />
              ) : activityData && activityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: 0 }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Line type="monotone" dataKey="requests" name="Requests" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground font-mono text-sm">No activity data available</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="rounded-none border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="uppercase tracking-widest text-sm text-muted-foreground">Inventory by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {statsLoading ? (
                <Skeleton className="h-full w-full rounded-none" />
              ) : stats?.productsByCategory && stats.productsByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.productsByCategory} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="category" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      width={100}
                      fontSize={11}
                      stroke="hsl(var(--foreground))"
                    />
                    <Tooltip 
                      cursor={{fill: 'hsl(var(--muted))'}}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: 0 }}
                    />
                    <Bar dataKey="count" name="Units" radius={[0, 4, 4, 0]}>
                      {stats.productsByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground font-mono text-sm">No inventory data</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, icon: Icon, highlight = false }: { title: string, value: number, icon: any, highlight?: boolean }) {
  return (
    <Card className={`rounded-none border-border/50 ${highlight ? 'border-primary shadow-[0_0_15px_rgba(255,50,0,0.1)]' : 'bg-card'}`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{title}</p>
            <p className={`text-4xl font-black ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</p>
          </div>
          <div className={`p-3 rounded-full ${highlight ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
