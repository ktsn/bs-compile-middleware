const path = require('path')
const fs = require('fs')
const browserSync = require('browser-sync').create()
const compileMiddleware = require('../').compileMiddleware

const pug = require('pug')
const buble = require('buble')
const sass = require('node-sass')

const srcPath = path.resolve(__dirname, 'src')

browserSync.init({
  server: {
    baseDir: srcPath
  },
  middleware: compileMiddleware({
    srcDir: srcPath,
    compilers: [
      {
        reqExt: 'html',
        srcExt: 'pug',
        compile: (src, filename) => {
          return pug.render(src, { filename })
        }
      },
      {
        reqExt: 'js',
        srcExt: 'js',
        compile: src => buble.transform(src.toString()).code
      },
      {
        reqExt: 'css',
        srcExt: 'scss',
        compile: (src, filename) => {
          return sass.renderSync({
            data: src.toString(),
            includePaths: [path.dirname(filename)]
          }).css
        }
      }
    ]
  })
})

fs.watch(srcPath, { recursive: true }, () => {
  browserSync.reload()
})
