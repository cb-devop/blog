"use client";

import { useState, useEffect } from "react";
import {
  Mail, Users, Send, Search,
  Plus, Trash2, Download, MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";

interface Subscriber {
  id: string;
  email: string;
  name?: string;
  subscribedAt: string;
  isConfirmed: boolean;
  source: string;
}

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const response = await fetch("/api/subscribers");
      if (response.ok) {
        const data = await response.json();
        const list = data.subscribers || data || [];
        setSubscribers(list.map((s: any) => ({
          id: s.id,
          email: s.email,
          name: s.name || "",
          subscribedAt: s.createdAt,
          isConfirmed: s.isActive !== false,
          source: s.source || "Website",
        })));
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (subId: string) => {
    if (!confirm("Are you sure you want to delete this subscriber?")) return;

    try {
      const response = await fetch(`/api/subscribers/${subId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Subscriber removed successfully.",
        });
        fetchSubscribers();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete subscriber.",
        variant: "destructive",
      });
    }
  };

  const exportSubscribers = () => {
    const csv = [
      "Email,Name,Subscribed At,Status,Source",
      ...subscribers.map((s) =>
        `${s.email},${s.name || ""},${s.subscribedAt},${s.isConfirmed ? "Confirmed" : "Pending"},${s.source}`
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscribers.csv";
    a.click();
  };

  const filtered = subscribers.filter(
    (sub) =>
      sub.email.toLowerCase().includes(search.toLowerCase()) ||
      (sub.name && sub.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Newsletter Subscribers
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your email subscribers
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportSubscribers} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button className="flex items-center gap-2" onClick={() =>
            toast({ title: "Coming Soon", description: "Newsletter sending feature coming soon!" })
          }>
            <Send className="h-4 w-4" />
            Send Newsletter
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Subscribers</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {subscribers.length.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Confirmed</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {subscribers.filter((s) => s.isConfirmed).length.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Send className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {subscribers.filter((s) => !s.isConfirmed).length.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search & Table */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search subscribers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-700/50">
                <TableHead className="text-left">Email</TableHead>
                <TableHead className="text-left">Name</TableHead>
                <TableHead className="text-left">Subscribed At</TableHead>
                <TableHead className="text-left">Status</TableHead>
                <TableHead className="text-left">Source</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No subscribers found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((sub) => (
                  <TableRow key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <TableCell className="font-medium text-gray-900 dark:text-white">
                      {sub.email}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-300">
                      {sub.name || "—"}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-300">
                      {new Date(sub.subscribedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          sub.isConfirmed
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }
                      >
                        {sub.isConfirmed ? "Confirmed" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-300 text-sm">
                      {sub.source}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[140px]">
                          <DropdownMenuItem onClick={() => handleDelete(sub.id)} className="text-red-600 focus:text-red-600">
                            <Trash2 className="h-3 w-3 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
