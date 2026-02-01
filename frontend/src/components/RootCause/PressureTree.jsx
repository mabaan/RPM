import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    addEdge,
    MarkerType
} from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';
import PressureNode from './PressureNode';

const nodeTypes = {
    pressureNodes: PressureNode,
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({
        rankdir: direction,
        nodesep: 80, // Increase horizontal spacing
        ranksep: 100 // Increase vertical spacing
    });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: 320, height: 180 });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = isHorizontal ? 'left' : 'top';
        node.sourcePosition = isHorizontal ? 'right' : 'bottom';

        node.position = {
            x: nodeWithPosition.x - 320 / 2,
            y: nodeWithPosition.y - 180 / 2,
        };

        return node;
    });

    return { nodes, edges };
};

// Data Transformation
const transformData = (root) => {
    const nodes = [];
    const edges = [];

    const traverse = (node, parentId = null) => {
        nodes.push({
            id: node.id,
            type: 'pressureNodes',
            data: {
                label: node.name || node.title,
                pressure: node.pressure,
                type: node.type,
                srcData: node
            },
            position: { x: 0, y: 0 } // Layout will handle this
        });

        if (parentId) {
            edges.push({
                id: `e-${parentId}-${node.id}`,
                source: parentId,
                target: node.id,
                type: 'smoothstep',
                animated: true,
                style: { stroke: node.pressure > 70 ? '#EF4444' : '#64748b', strokeWidth: 3 },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: node.pressure > 70 ? '#EF4444' : '#64748b',
                    width: 20,
                    height: 20,
                },
            });
        }

        if (node.children) {
            node.children.forEach(child => traverse(child, node.id));
        }

        // Cross links
        if (node.crossLinks) {
            node.crossLinks.forEach(targetId => {
                edges.push({
                    id: `cross-${node.id}-${targetId}`,
                    source: node.id,
                    target: targetId,
                    type: 'default',
                    animated: true,
                    style: { stroke: '#FFC400', strokeWidth: 2.5, strokeDasharray: '5,5' },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#FFC400',
                        width: 18,
                        height: 18,
                    },
                });
            });
        }
    };

    traverse(root);
    return { nodes, edges };
};


const PressureTree = ({ data, onNodeClick }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        if (data && data.departments) {
            const { nodes: initialNodes, edges: initialEdges } = transformData(data.departments[0]);
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);

            setNodes([...layoutedNodes]);
            setEdges([...layoutedEdges]);
        }
    }, [data, setNodes, setEdges]);

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const onInit = useCallback((reactFlowInstance) => {
        // Fit view first, then shift upward
        reactFlowInstance.fitView({ maxZoom: 0.525, padding: 0.1 });
        setTimeout(() => {
            const viewport = reactFlowInstance.getViewport();
            reactFlowInstance.setViewport({
                x: viewport.x,
                y: viewport.y - 30, // Shift content up (negative moves up)
                zoom: viewport.zoom
            });
        }, 50);
    }, []);

    return (
        <div className="w-full h-full min-h-[600px] rounded-3xl overflow-hidden">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                onNodeClick={(event, node) => onNodeClick(node.data.srcData)}
                onInit={onInit}
                proOptions={{ hideAttribution: true }}
                className="bg-transparent"
                minZoom={0.1}
            >
                <Background gap={20} size={1} color="rgba(0,0,0,0.1)" />
            </ReactFlow>
        </div>
    );
};

export default PressureTree;
