"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Users as UsersIcon, Crown, RefreshCw, Search, UserX, ChevronLeft, Calendar, Globe, Wallet, Edit2, Trash2, X } from "lucide-react";

type User = {
  id: number;
  first_name: string;
  last_name: string | null;
  username: string | null;
  language_code: string | null;
  is_premium: boolean;
  is_bot: boolean;
  photo_url: string | null;
  added_to_attachment_menu: boolean;
  allows_write_to_pm: boolean;
  wallet_address: string | null;
  created_at: string;
  updated_at: string;
  last_login: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPremium, setFilterPremium] = useState<boolean | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshingUser, setRefreshingUser] = useState(false);

  useEffect(() => {
    // Get search query from URL if present
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId: number) => {
    setRefreshingUser(true);
    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch user details");
      }

      // Update the editing user with fresh data
      setEditingUser(data.user);

      // Also update in the users list
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? data.user : user
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to fetch user details");
    } finally {
      setRefreshingUser(false);
    }
  };

  const handleEditUser = async (user: User) => {
    setEditingUser(user);
    // Fetch fresh data immediately
    await fetchUserDetails(user.id);
  };

  const handleRemoveWallet = async (userId: number) => {
    if (!confirm("Are you sure you want to remove this user's wallet?")) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          action: "remove_wallet",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to remove wallet");
      }

      // Update the local state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, wallet_address: null } : user
        )
      );

      // Update editing user
      if (editingUser?.id === userId) {
        setEditingUser({ ...editingUser, wallet_address: null });
      }
      
      // Show success message
      alert("Wallet removed successfully");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove wallet");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("⚠️ Are you sure you want to DELETE this user?\n\nThis will permanently remove:\n- User account\n- All their proofs\n- All associated data\n\nThis action CANNOT be undone!")) {
      return;
    }

    // Double confirmation for safety
    if (!confirm("This is your LAST CHANCE!\n\nType 'DELETE' to confirm in your mind, then click OK to proceed.")) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to delete user");
      }

      // Remove user from local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));

      // Close the modal
      setEditingUser(null);

      // Show success message
      alert("User deleted successfully");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toString().includes(searchQuery);
    
    const matchesPremium = filterPremium === null || user.is_premium === filterPremium;
    
    return matchesSearch && matchesPremium;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  const stats = {
    total: users.length,
    premium: users.filter(u => u.is_premium).length,
    active24h: users.filter(u => {
      const lastLogin = new Date(u.last_login);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return lastLogin > dayAgo;
    }).length,
    withWallet: users.filter(u => u.wallet_address).length,
  };

  return (
    <div className="min-h-screen bg-app-surface p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin"
              className="rounded-lg bg-app-surface-secondary p-2 transition hover:bg-app-surface-secondary/80"
            >
              <ChevronLeft className="h-5 w-5 text-app-foreground" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-app-foreground">User Management</h1>
              <p className="text-sm text-app-muted">Manage Telegram users and their data</p>
            </div>
          </div>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-app-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-app-accent/90 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-500/20 p-2">
                <UsersIcon className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-app-muted">Total Users</p>
                <p className="text-2xl font-bold text-app-foreground">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-yellow-500/20 p-2">
                <Crown className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-xs text-app-muted">Premium Users</p>
                <p className="text-2xl font-bold text-app-foreground">{stats.premium}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/5 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-500/20 p-2">
                <Calendar className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-app-muted">Active (24h)</p>
                <p className="text-2xl font-bold text-app-foreground">{stats.active24h}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-500/20 p-2">
                <Wallet className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-app-muted">With Wallet</p>
                <p className="text-2xl font-bold text-app-foreground">{stats.withWallet}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-2xl bg-neutral-900/40 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted" />
              <input
                type="text"
                placeholder="Search by name, username, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg bg-app-surface py-2 pl-10 pr-4 text-sm text-app-foreground placeholder:text-app-muted focus:outline-none focus:ring-2 focus:ring-app-accent"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilterPremium(null)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  filterPremium === null
                    ? "bg-app-accent text-white"
                    : "bg-app-surface text-app-foreground hover:bg-app-surface/80"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterPremium(true)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  filterPremium === true
                    ? "bg-app-accent text-white"
                    : "bg-app-surface text-app-foreground hover:bg-app-surface/80"
                }`}
              >
                <Crown className="h-4 w-4" />
                Premium
              </button>
              <button
                onClick={() => setFilterPremium(false)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  filterPremium === false
                    ? "bg-app-accent text-white"
                    : "bg-app-surface text-app-foreground hover:bg-app-surface/80"
                }`}
              >
                Standard
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-red-500">
            <p className="font-medium">Error: {error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-app-accent" />
              <p className="text-app-muted">Loading users...</p>
            </div>
          </div>
        )}

        {/* Users List */}
        {!loading && !error && (
          <div className="rounded-2xl bg-neutral-900/40 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-app-foreground">
                Users ({filteredUsers.length})
              </h2>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <UserX className="mb-4 h-12 w-12 text-app-muted" />
                <p className="text-app-muted">
                  {searchQuery || filterPremium !== null
                    ? "No users match your filters"
                    : "No users found"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="rounded-lg bg-app-surface p-4 transition hover:bg-app-surface/80"
                  >
                    <div className="flex items-start gap-4">
                      {user.photo_url ? (
                        <Image
                          src={user.photo_url}
                          alt={user.first_name}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-full"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-app-accent/10">
                          <UsersIcon className="h-6 w-6 text-app-accent" />
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-app-foreground">
                                {user.first_name} {user.last_name}
                              </h3>
                              {user.is_premium && (
                                <Crown className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                            {user.username && (
                              <p className="text-sm text-app-muted">@{user.username}</p>
                            )}
                            <p className="text-xs text-app-muted">ID: {user.id}</p>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-app-muted">Last Login</p>
                            <p className="text-sm font-medium text-app-foreground">
                              {getTimeSince(user.last_login)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {user.language_code && (
                            <span className="flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-1 text-xs text-blue-500">
                              <Globe className="h-3 w-3" />
                              {user.language_code.toUpperCase()}
                            </span>
                          )}
                          
                          {user.wallet_address && (
                            <span className="flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-1 text-xs text-purple-500">
                              <Wallet className="h-3 w-3" />
                              TON Wallet
                            </span>
                          )}
                          
                          {user.allows_write_to_pm && (
                            <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs text-green-500">
                              Messages: ON
                            </span>
                          )}
                          
                          {user.added_to_attachment_menu && (
                            <span className="rounded-full bg-cyan-500/10 px-2 py-1 text-xs text-cyan-500">
                              In Menu
                            </span>
                          )}

                          {user.is_bot && (
                            <span className="rounded-full bg-orange-500/10 px-2 py-1 text-xs text-orange-500">
                              Bot
                            </span>
                          )}
                        </div>

                        <div className="mt-2 space-y-1">
                          {user.wallet_address && (
                            <div className="flex items-center gap-2 text-xs">
                              <Wallet className="h-3 w-3 text-app-muted" />
                              <span className="font-mono text-app-muted">
                                {user.wallet_address.slice(0, 8)}...{user.wallet_address.slice(-6)}
                              </span>
                            </div>
                          )}
                          <div className="text-xs text-app-muted">
                            Joined: {formatDate(user.created_at)}
                          </div>
                        </div>

                        <div className="mt-3">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="flex items-center gap-2 rounded-lg bg-app-accent px-3 py-1.5 text-sm font-medium text-white transition hover:bg-app-accent/90"
                          >
                            <Edit2 className="h-3 w-3" />
                            Edit User
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-app-surface p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-app-foreground">
                  Edit User
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchUserDetails(editingUser.id)}
                    disabled={refreshingUser}
                    className="rounded-lg p-2 transition hover:bg-app-surface-secondary disabled:opacity-50"
                    title="Refresh user data"
                  >
                    <RefreshCw className={`h-5 w-5 text-app-foreground ${refreshingUser ? "animate-spin" : ""}`} />
                  </button>
                  <button
                    onClick={() => setEditingUser(null)}
                    className="rounded-lg p-2 transition hover:bg-app-surface-secondary"
                  >
                    <X className="h-5 w-5 text-app-foreground" />
                  </button>
                </div>
              </div>

              <div className="mb-6 space-y-3">
                <div className="flex items-center gap-3">
                  {editingUser.photo_url ? (
                    <Image
                      src={editingUser.photo_url}
                      alt={editingUser.first_name}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-full"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-app-accent/10">
                      <UsersIcon className="h-6 w-6 text-app-accent" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-app-foreground">
                        {editingUser.first_name} {editingUser.last_name}
                      </h3>
                      {editingUser.is_premium && (
                        <Crown className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    {editingUser.username && (
                      <p className="text-sm text-app-muted">@{editingUser.username}</p>
                    )}
                    <p className="text-xs text-app-muted">ID: {editingUser.id}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Wallet Section */}
                <div className="rounded-lg bg-app-surface-secondary p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-app-foreground" />
                      <h3 className="font-semibold text-app-foreground">TON Wallet</h3>
                    </div>
                    {refreshingUser && (
                      <span className="text-xs text-app-muted">Refreshing...</span>
                    )}
                  </div>
                  
                  {editingUser.wallet_address ? (
                    <div className="space-y-3">
                      <div className="rounded-lg bg-app-surface p-3">
                        <p className="mb-1 text-xs text-app-muted">Address</p>
                        <p className="break-all font-mono text-sm text-app-foreground">
                          {editingUser.wallet_address}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveWallet(editingUser.id)}
                        disabled={actionLoading}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500 transition hover:bg-red-500/20 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        {actionLoading ? "Removing..." : "Remove Wallet"}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-app-muted">No wallet connected</p>
                      <p className="text-xs text-amber-500/80">
                        💡 If you believe this is incorrect, click the refresh button above to reload the latest data from the database.
                      </p>
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="rounded-lg bg-app-surface-secondary p-4">
                  <h3 className="mb-3 font-semibold text-app-foreground">User Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-app-muted">Last Login:</span>
                      <span className="text-app-foreground">{getTimeSince(editingUser.last_login)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-app-muted">Joined:</span>
                      <span className="text-app-foreground">{formatDate(editingUser.created_at)}</span>
                    </div>
                    {editingUser.language_code && (
                      <div className="flex justify-between">
                        <span className="text-app-muted">Language:</span>
                        <span className="text-app-foreground">{editingUser.language_code.toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                  <h3 className="mb-2 font-semibold text-red-500">⚠️ Danger Zone</h3>
                  <p className="mb-3 text-xs text-app-muted">
                    Deleting a user is permanent and cannot be undone. All user data, proofs, and associated records will be permanently removed.
                  </p>
                  <button
                    onClick={() => handleDeleteUser(editingUser.id)}
                    disabled={actionLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    {actionLoading ? "Deleting..." : "Delete User Permanently"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
