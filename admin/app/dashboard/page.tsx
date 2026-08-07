import { 
  FileText, Eye, Users, TrendingUp,
  Feather, BookOpen, Tag, Settings,
  PenTool, Plus, ChevronRight, Shield, Sparkles
} from "lucide-react";
import { StatsCard } from "@/components/stats-card";
import { PostsTable } from "@/components/posts-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NotificationsWidget } from "@/components/notifications-widget";

export default function DashboardHome() {
  const stats = [
    {
      title: "Total Posts",
      value: "1,234",
      icon: FileText,
      trend: "+12%",
      trendColor: "green" as const,
    },
    {
      title: "Total Views",
      value: "45.6K",
      icon: Eye,
      trend: "+23%",
      trendColor: "green" as const,
    },
    {
      title: "Newsletter Subscribers",
      value: "3,456",
      icon: Users,
      trend: "+8%",
      trendColor: "green" as const,
    },
    {
      title: "Avg. Read Time",
      value: "4:32",
      icon: TrendingUp,
      trend: "-4%",
      trendColor: "red" as const,
    },
  ];

  const quickActions = [
    {
      title: "New Post",
      icon: PenTool,
      description: "Write a new article",
      href: "/dashboard/posts/create",
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
    },
    {
      title: "AI Writer",
      icon: Sparkles,
      description: "Generate with AI",
      href: "/dashboard/ai-writer",
      color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300",
    },
    {
      title: "Manage Categories",
      icon: Tag,
      description: "Organize content",
      href: "/dashboard/categories",
      color: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300",
    },
    {
      title: "Newsletter",
      icon: Feather,
      description: "Send updates",
      href: "/dashboard/newsletter",
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300",
    },
    {
      title: "Settings",
      icon: Settings,
      description: "Configure site",
      href: "/dashboard/settings",
      color: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300",
    },
    {
      title: "Security",
      icon: Shield,
      description: "Audit logs & access",
      href: "/dashboard/security",
      color: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300",
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Here's what's happening with your blog today.
          </p>
        </div>
        <Button className="flex items-center gap-2" asChild>
          <a href="/dashboard/posts/create">
            <Plus className="h-4 w-4" />
            New Post
          </a>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            trendColor={stat.trendColor}
          />
        ))}
      </div>

      {/* Quick Actions */}        <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Card key={action.title} className="card-hover cursor-pointer group">
              <a href={action.href} className="p-5 block">
                <div className="flex items-start justify-between">
                  <div>
                    <div className={`p-2 ${action.color} rounded-lg w-fit`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-foreground mt-3 group-hover:text-primary transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {action.description}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </a>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Posts + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Posts
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <a href="/dashboard/posts" className="text-primary">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </Button>
          </div>
          <PostsTable limit={5} />
        </div>
        <div className="space-y-4">
          <NotificationsWidget />
        </div>
      </div>
    </div>
  );
}