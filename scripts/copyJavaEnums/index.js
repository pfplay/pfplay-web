const { execSync } = require('child_process');
const fs = require('fs');

const ROOT = `${__dirname}/../../`;
const JAVA_ENUMS_DIRNAME = `${__dirname}/enums`; // 백엔드 common/enums 디렉터리를 임시로 카피해오세요
const ENUMS_DIRNAME = `${ROOT}/src/api/@types`;
const ENUMS_FILENAME = `${ENUMS_DIRNAME}/@enums.ts`;
const exceptionEnumNames = new Set(['ExceptionEnum']);

main();

function main() {
  const enums = fs.readdirSync(JAVA_ENUMS_DIRNAME).reduce((acc, fileName) => {
    const content = fs.readFileSync(`${JAVA_ENUMS_DIRNAME}/${fileName}`, { encoding: 'utf8' });

    const enumNameRegex = /(?<=public enum )([A-Z]\w+)/;
    const enumName = enumNameRegex.exec(content)[1];

    if (exceptionEnumNames.has(enumName)) {
      return acc;
    }

    const enumFieldsRegex = /(?<enumValue>[A-Z_]+)(?:\("(?<enumLabel>.+)"\)|,)/g;
    const enumFields = [...content.matchAll(enumFieldsRegex)].map((v) => v.groups);

    const enumStr = `
export enum ${enumName} {
${enumFields.map(({ enumValue }) => `${enumValue} = '${enumValue}'`).join(',\n')}
}`.trim();

    acc.push(enumStr);
    return acc;
  }, []);

  mkdir(ENUMS_DIRNAME);

  fs.writeFileSync(ENUMS_FILENAME, enums.join('\n\n'), { encoding: 'utf-8' });

  execSync(`eslint ${ENUMS_FILENAME} --fix --quiet`);

  console.log('🛠️Enums generated.');
}

function mkdir(dirname) {
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}
