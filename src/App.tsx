import { Layout, Menu } from 'antd'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import {
  FileTextOutlined,
  UserOutlined,
  EnvironmentOutlined,
  BranchesOutlined,
  GlobalOutlined,
  BulbOutlined,
  SettingOutlined,
  RobotOutlined,
} from '@ant-design/icons'
import ProjectList from './pages/ProjectList'
import ProjectDetail from './pages/ProjectDetail'
import AISettings from './pages/AISettings'
import { CharacterList, SceneList, PlotlineList, WorldSettingList } from './components/knowledge'
import TimelinePage from './components/timeline/TimelinePage'

const { Sider, Content } = Layout

function App() {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { key: '/projects', icon: <FileTextOutlined />, label: '项目管理' },
    { key: '/settings', icon: <SettingOutlined />, label: '设置' },
  ]

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider
        width={200}
        style={{
          background: '#001529',
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            height: 64,
            margin: 16,
            color: 'white',
            fontSize: 20,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          NovelWriter
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout style={{ marginLeft: 200 }}>
        <Content style={{ margin: 24, overflow: 'initial' }}>
          <Routes>
            <Route path="/" element={<ProjectList />} />
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/projects/:id/characters" element={<CharacterList />} />
            <Route path="/projects/:id/scenes" element={<SceneList />} />
            <Route path="/projects/:id/plotlines" element={<PlotlineList />} />
            <Route path="/projects/:id/world" element={<WorldSettingList />} />
            <Route path="/projects/:id/timeline" element={<TimelinePage />} />
            <Route path="/scenes" element={<div>请先选择一个项目</div>} />
            <Route path="/plotlines" element={<div>情节线（开发中）</div>} />
            <Route path="/world" element={<div>世界观（开发中）</div>} />
            <Route path="/notes" element={<div>笔记素材（开发中）</div>} />
            <Route path="/ai" element={<div>AI助手（开发中）</div>} />
            <Route path="/settings" element={<AISettings />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App