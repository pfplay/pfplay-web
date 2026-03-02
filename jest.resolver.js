/**
 * Custom Jest resolver that handles package.json "exports" field for MSW v2.
 *
 * jsdom testEnvironment sets browser:true which resolves to ESM browser bundles.
 * MSW and @mswjs/interceptors ship ESM (.mjs) browser bundles that Jest cannot parse.
 * This resolver forces node/CJS resolution for those packages.
 */
const path = require('path');
const { resolve: resolveExports } = require('resolve.exports');

const PACKAGES_NEEDING_EXPORTS = ['msw', '@mswjs/interceptors'];

function needsExportsResolution(modulePath) {
  return PACKAGES_NEEDING_EXPORTS.some(
    (pkg) => modulePath === pkg || modulePath.startsWith(pkg + '/')
  );
}

function resolveViaExports(modulePath, options) {
  const segments = modulePath.split('/');
  let pkgName, subpath;

  if (modulePath.startsWith('@')) {
    pkgName = segments.slice(0, 2).join('/');
    subpath = segments.slice(2).join('/');
  } else {
    pkgName = segments[0];
    subpath = segments.slice(1).join('/');
  }

  const entry = subpath ? `./${subpath}` : '.';

  // Find package.json
  const pkgDir = path.join(options.rootDir || process.cwd(), 'node_modules', pkgName);
  const pkgJson = require(path.join(pkgDir, 'package.json'));

  if (!pkgJson.exports) return null;

  // Force node + require conditions (CJS)
  const resolved = resolveExports(pkgJson, entry, {
    conditions: ['node', 'require', 'default'],
    require: true,
  });

  if (resolved && resolved[0]) {
    return path.join(pkgDir, resolved[0]);
  }

  return null;
}

module.exports = (modulePath, options) => {
  if (needsExportsResolution(modulePath)) {
    try {
      const resolved = resolveViaExports(modulePath, options);
      if (resolved) return resolved;
    } catch {
      // fall through to default
    }
  }

  return options.defaultResolver(modulePath, options);
};
