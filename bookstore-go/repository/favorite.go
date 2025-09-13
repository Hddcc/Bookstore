package repository

import (
	"bookstore-manager/global"
	"bookstore-manager/model"

	"gorm.io/gorm"
)

type FavoriteDAO struct {
	db *gorm.DB
}

func NewFavoriteDAO() *FavoriteDAO {
	return &FavoriteDAO{db: global.GetDB()}
}

func (f *FavoriteDAO) AddFavorite(userID, bookID int) error {
	favorite := &model.Favorite{
		UserID: userID,
		BookID: bookID,
	}
	err := f.db.Debug().Create(favorite).Error
	if err != nil {
		return err
	}
	return nil
}

func (f *FavoriteDAO) RemoveFavorite(userID, bookID int) error {

	err := f.db.Debug().Where("user_id = ? AND book_id = ?", userID, bookID).Delete(&model.Favorite{}).Error
	if err != nil {
		return err
	}
	return nil
}

func (f *FavoriteDAO) GetUserFavorite(userID int) ([]*model.Favorite, error) {
	var fav []*model.Favorite
	err := f.db.Debug().Preload("Book").Where("user_id = ?", userID).Find(&fav).Error
	if err != nil {
		return nil, err
	}
	return fav, err
}

func (f *FavoriteDAO) GetUserFavoriteCount(userID int) (int64, error) {
	var count int64
	err := f.db.Model(&model.Favorite{}).Debug().Where("user_id = ?", userID).Count(&count).Error
	if err != nil {
		return 0, err
	}
	return count, nil
}

func (f *FavoriteDAO) CheckFavorite(userID, bookID int) (bool, error) {
	var count int64
	err := f.db.Model(&model.Favorite{}).Debug().Where("user_id = ? AND book_id = ?", userID, bookID).Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}
