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
  InputNumber,
  Select,
  Avatar,
  Empty,
  message,
  Tag,
  List,
  Divider,
  Card,
  Tabs,
} from 'antd'
import { PlusOutlined, UserOutlined, DeleteOutlined, ArrowLeftOutlined, SaveOutlined, ApartmentOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { useCharacters } from '../../hooks/useCharacters'
import { CharacterGraph } from './'
import type { Character } from '../../types'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

function CharacterList() {
  const { id: projectId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { characters, loading, createCharacter, updateCharacter, deleteCharacter } = useCharacters(
    projectId ? parseInt(projectId) : null
  )
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [activeTab, setActiveTab] = useState('details')

  const handleCreateCharacter = async (values: any) => {
    if (!projectId) return

    try {
      const character = await createCharacter({
        ...values,
        project_id: parseInt(projectId),
      })
      message.success('角色创建成功')
      setIsModalVisible(false)
      form.resetFields()
      setSelectedCharacter(character as Character)
    } catch (error) {
      message.error('角色创建失败')
    }
  }

  const handleSaveCharacter = async () => {
    if (!selectedCharacter) return

    try {
      const values = await form.validateFields()
      await updateCharacter(selectedCharacter.id, values)
      message.success('角色保存成功')
    } catch (error) {
      message.error('角色保存失败')
    }
  }

  const handleDeleteCharacter = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个角色吗？此操作不可恢复。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteCharacter(id)
          message.success('角色删除成功')
          if (selectedCharacter?.id === id) {
            setSelectedCharacter(null)
          }
        } catch (error) {
          message.error('角色删除失败')
        }
      },
    })
  }

  const getGenderColor = (gender: string | null) => {
    switch (gender) {
      case 'male':
        return 'blue'
      case 'female':
        return 'pink'
      default:
        return 'default'
    }
  }

  const getGenderText = (gender: string | null) => {
    switch (gender) {
      case 'male':
        return '男'
      case 'female':
        return '女'
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
        {/* Left Panel - Character List */}
        <Col span={6}>
          <Card
            title="角色列表"
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
              dataSource={characters}
              renderItem={(character) => (
                <List.Item
                  onClick={() => {
                    setSelectedCharacter(character)
                    form.setFieldsValue(character)
                    setActiveTab('details')
                  }}
                  style={{
                    cursor: 'pointer',
                    backgroundColor:
                      selectedCharacter?.id === character.id ? '#e6f7ff' : 'transparent',
                    padding: '12px 16px',
                    borderBottom: '1px solid #f0f0f0',
                    transition: 'background-color 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCharacter?.id !== character.id) {
                      e.currentTarget.style.backgroundColor = '#fafafa'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCharacter?.id !== character.id) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        size={48}
                        icon={<UserOutlined />}
                        src={character.avatar}
                        style={{ backgroundColor: '#1890ff' }}
                      />
                    }
                    title={character.name}
                    description={
                      <Space size="small">
                        <Tag color={getGenderColor(character.gender)} style={{ margin: 0 }}>
                          {getGenderText(character.gender)}
                        </Tag>
                        {character.age && <Text type="secondary">{character.age}岁</Text>}
                      </Space>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: <Empty description="暂无角色" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
            />
          </Card>
        </Col>

        {/* Right Panel - Character Details / Relationship Graph */}
        <Col span={18}>
          <Card
            style={{ height: '100%', overflow: 'auto' }}
            title={
              selectedCharacter ? (
                <Space>
                  <Avatar
                    size={40}
                    icon={<UserOutlined />}
                    src={selectedCharacter.avatar}
                    style={{ backgroundColor: '#1890ff' }}
                  />
                  <span>{selectedCharacter.name}</span>
                </Space>
              ) : (
                '角色管理'
              )
            }
            extra={
              selectedCharacter ? (
                <Space>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSaveCharacter}
                    loading={loading}
                  >
                    保存
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteCharacter(selectedCharacter.id)}
                  >
                    删除
                  </Button>
                </Space>
              ) : null
            }
          >
            {selectedCharacter ? (
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                  {
                    key: 'details',
                    label: '角色详情',
                    children: (
                      <Form form={form} layout="vertical">
                        <Row gutter={24}>
                          <Col span={8}>
                            <Form.Item name="name" label="角色名称" rules={[{ required: true }]}>
                              <Input placeholder="输入角色名称" />
                            </Form.Item>
                          </Col>

                          <Col span={8}>
                            <Form.Item name="avatar" label="头像URL">
                              <Input placeholder="输入头像图片URL" />
                            </Form.Item>
                          </Col>

                          <Col span={4}>
                            <Form.Item name="gender" label="性别">
                              <Select placeholder="选择性别">
                                <Select.Option value="male">男</Select.Option>
                                <Select.Option value="female">女</Select.Option>
                                <Select.Option value="other">其他</Select.Option>
                              </Select>
                            </Form.Item>
                          </Col>

                          <Col span={4}>
                            <Form.Item name="age" label="年龄">
                              <InputNumber min={0} max={1000} placeholder="年龄" style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Divider orientation="left">外貌与性格</Divider>

                        <Row gutter={24}>
                          <Col span={12}>
                            <Form.Item name="appearance" label="外貌描述">
                              <TextArea rows={6} placeholder="描述角色的外貌特征" />
                            </Form.Item>
                          </Col>

                          <Col span={12}>
                            <Form.Item name="personality" label="性格特点">
                              <TextArea rows={6} placeholder="描述角色的性格特点" />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Divider orientation="left">背景与能力</Divider>

                        <Form.Item name="background" label="背景故事">
                          <TextArea rows={5} placeholder="描述角色的背景故事" />
                        </Form.Item>

                        <Form.Item name="abilities" label="能力技能">
                          <TextArea rows={4} placeholder="描述角色的能力或技能" />
                        </Form.Item>

                        <Divider orientation="left">关系与备注</Divider>

                        <Form.Item name="relationships" label="人物关系">
                          <TextArea rows={4} placeholder="描述与其他角色的关系" />
                        </Form.Item>

                        <Form.Item name="notes" label="备注">
                          <TextArea rows={4} placeholder="其他备注信息" />
                        </Form.Item>
                      </Form>
                    ),
                  },
                  {
                    key: 'graph',
                    label: (
                      <span>
                        <ApartmentOutlined style={{ marginRight: 8 }} />
                        关系图
                      </span>
                    ),
                    children: (
                      <div style={{ height: 'calc(100vh - 340px)', border: '1px solid #f0f0f0', borderRadius: 4 }}>
                        <CharacterGraph
                          projectId={projectId ? parseInt(projectId) : 0}
                          characters={characters}
                        />
                      </div>
                    ),
                  },
                ]}
              />
            ) : (
              <Empty
                description="选择一个角色查看详情"
                style={{ marginTop: 100 }}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Create Character Modal */}
      <Modal
        title="新建角色"
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
        <Form form={form} layout="vertical" onFinish={handleCreateCharacter}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="角色名称"
                rules={[{ required: true, message: '请输入角色名称' }]}
              >
                <Input placeholder="输入角色名称" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="avatar" label="头像URL">
                <Input placeholder="输入头像图片URL" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="gender" label="性别">
                <Select placeholder="选择性别">
                  <Select.Option value="male">男</Select.Option>
                  <Select.Option value="female">女</Select.Option>
                  <Select.Option value="other">其他</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="age" label="年龄">
                <InputNumber min={0} max={1000} placeholder="输入年龄" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="appearance" label="外貌描述">
            <TextArea rows={3} placeholder="描述角色的外貌特征" />
          </Form.Item>

          <Form.Item name="personality" label="性格特点">
            <TextArea rows={3} placeholder="描述角色的性格特点" />
          </Form.Item>

          <Form.Item name="background" label="背景故事">
            <TextArea rows={4} placeholder="描述角色的背景故事" />
          </Form.Item>

          <Form.Item name="abilities" label="能力技能">
            <TextArea rows={3} placeholder="描述角色的能力或技能" />
          </Form.Item>

          <Form.Item name="relationships" label="人物关系">
            <TextArea rows={3} placeholder="描述与其他角色的关系" />
          </Form.Item>

          <Form.Item name="notes" label="备注">
            <TextArea rows={3} placeholder="其他备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default CharacterList