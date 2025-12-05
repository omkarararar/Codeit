const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");
const ACTIONS = require("./Actions");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for now (you can restrict this later)
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Redis client setup
const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
});

const pubClient = redisClient.duplicate();
const subClient = redisClient.duplicate();

// Redis helper functions for user socket mapping
async function setUserSocket(socketId, username) {
  await redisClient.hSet('user:sockets', socketId, username);
  await redisClient.expire('user:sockets', 86400); // 24 hour time to live
}

async function getUserSocket(socketId) {
  return await redisClient.hGet('user:sockets', socketId);
}

async function getAllUserSockets() {
  return await redisClient.hGetAll('user:sockets');
}

async function deleteUserSocket(socketId) {
  await redisClient.hDel('user:sockets', socketId);
}

// Redis helper functions for room files
async function setRoomFile(roomId, fileId, file) {
  await redisClient.hSet(
    `room:${roomId}:files`,
    fileId,
    JSON.stringify(file)
  );
  await redisClient.expire(`room:${roomId}:files`, 604800); // 7 day time to live
}

async function getRoomFiles(roomId) {
  const filesHash = await redisClient.hGetAll(`room:${roomId}:files`);
  const files = [];
  for (const [id, data] of Object.entries(filesHash)) {
    files.push(JSON.parse(data));
  }
  return files;
}

async function getRoomFile(roomId, fileId) {
  const fileData = await redisClient.hGet(`room:${roomId}:files`, fileId);
  return fileData ? JSON.parse(fileData) : null;
}

async function deleteRoomFile(roomId, fileId) {
  await redisClient.hDel(`room:${roomId}:files`, fileId);
}

async function updateRoomFileName(roomId, fileId, newName) {
  const file = await getRoomFile(roomId, fileId);
  if (file) {
    file.name = newName;
    await setRoomFile(roomId, fileId, file);
  }
}

async function updateRoomFileContent(roomId, fileId, content) {
  const file = await getRoomFile(roomId, fileId);
  if (file) {
    file.content = content;
    await setRoomFile(roomId, fileId, file);
  }
}

// Get all connected clients in a room (works with Redis adapter)
const getAllConnectedClients = async (roomId) => {
  const sockets = await io.in(roomId).fetchSockets();
  const userSockets = await getAllUserSockets();

  return sockets.map((socket) => ({
    socketId: socket.id,
    username: userSockets[socket.id] || 'Unknown',
  }));
};

// Initialize room with default file
const initializeRoomFiles = async (roomId) => {
  const files = await getRoomFiles(roomId);
  if (files.length === 0) {
    const defaultFile = {
      id: "file-1",
      name: "main.js",
      content: "",
    };
    await setRoomFile(roomId, defaultFile.id, defaultFile);
  }
};

// Setup Redis and start server
async function setupRedis() {
  try {
    await redisClient.connect();
    await pubClient.connect();
    await subClient.connect();

    // Attach Redis adapter to Socket.IO for cross-server communication
    io.adapter(createAdapter(pubClient, subClient));

    console.log('✅ Redis connected and adapter attached');
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    console.log('⚠️  Running without Redis (single-server mode)');
  }
}

// Socket.IO connection handler
io.on("connection", (socket) => {

  socket.on(ACTIONS.JOIN, async ({ roomId, username }) => {
    await setUserSocket(socket.id, username);
    socket.join(roomId);

    await initializeRoomFiles(roomId);

    const clients = await getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });

    const files = await getRoomFiles(roomId);
    socket.emit(ACTIONS.FILE_SYNC, { files });
  });

  socket.on(ACTIONS.CODE_CHANGE, async ({ roomId, code, fileId }) => {
    await updateRoomFileContent(roomId, fileId, code);
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code, fileId });
  });

  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code, fileId }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code, fileId });
  });

  socket.on(ACTIONS.FILE_CREATE, async ({ roomId, file }) => {
    await setRoomFile(roomId, file.id, file);
    io.in(roomId).emit(ACTIONS.FILE_CREATE, { file });
  });

  socket.on(ACTIONS.FILE_DELETE, async ({ roomId, fileId }) => {
    await deleteRoomFile(roomId, fileId);
    io.in(roomId).emit(ACTIONS.FILE_DELETE, { fileId });
  });

  socket.on(ACTIONS.FILE_RENAME, async ({ roomId, fileId, newName }) => {
    await updateRoomFileName(roomId, fileId, newName);
    io.in(roomId).emit(ACTIONS.FILE_RENAME, { fileId, newName });
  });

  socket.on("disconnecting", async () => {
    const rooms = [...socket.rooms];
    const username = await getUserSocket(socket.id);

    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username,
      });
    });

    await deleteUserSocket(socket.id);
    socket.leave();
  });
});

const PORT = process.env.PORT || 5000;

// Start Redis setup then start server
setupRedis().then(() => {
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((error) => {
  console.error('Failed to setup Redis:', error);
  // Start server anyway (will work in single-server mode)
  server.listen(PORT, () => console.log(`Server running on port ${PORT} (without Redis)`));
});
