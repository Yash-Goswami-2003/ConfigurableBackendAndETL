"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("weave_user");
      if (user) {
        setIsLoggedIn(true);
      }
    }
  }, []);

  // Playground state for request-to-response simulation
  const [selectedUser, setSelectedUser] = useState("user_sarah");
  const [enrichmentSource, setEnrichmentSource] = useState("stripe_ai"); // 'stripe_ai' or 'analytics'
  const [executionSpeed, setExecutionSpeed] = useState(18);
  const [copied, setCopied] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [activeNode, setActiveNode] = useState("all");

  // User input database simulation
  const mockUsers = {
    user_sarah: {
      id: "usr_104",
      name: "Sarah Connor",
      email: "sarah@resistance.net",
      postgresData: {
        role: "Lead Administrator",
        joined: "2026-01-12",
        status: "active"
      },
      stripeData: {
        tier: "Enterprise",
        mrr: 450.00,
        billingCycle: "yearly"
      },
      analyticsData: {
        lastActive: "2 minutes ago",
        requestCount: 14205,
        errorRate: "0.02%"
      }
    },
    user_marcus: {
      id: "usr_219",
      name: "Marcus Wright",
      email: "marcus@cyberdyne.org",
      postgresData: {
        role: "Operations Manager",
        joined: "2026-03-05",
        status: "active"
      },
      stripeData: {
        tier: "Growth",
        mrr: 120.00,
        billingCycle: "monthly"
      },
      analyticsData: {
        lastActive: "4 hours ago",
        requestCount: 3820,
        errorRate: "0.15%"
      }
    }
  };

  const currentUser = mockUsers[selectedUser];

  // AI responses depending on user and state
  const getAiSummary = (user, source) => {
    if (source === "stripe_ai") {
      return `Premium ${user.stripeData.tier} account holder. High priority response path recommended. Billing status: Healthy.`;
    }
    return `Active user with ${user.analyticsData.requestCount} hits. Performance error rate is exceptionally low (${user.analyticsData.errorRate}).`;
  };

  // Compile final unified response block in real-time
  const getUnifiedResponse = () => {
    const base = {
      http_status: 200,
      timestamp: new Date().toISOString().split("T")[0] + "T19:42:00Z",
      request: {
        method: "GET",
        path: `/api/v1/users/${currentUser.id}`,
        query: {
          enrich: enrichmentSource === "stripe_ai" ? "billing,ai_insights" : "performance"
        }
      },
      response: {
        user_id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        database: {
          role: currentUser.postgresData.role,
          joined: currentUser.postgresData.joined,
          status: currentUser.postgresData.status
        }
      }
    };

    if (enrichmentSource === "stripe_ai") {
      base.response.billing = {
        plan: currentUser.stripeData.tier,
        mrr: currentUser.stripeData.mrr,
        cycle: currentUser.stripeData.billingCycle
      };
      base.response.ai_insights = {
        summary: getAiSummary(currentUser, "stripe_ai"),
        sentiment: "positive",
        generated_at: "dynamic_execution_tick"
      };
    } else {
      base.response.telemetry = {
        last_online: currentUser.analyticsData.lastActive,
        total_requests: currentUser.analyticsData.requestCount,
        health_score: "99.8%"
      };
      base.response.ai_insights = {
        summary: getAiSummary(currentUser, "analytics"),
        sentiment: "neutral",
        generated_at: "dynamic_execution_tick"
      };
    }

    return base;
  };

  // Speed tick simulation when toggles are changed
  useEffect(() => {
    const offset = enrichmentSource === "stripe_ai" ? 6 : 3;
    const base = selectedUser === "user_sarah" ? 12 : 14;
    setExecutionSpeed(base + offset + Math.floor(Math.random() * 2));
  }, [selectedUser, enrichmentSource]);

  const handleCopy = () => {
    navigator.clipboard.writeText("https://api.weave.dev/v1/endpoints/user-synthesizer");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans antialiased overflow-x-hidden selection:bg-zinc-100 selection:text-zinc-900">

      {/* Subtle Canvas Dot Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-50" />

      {/* Header */}
      <header className="relative z-10 max-w-6xl mx-auto px-6 py-5 flex items-center justify-between border-b border-zinc-100 bg-white/70 backdrop-blur-md">
        <div className="flex items-center gap-3 shrink-0">
          {/* Weave Interwoven SVG Thread Icon */}
          <div className="relative w-8 h-8 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-7 h-7 text-zinc-900" fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round">
              <path d="M20,50 Q35,20 50,50 T80,50" />
              <path d="M20,50 Q35,80 50,50 T80,50" className="opacity-45" strokeWidth="6" />
              <circle cx="50" cy="50" r="5" className="fill-zinc-900" />
            </svg>
          </div>
          <span className="font-semibold text-lg tracking-tight whitespace-nowrap">Weave</span>
          <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-medium tracking-wide bg-zinc-50 text-zinc-500 rounded-full border border-zinc-200/50 whitespace-nowrap">
            v1.0 Public Beta
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6 xl:gap-8 text-sm font-medium text-zinc-500 shrink-0">
          {isLoggedIn && (
            <Link href="/dashboard" className="hover:text-zinc-950 transition-colors whitespace-nowrap text-zinc-900 font-semibold mr-1">Dashboard</Link>
          )}
          <a href="#playground" className="hover:text-zinc-950 transition-colors whitespace-nowrap">Playground</a>
          <a href="#features" className="hover:text-zinc-950 transition-colors whitespace-nowrap">Features</a>
          <a href="#how-it-works" className="hover:text-zinc-950 transition-colors whitespace-nowrap">How it Works</a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-950 transition-colors whitespace-nowrap">Docs</a>
        </nav>

        <div className="flex items-center shrink-0">
          {isLoggedIn ? (
            <Link 
              href="/dashboard"
              className="text-xs font-semibold px-4 py-2 bg-zinc-950 text-white rounded-lg hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer whitespace-nowrap"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link 
              href="/signup"
              className="text-xs font-semibold px-4 py-2 bg-zinc-950 text-white rounded-lg hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer whitespace-nowrap"
            >
              Create API Endpoint
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-16 pb-12 text-center sm:pt-24 sm:pb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-50 border border-zinc-200/60 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 animate-pulse" />
          <span className="text-[11px] font-medium text-zinc-500 tracking-wide">Configurable Endpoint Builder</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-zinc-900 max-w-3xl mx-auto leading-[1.1] mb-6">
          Configure API endpoints. Collect data. Map response.
        </h1>

        <p className="text-base sm:text-lg text-zinc-500 max-w-2xl mx-auto leading-relaxed mb-10">
          Weave is a visual, configurable backend layer. Intercept incoming request parameters, fetch data from PostgreSQL, Stripe, or Generative AI, and map everything into a unified JSON response using visual nodes.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3.5 bg-zinc-950 text-white font-medium text-sm rounded-xl hover:bg-zinc-800 transition-colors shadow-sm flex items-center justify-center gap-2 group cursor-pointer"
            >
              Open Dashboard
              <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none stroke-2 group-hover:translate-x-0.5 transition-transform" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          ) : (
            <Link
              href="/signup"
              className="w-full sm:w-auto px-6 py-3.5 bg-zinc-950 text-white font-medium text-sm rounded-xl hover:bg-zinc-800 transition-colors shadow-sm flex items-center justify-center gap-2 group cursor-pointer"
            >
              Configure First Endpoint
              <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none stroke-2 group-hover:translate-x-0.5 transition-transform" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          )}
          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-6 py-3.5 border border-zinc-200 font-medium text-sm rounded-xl hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2"
          >
            See System Architecture
          </a>
        </div>
      </section>

      {/* Interactive Simulator Section */}
      <section id="playground" className="relative z-10 max-w-5xl mx-auto px-6 pb-24">

        <div className="text-center max-w-lg mx-auto mb-8">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">Live Demo Sandbox</h2>
          <p className="text-sm text-zinc-500">
            Tweak incoming requests and toggle data pipelines. Watch Weave collect, enrich, and map them to unified JSON outputs in real-time.
          </p>
        </div>

        <div className="border border-zinc-200/80 rounded-2xl bg-white shadow-xl shadow-zinc-200/30 overflow-hidden">

          {/* Simulator Bar */}
          <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-200" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-200" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-200" />
              </span>
              <span className="text-xs font-mono text-zinc-400 ml-2">endpoint_user_composer.json</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-[11px] font-mono bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded border border-zinc-200/50 flex items-center gap-1.5">
                <span className="text-zinc-900 font-bold">GET</span>
                <span className="text-zinc-300">|</span>
                <span className="text-zinc-600">api.weave.dev/v1/endpoints/user-synthesizer</span>
              </div>
              <button
                onClick={handleCopy}
                className="text-[11px] font-medium px-3 py-1 border border-zinc-200 bg-white hover:bg-zinc-50 rounded shadow-xs text-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? (
                  <>
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-emerald-600 fill-none stroke-2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-emerald-600 font-semibold">Copied route!</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-zinc-500 fill-none stroke-2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span>Copy Route URL</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Interactive Core grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">

            {/* Visual Mapping Panel */}
            <div className="lg:col-span-7 p-6 bg-zinc-50/20 border-r border-zinc-100 flex flex-col justify-between relative overflow-hidden">

              <div className="absolute inset-0 bg-[radial-gradient(#f4f4f5_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-60" />

              <div className="relative z-10 flex justify-between items-center mb-6">
                <span className="text-[10px] text-zinc-400 font-semibold tracking-wider uppercase">Visual Connection Grid</span>
                <span className="text-[10px] text-zinc-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" /> Multi-source pipeline active
                </span>
              </div>

              {/* Graphical Nodes Stack */}
              <div className="relative z-10 flex flex-col items-center gap-8 py-2">

                {/* Node A: Request input node */}
                <div
                  onClick={() => setActiveNode("req")}
                  className={`w-[320px] bg-white border rounded-xl shadow-xs p-4 cursor-pointer transition-all duration-300 relative z-20 ${activeNode === "req"
                      ? "border-zinc-950 ring-4 ring-zinc-100"
                      : "border-zinc-200/80 hover:border-zinc-400"
                    }`}
                >
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-2 mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="p-0.5 rounded text-zinc-900 bg-zinc-100">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <polyline points="4 17 10 11 4 5" />
                          <line x1="12" y1="19" x2="20" y2="19" />
                        </svg>
                      </span>
                      <span className="text-xs font-semibold text-zinc-900">1. HTTP Request Node</span>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-400">INPUT</span>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Incoming Route Parameter</label>
                      <select
                        value={selectedUser}
                        onChange={(e) => {
                          e.stopPropagation();
                          setSelectedUser(e.target.value);
                        }}
                        className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded px-2 py-1.5 font-medium outline-none focus:border-zinc-400 cursor-pointer"
                      >
                        <option value="user_sarah">GET /users/usr_104 (Sarah Connor)</option>
                        <option value="user_marcus">GET /users/usr_219 (Marcus Wright)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Node B: Collectors (PostgreSQL & Stripe/Telemetry) */}
                <div className="flex gap-4">

                  {/* Postgres Sub-Node */}
                  <div
                    onClick={() => setActiveNode("postgres")}
                    className={`w-[160px] bg-white border rounded-xl shadow-xs p-3 cursor-pointer transition-all duration-300 relative z-20 ${activeNode === "postgres"
                        ? "border-zinc-950 ring-4 ring-zinc-100"
                        : "border-zinc-200/80 hover:border-zinc-400"
                      }`}
                  >
                    <div className="flex items-center gap-1.5 border-b border-zinc-100 pb-1.5 mb-2">
                      <span className="text-blue-500">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <ellipse cx="12" cy="5" rx="9" ry="3" />
                          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                        </svg>
                      </span>
                      <span className="text-[10px] font-bold text-zinc-900">PostgreSQL</span>
                    </div>
                    <div className="text-[9px] text-zinc-500 leading-relaxed">
                      Reads <code className="bg-zinc-100 text-[8.5px] px-1 font-mono rounded">users</code> row matching ID parameter.
                    </div>
                  </div>

                  {/* Dynamic Collector Node */}
                  <div
                    onClick={() => setActiveNode("collector")}
                    className={`w-[160px] bg-white border rounded-xl shadow-xs p-3 cursor-pointer transition-all duration-300 relative z-20 ${activeNode === "collector"
                        ? "border-zinc-950 ring-4 ring-zinc-100"
                        : "border-zinc-200/80 hover:border-zinc-400"
                      }`}
                  >
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-violet-500">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                          </svg>
                        </span>
                        <span className="text-[10px] font-bold text-zinc-900">API Source</span>
                      </div>
                    </div>

                    <select
                      value={enrichmentSource}
                      onChange={(e) => {
                        e.stopPropagation();
                        setEnrichmentSource(e.target.value);
                      }}
                      className="w-full text-[9px] bg-zinc-50 border border-zinc-200 rounded px-1.5 py-1 font-medium outline-none cursor-pointer"
                    >
                      <option value="stripe_ai">Stripe & GenAI Insights</option>
                      <option value="analytics">Telemetry & Diagnostics</option>
                    </select>
                  </div>

                </div>

                {/* Node C: Unified Mapper (Response Output) */}
                <div
                  onClick={() => setActiveNode("response")}
                  className={`w-[320px] bg-white border rounded-xl shadow-xs p-4 cursor-pointer transition-all duration-300 relative z-20 ${activeNode === "response"
                      ? "border-zinc-950 ring-4 ring-zinc-100"
                      : "border-zinc-200/80 hover:border-zinc-400"
                    }`}
                >
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-2 mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="p-0.5 rounded text-emerald-600 bg-emerald-50">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <polyline points="16 16 12 12 8 16" />
                          <line x1="12" y1="12" x2="12" y2="21" />
                          <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                        </svg>
                      </span>
                      <span className="text-xs font-semibold text-zinc-900">2. Response Mapper Node</span>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-400">OUTPUT</span>
                  </div>

                  <div className="text-[10px] text-zinc-500 leading-relaxed space-y-1">
                    <div className="flex items-center gap-1.5 text-zinc-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Maps postgresData &rarr; <code className="bg-zinc-100 px-0.5 font-mono">response.database</code></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Maps {enrichmentSource === "stripe_ai" ? "Stripe" : "Telemetry"} &rarr; <code className="bg-zinc-100 px-0.5 font-mono">response.{enrichmentSource === "stripe_ai" ? "billing" : "telemetry"}</code></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Maps Generative AI Synthesis &rarr; <code className="bg-zinc-100 px-0.5 font-mono">response.ai_insights</code></span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom reset actions */}
              <div className="relative z-10 flex justify-between items-center border-t border-zinc-100 pt-4 mt-6">
                <span className="text-[10px] text-zinc-400 font-mono">Executor: Node.js Engine</span>
                <button
                  onClick={() => {
                    setActiveNode("all");
                    setSelectedUser("user_sarah");
                    setEnrichmentSource("stripe_ai");
                  }}
                  className="text-[10px] font-semibold text-zinc-500 hover:text-zinc-950 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                  Reset Layout
                </button>
              </div>

            </div>

            {/* Response Output Panel (JSON View) */}
            <div className="lg:col-span-5 p-6 bg-zinc-950 text-zinc-200 flex flex-col justify-between">

              <div>
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Client Response Payload</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[9px] font-mono text-zinc-500">200 OK</span>
                    <span className="text-[9px] font-mono text-emerald-400">{executionSpeed}ms</span>
                  </div>
                </div>

                {/* Preformatted JSON Output */}
                <div className="overflow-y-auto max-h-[380px] font-mono text-[11px] leading-relaxed text-zinc-300 scrollbar-thin">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(getUnifiedResponse(), null, 2)}
                  </pre>
                </div>
              </div>

              {/* Details and Telemetry summary */}
              <div className="border-t border-zinc-900 pt-4 mt-6 flex justify-between items-center text-[9px] font-mono text-zinc-500">
                <span>Variables Weaved: {enrichmentSource === "stripe_ai" ? 8 : 6}</span>
                <span>Active Connection</span>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Main Features Grid */}
      <section id="features" className="relative z-10 max-w-5xl mx-auto px-6 py-16 border-t border-zinc-100">

        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Endpoint Architecture</h2>
          <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900">
            Construct complex endpoints, ingest parameter inputs, and emit structured payloads.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Card 1: Any Request Source */}
          <div className="p-6 bg-white border border-zinc-100 rounded-2xl hover:border-zinc-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center border border-zinc-100 text-zinc-900 mb-5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <polyline points="4 17 10 11 4 5" />
                <line x1="12" y1="19" x2="20" y2="19" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-zinc-900 mb-2">Request Parameter Ingestion</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Capture path parameters, query variables, headers, and payload bodies. Pass request contexts cleanly down your execution pipeline.
            </p>
          </div>

          {/* Card 2: Multi-Source Connections */}
          <div className="p-6 bg-white border border-zinc-100 rounded-2xl hover:border-zinc-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center border border-zinc-100 text-zinc-900 mb-5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-zinc-900 mb-2">Multi-Source Collectors</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Fetch from PostgreSQL, hit external third-party REST endpoints, and synthesize LLM prompts concurrently inside a single workflow.
            </p>
          </div>

          {/* Card 3: Unified Response Mapping */}
          <div className="p-6 bg-white border border-zinc-100 rounded-2xl hover:border-zinc-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center border border-zinc-100 text-zinc-900 mb-5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <polyline points="16 16 12 12 8 16" />
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-zinc-900 mb-2">Unified Response Mapping</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Shape your outbound JSON payload. Pick keys, rename attributes, and format nested outputs exactly how your client-side application expects.
            </p>
          </div>

        </div>
      </section>

      {/* Structural Workflow Lifecycle */}
      <section id="how-it-works" className="relative z-10 max-w-5xl mx-auto px-6 py-16 border-t border-zinc-100">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">How Weave Works</h2>
            <h3 className="text-3xl font-semibold tracking-tight text-zinc-900">
              Configure endpoints in three simple layers.
            </h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              No servers to manage, no routers to declare. Weave interprets visual workflow connections into native Node.js data tasks, mapping requests directly to responses.
            </p>

            <div className="space-y-4 pt-2">

              <div
                onClick={() => setActiveStep(1)}
                className={`p-3.5 border-l-2 rounded-r-lg transition-all duration-300 cursor-pointer ${activeStep === 1
                    ? "border-zinc-900 bg-zinc-50/50 text-zinc-900"
                    : "border-zinc-200 text-zinc-500 hover:text-zinc-900"
                  }`}
              >
                <div className="text-xs font-semibold uppercase tracking-wider mb-1">01. Setup Request Parameters</div>
                <div className="text-xs">Bind path rules and query filters to start your flow.</div>
              </div>

              <div
                onClick={() => setActiveStep(2)}
                className={`p-3.5 border-l-2 rounded-r-lg transition-all duration-300 cursor-pointer ${activeStep === 2
                    ? "border-zinc-900 bg-zinc-50/50 text-zinc-900"
                    : "border-zinc-200 text-zinc-500 hover:text-zinc-900"
                  }`}
              >
                <div className="text-xs font-semibold uppercase tracking-wider mb-1">02. Gather Data Sources</div>
                <div className="text-xs">Query tables, call APIs, or execute AI prompts in parallel.</div>
              </div>

              <div
                onClick={() => setActiveStep(3)}
                className={`p-3.5 border-l-2 rounded-r-lg transition-all duration-300 cursor-pointer ${activeStep === 3
                    ? "border-zinc-900 bg-zinc-50/50 text-zinc-900"
                    : "border-zinc-200 text-zinc-500 hover:text-zinc-900"
                  }`}
              >
                <div className="text-xs font-semibold uppercase tracking-wider mb-1">03. Map Output Response</div>
                <div className="text-xs">Drag data outputs to output fields for custom structured JSON.</div>
              </div>

            </div>
          </div>

          <div className="lg:col-span-7 bg-zinc-50 border border-zinc-200/60 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-center min-h-[360px]">

            {activeStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-400">Step 1: Request Interception</span>
                  <span className="w-2 h-2 rounded-full bg-zinc-900" />
                </div>
                <div className="bg-white p-4 border border-zinc-200 rounded-xl space-y-2.5 shadow-xs">
                  <div className="flex justify-between items-center text-xs font-semibold border-b border-zinc-100 pb-1.5">
                    <span>Route Definition</span>
                    <span className="text-[10px] font-mono text-zinc-400">GET</span>
                  </div>
                  <code className="text-xs font-mono text-zinc-700 block bg-zinc-50 p-2 rounded border border-zinc-200/30">
                    /api/v1/customers/<span className="text-zinc-900 font-bold">:customerId</span>
                  </code>
                  <div className="text-[10px] text-zinc-400 leading-normal">
                    Query arguments are automatically made available as template variables in subsequent collector nodes.
                  </div>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-400">Step 2: Collecting Multiple Sources</span>
                  <span className="w-2 h-2 rounded-full bg-zinc-900" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 border border-zinc-200 rounded-xl shadow-xs">
                    <div className="text-[10.5px] font-semibold mb-1">PostgreSQL Reader</div>
                    <code className="text-[9.5px] font-mono text-zinc-500 block">
                      SELECT * FROM users WHERE id = $customerId
                    </code>
                  </div>
                  <div className="bg-white p-3 border border-zinc-200 rounded-xl shadow-xs">
                    <div className="text-[10.5px] font-semibold mb-1">Stripe Billing API</div>
                    <code className="text-[9.5px] font-mono text-zinc-500 block">
                      GET stripe.com/v1/customers/$email
                    </code>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-400">Step 3: Response Assembly</span>
                  <span className="w-2 h-2 rounded-full bg-zinc-900" />
                </div>
                <div className="bg-white p-5 border border-zinc-200 rounded-xl shadow-xs space-y-3">
                  <div className="text-xs font-semibold border-b border-zinc-100 pb-1.5">Outbound JSON Layout</div>
                  <pre className="text-[10px] font-mono text-zinc-600 block bg-zinc-50 p-2.5 rounded border border-zinc-200/50">
                    {`{
  "client_name": "$postgres.name",
  "billing_tier": "$stripe.plan",
  "data_ref": "$postgres.joined"
}`}
                  </pre>
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* Code Comparison Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-16 border-t border-zinc-100">
        <div className="text-center max-w-lg mx-auto mb-12">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-3">Boilerplate Comparison</h2>
          <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900">
            Skip writing route orchestrations.
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <div className="border border-zinc-200/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200/80 flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500">Traditional Node/Express route configuration</span>
              <span className="text-[10px] font-mono text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100">64 lines</span>
            </div>
            <div className="p-4 bg-zinc-900 text-zinc-400 font-mono text-[9.5px] leading-relaxed overflow-x-auto">
              <pre>{`const express = require('express');
const router = express.Router();
const db = require('./db-pool');
const stripe = require('stripe')(process.env.STRIPE_KEY);

router.get('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    // 1. Fetch User from DB
    const userRes = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (!userRes.rows[0]) return res.status(404).send('Not Found');
    const user = userRes.rows[0];

    // 2. Fetch Billing info from Stripe
    const stripeCustomer = await stripe.customers.retrieveByEmail(user.email);

    // 3. Map into Unified Response
    res.json({
      user_id: user.id,
      name: user.name,
      database: { role: user.role, joined: user.joined },
      billing: { plan: stripeCustomer.plan, mrr: stripeCustomer.mrr }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});`}</pre>
            </div>
          </div>

          <div className="border border-zinc-950 rounded-2xl overflow-hidden shadow-xs bg-zinc-950 text-zinc-300 flex flex-col justify-between min-h-[300px]">
            <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-200">Weave Visual Route Config</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-900/50">No code required</span>
            </div>
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-center">
              <div className="space-y-4">

                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs shrink-0 mt-0.5">✓</span>
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-100">Visual Connector Layout</h4>
                    <p className="text-[11px] text-zinc-500">Connect output parameters directly to incoming response keys. No code boundaries or manual JSON structural coding.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs shrink-0 mt-0.5">✓</span>
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-100">Out-of-the-Box Error Resilience</h4>
                    <p className="text-[11px] text-zinc-500">Automatic validation mapping. If a collector database call or API goes offline, Weave handles the default values visual configurations instantly.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs shrink-0 mt-0.5">✓</span>
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-100">Dynamic execution monitoring</h4>
                    <p className="text-[11px] text-zinc-500">See routing times, execution speed, cache hit rates, and request size stats right inside the configuration interface.</p>
                  </div>
                </div>

              </div>
            </div>
            <div className="text-[9.5px] text-zinc-500 font-mono px-6 py-4 border-t border-zinc-900 bg-zinc-950">
              Compatible with standard API clients (Postman, curl, Axios). Emits strict CORS headers.
            </div>
          </div>

        </div>
      </section>

      {/* Call To Action */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-24 border-t border-zinc-100 text-center">
        <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-zinc-900 mb-6">
          Backend configuration, simplified.
        </h2>
        <p className="text-sm sm:text-base text-zinc-500 max-w-md mx-auto leading-relaxed mb-10">
          Create and launch custom API endpoints. Connect your data collectors, process requests, and shape outputs in minutes.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xs mx-auto">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="w-full px-6 py-3 bg-zinc-950 text-white font-semibold text-xs rounded-lg hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer"
            >
              Open Dashboard
            </Link>
          ) : (
            <Link
              href="/signup"
              className="w-full px-6 py-3 bg-zinc-950 text-white font-semibold text-xs rounded-lg hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer"
            >
              Start Constructing API Routes
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-100 bg-zinc-50/50 py-12 text-zinc-400">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">

          <div className="flex items-center gap-2">
            <svg viewBox="0 0 100 100" className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round">
              <path d="M20,50 Q35,20 50,50 T80,50" />
              <path d="M20,50 Q35,80 50,50 T80,50" className="opacity-45" strokeWidth="6" />
            </svg>
            <span className="text-xs font-semibold tracking-tight text-zinc-700">Weave Backend Engine</span>
          </div>

          <div className="flex gap-8 text-xs font-medium">
            <a href="https://github.com" className="hover:text-zinc-950 transition-colors">GitHub</a>
            <a href="#features" className="hover:text-zinc-950 transition-colors">Features</a>
            <a href="#playground" className="hover:text-zinc-950 transition-colors">Endpoint Sandbox</a>
          </div>

          <div className="text-xs font-mono text-zinc-400">
            &copy; 2026 Weave Inc. All rights reserved.
          </div>

        </div>
      </footer>

    </div>
  );
}
