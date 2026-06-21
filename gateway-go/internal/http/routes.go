package httproutes

import (
	"io"
	"log"
	"net/http"
	"strings"

	"omnimind/gateway-go/internal/auth"
	"omnimind/gateway-go/internal/ws"
)

type RouteDeps struct {
	CorePythonURL  string
	NodeServiceURL string
	JWTSecret      string
	Hub            *ws.Hub
}

func Register(mux *http.ServeMux, deps RouteDeps) {
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	mux.HandleFunc("/ws/stream-preview", deps.Hub.HandleStreamPreview)

	// Public provider health — no auth (read-only status).
	mux.HandleFunc("/api/v1/providers/status", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		proxyToCore(w, r, deps.CorePythonURL, r.URL.Path, r.URL.RawQuery, nil)
	})

	mux.HandleFunc("/api/v1/providers/", func(w http.ResponseWriter, r *http.Request) {
		if !isPublicProviderPath(r.URL.Path) {
			if _, err := auth.ValidateBearer(r, deps.JWTSecret); err != nil {
				http.Error(w, "unauthorized", http.StatusUnauthorized)
				return
			}
		}
		proxyToCore(w, r, deps.CorePythonURL, r.URL.Path, r.URL.RawQuery, r.Header)
	})

	mux.HandleFunc("/api/v1/terminal/", func(w http.ResponseWriter, r *http.Request) {
		if _, err := auth.ValidateBearer(r, deps.JWTSecret); err != nil {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}
		target := strings.TrimRight(deps.NodeServiceURL, "/") + r.URL.Path
		if r.URL.RawQuery != "" {
			target += "?" + r.URL.RawQuery
		}
		req, err := http.NewRequestWithContext(r.Context(), r.Method, target, r.Body)
		if err != nil {
			http.Error(w, "bad gateway", http.StatusBadGateway)
			return
		}
		req.Header = r.Header.Clone()
		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			log.Printf("gateway node forward error: %v", err)
			http.Error(w, "upstream unavailable", http.StatusBadGateway)
			return
		}
		defer resp.Body.Close()
		for k, vals := range resp.Header {
			for _, v := range vals {
				w.Header().Add(k, v)
			}
		}
		w.WriteHeader(resp.StatusCode)
		_, _ = io.Copy(w, resp.Body)
	})

	// Stateless authenticated reverse-proxy style passthrough to Python core.
	mux.HandleFunc("/api/", func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/api/v1/providers/") {
			return
		}
		if !isPublicAPIPath(r.URL.Path) {
			if _, err := auth.ValidateBearer(r, deps.JWTSecret); err != nil {
				http.Error(w, "unauthorized", http.StatusUnauthorized)
				return
			}
		}
		proxyToCore(w, r, deps.CorePythonURL, r.URL.Path, r.URL.RawQuery, r.Header)
	})
}

func proxyToCore(w http.ResponseWriter, r *http.Request, coreURL, path, rawQuery string, headers http.Header) {
	target := strings.TrimRight(coreURL, "/") + path
	if rawQuery != "" {
		target += "?" + rawQuery
	}
	req, err := http.NewRequestWithContext(r.Context(), r.Method, target, r.Body)
	if err != nil {
		http.Error(w, "bad gateway", http.StatusBadGateway)
		return
	}
	if headers != nil {
		req.Header = headers.Clone()
	} else {
		req.Header = make(http.Header)
	}
	// Preserve free-pipeline toggle from OmniForge UI.
	if v := r.Header.Get("X-OmniForge-Free-Pipeline"); v != "" {
		req.Header.Set("X-OmniForge-Free-Pipeline", v)
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Printf("gateway forward error: %v", err)
		http.Error(w, "upstream unavailable", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()
	for k, vals := range resp.Header {
		for _, v := range vals {
			w.Header().Add(k, v)
		}
	}
	w.WriteHeader(resp.StatusCode)
	_, _ = io.Copy(w, resp.Body)
}

func isPublicProviderPath(path string) bool {
	return path == "/api/v1/providers/status"
}

func isPublicAPIPath(path string) bool {
	switch path {
	case "/api/v1/auth/signup",
		"/api/v1/auth/login",
		"/api/v1/auth/refresh",
		"/api/v1/auth/github/login",
		"/api/v1/auth/github/callback":
		return true
	default:
		return false
	}
}
