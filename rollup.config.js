import path from 'path'
import ts from 'rollup-plugin-typescript2' //将ts转化为js
import json  from '@rollup/plugin-json'   //将 .json 文件转换为 ES6 模块的 Rollup 插件
import babel from 'rollup-plugin-babel' //降级js
const {terser} = require('rollup-plugin-terser') //压缩

const packagesDir = path.resolve(__dirname,'packages') //packages路径

const  packageDir = path.resolve(packagesDir,process.env.TARGET) //打包的子包路径

const resolve = p => path.resolve(packageDir,p)

const pkg = require(resolve(`package.json`)) //读取子包里面的package.json配置文件

const packageOptions = pkg.buildOptions || {}  //获取子包配置buildOptions配置项

const name = packageOptions.name || path.basename(packageDir)
console.log(name)

// ensure TS checks only once for each build
// 全局记录TS检测状态，完成一次检测后记录状态，防止多次检测，出现错误。
let hasTSChecked = false
// 输出配置选项：打包格式
const outputConfigs = {
    'esm-bundler': {
      file: resolve(`dist/${name}.esm-bundler.js`),
      format: `es`
    },
    'esm-browser': {
      file: resolve(`dist/${name}.esm-browser.js`),
      format: `es`
    },
    cjs: {
      file: resolve(`dist/${name}.cjs.js`),
      format: `cjs`
    },
    global: {
      file: resolve(`dist/${name}.global.js`),
      format: `iife`
    }
  }

  const defaultFormats = ['esm-bundler', 'cjs']
const inlineFormats = process.env.FORMATS && process.env.FORMATS.split(',')
const packageFormats = inlineFormats || packageOptions.formats || defaultFormats
const packageConfigs = []
// process.env.PROD_ONLY
//   ? []
//   : packageFormats.map(format => createConfig(format, outputConfigs[format]))

if (process.env.NODE_ENV === 'production') {
  console.log(packageFormats)
  packageFormats.forEach(format => {
    // if (packageOptions.prod === false) {
    //   return
    // }
    if (format === 'cjs') {
      packageConfigs.push(createProductionConfig(format))
    }
    packageConfigs.push(createMinifiedConfig(format))
    // if (/^(global|esm-browser)(-runtime)?/.test(format)) {
    // }
  })
}

export default packageConfigs

function createConfig(format, output, plugins = []) {
  if (!output) {
    console.log(require('chalk').yellow(`invalid format: "${format}"`))
    process.exit(1)
  }

  const isBundlerESMBuild = /esm-bundler/.test(format)
  const isBrowserESMBuild = /esm-browser/.test(format)
  const isGlobalBuild = /global/.test(format)
  const isCompatPackage = pkg.name === '@libtool/compat'

  output.sourcemap = !!process.env.SOURCE_MAP
  output.externalLiveBindings = false
  console.log(format)
  console.log(isGlobalBuild)
  if (isGlobalBuild) {
    output.name = packageOptions.name
  }

  const shouldEmitDeclarations =
    pkg.types && process.env.TYPES != null && !hasTSChecked

  const tsPlugin = ts({
    check: process.env.NODE_ENV === 'production' && !hasTSChecked,
    tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    cacheRoot: path.resolve(__dirname, 'node_modules/.rts2_cache'),
    tsconfigOverride: {
      compilerOptions: {
        sourceMap: output.sourcemap,
        declaration: false,
        declarationMap: false
      },
      exclude: ['**/__tests__', 'test-dts']
    }
  })
  console.log(isGlobalBuild,'console.log(isGlobalBuild)')
  console.log(path.resolve(__dirname, 'tsconfig.json'),'tsconfig')
  console.log(process.env.NODE_ENV === 'production' && !hasTSChecked,'hasTSChecked')
  console.log(output.sourcemap,'output.sourcemap')
  // we only need to check TS and generate declarations once for each build.
  // it also seems to run into weird issues when checking multiple times
  // during a single build.
  hasTSChecked = true

  let entryFile = /runtime$/.test(format) ? `src/runtime.ts` : `src/index.ts`

  // the compat build needs both default AND named exports. This will cause
  // Rollup to complain for non-ESM targets, so we use separate entries for
  // esm vs. non-esm builds.
  if (isCompatPackage && (isBrowserESMBuild || isBundlerESMBuild)) {
    entryFile = /runtime$/.test(format)
      ? `src/esm-runtime.ts`
      : `src/esm-index.ts`
  }

  let external = []

  if (isGlobalBuild || isBrowserESMBuild || isCompatPackage) {
    if (!packageOptions.enableNonBrowserBranches) {
      // normal browser builds - non-browser only imports are tree-shaken,
      // they are only listed here to suppress warnings.
      external = ['source-map', '@babel/parser', 'estree-walker']
    }
  } else {
    // Node / esm-bundler builds.
    // externalize all direct deps unless it's the compat build.
    external = [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
      ...['path', 'url', 'stream'] // for @vue/compiler-sfc / server-renderer
    ]
  }


  const nodePlugins =
    (format === 'cjs' && Object.keys(pkg.devDependencies || {}).length) ||
    packageOptions.enableNonBrowserBranches
      ? [
          // @ts-ignore
          require('@rollup/plugin-commonjs')({
            sourceMap: false
          }),
          ...(format === 'cjs'
            ? []
            : // @ts-ignore
              [require('rollup-plugin-polyfill-node')()]),
          require('@rollup/plugin-node-resolve').nodeResolve()
        ]
      : []
  // console.log(resolve(entryFile),'input')
  // console.log(output,'output')
  // console.log(external,'external')
  console.log(tsPlugin,'tsPlugin')
  // console.log(nodePlugins,'nodePlugins')
  return {
    input: resolve(entryFile),
    output,
    external,  //指出应将哪些模块视为外部模块，不会与你的库打包在一起。
    plugins: [
      json({
        namedExports: false
      }),
      tsPlugin,
      ...nodePlugins,
      babel({
        exclude: 'node_modules/**' // 只编译我们的源代码
      }),
      terser({
        module: /^esm/.test(format),
        compress: {
          ecma: 2015,
          pure_getters: true
        },
        format: {
          comments: false
        },
        safari10: true
      })
    ],
    onwarn: (msg, warn) => {
      if (!/Circular/.test(msg)) {
        warn(msg)
      }
    }
  }
}

function createProductionConfig(format) {
  return createConfig(format, {
    file: resolve(`dist/${name}.${format}.prod.js`),
    format: outputConfigs[format].format
  })
}

function createMinifiedConfig(format) {
  return createConfig(
    format,
    {
      file: outputConfigs[format].file.replace(/\.js$/, '.prod.js'),
      format: outputConfigs[format].format
    },
    []
  )
}

