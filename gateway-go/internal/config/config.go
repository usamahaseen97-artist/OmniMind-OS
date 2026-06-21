package config

import "os"

type Config struct {
	Port               string
	CorePythonURL      string
	NodeServiceURL     string
	RedisAddr          string
	RedisPassword      string
	JWTSecret          string
	GRPCCorePythonAddr string
}

func Load() Config {
	return Config{
		Port:               getenv("GATEWAY_PORT", "8080"),
		CorePythonURL:      getenv("CORE_PYTHON_URL", "http://127.0.0.1:8001"),
		NodeServiceURL:     getenv("NODE_SERVICE_URL", "http://127.0.0.1:8090"),
		RedisAddr:          getenv("REDIS_ADDR", "127.0.0.1:6379"),
		RedisPassword:      os.Getenv("REDIS_PASSWORD"),
		JWTSecret:          getenv("JWT_SECRET_KEY", "change-me"),
		GRPCCorePythonAddr: getenv("CORE_PYTHON_GRPC_ADDR", "127.0.0.1:50051"),
	}
}

func getenv(k string, fallback string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return fallback
}
