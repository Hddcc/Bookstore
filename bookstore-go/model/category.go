package model

type Category struct {
	BaseModel

	Name        string `json:"name" gorm:"not null;unique"`
	Description string `json:"description"`
	Icon        string `json:"icon"`
	Color       string `json:"color"`
	Gradient    string `json:"gradient"`
	Sort        int    `json:"sort" gorm:"default:0"`
	IsActive    bool   `json:"is_active" gorm:"default:true"`
	BookCount   int    `json:"book_count" gorm:"default:0"`
}

func (c *Category) TableName() string {
	return "categories"
}
