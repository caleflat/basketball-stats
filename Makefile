UV := $(HOME)/.local/bin/uv

.PHONY: dev dev-api dev-web lint format check install

dev:
	$(MAKE) dev-api &
	$(MAKE) dev-web

## Start both API and web servers (run in separate terminals)
dev-api:
	cd backend && $(UV) run uvicorn app.main:app --reload --port 8000

dev-web:
	cd frontend && npm run dev

## Install all dependencies
install:
	$(UV) sync --project backend
	cd frontend && npm install

## Format backend code
format:
	cd backend && $(UV) run ruff format .

## Lint backend code
lint:
	cd backend && $(UV) run ruff check .

## Format + lint (run before committing)
check: format lint


## Clear the cache and build artifacts
clean:
	cd backend && $(UV) cache clear
	cd backend && rm -rf .cache
	cd frontend && rm -rf node_modules dist
	