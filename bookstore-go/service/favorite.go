package service

import (
	"bookstore-manager/model"
	"bookstore-manager/repository"
)

type FavoriteService struct {
	favoriteDAO *repository.FavoriteDAO
}

func NewFavoriteService(favoriteDAO *repository.FavoriteDAO) *FavoriteService {
	return &FavoriteService{favoriteDAO: favoriteDAO}
}

func (f *FavoriteService) AddFavorite(userID, bookID int64) error {
	return f.favoriteDAO.AddFavorite(userID, bookID)
}

func (f *FavoriteService) RemoveFavorite(userID, bookID int64) error {
	return f.favoriteDAO.RemoveFavorite(userID, bookID)
}

func (f *FavoriteService) GetUserFavorites(userID int64, page, pageSize int, timeFilter string) ([]*model.Favorite, int64, error) {
	fav, err := f.favoriteDAO.GetUserFavorite(userID)
	if err != nil {
		return nil, 0, err
	}
	total := int64(len(fav))
	start := (page - 1) * pageSize
	end := start + pageSize

	if start >= len(fav) {
		return []*model.Favorite{}, total, nil
	}
	if end >= len(fav) {
		end = len(fav)
	}
	return fav[start:end], total, nil
}

func (f *FavoriteService) GetUserFavoriteCount(userID int64) (int64, error) {
	return f.favoriteDAO.GetUserFavoriteCount(userID)
}

func (f *FavoriteService) IsFavorited(userID, bookID int64) (bool, error) {
	return f.favoriteDAO.CheckFavorite(userID, bookID)
}
