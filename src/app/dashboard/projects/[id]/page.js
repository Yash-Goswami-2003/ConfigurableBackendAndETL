"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id;

  const [currentUser, setCurrentUser] = useState(null);
  const [project, setProject] = useState(null);
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Connection String Connector State
  const [postgresConnection, setPostgresConnection] = useState("");
  const [savingConnector, setSavingConnector] = useState(false);
  const [connectorSuccess, setConnectorSuccess] = useState("");

  // Endpoint Modal & Form State
  const [showEndpointModal, setShowEndpointModal] = useState(false);
  const [newEndpointName, setNewEndpointName] = useState("");
  const [newEndpointMethod, setNewEndpointMethod] = useState("GET");
  const [newEndpointPath, setNewEndpointPath] = useState("");
  const [creatingEndpoint, setCreatingEndpoint] = useState(false);
  const [endpointError, setEndpointError] = useState("");

  const [copiedId, setCopiedId] = useState(null);

  // Authenticate user
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("weave_user");
      if (!stored) {
        router.push("/login");
      } else {
        setCurrentUser(JSON.parse(stored));
      }
    }
  }, []);

  // Fetch project details and its endpoints
  useEffect(() => {
    if (!projectId || !currentUser) return;

    async function loadProjectDetails() {
      try {
        setLoading(true);
        const res = await fetch(`/api/projects/${projectId}`);
        if (!res.ok) {
          throw new Error("Failed to load project details");
        }
        const data = await res.json();
        setProject(data.project);
        setEndpoints(data.endpoints || []);
        setPostgresConnection(data.project.postgres_connection || "");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadProjectDetails();
  }, [projectId, currentUser]);

  // Copy Endpoint Path helper
  const handleCopyPath = (e, id, path) => {
    e.preventDefault();
    e.stopPropagation();
    const fullUrl = `${window.location.protocol}//${window.location.host}/api/v1${path}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Update Postgres connection string connector
  const handleSaveConnector = async (e) => {
    e.preventDefault();
    setSavingConnector(true);
    setConnectorSuccess("");
    setError("");

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postgresConnection: postgresConnection.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update connection string");
      }

      setConnectorSuccess("Database connection string updated successfully!");
      setProject({ ...project, postgres_connection: postgresConnection.trim() });
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingConnector(false);
    }
  };

  // Create Endpoint inside project
  const handleCreateEndpoint = async (e) => {
    e.preventDefault();
    setCreatingEndpoint(true);
    setEndpointError("");

    try {
      const res = await fetch("/api/endpoints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newEndpointName,
          method: newEndpointMethod,
          path: newEndpointPath,
          configuration: { description: "Visual REST layout created under project" },
          orgId: currentUser.organisationId,
          projectId: Number(projectId)
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to configure endpoint");
      }

      setEndpoints([data.endpoint, ...endpoints]);
      setNewEndpointName("");
      setNewEndpointPath("");
      setShowEndpointModal(false);
    } catch (err) {
      setEndpointError(err.message);
    } finally {
      setCreatingEndpoint(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center font-sans">
        <svg className="animate-spin h-8 w-8 text-zinc-900 mb-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-sm font-semibold text-zinc-500">Loading project detail...</span>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center font-sans p-4">
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 text-center max-w-md shadow-sm">
          <svg className="mx-auto h-12 w-12 text-red-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-sm font-bold text-zinc-800">Connection Failed</h3>
          <p className="text-xs text-zinc-500 mt-1 mb-4">{error}</p>
          <Link href="/dashboard" className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-xl transition-all">
            Return to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans flex flex-col relative select-none">
      
      {/* Top Header */}
      <header className="relative z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md px-8 py-4 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-300 px-3 py-1.5 rounded-xl bg-white shadow-3xs transition-all active:scale-95"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Dashboard
          </Link>
          <div className="h-4 w-px bg-zinc-200" />
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Project Console</span>
            <h2 className="text-sm font-extrabold text-zinc-900 leading-tight mt-0.5">{project?.name}</h2>
          </div>
        </div>
      </header>

      {/* Workspace Area */}
      <main className="max-w-6xl w-full mx-auto p-8 space-y-8 flex-1">
        
        {/* Project Meta Info Panel */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl text-left">
            <h1 className="text-xl font-black tracking-tight text-zinc-900">{project?.name}</h1>
            <p className="text-xs text-zinc-500 leading-relaxed">
              {project?.description || "Build and connect microservices and visual database flows inside this project."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEndpointModal(true)}
              className="text-xs font-semibold px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl transition-all duration-150 cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Create API Endpoint
            </button>
          </div>
        </div>

        {/* Two Columns Grid: Connector Configuration (Left/Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Connector Sidebar Config (1/3 cols) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs text-left">
              <h3 className="text-xs font-bold text-zinc-800 tracking-wide uppercase border-b border-zinc-100 pb-3 mb-4">Connectors</h3>
              
              {/* Postgres Connector Form */}
              <form onSubmit={handleSaveConnector} className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-bold text-zinc-700">Postgres Connector</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-normal">
                    Set a dynamic environment database connection pool string to execute Postgres nodes against this database instead of Weave's default DB.
                  </p>
                  
                  <input
                    type="password"
                    value={postgresConnection}
                    onChange={(e) => setPostgresConnection(e.target.value)}
                    placeholder="postgresql://user:password@host:port/dbname"
                    className="w-full text-xs bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl px-3 py-2.5 outline-none transition-all font-mono"
                  />
                </div>

                {connectorSuccess && (
                  <p className="text-[10.5px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 p-2 rounded-lg leading-snug">
                    {connectorSuccess}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={savingConnector}
                  className="w-full text-xs font-bold py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 disabled:opacity-50 rounded-xl transition-all cursor-pointer shadow-3xs border border-zinc-200/50"
                >
                  {savingConnector ? "Saving changes..." : "Save Connection String"}
                </button>
              </form>
            </div>
          </div>

          {/* Endpoints Table (2/3 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs text-left">
              <h3 className="text-xs font-bold text-zinc-800 tracking-wide uppercase border-b border-zinc-100 pb-3 mb-4">Endpoints list</h3>
              
              {endpoints.length === 0 ? (
                <div className="py-16 border border-dashed border-zinc-200 rounded-2xl text-center bg-zinc-50/50">
                  <svg className="mx-auto h-8 w-8 text-zinc-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h4 className="text-xs font-bold text-zinc-700">No API endpoints configured yet</h4>
                  <p className="text-[11px] text-zinc-400 mt-1">Configure your first visual endpoint under this project.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {endpoints.map((ep) => {
                    const getMethodStyle = (m) => {
                      switch (m?.toUpperCase()) {
                        case "GET":
                          return "bg-blue-50 text-blue-700 border-blue-100";
                        case "POST":
                          return "bg-emerald-50 text-emerald-700 border-emerald-100";
                        case "PUT":
                          return "bg-amber-50 text-amber-700 border-amber-100";
                        case "DELETE":
                          return "bg-rose-50 text-rose-700 border-rose-100";
                        default:
                          return "bg-zinc-50 text-zinc-600 border-zinc-200";
                      }
                    };

                    return (
                      <Link
                        key={ep.id}
                        href={`/dashboard/builder/${ep.id}`}
                        className="p-4 bg-white border border-zinc-200/80 rounded-xl hover:border-zinc-300 hover:shadow-2xs transition-all duration-200 flex items-center justify-between gap-4 cursor-pointer select-none"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-zinc-800 truncate">{ep.name}</h4>
                          <div className="flex items-center gap-2">
                            <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.2 rounded border ${getMethodStyle(ep.method)}`}>
                              {ep.method}
                            </span>
                            <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200/50 px-2 py-0.5 rounded-lg">
                              <code className="text-[10px] font-mono text-zinc-500 truncate max-w-[200px] md:max-w-[320px]">
                                /api/v1{ep.path}
                              </code>
                              <button
                                onClick={(e) => handleCopyPath(e, ep.id, ep.path)}
                                className="text-zinc-400 hover:text-zinc-700 p-0.5 rounded transition-colors cursor-pointer"
                                title="Copy endpoint URL"
                              >
                                {copiedId === ep.id ? (
                                  <span className="text-[8px] font-bold text-emerald-600">Copied!</span>
                                ) : (
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-[9.5px] text-zinc-400 font-mono">
                          <svg className="w-3.5 h-3.5 text-zinc-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {new Date(ep.created_at).toLocaleDateString()}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>

      </main>

      {/* Add Endpoint Modal */}
      {showEndpointModal && (
        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 w-full max-w-md shadow-xl mx-4 transition-all text-left">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 mb-0.5">Configure New API Endpoint</h3>
                <p className="text-[11px] text-zinc-400">Set name, HTTP method, and path rules below</p>
              </div>
              <button
                onClick={() => setShowEndpointModal(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg hover:bg-zinc-50 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {endpointError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 text-xs font-semibold text-red-600 rounded-lg">
                {endpointError}
              </div>
            )}

            <form onSubmit={handleCreateEndpoint} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[9.5px] font-bold text-zinc-400 uppercase tracking-wider">Endpoint Name</label>
                <input
                  type="text"
                  required
                  value={newEndpointName}
                  onChange={(e) => setNewEndpointName(e.target.value)}
                  placeholder="e.g. Fetch Products List"
                  className="w-full text-xs bg-zinc-50 border border-zinc-200 focus:border-zinc-900 focus:bg-white rounded-xl px-3 py-2.5 outline-none transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1 space-y-1">
                  <label className="block text-[9.5px] font-bold text-zinc-400 uppercase tracking-wider">Method</label>
                  <select
                    value={newEndpointMethod}
                    onChange={(e) => setNewEndpointMethod(e.target.value)}
                    className="w-full text-xs bg-zinc-50 border border-zinc-200 focus:border-zinc-900 focus:bg-white rounded-xl px-3 py-2.5 outline-none transition-all font-medium appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2371717a'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/></svg>")`, backgroundPosition: 'right 12px center', backgroundSize: '12px', backgroundRepeat: 'no-repeat' }}
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="block text-[9.5px] font-bold text-zinc-400 uppercase tracking-wider">Path Route (relative)</label>
                  <input
                    type="text"
                    required
                    value={newEndpointPath}
                    onChange={(e) => setNewEndpointPath(e.target.value)}
                    placeholder="e.g. /products"
                    className="w-full text-xs bg-zinc-50 border border-zinc-200 focus:border-zinc-900 focus:bg-white rounded-xl px-3 py-2.5 outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <div className="border-t border-zinc-100 pt-4 flex justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setShowEndpointModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-800 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingEndpoint}
                  className="px-4 py-2 text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {creatingEndpoint ? "Configuring..." : "Add Endpoint"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
