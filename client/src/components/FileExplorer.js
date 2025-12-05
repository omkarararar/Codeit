import React, { useState } from "react";
import { toast } from "react-hot-toast";
import "./FileExplorer.css";

// Helper function to get file icon based on extension
const getFileIcon = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const icons = {
        'js': '🟨',
        'jsx': '⚛️',
        'ts': '🔷',
        'tsx': '⚛️',
        'html': '🌐',
        'css': '🎨',
        'json': '📋',
        'py': '🐍',
        'java': '☕',
        'cpp': '⚙️',
        'c': '⚙️',
        'go': '🐹',
        'rs': '🦀',
        'md': '📝',
        'txt': '📄',
    };
    return icons[ext] || '📄';
};

function FileExplorer({ files, activeFile, onFileSelect, onFileCreate, onFileDelete, onFileRename, onFileImport }) {
    const [isCreating, setIsCreating] = useState(false);
    const [newFileName, setNewFileName] = useState("");
    const [renamingFile, setRenamingFile] = useState(null);
    const [renameValue, setRenameValue] = useState("");

    const handleCreateFile = () => {
        if (newFileName.trim()) {
            onFileCreate(newFileName.trim());
            setNewFileName("");
            setIsCreating(false);
        }
    };

    const handleRename = (fileId) => {
        if (renameValue.trim()) {
            onFileRename(fileId, renameValue.trim());
            setRenamingFile(null);
            setRenameValue("");
        }
    };

    const handleFileImport = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                onFileImport(file.name, event.target.result);
            };
            reader.onerror = () => {
                toast.error("Failed to read file");
            };
            reader.readAsText(file);
        }
        e.target.value = "";
    };

    const handleFileDownload = (file) => {
        const blob = new Blob([file.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(`${file.name} downloaded`);
    };

    return (
        <div className="file-explorer">
            {/* Header with action buttons */}
            <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold text-light">Files</span>
                <div className="d-flex gap-1">
                    <button
                        className="btn btn-sm btn-success p-1"
                        onClick={() => setIsCreating(true)}
                        title="Create new file"
                        style={{ fontSize: '0.9rem', lineHeight: 1 }}
                    >
                        ➕
                    </button>
                    <label className="btn btn-sm btn-primary p-1 mb-0" title="Import file from computer" style={{ fontSize: '0.9rem', lineHeight: 1, cursor: 'pointer' }}>
                        📤
                        <input
                            type="file"
                            style={{ display: "none" }}
                            onChange={handleFileImport}
                            accept=".js,.jsx,.ts,.tsx,.html,.css,.json,.txt,.md,.py,.java,.cpp,.c,.go,.rs"
                        />
                    </label>
                </div>
            </div>

            {/* New file input */}
            {isCreating && (
                <div className="mb-3 p-2 bg-dark rounded">
                    <input
                        type="text"
                        className="form-control form-control-sm mb-2"
                        placeholder="Enter filename (e.g., app.js)"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleCreateFile();
                            if (e.key === "Escape") {
                                setIsCreating(false);
                                setNewFileName("");
                            }
                        }}
                        autoFocus
                    />
                    <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-success flex-fill" onClick={handleCreateFile}>
                            ✓ Create
                        </button>
                        <button
                            className="btn btn-sm btn-secondary flex-fill"
                            onClick={() => {
                                setIsCreating(false);
                                setNewFileName("");
                            }}
                        >
                            ✕ Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* File list */}
            <div className="file-list">
                {files.length === 0 ? (
                    <div className="text-muted text-center py-3 small">
                        No files yet. Click "➕" or "📤" to add files.
                    </div>
                ) : (
                    files.map((file) => (
                        <div
                            key={file.id}
                            className={`file-item ${activeFile === file.id ? "active" : ""}`}
                        >
                            {renamingFile === file.id ? (
                                // Rename mode
                                <div className="d-flex gap-1">
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        value={renameValue}
                                        onChange={(e) => setRenameValue(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleRename(file.id);
                                            if (e.key === "Escape") setRenamingFile(null);
                                        }}
                                        autoFocus
                                    />
                                    <button
                                        className="btn btn-sm btn-success"
                                        onClick={() => handleRename(file.id)}
                                        title="Save"
                                    >
                                        ✓
                                    </button>
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => setRenamingFile(null)}
                                        title="Cancel"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                // Normal mode
                                <div className="d-flex justify-content-between align-items-center">
                                    <span
                                        className="file-name"
                                        onClick={() => onFileSelect(file.id)}
                                        title={`Click to open ${file.name}`}
                                    >
                                        <span className="file-icon">{getFileIcon(file.name)}</span>
                                        <span className="file-name-text">{file.name}</span>
                                    </span>
                                    <div className="file-actions">
                                        <button
                                            className="btn btn-sm btn-outline-info p-1"
                                            onClick={() => handleFileDownload(file)}
                                            title="Download file"
                                            style={{ fontSize: '0.85rem', lineHeight: 1 }}
                                        >
                                            💾
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-light p-1"
                                            onClick={() => {
                                                setRenamingFile(file.id);
                                                setRenameValue(file.name);
                                            }}
                                            title="Rename file"
                                            style={{ fontSize: '0.85rem', lineHeight: 1 }}
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger p-1"
                                            onClick={() => {
                                                if (window.confirm(`Delete ${file.name}?`)) {
                                                    onFileDelete(file.id);
                                                }
                                            }}
                                            title="Delete file"
                                            style={{ fontSize: '0.85rem', lineHeight: 1 }}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default FileExplorer;
