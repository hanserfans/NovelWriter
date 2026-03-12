import { useParams } from 'react-router-dom'
import TimelineView from './TimelineView'

export default function TimelinePage() {
  const { id } = useParams<{ id: string }>()

  if (!id) {
    return <div>项目ID不存在</div>
  }

  return <TimelineView projectId={parseInt(id)} />
}