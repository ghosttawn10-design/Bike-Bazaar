#!/bin/bash
set -e

echo "Installing dependencies..."
pnpm install

echo "Building frontend..."
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/bike-marketplace build

echo "Copying frontend build to API server..."
mkdir -p artifacts/api-server/frontend
cp -r artifacts/bike-marketplace/dist/public/. artifacts/api-server/frontend/

echo "Building API server..."
pnpm --filter @workspace/api-server build

echo "Build complete!"
