#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  TextContent,
} from "@modelcontextprotocol/sdk/types.js";

const API_URL = process.env.API_URL || "http://localhost:3000/api";

let adminToken = null;

const server = new Server(
  {
    name: "greek-trainer-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Helper function for API calls
async function apiCall(method, endpoint, body = null, useAdminToken = false) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (useAdminToken && adminToken) {
    headers["Authorization"] = `Bearer ${adminToken}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    throw new Error(`API call failed: ${error.message}`);
  }
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "admin_login",
        description: "Login as admin to get auth token",
        inputSchema: {
          type: "object",
          properties: {
            email: {
              type: "string",
              description: "Admin email (default: admin@greektrainer.local)",
            },
            password: {
              type: "string",
              description: "Admin password (default: admin123)",
            },
          },
        },
      },
      {
        name: "get_phrases",
        description: "Get all Greek phrases",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_phrase",
        description: "Get a specific phrase with variants and mistakes",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "number",
              description: "Phrase ID",
            },
          },
          required: ["id"],
        },
      },
      {
        name: "add_phrase",
        description: "Add a new Greek phrase (requires admin)",
        inputSchema: {
          type: "object",
          properties: {
            el: {
              type: "string",
              description: "Greek phrase",
            },
            ru: {
              type: "string",
              description: "Russian translation",
            },
            accents: {
              type: "array",
              items: { type: "string" },
              description: "Variants with different accents",
            },
            mistakes: {
              type: "array",
              items: { type: "string" },
              description: "Common mistake variants",
            },
          },
          required: ["el", "ru"],
        },
      },
      {
        name: "delete_phrase",
        description: "Delete a phrase (requires admin)",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "number",
              description: "Phrase ID",
            },
          },
          required: ["id"],
        },
      },
      {
        name: "get_random_phrase",
        description: "Get a random phrase for exercises",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "record_exercise_result",
        description: "Record the result of an exercise attempt",
        inputSchema: {
          type: "object",
          properties: {
            phraseId: {
              type: "number",
              description: "Phrase ID",
            },
            exerciseType: {
              type: "string",
              description: "Type of exercise (ex1, ex2, ex4, ex6, ex7)",
            },
            isCorrect: {
              type: "boolean",
              description: "Whether the answer was correct",
            },
            userId: {
              type: "string",
              description: "User ID (optional, defaults to anonymous)",
            },
          },
          required: ["phraseId", "exerciseType", "isCorrect"],
        },
      },
      {
        name: "get_user_stats",
        description: "Get user statistics",
        inputSchema: {
          type: "object",
          properties: {
            userId: {
              type: "string",
              description: "User ID (default: current or anonymous)",
            },
          },
        },
      },
      {
        name: "register_user",
        description: "Register a new user",
        inputSchema: {
          type: "object",
          properties: {
            email: {
              type: "string",
              description: "User email",
            },
            password: {
              type: "string",
              description: "Password (minimum 6 characters)",
            },
          },
          required: ["email", "password"],
        },
      },
      {
        name: "login_user",
        description: "Login user and get auth token",
        inputSchema: {
          type: "object",
          properties: {
            email: {
              type: "string",
              description: "User email",
            },
            password: {
              type: "string",
              description: "Password",
            },
          },
          required: ["email", "password"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request;

  try {
    let result;

    switch (name) {
      case "admin_login": {
        const email = args.email || "admin@greektrainer.local";
        const password = args.password || "admin123";
        const res = await apiCall("POST", "/auth/login", { email, password });
        adminToken = res.token;
        result = {
          success: true,
          message: `Logged in as ${res.user.email}`,
          user: res.user,
          token: res.token,
        };
        break;
      }

      case "get_phrases": {
        result = await apiCall("GET", "/phrases");
        break;
      }

      case "get_phrase": {
        result = await apiCall("GET", `/phrases/${args.id}`);
        break;
      }

      case "add_phrase": {
        result = await apiCall(
          "POST",
          "/phrases",
          {
            el: args.el,
            ru: args.ru,
            wAccents: args.accents || [],
            mistakes: args.mistakes || [],
          },
          true
        );
        break;
      }

      case "delete_phrase": {
        result = await apiCall("DELETE", `/phrases/${args.id}`, null, true);
        break;
      }

      case "get_random_phrase": {
        result = await apiCall("GET", "/exercises/random");
        break;
      }

      case "record_exercise_result": {
        result = await apiCall("POST", "/exercises/result", {
          phraseId: args.phraseId,
          exerciseType: args.exerciseType,
          isCorrect: args.isCorrect,
          userId: args.userId,
        });
        break;
      }

      case "get_user_stats": {
        const userId = args.userId || "anonymous";
        result = await apiCall("GET", `/exercises/stats/${userId}`);
        break;
      }

      case "register_user": {
        result = await apiCall("POST", "/auth/register", {
          email: args.email,
          password: args.password,
        });
        break;
      }

      case "login_user": {
        result = await apiCall("POST", "/auth/login", {
          email: args.email,
          password: args.password,
        });
        break;
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Greek Trainer MCP server running on stdio");
}

main().catch(console.error);
