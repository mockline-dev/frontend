'use client'

import { FileTree } from '@/components/custom/FileTree';
import { MonacoEditor } from '@/components/custom/MonacoEditor';
import { UserMenu } from '@/components/custom/UserMenu';
import { Button } from '@/components/ui/button';
import { AiAgent } from '@/containers/aiAgent/AIAgent';
import { Terminal } from '@/containers/workspace/components/Terminal';
import { TestPanel } from '@/containers/workspace/components/TestPanel';
import { useAIProject } from '@/hooks/useAIProject';
import { useProjectFiles } from '@/hooks/useProjectFiles';
import { useAuth } from '@/providers/AuthProvider';
import type { File } from '@/services/api/files';
import type { Project } from '@/services/api/projects';
import { clearSavedPrompt, getSavedPrompt } from '@/utils/promptStorage';
import {
  Code2,
  FolderTree,
  Play,
  Sparkles,
  Terminal as TerminalIcon,
  TestTube2
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface WorkspaceProps {
  initialProjectId: string | undefined
  initialProject?: Project | null
  initialFiles?: File[]
}

export function Workspace({
  initialProjectId,
  initialProject = null,
  initialFiles = []
}: WorkspaceProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [projectName, setProjectName] = useState('New Project');
  const [currentProjectId, setCurrentProjectId] = useState<string | undefined>(
    initialProjectId || initialProject?._id
  );
  const { project, createProject, loading: projectLoading } = useAIProject(
    currentProjectId,
    initialProject
  );
  const { fileTree, files, selectedFileContent, loadingContent, loadFileContent } = useProjectFiles(
    currentProjectId,
    initialFiles
  );
  const [selectedFile, setSelectedFile] = useState<string>('src/server.js');
  const [sidebarView, setSidebarView] = useState<'files' | 'ai'>('files');
  const [activeView, setActiveView] = useState<'code' | 'api'>('code');
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  
  const isCreatingProjectRef = useRef(false);
  const hasInitializedRef = useRef(false);

  const handleCreateProject = useCallback(async (prompt: string) => {
    if (projectLoading || isCreatingProjectRef.current) return

    try {
      isCreatingProjectRef.current = true

      const newProject = await createProject({
        name: prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt,
        description: prompt,
        framework: 'fast-api',
        language: 'python',
        model: 'llama3.2:3b'
      })
      if (newProject) {
        setCurrentProjectId(newProject._id)
        setProjectName(newProject.name)
        
        sessionStorage.setItem('currentProjectId', newProject._id)
        sessionStorage.setItem('projectInitialized', 'true')
      }
    } finally {
      isCreatingProjectRef.current = false
    }
  }, [createProject, projectLoading])

  useEffect(() => {
    if (hasInitializedRef.current) return

    const promptFromUrl = searchParams.get('prompt')
    const existingProjectId = searchParams.get('projectId')
    const savedPromptFromStorage = getSavedPrompt()
    const prompt = promptFromUrl || savedPromptFromStorage

    const projectInitialized = sessionStorage.getItem('projectInitialized')
    const storedProjectId = sessionStorage.getItem('currentProjectId')

    
    if (existingProjectId && existingProjectId !== currentProjectId) {
      setCurrentProjectId(existingProjectId)
      hasInitializedRef.current = true
      sessionStorage.setItem('currentProjectId', existingProjectId)
      sessionStorage.setItem('projectInitialized', 'true')
    }
    
    else if (storedProjectId && !currentProjectId) {
      setCurrentProjectId(storedProjectId)
      hasInitializedRef.current = true
      
      if (promptFromUrl) {
        router.replace('/workspace')
      }
    }
    else if (prompt && !currentProjectId && !projectLoading && !isCreatingProjectRef.current && !existingProjectId && !projectInitialized) {
      handleCreateProject(prompt)
      clearSavedPrompt()
      hasInitializedRef.current = true
    } else if (currentProjectId) {
      hasInitializedRef.current = true
      sessionStorage.setItem('projectInitialized', 'true')
    }
  }, [searchParams, currentProjectId, projectLoading, handleCreateProject, router])

  
  useEffect(() => {
    if (project) {
      setProjectName(project.name)
    }
  }, [project])

  
  useEffect(() => {
    return () => {
      
      const currentPath = window.location.pathname
      if (!currentPath.includes('/workspace')) {
        sessionStorage.removeItem('currentProjectId')
        sessionStorage.removeItem('projectInitialized')
      }
    }
  }, [])

  const handleNavigate = (page: 'dashboard' | 'workspace') => {
    router.push(page === 'dashboard' ? '/dashboard' : '/workspace')
  }
  
  const handleFileSelect = useCallback(async (filePath: string) => {
    setSelectedFile(filePath);
    const file = files.find(f => f.name === filePath);  
    if (file) {
      await loadFileContent(file);
    }
  }, [files, loadFileContent]);

  const handleRunBackend = useCallback(async () => {
    if (!currentProjectId) {
      toast.error('No project selected');
      return;
    }

    setIsRunning(true);
    setIsTerminalOpen(true);

    try {
      const response = await fetch('/api/projects/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId: currentProjectId }),
      });

      if (!response.ok) {
        throw new Error('Failed to start backend');
      }

      const result = await response.json();

      if (result.success) {
        
        toast.success('Backend setup instructions generated!', {
          description: result.project?.name ? `Project: ${result.project.name}` : undefined,
          duration: 5000,
        });

        
        console.log('=== Backend Setup Instructions ===');
        console.log(result.instructions.join('\n'));
        console.log('');
        console.log('Access Points:');
        console.log(`API: ${result.endpoints?.api}`);
        console.log(`Docs: ${result.endpoints?.docs}`);
      } else {
        toast.error('Failed to generate backend instructions');
      }
    } catch (error) {
      console.error('Failed to run backend:', error);
      toast.error('Failed to start backend');
    } finally {
      setIsRunning(false);
    }
  }, [currentProjectId]);
  
  if (projectLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Creating project...</p>
        </div>
      </div>
    )
  }


  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Top Bar */}
      <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-purple-600 rounded-md flex items-center justify-center">
              <Code2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-medium text-gray-900 text-sm">Mockline</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600 text-sm">{projectName.slice(0, 40)}</span>
          </div>
        </div>
        
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setActiveView('code')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeView === 'code'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Code
          </button>
          <button
            onClick={() => setActiveView('api')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeView === 'api'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <TestTube2 className="w-3.5 h-3.5" />
            API Testing
          </button>
        </div>

        <UserMenu 
          currentPage="workspace" 
          onNavigate={handleNavigate}
          onLogout={logout}
        />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Files or AI */}
        <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
          <div className="border-b border-gray-200 flex">
            <button
              onClick={() => setSidebarView('files')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                sidebarView === 'files'
                  ? 'bg-white text-gray-900 border-b-2 border-black'
                  : 'text-gray-600 hover:text-gray-900 bg-gray-50'
              }`}
            >
              <FolderTree className="w-4 h-4" />
              Files
            </button>
            <button
              onClick={() => setSidebarView('ai')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                sidebarView === 'ai'
                  ? 'bg-white text-gray-900 border-b-2 border-black'
                  : 'text-gray-600 hover:text-gray-900 bg-gray-50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              AI Assistant
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            {sidebarView === 'files' ? (
              <div className="h-full overflow-y-auto px-3 py-3">
                {fileTree.length > 0 ? (
                  <FileTree 
                    data={fileTree} 
                    onFileClick={handleFileSelect}
                    selectedFile={selectedFile}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">No files generated yet</p>
                    <p className="text-xs text-gray-400 mt-1">Use the AI Assistant to generate code</p>
                  </div>
                )}
              </div>
            ) : (
              <AiAgent projectId={currentProjectId as string} />
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
          {activeView === 'code' ? (
            <>
              {/* File Tab */}
              <div className="border-b border-gray-200 px-4 py-2.5 bg-white flex items-center justify-between">
                <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                  <Code2 className="w-4 h-4" />
                  <span>{selectedFile}</span>
                </div>
                <Button
                  onClick={handleRunBackend}
                  disabled={isRunning || !selectedFileContent}
                  size="sm"
                  className="h-7 text-xs bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-3 h-3 mr-1" />
                  {isRunning ? 'Running...' : 'Run Backend'}
                </Button>
              </div>
              {/* Code Editor */}
              <div className="flex-1 overflow-hidden bg-white">
                {loadingContent ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Loading file content...</p>
                    </div>
                  </div>
                ) : selectedFileContent ? (
                  <MonacoEditor
                    value={selectedFileContent}
                    fileName={selectedFile}
                    onChange={() => {}}
                    readOnly={true}
                    height="100%"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Code2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-sm text-gray-500">Select a file to view its content</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <TestPanel projectId={currentProjectId as string} />
          )}
        </div>
      </div>

      {/* Terminal Toggle Button - Bottom Right */}
      <Button
        onClick={() => setIsTerminalOpen(!isTerminalOpen)}
        className={`fixed bottom-4 right-4 h-10 bg-black hover:bg-gray-800 text-white shadow-lg z-40 ${
          isTerminalOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <TerminalIcon className="w-4 h-4 mr-2" />
        Terminal
      </Button>

      {/* Terminal Panel */}
      <Terminal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        projectId={currentProjectId as string}
      />
    </div>
  );
}
