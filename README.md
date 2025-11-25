# Codeit - Real-Time Collaborative Code Editor

A real-time collaborative code editor with multi-file management, built with React, Node.js, Socket.IO, and CodeMirror.

## Features

- **Real-time collaboration** - Multiple users edit simultaneously
- **File management** - Create, import, download, rename, and delete files
- **Multi-file support** - Work with multiple files in one session
- **Syntax highlighting** - CodeMirror with Dracula theme
- **Room system** - Create/join rooms with unique IDs

## Quick Start

### Installation
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Running
```bash
# Start server (port 5000)
cd server
npm start

# Start client (port 3000)
cd client
npm start
```

## File Operations

- **➕ Create** - Click green button to create new file
- **📤 Import** - Click blue button to upload file from computer
- **💾 Download** - Click to save file locally
- **✏️ Rename** - Click to rename file
- **🗑️ Delete** - Click to remove file (requires confirmation)

## Tech Stack

**Frontend:** React, Socket.IO Client, CodeMirror, React Router, React Hot Toast, Bootstrap  
**Backend:** Node.js, Express, Socket.IO

## Important Notes

- Files are stored in server memory (not persistent)
- Files are lost when server restarts
- Download important files before closing session
- Text files only (no binary files)

## License

MIT License
