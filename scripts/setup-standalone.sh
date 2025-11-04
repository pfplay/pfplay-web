#!/bin/bash

# Next.js standalone 모드를 위한 정적 파일 복사 스크립트

echo "Setting up standalone server..."

# 빌드가 완료되었는지 확인
if [ ! -d ".next/standalone" ]; then
  echo "Error: .next/standalone directory not found. Please run 'npm run build' first."
  exit 1
fi

# 정적 파일들 복사
echo "Copying static files..."
cp -r .next/static .next/standalone/

# public 폴더 복사
echo "Copying public files..."
cp -r public .next/standalone/

# _next 폴더 생성 및 static 폴더 이동
echo "Setting up _next directory structure..."
cd .next/standalone
mkdir -p _next
mv static _next/

echo "✅ Standalone server setup complete!"
echo "You can now run: node .next/standalone/server.js"
