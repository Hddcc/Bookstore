import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Card, 
  Modal, 
  Form, 
  Input, 
  Select, 
  InputNumber,
  message,
  Popconfirm,
  Tag
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  TagsOutlined
} from '@ant-design/icons';
import axios from '../utils/axios';

const { Option } = Select;

interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  sort: number;
  is_active: boolean;
  book_count?: number;
}

const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();

  // 获取分类列表
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/v1/admin/categories/list');
      if (response.data.code === 0) {
        setCategories(response.data.data);
      }
    } catch (error) {
      message.error('获取分类列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 创建分类
  const handleCreate = async (values: any) => {
    try {
      const response = await axios.post('/api/v1/admin/categories/create', values);
      if (response.data.code === 0) {
        message.success('创建成功');
        setModalVisible(false);
        form.resetFields();
        fetchCategories();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error('创建失败');
    }
  };

  // 更新分类
  const handleUpdate = async (values: any) => {
    if (!editingCategory) return;
    
    try {
              const response = await axios.put(`/api/v1/admin/categories/${editingCategory.id}`, values);
      if (response.data.code === 0) {
        message.success('更新成功');
        setModalVisible(false);
        setEditingCategory(null);
        form.resetFields();
        fetchCategories();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error('更新失败');
    }
  };

  // 删除分类
  const handleDelete = async (id: number) => {
    try {
      const response = await axios.delete(`/api/v1/admin/categories/${id}`);
      if (response.data.code === 0) {
        message.success('删除成功');
        fetchCategories();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 打开编辑模态框
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
      gradient: category.gradient,
      sort: category.sort,
      is_active: category.is_active,
    });
    setModalVisible(true);
  };

  // 打开创建模态框
  const handleAdd = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const columns = [
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Category) => (
        <Space>
          <span style={{ fontSize: 16 }}>{record.icon}</span>
          <span style={{ fontWeight: 500 }}>{name}</span>
        </Space>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      width: 100,
      render: (color: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 20,
              height: 20,
              backgroundColor: color,
              borderRadius: 4,
            }}
          />
          <span>{color}</span>
        </div>
      ),
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (is_active: boolean) => (
        <Tag color={is_active ? 'green' : 'red'} style={{ borderRadius: 12 }}>
          {is_active ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '图书数量',
      dataIndex: 'book_count',
      key: 'book_count',
      width: 100,
      render: (book_count: number) => (
        <Tag color="blue" style={{ borderRadius: 12 }}>
          {book_count || 0}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: Category) => (
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
            title="确定要删除这个分类吗？"
            description="删除后无法恢复，请谨慎操作"
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
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="分类管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            style={{ borderRadius: 8 }}
          >
            新增分类
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      {/* 分类编辑模态框 */}
      <Modal
        title={editingCategory ? '编辑分类' : '新增分类'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingCategory(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingCategory ? handleUpdate : handleCreate}
          initialValues={{}}
        >
          <Form.Item
            label="分类名称"
            name="name"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input 
              placeholder="请输入分类名称" 
              style={{ borderRadius: 6 }}
            />
          </Form.Item>

          <Form.Item
            label="描述"
            name="description"
          >
            <Input.TextArea
              rows={3}
              placeholder="请输入分类描述"
              style={{ borderRadius: 6 }}
            />
          </Form.Item>

          <Form.Item
            label="图标"
            name="icon"
          >
            <Select
              placeholder="请选择图标"
              style={{ borderRadius: 6 }}
            >
              <Option value="🚀">🚀</Option>
              <Option value="📚">📚</Option>
              <Option value="🧸">🧸</Option>
              <Option value="📖">📖</Option>
              <Option value="💻">💻</Option>
              <Option value="🎨">🎨</Option>
              <Option value="🏃">🏃</Option>
              <Option value="🎵">🎵</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="颜色"
            name="color"
          >
            <Select
              placeholder="请选择颜色"
              style={{ borderRadius: 6 }}
            >
              <Option value="#FF6B6B">红色</Option>
              <Option value="#4ECDC4">青色</Option>
              <Option value="#45B7D1">蓝色</Option>
              <Option value="#96CEB4">绿色</Option>
              <Option value="#FFEAA7">黄色</Option>
              <Option value="#DDA0DD">紫色</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="渐变色"
            name="gradient"
          >
            <Input 
              placeholder="请输入渐变色，如：linear-gradient(135deg, #FF6B6B, #FF8E8E)"
              style={{ borderRadius: 6 }}
            />
          </Form.Item>



          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<TagsOutlined />}
                style={{ borderRadius: 8 }}
              >
                {editingCategory ? '更新' : '创建'}
              </Button>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  setEditingCategory(null);
                  form.resetFields();
                }}
                style={{ borderRadius: 6 }}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryList; 