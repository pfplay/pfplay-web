const fs = require('fs');
const path = require('path');
const { transform } = require('@svgr/core');
const { glob } = require('glob');

const rootDir = path.resolve(`${__dirname}/../`);
const svgDir = `${rootDir}/public/icons`;
const componentDir = `${rootDir}/src/components/@shared/@icons`;
const prettierConfig = fs.readFileSync(`${rootDir}/.prettierrc`, { encoding: 'utf-8' });

const utils = {
  generateSvgComponent: (svg, componentName) => {
    return transform.sync(
      svg,
      {
        icon: true,
        typescript: true,
        jsxRuntime: 'automatic',
        prettierConfig: JSON.parse(prettierConfig),
        replaceAttrValues: { '#fff': 'currentColor' },
        plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx', '@svgr/plugin-prettier'],
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
  const svgPaths = glob.sync(`${svgDir}/**/*.svg`);

  try {
    fs.rmSync(componentDir, { force: true, recursive: true });
  } catch {
  } finally {
    for (const groupName of fs.readdirSync(svgDir)) {
      fs.mkdirSync(utils.generateSvgGroupDirPath(groupName), { recursive: true });
    }
  }

  for (const svgPath of svgPaths) {
    const [groupName, fileName] = svgPath.replace(`${svgDir}/`, '').split('/');
    const componentName =
      'PF' + utils.screamingLowerCaseToPascalCase(fileName.replace(/(^icn_|^icon_|.svg$)/g, ''));

    const svg = fs.readFileSync(svgPath, { encoding: 'utf-8' });
    const component = utils.generateSvgComponent(svg, componentName);

    fs.writeFileSync(
      `${utils.generateSvgGroupDirPath(groupName)}/${componentName}.tsx`,
      component,
      {
        encoding: 'utf-8',
      }
    );
  }
};

console.log('🧩 SVG Components is Generating ...');
exec();
console.log('🧩 SVG Components Generated');
