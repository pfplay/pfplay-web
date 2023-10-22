const fs = require('fs');
const path = require('path');
const { transform } = require('@svgr/core');
const { glob } = require('glob');

const rootDir = path.resolve(`${__dirname}/../`);
const svgDir = `${rootDir}/public/icons`;
const componentDir = `${rootDir}/src/components/shared/icons`;
const prettierConfig = fs.readFileSync(`${rootDir}/.prettierrc`, { encoding: 'utf-8' });

const utils = {
  generateSvgComponent: (svg, componentName) => {
    return transform.sync(
      svg,
      {
        typescript: true,
        jsxRuntime: 'automatic',
        prettierConfig: JSON.parse(prettierConfig),
        replaceAttrValues: {
          '#fff': 'currentColor',
          '#ffffff': 'currentColor',
        },
        plugins: ['@svgr/plugin-jsx', '@svgr/plugin-prettier'],
      },
      { componentName }
    );
  },
  generateSvgGroupDirPath: (groupName) => {
    return `${componentDir}/${utils.pascalCaseToCamelCase(groupName)}`;
  },
  pascalCaseToCamelCase: (str) => {
    return str[0].toLowerCase() + str.substring(1);
  },
  screamingLowerCaseToPascalCase: (str) => {
    return str[0].toUpperCase() + str.substring(1).replace(/_[a-z]/g, ($1) => $1[1].toUpperCase());
  },
};

const exec = () => {
  const indexFilePath = `${componentDir}/index.tsx`;

  try {
    fs.rmSync(componentDir, { force: true, recursive: true });
  } catch {
  } finally {
    for (const groupName of fs.readdirSync(svgDir)) {
      fs.mkdirSync(utils.generateSvgGroupDirPath(groupName), { recursive: true });
    }
    fs.writeFileSync(indexFilePath, '');
  }

  const svgPaths = glob.sync(`${svgDir}/**/*.svg`);

  for (const svgPath of svgPaths) {
    const [groupName, fileName] = svgPath.replace(`${svgDir}/`, '').split('/');
    const componentName =
      'PF' + utils.screamingLowerCaseToPascalCase(fileName.replace(/(^icn_|^icon_|.svg$)/g, ''));

    const svg = fs.readFileSync(svgPath, { encoding: 'utf-8' });
    const component = utils.generateSvgComponent(svg, componentName);
    const svgGroupDirPath = utils.generateSvgGroupDirPath(groupName);

    const componentFilePath = `${svgGroupDirPath}/${componentName}.tsx`;
    const exportPhrase = `export { default as ${componentName} } from './${utils.pascalCaseToCamelCase(
      groupName
    )}/${componentName}';`;

    fs.writeFileSync(componentFilePath, component, { encoding: 'utf-8' });
    fs.appendFileSync(indexFilePath, `${exportPhrase}\n`, { encoding: 'utf-8' });
  }
};

console.log('🧩 SVG Components is Generating ...');
exec();
console.log('🧩 SVG Components Generated');
