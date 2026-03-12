import { useCallback, useEffect, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Edge,
  Node,
  MarkerType,
  NodeTypes,
  Handle,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Modal, Form, Input, Select, Button, Space, message, Avatar, Typography } from 'antd'
import { DeleteOutlined, UserOutlined } from '@ant-design/icons'
import { ipcClient } from '../../lib/ipc-client'
import type { Character, CharacterRelationship } from '../../types'

const { Text } = Typography

interface CharacterGraphProps {
  projectId: number
  characters: Character[]
}

const nodeTypes: NodeTypes = {
  characterNode: ({ data, selected }) => {
    const { character } = data
    const isSelected = selected

    return (
      <>
        <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
        <div
          style={{
            padding: '10px 15px',
            borderRadius: '8px',
            background: isSelected
              ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
              : 'white',
            border: isSelected ? '3px solid #fff' : '2px solid #1890ff',
            minWidth: '120px',
            textAlign: 'center',
            boxShadow: isSelected
              ? '0 8px 16px rgba(240, 147, 251, 0.4)'
              : '0 2px 8px rgba(0,0,0,0.1)',
            transform: isSelected ? 'scale(1.05)' : 'scale(1)',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
        >
          <Avatar
            size={48}
            icon={<UserOutlined />}
            src={character.avatar}
            style={{
              backgroundColor: isSelected ? '#fff' : '#1890ff',
              marginBottom: 8,
            }}
          />
          <div style={{ fontWeight: 'bold', fontSize: 14, color: isSelected ? '#fff' : 'inherit' }}>
            {character.name}
          </div>
          <div style={{
            fontSize: 12,
            color: isSelected ? 'rgba(255,255,255,0.9)' : '#666',
            marginTop: 4
          }}>
            {character.gender === 'male' ? '男' : character.gender === 'female' ? '女' : '其他'}
            {character.age && ` · ${character.age}岁`}
          </div>
        </div>
        <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      </>
    )
  },
}

function CharacterGraph({ projectId, characters }: CharacterGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [relationships, setRelationships] = useState<CharacterRelationship[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null)
  const [selectedCharacters, setSelectedCharacters] = useState<{ char1?: Character; char2?: Character }>({})
  const [form] = Form.useForm()

  // Fetch relationships
  const fetchRelationships = async () => {
    try {
      const data = await ipcClient.getRelationshipsByProject(projectId)
      setRelationships(data as CharacterRelationship[])
    } catch (error) {
      console.error('Failed to fetch relationships:', error)
    }
  }

  useEffect(() => {
    if (projectId) {
      fetchRelationships()
    }
  }, [projectId])

  // Update nodes
  useEffect(() => {
    const loadPositionsAndCreateNodes = async () => {
      // Load saved positions
      const positions = await ipcClient.getPositionsByProject(projectId)
      const positionMap = new Map(
        (positions as any[]).map(p => [p.character_id, { x: p.x, y: p.y }])
      )

      const newNodes: Node[] = characters.map((character, index) => {
        const savedPos = positionMap.get(character.id)
        return {
          id: `character-${character.id}`,
          type: 'characterNode',
          position: savedPos || { x: (index % 4) * 250 + 100, y: Math.floor(index / 4) * 180 + 100 },
          data: { character },
        }
      })
      setNodes(newNodes)
    }

    loadPositionsAndCreateNodes()
  }, [characters, projectId, setNodes])

  // Handle node drag - save position
  const onNodeDragStop = useCallback(
    async (event: React.MouseEvent, node: Node) => {
      try {
        const characterId = parseInt(node.id.replace('character-', ''))
        await ipcClient.savePosition({
          character_id: characterId,
          project_id: projectId,
          x: node.position.x,
          y: node.position.y,
        })
        console.log('Position saved for character', characterId)
      } catch (error) {
        console.error('Failed to save position:', error)
      }
    },
    [projectId]
  )

  // Update edges - separate effect to ensure nodes exist first
  useEffect(() => {
    if (nodes.length === 0) return // Wait for nodes to be set

    const timer = setTimeout(() => {
      const newEdges: Edge[] = relationships.map((rel) => ({
        id: `relationship-${rel.id}`,
        source: `character-${rel.character1_id}`,
        target: `character-${rel.character2_id}`,
        label: rel.relationship_type,
        animated: true,
        style: { stroke: '#1890ff', strokeWidth: 2 },
        labelStyle: { fill: '#1890ff', fontWeight: 700 },
        labelBgStyle: { fill: 'white', fillOpacity: 0.9 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#1890ff',
        },
      }))
      setEdges(newEdges)
    }, 200) // Small delay to ensure nodes are rendered

    return () => clearTimeout(timer)
  }, [nodes, relationships, setEdges])

  // Handle node click
  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      const character = characters.find(c => c.id === parseInt(node.id.replace('character-', '')))
      if (!character) return

      if (!selectedCharacters.char1) {
        // First click - select this character
        setSelectedCharacters({ char1: character })
        message.info(`已选择角色：${character.name}，请点击另一个角色创建关系`)
      } else if (selectedCharacters.char1.id === character.id) {
        // Clicked the same character - deselect
        setSelectedCharacters({})
        message.info('已取消选择')
      } else {
        // Second click on different character - create relationship
        setSelectedCharacters({ ...selectedCharacters, char2: character })
        setIsModalVisible(true)
      }
    },
    [selectedCharacters, characters]
  )

  // Handle edge click
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation()
    setSelectedEdge(edge)
    const rel = relationships.find(r => r.id === parseInt(edge.id.replace('relationship-', '')))
    if (rel) {
      form.setFieldsValue({
        relationship_type: rel.relationship_type,
        description: rel.description,
      })
      setIsModalVisible(true)
    }
  }, [relationships, form])

  // Handle submit
  const handleSubmit = async (values: any) => {
    try {
      const relType = Array.isArray(values.relationship_type) ? values.relationship_type[0] : values.relationship_type

      if (selectedEdge) {
        const rel = relationships.find(r => r.id === parseInt(selectedEdge.id.replace('relationship-', '')))
        if (rel) {
          await ipcClient.updateRelationship(rel.id, {
            relationship_type: relType,
            description: values.description,
          })
          message.success('关系更新成功')
        }
      } else if (selectedCharacters.char1 && selectedCharacters.char2) {
        await ipcClient.createRelationship({
          project_id: projectId,
          character1_id: selectedCharacters.char1.id,
          character2_id: selectedCharacters.char2.id,
          relationship_type: relType,
          description: values.description,
        })
        message.success('关系创建成功')
      }

      setIsModalVisible(false)
      form.resetFields()
      setSelectedEdge(null)
      setSelectedCharacters({})
      fetchRelationships()
    } catch (error) {
      console.error('Failed to save:', error)
      message.error('操作失败')
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!selectedEdge) return
    const rel = relationships.find(r => r.id === parseInt(selectedEdge.id.replace('relationship-', '')))
    if (!rel) return

    try {
      await ipcClient.deleteRelationship(rel.id)
      message.success('关系删除成功')
      setIsModalVisible(false)
      form.resetFields()
      setSelectedEdge(null)
      fetchRelationships()
    } catch (error) {
      message.error('删除失败')
    }
  }

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      {/* Operation hint */}
      <div style={{
        marginBottom: 16,
        padding: '12px',
        background: '#f5f5f5',
        borderRadius: '4px',
        position: 'absolute',
        top: 10,
        left: 10,
        right: 60,
        zIndex: 10
      }}>
        <strong>操作提示：</strong>
        {selectedCharacters.char1 ? (
          <span style={{ color: '#f5576c' }}>
            已选择角色「{selectedCharacters.char1.name}」，请点击另一个角色创建关系，或再次点击当前角色取消选择
          </span>
        ) : (
          <span>点击一个角色，再点击另一个角色即可创建关系；拖拽角色可调整位置；点击连线可编辑或删除关系</span>
        )}
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <MiniMap />
      </ReactFlow>

      {/* Modal */}
      <Modal
        title={selectedEdge ? '编辑关系' : '创建关系'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false)
          form.resetFields()
          setSelectedEdge(null)
          setSelectedCharacters({})
        }}
        footer={[
          selectedEdge && (
            <Button key="delete" danger icon={<DeleteOutlined />} onClick={handleDelete}>
              删除
            </Button>
          ),
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            {selectedEdge ? '更新' : '创建'}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {!selectedEdge && selectedCharacters.char1 && selectedCharacters.char2 && (
            <Form.Item label="关系角色">
              <Space>
                <Text strong>{selectedCharacters.char1.name}</Text>
                <Text>↔</Text>
                <Text strong>{selectedCharacters.char2.name}</Text>
              </Space>
            </Form.Item>
          )}

          <Form.Item name="relationship_type" label="关系类型" rules={[{ required: true }]}>
            <Select
              placeholder="选择关系类型"
              mode="tags"
              maxTagCount={1}
              options={[
                { value: '朋友' },
                { value: '敌人' },
                { value: '恋人' },
                { value: '家人' },
                { value: '同事' },
                { value: '师生' },
              ]}
            />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="关系描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default CharacterGraph