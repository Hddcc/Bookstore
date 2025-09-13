import React, { useState, useEffect } from 'react';
import { Layout as AntLayout, Menu, theme, Typography, Avatar, Dropdown, Space, message } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  BookOutlined,
  TagsOutlined,
  UserOutlined,
  LogoutOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = AntLayout;
const { Title } = Typography;

const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 检查登录状态
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const userStr = localStorage.getItem('admin_user');
    
    if (!token || !userStr) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      setAdminUser(user);
    } catch (error) {
      message.error('用户信息解析失败');
      navigate('/login');
    }
  }, [navigate]);

  // 处理登出
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    message.success('已退出登录');
    navigate('/login');
  };

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/books',
      icon: <BookOutlined />,
      label: '图书管理',
    },
    {
      key: '/categories',
      icon: <TagsOutlined />,
      label: '分类管理',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: '用户管理',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{
          background: colorBgContainer,
          boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)',
        }}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
            {collapsed ? '📚' : '📚 博学书城管理'}
          </Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <AntLayout>
        <Header style={{ 
          padding: '0 24px', 
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>
              图书商城管理系统
            </Title>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: '#666' }}>
              {adminUser?.username || '管理员'}
            </span>
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
              </Space>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ 
          margin: '24px 16px', 
          padding: 24, 
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
          minHeight: 280,
        }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout; 