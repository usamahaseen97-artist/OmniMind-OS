package redisclient

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

func New(addr string, password string) *redis.Client {
	return redis.NewClient(&redis.Options{
		Addr:         addr,
		Password:     password,
		PoolSize:     100,
		MinIdleConns: 10,
		ReadTimeout:  200 * time.Millisecond,
		WriteTimeout: 200 * time.Millisecond,
	})
}

func Ping(ctx context.Context, c *redis.Client) error {
	_, err := c.Ping(ctx).Result()
	return err
}
