"use client";

import { useState } from "react";
import { 
  Eye, Edit, Trash2, MoreVertical,
  Calendar, User, Filter 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Post {
  id: string;
  title: string;
  author: string;
  category: string;
  status: "published" | "draft" | "scheduled";
  date: string;
  views: number;
}

interface PostsTableProps {
  limit?: number;
  search?: string;
}

export function PostsTable({ limit = 10, search = "" }: PostsTableProps) {
  // Sample data - hum abhi API se fetch karenge
  const posts: Post[] = [
    {
      id: "1",
      title: "Getting Started with Next.js 14",
      author: "John Doe",
      category: "Technology",
      status: "published",
      date: "2026-07-08",
      views: 1234,
    },
    {
      id: "2",
      title: "The Future of Web Development",
      author: "Jane Smith",
      category: "Development",
      status: "published",
      date: "2026-07-07",
      views: 856,
    },
    {
      id: "3",
      title: "Design Systems for Beginners",
      author: "John Doe",
      category: "Design",
      status: "draft",
      date: "2026-07-06",
      views: 0,
    },
    {
      id: "4",
      title: "Advanced TypeScript Patterns",
      author: "Mike Johnson",
      category: "Technology",
      status: "scheduled",
      date: "2026-07-10",
      views: 0,
    },
    {
      id: "5",
      title: "Building Scalable APIs",
      author: "Sarah Wilson",
      category: "Backend",
      status: "published",
      date: "2026-07-05",
      views: 432,
    },
  ];

  const filteredPosts = posts
    .filter(post => 
      search === "" || 
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.author.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, limit);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const handleDelete = async (postId: string) => {
    // Add confirmation dialog
    if (confirm("Are you sure you want to delete this post?")) {
      // API call to delete post
      // await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      console.log("Delete post:", postId);
    }
  };

  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
      {/* Table Header with Filters */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-foreground">Recent Posts</h2>
          <Badge variant="outline" className="ml-2">
            {filteredPosts.length} total
          </Badge>
        </div>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 sm:px-6 py-3 text-left">Title</th>
              <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left">Author</th>
              <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left">Category</th>
              <th className="px-3 sm:px-6 py-3 text-left">Status</th>
              <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left">Date</th>
              <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left">Views</th>
              <th className="px-3 sm:px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredPosts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                  No posts found
                </td>
              </tr>
            ) : (
              filteredPosts.map((post) => (
                <tr 
                  key={post.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="font-medium text-foreground line-clamp-1 max-w-[150px] sm:max-w-[300px] text-sm sm:text-base">
                      {post.title}
                    </div>
                    {/* Mobile meta info */}
                    <div className="flex items-center gap-2 mt-1 md:hidden">
                      <span className="text-xs text-muted-foreground truncate max-w-[100px]">{post.author}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{post.views.toLocaleString()} views</span>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-foreground text-sm">
                        {post.author}
                      </span>
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 text-muted-foreground text-sm">
                    {post.category}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <Badge 
                      variant="outline" 
                      className={`${getStatusColor(post.status)} border-0 text-xs`}
                    >
                      {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 shrink-0" />
                      {new Date(post.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 font-medium text-foreground text-sm">
                    {post.views.toLocaleString()}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem asChild>
                          <a href={`/blog/${post.id}`} target="_blank" className="flex items-center">
                            <Eye className="h-3 w-3 mr-2" />
                            View
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href={`/dashboard/posts/${post.id}/edit`} className="flex items-center">
                            <Edit className="h-3 w-3 mr-2" />
                            Edit
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600"
                          onClick={() => handleDelete(post.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}