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
  Tag,
  Select,
} from 'antd'
import { PlusOutlined, BranchesOutlined, DeleteOutlined, ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { usePlotlines } from '../../hooks/usePlotlines'
import type { Plotline } from '../../types'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

function PlotlineList() {
  const { id: projectId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { plotlines, loading, createPlotline, updatePlotline, deletePlotline } = usePlotlines(
    projectId ? parseInt(projectId) : null
  )
  const [selectedPlotline, setSelectedPlotline] = useState<Plotline | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()

  const handleCreatePlotline = async (values: any) => {
    if (!projectId) return

    try {
      const plotline = await createPlotline({
        ...values,
      })
      message.success('情节线创建成功')
      setIsModalVisible(false)
      form.resetFields()
      setSelectedPlotline(plotline as Plotline)
    } catch (error) {
      message.error('情节线创建失败')
    }
  }

  const handleSavePlotline = async () => {
    if (!selectedPlotline) return

    try {
      const values = await form.validateFields()
      await updatePlotline(selectedPlotline.id, values)
      message.success('情节线保存成功')
    } catch (error) {
      message.error('情节线保存失败')
    }
  }

  const handleDeletePlotline = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个情节线吗？此操作不可恢复。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deletePlotline(id)
          message.success('情节线删除成功')
          if (selectedPlotline?.id === id) {
            setSelectedPlotline(null)
          }
        } catch (error) {
          message.error('情节线删除失败')
        }
      },
    })
  }

  const getTypeColor = (type: string) => {
    return type === 'main' ? 'red' : 'blue'
  }

  const getTypeText = (type: string) => {
    return type === 'main' ? '主线' : '支线'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'default'
      case 'writing':
        return 'processing'
      case 'completed':
        return 'success'
      default:
        return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planning':
        return '规划中'
      case 'writing':
        return '写作中'
      case 'completed':
        return '已完成'
      default:
        return '未知'
    }
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
        {/* Left Panel - Plotline List */}
        <Col span={6}>
          <Card
            title="情节线列表"
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
              dataSource={plotlines}
              renderItem={(plotline) => (
                <List.Item
                  onClick={() => {
                    setSelectedPlotline(plotline)
                    form.setFieldsValue(plotline)
                  }}
                  style={{
                    cursor: 'pointer',
                    backgroundColor:
                      selectedPlotline?.id === plotline.id ? '#e6f7ff' : 'transparent',
                    padding: '12px 16px',
                    borderBottom: '1px solid #f0f0f0',
                    transition: 'background-color 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedPlotline?.id !== plotline.id) {
                      e.currentTarget.style.backgroundColor = '#fafafa'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedPlotline?.id !== plotline.id) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <List.Item.Meta
                    avatar={<BranchesOutlined style={{ fontSize: 32, color: '#722ed1' }} />}
                    title={
                      <Space size="small">
                        <span>{plotline.title}</span>
                        <Tag color={getTypeColor(plotline.type)} style={{ margin: 0 }}>
                          {getTypeText(plotline.type)}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space size="small">
                        <Tag color={getStatusColor(plotline.status)} style={{ margin: 0 }}>
                          {getStatusText(plotline.status)}
                        </Tag>
                      </Space>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: <Empty description="暂无情节线" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
            />
          </Card>
        </Col>

        {/* Right Panel - Plotline Details */}
        <Col span={18}>
          <Card
            style={{ height: '100%', overflow: 'auto' }}
            title={
              selectedPlotline ? (
                <Space>
                  <BranchesOutlined style={{ fontSize: 24, color: '#722ed1' }} />
                  <span>{selectedPlotline.title}</span>
                </Space>
              ) : (
                '情节线管理'
              )
            }
            extra={
              selectedPlotline ? (
                <Space>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSavePlotline}
                    loading={loading}
                  >
                    保存
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeletePlotline(selectedPlotline.id)}
                  >
                    删除
                  </Button>
                </Space>
              ) : null
            }
          >
            {selectedPlotline ? (
              <Form form={form} layout="vertical">
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item name="title" label="情节线标题" rules={[{ required: true }]}>
                      <Input placeholder="输入情节线标题" />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item name="type" label="类型" rules={[{ required: true }]}>
                      <Select placeholder="选择情节线类型">
                        <Select.Option value="main">主线</Select.Option>
                        <Select.Option value="sub">支线</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item name="status" label="状态" rules={[{ required: true }]}>
                      <Select placeholder="选择状态">
                        <Select.Option value="planning">规划中</Select.Option>
                        <Select.Option value="writing">写作中</Select.Option>
                        <Select.Option value="completed">已完成</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Divider orientation="left">情节描述</Divider>

                <Form.Item name="description" label="情节概述">
                  <TextArea rows={6} placeholder="描述情节线的主要内容和发展脉络" />
                </Form.Item>

                <Divider orientation="left">备注</Divider>

                <Form.Item name="notes" label="备注">
                  <TextArea rows={4} placeholder="其他备注信息" />
                </Form.Item>
              </Form>
            ) : (
              <Empty
                description="选择一个情节线查看详情"
                style={{ marginTop: 100 }}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Create Plotline Modal */}
      <Modal
        title="新建情节线"
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
        <Form form={form} layout="vertical" onFinish={handleCreatePlotline}>
          <Form.Item
            name="title"
            label="情节线标题"
            rules={[{ required: true, message: '请输入情节线标题' }]}
          >
            <Input placeholder="输入情节线标题" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="类型"
                rules={[{ required: true }]}
                initialValue="sub"
              >
                <Select placeholder="选择情节线类型">
                  <Select.Option value="main">主线</Select.Option>
                  <Select.Option value="sub">支线</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true }]}
                initialValue="planning"
              >
                <Select placeholder="选择状态">
                  <Select.Option value="planning">规划中</Select.Option>
                  <Select.Option value="writing">写作中</Select.Option>
                  <Select.Option value="completed">已完成</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="情节概述">
            <TextArea rows={4} placeholder="描述情节线的主要内容" />
          </Form.Item>

          <Form.Item name="notes" label="备注">
            <TextArea rows={3} placeholder="其他备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default PlotlineList