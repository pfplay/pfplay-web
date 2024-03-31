const { execSync } = require('child_process');
const fs = require('fs');
const { glob } = require('glob');

const ROOT = `${__dirname}/../..`;
const BACKEND_DIRNAME = `${__dirname}/api`; // 백엔드의 소스 디렉터리(main/java/com/pfplaybackend/api)를 카피해오세요
const ENUMS_DIRNAME = `${ROOT}/src/api/types`;
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
  const enumRegex = /public enum (?<enumName>\w+)\s*{(?<enumBody>[^}]*)}/g;
  let match;

  while ((match = enumRegex.exec(content)) !== null) {
    const { enumName, enumBody } = match.groups;

    if (exceptionEnumNames.has(enumName)) continue;

    const enumValues = enumBody
      .split(',')
      .reduce((acc, v) => {
        const trimmedValue = v.trim();
        if (!trimmedValue) return acc;

        const additionalDataMatch = trimmedValue.match(/(?<key>\w+)\s*\("(?<value>[^"]+)"\)/);
        const result = additionalDataMatch
          ? `${additionalDataMatch.groups.key} = "${additionalDataMatch.groups.value}"` // "KEY("VALUE")" 형태의 enum 항목을 처리
          : /^\w+$/.test(trimmedValue) // "KEY" 형태의 enum 항목을 처리
          ? `${trimmedValue} = "${trimmedValue}"`
          : trimmedValue; // 그 외의 형태(주로 주석이나 공백)는 그대로 유지

        acc.push(result);
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
