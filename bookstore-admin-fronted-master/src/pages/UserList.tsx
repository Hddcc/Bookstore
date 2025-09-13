import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Card,
  Tag,
  Modal,
  message,
  Popconfirm,
  Tooltip,
  Form,
  Switch
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';

const { Search } = Input;
const { Option } = Select;

interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  is_admin: boolean;
  created_at: string;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchUsername, setSearchUsername] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchIsAdmin, setSearchIsAdmin] = useState<string>('');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const navigate = useNavigate();

  // 获取用户列表
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        page_size: pageSize,
        username: searchUsername,
        email: searchEmail,
        is_admin: searchIsAdmin,
      };

      const response = await axios.get('/api/v1/admin/users/list', { params });
      if (response.data.code === 0) {
        setUsers(response.data.data.users);
        setTotal(response.data.data.total);
      }
    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 创建用户
  const handleCreateUser = async (values: any) => {
    try {
      const response = await axios.post('/api/v1/admin/users/create', values);
      if (response.data.code === 0) {
        message.success('创建用户成功');
        setCreateModalVisible(false);
        createForm.resetFields();
        fetchUsers();
      } else {
        message.error(response.data.message);
      }
    } catch (error: any) {
      if (error.response) {
        message.error(error.response.data.message || '创建用户失败');
      } else {
        message.error('网络错误');
      }
    }
  };

  // 更新用户
  const handleUpdateUser = async (values: any) => {
    if (!editingUser) return;

    try {
      const response = await axios.put(`/api/v1/admin/users/${editingUser.id}`, values);
      if (response.data.code === 0) {
        message.success('更新用户成功');
        setEditModalVisible(false);
        setEditingUser(null);
        editForm.resetFields();
        fetchUsers();
      } else {
        message.error(response.data.message);
      }
    } catch (error: any) {
      if (error.response) {
        message.error(error.response.data.message || '更新用户失败');
      } else {
        message.error('网络错误');
      }
    }
  };

  // 删除用户
  const handleDelete = async (id: number) => {
    try {
      const response = await axios.delete(`/api/v1/admin/users/${id}`);
      if (response.data.code === 0) {
        message.success('删除成功');
        fetchUsers();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 更新用户状态
  const handleStatusChange = async (id: number, isAdmin: boolean) => {
    try {
      const response = await axios.put(`/api/v1/admin/users/${id}/status`, { is_admin: isAdmin });
      if (response.data.code === 0) {
        message.success('状态更新成功');
        fetchUsers();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  // 打开编辑模态框
  const handleEdit = (user: User) => {
    setEditingUser(user);
    editForm.setFieldsValue({
      username: user.username,
      email: user.email,
      phone: user.phone,
      is_admin: user.is_admin,
    });
    setEditModalVisible(true);
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize]);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      ellipsis: true,
      render: (username: string) => (
        <Tooltip title={username}>
          <span style={{ fontWeight: 500 }}>{username}</span>
        </Tooltip>
      ),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true,
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
    },
    {
      title: '管理员',
      dataIndex: 'is_admin',
      key: 'is_admin',
      width: 100,
      render: (isAdmin: boolean) => (
        <Tag color={isAdmin ? 'green' : 'default'} style={{ borderRadius: 12 }}>
          {isAdmin ? '是' : '否'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: User) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            style={{ borderRadius: 6 }}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              style={{ borderRadius: 6 }}
            >
              删除
            </Button>
          </Popconfirm>
          <Switch
            checked={record.is_admin}
            onChange={(checked) => handleStatusChange(record.id, checked)}
            size="small"
            style={{ borderRadius: 6 }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="用户管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ borderRadius: 8 }}
            onClick={() => setCreateModalVisible(true)}
          >
            新增用户
          </Button>
        }
      >
        {/* 搜索区域 */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Search
            placeholder="搜索用户名"
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            style={{ width: 200, borderRadius: 6 }}
            onSearch={() => {
              setCurrentPage(1);
              fetchUsers();
            }}
          />
          <Search
            placeholder="搜索邮箱"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            style={{ width: 200, borderRadius: 6 }}
            onSearch={() => {
              setCurrentPage(1);
              fetchUsers();
            }}
          />
          <Select
            placeholder="管理员状态"
            value={searchIsAdmin}
            onChange={setSearchIsAdmin}
            style={{ width: 150, borderRadius: 6 }}
            allowClear
          >
            <Option value="true">管理员</Option>
            <Option value="false">普通用户</Option>
          </Select>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setSearchUsername('');
              setSearchEmail('');
              setSearchIsAdmin('');
              setCurrentPage(1);
              fetchUsers();
            }}
            style={{ borderRadius: 6 }}
          >
            重置
          </Button>
        </div>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 创建用户模态框 */}
      <Modal
        title="新增用户"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          createForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateUser}
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" style={{ borderRadius: 6 }} />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="请输入密码" style={{ borderRadius: 6 }} />
          </Form.Item>
          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入正确的邮箱格式' }
            ]}
          >
            <Input placeholder="请输入邮箱" style={{ borderRadius: 6 }} />
          </Form.Item>
          <Form.Item
            label="电话"
            name="phone"
          >
            <Input placeholder="请输入电话" style={{ borderRadius: 6 }} />
          </Form.Item>
          <Form.Item
            label="管理员权限"
            name="is_admin"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" style={{ borderRadius: 6 }}>
                创建
              </Button>
              <Button onClick={() => {
                setCreateModalVisible(false);
                createForm.resetFields();
              }} style={{ borderRadius: 6 }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑用户模态框 */}
      <Modal
        title="编辑用户"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingUser(null);
          editForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateUser}
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" style={{ borderRadius: 6 }} />
          </Form.Item>
          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入正确的邮箱格式' }
            ]}
          >
            <Input placeholder="请输入邮箱" style={{ borderRadius: 6 }} />
          </Form.Item>
          <Form.Item
            label="电话"
            name="phone"
          >
            <Input placeholder="请输入电话" style={{ borderRadius: 6 }} />
          </Form.Item>
          <Form.Item
            label="管理员权限"
            name="is_admin"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" style={{ borderRadius: 6 }}>
                更新
              </Button>
              <Button onClick={() => {
                setEditModalVisible(false);
                setEditingUser(null);
                editForm.resetFields();
              }} style={{ borderRadius: 6 }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserList; 