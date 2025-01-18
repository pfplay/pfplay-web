import noDirectServiceMethodReferenceRule from './no-direct-service-method-reference/rule.js';
import noAbsoluteImportWithoutPrefixRule from './no-absolute-import-without-prefix/rule.js';

const plugin = {
  rules: {
    'no-direct-service-method-reference': noDirectServiceMethodReferenceRule,
    'no-absolute-import-without-prefix': noAbsoluteImportWithoutPrefixRule,
  },
};

export default plugin;
