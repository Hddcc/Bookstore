package model

type Carousel struct {
	BaseModel

	Title       string `json:"title" gorm:"not null;comment:轮播图标题"`
	Description string `json:"description" gorm:"type:text;comment:轮播图描述"`
	ImageURL    string `json:"image_url" gorm:"not null;comment:轮播图图片URL"`
	LinkURL     string `json:"link_url" gorm:"comment:点击跳转链接"`
	SortOrder   int    `json:"sort_order" gorm:"default:0;comment:排序"`
	IsActive    bool   `json:"is_active" gorm:"default:true;comment:是否激活"`
}

func (c *Carousel) TableName() string {
	return "carousel"
}
