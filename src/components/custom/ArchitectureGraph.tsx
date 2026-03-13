'use client';

import type { Architecture } from '@/types/feathers';
import { Background, BackgroundVariant, Controls, Edge, Handle, MiniMap, Node, NodeProps, Panel, Position, ReactFlow, useEdgesState, useNodesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Layers, Loader2, RefreshCw, Share2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

// ─── Node colors ─────────────────────────────────────────────────────────────
const PALETTE = [
    { bg: '#1e1b4b', border: '#6366f1', text: '#a5b4fc', badge: '#312e81' },
    { bg: '#1a1232', border: '#8b5cf6', text: '#c4b5fd', badge: '#2e1065' },
    { bg: '#1f1135', border: '#ec4899', text: '#f9a8d4', badge: '#500724' },
    { bg: '#082f49', border: '#0ea5e9', text: '#7dd3fc', badge: '#0c4a6e' },
    { bg: '#052e16', border: '#10b981', text: '#6ee7b7', badge: '#064e3b' },
    { bg: '#1c1006', border: '#f59e0b', text: '#fcd34d', badge: '#451a03' },
    { bg: '#1a0505', border: '#ef4444', text: '#fca5a5', badge: '#7f1d1d' },
    { bg: '#042f2e', border: '#14b8a6', text: '#5eead4', badge: '#134e4a' }
];

// ─── Custom service node ──────────────────────────────────────────────────────
interface ServiceNodeData {
    label: string;
    routes: string[];
    colorIndex: number;
    [key: string]: unknown;
}

interface ModelNodeData {
    label: string;
    fields: Array<{ name: string; type: string; required: boolean; indexed?: boolean; unique?: boolean }>;
    [key: string]: unknown;
}

interface RouteNodeData {
    label: string;
    method: string;
    path: string;
    [key: string]: unknown;
}

const getPalette = (index: number) => PALETTE[index % PALETTE.length] ?? PALETTE[0]!;

function ServiceNode({ data }: NodeProps<Node<ServiceNodeData>>) {
    const palette = getPalette(data.colorIndex);
    return (
        <>
            <Handle type="target" position={Position.Top} style={{ background: palette.border, border: 'none', width: 8, height: 8 }} />
            <div className="min-w-32.5 max-w-45 rounded-xl shadow-lg" style={{ background: palette.bg, border: `1.5px solid ${palette.border}` }}>
                <div className="px-3 pt-2.5 pb-1">
                    <p className="text-[12px] font-semibold truncate" style={{ color: palette.text }}>
                        {data.label}
                    </p>
                    <span className="inline-block text-[9px] font-mono mt-1 px-1.5 py-0.5 rounded" style={{ background: palette.badge, color: palette.text }}>
                        {data.routes.length} endpoint{data.routes.length !== 1 ? 's' : ''}
                    </span>
                </div>
                {data.routes.length > 0 && (
                    <div className="px-3 pb-2.5 mt-1 border-t border-white/5">
                        {data.routes.slice(0, 3).map((r, i) => (
                            <p key={i} className="text-[9px] font-mono truncate mt-1 opacity-60" style={{ color: palette.text }}>
                                {r}
                            </p>
                        ))}
                        {data.routes.length > 3 && (
                            <p className="text-[9px] opacity-40" style={{ color: palette.text }}>
                                +{data.routes.length - 3} more
                            </p>
                        )}
                    </div>
                )}
            </div>
            <Handle type="source" position={Position.Bottom} style={{ background: palette.border, border: 'none', width: 8, height: 8 }} />
        </>
    );
}

function ModelNode({ data }: NodeProps<Node<ModelNodeData>>) {
    return (
        <>
            <Handle type="source" position={Position.Right} style={{ background: '#22d3ee', border: 'none', width: 8, height: 8 }} />
            <div className="min-w-45 max-w-60 rounded-xl shadow-lg border border-cyan-400/40 bg-[#06222b]">
                <div className="px-3 py-2 border-b border-cyan-300/20">
                    <p className="text-[12px] font-semibold text-cyan-200 truncate">{data.label}</p>
                    <p className="text-[9px] text-cyan-300/70">{data.fields.length} fields</p>
                </div>
                <div className="px-3 py-2 space-y-1.5">
                    {data.fields.slice(0, 6).map((field) => (
                        <div key={field.name} className="flex items-center justify-between gap-2 text-[9px] text-cyan-100/80">
                            <span className="truncate">{field.name}</span>
                            <span className="text-cyan-300/70">{field.type}</span>
                        </div>
                    ))}
                    {data.fields.length > 6 && <p className="text-[9px] text-cyan-300/60">+{data.fields.length - 6} more</p>}
                </div>
            </div>
        </>
    );
}

function RouteNode({ data }: NodeProps<Node<RouteNodeData>>) {
    const methodColor =
        data.method === 'GET'
            ? 'text-emerald-300 bg-emerald-500/20'
            : data.method === 'POST'
              ? 'text-blue-300 bg-blue-500/20'
              : data.method === 'PUT' || data.method === 'PATCH'
                ? 'text-amber-300 bg-amber-500/20'
                : 'text-red-300 bg-red-500/20';

    return (
        <>
            <Handle type="target" position={Position.Left} style={{ background: '#a78bfa', border: 'none', width: 8, height: 8 }} />
            <div className="min-w-45 max-w-65 rounded-xl shadow-lg border border-violet-400/40 bg-[#1b1436] px-3 py-2">
                <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${methodColor}`}>{data.method}</span>
                    <span className="text-[11px] text-violet-100 truncate">{data.label}</span>
                </div>
                <p className="text-[9px] text-violet-200/70 mt-1 truncate">{data.path}</p>
            </div>
        </>
    );
}

const nodeTypes = { service: ServiceNode, model: ModelNode, route: RouteNode };

// ─── Layout helpers ───────────────────────────────────────────────────────────
function buildFlowData(architecture: Architecture, layers: { models: boolean; routes: boolean; dependencies: boolean }): { nodes: Node[]; edges: Edge[] } {
    const SERVICE_COL_X = 420;
    const MODEL_COL_X = 40;
    const ROUTE_COL_X = 820;
    const Y_GAP = 170;

    const serviceNodes: Node[] = architecture.services.map((svc, i) => ({
        id: `service:${svc.name}`,
        type: 'service',
        position: {
            x: SERVICE_COL_X,
            y: i * Y_GAP
        },
        data: {
            label: svc.name,
            routes: svc.routes,
            colorIndex: i
        }
    }));

    const modelNodes: Node[] = layers.models
        ? architecture.models.map((model, i) => ({
              id: `model:${model.name}`,
              type: 'model',
              position: {
                  x: MODEL_COL_X,
                  y: i * Y_GAP
              },
              data: {
                  label: model.name,
                  fields: model.fields
              }
          }))
        : [];

    const routeNodes: Node[] = layers.routes
        ? architecture.routes.map((route, i) => ({
              id: `route:${route.method}:${route.path}`,
              type: 'route',
              position: {
                  x: ROUTE_COL_X,
                  y: i * 110
              },
              data: {
                  label: route.service,
                  method: route.method,
                  path: route.path
              }
          }))
        : [];

    const nodes: Node[] = [...modelNodes, ...serviceNodes, ...routeNodes];
    const edges: Edge[] = [];
    const seen = new Set<string>();

    if (layers.models) {
        for (const rel of architecture.relations) {
            const key = `model:${rel.from}--service:${rel.to}`;
            if (seen.has(key)) continue;
            seen.add(key);

            edges.push({
                id: key,
                source: `model:${rel.from}`,
                target: `service:${rel.to}`,
                label: rel.type,
                animated: true,
                style: { stroke: '#22d3ee', strokeWidth: 1.4 },
                labelStyle: { fontSize: 9, fill: '#67e8f9', fontFamily: 'monospace' },
                type: 'smoothstep'
            });
        }
    }

    if (layers.routes) {
        for (const route of architecture.routes) {
            const routeNodeId = `route:${route.method}:${route.path}`;
            const serviceNodeId = `service:${route.service}`;
            const key = `${serviceNodeId}--${routeNodeId}`;
            if (seen.has(key)) continue;
            seen.add(key);
            edges.push({
                id: key,
                source: serviceNodeId,
                target: routeNodeId,
                animated: true,
                style: { stroke: '#a78bfa', strokeWidth: 1.3 },
                label: route.method,
                labelStyle: { fontSize: 8, fill: '#c4b5fd', fontFamily: 'monospace' },
                type: 'smoothstep'
            });
        }
    }

    if (layers.dependencies) {
        const declaredDependencies = architecture.serviceDependencies ?? [];
        const fallbackDependencies = architecture.services.flatMap((service) => (service.dependencies ?? []).map((to) => ({ from: service.name, to })));
        const dependencies = declaredDependencies.length > 0 ? declaredDependencies : fallbackDependencies;

        for (const dep of dependencies) {
            const key = `service:${dep.from}--service:${dep.to}`;
            if (seen.has(key)) continue;
            seen.add(key);
            edges.push({
                id: key,
                source: `service:${dep.from}`,
                target: `service:${dep.to}`,
                label: 'depends-on',
                animated: true,
                style: { stroke: '#f59e0b', strokeWidth: 1.4, strokeDasharray: '5 4' },
                labelStyle: { fontSize: 8, fill: '#fcd34d', fontFamily: 'monospace' },
                type: 'smoothstep'
            });
        }
    }

    return { nodes, edges };
}

// ─── Main component ───────────────────────────────────────────────────────────
interface Props {
    architecture: Architecture | null;
    loading?: boolean;
    error?: string | null;
    onRefresh?: () => void;
}

export function ArchitectureGraph({ architecture, loading, error, onRefresh }: Props) {
    const [layers, setLayers] = useState({ models: true, routes: true, dependencies: true });
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

    const architectureStats = useMemo(() => {
        if (!architecture) {
            return { services: 0, models: 0, routes: 0, relations: 0 };
        }
        return {
            services: architecture.services.length,
            models: architecture.models.length,
            routes: architecture.routes.length,
            relations: architecture.relations.length
        };
    }, [architecture]);

    useEffect(() => {
        if (!architecture || architecture.services.length === 0) {
            setNodes([]);
            setEdges([]);
            return;
        }
        const { nodes: n, edges: e } = buildFlowData(architecture, layers);
        setNodes(n);
        setEdges(e);
    }, [architecture, layers, setNodes, setEdges]);

    const onInit = useCallback((instance: { fitView: (opts: object) => void }) => {
        setTimeout(() => instance.fitView({ padding: 0.15, duration: 400 }), 50);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full bg-[#09090f]">
                <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-4 bg-[#09090f]">
                <p className="text-xs text-red-400 text-center">{error}</p>
                {onRefresh && (
                    <button onClick={onRefresh} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
                        <RefreshCw className="w-3 h-3" />
                        Retry
                    </button>
                )}
            </div>
        );
    }

    if (!architecture || architecture.services.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-2 px-4 bg-[#09090f]">
                <Share2 className="w-8 h-8 text-gray-700" />
                <p className="text-sm text-gray-500">No architecture data yet</p>
                <p className="text-xs text-gray-600 text-center">Appears after project generation</p>
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-[#09090f]">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                onInit={onInit}
                fitView
                fitViewOptions={{ padding: 0.15 }}
                minZoom={0.3}
                maxZoom={2}
                colorMode="dark"
            >
                <Background color="#1e293b" gap={20} variant={BackgroundVariant.Dots} size={1} />
                <Controls className="bg-[#0f172a]! border-white/10! rounded-xl! overflow-hidden" />
                <MiniMap
                    nodeColor={(n) => {
                        const idx = nodes.findIndex((x) => x.id === n.id);
                        return getPalette(idx < 0 ? 0 : idx).border;
                    }}
                    className="bg-[#0f172a]! border-white/10! rounded-xl! overflow-hidden"
                    maskColor="rgba(0,0,0,0.6)"
                />
                <Panel position="top-left" className="m-2!">
                    <div className="flex flex-col gap-2 px-2.5 py-2 bg-[#0f172a] border border-white/10 rounded-lg">
                        <div className="flex items-center gap-1.5">
                            <Layers className="w-3 h-3 text-violet-400" />
                            <span className="text-[11px] text-white/60 font-medium">
                                {architectureStats.models} models · {architectureStats.services} services · {architectureStats.routes} routes
                            </span>
                            {onRefresh && (
                                <button onClick={onRefresh} className="ml-1 text-white/30 hover:text-white/70 transition-colors">
                                    <RefreshCw className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px]">
                            <button
                                onClick={() => setLayers((prev) => ({ ...prev, models: !prev.models }))}
                                className={`px-2 py-0.5 rounded border ${layers.models ? 'text-cyan-200 border-cyan-500/50 bg-cyan-500/10' : 'text-white/50 border-white/20'}`}
                            >
                                Models
                            </button>
                            <button
                                onClick={() => setLayers((prev) => ({ ...prev, routes: !prev.routes }))}
                                className={`px-2 py-0.5 rounded border ${layers.routes ? 'text-violet-200 border-violet-500/50 bg-violet-500/10' : 'text-white/50 border-white/20'}`}
                            >
                                Routes
                            </button>
                            <button
                                onClick={() => setLayers((prev) => ({ ...prev, dependencies: !prev.dependencies }))}
                                className={`px-2 py-0.5 rounded border ${layers.dependencies ? 'text-amber-200 border-amber-500/50 bg-amber-500/10' : 'text-white/50 border-white/20'}`}
                            >
                                Dependencies
                            </button>
                        </div>
                    </div>
                </Panel>
            </ReactFlow>
        </div>
    );
}
