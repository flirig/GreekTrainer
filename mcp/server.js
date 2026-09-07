#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
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
      {
        name: "get_words",
        description: "Get all Greek words",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_word",
        description: "Get a specific word with variants",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "number",
              description: "Word ID",
            },
          },
          required: ["id"],
        },
      },
      {
        name: "add_word",
        description: "Add a new Greek word (requires admin)",
        inputSchema: {
          type: "object",
          properties: {
            el: {
              type: "string",
              description: "Greek word",
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
        name: "delete_word",
        description: "Delete a word (requires admin)",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "number",
              description: "Word ID",
            },
          },
          required: ["id"],
        },
      },
      {
        name: "get_rules",
        description: "Get all grammar rules",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_rule",
        description: "Get a specific grammar rule with words",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "number",
              description: "Rule ID",
            },
          },
          required: ["id"],
        },
      },
      {
        name: "create_rule",
        description: "Create a new grammar rule (requires admin)",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Rule name (e.g., 'Noun', 'Verb', 'Article')",
            },
            description: {
              type: "string",
              description: "Rule description (optional)",
            },
          },
          required: ["name"],
        },
      },
      {
        name: "delete_rule",
        description: "Delete a grammar rule (requires admin)",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "number",
              description: "Rule ID",
            },
          },
          required: ["id"],
        },
      },
      {
        name: "extract_words",
        description: "Extract words from all phrases and add to database",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "init_word_data",
        description: "Initialize grammar rules and update word translations (requires admin)",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_random_word",
        description: "Get a random word for exercises",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_word_options",
        description: "Get translation options for a word (multiple choice)",
        inputSchema: {
          type: "object",
          properties: {
            wordId: {
              type: "number",
              description: "Word ID",
            },
          },
          required: ["wordId"],
        },
      },
      {
        name: "record_word_exercise",
        description: "Record word exercise result",
        inputSchema: {
          type: "object",
          properties: {
            wordId: {
              type: "number",
              description: "Word ID",
            },
            isCorrect: {
              type: "boolean",
              description: "Whether the answer was correct",
            },
          },
          required: ["wordId", "isCorrect"],
        },
      },
      {
        name: "get_words_by_rule",
        description: "Get all words for a specific grammar rule",
        inputSchema: {
          type: "object",
          properties: {
            ruleId: {
              type: "number",
              description: "Grammar rule ID",
            },
          },
          required: ["ruleId"],
        },
      },
      {
        name: "get_lists",
        description: "Get all word lists",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_list",
        description: "Get a specific list with phrases and words",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "number",
              description: "List ID",
            },
          },
          required: ["id"],
        },
      },
      {
        name: "create_list",
        description: "Create a new word list (requires admin)",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "List title",
            },
            description: {
              type: "string",
              description: "List description (optional)",
            },
          },
          required: ["title"],
        },
      },
      {
        name: "add_phrase_to_list",
        description: "Add a phrase to a list (requires admin)",
        inputSchema: {
          type: "object",
          properties: {
            listId: {
              type: "number",
              description: "List ID",
            },
            phraseId: {
              type: "number",
              description: "Phrase ID",
            },
          },
          required: ["listId", "phraseId"],
        },
      },
      {
        name: "add_word_to_list",
        description: "Add a word to a list (requires admin)",
        inputSchema: {
          type: "object",
          properties: {
            listId: {
              type: "number",
              description: "List ID",
            },
            wordId: {
              type: "number",
              description: "Word ID",
            },
          },
          required: ["listId", "wordId"],
        },
      },
      {
        name: "remove_phrase_from_list",
        description: "Remove a phrase from a list (requires admin)",
        inputSchema: {
          type: "object",
          properties: {
            listId: {
              type: "number",
              description: "List ID",
            },
            phraseId: {
              type: "number",
              description: "Phrase ID",
            },
          },
          required: ["listId", "phraseId"],
        },
      },
      {
        name: "remove_word_from_list",
        description: "Remove a word from a list (requires admin)",
        inputSchema: {
          type: "object",
          properties: {
            listId: {
              type: "number",
              description: "List ID",
            },
            wordId: {
              type: "number",
              description: "Word ID",
            },
          },
          required: ["listId", "wordId"],
        },
      },
      {
        name: "delete_list",
        description: "Delete a list (requires admin)",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "number",
              description: "List ID",
            },
          },
          required: ["id"],
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

      case "get_words": {
        result = await apiCall("GET", "/words");
        break;
      }

      case "get_word": {
        result = await apiCall("GET", `/words/${args.id}`);
        break;
      }

      case "add_word": {
        result = await apiCall(
          "POST",
          "/words",
          {
            el: args.el,
            ru: args.ru,
            accents: args.accents || [],
            mistakes: args.mistakes || [],
          },
          true
        );
        break;
      }

      case "delete_word": {
        result = await apiCall("DELETE", `/words/${args.id}`, null, true);
        break;
      }

      case "get_lists": {
        result = await apiCall("GET", "/lists");
        break;
      }

      case "get_list": {
        result = await apiCall("GET", `/lists/${args.id}`);
        break;
      }

      case "create_list": {
        result = await apiCall(
          "POST",
          "/lists",
          {
            title: args.title,
            description: args.description,
          },
          true
        );
        break;
      }

      case "add_phrase_to_list": {
        result = await apiCall(
          "PUT",
          `/lists/${args.listId}/phrases/${args.phraseId}`,
          {},
          true
        );
        break;
      }

      case "add_word_to_list": {
        result = await apiCall(
          "PUT",
          `/lists/${args.listId}/words/${args.wordId}`,
          {},
          true
        );
        break;
      }

      case "remove_phrase_from_list": {
        result = await apiCall(
          "DELETE",
          `/lists/${args.listId}/phrases/${args.phraseId}`,
          null,
          true
        );
        break;
      }

      case "remove_word_from_list": {
        result = await apiCall(
          "DELETE",
          `/lists/${args.listId}/words/${args.wordId}`,
          null,
          true
        );
        break;
      }

      case "delete_list": {
        result = await apiCall("DELETE", `/lists/${args.id}`, null, true);
        break;
      }

      case "get_rules": {
        result = await apiCall("GET", "/rules");
        break;
      }

      case "get_rule": {
        result = await apiCall("GET", `/rules/${args.id}`);
        break;
      }

      case "create_rule": {
        result = await apiCall(
          "POST",
          "/rules",
          {
            name: args.name,
            description: args.description,
          },
          true
        );
        break;
      }

      case "delete_rule": {
        result = await apiCall("DELETE", `/rules/${args.id}`, null, true);
        break;
      }

      case "extract_words": {
        result = await apiCall("POST", "/extract-words", {}, true);
        break;
      }

      case "init_word_data": {
        result = await apiCall("POST", "/init-word-data", {}, true);
        break;
      }

      case "get_random_word": {
        result = await apiCall("GET", "/word-exercises/random");
        break;
      }

      case "get_word_options": {
        result = await apiCall("GET", `/word-exercises/options/${args.wordId}`);
        break;
      }

      case "record_word_exercise": {
        result = await apiCall("POST", "/word-exercises/result", {
          wordId: args.wordId,
          isCorrect: args.isCorrect
        });
        break;
      }

      case "get_words_by_rule": {
        result = await apiCall("GET", `/word-exercises/by-rule/${args.ruleId}`);
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
