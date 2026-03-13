.PHONY: help install-all build-shared dev-server dev-client dev-client-desktop build-client-desktop typecheck build check-rust

help:
	@echo "Targets:"
	@echo "  make install-all           Install dependencies for shared, server, and client"
	@echo "  make build-shared          Build shared contracts package"
	@echo "  make dev-server            Start authoritative server dev runtime"
	@echo "  make dev-client            Start web client dev runtime"
	@echo "  make dev-client-desktop    Start Tauri desktop client dev runtime"
	@echo "  make build-client-desktop  Build Tauri desktop client artifacts"
	@echo "  make typecheck             Typecheck shared, server, and client"
	@echo "  make build                 Build shared, server, and client"

install-all:
	npm install --prefix packages/shared
	npm install --prefix apps/server
	npm install --prefix apps/client

build-shared:
	npm run build --prefix packages/shared

dev-server: build-shared
	npm run dev --prefix apps/server

dev-client: build-shared
	npm run dev --prefix apps/client

check-rust:
	@command -v cargo >/dev/null 2>&1 || (echo "Rust/Cargo is required for Tauri desktop commands. Install it with: curl https://sh.rustup.rs -sSf | sh" && exit 1)

dev-client-desktop: build-shared check-rust
	npm run tauri:dev --prefix apps/client

build-client-desktop: build-shared check-rust
	npm run tauri:build --prefix apps/client

typecheck: build-shared
	npm run typecheck --prefix apps/server
	npm run typecheck --prefix apps/client
	npm run typecheck --prefix packages/shared

build: build-shared
	npm run build --prefix apps/server
	npm run build --prefix apps/client
