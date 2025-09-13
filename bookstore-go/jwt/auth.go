package jwt

import (
	"bookstore-manager/global"
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// jwtSecret JWT密钥（建议通过配置文件或环境变量设置）
var jwtSecret = []byte("bookstore_secret_key")

const (
	//AccessTokenExpire 访问token过期时间
	AccessTokenExpire = 2 * time.Hour
	//RefreshTokenExpire 刷新token过期时间
	RefreshTokenExpire = 7 * 24 * time.Hour
)

// Claims JWT声明结构体
type Claims struct {
	UserID    uint   `json:"user_id"`    //用户id
	Username  string `json:"username"`   //用户名
	TokenType string `json:"token_type"` //token类型："access"或"refresh"
	jwt.RegisteredClaims
}

// TokenResponse token响应结构体
type TokenResponse struct {
	AccessToken  string `json:"access_token"`  //访问token
	RefreshToken string `json:"refresh_token"` //刷新token
	ExpiresIn    int64  `json:"expires_in"`    //过期时间(秒)
}

// GenerateTokenPair 生成访问token和刷新token
func GenerateTokenPair(userID uint, username string) (*TokenResponse, error) {
	//生成访问token
	accessClaims := Claims{
		UserID:    userID,
		Username:  username,
		TokenType: "access",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(AccessTokenExpire)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessTokenString, err := accessToken.SignedString(jwtSecret)
	if err != nil {
		return nil, err
	}

	//生成刷新token
	refreshClaims := Claims{
		UserID:    userID,
		Username:  username,
		TokenType: "refresh",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(AccessTokenExpire)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshTokenString, err := refreshToken.SignedString(jwtSecret)
	if err != nil {
		return nil, err
	}

	//将token存储到Redis
	if err := StoreTokenInRedis(userID, accessTokenString, refreshTokenString); err != nil {
		return nil, err
	}
	return &TokenResponse{
		AccessToken:  accessTokenString,
		RefreshToken: refreshTokenString,
		ExpiresIn:    int64(AccessTokenExpire.Seconds()),
	}, nil

}

func StoreTokenInRedis(userID uint, accessToken, refreshToken string) error {
	ctx := context.Background()
	userKey := fmt.Sprintf("user_tokens:%d", userID)

	//使用hash存储用户的token信息
	err := global.RedisClient.HMSet(ctx, userKey,
		"access_token", accessToken,
		"refresh_token", refreshToken,
		"created_at", time.Now().Unix(),
	).Err()
	if err != nil {
		return err
	}

	//设置过期时间为刷新token的过期时间
	return global.RedisClient.Expire(ctx, userKey, RefreshTokenExpire).Err()
}

// IsTokenValidInRedis 检查token是否在Redis中有效
func IsTokenValidInRedis(userID uint, token string, tokenType string) bool {
	ctx := context.Background()
	userKey := fmt.Sprintf("user_tokens:%d", userID)

	var redisToken string
	var err error

	if tokenType == "access" {
		redisToken, err = global.RedisClient.HGet(ctx, userKey, "access_token").Result()
	} else {
		redisToken, err = global.RedisClient.HGet(ctx, userKey, "refresh_token").Result()
	}

	if err != nil {
		return false
	}
	return redisToken == token
}

// 解析和校验JWT Token
func ParseToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})
	if err != nil {
		return nil, err
	}
	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		//检查token是否在Redis中被撤销
		if !IsTokenValidInRedis(claims.UserID, tokenString, claims.TokenType) {
			return nil, errors.New("token已被撤销")
		}
		return claims, nil
	}
	return nil, errors.New("invalid token")
}

//撤销用户的所有token
func RevokeToken(userID uint)error{
	ctx:=context.Background()
	userKey:=fmt.Sprintf("user_tokens:%d",userID)
	return global.RedisClient.Del(ctx,userKey).Err()
}