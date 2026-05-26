import React, { useEffect } from "react";
import { Handle, Position, useUpdateNodeInternals } from "@xyflow/react";

// Crisp SVG Icons matching categories
const NodeIcon = ({ name, className = "w-4 h-4 text-zinc-600" }) => {
  switch (name) {
    case "zap":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      );
    case "database":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125m16.5 0v3.75m-16.5-3.75v3.75" />
        </svg>
      );
    case "globe":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-.554-8.25-1.568m16.5 0a9.003 9.003 0 01-16.5 0" />
        </svg>
      );
    case "cpu":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m1.5 5.25H3m1.5 5.25H3m15-10.5H16.5m1.5 5.25H16.5m1.5 5.25H16.5m-5.25-15v1.5m0 15V21m-5.25-3.75H18c.414 0 .75-.336.75-.75V6c0-.414-.336-.75-.75-.75H6c-.414 0-.75.336-.75.75v11.25c0 .414.336.75.75.75z" />
        </svg>
      );
    case "git-branch":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.75a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM18 18.75V16.5A3.375 3.375 0 0014.625 13.125h-5.25A3.375 3.375 0 006 16.5v2.25m0-13.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6 5.25v2.25A3.375 3.375 0 009.375 10.875h5.25A3.375 3.375 0 0018 7.5V5.25m-6 5.625V18" />
        </svg>
      );
    case "message-square":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    case "log-out":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
        </svg>
      );
    default:
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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

export default function CustomNodeWrapper({ id, selected, data }) {
  const template = data._template || {};
  const { name, type, description, category, icon } = template;

  const inputs = data.inputsCount !== undefined ? Number(data.inputsCount) : (template.inputs ?? 0);
  const outputs = data.outputsCount !== undefined ? Number(data.outputsCount) : (template.outputs ?? 0);

  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    updateNodeInternals(id);
  }, [id, inputs, outputs, updateNodeInternals]);

  // Dynamically calculate positions of handles
  const renderHandles = (count, typeOfHandle) => {
    if (!count || count <= 0) return null;
    return Array.from({ length: count }).flatMap((_, index) => {
      // Space them out vertically
      const offsetTop = `${((index + 1) / (count + 1)) * 100}%`;
      const isTarget = typeOfHandle === "target";
      const handleId = isTarget ? `in-${index}` : `out-${index}`;
      const position = isTarget ? Position.Left : Position.Right;

      // Output branch labels for conditional node or port labels for jsRunner
      let label = "";
      if (type === "conditionalRouter" && !isTarget) {
        label = index === 0 ? "True" : "False";
      } else if (type === "jsRunner" || type === "javascriptRunner") {
        label = isTarget ? `p${index}` : "out";
      }

      const elements = [
        <Handle
          key={handleId}
          type={typeOfHandle}
          position={position}
          id={handleId}
          style={{
            top: offsetTop,
            width: "10px",
            height: "10px",
            backgroundColor: "#18181b",
            border: "2px solid #ffffff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            zIndex: 10,
            cursor: "crosshair"
          }}
        />
      ];

      if (label) {
        elements.push(
          <span
            key={`${handleId}-label`}
            style={{ top: `calc(${offsetTop} - 7px)` }}
            className={`absolute text-[8px] font-bold uppercase tracking-wider text-zinc-400 bg-white border border-zinc-200 px-1 rounded-sm shadow-3xs pointer-events-none select-none z-20 ${
              isTarget ? "left-3" : "right-3"
            }`}
          >
            {label}
          </span>
        );
      }

      return elements;
    });
  };

  // Node previews based on type
  const renderPreview = () => {
    switch (type) {
      case "webhookTrigger":
        return (
          <div className="mt-2 text-[9px] text-zinc-400 border-t border-zinc-100 pt-1.5 font-mono truncate max-w-full">
            HTTP trigger configuration active
          </div>
        );
      case "postgresQuery":
        return (
          <div className="mt-2 text-[9px] text-zinc-500 bg-zinc-50 border border-zinc-200 p-1.5 rounded-lg font-mono truncate max-w-full">
            {data.query || "No query defined"}
          </div>
        );
      case "apiCall":
        return (
          <div className="mt-2 space-y-1 border-t border-zinc-100 pt-1.5">
            <div className="flex items-center gap-1">
              <span className="text-[8px] font-bold bg-zinc-100 text-zinc-600 px-1 rounded">{data.method || "GET"}</span>
              <span className="text-[9px] font-mono text-zinc-400 truncate flex-1">{data.url || "https://..."}</span>
            </div>
          </div>
        );
      case "jsonTransform":
        return (
          <div className="mt-2 text-[9px] text-zinc-500 bg-zinc-50 border border-zinc-200 p-1.5 rounded-lg font-mono truncate max-w-full">
            {data.mapping ? data.mapping.split("\n")[0] + "..." : "JS Transformer"}
          </div>
        );
      case "jsRunner":
        return (
          <div className="mt-2 space-y-1">
            <div className="text-[9px] text-zinc-500 bg-zinc-50 border border-zinc-200 p-1.5 rounded-lg font-mono truncate max-w-full">
              {data.code ? data.code.split("\n")[0] + "..." : "JS Runner Code"}
            </div>
            <div className="flex items-center gap-1.5 text-[8.5px] text-zinc-400 font-medium">
              <span>{inputs} inputs</span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
              <span>{outputs} output</span>
            </div>
          </div>
        );
      case "conditionalRouter":
        return (
          <div className="mt-2 text-[9px] text-zinc-500 bg-zinc-50 border border-zinc-200 p-1.5 rounded-lg font-mono truncate max-w-full">
            IF: {data.condition || "true"}
          </div>
        );
      case "slackNotify":
        return (
          <div className="mt-2 text-[9px] text-zinc-400 border-t border-zinc-100 pt-1.5 truncate max-w-full">
            Message: {data.message || "No slack alert defined"}
          </div>
        );
      case "httpResponse":
        return (
          <div className="mt-2 flex items-center gap-1.5 border-t border-zinc-100 pt-1.5">
            <span className="text-[8px] font-bold bg-blue-50 text-blue-700 border border-blue-100 px-1 rounded">
              Status {data.statusCode || 200}
            </span>
            <span className="text-[9px] text-zinc-400 font-mono">Response returned</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`w-[260px] bg-white border rounded-2xl p-4 transition-all duration-200 relative select-none shadow-[0_2px_8px_-3px_rgba(0,0,0,0.06),0_8px_16px_-8px_rgba(0,0,0,0.04)] ${
        selected
          ? "border-zinc-900 ring-4 ring-zinc-900/5 shadow-md"
          : "border-zinc-200/80 hover:border-zinc-300"
      }`}
    >
      {/* Input Handles on Left */}
      {renderHandles(inputs, "target")}

      {/* Node Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs ${getCategoryColor(category)}`}>
            <NodeIcon name={icon} className="w-4 h-4" />
          </div>
          <div className="text-left">
            <h4 className="text-[11.5px] font-bold text-zinc-800 leading-tight">{name || "Custom Node"}</h4>
            <span className="text-[9px] font-medium text-zinc-400 tracking-wide uppercase leading-none block mt-0.5">{category}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-[10px] text-zinc-400 text-left mt-2 leading-relaxed">{description}</p>

      {/* Interactive preview area */}
      {renderPreview()}

      {/* Output Handles on Right */}
      {renderHandles(outputs, "source")}
    </div>
  );
}
