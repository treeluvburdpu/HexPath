#!/usr/bin/env bash
.PHONY: help
help: ## Display this help screen
	@echo "Available commands:"
	@awk 'BEGIN {FS = ":.*?## "}; /^[a-zA-Z_-]+:.*?## / {printf "  \033[32m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# ==============================================================================
# Application Tasks
# ==============================================================================

install: ## Install dependencies
	npm install

dev: ## Run the development server
	npm run dev

build: ## Build the application
	npm run build

preview: ## Preview the production build
	npm run preview

test: ## Run unit tests
	npm run test

test-ui: ## Run unit tests with UI
	npm run test:ui

test-e2e: ## Run end-to-end tests (non-interactive)
	CI=true npm run test:e2e -- --reporter=line

deploy: ## Deploy to GitHub Pages
	@echo "Deploying to GitHub Pages..."
	npm run build
	# We will add actual deployment logic later in the CI/CD task
