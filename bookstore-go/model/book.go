package model

type Book struct {
	BaseModel

	Title       string `json:"title"`
	Author      string `json:"author"`
	Price       int    `json:"price"`
	Discount    int    `json:"discount"`
	Type        string `json:"type"`
	Stock       int    `json:"stock"`
	Status      int    `json:"status"`
	Description string `json:"description"`
	CoverURL    string `json:"cover_url"`
	ISBN        string `json:"isbn"`
	Publisher   string `json:"publisher"`
	Pages       int    `json:"pages"`
	Language    string `json:"language"`
	Format      string `json:"format"`
	CategoryID  int64  `json:"category_id,string"`
	Sale        int    `json:"sale"`
}

func (b *Book) TableName() string {
	return "books"
}
