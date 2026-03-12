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
  Tabs,
} from 'antd'
import { PlusOutlined, GlobalOutlined, DeleteOutlined, ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { useWorldSettings } from '../../hooks/useWorldSettings'
import type { WorldSetting } from '../../types'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

// Predefined world-building categories
const WORLD_CATEGORIES = [
  { value: 'history', label: '历史' },
  { value: 'geography', label: '地理' },
  { value: 'politics', label: '政治' },
  { value: 'economy', label: '经济' },
  { value: 'culture', label: '文化' },
  { value: 'religion', label: '宗教' },
  { value: 'technology', label: '科技' },
  { value: 'magic', label: '魔法体系' },
  { value: 'races', label: '种族' },
  { value: 'organizations', label: '组织势力' },
  { value: 'other', label: '其他' },
]

function WorldSettingList() {
  const { id: projectId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { worldSettings, loading, createWorldSetting, updateWorldSetting, deleteWorldSetting, getCategories } =
    useWorldSettings(projectId ? parseInt(projectId) : null)
  const [selectedSetting, setSelectedSetting] = useState<WorldSetting | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const handleCreateSetting = async (values: any) => {
    if (!projectId) return

    try {
      const setting = await createWorldSetting({
        ...values,
      })
      message.success('世界观设定创建成功')
      setIsModalVisible(false)
      form.resetFields()
      setSelectedSetting(setting as WorldSetting)
    } catch (error) {
      message.error('世界观设定创建失败')
    }
  }

  const handleSaveSetting = async () => {
    if (!selectedSetting) return

    try {
      const values = await form.validateFields()
      await updateWorldSetting(selectedSetting.id, values)
      message.success('世界观设定保存成功')
    } catch (error) {
      message.error('世界观设定保存失败')
    }
  }

  const handleDeleteSetting = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个世界观设定吗？此操作不可恢复。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteWorldSetting(id)
          message.success('世界观设定删除成功')
          if (selectedSetting?.id === id) {
            setSelectedSetting(null)
          }
        } catch (error) {
          message.error('世界观设定删除失败')
        }
      },
    })
  }

  const getCategoryLabel = (value: string) => {
    const category = WORLD_CATEGORIES.find((c) => c.value === value)
    return category ? category.label : value
  }

  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      history: 'volcano',
      geography: 'green',
      politics: 'red',
      economy: 'gold',
      culture: 'purple',
      religion: 'cyan',
      technology: 'blue',
      magic: 'magenta',
      races: 'orange',
      organizations: 'geekblue',
      other: 'default',
    }
    return colorMap[category] || 'default'
  }

  const filteredSettings =
    activeCategory === 'all' ? worldSettings : worldSettings.filter((s) => s.category === activeCategory)

  const categories = getCategories()

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/projects/${projectId}`)}>
          返回项目
        </Button>
      </div>

      <Row gutter={16} style={{ height: 'calc(100vh - 140px)' }}>
        {/* Left Panel - World Settings List */}
        <Col span={6}>
          <Card
            title="世界观设定"
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
            {/* Category Filter */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
              <Select
                value={activeCategory}
                onChange={setActiveCategory}
                style={{ width: '100%' }}
                placeholder="筛选分类"
              >
                <Select.Option value="all">全部分类</Select.Option>
                {categories.map((cat) => (
                  <Select.Option key={cat} value={cat}>
                    {getCategoryLabel(cat)}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <List
              dataSource={filteredSettings}
              renderItem={(setting) => (
                <List.Item
                  onClick={() => {
                    setSelectedSetting(setting)
                    form.setFieldsValue(setting)
                  }}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selectedSetting?.id === setting.id ? '#e6f7ff' : 'transparent',
                    padding: '12px 16px',
                    borderBottom: '1px solid #f0f0f0',
                    transition: 'background-color 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedSetting?.id !== setting.id) {
                      e.currentTarget.style.backgroundColor = '#fafafa'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedSetting?.id !== setting.id) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <List.Item.Meta
                    avatar={<GlobalOutlined style={{ fontSize: 32, color: '#1890ff' }} />}
                    title={
                      <Space size="small">
                        <span>{setting.title}</span>
                        <Tag color={getCategoryColor(setting.category)} style={{ margin: 0 }}>
                          {getCategoryLabel(setting.category)}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Text type="secondary" ellipsis style={{ fontSize: 12 }}>
                        {setting.content || '暂无内容'}
                      </Text>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: <Empty description="暂无设定" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
            />
          </Card>
        </Col>

        {/* Right Panel - World Setting Details */}
        <Col span={18}>
          <Card
            style={{ height: '100%', overflow: 'auto' }}
            title={
              selectedSetting ? (
                <Space>
                  <GlobalOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                  <span>{selectedSetting.title}</span>
                </Space>
              ) : (
                '世界观管理'
              )
            }
            extra={
              selectedSetting ? (
                <Space>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSaveSetting}
                    loading={loading}
                  >
                    保存
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteSetting(selectedSetting.id)}
                  >
                    删除
                  </Button>
                </Space>
              ) : null
            }
          >
            {selectedSetting ? (
              <Form form={form} layout="vertical">
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item name="title" label="标题" rules={[{ required: true }]}>
                      <Input placeholder="输入设定标题" />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item name="category" label="分类" rules={[{ required: true }]}>
                      <Select placeholder="选择分类">
                        {WORLD_CATEGORIES.map((cat) => (
                          <Select.Option key={cat.value} value={cat.value}>
                            {cat.label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Divider orientation="left">详细内容</Divider>

                <Form.Item name="content" label="内容">
                  <TextArea rows={15} placeholder="详细描述世界观设定的内容" />
                </Form.Item>
              </Form>
            ) : (
              <Empty
                description="选择一个设定查看详情"
                style={{ marginTop: 100 }}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Create World Setting Modal */}
      <Modal
        title="新建世界观设定"
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
        <Form form={form} layout="vertical" onFinish={handleCreateSetting}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="标题"
                rules={[{ required: true, message: '请输入标题' }]}
              >
                <Input placeholder="输入设定标题" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="category"
                label="分类"
                rules={[{ required: true }]}
                initialValue="other"
              >
                <Select placeholder="选择分类">
                  {WORLD_CATEGORIES.map((cat) => (
                    <Select.Option key={cat.value} value={cat.value}>
                      {cat.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="content" label="内容">
            <TextArea rows={6} placeholder="详细描述世界观设定的内容" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default WorldSettingList