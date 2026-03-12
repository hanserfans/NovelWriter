import { useCallback, useEffect, useState } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  NodeTypes,
  Position,
  Handle,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Modal, Form, Input, Select, message, Empty } from 'antd'
import { EnvironmentOutlined } from '@ant-design/icons'
import { useSceneGraph } from '../../hooks/useSceneGraph'

const { TextArea } = Input

// Scene relationship types
const RELATIONSHIP_TYPES = [
  { value: 'adjacent', label: '相邻' },
  { value: 'contains', label: '包含' },
  { value: 'connected', label: '连通' },
  { value: 'path', label: '路径' },
  { value: 'other', label: '其他' },
]

// Custom Scene Node Component
const SceneNode = ({ data, selected }: any) => {
  const { scene } = data
  const isSelected = selected

  return (
    <>
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <div
        style={{
          padding: '12px 16px',
          borderRadius: '8px',
          background: isSelected
            ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          minWidth: '120px',
          boxShadow: isSelected
            ? '0 8px 16px rgba(240, 147, 251, 0.4)'
            : '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: isSelected ? '3px solid #fff' : 'none',
          transform: isSelected ? 'scale(1.05)' : 'scale(1)',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <EnvironmentOutlined style={{ fontSize: 20 }} />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: 14 }}>{scene.name}</div>
            {scene.location && (
              <div style={{ fontSize: 12, opacity: 0.9 }}>{scene.location}</div>
            )}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </>
  )
}

const nodeTypes: NodeTypes = {
  sceneNode: SceneNode,
}

interface SceneGraphProps {
  projectId: number
}

export default function SceneGraph({ projectId }: SceneGraphProps) {
  const { scenes, relationships, positions, loading, createRelationship, deleteRelationship, savePosition, getScenePosition } =
    useSceneGraph(projectId)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [selectedScenes, setSelectedScenes] = useState<{ scene1: any | null; scene2: any | null }>({
    scene1: null,
    scene2: null,
  })
  const [firstSelectedNode, setFirstSelectedNode] = useState<Node | null>(null)

  // Initialize nodes from scenes and positions
  useEffect(() => {
    const newNodes: Node[] = scenes.map((scene, index) => {
      const position = getScenePosition(scene.id)
      return {
        id: `scene-${scene.id}`,
        type: 'sceneNode',
        position: position
          ? { x: position.x, y: position.y }
          : { x: (index % 5) * 200 + 100, y: Math.floor(index / 5) * 150 + 100 },
        data: { scene },
      }
    })
    setNodes(newNodes)
  }, [scenes, positions, setNodes])

  // Initialize edges from relationships
  useEffect(() => {
    const newEdges: Edge[] = relationships.map((rel) => ({
      id: `edge-${rel.id}`,
      source: `scene-${rel.scene1_id}`,
      target: `scene-${rel.scene2_id}`,
      label: getRelationshipLabel(rel.relationship_type),
      style: { stroke: '#667eea', strokeWidth: 2 },
      labelStyle: { fill: '#667eea', fontWeight: 700 },
      labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9 },
      animated: rel.relationship_type === 'path',
    }))
    setEdges(newEdges)
  }, [relationships, setEdges])

  const getRelationshipLabel = (type: string) => {
    const found = RELATIONSHIP_TYPES.find((t) => t.value === type)
    return found ? found.label : type
  }

  // Handle node drag - save position
  const onNodeDragStop = useCallback(
    async (_: any, node: Node) => {
      const sceneId = parseInt(node.id.replace('scene-', ''))
      await savePosition(sceneId, node.position.x, node.position.y)
    },
    [savePosition]
  )

  // Handle node click - select for relationship creation
  const onNodeClick = useCallback(
    (_: any, node: Node) => {
      const sceneId = parseInt(node.id.replace('scene-', ''))
      const scene = scenes.find((s) => s.id === sceneId)

      if (!firstSelectedNode) {
        // First click - select this node
        setFirstSelectedNode(node)
        message.info(`已选择场景：${scene?.name}，请点击另一个场景创建关系`)
      } else if (firstSelectedNode.id === node.id) {
        // Clicked the same node - deselect
        setFirstSelectedNode(null)
        message.info('已取消选择')
      } else {
        // Second click on different node - create relationship
        const scene1Id = parseInt(firstSelectedNode.id.replace('scene-', ''))
        const scene2Id = sceneId
        const scene1 = scenes.find((s) => s.id === scene1Id)
        const scene2 = scene

        setSelectedScenes({ scene1, scene2 })
        setIsModalVisible(true)
        setFirstSelectedNode(null)
      }
    },
    [scenes, firstSelectedNode]
  )

  // Handle form submission
  const handleCreateRelationship = async (values: any) => {
    if (!selectedScenes.scene1 || !selectedScenes.scene2) return

    try {
      await createRelationship({
        scene1_id: selectedScenes.scene1.id,
        scene2_id: selectedScenes.scene2.id,
        relationship_type: values.relationship_type,
        description: values.description,
      })
      message.success('场景关系创建成功')
      setIsModalVisible(false)
      form.resetFields()
      setSelectedScenes({ scene1: null, scene2: null })
    } catch (error) {
      message.error('场景关系创建失败')
    }
  }

  // Handle modal cancel
  const handleModalCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
    setSelectedScenes({ scene1: null, scene2: null })
  }

  // Handle edge click (delete relationship)
  const onEdgeClick = useCallback(
    (_: any, edge: Edge) => {
      Modal.confirm({
        title: '删除场景关系',
        content: '确定要删除这个场景关系吗？',
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk: async () => {
          const relId = parseInt(edge.id.replace('edge-', ''))
          await deleteRelationship(relId)
          message.success('场景关系已删除')
        },
      })
    },
    [deleteRelationship]
  )

  if (scenes.length === 0) {
    return (
      <Empty
        description="暂无场景，请先创建场景"
        style={{ marginTop: 100 }}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    )
  }

  return (
    <div style={{ width: '100%', height: '600px', position: 'relative' }}>
      <div style={{ marginBottom: 16, padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
        <strong>操作提示：</strong>
        {firstSelectedNode ? (
          <span style={{ color: '#f5576c' }}>
            已选择场景，请点击另一个场景创建关系，或再次点击当前场景取消选择
          </span>
        ) : (
          <span>点击一个场景，再点击另一个场景即可创建关系；拖拽场景可调整位置；点击连线可删除关系</span>
        )}
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <MiniMap />
      </ReactFlow>

      {/* Create Relationship Modal */}
      <Modal
        title="创建场景关系"
        open={isModalVisible}
        onCancel={handleModalCancel}
        onOk={() => form.submit()}
        okText="创建"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" onFinish={handleCreateRelationship}>
          <Form.Item label="场景 1">
            <Input value={selectedScenes.scene1?.name} disabled />
          </Form.Item>

          <Form.Item label="场景 2">
            <Input value={selectedScenes.scene2?.name} disabled />
          </Form.Item>

          <Form.Item
            name="relationship_type"
            label="关系类型"
            rules={[{ required: true, message: '请选择关系类型' }]}
          >
            <Select placeholder="选择关系类型">
              {RELATIONSHIP_TYPES.map((type) => (
                <Select.Option key={type.value} value={type.value}>
                  {type.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="描述两个场景之间的关系" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}