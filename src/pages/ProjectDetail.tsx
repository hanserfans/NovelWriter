import { useParams, useNavigate } from 'react-router-dom'
import { Typography, Button, Space, Card, List, Modal, Form, Input, message, Tag, Empty } from 'antd'
import { ArrowLeftOutlined, PlusOutlined, FileTextOutlined, UserOutlined, EnvironmentOutlined, BookOutlined, BranchesOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { ipcClient } from '../lib/ipc-client'
import { RichTextEditor } from '../components/editor'
import type { Project, Chapter } from '../types'

const { Title, Text } = Typography
const { TextArea } = Input

function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)
  const [isChapterModalVisible, setIsChapterModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const fetchProject = async () => {
    if (!id) return
    try {
      const projectData = await ipcClient.getProject(parseInt(id))
      setProject(projectData as Project)
    } catch (error) {
      message.error('加载项目失败')
    }
  }

  const fetchChapters = async () => {
    if (!id) return
    try {
      const chaptersData = await ipcClient.getChaptersByProject(parseInt(id))
      setChapters(chaptersData as Chapter[])
    } catch (error) {
      message.error('加载章节失败')
    }
  }

  useEffect(() => {
    fetchProject()
    fetchChapters()
  }, [id])

  const handleCreateChapter = async (values: any) => {
    if (!id) return
    setLoading(true)
    try {
      await ipcClient.createChapter({
        project_id: parseInt(id),
        title: values.title,
        content: '',
        status: 'draft',
      })
      message.success('章节创建成功')
      setIsChapterModalVisible(false)
      form.resetFields()
      fetchChapters()
    } catch (error) {
      message.error('章节创建失败')
    } finally {
      setLoading(false)
    }
  }

  const handleChapterClick = (chapter: Chapter) => {
    setSelectedChapter(chapter)
  }

  const handleContentChange = async (content: string) => {
    if (!selectedChapter) return

    // Auto-save with debounce (in real app, should use debounce)
    try {
      await ipcClient.updateChapter(selectedChapter.id, { content })
      message.success('已自动保存')
    } catch (error) {
      message.error('保存失败')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
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
      case 'draft':
        return '草稿'
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
      <div style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/projects')}>
          返回项目列表
        </Button>
      </div>

      {/* Project Info */}
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3} style={{ margin: 0 }}>
              {project?.title || '加载中...'}
            </Title>
            <Space>
              <Text type="secondary">{project?.word_count || 0} 字</Text>
              <Text type="secondary">{chapters.length} 章</Text>
              {project?.genre && <Tag color="blue">{project.genre}</Tag>}
            </Space>
          </div>
          {project?.description && <Text type="secondary">{project.description}</Text>}

          {/* Quick Access Buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            <Button
              icon={<UserOutlined />}
              onClick={() => navigate(`/projects/${id}/characters`)}
            >
              角色管理
            </Button>
            <Button
              icon={<EnvironmentOutlined />}
              onClick={() => navigate(`/projects/${id}/scenes`)}
            >
              场景管理
            </Button>
            <Button
              icon={<BranchesOutlined />}
              onClick={() => navigate(`/projects/${id}/plotlines`)}
            >
              情节线
            </Button>
            <Button
              icon={<BookOutlined />}
              onClick={() => navigate(`/projects/${id}/world`)}
            >
              世界观
            </Button>
            <Button
              icon={<ClockCircleOutlined />}
              onClick={() => navigate(`/projects/${id}/timeline`)}
            >
              时间线
            </Button>
          </div>
        </Space>
      </Card>

      {/* Main Content */}
      <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 300px)' }}>
        {/* Chapter List */}
        <Card
          title="章节列表"
          extra={
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => setIsChapterModalVisible(true)}
            >
              新建章节
            </Button>
          }
          style={{ width: 300, overflow: 'auto' }}
          bodyStyle={{ padding: 0 }}
        >
          {chapters.length === 0 ? (
            <Empty description="暂无章节" style={{ padding: 24 }} />
          ) : (
            <List
              dataSource={chapters}
              renderItem={(chapter) => (
                <List.Item
                  onClick={() => handleChapterClick(chapter)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor:
                      selectedChapter?.id === chapter.id ? '#f0f2ff' : 'transparent',
                    padding: '12px 16px',
                    borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  <List.Item.Meta
                    avatar={<FileTextOutlined />}
                    title={chapter.title}
                    description={
                      <Space size="small">
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {chapter.word_count || 0} 字
                        </Text>
                        <Tag color={getStatusColor(chapter.status)} style={{ margin: 0 }}>
                          {getStatusText(chapter.status)}
                        </Tag>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>

        {/* Editor */}
        <Card style={{ flex: 1, overflow: 'auto' }}>
          {selectedChapter ? (
            <div>
              <Title level={4} style={{ marginBottom: 16 }}>
                {selectedChapter.title}
              </Title>
              <RichTextEditor
                content={selectedChapter.content || ''}
                onChange={handleContentChange}
                onWordCountChange={(count) => {
                  console.log('Word count:', count)
                }}
                projectId={parseInt(id!)}
                chapterId={selectedChapter.id}
              />
            </div>
          ) : (
            <Empty
              description="选择一个章节开始编辑"
              style={{ marginTop: 100 }}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Card>
      </div>

      {/* Create Chapter Modal */}
      <Modal
        title="新建章节"
        open={isChapterModalVisible}
        onCancel={() => setIsChapterModalVisible(false)}
        onOk={() => form.submit()}
        okText="创建"
        cancelText="取消"
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateChapter}>
          <Form.Item
            name="title"
            label="章节标题"
            rules={[{ required: true, message: '请输入章节标题' }]}
          >
            <Input placeholder="输入章节标题" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ProjectDetail