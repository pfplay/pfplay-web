const { execSync } = require('child_process');
const fs = require('fs');
const { glob } = require('glob');

const ROOT = `${__dirname}/../..`;
const BACKEND_DIRNAME = `${__dirname}/api`; // 백엔드의 소스 디렉터리(main/java/com/pfplaybackend/api)를 카피해오세요
const ENUMS_DIRNAME = `${ROOT}/src/shared/api/http/types`;
const ENUMS_FILENAME = `${ENUMS_DIRNAME}/@enums.ts`;
const exceptionEnumNames = new Set(['ExceptionEnum', 'ApiHeader', 'Domain']);

main();

function main() {
  const allBackendFiles = glob.sync(`${BACKEND_DIRNAME}/**/*.java`);

  const enums = allBackendFiles.flatMap((file) => {
    const content = fs.readFileSync(file, { encoding: 'utf-8' });
    return extractEnums(content);
  });

  mkdir(ENUMS_DIRNAME);

  fs.writeFileSync(ENUMS_FILENAME, enums.join('\n\n'), { encoding: 'utf-8' });

  execSync(`eslint ${ENUMS_FILENAME} --fix --quiet`);

  console.log('🛠️Enums generated.');
}

function extractEnums(content) {
  const enums = [];
  const enumRegex = /public enum (?<enumName>\w+)\s*{(?<enumBody>[^;}]*)/g;
  let match;

  while ((match = enumRegex.exec(content)) !== null) {
    const { enumName, enumBody } = match.groups;

    if (exceptionEnumNames.has(enumName)) continue;

    const enumValues = enumBody
      .split(',')
      .reduce((acc, v) => {
        const trimmedValue = v.trim();
        if (!trimmedValue) return acc;

        const match = trimmedValue.match(/(?<key>[A-Z_]+).*/);
        if (!match) return acc;

        acc.push(`${match.groups.key} = "${match.groups.key}"`);
        return acc;
      }, [])
      .join(', ');

    const tsEnum = `export enum ${enumName} { ${enumValues} }`;
    enums.push(tsEnum);
  }

  return enums;
}

function mkdir(dirname) {
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}
