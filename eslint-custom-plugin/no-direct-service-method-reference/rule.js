module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'API service 클래스 prototype 메서드를 직접 참조함으로써 this 참조를 깨지게 하는 행위를 방지합니다.',
    },
    messages: {
      invalidDirectReference:
        "API service 클래스의 메서드는 prototype 메서드입니다. 직접 참조하지 마세요. 람다(화살표 함수)를 사용하여 'this' 컨텍스트를 유지하세요, e.g., `() => service.method()`.",
    },
    fixable: 'code',
    schema: [],
  },
  create(context) {
    const API_SERVICES_IMPORT_PATH = '@/shared/api/http/services';
    const importedServices = new Set();

    // react-query의 fn들을 정의한 곳에 대해서만 검사 (약식)
    const REACT_QUERY_FN_KEYS = {
      QUERY_FN: 'queryFn',
      MUTATION_FN: 'mutationFn',
    };
    const directReferencePattern = new RegExp(
      `(?:${Object.values(REACT_QUERY_FN_KEYS).join('|')}):\\s*\\w+\\.\\w+\\s*,?$`
    );

    return {
      // 임포트된 서비스들을 추적
      ImportDeclaration(node) {
        if (node.source.value === API_SERVICES_IMPORT_PATH) {
          node.specifiers.forEach((specifier) => {
            if (specifier.type === 'ImportSpecifier') {
              importedServices.add(specifier.local.name);
            }
          });
        }
      },

      // 객체 리터럴의 속성을 검사
      Property(node) {
        // queryFn 또는 mutationFn 속성인지 확인
        if (!Object.values(REACT_QUERY_FN_KEYS).includes(node.key.name)) {
          return;
        }

        // MemberExpression인지 확인 (ex - fooService.fooMethod)
        if (node.value.type !== 'MemberExpression') {
          return;
        }

        // 임포트된 서비스인지 확인
        const objectName = node.value.object.name;
        if (!importedServices.has(objectName)) {
          return;
        }

        // 메서드가 직접 참조되었는지 확인
        const sourceCode = context.getSourceCode();
        const propertyText = sourceCode.getText(node);
        const isDirectReference = directReferencePattern.test(propertyText);
        if (!isDirectReference) {
          return;
        }

        context.report({
          node,
          messageId: 'invalidDirectReference',

          // 자동 수정 제안
          fix(fixer) {
            const methodCall = sourceCode.getText(node.value);

            if (node.key.name === REACT_QUERY_FN_KEYS.QUERY_FN) {
              return fixer.replaceText(node.value, `() => ${methodCall}()`);
            } else if (node.key.name === REACT_QUERY_FN_KEYS.MUTATION_FN) {
              return fixer.replaceText(node.value, `(request) => ${methodCall}(request)`); // request가 void일 경우 타입 에러가 나지만, 그런 케이스는 적으므로 무시
            }
          },
        });
      },
    };
  },
};
