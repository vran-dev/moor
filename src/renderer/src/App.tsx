import React, { useState, useCallback } from 'react'
import { DesktopOutlined, FileOutlined, PieChartOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { Layout, Menu, theme } from 'antd'
import Tiptap from './components/TiptapEditor'
import { ColorFactory } from 'antd/es/color-picker/color'

const { Content, Sider } = Layout

type MenuItem = Required<MenuProps>['items'][number]

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label
  } as MenuItem
}

const items: MenuItem[] = [
  getItem('Inbox', '1', <PieChartOutlined />),
  getItem('Notes', '2', <PieChartOutlined />),
  getItem('Project', '3', <DesktopOutlined />),
  getItem('Area', '4', <FileOutlined />),
  getItem('Resource', '5', <FileOutlined />),
  getItem('Archive', '6', <FileOutlined />)
]

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        style={{ backgroundColor: '#FFF' }}
      >
        <Menu theme="light" defaultSelectedKeys={['1']} mode="inline" items={items} />
      </Sider>
      <Layout>
        <Content style={{ margin: '0 16px', backgroundColor: '#FFFFFF' }}>
          <Tiptap></Tiptap>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
