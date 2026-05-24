"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [orgAction, setOrgAction] = useState("create"); // 'create' or 'join'
  const [orgName, setOrgName] = useState("");
  const [orgId, setOrgId] = useState("");
  const [organizations, setOrganizations] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadOrgs() {
      try {
        const res = await fetch("/api/organisations");
        if (res.ok) {
          const data = await res.json();
          setOrganizations(data.organisations || []);
        }
      } catch (err) {
        console.error("Failed to load organisations:", err);
      }
    }
    loadOrgs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError("You must agree to the Terms of Service.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          orgAction, 
          orgName, 
          orgId: orgAction === "join" ? parseInt(orgId) : null 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create account.");
      } else {
        setSuccess("Account created! Redirecting to dashboard...");
        if (typeof window !== "undefined") {
          localStorage.setItem("weave_user", JSON.stringify(data.user));
        }
        setTimeout(() => {
          router.push("/dashboard");
        }, 1200);
      }
    } catch (err) {
      setError("Failed to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans antialiased flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      
      {/* Background Dot Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-50 z-0" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Weave SVG Logo */}
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-8 h-8 text-zinc-900" fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round">
                <path d="M20,50 Q35,20 50,50 T80,50" />
                <path d="M20,50 Q35,80 50,50 T80,50" className="opacity-45" strokeWidth="6" />
                <circle cx="50" cy="50" r="5" className="fill-zinc-900" />
              </svg>
            </div>
            <span className="font-semibold text-xl tracking-tight">Weave</span>
          </Link>
        </div>

        <h2 className="text-center text-2xl font-semibold tracking-tight text-zinc-900">
          Create your Weave account
        </h2>
        <p className="mt-2 text-center text-xs text-zinc-500">
          Start weaving multi-source data backends visually
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white border border-zinc-200/80 p-8 rounded-2xl shadow-xl shadow-zinc-200/20">
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-xs font-semibold text-red-600 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-600 rounded-lg">
              {success}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full text-sm bg-zinc-50/50 border border-zinc-200 rounded-lg px-3 py-2.5 outline-none focus:border-zinc-950 transition-colors placeholder:text-zinc-400"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                Work Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full text-sm bg-zinc-50/50 border border-zinc-200 rounded-lg px-3 py-2.5 outline-none focus:border-zinc-950 transition-colors placeholder:text-zinc-400"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm bg-zinc-50/50 border border-zinc-200 rounded-lg px-3 py-2.5 outline-none focus:border-zinc-950 transition-colors placeholder:text-zinc-400"
              />
            </div>

            {/* Organization Setup */}
            <div className="border-t border-zinc-100 pt-4 mt-4 space-y-3">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Organization Setup
              </label>
              
              <div className="flex gap-2 p-1 bg-zinc-100 rounded-lg text-xs font-medium mb-3">
                <button
                  type="button"
                  onClick={() => setOrgAction("create")}
                  className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${orgAction === "create" ? "bg-white text-zinc-950 shadow-xs" : "text-zinc-500 hover:text-zinc-900"}`}
                >
                  Create New
                </button>
                <button
                  type="button"
                  onClick={() => setOrgAction("join")}
                  className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${orgAction === "join" ? "bg-white text-zinc-950 shadow-xs" : "text-zinc-500 hover:text-zinc-900"}`}
                >
                  Join Existing
                </button>
              </div>

              {orgAction === "create" ? (
                <div>
                  <label htmlFor="orgName" className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    New Organization Name
                  </label>
                  <input
                    id="orgName"
                    name="orgName"
                    type="text"
                    required={orgAction === "create"}
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Acme Corp"
                    className="w-full text-sm bg-zinc-50/50 border border-zinc-200 rounded-lg px-3 py-2.5 outline-none focus:border-zinc-950 transition-colors placeholder:text-zinc-400"
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="orgId" className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Select Organization
                  </label>
                  {organizations.length === 0 ? (
                    <div className="text-xs text-zinc-400 bg-zinc-50 border border-zinc-200 rounded-lg p-2 italic">
                      No organizations available. Create one instead!
                    </div>
                  ) : (
                    <select
                      id="orgId"
                      name="orgId"
                      required={orgAction === "join"}
                      value={orgId}
                      onChange={(e) => setOrgId(e.target.value)}
                      className="w-full text-sm bg-zinc-50/50 border border-zinc-200 rounded-lg px-3 py-2.5 outline-none focus:border-zinc-950 transition-colors cursor-pointer text-zinc-700 font-medium"
                    >
                      <option value="">-- Choose Organization --</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-start">
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                required
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 text-zinc-950 focus:ring-zinc-950 border-zinc-300 rounded cursor-pointer accent-zinc-900"
              />
              <label htmlFor="agree-terms" className="ml-2 block text-[11px] text-zinc-500 leading-normal cursor-pointer select-none">
                I agree to the{" "}
                <a href="#" className="font-semibold text-zinc-900 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="font-semibold text-zinc-900 hover:underline">
                  Privacy Policy
                </a>.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-400 text-white rounded-lg font-semibold text-xs transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-zinc-100" />
            </div>
            <div className="relative flex justify-center text-xs font-medium">
              <span className="bg-white px-3 text-zinc-400 uppercase tracking-wider text-[10px]">Or sign up with</span>
            </div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {}}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              {/* GitHub Icon */}
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </button>
            
            <button
              onClick={() => {}}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              {/* Google Icon */}
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.115-5.647 4.115-3.831 0-6.959-3.116-6.959-6.959 0-3.843 3.128-6.959 6.959-6.959 1.717 0 3.284.619 4.512 1.777l3.072-3.071C18.232 1.218 15.438.5 12.24.5 5.866.5.7 5.666.7 12.04s5.166 11.54 11.54 11.54c6.645 0 11.053-4.664 11.053-11.254 0-.756-.091-1.32-.218-2.041H12.24z" />
              </svg>
              Google
            </button>
          </div>

          <p className="mt-8 text-center text-xs text-zinc-500 font-medium">
            Already have an account?{" "}
            <Link href="/login" className="text-zinc-950 font-bold hover:underline transition-all">
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
