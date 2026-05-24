"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { nodeTypes, NODE_TEMPLATES } from "@/components/nodes";

// Crisp SVG Icons matching categories
const NodeIcon = ({ name, className = "w-4 h-4 text-zinc-600" }) => {
  switch (name) {
    case "zap":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      );
    case "database":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125m16.5 0v3.75m-16.5-3.75v3.75" />
        </svg>
      );
    case "globe":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-.554-8.25-1.568m16.5 0a9.003 9.003 0 01-16.5 0" />
        </svg>
      );
    case "cpu":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m1.5 5.25H3m1.5 5.25H3m15-10.5H16.5m1.5 5.25H16.5m1.5 5.25H16.5m-5.25-15v1.5m0 15V21m-5.25-3.75H18c.414 0 .75-.336.75-.75V6c0-.414-.336-.75-.75-.75H6c-.414 0-.75.336-.75.75v11.25c0 .414.336.75.75.75z" />
        </svg>
      );
    case "git-branch":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.75a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM18 18.75V16.5A3.375 3.375 0 0014.625 13.125h-5.25A3.375 3.375 0 006 16.5v2.25m0-13.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6 5.25v2.25A3.375 3.375 0 009.375 10.875h-5.25A3.375 3.375 0 0018 7.5V5.25m-6 5.625V18" />
        </svg>
      );
    case "message-square":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    case "log-out":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
        </svg>
      );
    default:
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
};

const getCategoryColor = (category) => {
  switch (category) {
    case "Trigger":
      return "bg-blue-50 border-blue-200 text-blue-700";
    case "Database":
      return "bg-emerald-50 border-emerald-200 text-emerald-700";
    case "Integrations":
      return "bg-purple-50 border-purple-200 text-purple-700";
    case "Logic":
      return "bg-amber-50 border-amber-200 text-amber-700";
    default:
      return "bg-zinc-50 border-zinc-200 text-zinc-700";
  }
};

export default function BuilderPage() {
  const params = useParams();
  const router = useRouter();
  const endpointId = params?.id;

  const [endpoint, setEndpoint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState("saved"); // 'saved', 'unsaved', 'saving', 'error'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // 1. Fetch Endpoint details and configuration on load
  useEffect(() => {
    if (!endpointId) return;

    async function loadEndpoint() {
      try {
        setLoading(true);
        const res = await fetch(`/api/endpoints/${endpointId}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to load endpoint");
        }

        const data = await res.json();
        setEndpoint(data.endpoint);

        // Load visual layout config from DB configuration
        const config = data.endpoint.configuration || {};
        
        // If config is empty, initialize trigger node
        if (!config.nodes || config.nodes.length === 0) {
          const triggerTemplate = NODE_TEMPLATES.find(t => t.type === "webhookTrigger");
          const initialNodes = [
            {
              id: "node_trigger",
              type: "webhookTrigger",
              position: { x: 150, y: 150 },
              data: {
                ...triggerTemplate.defaultData,
                _template: triggerTemplate
              }
            }
          ];
          setNodes(initialNodes);
          setEdges([]);
        } else {
          // Re-inject templates back into serialized nodes
          const restoredNodes = config.nodes.map(node => {
            const template = NODE_TEMPLATES.find(t => t.type === node.type);
            return {
              ...node,
              data: {
                ...node.data,
                _template: template
              }
            };
          });
          setNodes(restoredNodes);
          setEdges(config.edges || []);
        }
      } catch (err) {
        console.error("Load builder error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadEndpoint();
  }, [endpointId, setNodes, setEdges]);

  // Connect handles
  const onConnect = useCallback(
    (params) => {
      setSaveStatus("unsaved");
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "smoothstep",
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 15,
              height: 15,
              color: "#18181b"
            },
            style: { stroke: "#18181b", strokeWidth: 1.5 }
          },
          eds
        )
      );
    },
    [setEdges]
  );

  // Monitor nodes/edges changes to trigger unsaved status
  const handleNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      setSaveStatus("unsaved");
      changes.forEach(change => {
        if (change.type === "remove") {
          setSelectedNode(prev => prev && prev.id === change.id ? null : prev);
        }
      });
    },
    [onNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
      setSaveStatus("unsaved");
      changes.forEach(change => {
        if (change.type === "remove") {
          setSelectedEdge(prev => prev && prev.id === change.id ? null : prev);
        }
      });
    },
    [onEdgesChange]
  );

  // Node/Edge Selection callback
  const onNodeClick = useCallback((event, node) => {
    setSelectedEdge(null);
    setSelectedNode(node);
  }, []);

  const onEdgeClick = useCallback((event, edge) => {
    setSelectedNode(null);
    setSelectedEdge(edge);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  // 2. Add Node to Canvas
  const handleAddNode = (template) => {
    setSaveStatus("unsaved");
    const newId = `node_${Date.now()}`;
    const newNode = {
      id: newId,
      type: template.type,
      position: { x: 350, y: 150 + (nodes.length * 30) % 200 },
      data: {
        ...template.defaultData,
        _template: template
      }
    };
    setNodes((nds) => nds.concat(newNode));
    setSelectedNode(newNode);
    setSelectedEdge(null);
  };

  // 3. Delete Selected Node
  const handleDeleteNode = (nodeId) => {
    if (!confirm("Delete this node and all of its connections?")) return;
    setSaveStatus("unsaved");
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
  };

  // 3b. Delete Selected Edge
  const handleDeleteEdge = (edgeId) => {
    if (!confirm("Delete this connection?")) return;
    setSaveStatus("unsaved");
    setEdges((eds) => eds.filter((e) => e.id !== edgeId));
    setSelectedEdge(null);
  };

  // 4. Update Custom Node Properties inside state
  const handlePropertyChange = (nodeId, key, value) => {
    setSaveStatus("unsaved");
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === nodeId) {
          const updatedNode = {
            ...n,
            data: {
              ...n.data,
              [key]: value
            }
          };
          // Sync live reference in selectedNode state
          setSelectedNode(updatedNode);
          return updatedNode;
        }
        return n;
      })
    );
  };

  // 5. Serialize and Save Visual Schema to Backend Postgres
  const handleSaveGraph = async () => {
    if (!endpointId) return;
    setSaveStatus("saving");

    try {
      // Serialize nodes. Exclude runtime _template logic
      const serializedNodes = nodes.map(n => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: Object.fromEntries(
          Object.entries(n.data).filter(([key]) => key !== "_template")
        )
      }));

      const res = await fetch(`/api/endpoints/${endpointId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          configuration: {
            nodes: serializedNodes,
            edges: edges
          }
        })
      });

      if (!res.ok) {
        throw new Error("Failed to save flow configuration");
      }

      setSaveStatus("saved");
    } catch (err) {
      console.error("Save graph error:", err);
      setSaveStatus("error");
    }
  };

  // Filter templates list
  const filteredTemplates = NODE_TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group templates by category
  const categories = ["Trigger", "Database", "Logic", "Integrations"];

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center font-sans">
        <svg className="animate-spin h-8 w-8 text-zinc-900 mb-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-sm font-semibold text-zinc-500">Loading flow canvas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center font-sans p-4">
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 text-center max-w-md shadow-sm">
          <svg className="mx-auto h-12 w-12 text-red-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-sm font-bold text-zinc-800">Connection Failed</h3>
          <p className="text-xs text-zinc-500 mt-1 mb-4">{error}</p>
          <Link href="/dashboard" className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-xl transition-all">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-zinc-50 text-zinc-900 font-sans flex flex-col relative select-none overflow-hidden">
      
      {/* Top Header / Builder Control Panel */}
      <header className="relative z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md px-6 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-300 px-3 py-1.5 rounded-xl bg-white shadow-3xs transition-all active:scale-95"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back
          </Link>
          <div className="h-4 w-px bg-zinc-200" />
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-zinc-800 leading-none">{endpoint?.name}</h2>
              <span className="text-[9px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.2 rounded">
                {endpoint?.method}
              </span>
            </div>
            <code className="text-[9.5px] font-mono text-zinc-400 mt-1">/api/v1{endpoint?.path}</code>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Saved notification badge */}
          {saveStatus === "saved" && (
            <span className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              All changes saved
            </span>
          )}
          {saveStatus === "unsaved" && (
            <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Unsaved modifications
            </span>
          )}
          {saveStatus === "saving" && (
            <span className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-zinc-400 border-t-transparent animate-spin" />
              Saving changes...
            </span>
          )}
          {saveStatus === "error" && (
            <span className="text-[10px] text-red-500 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Failed to save configurations
            </span>
          )}

          <button
            onClick={handleSaveGraph}
            disabled={saveStatus === "saving" || saveStatus === "saved"}
            className="text-xs font-semibold px-4 py-2 bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            Save Graph
          </button>
        </div>
      </header>

      {/* Builder Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Drawer - Node Library */}
        <aside className="w-[280px] border-r border-zinc-200 bg-white shadow-2xs flex flex-col z-35">
          {/* Library Search */}
          <div className="p-4 border-b border-zinc-100">
            <h3 className="text-xs font-bold text-zinc-800 mb-2">Node Library</h3>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search trigger, db..."
                className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl pl-8 pr-3 py-2 outline-none focus:border-zinc-900 focus:bg-white transition-all font-medium"
              />
              <svg className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
              </svg>
            </div>
          </div>

          {/* Library Category Lists */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {categories.map((cat) => {
              const nodesInCat = filteredTemplates.filter((t) => t.category === cat);
              if (nodesInCat.length === 0) return null;
              
              return (
                <div key={cat} className="space-y-1.5">
                  <h4 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider pl-1 mb-2">{cat}</h4>
                  <div className="space-y-1.5">
                    {nodesInCat.map((tmpl) => (
                      <button
                        key={tmpl.type}
                        onClick={() => handleAddNode(tmpl)}
                        className="w-full text-left p-2.5 border border-zinc-200/80 hover:border-zinc-400 hover:shadow-3xs rounded-xl bg-white transition-all group flex items-start gap-3 cursor-pointer"
                      >
                        <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${getCategoryColor(tmpl.category)}`}>
                          <NodeIcon name={tmpl.icon} className="w-3.5 h-3.5" />
                        </div>
                        <div className="overflow-hidden">
                          <h5 className="text-[11px] font-bold text-zinc-700 leading-tight group-hover:text-zinc-950">{tmpl.name}</h5>
                          <p className="text-[9.5px] text-zinc-400 truncate mt-0.5 leading-normal">{tmpl.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Center Canvas - React Flow Canvas */}
        <main className="flex-1 relative z-10 bg-zinc-50/50">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            fitView
            attributionPosition="bottom-right"
          >
            <Background color="#e4e4e7" gap={20} size={1.2} />
            <Controls style={{ boxShadow: "none", border: "1px solid #e4e4e7", borderRadius: "12px", overflow: "hidden" }} />
            <MiniMap style={{ border: "1px solid #e4e4e7", borderRadius: "12px", overflow: "hidden" }} zoomable pannable />
          </ReactFlow>
        </main>

        {/* Right Drawer - Property Editor */}
        <aside className="w-[340px] border-l border-zinc-200 bg-white shadow-2xs flex flex-col z-35 overflow-y-auto">
          {selectedNode ? (
            <div className="p-5 space-y-6">
              
              {/* Active Node Header Info */}
              <div className="border-b border-zinc-200 pb-4">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <span className="text-[8px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-500 border border-zinc-200 px-2 py-0.5 rounded">
                    ID: {selectedNode.id}
                  </span>
                  <button
                    onClick={() => handleDeleteNode(selectedNode.id)}
                    className="text-[9.5px] font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    Delete Node
                  </button>
                </div>
                <h3 className="text-xs font-bold text-zinc-800">{selectedNode.data._template?.name}</h3>
                <p className="text-[10px] text-zinc-400 mt-0.5 leading-normal">{selectedNode.data._template?.description}</p>
              </div>

              {/* Dynamic Property Editor Fields */}
              <div className="space-y-4">
                {selectedNode.data._template?.properties?.map((prop) => {
                  const currentValue = selectedNode.data[prop.name] ?? "";

                  return (
                    <div key={prop.name} className="space-y-1.5">
                      <label className="block text-[9.5px] font-bold text-zinc-400 uppercase tracking-wider">
                        {prop.label}
                      </label>

                      {prop.type === "text" && (
                        <input
                          type="text"
                          value={currentValue}
                          onChange={(e) => handlePropertyChange(selectedNode.id, prop.name, e.target.value)}
                          className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 outline-none focus:border-zinc-900 focus:bg-white focus:shadow-2xs transition-all font-medium"
                        />
                      )}

                      {prop.type === "number" && (
                        <input
                          type="number"
                          min={prop.min}
                          max={prop.max}
                          value={currentValue}
                          onChange={(e) => handlePropertyChange(selectedNode.id, prop.name, Number(e.target.value))}
                          className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 outline-none focus:border-zinc-900 focus:bg-white focus:shadow-2xs transition-all font-medium"
                        />
                      )}

                      {prop.type === "textarea" && (
                        <textarea
                          rows={4}
                          value={currentValue}
                          onChange={(e) => handlePropertyChange(selectedNode.id, prop.name, e.target.value)}
                          className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 outline-none focus:border-zinc-900 focus:bg-white focus:shadow-2xs transition-all resize-none font-medium"
                        />
                      )}

                      {prop.type === "boolean" && (
                        <div className="flex items-center gap-2">
                          <input
                             type="checkbox"
                             checked={Boolean(currentValue)}
                             onChange={(e) => handlePropertyChange(selectedNode.id, prop.name, e.target.checked)}
                             className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900"
                          />
                          <span className="text-xs text-zinc-600 font-medium">Enabled</span>
                        </div>
                      )}

                      {prop.type === "select" && (
                        <select
                          value={currentValue}
                          onChange={(e) => handlePropertyChange(selectedNode.id, prop.name, e.target.value)}
                          className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 outline-none focus:border-zinc-900 focus:bg-white transition-all font-medium appearance-none"
                          style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2371717a'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/></svg>")`, backgroundPosition: 'right 12px center', backgroundSize: '12px', backgroundRepeat: 'no-repeat' }}
                        >
                          {prop.options?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}

                      {prop.type === "code" && (
                        <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-2xs bg-zinc-950">
                          <div className="bg-zinc-900 px-3 py-1.5 border-b border-zinc-800 flex justify-between items-center">
                            <span className="text-[8px] font-bold font-mono uppercase tracking-wider text-zinc-400">
                              {prop.language || "text"} code editor
                            </span>
                          </div>
                          <textarea
                            rows={8}
                            value={currentValue}
                            onChange={(e) => handlePropertyChange(selectedNode.id, prop.name, e.target.value)}
                            className="w-full p-3 bg-zinc-900 text-zinc-100 font-mono text-[10px] border-none outline-none resize-none leading-relaxed caret-zinc-100 focus:ring-0"
                            style={{ fontVariantLigatures: "none" }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Data payload telemetry dump */}
              <div className="border-t border-zinc-200 pt-5 space-y-2">
                <span className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wider">Node Metadata Payload</span>
                <pre className="text-[9.5px] font-mono text-zinc-500 bg-zinc-50 border border-zinc-200 p-3 rounded-xl overflow-x-auto leading-relaxed max-w-full max-h-[160px]">
                  {JSON.stringify(
                    Object.fromEntries(
                      Object.entries(selectedNode.data).filter(([key]) => key !== "_template")
                    ),
                    null,
                    2
                  )}
                </pre>
              </div>

            </div>
          ) : selectedEdge ? (
            <div className="p-5 space-y-6">
              
              {/* Active Edge Header Info */}
              <div className="border-b border-zinc-200 pb-4">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <span className="text-[8px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-500 border border-zinc-200 px-2 py-0.5 rounded">
                    Edge ID: {selectedEdge.id}
                  </span>
                  <button
                    onClick={() => handleDeleteEdge(selectedEdge.id)}
                    className="text-[9.5px] font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    Delete Connection
                  </button>
                </div>
                <h3 className="text-xs font-bold text-zinc-800">Connection Link</h3>
                <p className="text-[10px] text-zinc-400 mt-0.5 leading-normal">
                  Connects the output of one node to the input of another.
                </p>
              </div>

              {/* Edge Connection Details */}
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5 p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Source Node</span>
                  <span className="text-xs font-semibold text-zinc-700">
                    {nodes.find(n => n.id === selectedEdge.source)?.data?._template?.name || selectedEdge.source}
                  </span>
                  <span className="text-[9.5px] text-zinc-400 font-mono">Output Handle: {selectedEdge.sourceHandle}</span>
                </div>
                
                <div className="flex flex-col gap-1.5 p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Target Node</span>
                  <span className="text-xs font-semibold text-zinc-700">
                    {nodes.find(n => n.id === selectedEdge.target)?.data?._template?.name || selectedEdge.target}
                  </span>
                  <span className="text-[9.5px] text-zinc-400 font-mono">Input Handle: {selectedEdge.targetHandle}</span>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-zinc-400 font-sans">
              <svg className="w-8 h-8 text-zinc-300 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286.4m-12.6-3.537l2.037.713m0 0l-.139-.214m0.139.214L1.75 12.75M21.75 12h-2.25M12 2.25v2.25M6.22 6.22l1.59 1.59m8.37 0l1.59-1.59m0 11.56l-1.59-1.59m-8.37 0l-1.59 1.59" />
              </svg>
              <h4 className="text-xs font-bold text-zinc-700">No node selected</h4>
              <p className="text-[10px] text-zinc-400 mt-1 leading-normal max-w-[180px]">Click a node on the canvas to inspect and edit its properties.</p>
            </div>
          )}
        </aside>

      </div>

    </div>
  );
}
