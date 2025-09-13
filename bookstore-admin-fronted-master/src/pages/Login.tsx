import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Typography,
  Space,
  Divider
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  BookOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';

const { Title, Text } = Typography;

interface LoginForm {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values: LoginForm) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/v1/admin/auth/login', values);
      if (response.data.code === 0) {
        // 保存token和用户信息
        localStorage.setItem('admin_token', response.data.data.token);
        localStorage.setItem('admin_user', JSON.stringify(response.data.data.user));
        
        message.success('登录成功');
        navigate('/');
      } else {
        message.error(response.data.message);
      }
    } catch (error: any) {
      if (error.response) {
        message.error(error.response.data.message || '登录失败');
      } else {
        message.error('网络错误，请检查连接');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card
        style={{
          width: 400,
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          background: 'rgba(255, 255, 255, 0.95)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Space direction="vertical" size="large">
            <BookOutlined style={{ fontSize: 48, color: '#1890ff' }} />
            <div>
              <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                博学书城管理系统
              </Title>
              <Text type="secondary">管理员登录</Text>
            </div>
          </Space>
        </div>

        <Form
          name="login"
          onFinish={handleLogin}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              size="large"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              style={{
                width: '100%',
                borderRadius: 8,
                height: 48,
                fontSize: 16,
                fontWeight: 500
              }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">
            请输入管理员账号和密码
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login; 