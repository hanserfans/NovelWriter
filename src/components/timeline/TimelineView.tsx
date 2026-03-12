import { useState, useRef, useEffect } from 'react'
import { Button, Modal, Form, Input, Select, DatePicker, ColorPicker, Space, Tag, message } from 'antd'
import { PlusOutlined, DeleteOutlined, ZoomInOutlined, ZoomOutOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useTimeline } from '../../hooks/useTimeline'
import type { TimelineEvent } from '../../types'

const { TextArea } = Input
const { RangePicker } = DatePicker

interface TimelineViewProps {
  projectId: number
}

export default function TimelineView({ projectId }: TimelineViewProps) {
  const { events, tracks, loading, createEvent, updateEvent, deleteEvent, createTrack, deleteTrack } = useTimeline(projectId)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isTrackModalVisible, setIsTrackModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [trackForm] = Form.useForm()
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)

  // Timeline view state
  const [scale, setScale] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sort events by date
  const sortedEvents = events
    .filter(e => e.start_date)
    .sort((a, b) => dayjs(a.start_date).unix() - dayjs(b.start_date).unix())

  // Get unique timeline names from events
  const timelineNames = Array.from(new Set(events.map(e => e.timeline_name || '主线')))

  // Group events by timeline
  const eventsByTimeline = timelineNames.map(name => ({
    name,
    events: sortedEvents.filter(e => (e.timeline_name || '主线') === name),
  }))

  // Handle zoom
  const handleZoomIn = () => setScale((s) => Math.min(s * 1.5, 5))
  const handleZoomOut = () => setScale((s) => Math.max(s / 1.5, 0.2))

  // Handle create event
  const handleCreateEvent = async (values: any) => {
    try {
      const eventData = {
        title: values.title,
        description: values.description,
        event_type: values.event_type,
        timeline_name: values.timeline_name || 'main',
        start_date: values.date_range ? values.date_range[0].format('YYYY-MM-DD') : values.start_date.format('YYYY-MM-DD'),
        end_date: values.date_range ? values.date_range[1].format('YYYY-MM-DD') : undefined,
        color: values.color || '#1890ff',
      }

      if (selectedEvent) {
        await updateEvent(selectedEvent.id, eventData)
        message.success('事件更新成功')
      } else {
        await createEvent(eventData)
        message.success('事件创建成功')
      }

      setIsModalVisible(false)
      form.resetFields()
      setSelectedEvent(null)
    } catch (error) {
      message.error('操作失败')
    }
  }

  // Handle create track
  const handleCreateTrack = async (values: any) => {
    try {
      await createTrack({
        name: values.name,
        color: values.color || '#1890ff',
      })
      message.success('时间线轨道创建成功')
      setIsTrackModalVisible(false)
      trackForm.resetFields()
    } catch (error) {
      message.error('创建失败')
    }
  }

  // Handle delete event
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return
    Modal.confirm({
      title: '删除事件',
      content: '确定要删除这个事件吗？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        await deleteEvent(selectedEvent.id)
        setIsModalVisible(false)
        setSelectedEvent(null)
        form.resetFields()
        message.success('事件已删除')
      },
    })
  }

  // Handle event click
  const handleEventClick = (event: TimelineEvent) => {
    setSelectedEvent(event)
    form.setFieldsValue({
      title: event.title,
      description: event.description,
      event_type: event.event_type,
      timeline_name: event.timeline_name,
      date_range: event.end_date
        ? [dayjs(event.start_date), dayjs(event.end_date)]
        : undefined,
      start_date: dayjs(event.start_date),
      color: event.color,
    })
    setIsModalVisible(true)
  }

  // Get timeline tracks (use tracks from DB or create from events)
  const timelineTracks = tracks.length > 0 ? tracks : [
    { id: 'main', name: '主线', color: '#1890ff', order_index: 0 },
  ]

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#f5f7fa' }}>
      {/* Toolbar */}
      <div style={{
        padding: '16px 20px',
        background: '#fff',
        borderBottom: '1px solid #e8e8e8',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}>
        <Space size="middle">
          <Button icon={<PlusOutlined />} type="primary" onClick={() => setIsModalVisible(true)} size="large">
            新建事件
          </Button>
          <Button icon={<PlusOutlined />} onClick={() => setIsTrackModalVisible(true)} size="large">
            新建轨道
          </Button>
        </Space>

        <Space size="middle">
          <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} size="large" />
          <Tag style={{ fontSize: 14, padding: '4px 12px', borderRadius: 12 }}>{Math.round(scale * 100)}%</Tag>
          <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} size="large" />
        </Space>
      </div>

      {/* Timeline container */}
      <div ref={containerRef} style={{ flex: 1, overflow: 'auto', position: 'relative', padding: 40 }}>
        {eventsByTimeline.map((timeline, timelineIndex) => (
          <div key={timeline.name} style={{ marginBottom: 60 }}>
            {/* Timeline header */}
            <div style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#24292e',
              marginBottom: 24,
              padding: '12px 20px',
              background: '#fff',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: tracks.find(t => t.name === timeline.name)?.color || '#1890ff',
              }} />
              {timeline.name}
              <Tag style={{ marginLeft: 'auto', background: '#f0f2f5', border: 'none' }}>
                {timeline.events.length} 个事件
              </Tag>
            </div>

            {/* Events in this timeline */}
            <div style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 12 }}>
              {timeline.events.map((event) => (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  style={{
                    flex: '0 0 auto',
                    width: 320 * scale,
                    background: `linear-gradient(135deg, ${event.color || '#1890ff'}, ${event.color || '#1890ff'}cc)`,
                    borderRadius: 12,
                    padding: '20px 24px',
                    color: '#fff',
                    cursor: 'pointer',
                    boxShadow: `0 4px 16px ${(event.color || '#1890ff')}40, 0 2px 8px rgba(0,0,0,0.12)`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)'
                    e.currentTarget.style.boxShadow = `0 12px 32px ${(event.color || '#1890ff')}60, 0 6px 16px rgba(0,0,0,0.2)`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = `0 4px 16px ${(event.color || '#1890ff')}40, 0 2px 8px rgba(0,0,0,0.12)`
                  }}
                >
                  {event.event_type === 'milestone' && (
                    <div style={{
                      position: 'absolute',
                      right: 16,
                      top: 16,
                      background: '#ffd700',
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      border: '3px solid #fff',
                      boxShadow: '0 2px 8px rgba(255,215,0,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                    }}>
                      ★
                    </div>
                  )}

                  <div style={{
                    fontWeight: 700,
                    fontSize: 16,
                    marginBottom: 12,
                    paddingRight: event.event_type === 'milestone' ? 32 : 0,
                  }}>
                    {event.title}
                  </div>

                  <div style={{
                    fontSize: 13,
                    opacity: 0.95,
                    marginBottom: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>
                    <span style={{ fontSize: 16 }}>📅</span>
                    <span style={{ fontWeight: 600 }}>
                      {dayjs(event.start_date).format('YYYY年MM月DD日')}
                    </span>
                  </div>

                  {event.end_date && (
                    <div style={{
                      fontSize: 13,
                      opacity: 0.9,
                      marginBottom: 8,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}>
                      <span style={{ fontSize: 16 }}>⏱</span>
                      <span>
                        至 {dayjs(event.end_date).format('MM月DD日')}
                      </span>
                      <span style={{ opacity: 0.8, fontSize: 12 }}>
                        ({dayjs(event.end_date).diff(dayjs(event.start_date), 'day')}天)
                      </span>
                    </div>
                  )}

                  {event.description && (
                    <div style={{
                      fontSize: 13,
                      opacity: 0.85,
                      marginTop: 12,
                      lineHeight: 1.5,
                      borderTop: '1px solid rgba(255,255,255,0.2)',
                      paddingTop: 12,
                      maxHeight: 60,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical' as any,
                    }}>
                      {event.description}
                    </div>
                  )}
                </div>
              ))}

              {timeline.events.length === 0 && (
                <div style={{
                  padding: 40,
                  textAlign: 'center',
                  color: '#586069',
                  fontSize: 14,
                  background: '#fff',
                  borderRadius: 8,
                  width: '100%',
                }}>
                  暂无事件
                </div>
              )}
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 300,
            color: '#586069',
            fontSize: 16,
            background: '#fff',
            borderRadius: 12,
          }}>
            暂无时间线事件，点击"新建事件"开始创建
          </div>
        )}
      </div>

      {/* Create/Edit Event Modal */}
      <Modal
        title={selectedEvent ? '编辑事件' : '新建事件'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false)
          setSelectedEvent(null)
          form.resetFields()
        }}
        footer={[
          selectedEvent && (
            <Button key="delete" danger icon={<DeleteOutlined />} onClick={handleDeleteEvent}>
              删除
            </Button>
          ),
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            {selectedEvent ? '更新' : '创建'}
          </Button>,
        ]}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateEvent}>
          <Form.Item name="title" label="事件标题" rules={[{ required: true }]}>
            <Input placeholder="输入事件标题" />
          </Form.Item>

          <Form.Item name="event_type" label="事件类型" initialValue="event">
            <Select>
              <Select.Option value="event">事件</Select.Option>
              <Select.Option value="milestone">里程碑</Select.Option>
              <Select.Option value="period">时期</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="timeline_name" label="时间线轨道">
            <Select placeholder="选择轨道">
              {timelineTracks.map((track) => (
                <Select.Option key={track.id} value={track.name}>
                  {track.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.event_type !== curr.event_type}>
            {({ getFieldValue }) => {
              const eventType = getFieldValue('event_type')
              return eventType === 'period' ? (
                <Form.Item name="date_range" label="时间范围" rules={[{ required: true }]}>
                  <RangePicker style={{ width: '100%' }} />
                </Form.Item>
              ) : (
                <Form.Item name="start_date" label="日期" rules={[{ required: true }]}>
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              )
            }}
          </Form.Item>

          <Form.Item name="color" label="颜色" initialValue="#1890ff">
            <ColorPicker format="hex" />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="事件描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Track Modal */}
      <Modal
        title="新建时间线轨道"
        open={isTrackModalVisible}
        onCancel={() => {
          setIsTrackModalVisible(false)
          trackForm.resetFields()
        }}
        onOk={() => trackForm.submit()}
        okText="创建"
        cancelText="取消"
      >
        <Form form={trackForm} layout="vertical" onFinish={handleCreateTrack}>
          <Form.Item name="name" label="轨道名称" rules={[{ required: true }]}>
            <Input placeholder="输入轨道名称" />
          </Form.Item>

          <Form.Item name="color" label="颜色" initialValue="#1890ff">
            <ColorPicker format="hex" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}