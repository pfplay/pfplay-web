module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'src 하위 디렉터리를 prefix없는 절대경로로 import하는 것을 방지합니다.',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          targetPaths: {
            type: 'array',
            items: { type: 'string' },
          },
          requiredPrefix: {
            type: 'string',
          },
        },
        required: ['targetPaths', 'requiredPrefix'],
      },
    ],
  },
  create(context) {
    const { targetPaths, requiredPrefix } = context.options[0] || {};

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;

        // targetPaths에 포함된 디렉터리 경로로 시작하는 경우
        for (const targetPath of targetPaths) {
          if (importPath.startsWith(targetPath)) {
            // prefix가 붙어 있지 않은 경우
            if (!importPath.startsWith(`${requiredPrefix}/`)) {
              context.report({
                node,
                message: `Import path should start with '${requiredPrefix}/'`,
                fix(fixer) {
                  // 잘못된 경로 앞에 prefix 추가
                  const correctedPath = `${requiredPrefix}/${importPath}`;
                  return fixer.replaceText(node.source, `'${correctedPath}'`);
                },
              });
            }
          }
        }
      },
    };
  },
};
