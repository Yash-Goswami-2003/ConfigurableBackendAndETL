import { NextResponse } from "next/server";
import sql, { initDb } from "@/lib/db";
import postgres from "postgres";

// Global cache for dynamically created PostgreSQL client connection pools
const dynamicPools = new Map();

function getDynamicPool(connectionString) {
  if (!connectionString || !connectionString.trim()) return null;
  const key = connectionString.trim();
  if (dynamicPools.has(key)) {
    return dynamicPools.get(key);
  }
  try {
    const client = postgres(key, {
      ssl: key.includes("localhost") || key.includes("127.0.0.1") ? false : "require",
      max: 5,
    });
    dynamicPools.set(key, client);
    return client;
  } catch (err) {
    console.error("Failed to initialize dynamic Postgres client pool:", err);
    throw err;
  }
}

// Helper to extract function parameter names
function getParamNames(fn) {
  const fnStr = fn.toString().replace(/[\r\n\s]+/g, ' ');
  
  // Arrow function: (a, b) => ... or a => ...
  let result = fnStr.match(/^(?:async\s+)?(?:\(\s*([^)]*?)\s*\)|([a-zA-Z_$][a-zA-Z0-9_$]*))\s*=>/);
  if (result) {
    const paramsStr = result[1] !== undefined ? result[1] : result[2];
    return paramsStr.split(',').map(p => p.trim()).filter(p => p);
  }
  
  // Standard function: function(a, b) { ... }
  result = fnStr.match(/^(?:async\s+)?function(?:\s+[a-zA-Z_$][a-zA-Z0-9_$]*)?\s*\(\s*([^)]*?)\s*\)/);
  if (result) {
    return result[1].split(',').map(p => p.trim()).filter(p => p);
  }
  
  return [];
}

// Helper to evaluate javascript inside context variables (supports direct statements, arrow functions & destructuring)
async function executeJS(code, context, argsObject = {}) {
  try {
    const trimmed = code.trim();
    const isArrow = /^(async\s+)?(\([^)]*\)|[a-zA-Z_$][a-zA-Z0-9_$]*)\s*=>/.test(trimmed);
    const isFunction = /^(async\s+)?function\b/.test(trimmed);
    const isParenthesizedFunction = /^\(([^)]+)\)$/.test(trimmed) && (
      /^(async\s+)?(\([^)]*\)|[a-zA-Z_$][a-zA-Z0-9_$]*)\s*=>/.test(trimmed.slice(1, -1).trim()) ||
      /^(async\s+)?function\b/.test(trimmed.slice(1, -1).trim())
    );

    if (isArrow || isFunction || isParenthesizedFunction) {
      // Evaluate function string to function object
      const fn = new Function(`return (${trimmed})`)();
      
      const isDestructured = /^(async\s+)?\(\s*\{/.test(trimmed) || 
                             /^(async\s+)?function\s*[^(]*\(\s*\{/.test(trimmed) ||
                             /^\(\s*(async\s+)?\(\s*\{/.test(trimmed);
                             
      if (isDestructured) {
        return await fn(argsObject);
      }

      const params = getParamNames(fn);
      const args = params.map(p => context[p]);
      return await fn(...args);
    } else {
      // Direct block of statements (requires explicit return)
      const keys = Object.keys(context);
      const values = Object.values(context);
      const fn = new Function(...keys, trimmed);
      return await fn(...values);
    }
  } catch (e) {
    console.error("Executor Sandbox JS Error:", e);
    return { error: e.message };
  }
}

// Helper to interpolate double curly braces templates
function interpolate(text, context) {
  if (typeof text !== "string") return text;
  return text.replace(/\{\{([^}]+)\}\}/g, (match, expression, offset) => {
    try {
      const keys = expression.trim().split('.');
      let val = context;
      for (const key of keys) {
        if (val === null || val === undefined) {
          val = undefined;
          break;
        }
        val = val[key];
      }

      // Check if the variable is quoted (to distinguish string from raw JSON values)
      const charBefore = offset > 0 ? text[offset - 1] : '';
      const charAfter = offset + match.length < text.length ? text[offset + match.length] : '';
      const isQuoted = (charBefore === '"' && charAfter === '"') || (charBefore === "'" && charAfter === "'");

      if (val === undefined || val === null) {
        return isQuoted ? '' : 'null';
      }
      return typeof val === 'object' ? JSON.stringify(val) : val.toString();
    } catch (e) {
      console.error("Executor interpolation parse failure:", expression, e);
      return '';
    }
  });
}

// Helper to transform templates with double curly braces (e.g. {{query.x}} or '{{query.x}}') into Postgres-safe parameterized inputs
function prepareParameterizedQuery(sqlQuery, context) {
  const parameters = [];
  // Match optional single or double quotes around double curly braces to avoid quoting issues
  const queryWithPlaceholders = sqlQuery.replace(/(['"])?\{\{([^}]+)\}\}\1/g, (match, quote, expression) => {
    try {
      const keys = expression.trim().split('.');
      let val = context;
      for (const key of keys) {
        if (val === null || val === undefined) break;
        val = val[key];
      }
      parameters.push(val === undefined ? null : val);
      return `$${parameters.length}`;
    } catch (e) {
      console.error("Parameter parsing failure for SQL query:", expression, e);
      parameters.push(null);
      return `$${parameters.length}`;
    }
  });
  
  return { sql: queryWithPlaceholders, params: parameters };
}

// Maps type properties to friendly variable names for expressions
function getSimpleName(nodeType) {
  switch (nodeType) {
    case "webhookTrigger": return "trigger";
    case "postgresQuery": return "query";
    case "apiCall": return "api";
    case "jsonTransform": return "transform";
    case "jsRunner": case "javascriptRunner": return "jsRunner";
    case "conditionalRouter": return "condition";
    case "slackNotify": return "slack";
    case "httpResponse": return "response";
    default: return null;
  }
}

async function handleRequest(request, params, method) {
  try {
    const awaitedParams = await params;
    const pathSegments = awaitedParams.path || [];
    const joinedPath = '/' + pathSegments.join('/');
    const cleanPath = joinedPath.replace(/^\//, ''); // e.g., "test/users"

    await initDb();

    // 1. Fetch matching visual backend endpoint configuration
    const endpoints = await sql`
      SELECT e.id, e.name, e.method, e.path, e.configuration, p.postgres_connection 
      FROM endpoints e
      LEFT JOIN projects p ON e.project_id = p.id
      WHERE UPPER(e.method) = ${method.toUpperCase()} 
        AND TRIM(BOTH '/' FROM e.path) = ${cleanPath}
      LIMIT 1;
    `;

    if (endpoints.length === 0) {
      return NextResponse.json({
        error: `Endpoint not found: ${method} ${joinedPath}. Configure paths and methods in Weave Dashboard.`
      }, { status: 404 });
    }

    const endpoint = endpoints[0];
    const config = endpoint.configuration || {};
    const nodes = config.nodes || [];
    const edges = config.edges || [];

    if (nodes.length === 0) {
      return NextResponse.json({
        error: "This endpoint is configured but has an empty flow chart nodes list."
      }, { status: 400 });
    }

    // 2. Parse request variables
    const reqHeaders = Object.fromEntries(request.headers.entries());
    const { searchParams } = new URL(request.url);
    const reqQuery = Object.fromEntries(searchParams.entries());
    
    let reqBody = {};
    try {
      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        reqBody = await request.json();
      } else {
        const text = await request.text();
        if (text) reqBody = { text };
      }
    } catch (e) {
      // Body empty or not readable
    }

    // 3. Initialize dynamic execution context
    const context = {
      trigger: {
        headers: reqHeaders,
        query: reqQuery,
        body: reqBody
      }
    };

    // 4. Trace the execution path starting from the webhook trigger node
    let currentNode = nodes.find(n => n.type === "webhookTrigger");
    if (!currentNode) {
      // Fallback: start with the first node if no trigger node is explicitly declared
      currentNode = nodes[0];
    }

    let responseToReturn = null;
    let loopCount = 0;
    const maxLoop = 55; // Threshold bounds to prevent circular flow execution loops

    while (currentNode && loopCount < maxLoop) {
      loopCount++;
      const nodeId = currentNode.id;
      const nodeType = currentNode.type;
      
      let nodeResult = null;

      try {
        if (nodeType === "webhookTrigger") {
          nodeResult = context.trigger;
        } 
        else if (nodeType === "postgresQuery") {
          const rawQuery = currentNode.data?.query;
          if (!rawQuery || !rawQuery.trim()) {
            throw new Error("Neon Postgres query script is empty.");
          }
          const { sql: parameterizedSql, params } = prepareParameterizedQuery(rawQuery, context);
          
          console.log(`Executing Postgres query: ${parameterizedSql} with params:`, params);
          
          // Run statement against dynamic connection pool or fallback
          let queryResult;
          const connString = endpoint.postgres_connection;
          if (connString) {
            console.log("Using project-specific PostgreSQL database connector...");
            const dynamicSql = getDynamicPool(connString);
            queryResult = await dynamicSql.unsafe(parameterizedSql, params);
          } else {
            console.log("No connector connection string found; falling back to Weave default database...");
            queryResult = await sql.unsafe(parameterizedSql, params);
          }
          nodeResult = { result: queryResult };
        } 
        else if (nodeType === "apiCall") {
          const fetchUrl = interpolate(currentNode.data?.url, context);
          const fetchMethod = interpolate(currentNode.data?.method, context) || "GET";
          const fetchHeadersRaw = interpolate(currentNode.data?.headers, context);
          const fetchBodyRaw = interpolate(currentNode.data?.body, context);

          let headers = {};
          if (fetchHeadersRaw) {
            try { headers = JSON.parse(fetchHeadersRaw); } catch(e) {}
          }

          let fetchOptions = {};
          if (fetchMethod !== "GET" && fetchBodyRaw) {
            fetchOptions = { body: fetchBodyRaw };
          }

          if (!fetchUrl) {
            throw new Error("Target API request fetch URL is empty.");
          }

          const apiRes = await fetch(fetchUrl, {
            method: fetchMethod,
            headers: {
              "Content-Type": "application/json",
              ...headers
            },
            ...fetchOptions
          });

          let apiResultData;
          try {
            apiResultData = await apiRes.json();
          } catch(e) {
            apiResultData = await apiRes.text();
          }

          nodeResult = { result: apiResultData, status: apiRes.status };
        } 
        else if (nodeType === "jsonTransform") {
          const transformCode = currentNode.data?.mapping || "return {};";
          const transformOutput = await executeJS(transformCode, context);
          nodeResult = { result: transformOutput };
        } 
        else if (nodeType === "jsRunner" || nodeType === "javascriptRunner") {
          const incomingEdges = edges.filter(e => e.target === nodeId);
          const nodeContext = { ...context };

          // Parse inputsConfig mapping or values
          let portMapping = {};
          let customValues = {};
          if (currentNode.data?.inputsConfig) {
            try {
              const interpolatedJSON = interpolate(currentNode.data.inputsConfig, context);
              const parsed = JSON.parse(interpolatedJSON);
              for (const [key, val] of Object.entries(parsed)) {
                if (/^p\d+$/.test(key)) {
                  portMapping[key] = val;
                } else {
                  customValues[key] = val;
                }
              }
            } catch (e) {
              console.error("Failed to parse inputsConfig JSON:", e);
            }
          }

          const argsObject = {};
          const inputsCount = currentNode.data?.inputsCount || 1;
          for (let i = 0; i < inputsCount; i++) {
            const handleId = `in-${i}`;
            const portLabel = `p${i}`;
            const mappedVarName = portMapping[portLabel] || `input${i}`;
            const edge = incomingEdges.find(e => e.targetHandle === handleId);
            const val = edge ? context[edge.source] : null;
            
            argsObject[mappedVarName] = val;
            nodeContext[mappedVarName] = val;
            nodeContext[`input${i}`] = val;
            nodeContext[`input_${i}`] = val;
          }

          // Merge any custom non-port values
          for (const [key, val] of Object.entries(customValues)) {
            argsObject[key] = val;
            nodeContext[key] = val;
          }

          const runnerCode = currentNode.data?.code || "() => null;";
          const runnerOutput = await executeJS(runnerCode, nodeContext, argsObject);
          nodeResult = { result: runnerOutput };
        }
        else if (nodeType === "slackNotify") {
          const slackWebhook = interpolate(currentNode.data?.webhookUrl, context);
          const messageText = interpolate(currentNode.data?.message, context);

          if (slackWebhook && messageText) {
            await fetch(slackWebhook, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: messageText })
            });
          }
          nodeResult = { success: true };
        } 
        else if (nodeType === "httpResponse") {
          // Safeguard: fallback legacy `transform` references if not set
          if (!context.transform) {
            context.transform = context.result;
          }
          
          const statusCode = Number(interpolate(currentNode.data?.statusCode, context)) || 200;
          const bodyOutput = interpolate(currentNode.data?.body, context);

          let parsedBody = bodyOutput;
          let isJson = false;
          try {
            parsedBody = JSON.parse(bodyOutput);
            isJson = true;
          } catch(e) {
            // Treat as raw text
          }

          responseToReturn = isJson
            ? NextResponse.json(parsedBody, { status: statusCode })
            : new NextResponse(bodyOutput, { status: statusCode, headers: { "Content-Type": "text/plain" } });
          
          break; // Stop execution loop on HTTP Response node
        }
      } catch (err) {
        console.error(`Execution error inside node [${nodeId}]:`, err);
        nodeResult = { error: err.message };
      }

      // Save output context
      context[nodeId] = nodeResult;
      context[nodeType] = nodeResult;
      const simpleName = getSimpleName(nodeType);
      if (simpleName) {
        context[simpleName] = nodeResult;
      }

      // Dynamic shortcut helpers to access the last executed node's output via {{result}} or {{data}}
      if (nodeResult && nodeResult.result !== undefined) {
        context.result = nodeResult.result;
        context.data = nodeResult.result;
      } else {
        context.result = nodeResult;
        context.data = nodeResult;
      }

      // Check outgoing path targets
      const outgoingEdges = edges.filter(e => e.source === nodeId);
      if (outgoingEdges.length === 0) {
        break; // Flow completed
      }

      if (nodeType === "conditionalRouter") {
        const checkCondition = currentNode.data?.condition || "true";
        let isTrue = false;
        try {
          isTrue = await executeJS(`return Boolean(${checkCondition});`, context);
        } catch(e) {
          isTrue = false;
        }

        const routedEdge = outgoingEdges.find(e => e.sourceHandle === (isTrue ? "out-0" : "out-1"));
        if (routedEdge) {
          currentNode = nodes.find(n => n.id === routedEdge.target);
        } else {
          currentNode = null;
        }
      } else {
        const nextEdge = outgoingEdges[0];
        currentNode = nodes.find(n => n.id === nextEdge.target);
      }
    }

    if (!responseToReturn) {
      // Diagnostic telemetry fallback
      return NextResponse.json({
        message: "Visual backend graph completed execution without encountering an HTTP Response node.",
        telemetry: Object.fromEntries(
          Object.entries(context).filter(([key]) => key !== "trigger")
        )
      }, { status: 200 });
    }

    return responseToReturn;

  } catch (error) {
    console.error("Flow Executor catch-all error:", error);
    return NextResponse.json({ error: "Failed to execute backend workflow" }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  return handleRequest(request, params, "GET");
}

export async function POST(request, { params }) {
  return handleRequest(request, params, "POST");
}

export async function PUT(request, { params }) {
  return handleRequest(request, params, "PUT");
}

export async function DELETE(request, { params }) {
  return handleRequest(request, params, "DELETE");
}

export async function PATCH(request, { params }) {
  return handleRequest(request, params, "PATCH");
}
