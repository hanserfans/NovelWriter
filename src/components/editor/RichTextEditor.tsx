import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { Button, Space, Divider, Tooltip, Modal, Select, message, Spin, Card, List, Tag, Empty, Tabs } from 'antd'
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  AlignLeftOutlined,
  FormatPainterOutlined,
  RobotOutlined,
  BugOutlined,
  ThunderboltOutlined,
  FileSearchOutlined,
  SaveOutlined,
  DeleteOutlined,
  HistoryOutlined,
} from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { ipcClient } from '../../lib/ipc-client'
import ReactMarkdown from 'react-markdown'
import type { AIReview } from '../../types'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  onWordCountChange?: (count: number) => void
  placeholder?: string
  editable?: boolean
  projectId?: number
  chapterId?: number
}

const AI_REVIEW_TYPES = [
  { value: 'physics', label: '物理合理性', icon: '⚡', prompt: '审查这段文字中的物理描述是否合理，包括物理现象、力学原理、环境条件等是否符合物理定律。' },
  { value: 'logic', label: '逻辑一致性', icon: '🔗', prompt: '审查这段文字的逻辑是否通顺，前后是否存在矛盾，因果关系是否合理。' },
  { value: 'character', label: '角色行为', icon: '👤', prompt: '审查角色的言行是否符合其性格设定，行为动机是否合理。' },
  { value: 'scene', label: '场景描写', icon: '🏞️', prompt: '审查场景描写是否生动具体，是否符合场景设定，细节是否恰当。' },
  { value: 'emotion', label: '情感表达', icon: '💫', prompt: '审查情感表达是否自然真实，情感变化是否有层次，是否打动读者。' },
  { value: 'dialogue', label: '对话质量', icon: '💬', prompt: '审查对话是否自然流畅，是否符合角色身份，是否能推动情节发展。' },
  { value: 'style', label: '文风语言', icon: '✨', prompt: '审查文字表达是否优美流畅，用词是否准确，句式是否多样。' },
  { value: 'custom', label: '自定义审查', icon: '🎯', prompt: '' },
]

function RichTextEditor({
  content,
  onChange,
  onWordCountChange,
  placeholder = '开始写作...',
  editable = true,
  projectId,
  chapterId,
}: RichTextEditorProps) {
  const [showAIToolbar, setShowAIToolbar] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [aiModalVisible, setAiModalVisible] = useState(false)
  const [reviewType, setReviewType] = useState<string>('logic')
  const [customPrompt, setCustomPrompt] = useState('')
  const [reviewing, setReviewing] = useState(false)
  const [reviewResult, setReviewResult] = useState('')
  const [savedReviews, setSavedReviews] = useState<AIReview[]>([])
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new')

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: content,
    editable: editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)

      // Calculate word count
      if (onWordCountChange) {
        const text = editor.getText()
        const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
        const englishWords = text
          .replace(/[\u4e00-\u9fa5]/g, ' ')
          .split(/\s+/)
          .filter((word) => word.length > 0).length
        onWordCountChange(chineseChars + englishWords)
      }
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-lg max-w-none focus:outline-none min-h-[400px] px-4 py-3 text-gray-800',
        placeholder: placeholder,
      },
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  // Detect text selection
  useEffect(() => {
    if (!editor) return

    const handleSelection = () => {
      const { from, to } = editor.state.selection
      const text = editor.state.doc.textBetween(from, to, '')

      if (text.length > 10) {
        setSelectedText(text)
        setShowAIToolbar(true)
      } else {
        setShowAIToolbar(false)
        setSelectedText('')
      }
    }

    editor.on('selectionUpdate', handleSelection)
    return () => editor.off('selectionUpdate', handleSelection)
  }, [editor])

  // Load saved reviews when modal opens
  useEffect(() => {
    if (aiModalVisible && chapterId) {
      loadSavedReviews()
    }
  }, [aiModalVisible, chapterId])

  const loadSavedReviews = async () => {
    if (!chapterId) return
    try {
      const reviews = await ipcClient.getAIReviewsByChapter(chapterId)
      setSavedReviews(reviews as AIReview[])
    } catch (error) {
      console.error('Failed to load reviews:', error)
    }
  }

  if (!editor) {
    return null
  }

  const toggleBold = () => editor.chain().focus().toggleBold().run()
  const toggleItalic = () => editor.chain().focus().toggleItalic().run()
  const toggleUnderline = () => editor.chain().focus().toggleUnderline().run()
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run()
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run()
  const toggleHeading = (level: 1 | 2 | 3) => {
    editor.chain().focus().toggleHeading({ level }).run()
  }

  const handleAIReview = async () => {
    if (!selectedText) {
      message.warning('请先选中要审查的文字')
      return
    }

    setAiModalVisible(true)
    setReviewResult('')
  }

  const executeReview = async () => {
    const reviewConfig = AI_REVIEW_TYPES.find(r => r.value === reviewType)
    if (!reviewConfig) return

    const prompt = reviewType === 'custom' && customPrompt
      ? customPrompt
      : reviewConfig.prompt

    if (!prompt) {
      message.error('请输入审查要求')
      return
    }

    setReviewing(true)
    try {
      const fullPrompt = `${prompt}

【待审查的文字】
${selectedText}

请以专业编辑的角度，给出具体的审查意见和修改建议。`

      const result = await ipcClient.aiGenerate(fullPrompt, '你是一位专业的小说编辑，擅长发现文字中的问题并提供改进建议。')
      setReviewResult(result as string)
      message.success('审查完成')
    } catch (error: any) {
      message.error(error.message || 'AI审查失败，请检查配置')
    } finally {
      setReviewing(false)
    }
  }

  const saveReview = async () => {
    if (!reviewResult || !projectId) {
      message.error('无法保存')
      return
    }

    try {
      await ipcClient.createAIReview({
        project_id: projectId,
        chapter_id: chapterId,
        selected_text: selectedText,
        review_type: reviewType,
        review_result: reviewResult,
      })
      message.success('审查结果已保存')
      setReviewResult('')
      loadSavedReviews()
    } catch (error) {
      message.error('保存失败')
    }
  }

  const deleteReview = async (id: number) => {
    Modal.confirm({
      title: '删除审查记录',
      content: '确定要删除这条审查记录吗？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        await ipcClient.deleteAIReview(id)
        message.success('已删除')
        loadSavedReviews()
      },
    })
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="border-b bg-gray-50 px-4 py-2">
        <Space size="small" wrap>
          <Tooltip title="加粗 (Ctrl+B)">
            <Button
              type={editor.isActive('bold') ? 'primary' : 'text'}
              icon={<BoldOutlined />}
              onClick={toggleBold}
              size="small"
            />
          </Tooltip>

          <Tooltip title="斜体 (Ctrl+I)">
            <Button
              type={editor.isActive('italic') ? 'primary' : 'text'}
              icon={<ItalicOutlined />}
              onClick={toggleItalic}
              size="small"
            />
          </Tooltip>

          <Tooltip title="下划线 (Ctrl+U)">
            <Button
              type={editor.isActive('underline') ? 'primary' : 'text'}
              icon={<UnderlineOutlined />}
              onClick={toggleUnderline}
              size="small"
            />
          </Tooltip>

          <Divider type="vertical" />

          <Tooltip title="标题1">
            <Button
              type={editor.isActive('heading', { level: 1 }) ? 'primary' : 'text'}
              onClick={() => toggleHeading(1)}
              size="small"
            >
              H1
            </Button>
          </Tooltip>

          <Tooltip title="标题2">
            <Button
              type={editor.isActive('heading', { level: 2 }) ? 'primary' : 'text'}
              onClick={() => toggleHeading(2)}
              size="small"
            >
              H2
            </Button>
          </Tooltip>

          <Tooltip title="标题3">
            <Button
              type={editor.isActive('heading', { level: 3 }) ? 'primary' : 'text'}
              onClick={() => toggleHeading(3)}
              size="small"
            >
              H3
            </Button>
          </Tooltip>

          <Divider type="vertical" />

          <Tooltip title="无序列表">
            <Button
              type={editor.isActive('bulletList') ? 'primary' : 'text'}
              icon={<UnorderedListOutlined />}
              onClick={toggleBulletList}
              size="small"
            />
          </Tooltip>

          <Tooltip title="有序列表">
            <Button
              type={editor.isActive('orderedList') ? 'primary' : 'text'}
              icon={<OrderedListOutlined />}
              onClick={toggleOrderedList}
              size="small"
            />
          </Tooltip>

          {showAIToolbar && (
            <>
              <Divider type="vertical" />
              <Tooltip title="AI审查">
                <Button
                  type="primary"
                  icon={<RobotOutlined />}
                  onClick={handleAIReview}
                  size="small"
                >
                  AI审查
                </Button>
              </Tooltip>
            </>
          )}
        </Space>
      </div>

      {/* Editor */}
      <div className="bg-white">
        <EditorContent editor={editor} />
      </div>

      {/* AI Review Modal */}
      <Modal
        title={
          <Space>
            <RobotOutlined />
            AI审查助手
          </Space>
        }
        open={aiModalVisible}
        onCancel={() => {
          setAiModalVisible(false)
          setReviewResult('')
          setCustomPrompt('')
        }}
        footer={null}
        width={1000}
      >
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as 'new' | 'history')}
          items={[
            {
              key: 'new',
              label: (
                <span>
                  <FileSearchOutlined />
                  新建审查
                </span>
              ),
              children: (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ marginBottom: 8, fontWeight: 600 }}>选中的文字：</div>
                    <div style={{
                      background: '#f5f5f5',
                      padding: 12,
                      borderRadius: 4,
                      maxHeight: 150,
                      overflow: 'auto',
                      fontSize: 14,
                      lineHeight: 1.6,
                    }}>
                      {selectedText}
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ marginBottom: 8, fontWeight: 600 }}>审查类型：</div>
                    <Select
                      style={{ width: '100%' }}
                      value={reviewType}
                      onChange={setReviewType}
                      placeholder="选择审查类型"
                    >
                      {AI_REVIEW_TYPES.map(type => (
                        <Select.Option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>

                  {reviewType === 'custom' && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ marginBottom: 8, fontWeight: 600 }}>自定义审查要求：</div>
                      <textarea
                        style={{
                          width: '100%',
                          padding: 8,
                          borderRadius: 4,
                          border: '1px solid #d9d9d9',
                          minHeight: 80,
                        }}
                        placeholder="输入你的审查要求..."
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                      />
                    </div>
                  )}

                  <Space style={{ marginBottom: 16 }}>
                    <Button
                      type="primary"
                      size="large"
                      onClick={executeReview}
                      loading={reviewing}
                      icon={<FileSearchOutlined />}
                    >
                      开始审查
                    </Button>
                    {reviewResult && (
                      <Button
                        size="large"
                        onClick={saveReview}
                        icon={<SaveOutlined />}
                      >
                        保存结果
                      </Button>
                    )}
                  </Space>

                  {reviewing && (
                    <div style={{ textAlign: 'center', padding: 20 }}>
                      <Spin size="large" />
                      <div style={{ marginTop: 12, color: '#666' }}>AI正在分析中...</div>
                    </div>
                  )}

                  {reviewResult && (
                    <Card
                      title="审查结果"
                      extra={
                        <Button
                          type="link"
                          onClick={() => {
                            navigator.clipboard.writeText(reviewResult)
                            message.success('已复制到剪贴板')
                          }}
                        >
                          复制
                        </Button>
                      }
                    >
                      <ReactMarkdown
                        style={{
                          lineHeight: 1.8,
                          fontSize: 14,
                        }}
                      >
                        {reviewResult}
                      </ReactMarkdown>
                    </Card>
                  )}
                </>
              ),
            },
            {
              key: 'history',
              label: (
                <span>
                  <HistoryOutlined />
                  审查记录 ({savedReviews.length})
                </span>
              ),
              children: (
                <div style={{ maxHeight: 600, overflow: 'auto' }}>
                  {savedReviews.length === 0 ? (
                    <Empty description="暂无审查记录" />
                  ) : (
                    <List
                      dataSource={savedReviews}
                      renderItem={(review) => (
                        <List.Item
                          actions={[
                            <Button
                              key="delete"
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                              onClick={() => deleteReview(review.id)}
                            >
                              删除
                            </Button>,
                          ]}
                        >
                          <List.Item.Meta
                            title={
                              <Space>
                                <Tag color="blue">{AI_REVIEW_TYPES.find(t => t.value === review.review_type)?.label || review.review_type}</Tag>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  {new Date(review.created_at).toLocaleString('zh-CN')}
                                </Text>
                              </Space>
                            }
                            description={
                              <div>
                                <div style={{
                                  background: '#f5f5f5',
                                  padding: 8,
                                  borderRadius: 4,
                                  marginBottom: 8,
                                  fontSize: 12,
                                }}>
                                  <Text type="secondary">原文：</Text>
                                  {review.selected_text.substring(0, 100)}...
                                </div>
                                <div style={{
                                  maxHeight: 200,
                                  overflow: 'auto',
                                }}>
                                  <ReactMarkdown>
                                    {review.review_result}
                                  </ReactMarkdown>
                                </div>
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  )}
                </div>
              ),
            },
          ]}
        />
      </Modal>
    </div>
  )
}

export default RichTextEditor