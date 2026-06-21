package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"omnimind/gateway-go/internal/config"
	httproutes "omnimind/gateway-go/internal/http"
	redisclient "omnimind/gateway-go/internal/redis"
	"omnimind/gateway-go/internal/ws"
)

func main() {
	cfg := config.Load()
	hub := ws.NewHub()
	mux := http.NewServeMux()

	rdb := redisclient.New(cfg.RedisAddr, cfg.RedisPassword)
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	if err := redisclient.Ping(ctx, rdb); err != nil {
		log.Printf("redis not available (fallback mode): %v", err)
	}

	httproutes.Register(mux, httproutes.RouteDeps{
		CorePythonURL: cfg.CorePythonURL,
		NodeServiceURL: cfg.NodeServiceURL,
		JWTSecret:     cfg.JWTSecret,
		Hub:           hub,
	})

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           mux,
		ReadHeaderTimeout: 3 * time.Second,
	}

	log.Printf("gateway-go listening on :%s", cfg.Port)
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}
}
