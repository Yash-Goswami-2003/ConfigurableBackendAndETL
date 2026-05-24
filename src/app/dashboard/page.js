"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("endpoints"); // 'endpoints', 'docs', 'posts', 'members'
  
  // Data lists
  const [endpoints, setEndpoints] = useState([]);
  const [posts, setPosts] = useState([]);
  const [members, setMembers] = useState([]);

  // Loaders and errors
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Modals / Form toggles
  const [showEndpointModal, setShowEndpointModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);

  // New item form inputs
  const [newEndpointName, setNewEndpointName] = useState("");
  const [newEndpointMethod, setNewEndpointMethod] = useState("GET");
  const [newEndpointPath, setNewEndpointPath] = useState("");
  
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");

  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberPassword, setNewMemberPassword] = useState("");

  // 1. Authenticate user from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("weave_user");
      if (!stored) {
        router.push("/login");
      } else {
        const parsed = JSON.parse(stored);
        setCurrentUser(parsed);
        setLoadingUser(false);
      }
    }
  }, []);

  // 2. Fetch data based on active tab and orgId
  useEffect(() => {
    if (!currentUser) return;
    
    async function fetchData() {
      setLoadingData(true);
      setActionError("");
      setActionSuccess("");
      try {
        const orgId = currentUser.organisationId;
        if (activeTab === "endpoints") {
          const res = await fetch(`/api/endpoints?orgId=${orgId}`);
          if (res.ok) {
            const data = await res.json();
            setEndpoints(data.endpoints || []);
          }
        } else if (activeTab === "posts") {
          const res = await fetch(`/api/posts?orgId=${orgId}`);
          if (res.ok) {
            const data = await res.json();
            setPosts(data.posts || []);
          }
        } else if (activeTab === "members") {
          const res = await fetch(`/api/members?orgId=${orgId}`);
          if (res.ok) {
            const data = await res.json();
            setMembers(data.members || []);
          }
        }
      } catch (err) {
        console.error("Fetch dashboard data error:", err);
      } finally {
        setLoadingData(false);
      }
    }

    fetchData();
  }, [currentUser, activeTab]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("weave_user");
      router.push("/login");
    }
  };

  // 3. Create new endpoint logic
  const handleCreateEndpoint = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError("");
    setActionSuccess("");

    try {
      const res = await fetch("/api/endpoints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newEndpointName,
          method: newEndpointMethod,
          path: newEndpointPath,
          configuration: { description: "Visual REST layout created in Weave Dashboard" },
          orgId: currentUser.organisationId
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setActionError(data.error || "Failed to create endpoint.");
      } else {
        setActionSuccess("Endpoint created successfully!");
        setEndpoints([data.endpoint, ...endpoints]);
        setNewEndpointName("");
        setNewEndpointPath("");
        setShowEndpointModal(false);
      }
    } catch (err) {
      setActionError("Server connection error. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Create new post logic
  const handleCreatePost = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError("");
    setActionSuccess("");

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newPostTitle,
          content: newPostContent,
          userId: currentUser.id,
          orgId: currentUser.organisationId
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setActionError(data.error || "Failed to publish post.");
      } else {
        setActionSuccess("Announcement published successfully!");
        // Re-inject with local user details for instant refresh
        const freshPost = {
          ...data.post,
          author_name: currentUser.name
        };
        setPosts([freshPost, ...posts]);
        setNewPostTitle("");
        setNewPostContent("");
        setShowPostModal(false);
      }
    } catch (err) {
      setActionError("Server connection error.");
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Add new organization member logic (Admin only)
  const handleAddMember = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError("");
    setActionSuccess("");

    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newMemberName,
          email: newMemberEmail,
          password: newMemberPassword,
          orgId: currentUser.organisationId,
          adminUserId: currentUser.id
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setActionError(data.error || "Failed to add member account.");
      } else {
        setActionSuccess("Member account added successfully!");
        setMembers([...members, data.member]);
        setNewMemberName("");
        setNewMemberEmail("");
        setNewMemberPassword("");
        setShowMemberForm(false);
      }
    } catch (err) {
      setActionError("Server connection error.");
    } finally {
      setActionLoading(false);
    }
  };

  // 6. Delete member logic (Admin only)
  const handleDeleteMember = async (memberId) => {
    if (!confirm("Are you sure you want to remove this member account from the organization?")) return;
    
    setActionLoading(true);
    setActionError("");
    setActionSuccess("");

    try {
      const res = await fetch(`/api/members?memberId=${memberId}&adminUserId=${currentUser.id}&orgId=${currentUser.organisationId}`, {
        method: "DELETE"
      });

      const data = await res.json();

      if (!res.ok) {
        setActionError(data.error || "Failed to remove member.");
      } else {
        setActionSuccess("Member removed successfully.");
        setMembers(members.filter(m => m.id !== memberId));
      }
    } catch (err) {
      setActionError("Server connection error.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans">
        <svg className="animate-spin h-8 w-8 text-zinc-950 mb-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-sm font-semibold text-zinc-500">Loading Weave Workspace...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans flex flex-col relative select-none">
      
      {/* Background Dot Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40 z-0" />

      {/* Top Header / Navigation Section */}
      <header className="relative z-10 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        
        {/* Brand details */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-8 h-8 text-zinc-900" fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round">
                <path d="M20,50 Q35,20 50,50 T80,50" />
                <path d="M20,50 Q35,80 50,50 T80,50" className="opacity-45" strokeWidth="6" />
                <circle cx="50" cy="50" r="5" className="fill-zinc-900" />
              </svg>
            </div>
            <span className="font-semibold text-lg tracking-tight">Weave</span>
          </Link>
          <div className="h-4 w-px bg-zinc-200" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Organization:</span>
            <span className="text-xs font-bold text-zinc-800 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded">
              {currentUser.organisationName}
            </span>
            <span className={`text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded ${
              currentUser.role === "admin" 
                ? "bg-zinc-900 text-white" 
                : "bg-zinc-100 text-zinc-600 border border-zinc-200"
            }`}>
              {currentUser.role === "admin" ? "Super User (Admin)" : "Member"}
            </span>
          </div>
        </div>

        {/* User context */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-bold text-zinc-800">{currentUser.name}</span>
            <span className="text-[10px] text-zinc-400 font-mono">{currentUser.email}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="text-xs font-semibold px-3.5 py-1.5 border border-zinc-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 rounded-lg transition-all cursor-pointer shadow-xs"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Main Panel Area */}
      <div className="relative z-10 flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto px-6 py-8 gap-8">
        
        {/* Left Sidebar Navigator */}
        <aside className="w-full md:w-[240px] shrink-0 space-y-6">
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs">
            <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest px-3 mb-3">Navigation</div>
            
            <nav className="space-y-1">
              <button 
                onClick={() => setActiveTab("endpoints")}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-left ${
                  activeTab === "endpoints" 
                    ? "bg-zinc-950 text-white" 
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
                }`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <polyline points="4 17 10 11 4 5" />
                  <line x1="12" y1="19" x2="20" y2="19" />
                </svg>
                Endpoints List
              </button>

              <button 
                onClick={() => setActiveTab("docs")}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-left ${
                  activeTab === "docs" 
                    ? "bg-zinc-950 text-white" 
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
                }`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                Visual API Docs
              </button>

              <button 
                onClick={() => setActiveTab("posts")}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-left ${
                  activeTab === "posts" 
                    ? "bg-zinc-950 text-white" 
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
                }`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Organization Posts
              </button>

              <button 
                onClick={() => setActiveTab("members")}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-left ${
                  activeTab === "members" 
                    ? "bg-zinc-950 text-white" 
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
                }`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Member Manager
              </button>
            </nav>
          </div>

          {/* Quick Info Box */}
          <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 text-[11px] text-zinc-500 leading-normal">
            <span className="font-semibold text-zinc-700 block mb-1">Weave Platform Notice</span>
            All database operations, configurations, and post boards are isolated under the <strong className="text-zinc-800">{currentUser.organisationName}</strong> schema boundary.
          </div>
        </aside>

        {/* Right Content Frame */}
        <main className="flex-1 bg-white border border-zinc-200/80 rounded-2xl p-6 min-h-[460px] shadow-sm flex flex-col">
          
          {/* Action alerts inside content card */}
          {actionError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-xs font-semibold text-red-600 rounded-lg">
              {actionError}
            </div>
          )}
          {actionSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-600 rounded-lg">
              {actionSuccess}
            </div>
          )}

          {/* Tab 1: Endpoints Config List */}
          {activeTab === "endpoints" && (
            <div className="flex-1 flex flex-col justify-between">
              
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900">Configured API Endpoints</h2>
                    <p className="text-xs text-zinc-400">Manage your active visual backend routes</p>
                  </div>
                  <button 
                    onClick={() => setShowEndpointModal(true)}
                    className="text-xs font-semibold px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    + Create New
                  </button>
                </div>

                {loadingData ? (
                  <div className="py-12 text-center text-xs text-zinc-400 font-medium">Loading endpoints...</div>
                ) : endpoints.length === 0 ? (
                  <div className="py-12 border border-dashed border-zinc-200 rounded-xl text-center">
                    <svg className="mx-auto h-8 w-8 text-zinc-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xs font-bold text-zinc-700">No endpoints created yet</h3>
                    <p className="text-[11px] text-zinc-400 mt-1">Configure your first visual data compiler now.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {endpoints.map((ep) => (
                      <div key={ep.id} className="p-4 border border-zinc-200 rounded-xl hover:border-zinc-300 transition-colors flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="text-xs font-bold text-zinc-900">{ep.name}</h3>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded border border-zinc-200/50">
                              {ep.method}
                            </span>
                            <code className="text-[10px] font-mono text-zinc-500 bg-zinc-50 px-1.5 py-0.5 rounded">
                              /api/v1{ep.path}
                            </code>
                          </div>
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          Created {new Date(ep.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Endpoint Modal */}
              {showEndpointModal && (
                <div className="fixed inset-0 bg-zinc-950/20 backdrop-blur-xs flex items-center justify-center z-50">
                  <div className="bg-white border border-zinc-200 rounded-2xl p-6 w-full max-w-md shadow-xl animate-fade-in mx-4">
                    <h3 className="text-sm font-bold text-zinc-900 mb-1">Configure New API Endpoint</h3>
                    <p className="text-[11px] text-zinc-400 mb-4">Set name, HTTP method, and path rules below</p>
                    
                    <form onSubmit={handleCreateEndpoint} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">Endpoint Name</label>
                        <input
                          required
                          type="text"
                          value={newEndpointName}
                          onChange={(e) => setNewEndpointName(e.target.value)}
                          placeholder="Fetch User Analytics"
                          className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-2 outline-none focus:border-zinc-900"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-1">
                          <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">Method</label>
                          <select
                            value={newEndpointMethod}
                            onChange={(e) => setNewEndpointMethod(e.target.value)}
                            className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-2 outline-none focus:border-zinc-900"
                          >
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="DELETE">DELETE</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">Route Path</label>
                          <input
                            required
                            type="text"
                            value={newEndpointPath}
                            onChange={(e) => setNewEndpointPath(e.target.value)}
                            placeholder="/users/:id/summary"
                            className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-2 outline-none focus:border-zinc-900 font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
                        <button
                          type="button"
                          onClick={() => setShowEndpointModal(false)}
                          className="text-[11px] font-semibold px-3 py-1.5 border border-zinc-200 hover:bg-zinc-50 rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={actionLoading}
                          className="text-[11px] font-semibold px-3 py-1.5 bg-zinc-950 text-white hover:bg-zinc-800 disabled:bg-zinc-400 rounded-lg cursor-pointer flex items-center gap-1"
                        >
                          {actionLoading && <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />}
                          Save Configuration
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Tab 2: Visual Integration Docs */}
          {activeTab === "docs" && (
            <div className="space-y-6">
              <div className="border-b border-zinc-100 pb-4">
                <h2 className="text-lg font-bold text-zinc-900">Developer Documentation</h2>
                <p className="text-xs text-zinc-400">Integrate Weave endpoints with your software stack</p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-zinc-800 mb-1.5">1. Fetching JSON responses</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed mb-2">
                    Invoke configured backend API paths via direct HTTPS fetch requests. Weave handles database calls, Stripe records, and LLMs in parallel before outputting mapped JSON payloads.
                  </p>
                  <pre className="text-[10px] font-mono text-zinc-600 bg-zinc-50 border border-zinc-200/60 p-3 rounded-lg leading-relaxed overflow-x-auto">
{`// Example invocation using JavaScript fetch
const response = await fetch("https://api.weave.dev/v1/endpoints/user-synthesizer", {
  method: "GET",
  headers: {
    "Authorization": "Bearer YOUR_ORGANIZATION_KEY"
  }
});
const data = await response.json();
console.log(data);`}
                  </pre>
                </div>

                <div className="border-t border-zinc-100 pt-4">
                  <h3 className="text-xs font-bold text-zinc-800 mb-1.5">2. Secure connection states</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Database credentials and Stripe credentials can be modified via connection nodes on your workspace graphs. Credentials are encrypted at rest using AES-GCM envelopes.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* Tab 3: Shared Bulletin Board Posts */}
          {activeTab === "posts" && (
            <div className="flex-1 flex flex-col justify-between">
              
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900">Organization Bulletin Board</h2>
                    <p className="text-xs text-zinc-400">Announcements shared across your organization team</p>
                  </div>
                  <button 
                    onClick={() => setShowPostModal(true)}
                    className="text-xs font-semibold px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    + Create Post
                  </button>
                </div>

                {loadingData ? (
                  <div className="py-12 text-center text-xs text-zinc-400 font-medium">Loading bulletins...</div>
                ) : posts.length === 0 ? (
                  <div className="py-12 border border-dashed border-zinc-200 rounded-xl text-center">
                    <h3 className="text-xs font-bold text-zinc-700">No board posts yet</h3>
                    <p className="text-[11px] text-zinc-400 mt-1">Publish an update to share with your organization team members.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div key={post.id} className="p-5 border border-zinc-200 rounded-2xl bg-zinc-50/20 space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="text-sm font-bold text-zinc-900">{post.title}</h3>
                          <div className="text-right">
                            <span className="text-[10px] text-zinc-500 font-bold block">{post.author_name}</span>
                            <span className="text-[9px] text-zinc-400 font-mono block">
                              {new Date(post.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-zinc-600 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Create Post Modal */}
              {showPostModal && (
                <div className="fixed inset-0 bg-zinc-950/20 backdrop-blur-xs flex items-center justify-center z-50">
                  <div className="bg-white border border-zinc-200 rounded-2xl p-6 w-full max-w-md shadow-xl animate-fade-in mx-4">
                    <h3 className="text-sm font-bold text-zinc-900 mb-1">Create Announcement</h3>
                    <p className="text-[11px] text-zinc-400 mb-4">Post is visible to all organization users</p>
                    
                    <form onSubmit={handleCreatePost} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">Post Title</label>
                        <input
                          required
                          type="text"
                          value={newPostTitle}
                          onChange={(e) => setNewPostTitle(e.target.value)}
                          placeholder="Feature Update: Stripe Ingestion Configured"
                          className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-2 outline-none focus:border-zinc-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">Content Details</label>
                        <textarea
                          required
                          rows={4}
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          placeholder="Write something to the team..."
                          className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-2 outline-none focus:border-zinc-900 resize-none"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
                        <button
                          type="button"
                          onClick={() => setShowPostModal(false)}
                          className="text-[11px] font-semibold px-3 py-1.5 border border-zinc-200 hover:bg-zinc-50 rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={actionLoading}
                          className="text-[11px] font-semibold px-3 py-1.5 bg-zinc-950 text-white hover:bg-zinc-800 disabled:bg-zinc-400 rounded-lg cursor-pointer flex items-center gap-1"
                        >
                          {actionLoading && <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />}
                          Publish Update
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Tab 4: Member Manager (Add/Delete Accounts) */}
          {activeTab === "members" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">Organization Members</h2>
                  <p className="text-xs text-zinc-400">View team members and manage login credentials</p>
                </div>
                
                {currentUser.role === "admin" && (
                  <button 
                    onClick={() => setShowMemberForm(!showMemberForm)}
                    className="text-xs font-semibold px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    {showMemberForm ? "Hide Form" : "+ Add Member"}
                  </button>
                )}
              </div>

              {/* Add Member Form (Admin Only) */}
              {currentUser.role === "admin" && showMemberForm && (
                <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl animate-fade-in space-y-4">
                  <h3 className="text-xs font-bold text-zinc-800">Add New Account</h3>
                  <p className="text-[10px] text-zinc-400">Define credentials below. Once created, they can log in directly using these details.</p>
                  
                  <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Full Name</label>
                      <input
                        required
                        type="text"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        placeholder="John Connor"
                        className="w-full text-xs bg-white border border-zinc-200 rounded-lg px-2.5 py-2 outline-none focus:border-zinc-950"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Work Email</label>
                      <input
                        required
                        type="email"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        placeholder="john@resistance.net"
                        className="w-full text-xs bg-white border border-zinc-200 rounded-lg px-2.5 py-2 outline-none focus:border-zinc-950"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Password</label>
                      <div className="flex gap-2">
                        <input
                          required
                          type="text"
                          value={newMemberPassword}
                          onChange={(e) => setNewMemberPassword(e.target.value)}
                          placeholder="Min 6 chars"
                          className="flex-1 text-xs bg-white border border-zinc-200 rounded-lg px-2.5 py-2 outline-none focus:border-zinc-950 font-mono"
                        />
                        <button
                          type="submit"
                          disabled={actionLoading}
                          className="px-4 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-400 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 flex items-center justify-center"
                        >
                          {actionLoading ? "..." : "Add"}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Members List */}
              {loadingData ? (
                <div className="py-12 text-center text-xs text-zinc-400 font-medium">Loading members list...</div>
              ) : (
                <div className="border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-200 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        <th className="px-6 py-3">Member</th>
                        <th className="px-6 py-3">Email Address</th>
                        <th className="px-6 py-3">Access Tier</th>
                        {currentUser.role === "admin" && <th className="px-6 py-3 text-right">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-xs">
                      {members.map((m) => (
                        <tr key={m.id} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-zinc-900">{m.name}</td>
                          <td className="px-6 py-4 font-mono text-zinc-500 text-[10.5px]">{m.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold tracking-wide uppercase ${
                              m.role === "admin" 
                                ? "bg-zinc-950 text-white" 
                                : "bg-zinc-100 text-zinc-500 border border-zinc-200/50"
                            }`}>
                              {m.role === "admin" ? "Admin" : "Member"}
                            </span>
                          </td>
                          {currentUser.role === "admin" && (
                            <td className="px-6 py-4 text-right">
                              {m.id === currentUser.id ? (
                                <span className="text-[10px] text-zinc-400 font-semibold italic">Your Account</span>
                              ) : (
                                <button
                                  onClick={() => handleDeleteMember(m.id)}
                                  className="text-[10px] font-semibold text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                                >
                                  Remove
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          )}

        </main>

      </div>

    </div>
  );
}
