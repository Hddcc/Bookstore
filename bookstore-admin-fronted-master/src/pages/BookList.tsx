import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Input, 
  Select, 
  Card, 
  Tag, 
  Image, 
  Modal, 
  message,
  Popconfirm,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';

const { Search } = Input;
const { Option } = Select;

interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  discount: number;
  type: string;
  stock: number;
  sale: number;
  cover_url: string;
  status: number;
  category?: {
    name: string;
  };
  created_at: string;
}

const BookList: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchAuthor, setSearchAuthor] = useState('');
  const [searchType, setSearchType] = useState('');
  const [searchStatus, setSearchStatus] = useState<number | undefined>(undefined);
  const [categories, setCategories] = useState<any[]>([]);
  
  const navigate = useNavigate();

  // 获取图书列表
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        page_size: pageSize,
        title: searchTitle,
        author: searchAuthor,
        type: searchType,
        status: searchStatus,
      };

      const response = await axios.get('/api/v1/admin/books/list', { params });
      if (response.data.code === 0) {
        setBooks(response.data.data.books);
        setTotal(response.data.data.total);
      }
    } catch (error) {
      message.error('获取图书列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取分类列表
  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/v1/admin/categories/list');
      if (response.data.code === 0) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };

  // 删除图书
  const handleDelete = async (id: number) => {
    try {
      const response = await axios.delete(`/api/v1/admin/books/${id}`);
      if (response.data.code === 0) {
        message.success('删除成功');
        fetchBooks();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 更新图书状态
  const handleStatusChange = async (id: number, status: number) => {
    try {
      const response = await axios.put(`/api/v1/admin/books/${id}/status?status=${status}`);
      if (response.data.code === 0) {
        message.success('状态更新成功');
        fetchBooks();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, [currentPage, pageSize]);

  const columns = [
    {
      title: '封面',
      dataIndex: 'cover_url',
      key: 'cover_url',
      width: 80,
      render: (cover_url: string) => (
        <Image
          width={60}
          height={80}
          src={cover_url || 'https://via.placeholder.com/60x80/4A90E2/FFFFFF?text=📚'}
          fallback="https://via.placeholder.com/60x80/4A90E2/FFFFFF?text=📚"
          style={{ borderRadius: 8 }}
        />
      ),
    },
    {
      title: '书名',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (title: string) => (
        <Tooltip title={title}>
          <span style={{ fontWeight: 500 }}>{title}</span>
        </Tooltip>
      ),
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
      render: (price: number, record: Book) => {
        const originalPrice = price; // 已经是元单位
        const discountedPrice = Math.floor(originalPrice * (100 - record.discount) / 100); // 计算折扣价
        return (
          <div>
            <div style={{ color: '#ff4d4f', fontWeight: 500 }}>
              ¥{discountedPrice}
            </div>
            {record.discount > 0 && (
              <div style={{ fontSize: 12, color: '#999', textDecoration: 'line-through' }}>
                ¥{originalPrice}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: '分类',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <Tag color="blue" style={{ borderRadius: 12 }}>
          {type}
        </Tag>
      ),
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      width: 80,
      render: (stock: number) => (
        <Tag color={stock > 0 ? 'green' : 'red'} style={{ borderRadius: 12 }}>
          {stock}
        </Tag>
      ),
    },
    {
      title: '销售量',
      dataIndex: 'sale',
      key: 'sale',
      width: 100,
      render: (sale: number) => (
        <Tag color="blue" style={{ borderRadius: 12 }}>
          {sale}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'red'} style={{ borderRadius: 12 }}>
          {status === 1 ? '上架' : '下架'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Book) => (
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
          <Button
            size="small"
            icon={<EyeOutlined />}
            style={{ borderRadius: 6 }}
            onClick={() => navigate(`/books/edit/${record.id}`)}
          >
            查看
          </Button>
          <Popconfirm
            title="确定要删除这本书吗？"
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
          <Button
            type={record.status === 1 ? 'default' : 'primary'}
            size="small"
            style={{ borderRadius: 6 }}
            onClick={() => handleStatusChange(record.id, record.status === 1 ? 0 : 1)}
          >
            {record.status === 1 ? '下架' : '上架'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="图书管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ borderRadius: 8 }}
            onClick={() => navigate('/books/create')}
          >
            新增图书
          </Button>
        }
      >
        {/* 搜索区域 */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Search
            placeholder="搜索书名"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            style={{ width: 200, borderRadius: 6 }}
            onSearch={() => {
              setCurrentPage(1);
              fetchBooks();
            }}
          />
          <Search
            placeholder="搜索作者"
            value={searchAuthor}
            onChange={(e) => setSearchAuthor(e.target.value)}
            style={{ width: 200, borderRadius: 6 }}
            onSearch={() => {
              setCurrentPage(1);
              fetchBooks();
            }}
          />
          <Select
            placeholder="选择分类"
            value={searchType}
            onChange={setSearchType}
            style={{ width: 150, borderRadius: 6 }}
            allowClear
          >
            {categories.map(cat => (
              <Option key={cat.name} value={cat.name}>{cat.name}</Option>
            ))}
          </Select>
          <Select
            placeholder="选择状态"
            value={searchStatus}
            onChange={setSearchStatus}
            style={{ width: 120, borderRadius: 6 }}
            allowClear
          >
            <Option value={1}>上架</Option>
            <Option value={0}>下架</Option>
          </Select>
                      <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setSearchTitle('');
                setSearchAuthor('');
                setSearchType('');
                setSearchStatus(undefined);
                setCurrentPage(1);
                fetchBooks();
              }}
              style={{ borderRadius: 6 }}
            >
              重置
            </Button>
        </div>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={books}
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
    </div>
  );
};

export default BookList; 