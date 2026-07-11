"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users, Plus, Shield, UserCog, Trash2, AlertTriangle,
  Mail, Key, User, Search, RefreshCw,
  Check, X, Crown, Edit3, Calendar, FileText
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  role: string;
  avatar: string | null;
  createdAt: string;
  _count?: { posts: number };
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState("EDITOR");
  const [saving, setSaving] = useState(false);

  // Create form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("EDITOR");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch users",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      toast({
        title: "Error",
        description: "Could not connect to server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword) {
      toast({ title: "Error", description: "Email and password are required", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword,
          role: newRole,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({
          title: "User created",
          description: `${data.user.email} created as ${data.user.role}`,
        });
        setNewName("");
        setNewEmail("");
        setNewPassword("");
        setNewRole("EDITOR");
        setShowCreateForm(false);
        fetchUsers();
      } else {
        toast({ title: "Error", description: data.error || "Failed to create user", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to create user", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({
          title: "Role updated",
          description: `User role changed to ${newRole}`,
        });
        setEditingRole(null);
        fetchUsers();
      } else {
        toast({ title: "Error", description: data.error || "Failed to update role", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to update role", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!window.confirm(`Are you sure you want to delete ${userEmail}? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "User deleted", description: `${userEmail} has been deleted` });
        fetchUsers();
      } else {
        toast({ title: "Error", description: data.error || "Failed to delete user", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete user", variant: "destructive" });
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return { label: "Admin", class: "text-amber-500 bg-amber-500/10 border-amber-500/30", icon: Crown };
      case "EDITOR":
        return { label: "Editor", class: "text-blue-500 bg-blue-500/10 border-blue-500/30", icon: Edit3 };
      case "BANNED":
        return { label: "Banned", class: "text-red-500 bg-red-500/10 border-red-500/30", icon: AlertTriangle };
      default:
        return { label: role, class: "text-gray-500 bg-gray-500/10 border-gray-500/30", icon: User };
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const adminUser = users.find((u) => u.role === "ADMIN");

  return (
    <div className="p-6 space-y-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
              <Users className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">User Management</h1>
              <p className="text-muted-foreground mt-1">
                Manage users, assign roles, and control access
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchUsers} variant="outline" size="sm" className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateForm(!showCreateForm)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <Card className="p-6 border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Create New User</h2>
              <p className="text-sm text-muted-foreground">Add a new user with a specific role</p>
            </div>
          </div>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="John Doe"
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Password *</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Role</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring appearance-none"
                  >
                    <option value="EDITOR">Editor</option>
                    <option value="ADMIN">Admin</option>
                    <option value="BANNED">Banned</option>
                  </select>
                </div>
                {newRole === "ADMIN" && adminUser && (
                  <p className="text-xs text-amber-500 mt-1">
                    Current admin ({adminUser.email}) will be demoted to Editor. Only one admin allowed.
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="gap-2">
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Create User
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Admin Info */}
      {adminUser && (
        <Card className="p-4 border border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <Crown className="h-5 w-5 text-amber-500" />
            <div className="text-sm">
              <span className="font-medium text-foreground">Current Admin:</span>{" "}
              <span className="text-muted-foreground">{adminUser.name || adminUser.email}</span>
              <span className="text-xs text-muted-foreground ml-2">
                — Only one user can have the Admin role at a time
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Users Table */}
      <Card className="overflow-hidden border-muted-foreground/20">
        {/* Search & Stats */}
        <div className="border-b border-muted-foreground/10 bg-gradient-to-r from-background via-muted/30 to-background">
          <div className="flex items-center gap-3 px-5 py-3 border-b border-muted-foreground/10">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>Total Users: {users.length}</span>
              <span className="text-muted-foreground/30">|</span>
              <span className="text-amber-500">Admin: {users.filter((u) => u.role === "ADMIN").length}</span>
              <span className="text-muted-foreground/30">|</span>
              <span className="text-blue-500">Editors: {users.filter((u) => u.role === "EDITOR").length}</span>
            </div>
          </div>
          <div className="px-5 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="divide-y divide-muted-foreground/10">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg font-mono text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Loading users...</span>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg font-mono text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>No users found matching your search.</span>
              </div>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const roleBadge = getRoleBadge(user.role);
              const RoleIcon = roleBadge.icon;
              const isAdmin = user.role === "ADMIN";

              return (
                <div key={user.id} className={`group transition-colors hover:bg-muted/30 ${isAdmin ? "bg-amber-500/[0.02]" : ""}`}>
                  <div className="flex items-center gap-4 px-5 py-4">
                    {/* Avatar */}
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      isAdmin ? "bg-amber-500/20 text-amber-500" : "bg-muted text-muted-foreground"
                    }`}>
                      {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate">
                          {user.name || "Unnamed"}
                        </span>
                        {isAdmin && (
                          <Crown className="h-3.5 w-3.5 text-amber-500" />
                        )}
                        {editingRole === user.id ? (
                          <div className="flex items-center gap-1">
                            <select
                              value={selectedRole}
                              onChange={(e) => setSelectedRole(e.target.value)}
                              className="h-7 rounded-md border border-input bg-background px-2 text-xs outline-none"
                              autoFocus
                            >
                              <option value="EDITOR">Editor</option>
                              <option value="ADMIN">Admin</option>
                              <option value="BANNED">Banned</option>
                            </select>
                            <button
                              onClick={() => handleRoleChange(user.id, selectedRole)}
                              disabled={saving}
                              className="p-1 rounded hover:bg-emerald-500/10 text-emerald-500"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingRole(null)}
                              className="p-1 rounded hover:bg-red-500/10 text-red-500"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <Badge variant="outline" className={`font-mono text-[10px] uppercase tracking-wider ${roleBadge.class}`}>
                            <RoleIcon className="h-2.5 w-2.5 mr-1" />
                            {roleBadge.label}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                        {user._count && (
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {user._count.posts} posts
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setEditingRole(user.id);
                          setSelectedRole(user.role);
                        }}
                        className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
                        title="Change role"
                      >
                        <UserCog className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.email)}
                        className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10"
                        title="Delete user"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
