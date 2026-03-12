import { useState } from 'react'
import {
  Card,
  Button,
  Space,
  Typography,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  List,
  Tag,
  Divider,
  Switch,
} from 'antd'
import { PlusOutlined, DeleteOutlined, EditOutlined, CheckOutlined, RobotOutlined } from '@ant-design/icons'
import { useAIConfigs } from '../hooks/useAIConfigs'
import { ipcClient } from '../lib/ipc-client'
import type { AIConfig } from '../types'

const { Title, Text, Paragraph } = Typography
const { Password } = Input

function AISettings() {
  const { configs, defaultConfig, loading, createConfig, updateConfig, deleteConfig, setDefault } = useAIConfigs()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingConfig, setEditingConfig] = useState<AIConfig | null>(null)
  const [form] = Form.useForm()
  const [testingConfig, setTestingConfig] = useState<number | null>(null)
  const [testResult, setTestResult] = useState<string>('')

  const handleTestConfig = async (config: AIConfig) => {
    setTestingConfig(config.id)
    setTestResult('')
    try {
      message.loading({ content: '正在测试连接...', key: 'test' })

      // Temporarily set as default for testing
      await setDefault(config.id)

      const result = await ipcClient.aiGenerate('请回复"测试成功"', '你是一个测试助手，请简短回复。')

      setTestResult(result as string)
      message.success({ content: '连接成功！', key: 'test' })
    } catch (error: any) {
      console.error('Test failed:', error)
      message.error({ content: `连接失败: ${error.message || '未知错误'}`, key: 'test' })
      setTestResult(`错误: ${error.message || '连接失败'}`)
    } finally {
      setTestingConfig(null)
    }
  }

  const handleCreateConfig = async (values: any) => {
    try {
      if (editingConfig) {
        await updateConfig(editingConfig.id, values)
        message.success('AI配置更新成功')
      } else {
        await createConfig(values)
        message.success('AI配置创建成功')
      }
      setIsModalVisible(false)
      form.resetFields()
      setEditingConfig(null)
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleEdit = (config: AIConfig) => {
    setEditingConfig(config)
    form.setFieldsValue(config)
    setIsModalVisible(true)
  }

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '删除配置',
      content: '确定要删除这个AI配置吗？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        await deleteConfig(id)
        message.success('配置已删除')
      },
    })
  }

  const handleSetDefault = async (id: number) => {
    await setDefault(id)
    message.success('已设为默认配置')
  }

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={3} style={{ margin: 0 }}>
                <RobotOutlined style={{ marginRight: 8 }} />
                AI配置管理
              </Title>
              <Text type="secondary">配置AI助手API，支持OpenAI和Claude接口</Text>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingConfig(null)
                form.resetFields()
                setIsModalVisible(true)
              }}
            >
              新建配置
            </Button>
          </div>

          <Divider />

          {configs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Text type="secondary">暂无AI配置，请点击"新建配置"添加</Text>
            </div>
          ) : (
            <List
              dataSource={configs}
              renderItem={(config) => (
                <List.Item
                  actions={[
                    <Button
                      key="test"
                      size="small"
                      icon={<RobotOutlined />}
                      onClick={() => handleTestConfig(config)}
                      loading={testingConfig === config.id}
                    >
                      测试
                    </Button>,
                    <Button
                      key="default"
                      type={config.is_default ? 'primary' : 'default'}
                      size="small"
                      icon={<CheckOutlined />}
                      onClick={() => handleSetDefault(config.id)}
                      disabled={config.is_default}
                    >
                      {config.is_default ? '默认' : '设为默认'}
                    </Button>,
                    <Button
                      key="edit"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => handleEdit(config)}
                    >
                      编辑
                    </Button>,
                    <Button
                      key="delete"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(config.id)}
                      disabled={config.is_default && configs.length > 1}
                    >
                      删除
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>{config.name}</Text>
                        <Tag color={config.provider === 'anthropic' ? 'purple' : 'blue'}>
                          {config.provider === 'anthropic' ? 'Claude/DashScope' : 'OpenAI'}
                        </Tag>
                        {config.is_default && <Tag color="green">默认</Tag>}
                      </Space>
                    }
                    description={
                      <Space size="large">
                        <Text type="secondary">模型: {config.model}</Text>
                        <Text type="secondary">Temperature: {config.temperature}</Text>
                        <Text type="secondary">Max Tokens: {config.max_tokens}</Text>
                      </Space>
                    }
                  />
                  {testingConfig === config.id && testResult && (
                    <div style={{
                      position: 'absolute',
                      bottom: -10,
                      left: 0,
                      right: 0,
                      background: '#f0f2f5',
                      padding: 8,
                      borderRadius: 4,
                      marginTop: 8
                    }}>
                      <Text type="secondary">测试响应: </Text>
                      <Text code>{testResult}</Text>
                    </div>
                  )}
                </List.Item>
              )}
            />
          )}

          <Divider />

          <Card title="快速配置 - 阿里云DashScope" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text>使用以下信息快速配置：</Text>
              <Paragraph copyable style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                <Text code>Provider: anthropic</Text><br/>
                <Text code>Base URL: https://coding.dashscope.aliyuncs.com/apps/anthropic</Text><br/>
                <Text code>Model: glm-5</Text><br/>
                <Text code>API Key: 你的API密钥</Text>
              </Paragraph>
              <Button
                type="dashed"
                block
                onClick={() => {
                  setEditingConfig(null)
                  form.setFieldsValue({
                    name: 'DashScope GLM-5',
                    provider: 'anthropic',
                    model: 'glm-5',
                    temperature: 0.7,
                    max_tokens: 2000,
                  })
                  setIsModalVisible(true)
                }}
              >
                使用DashScope配置模板
              </Button>
            </Space>
          </Card>
        </Space>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingConfig ? '编辑AI配置' : '新建AI配置'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false)
          form.resetFields()
          setEditingConfig(null)
        }}
        onOk={() => form.submit()}
        okText={editingConfig ? '更新' : '创建'}
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateConfig}>
          <Form.Item
            name="name"
            label="配置名称"
            rules={[{ required: true, message: '请输入配置名称' }]}
          >
            <Input placeholder="例如：DashScope GLM-5" />
          </Form.Item>

          <Form.Item
            name="provider"
            label="服务提供商"
            rules={[{ required: true }]}
          >
            <Select placeholder="选择服务商">
              <Select.Option value="anthropic">Claude / DashScope (兼容Anthropic)</Select.Option>
              <Select.Option value="openai">OpenAI</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="api_key"
            label="API Key"
            rules={[{ required: true, message: '请输入API Key' }]}
          >
            <Password placeholder="输入API密钥" />
          </Form.Item>

          <Form.Item
            name="model"
            label="模型名称"
            rules={[{ required: true, message: '请输入模型名称' }]}
          >
            <Input placeholder="例如：glm-5, claude-3-5-sonnet-20241022" />
          </Form.Item>

          <Form.Item
            name="temperature"
            label="Temperature (温度参数)"
            initialValue={0.7}
          >
            <InputNumber min={0} max={2} step={0.1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="max_tokens"
            label="Max Tokens (最大生成长度)"
            initialValue={2000}
          >
            <InputNumber min={100} max={8000} step={100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="is_default"
            label="设为默认配置"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AISettings