import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { Button, Space, Divider, Tooltip, Modal, Select, message, Spin, Card, List, Tag, Empty, Tabs, Typography, Input, Dropdown, Statistic } from 'antd'
import type { MenuProps } from 'antd'
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
  ExportOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  FullscreenOutlined,
  FileTextOutlined,
  FileWordOutlined,
  FilePdfOutlined,
  TagOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { ipcClient } from '../../lib/ipc-client'
import ReactMarkdown from 'react-markdown'
import type { AIReview } from '../../types'

const { Text } = Typography
const { TextArea } = Input

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
  const [wordCount, setWordCount] = useState(0)
  const [statsModalVisible, setStatsModalVisible] = useState(false)
  const [timelineModalVisible, setTimelineModalVisible] = useState(false)

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: content,
    editable: editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)

      // Calculate word count
      const text = editor.getText()
      const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
      const englishWords = text
        .replace(/[\u4e00-\u9fa5]/g, ' ')
        .split(/\s+/)
        .filter((word) => word.length > 0).length
      const count = chineseChars + englishWords

      setWordCount(count)
      if (onWordCountChange) {
        onWordCountChange(count)
      }
    },
    editorProps: {
      attributes: {
        class: 'prose-editor',
        style: 'outline: none; min-height: 500px; width: 100%;',
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
    return () => {
      editor.off('selectionUpdate', handleSelection)
    }
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
      console.log('Loaded reviews:', reviews)
      setSavedReviews((reviews as AIReview[]) || [])
    } catch (error) {
      console.error('Failed to load reviews:', error)
      message.error('加载审查记录失败')
      setSavedReviews([])
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

  // Export functions
  const handleExport = async (format: 'txt' | 'docx' | 'pdf') => {
    try {
      message.loading({ content: `正在导出为${format.toUpperCase()}格式...`, key: 'export' })

      if (!projectId || !chapterId) {
        message.error({ content: '无法导出：缺少项目或章节信息', key: 'export' })
        return
      }

      const result = await ipcClient.exportChapter(chapterId, format)
      message.success({ content: `导出成功！文件已保存到：${result}`, key: 'export', duration: 5 })
    } catch (error: any) {
      console.error('Export error:', error)

      // 用户取消导出不应该显示错误
      if (error.message?.includes('取消')) {
        message.info({ content: '已取消导出', key: 'export', duration: 2 })
      } else {
        message.error({
          content: `导出失败：${error.message || '未知错误'}`,
          key: 'export',
          duration: 5
        })
      }
    }
  }

  // Get statistics
  const getStatistics = () => {
    if (!editor) return null

    const text = editor.getText()
    const paragraphs = editor.getHTML().split(/<\/p>|<br>/).filter(p => p.trim()).length
    const sentences = text.split(/[。！？\n]/).filter(s => s.trim()).length
    const readingTime = Math.ceil(wordCount / 400) // 假设每分钟阅读400字

    return {
      wordCount,
      chineseChars: (text.match(/[\u4e00-\u9fa5]/g) || []).length,
      englishWords: text.replace(/[\u4e00-\u9fa5]/g, ' ').split(/\s+/).filter(w => w).length,
      paragraphs,
      sentences,
      readingTime,
    }
  }

  // Export dropdown menu
  const exportMenuItems: MenuProps['items'] = [
    {
      key: 'txt',
      icon: <FileTextOutlined />,
      label: '导出为 TXT',
      onClick: () => handleExport('txt'),
    },
    {
      key: 'docx',
      icon: <FileWordOutlined />,
      label: '导出为 Word',
      onClick: () => handleExport('docx'),
    },
    {
      key: 'pdf',
      icon: <FilePdfOutlined />,
      label: '导出为 PDF',
      onClick: () => handleExport('pdf'),
    },
  ]

  const handleAIReview = async () => {
    if (!selectedText) {
      message.warning('请先选中要审查的文字')
      return
    }

    setAiModalVisible(true)
    setReviewResult('')
  }

  const handleAIFormat = async () => {
    if (!selectedText) {
      message.warning('请先选中要整理的文字')
      return
    }

    Modal.confirm({
      title: 'AI格式整理',
      content: '将对选中的文字进行智能格式整理，包括段落优化、标点修正、排版美化等。是否继续？',
      okText: '开始整理',
      cancelText: '取消',
      onOk: async () => {
        const hideLoading = message.loading('AI正在整理格式...', 0)

        try {
          const prompt = `请对以下文字进行格式整理和优化：

【原文】
${selectedText}

【整理要求】
1. 优化段落划分，使段落更合理
2. 修正标点符号错误（如中英文标点混用）
3. 统一格式，美化排版
4. 保持原文内容和语意不变
5. 仅输出整理后的文字，不要添加任何说明或注释

请直接输出整理后的文字：`

          const result = await ipcClient.aiGenerate(prompt, '你是一位专业的文字编辑，擅长格式整理和排版优化。')

          hideLoading()

          // 将整理后的文字替换到编辑器中
          if (result && editor) {
            editor.chain().focus().insertContent(result as string).run()
            message.success('格式整理完成')
          }
        } catch (error: any) {
          hideLoading()
          message.error(error.message || 'AI整理失败，请检查配置')
        }
      },
    })
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
      // Don't clear the result immediately, let user see it
      // Load the reviews list
      if (chapterId) {
        await loadSavedReviews()
      }
    } catch (error: any) {
      console.error('Save review error:', error)
      message.error(`保存失败: ${error.message || '未知错误'}`)
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
    <div className="editor-wrapper" style={{
      backgroundColor: '#f5f5f5',
      padding: '32px 0',
      minHeight: '500px'
    }}>
      {/* Floating Toolbar */}
      <div className="editor-toolbar" style={{
        background: 'white',
        borderBottom: '1px solid #e8e8e8',
        padding: '12px 24px',
        marginBottom: '0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {/* Left: Formatting Tools */}
        <Space size="middle" wrap>
          <Tooltip title="加粗 (Ctrl+B)">
            <Button
              type={editor.isActive('bold') ? 'primary' : 'default'}
              icon={<BoldOutlined />}
              onClick={toggleBold}
              size="middle"
            />
          </Tooltip>

          <Tooltip title="斜体 (Ctrl+I)">
            <Button
              type={editor.isActive('italic') ? 'primary' : 'default'}
              icon={<ItalicOutlined />}
              onClick={toggleItalic}
              size="middle"
            />
          </Tooltip>

          <Tooltip title="下划线 (Ctrl+U)">
            <Button
              type={editor.isActive('underline') ? 'primary' : 'default'}
              icon={<UnderlineOutlined />}
              onClick={toggleUnderline}
              size="middle"
            />
          </Tooltip>

          <Divider type="vertical" style={{ height: '24px', margin: '0 8px' }} />

          <Tooltip title="标题1">
            <Button
              type={editor.isActive('heading', { level: 1 }) ? 'primary' : 'default'}
              onClick={() => toggleHeading(1)}
              size="middle"
              style={{ fontWeight: 'bold' }}
            >
              H1
            </Button>
          </Tooltip>

          <Tooltip title="标题2">
            <Button
              type={editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'}
              onClick={() => toggleHeading(2)}
              size="middle"
              style={{ fontWeight: 'bold' }}
            >
              H2
            </Button>
          </Tooltip>

          <Tooltip title="标题3">
            <Button
              type={editor.isActive('heading', { level: 3 }) ? 'primary' : 'default'}
              onClick={() => toggleHeading(3)}
              size="middle"
              style={{ fontWeight: 'bold' }}
            >
              H3
            </Button>
          </Tooltip>

          <Divider type="vertical" style={{ height: '24px', margin: '0 8px' }} />

          <Tooltip title="无序列表">
            <Button
              type={editor.isActive('bulletList') ? 'primary' : 'default'}
              icon={<UnorderedListOutlined />}
              onClick={toggleBulletList}
              size="middle"
            />
          </Tooltip>

          <Tooltip title="有序列表">
            <Button
              type={editor.isActive('orderedList') ? 'primary' : 'default'}
              icon={<OrderedListOutlined />}
              onClick={toggleOrderedList}
              size="middle"
            />
          </Tooltip>

          {showAIToolbar && (
            <>
              <Divider type="vertical" style={{ height: '24px', margin: '0 8px' }} />
              <Button
                type="primary"
                icon={<FormatPainterOutlined />}
                onClick={handleAIFormat}
                size="middle"
                style={{
                  background: 'linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%)',
                  border: 'none',
                  fontWeight: 500,
                }}
              >
                AI整理
              </Button>
              <Button
                type="primary"
                icon={<RobotOutlined />}
                onClick={handleAIReview}
                size="middle"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  fontWeight: 500,
                }}
              >
                AI审查
              </Button>
            </>
          )}
        </Space>

        {/* Right: Function Tools */}
        <Space size="small">
          <Tooltip title="统计信息">
            <Button
              icon={<BarChartOutlined />}
              onClick={() => setStatsModalVisible(true)}
              size="middle"
            >
              统计
            </Button>
          </Tooltip>

          <Tooltip title="时间线标记">
            <Button
              icon={<ClockCircleOutlined />}
              onClick={() => setTimelineModalVisible(true)}
              size="middle"
            >
              时间线
            </Button>
          </Tooltip>

          <Tooltip title="导出">
            <Dropdown menu={{ items: exportMenuItems }} placement="bottomRight">
              <Button icon={<ExportOutlined />} size="middle">
                导出
              </Button>
            </Dropdown>
          </Tooltip>
        </Space>
      </div>

      {/* Paper-like Editor Area */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '0 32px',
      }}>
        <div style={{
          background: 'white',
          minHeight: '600px',
          padding: '48px 64px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.12)',
          borderRadius: '4px',
        }}>
          <EditorContent
            editor={editor}
            style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#333',
            }}
          />
        </div>
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
                      <div style={{ lineHeight: 1.8, fontSize: 14 }}>
                        <ReactMarkdown>
                          {reviewResult}
                        </ReactMarkdown>
                      </div>
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
                <div style={{ minHeight: 700, maxHeight: 800, overflow: 'auto' }}>
                  {savedReviews.length === 0 ? (
                    <Empty description="暂无审查记录" />
                  ) : (
                    <List
                      dataSource={savedReviews}
                      renderItem={(review) => {
                        const reviewTypeLabel = AI_REVIEW_TYPES.find(t => t.value === review.review_type)?.label || review.review_type

                        return (
                          <List.Item
                            style={{ padding: '16px 0' }}
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
                                  <Tag color="blue">{reviewTypeLabel}</Tag>
                                  <span style={{ fontSize: 12, color: '#666' }}>
                                    {new Date(review.created_at).toLocaleString('zh-CN')}
                                  </span>
                                </Space>
                              }
                              description={
                                <div>
                                  <div style={{
                                    background: '#f5f5f5',
                                    padding: 12,
                                    borderRadius: 4,
                                    marginBottom: 12,
                                    fontSize: 13,
                                  }}>
                                    <span style={{ color: '#999' }}>原文：</span>
                                    {review.selected_text ? review.selected_text.substring(0, 150) : ''}...
                                  </div>
                                  <div style={{
                                    maxHeight: 400,
                                    overflow: 'auto',
                                    padding: 16,
                                    background: '#fff',
                                    border: '1px solid #e8e8e8',
                                    borderRadius: 4,
                                    fontSize: 14,
                                    lineHeight: 1.8,
                                  }}>
                                    <ReactMarkdown>
                                      {review.review_result || ''}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                              }
                            />
                          </List.Item>
                        )
                      }}
                    />
                  )}
                </div>
              ),
            },
          ]}
        />
      </Modal>

      {/* Statistics Modal */}
      <Modal
        title={
          <Space>
            <BarChartOutlined />
            文章统计
          </Space>
        }
        open={statsModalVisible}
        onCancel={() => setStatsModalVisible(false)}
        footer={null}
        width={600}
      >
        {(() => {
          const stats = getStatistics()
          if (!stats) return null

          return (
            <div style={{ padding: '24px 0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                <Card>
                  <Statistic
                    title="总字数"
                    value={stats.wordCount}
                    suffix="字"
                    valueStyle={{ color: '#1890ff', fontSize: '32px' }}
                  />
                </Card>
                <Card>
                  <Statistic
                    title="中文字符"
                    value={stats.chineseChars}
                    suffix="字"
                    valueStyle={{ color: '#52c41a', fontSize: '32px' }}
                  />
                </Card>
                <Card>
                  <Statistic
                    title="英文单词"
                    value={stats.englishWords}
                    suffix="词"
                    valueStyle={{ color: '#722ed1', fontSize: '32px' }}
                  />
                </Card>
                <Card>
                  <Statistic
                    title="段落数"
                    value={stats.paragraphs}
                    suffix="段"
                    valueStyle={{ color: '#fa8c16', fontSize: '32px' }}
                  />
                </Card>
                <Card>
                  <Statistic
                    title="句子数"
                    value={stats.sentences}
                    suffix="句"
                    valueStyle={{ color: '#eb2f96', fontSize: '32px' }}
                  />
                </Card>
                <Card>
                  <Statistic
                    title="预计阅读时间"
                    value={stats.readingTime}
                    suffix="分钟"
                    valueStyle={{ color: '#13c2c2', fontSize: '32px' }}
                  />
                </Card>
              </div>

              <Divider />

              <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
                <div style={{ marginBottom: 8, fontWeight: 600 }}>
                  <InfoCircleOutlined style={{ marginRight: 8 }} />
                  阅读建议
                </div>
                <Text type="secondary">
                  {stats.wordCount < 2000
                    ? '本文篇幅较短，适合快速阅读。建议增加更多细节描写。'
                    : stats.wordCount < 5000
                    ? '本文篇幅适中，节奏把握较好。'
                    : '本文篇幅较长，建议检查是否有冗余内容，保持情节紧凑。'}
                </Text>
              </div>
            </div>
          )
        })()}
      </Modal>

      {/* Timeline Modal */}
      <Modal
        title={
          <Space>
            <ClockCircleOutlined />
            时间线标记
          </Space>
        }
        open={timelineModalVisible}
        onCancel={() => setTimelineModalVisible(false)}
        onOk={() => {
          message.success('时间线标记已保存')
          setTimelineModalVisible(false)
        }}
        okText="保存"
        cancelText="取消"
        width={700}
      >
        <div style={{ padding: '24px 0' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>时间点名称</div>
            <Input
              placeholder="例如：初遇、离别、重逢"
              size="large"
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>时间描述</div>
            <TextArea
              rows={4}
              placeholder="描述这个时间点发生的事件..."
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>时间类型</div>
            <Select style={{ width: '100%' }} placeholder="选择时间类型">
              <Select.Option value="plot">情节节点</Select.Option>
              <Select.Option value="character">角色发展</Select.Option>
              <Select.Option value="world">世界观事件</Select.Option>
              <Select.Option value="custom">自定义</Select.Option>
            </Select>
          </div>

          <Divider />

          <div style={{ marginBottom: 8, fontWeight: 600 }}>
            <TagOutlined style={{ marginRight: 8 }} />
            已有时间线标记
          </div>
          <Empty description="暂无时间线标记" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      </Modal>
    </div>
  )
}

export default RichTextEditor