import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Select, 
  InputNumber, 
  Upload, 
  message, 
  Space,
  Row,
  Col,
  Divider
} from 'antd';
import { 
  SaveOutlined, 
  ArrowLeftOutlined, 
  UploadOutlined,
  BookOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../utils/axios';

const { TextArea } = Input;
const { Option } = Select;

interface BookFormData {
  title: string;
  author: string;
  price: number;
  discount: number;
  type: string;
  stock: number;
  cover_url: string;
  description: string;
  isbn: string;
  publisher: string;
  publish_date: string;
  pages: number;
  language: string;
  format: string;
  category_id: number;
  sale: number;
}

const BookEdit: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [bookData, setBookData] = useState<BookFormData | null>(null);

  // 获取分类列表
  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/v1/admin/categories/list');
      if (response.data.code === 0) {
        setCategories(response.data.data);
      }
    } catch (error) {
      message.error('获取分类失败');
    }
  };

  // 获取图书详情
  const fetchBookDetail = async () => {
    if (!isEdit) return;
    
    setLoading(true);
    try {
              const response = await axios.get(`/api/v1/admin/books/${id}`);
      if (response.data.code === 0) {
        const book = response.data.data;
        setBookData({
          title: book.title,
          author: book.author,
          price: book.price,
          discount: book.discount,
          type: book.type,
          stock: book.stock,
          cover_url: book.cover_url,
          description: book.description,
          isbn: book.isbn,
          publisher: book.publisher,
          publish_date: book.publish_date,
          pages: book.pages,
          language: book.language,
          format: book.format,
          category_id: book.category_id,
          sale: book.sale,
        });
        form.setFieldsValue({
          title: book.title,
          author: book.author,
          price: book.price, // 已经是元单位
          discount: book.discount,
          type: book.type,
          stock: book.stock,
          cover_url: book.cover_url,
          description: book.description,
          isbn: book.isbn,
          publisher: book.publisher,
          publish_date: book.publish_date,
          pages: book.pages,
          language: book.language,
          format: book.format,
          category_id: book.category_id,
          sale: book.sale,
          // 注意：不设置 status 字段，避免意外修改状态
        });
      }
    } catch (error) {
      message.error('获取图书详情失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchBookDetail();
    }
  }, [id]);

  // 提交表单
  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      console.log('DEBUG: Form values:', values);
      const submitData = {
        ...values,
        price: Math.floor(values.price), // 存储为整数（元）
        category_id: values.category_id || 1, // 默认分类ID为1
        type: values.type || '文学', // 默认图书类型
      };
      console.log('DEBUG: Submit data:', submitData);

      // 编辑时排除状态字段，避免意外修改状态
      if (isEdit) {
        const { status, ...editData } = submitData;
        console.log('DEBUG: Edit data (excluding status):', editData);
        const response = await axios.put(`/api/v1/admin/books/${id}`, editData);
        if (response.data.code === 0) {
          message.success('更新成功');
          navigate('/books');
        } else {
          message.error(response.data.message);
        }
      } else {
        console.log('DEBUG: Create data:', submitData);
        const response = await axios.post('/api/v1/admin/books/create', submitData);
        if (response.data.code === 0) {
          message.success('创建成功');
          navigate('/books');
        } else {
          message.error(response.data.message);
        }
      }
    } catch (error) {
      console.error('DEBUG: Submit error:', error);
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card
        title={
          <Space>
            <BookOutlined />
            {isEdit ? '编辑图书' : '新增图书'}
          </Space>
        }
        extra={
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/books')}
            style={{ borderRadius: 6 }}
          >
            返回
          </Button>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            discount: 100,
            stock: 0,
            language: '中文',
            format: '平装',
            type: '文学', // 添加默认的图书类型
          }}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="书名"
                name="title"
                rules={[{ required: true, message: '请输入书名' }]}
              >
                <Input 
                  placeholder="请输入书名" 
                  style={{ borderRadius: 6 }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="作者"
                name="author"
                rules={[{ required: true, message: '请输入作者' }]}
              >
                <Input 
                  placeholder="请输入作者" 
                  style={{ borderRadius: 6 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                label="价格 (元)"
                name="price"
                rules={[{ required: true, message: '请输入价格' }]}
              >
                <InputNumber
                  placeholder="请输入价格"
                  min={0}
                  precision={2}
                  style={{ width: '100%', borderRadius: 6 }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="库存"
                name="stock"
                rules={[{ required: true, message: '请输入库存' }]}
              >
                <InputNumber
                  placeholder="请输入库存"
                  min={0}
                  style={{ width: '100%', borderRadius: 6 }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="销售量"
                name="sale"
                rules={[{ required: true, message: '请输入销售量' }]}
              >
                <InputNumber
                  placeholder="请输入销售量"
                  min={0}
                  style={{ width: '100%', borderRadius: 6 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                label="折扣 (%)"
                name="discount"
                rules={[{ required: true, message: '请输入折扣' }]}
              >
                <InputNumber
                  placeholder="请输入折扣"
                  min={0}
                  max={100}
                  style={{ width: '100%', borderRadius: 6 }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="分类"
                name="category_id"
                rules={[{ required: true, message: '请选择分类' }]}
              >
                <Select
                  placeholder="请选择分类"
                  style={{ borderRadius: 6 }}
                >
                  {categories.map(category => (
                    <Option key={category.id} value={category.id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="图书类型"
                name="type"
                rules={[{ required: true, message: '请选择图书类型' }]}
              >
                <Select
                  placeholder="请选择图书类型"
                  style={{ borderRadius: 6 }}
                >
                  <Option value="文学">文学</Option>
                  <Option value="科技">科技</Option>
                  <Option value="历史">历史</Option>
                  <Option value="艺术">艺术</Option>
                  <Option value="教育">教育</Option>
                  <Option value="儿童">儿童</Option>
                  <Option value="其他">其他</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="ISBN"
                name="isbn"
              >
                <Input 
                  placeholder="请输入ISBN" 
                  style={{ borderRadius: 6 }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="出版社"
                name="publisher"
              >
                <Input 
                  placeholder="请输入出版社" 
                  style={{ borderRadius: 6 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="出版日期"
                name="publish_date"
              >
                <Input 
                  placeholder="请输入出版日期" 
                  style={{ borderRadius: 6 }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="页数"
                name="pages"
              >
                <InputNumber
                  placeholder="请输入页数"
                  min={1}
                  style={{ width: '100%', borderRadius: 6 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                label="语言"
                name="language"
              >
                <Select
                  placeholder="请选择语言"
                  style={{ borderRadius: 6 }}
                >
                  <Option value="中文">中文</Option>
                  <Option value="英文">英文</Option>
                  <Option value="日文">日文</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="装帧"
                name="format"
              >
                <Select
                  placeholder="请选择装帧"
                  style={{ borderRadius: 6 }}
                >
                  <Option value="平装">平装</Option>
                  <Option value="精装">精装</Option>
                  <Option value="电子书">电子书</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="封面图片URL"
            name="cover_url"
          >
            <Input 
              placeholder="请输入封面图片URL" 
              style={{ borderRadius: 6 }}
            />
          </Form.Item>

          <Form.Item
            label="图书描述"
            name="description"
          >
            <TextArea
              rows={4}
              placeholder="请输入图书描述"
              style={{ borderRadius: 6 }}
            />
          </Form.Item>

          <Divider />

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
                style={{ borderRadius: 8 }}
              >
                {isEdit ? '更新' : '创建'}
              </Button>
              <Button
                onClick={() => navigate('/books')}
                style={{ borderRadius: 6 }}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default BookEdit; 