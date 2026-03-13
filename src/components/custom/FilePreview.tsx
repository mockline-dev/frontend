'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronRight, Code2, Download, File, FileCode, FileText, Folder, X } from 'lucide-react';
import { useState } from 'react';

export interface GeneratedFile {
    path: string;
    content: string;
    language: string;
    size: number;
    status: 'generating' | 'complete' | 'error';
    timestamp: number;
}

export interface FilePreviewProps {
    files: GeneratedFile[];
    currentFile?: string;
    onFileSelect?: (path: string) => void;
    onClose?: () => void;
}

export function FilePreview({ files, currentFile, onFileSelect, onClose }: FilePreviewProps) {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

    const toggleFolder = (path: string) => {
        setExpandedFolders((prev) => {
            const next = new Set(prev);
            if (next.has(path)) {
                next.delete(path);
            } else {
                next.add(path);
            }
            return next;
        });
    };

    const getFileIcon = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        if (ext === 'ts' || ext === 'tsx' || ext === 'js' || ext === 'jsx') return <FileCode className="w-4 h-4 text-blue-400" />;
        if (ext === 'py') return <FileCode className="w-4 h-4 text-yellow-400" />;
        if (ext === 'json' || ext === 'yaml' || ext === 'yml') return <FileText className="w-4 h-4 text-green-400" />;
        if (ext === 'md') return <FileText className="w-4 h-4 text-gray-400" />;
        return <File className="w-4 h-4 text-gray-400" />;
    };

    const buildFileTree = (files: GeneratedFile[]) => {
        const tree: Record<string, any> = {};

        files.forEach((file) => {
            const parts = file.path.split('/');
            let current = tree;

            parts.forEach((part, index) => {
                if (index === parts.length - 1) {
                    current[part] = { ...file, isFile: true };
                } else {
                    if (!current[part]) {
                        current[part] = { isFolder: true, children: {} };
                    }
                    current = current[part].children;
                }
            });
        });

        return tree;
    };

    const renderTreeNode = (node: any, path: string = '', depth: number = 0): JSX.Element[] => {
        const entries = Object.entries(node).sort(([a, valA], [b, valB]) => {
            // Folders first, then files
            if (valA.isFolder && !valB.isFolder) return -1;
            if (!valA.isFolder && valB.isFolder) return 1;
            return a.localeCompare(b);
        });

        return entries.flatMap(([name, value]) => {
            const fullPath = path ? `${path}/${name}` : name;

            if (value.isFolder) {
                const isExpanded = expandedFolders.has(fullPath);
                return [
                    <motion.div
                        key={fullPath}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: depth * 0.05 }}
                    >
                        <button
                            onClick={() => toggleFolder(fullPath)}
                            className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-black/5 transition-colors text-left"
                            style={{ paddingLeft: `${depth * 16 + 12}px` }}
                        >
                            {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5 text-black/40" />
                            ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-black/40" />
                            )}
                            <Folder className="w-4 h-4 text-violet-500" />
                            <span className="text-sm text-black/70">{name}</span>
                        </button>
                    </motion.div>,
                    ...(isExpanded ? renderTreeNode(value.children, fullPath, depth + 1) : [])
                ];
            } else {
                return [
                    <motion.button
                        key={fullPath}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: depth * 0.05 }}
                        onClick={() => onFileSelect?.(fullPath)}
                        className={cn(
                            'flex items-center gap-2 w-full px-3 py-1.5 hover:bg-black/5 transition-colors text-left group',
                            currentFile === fullPath ? 'bg-violet-50' : ''
                        )}
                        style={{ paddingLeft: `${depth * 16 + 28}px` }}
                    >
                        {getFileIcon(name)}
                        <span className="text-sm text-black/70 flex-1 truncate">{name}</span>
                        <span className="text-[10px] text-black/30 font-mono">{formatFileSize(value.size)}</span>
                        {value.status === 'generating' && (
                            <span className="text-[10px] text-violet-500 font-medium">Generating...</span>
                        )}
                    </motion.button>
                ];
            }
        });
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const selectedFile = files.find((f) => f.path === currentFile);
    const fileTree = buildFileTree(files);

    return (
        <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-[600px] bg-white shadow-2xl border-l border-black/10 z-50 flex flex-col"
        >
            {/* Header */}
            <div className="p-4 border-b border-black/10 flex items-center justify-between bg-black/[0.02]">
                <div className="flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-violet-600" />
                    <h2 className="font-semibold text-black">Generated Files</h2>
                    <span className="text-xs text-black/40 bg-black/5 px-2 py-0.5 rounded-full">
                        {files.length} file{files.length !== 1 ? 's' : ''}
                    </span>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-black/5 rounded-lg transition-colors"
                    aria-label="Close file preview"
                >
                    <X className="w-5 h-5 text-black/60" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* File tree */}
                <div className="w-64 border-r border-black/10 overflow-y-auto">
                    <div className="py-2">{renderTreeNode(fileTree)}</div>
                </div>

                {/* File preview */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {selectedFile ? (
                        <>
                            {/* File header */}
                            <div className="p-3 border-b border-black/10 bg-black/[0.02] flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    {getFileIcon(selectedFile.path.split('/').pop() || '')}
                                    <span className="text-sm font-medium text-black truncate">{selectedFile.path}</span>
                                    <span className="text-[10px] text-black/40 font-mono">{formatFileSize(selectedFile.size)}</span>
                                </div>
                                <button
                                    className="p-1.5 hover:bg-black/5 rounded transition-colors"
                                    title="Download file"
                                >
                                    <Download className="w-4 h-4 text-black/40" />
                                </button>
                            </div>

                            {/* File content */}
                            <div className="flex-1 overflow-auto p-4 bg-[#0d1117]">
                                <pre className="text-sm text-gray-300 font-mono leading-relaxed whitespace-pre-wrap">
                                    <code>{selectedFile.content}</code>
                                </pre>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-black/40">
                            <div className="text-center">
                                <File className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p className="text-sm">Select a file to preview</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

function cn(...classes: (string | boolean | undefined | null)[]) {
    return classes.filter(Boolean).join(' ');
}
