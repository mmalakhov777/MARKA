"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, ExternalLink, RefreshCw, Eye, EyeOff, Users } from "lucide-react";

type Proof = {
  id: number;
  user_id: number | null; // Legacy: Telegram ID
  user_v2_id: string | null; // New: UUID
  hash: string;
  file_name: string;
  file_size: number;
  file_type: string;
  ton_transaction_hash: string | null;
  ton_transaction_lt: string | null;
  tonscan_url: string | null;
  status: string | null;
  error_message: string | null;
  last_checked_at: string | null;
  created_at: string;
  updated_at: string;
};

type ProofFormData = {
  hash: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  tonTransactionHash: string;
  tonTransactionLt: string;
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProof, setEditingProof] = useState<Proof | null>(null);
  const [formData, setFormData] = useState<ProofFormData>({
    hash: "",
    fileName: "",
    fileSize: 0,
    fileType: "",
    tonTransactionHash: "",
    tonTransactionLt: ""
  });

  useEffect(() => {
    // Check authentication status from server
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/admin/auth");
      const data = await response.json();
      
      if (data.authenticated) {
        setIsAuthenticated(true);
        fetchProofs();
      }
    } catch (error) {
      // Not authenticated
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    
    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(true);
        setAuthError("");
        setPassword("");
        fetchProofs();
      } else {
        setAuthError(data.error || "Invalid password");
        setPassword("");
      }
    } catch (error) {
      setAuthError("Authentication failed. Please try again.");
      setPassword("");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", {
        method: "DELETE",
      });
    } catch (error) {
      // Ignore errors during logout
    }
    
    setIsAuthenticated(false);
    setPassword("");
    setProofs([]);
  };

  const fetchProofs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/proofs");
      const result = await response.json();
      
      if (result.success) {
        setProofs(result.data);
        setError(null);
      } else {
        setError(result.error || "Failed to fetch proofs");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      hash: "",
      fileName: "",
      fileSize: 0,
      fileType: "",
      tonTransactionHash: "",
      tonTransactionLt: ""
    });
    setEditingProof(null);
    setShowForm(false);
  };

  const handleEdit = (proof: Proof) => {
    setFormData({
      hash: proof.hash,
      fileName: proof.file_name,
      fileSize: proof.file_size,
      fileType: proof.file_type,
      tonTransactionHash: proof.ton_transaction_hash || "",
      tonTransactionLt: proof.ton_transaction_lt || ""
    });
    setEditingProof(proof);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingProof 
        ? `/api/admin/proofs/${editingProof.id}`
        : "/api/admin/proofs";
      
      const method = editingProof ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (result.success) {
        await fetchProofs();
        resetForm();
        setError(null);
      } else {
        setError(result.error || "Operation failed");
      }
    } catch (err) {
      setError("Network error occurred");
    }
  };

  const handleDelete = async (proof: Proof) => {
    if (!confirm(`Are you sure you want to delete proof "${proof.file_name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/proofs/${proof.id}`, {
        method: "DELETE",
      });

      const result = await response.json();
      
      if (result.success) {
        await fetchProofs();
        setError(null);
      } else {
        setError(result.error || "Delete failed");
      }
    } catch (err) {
      setError("Network error occurred");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-neutral-900 rounded-lg p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Access</h1>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg pr-10 focus:border-teal-500 focus:outline-none"
                  placeholder="Enter admin password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors"
            >
              Access Admin Panel
            </button>
          </form>

          <div className="mt-6 p-3 bg-neutral-800 rounded-lg text-xs text-neutral-400">
            <p className="font-medium mb-1">⚠️ Default password: admin123</p>
            <p>Set ADMIN_PASSWORD environment variable to change it</p>
            <p className="mt-2 text-amber-400">For production: Set strong password + SESSION_SECRET</p>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN PANEL
  return (
    <>
      {/* Admin Header */}
      <div className="bg-neutral-900 border-b border-neutral-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-neutral-100">TON Proof Admin</h1>
            <span className="px-2 py-1 bg-teal-500/20 text-teal-400 rounded text-xs font-medium">
              Authenticated
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/users"
              className="flex items-center gap-2 rounded-lg bg-app-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-app-accent/90"
            >
              <Users className="h-4 w-4" />
              Manage Users
            </Link>
            <Link 
              href="/" 
              className="text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              ← Back to App
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Admin Content */}
      <div className="text-neutral-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Database Management</h1>
            <p className="text-neutral-400">Manage TON proof database records</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="mb-6 flex flex-wrap gap-4">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add New Proof
            </button>
            
            <button
              onClick={fetchProofs}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading proofs...</span>
            </div>
          )}

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-neutral-900 rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">
                  {editingProof ? "Edit Proof" : "Add New Proof"}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Hash *</label>
                    <input
                      type="text"
                      value={formData.hash}
                      onChange={(e) => setFormData({ ...formData, hash: e.target.value })}
                      className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">File Name *</label>
                    <input
                      type="text"
                      value={formData.fileName}
                      onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                      className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">File Size (bytes)</label>
                    <input
                      type="number"
                      value={formData.fileSize}
                      onChange={(e) => setFormData({ ...formData, fileSize: parseInt(e.target.value) || 0 })}
                      className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">File Type</label>
                    <input
                      type="text"
                      value={formData.fileType}
                      onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                      className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded"
                      placeholder="e.g. image/png"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">TON Transaction Hash</label>
                    <input
                      type="text"
                      value={formData.tonTransactionHash}
                      onChange={(e) => setFormData({ ...formData, tonTransactionHash: e.target.value })}
                      className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">TON Transaction LT</label>
                    <input
                      type="text"
                      value={formData.tonTransactionLt}
                      onChange={(e) => setFormData({ ...formData, tonTransactionLt: e.target.value })}
                      className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded transition-colors"
                    >
                      {editingProof ? "Update" : "Create"}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 py-2 bg-neutral-600 hover:bg-neutral-500 text-white rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Table */}
          {!loading && (
            <div className="bg-neutral-900 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-800">
                    <tr>
                      <th className="px-4 py-3 text-left">ID</th>
                      <th className="px-4 py-3 text-left">User ID</th>
                      <th className="px-4 py-3 text-left">File Name</th>
                      <th className="px-4 py-3 text-left">Hash</th>
                      <th className="px-4 py-3 text-left">Size</th>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-left">TON TX</th>
                      <th className="px-4 py-3 text-left">Created</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proofs.map((proof) => (
                      <tr key={proof.id} className="border-t border-neutral-800 hover:bg-neutral-800/50">
                        <td className="px-4 py-3 font-mono">{proof.id}</td>
                        <td className="px-4 py-3">
                          {proof.user_v2_id ? (
                            <Link 
                              href={`/admin/users?search=${proof.user_v2_id}`}
                              className="font-mono text-xs text-teal-400 hover:text-teal-300 hover:underline"
                              title="View user details"
                            >
                              {proof.user_v2_id.substring(0, 8)}...
                            </Link>
                          ) : proof.user_id ? (
                            <Link 
                              href={`/admin/users?search=${proof.user_id}`}
                              className="font-mono text-teal-400 hover:text-teal-300 hover:underline"
                              title="View user details (legacy)"
                            >
                              {proof.user_id}
                            </Link>
                          ) : (
                            <span className="text-neutral-500 italic">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-3 max-w-xs truncate" title={proof.file_name}>
                          {proof.file_name}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs max-w-xs truncate" title={proof.hash}>
                          {proof.hash}
                        </td>
                        <td className="px-4 py-3">{formatFileSize(proof.file_size)}</td>
                        <td className="px-4 py-3">{proof.file_type}</td>
                        <td className="px-4 py-3">
                          {proof.ton_transaction_hash ? (
                            <a
                              href={`https://tonscan.org/tx/${proof.ton_transaction_hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-teal-400 hover:text-teal-300"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View
                            </a>
                          ) : (
                            <span className="text-neutral-500">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs">{formatDate(proof.created_at)}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(proof)}
                              className="p-1 text-neutral-400 hover:text-teal-400 transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(proof)}
                              className="p-1 text-neutral-400 hover:text-red-400 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {proofs.length === 0 && !loading && (
                <div className="p-8 text-center text-neutral-500">
                  No proofs found. Upload some files or add proofs manually.
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="mt-6 text-sm text-neutral-400">
            Total proofs: {proofs.length}
          </div>
        </div>
      </div>
    </>
  );
}
