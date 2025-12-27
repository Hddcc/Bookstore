package model

type Favorite struct {
	BaseModel

	UserID int64 `json:"user_id,string"`
	BookID int64 `json:"book_id,string"`

	Book *Book `json:"book,omitempty" gorm:"foreignKey:BookID"`
}

func (f *Favorite) TableName() string {
	return "favorites"
}
