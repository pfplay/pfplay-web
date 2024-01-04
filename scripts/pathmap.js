/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

const isPage = (v) => v === 'page.tsx' || v.includes('page.tsx');

console.log('Start path map generator ');
const PATH_TYPE = './src/components/shared/AppLink/types.ts';
const ROOT_PATH = './src/app/';

const watcher = chokidar.watch('./src/app', {
  /**
   * @see https://stackoverflow.com/a/39149744/17341296
   * 처음 실행 시 전체 파일에 대해서 이벤트 발생 막기
   */
  ignoreInitial: true,
});

watcher
  .on('add', (path) => {
    if (isPage(path)) {
      console.log(`Page ${path} has been added`);
      start();
    }
  })
  .on('unlink', (path) => {
    if (isPage(path)) {
      console.log(`Page ${path} has been removed`);
      start();
    }
  });

function exploreFolder(folderPath, paths) {
  const _paths = paths || [];
  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      exploreFolder(filePath, _paths);
    } else if (stats.isFile() && isPage(file)) {
      const relativePath = '/' + path.relative(ROOT_PATH, filePath);
      const modifiedPath = relativePath.replace(/\/\([^)]*\)/g, '').replace(/\/page\.tsx$/, '');

      _paths.push(modifiedPath || '/');
    }
  }

  return _paths;
}

function renderPathParams(path) {
  const matches = path.match(/\[([^]+?)\]/g);

  if (!matches) {
    return `undefined`;
  }

  return `{${path
    .match(/\[([^]+?)\]/g)
    ?.map((match) => match.replace(/\[|\]/g, ''))
    ?.map((path) => `${path}:string|number`)}}`;
}

function writeFile(paths) {
  const content = `/* eslint-disable prettier/prettier */
  export type PathMap = { 
    ${paths.map((path) => `'${path}':{path:${renderPathParams(path)}}`)}}`;

  fs.writeFileSync(PATH_TYPE, content);
}

function start() {
  const paths = exploreFolder(ROOT_PATH);
  writeFile(paths);
}

start();
