# Greek Trainer MCP Server

Model Context Protocol server for Greek Trainer API. Allows Claude to interact with the Greek Trainer application.

## Installation

```bash
cd mcp
npm install
```

## Usage

### Run locally

```bash
npm start
```

The server will start and listen on stdio.

### Configure with Claude

Add to your Claude settings (`.claude/agents/config.json` or similar):

```json
{
  "mcp_servers": {
    "greek-trainer": {
      "command": "node",
      "args": ["/path/to/GreekTrainer/mcp/server.js"],
      "env": {
        "API_URL": "http://localhost:3000/api"
      }
    }
  }
}
```

Or for Railway production:

```json
{
  "mcp_servers": {
    "greek-trainer": {
      "command": "node",
      "args": ["/path/to/GreekTrainer/mcp/server.js"],
      "env": {
        "API_URL": "https://greektrainer-production.up.railway.app/api"
      }
    }
  }
}
```

## Available Tools

### Authentication
- `admin_login` - Login as admin (default: admin@greektrainer.local / admin123)
- `register_user` - Register a new user
- `login_user` - Login user and get token

### Phrases Management
- `get_phrases` - Get all phrases
- `get_phrase` - Get specific phrase with variants
- `add_phrase` - Add new phrase (requires admin)
- `delete_phrase` - Delete phrase (requires admin)
- `get_random_phrase` - Get random phrase for exercises

### Words Management
- `get_words` - Get all words
- `get_word` - Get specific word with variants
- `add_word` - Add new word (requires admin)
- `delete_word` - Delete word (requires admin)

### Word Lists
- `get_lists` - Get all word lists
- `get_list` - Get list with all phrases and words
- `create_list` - Create new list (requires admin)
- `add_phrase_to_list` - Add phrase to list (requires admin)
- `add_word_to_list` - Add word to list (requires admin)
- `remove_phrase_from_list` - Remove phrase from list (requires admin)
- `remove_word_from_list` - Remove word from list (requires admin)
- `delete_list` - Delete list (requires admin)

### Exercise Tracking
- `record_exercise_result` - Record exercise result
- `get_user_stats` - Get user statistics

## Example Usage

```javascript
// Phrases
await tool_use("add_phrase", {
  el: "ζητώ τον λογαροασμό μετά το φαγητό",
  ru: "Прошу счет после обеда",
  accents: ["ζητώ τόν λογαροασμό μετά το φαγητό"],
  mistakes: ["ζητώ τον λογαροασμό μετά τα φαγητό"]
})

// Words
await tool_use("add_word", {
  el: "καλημέρα",
  ru: "доброе утро",
  accents: ["καλημέρα"],
  mistakes: ["καλημέρα"]
})

// Lists
await tool_use("create_list", {
  title: "Greeting words",
  description: "Common Greek greetings"
})

await tool_use("add_phrase_to_list", {
  listId: 1,
  phraseId: 1
})

await tool_use("add_word_to_list", {
  listId: 1,
  wordId: 1
})

// Get list with all content
await tool_use("get_list", {
  id: 1
})

// Record exercise result
await tool_use("record_exercise_result", {
  phraseId: 1,
  exerciseType: "ex1",
  isCorrect: true
})
```

## Environment Variables

- `API_URL` - Base URL of Greek Trainer API (default: http://localhost:3000/api)

## Default Credentials

- Email: `admin@greektrainer.local`
- Password: `admin123`

**Note:** Change these in production!
