import { useState } from 'react'
import {
  Row,
  Col,
  Button,
  Space,
  Typography,
  Modal,
  Form,
  Input,
  Empty,
  message,
  List,
  Divider,
  Card,
  Tabs,
} from 'antd'
import { PlusOutlined, EnvironmentOutlined, DeleteOutlined, ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { useScenes } from '../../hooks/useScenes'
import SceneGraph from './SceneGraph'
import type { Scene } from '../../types/scene'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

function SceneList() {
  const { id: projectId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { scenes, loading, createScene, updateScene, deleteScene } = useScenes(
    projectId ? parseInt(projectId) : null
  )
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [activeTab, setActiveTab] = useState('details')

  const handleCreateScene = async (values: any) => {
    if (!projectId) return

    try {
      const scene = await createScene({
        ...values,
        project_id: parseInt(projectId),
      })
      message.success('场景创建成功')
      setIsModalVisible(false)
      form.resetFields()
      setSelectedScene(scene as Scene)
    } catch (error) {
      message.error('场景创建失败')
    }
  }

  const handleSaveScene = async () => {
    if (!selectedScene) return

    try {
      const values = await form.validateFields()
      await updateScene(selectedScene.id, values)
      message.success('场景保存成功')
    } catch (error) {
      message.error('场景保存失败')
    }
  }

  const handleDeleteScene = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个场景吗？此操作不可恢复。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteScene(id)
          message.success('场景删除成功')
          if (selectedScene?.id === id) {
            setSelectedScene(null)
          }
        } catch (error) {
          message.error('场景删除失败')
        }
      },
    })
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/projects/${projectId}`)}>
          返回项目
        </Button>
      </div>

      <Row gutter={16} style={{ height: 'calc(100vh - 140px)' }}>
        {/* Left Panel - Scene List */}
        <Col span={6}>
          <Card
            title="场景列表"
            extra={
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => setIsModalVisible(true)}
              >
                新建
              </Button>
            }
            style={{ height: '100%', overflow: 'hidden' }}
            bodyStyle={{ padding: 0, height: 'calc(100% - 57px)', overflow: 'auto' }}
          >
            <List
              dataSource={scenes}
              renderItem={(scene) => (
                <List.Item
                  onClick={() => {
                    setSelectedScene(scene)
                    form.setFieldsValue(scene)
                    setActiveTab('details')
                  }}
                  style={{
                    cursor: 'pointer',
                    backgroundColor:
                      selectedScene?.id === scene.id ? '#e6f7ff' : 'transparent',
                    padding: '12px 16px',
                    borderBottom: '1px solid #f0f0f0',
                    transition: 'background-color 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedScene?.id !== scene.id) {
                      e.currentTarget.style.backgroundColor = '#fafafa'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedScene?.id !== scene.id) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <List.Item.Meta
                    avatar={<EnvironmentOutlined style={{ fontSize: 32, color: '#52c41a' }} />}
                    title={scene.name}
                    description={
                      <Space size="small">
                        {scene.location && <Text type="secondary">{scene.location}</Text>}
                      </Space>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: <Empty description="暂无场景" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
            />
          </Card>
        </Col>

        {/* Right Panel - Scene Details / Graph */}
        <Col span={18}>
          <Card
            style={{ height: '100%', overflow: 'auto' }}
            title={
              selectedScene ? (
                <Space>
                  <EnvironmentOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                  <span>{selectedScene.name}</span>
                </Space>
              ) : (
                '场景管理'
              )
            }
            extra={
              activeTab === 'details' && selectedScene ? (
                <Space>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSaveScene}
                    loading={loading}
                  >
                    保存
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteScene(selectedScene.id)}
                  >
                    删除
                  </Button>
                </Space>
              ) : null
            }
          >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'details',
                  label: '场景详情',
                  children: selectedScene ? (
                    <Form form={form} layout="vertical">
                      <Row gutter={24}>
                        <Col span={12}>
                          <Form.Item name="name" label="场景名称" rules={[{ required: true }]}>
                            <Input placeholder="输入场景名称" />
                          </Form.Item>
                        </Col>

                        <Col span={12}>
                          <Form.Item name="location" label="地理位置">
                            <Input placeholder="输入地理位置" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Divider orientation="left">场景描述</Divider>

                      <Form.Item name="atmosphere" label="氛围特征">
                        <TextArea rows={4} placeholder="描述场景的氛围、环境特征" />
                      </Form.Item>

                      <Form.Item name="description" label="详细描述">
                        <TextArea rows={6} placeholder="详细描述场景的特点、布局、细节" />
                      </Form.Item>

                      <Divider orientation="left">备注</Divider>

                      <Form.Item name="notes" label="备注">
                        <TextArea rows={4} placeholder="其他备注信息" />
                      </Form.Item>
                    </Form>
                  ) : (
                    <Empty
                      description="选择一个场景查看详情"
                      style={{ marginTop: 100 }}
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  ),
                },
                {
                  key: 'graph',
                  label: '场景地图',
                  children: projectId ? (
                    <SceneGraph projectId={parseInt(projectId)} />
                  ) : (
                    <Empty description="请先选择项目" />
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Create Scene Modal */}
      <Modal
        title="新建场景"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false)
          form.resetFields()
        }}
        onOk={() => form.submit()}
        okText="创建"
        cancelText="取消"
        width={600}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateScene}>
          <Form.Item
            name="name"
            label="场景名称"
            rules={[{ required: true, message: '请输入场景名称' }]}
          >
            <Input placeholder="输入场景名称" />
          </Form.Item>

          <Form.Item name="location" label="地理位置">
            <Input placeholder="输入地理位置" />
          </Form.Item>

          <Form.Item name="atmosphere" label="氛围特征">
            <TextArea rows={3} placeholder="描述场景的氛围" />
          </Form.Item>

          <Form.Item name="description" label="详细描述">
            <TextArea rows={4} placeholder="详细描述场景" />
          </Form.Item>

          <Form.Item name="notes" label="备注">
            <TextArea rows={3} placeholder="其他备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default SceneList