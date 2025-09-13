import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Button, 
  Space,
  Typography,
  Progress,
  message
} from 'antd';
import { 
  BookOutlined, 
  ShoppingCartOutlined, 
  UserOutlined, 
  DollarOutlined,
  EyeOutlined,
  EditOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';

const { Title } = Typography;

interface DashboardData {
  total_books: number;
  total_orders: number;
  total_users: number;
  total_revenue: number;
  recent_books: any[];
}

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    total_books: 0,
    total_orders: 0,
    total_users: 0,
    total_revenue: 0,
    recent_books: [],
  });
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // 获取仪表盘数据
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/v1/admin/dashboard/stats');
      if (response.data.code === 0) {
        setDashboardData(response.data.data);
      } else {
        message.error('获取仪表盘数据失败');
      }
    } catch (error) {
      console.error('获取仪表盘数据失败:', error);
      message.error('获取仪表盘数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const recentBooksColumns = [
    {
      title: '封面',
      dataIndex: 'cover_url',
      key: 'cover_url',
      width: 60,
      render: (cover_url: string) => (
        <img
          src={cover_url || 'https://via.placeholder.com/40x50/4A90E2/FFFFFF?text=📚'}
          alt="封面"
          style={{ width: 40, height: 50, borderRadius: 4 }}
        />
      ),
    },
    {
      title: '书名',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      ellipsis: true,
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price: number) => `¥${price}`,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            style={{ borderRadius: 6 }}
            onClick={() => navigate(`/books/edit/${record.id}`)}
          >
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        仪表盘
      </Title>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总图书数"
              value={dashboardData.total_books}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总订单数"
              value={dashboardData.total_orders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={dashboardData.total_users}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总收入"
              value={dashboardData.total_revenue}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#cf1322' }}
              suffix="元"
            />
          </Card>
        </Col>
      </Row>

      {/* 内容区域 */}
      <Row gutter={16}>
        <Col span={16}>
          <Card
            title="最近添加的图书"
            extra={
              <Button
                type="primary"
                onClick={() => navigate('/books')}
                style={{ borderRadius: 6 }}
              >
                查看全部
              </Button>
            }
          >
            <Table
              columns={recentBooksColumns}
              dataSource={dashboardData.recent_books}
              rowKey="id"
              pagination={false}
              loading={loading}
              size="small"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="系统信息">
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>图书管理</span>
                <span>100%</span>
              </div>
              <Progress percent={100} status="success" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>分类管理</span>
                <span>100%</span>
              </div>
              <Progress percent={100} status="success" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>用户管理</span>
                <span>100%</span>
              </div>
              <Progress percent={100} status="success" />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 快速操作 */}
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="快速操作">
            <Space size="large">
              <Button
                type="primary"
                size="large"
                icon={<BookOutlined />}
                onClick={() => navigate('/books/create')}
                style={{ borderRadius: 8 }}
              >
                新增图书
              </Button>
              <Button
                size="large"
                icon={<ShoppingCartOutlined />}
                onClick={() => navigate('/books')}
                style={{ borderRadius: 8 }}
              >
                管理图书
              </Button>
              <Button
                size="large"
                icon={<UserOutlined />}
                onClick={() => navigate('/users')}
                style={{ borderRadius: 8 }}
              >
                用户管理
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 