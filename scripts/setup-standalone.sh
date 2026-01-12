#!/bin/bash

# Next.js standalone 모드를 위한 정적 파일 복사 스크립트

echo "Setting up standalone server..."

if [ ! -d ".next/standalone" ]; then
  echo "Error: .next/standalone directory not found. Please run 'npm run build' first."
  exit 1
fi

echo "Creating .next directory..."
mkdir -p .next/standalone/.next

echo "Copying static files..."
cp -r .next/static .next/standalone/.next/

echo "Copying public files..."
cp -r public .next/standalone/

echo "✅ Standalone server setup complete!"
echo "You can now run: node .next/standalone/server.js"
