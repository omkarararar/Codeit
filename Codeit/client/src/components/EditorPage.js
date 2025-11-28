import React, { useEffect, useRef, useState } from "react";
import Client from "./Client";
import Editor from "./Editor";
import FileExplorer from "./FileExplorer";
import { initSocket } from "../Socket";
import { ACTIONS } from "../Actions";
import {
  useNavigate,
  useLocation,
  Navigate,
  useParams,
} from "react-router-dom";
import { toast } from "react-hot-toast";

function EditorPage() {
  const [clients, setClients] = useState([]);
  const [files, setFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const codeRef = useRef(null);

  const Location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();
  const socketRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      const handleErrors = (err) => {
        console.error("Socket error:", err);
        toast.error("Connection failed. Please try again.");
        navigate("/");
      };

      // Join room
      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: Location.state?.username,
      });

      // Handle new clients joining
      socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
        if (username !== Location.state?.username) {
          toast.success(`${username} joined the room`);
        }
        setClients(clients);
        socketRef.current.emit(ACTIONS.SYNC_CODE, {
          code: codeRef.current,
          socketId,
          fileId: activeFileId,
        });
      });

      // Handle client disconnection
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room`);
        setClients((prev) => prev.filter((client) => client.socketId !== socketId));
      });

      // Receive files when joining room
      socketRef.current.on(ACTIONS.FILE_SYNC, ({ files }) => {
        setFiles(files);
        if (files.length > 0 && !activeFileId) {
          setActiveFileId(files[0].id);
        }
      });

      // Handle file creation from other users
      socketRef.current.on(ACTIONS.FILE_CREATE, ({ file }) => {
        setFiles((prev) => {
          if (prev.find((f) => f.id === file.id)) return prev;
          return [...prev, file];
        });
      });

      // Handle file deletion from other users
      socketRef.current.on(ACTIONS.FILE_DELETE, ({ fileId }) => {
        setFiles((prev) => {
          const newFiles = prev.filter((f) => f.id !== fileId);
          if (fileId === activeFileId && newFiles.length > 0) {
            setActiveFileId(newFiles[0].id);
          }
          return newFiles;
        });
      });

      // Handle file rename from other users
      socketRef.current.on(ACTIONS.FILE_RENAME, ({ fileId, newName }) => {
        setFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, name: newName } : f))
        );
      });
    };

    init();

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);
        socketRef.current.off(ACTIONS.FILE_SYNC);
        socketRef.current.off(ACTIONS.FILE_CREATE);
        socketRef.current.off(ACTIONS.FILE_DELETE);
        socketRef.current.off(ACTIONS.FILE_RENAME);
      }
    };
  }, []);

  if (!Location.state) {
    return <Navigate to="/" />;
  }

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID copied!");
    } catch (error) {
      toast.error("Failed to copy Room ID");
    }
  };

  const leaveRoom = () => {
    navigate("/");
  };

  // File management handlers
  const handleFileCreate = (fileName) => {
    if (!socketRef.current) {
      toast.error("Not connected to server");
      return;
    }

    const newFile = {
      id: `file-${Date.now()}`,
      name: fileName,
      content: "",
    };

    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
    socketRef.current.emit(ACTIONS.FILE_CREATE, { roomId, file: newFile });
    toast.success(`${fileName} created`);
  };

  const handleFileImport = (fileName, content) => {
    if (!socketRef.current) {
      toast.error("Not connected to server");
      return;
    }

    const newFile = {
      id: `file-${Date.now()}`,
      name: fileName,
      content: content,
    };

    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
    socketRef.current.emit(ACTIONS.FILE_CREATE, { roomId, file: newFile });
    toast.success(`${fileName} imported`);
  };

  const handleFileDelete = (fileId) => {
    if (files.length <= 1) {
      toast.error("Cannot delete the last file");
      return;
    }

    setFiles((prev) => {
      const newFiles = prev.filter((f) => f.id !== fileId);
      if (fileId === activeFileId && newFiles.length > 0) {
        setActiveFileId(newFiles[0].id);
      }
      return newFiles;
    });

    socketRef.current.emit(ACTIONS.FILE_DELETE, { roomId, fileId });
    toast.success("File deleted");
  };

  const handleFileRename = (fileId, newName) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, name: newName } : f))
    );
    socketRef.current.emit(ACTIONS.FILE_RENAME, { roomId, fileId, newName });
    toast.success("File renamed");
  };

  const handleFileSelect = (fileId) => {
    setActiveFileId(fileId);
  };

  const handleCodeChange = (code) => {
    codeRef.current = code;
    setFiles((prev) =>
      prev.map((f) => (f.id === activeFileId ? { ...f, content: code } : f))
    );
  };

  const activeFile = files.find((f) => f.id === activeFileId);

  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">
        <div
          className="col-md-2 bg-dark text-light d-flex flex-column h-100"
          style={{ boxShadow: "2px 0px 4px rgba(0, 0, 0, 0.1)" }}
        >
          <div style={{ height: '2rem' }}></div>

          <FileExplorer
            files={files}
            activeFile={activeFileId}
            onFileSelect={handleFileSelect}
            onFileCreate={handleFileCreate}
            onFileDelete={handleFileDelete}
            onFileRename={handleFileRename}
            onFileImport={handleFileImport}
          />

          <hr className="my-2" />

          <div className="d-flex flex-column flex-grow-1 overflow-auto">
            <span className="fw-bold text-light mb-2">Members</span>
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>

          <hr className="my-2" />

          <div className="mb-3">
            <button className="btn btn-success w-100 mb-2 btn-sm" onClick={copyRoomId}>
              📋 Copy Room ID
            </button>
            <button className="btn btn-danger w-100 btn-sm" onClick={leaveRoom}>
              🚪 Leave Room
            </button>
          </div>
        </div>

        <div className="col-md-10 text-light d-flex flex-column h-100">
          {activeFile ? (
            <Editor
              socketRef={socketRef}
              roomId={roomId}
              fileId={activeFileId}
              content={activeFile.content}
              onCodeChange={handleCodeChange}
            />
          ) : (
            <div className="d-flex align-items-center justify-content-center h-100">
              <div className="text-center text-muted">
                <h3>No file selected</h3>
                <p>Create a new file or import one to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EditorPage;
