import { useState, useEffect } from 'react'
import { ipcClient } from '../lib/ipc-client'
import type { TimelineEvent, TimelineTrack } from '../types'

export function useTimeline(projectId: number | null) {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [tracks, setTracks] = useState<TimelineTrack[]>([])
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    if (!projectId) {
      setEvents([])
      setTracks([])
      return
    }

    setLoading(true)
    try {
      const [eventsData, tracksData] = await Promise.all([
        ipcClient.getTimelineEventsByProject(projectId),
        ipcClient.getTimelineTracksByProject(projectId),
      ])
      setEvents(eventsData as TimelineEvent[])
      setTracks(tracksData as TimelineTrack[])
    } catch (error) {
      console.error('Failed to fetch timeline data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [projectId])

  const createEvent = async (data: {
    title: string
    description?: string
    event_type?: 'event' | 'milestone' | 'period'
    timeline_name?: string
    start_date: string
    end_date?: string
    color?: string
    metadata?: string
  }) => {
    if (!projectId) throw new Error('Project ID is required')
    const event = await ipcClient.createTimelineEvent({
      project_id: projectId,
      ...data,
    })
    await fetchData()
    return event
  }

  const updateEvent = async (id: number, data: Partial<TimelineEvent>) => {
    const event = await ipcClient.updateTimelineEvent(id, data)
    await fetchData()
    return event
  }

  const deleteEvent = async (id: number) => {
    await ipcClient.deleteTimelineEvent(id)
    await fetchData()
  }

  const createTrack = async (data: { name: string; color?: string; order_index?: number }) => {
    if (!projectId) throw new Error('Project ID is required')
    const track = await ipcClient.createTimelineTrack({
      project_id: projectId,
      ...data,
    })
    await fetchData()
    return track
  }

  const updateTrack = async (id: number, data: Partial<TimelineTrack>) => {
    const track = await ipcClient.updateTimelineTrack(id, data)
    await fetchData()
    return track
  }

  const deleteTrack = async (id: number) => {
    await ipcClient.deleteTimelineTrack(id)
    await fetchData()
  }

  const getEventsByTimeline = (timelineName: string) => {
    return events.filter((e) => e.timeline_name === timelineName)
  }

  const getTimelines = () => {
    const timelines = new Set(events.map((e) => e.timeline_name))
    return Array.from(timelines).sort()
  }

  return {
    events,
    tracks,
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
    createTrack,
    updateTrack,
    deleteTrack,
    getEventsByTimeline,
    getTimelines,
    refreshData: fetchData,
  }
}