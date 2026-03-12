import { useState } from 'react'
import { Card, Col, Row, Typography, Button, Space, Modal, Form, Input, Select, message } from 'antd'
import { PlusOutlined, BookOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

function ProjectList() {
  const navigate = useNavigate()
  const { projects, isLoading, createProject, deleteProject } = useProjects()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()

  const handleCreateProject = async (values: any) => {
    try {
      console.log('Creating project with values:', values)
      const result = await createProject(values)
      console.log('Project created successfully:', result)
      message.success('项目创建成功')
      setIsModalVisible(false)
      form.resetFields()
    } catch (error) {
      console.error('Failed to create project:', error)
      message.error(`项目创建失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const handleDeleteProject = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个项目吗？此操作不可恢复。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteProject(id)
          message.success('项目删除成功')
        } catch (error) {
          message.error('项目删除失败')
        }
      },
    })
  }

  return (
    <div>
      <div
        style={{
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          我的项目
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
          新建项目
        </Button>
      </div>

      {projects.length === 0 && !isLoading ? (
        <div style={{ marginTop: 48, textAlign: 'center' }}>
          <BookOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
          <Title level={4} type="secondary" style={{ marginTop: 16 }}>
            开始创作你的第一部小说
          </Title>
          <Text type="secondary">点击"新建项目"开始你的创作之旅</Text>
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {projects.map((project) => (
            <Col xs={24} sm={12} md={8} lg={6} key={project.id}>
              <Card
                hoverable
                style={{ height: 280, cursor: 'pointer' }}
                cover={
                  project.cover_image ? (
                    <img alt={project.title} src={project.cover_image} style={{ height: 120, objectFit: 'cover' }} />
                  ) : (
                    <div
                      style={{
                        height: 120,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <BookOutlined style={{ fontSize: 48, color: 'white' }} />
                    </div>
                  )
                }
                actions={[
                  <EditOutlined key="edit" onClick={(e) => {
                    e.stopPropagation()
                    message.info('编辑功能开发中')
                  }} />,
                  <DeleteOutlined key="delete" onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteProject(project.id)
                  }} />,
                ]}
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <Card.Meta
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{project.title}</span>
                      <Text type="secondary" style={{ fontSize: 12 }}>点击进入 →</Text>
                    </div>
                  }
                  description={
                    <div>
                      <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 8 }}>
                        {project.description || '暂无描述'}
                      </Paragraph>
                      <Space size="small">
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {project.word_count || 0} 字
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {project.chapter_count || 0} 章
                        </Text>
                      </Space>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title="新建项目"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        okText="创建"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateProject}>
          <Form.Item
            name="title"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="输入小说名称" />
          </Form.Item>

          <Form.Item name="description" label="项目描述">
            <TextArea rows={4} placeholder="简单描述一下你的小说" />
          </Form.Item>

          <Form.Item name="genre" label="类型">
            <Select placeholder="选择小说类型">
              <Select.Option value="fantasy">玄幻</Select.Option>
              <Select.Option value="romance">言情</Select.Option>
              <Select.Option value="scifi">科幻</Select.Option>
              <Select.Option value="suspense">悬疑</Select.Option>
              <Select.Option value="history">历史</Select.Option>
              <Select.Option value="other">其他</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ProjectList