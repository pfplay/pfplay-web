const noAbsoluteImportWithoutPrefixRule = require('./no-absolute-import-without-prefix/rule');
const noDirectServiceMethodReferenceRule = require('./no-direct-service-method-reference/rule');

const plugin = {
  rules: {
    'no-direct-service-method-reference': noDirectServiceMethodReferenceRule,
    'no-absolute-import-without-prefix': noAbsoluteImportWithoutPrefixRule,
  },
};

module.exports = plugin;
