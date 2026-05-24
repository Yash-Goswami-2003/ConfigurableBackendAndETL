// Node templates definition schema
export const NODE_TEMPLATES = [
  {
    type: "webhookTrigger",
    name: "HTTP Request Trigger",
    description: "Triggers when this API path receives a request",
    inputs: 0,
    outputs: 1,
    category: "Trigger",
    icon: "zap",
    defaultData: {
      authRequired: false,
      validationSchema: "{\n  \"type\": \"object\"\n}"
    },
    properties: [
      { name: "authRequired", label: "Require Authentication (API Key)", type: "boolean" },
      { name: "validationSchema", label: "Request Body Schema Validation (JSON)", type: "code", language: "json" }
    ]
  },
  {
    type: "postgresQuery",
    name: "PostgreSQL Execute",
    description: "Runs custom SQL statements on Neon Database",
    inputs: 1,
    outputs: 1,
    category: "Database",
    icon: "database",
    defaultData: {
      query: "SELECT * FROM users WHERE email = {{trigger.body.email}} LIMIT 1;"
    },
    properties: [
      { name: "query", label: "SQL Query Statement", type: "code", language: "sql" }
    ]
  },
  {
    type: "apiCall",
    name: "API Request Fetch",
    description: "Performs HTTP request to external HTTP endpoint",
    inputs: 1,
    outputs: 1,
    category: "Integrations",
    icon: "globe",
    defaultData: {
      url: "https://api.stripe.com/v1/customers",
      method: "POST",
      headers: "{\n  \"Content-Type\": \"application/json\"\n}",
      body: "{\n  \"email\": \"{{trigger.body.email}}\"\n}"
    },
    properties: [
      { name: "url", label: "Endpoint URL Target", type: "text" },
      { name: "method", label: "Request Method", type: "select", options: ["GET", "POST", "PUT", "DELETE"] },
      { name: "headers", label: "HTTP Headers (JSON)", type: "code", language: "json" },
      { name: "body", label: "Payload Parameters Body (JSON)", type: "code", language: "json" }
    ]
  },
  {
    type: "jsonTransform",
    name: "JSON Synthesizer",
    description: "Transforms payloads using clean JS mapping rules",
    inputs: 1,
    outputs: 1,
    category: "Logic",
    icon: "cpu",
    defaultData: {
      mapping: "return {\n  id: trigger.id,\n  email: trigger.body.email,\n  dbResult: query.result[0] || null,\n  processedAt: new Date().toISOString()\n};"
    },
    properties: [
      { name: "mapping", label: "JavaScript Mapping Expression", type: "code", language: "javascript" }
    ]
  },
  {
    type: "conditionalRouter",
    name: "Branching Condition",
    description: "Splits graph flow depending on conditional truth",
    inputs: 1,
    outputs: 2, // Output 1 = True (top handle), Output 2 = False (bottom handle)
    category: "Logic",
    icon: "git-branch",
    defaultData: {
      condition: "trigger.body.amount >= 100"
    },
    properties: [
      { name: "condition", label: "JavaScript Condition Assertion", type: "text" }
    ]
  },
  {
    type: "slackNotify",
    name: "Slack Channel Alert",
    description: "Dispatches automated message alert to Slack webhook",
    inputs: 1,
    outputs: 0,
    category: "Integrations",
    icon: "message-square",
    defaultData: {
      webhookUrl: "https://hooks.slack.com/services/T00/B00/X00",
      message: "New user registered: {{trigger.body.email}} under org schema."
    },
    properties: [
      { name: "webhookUrl", label: "Slack Webhook URL Link", type: "text" },
      { name: "message", label: "Markdown Message Pattern", type: "textarea" }
    ]
  },
  {
    type: "httpResponse",
    name: "Return Response",
    description: "Terminates flow and returns JSON schema output",
    inputs: 1,
    outputs: 0,
    category: "Trigger",
    icon: "log-out",
    defaultData: {
      statusCode: 200,
      body: "{\n  \"success\": true,\n  \"data\": {{result}}\n}"
    },
    properties: [
      { name: "statusCode", label: "HTTP Response Status Code", type: "select", options: [200, 201, 400, 401, 404, 500] },
      { name: "body", label: "Response Body Payload (JSON)", type: "code", language: "json" }
    ]
  },
  {
    type: "jsRunner",
    name: "JavaScript Runner",
    description: "Evaluates JS code (statements or arrow function) with customizable inputs",
    inputs: 1,
    outputs: 1,
    category: "Logic",
    icon: "cpu",
    defaultData: {
      inputsCount: 1,
      inputsConfig: "{\n  \"val\": \"{{trigger.body.email}}\"\n}",
      code: "(input0) => {\n  // input0 is the connected node result\n  return input0;\n}"
    },
    properties: [
      { name: "inputsCount", label: "Number of Inputs", type: "number", min: 0, max: 10 },
      { name: "inputsConfig", label: "Inputs Config (JSON)", type: "code", language: "json" },
      { name: "code", label: "JavaScript Code / Arrow Function", type: "code", language: "javascript" }
    ]
  }
];
