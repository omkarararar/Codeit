const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const ACTIONS = require("./Actions");

const server = http.createServer(app);
const io = new Server(server);

const userSocketMap = {};
const roomFiles = {};

const getAllConnectedClients = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => ({
    socketId,
    username: userSocketMap[socketId],
  }));
};

const initializeRoomFiles = (roomId) => {
  if (!roomFiles[roomId]) {
    roomFiles[roomId] = {
      "file-1": {
        id: "file-1",
        name: "main.js",
        content: "",
      },
    };
  }
};

io.on("connection", (socket) => {

  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);

    initializeRoomFiles(roomId);

    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });

    socket.emit(ACTIONS.FILE_SYNC, {
      files: Object.values(roomFiles[roomId] || {}),
    });
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code, fileId }) => {
    if (roomFiles[roomId] && roomFiles[roomId][fileId]) {
      roomFiles[roomId][fileId].content = code;
    }
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code, fileId });
  });

  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code, fileId }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code, fileId });
  });

  socket.on(ACTIONS.FILE_CREATE, ({ roomId, file }) => {
    initializeRoomFiles(roomId);
    roomFiles[roomId][file.id] = file;
    io.in(roomId).emit(ACTIONS.FILE_CREATE, { file });
  });

  socket.on(ACTIONS.FILE_DELETE, ({ roomId, fileId }) => {
    if (roomFiles[roomId]) {
      delete roomFiles[roomId][fileId];
    }
    io.in(roomId).emit(ACTIONS.FILE_DELETE, { fileId });
  });

  socket.on(ACTIONS.FILE_RENAME, ({ roomId, fileId, newName }) => {
    if (roomFiles[roomId] && roomFiles[roomId][fileId]) {
      roomFiles[roomId][fileId].name = newName;
    }
    io.in(roomId).emit(ACTIONS.FILE_RENAME, { fileId, newName });
  });

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
    socket.leave();
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
