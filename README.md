# bs-compile-middleware

Compilation middleware for Browsersync

## Installation

```bash
npm install --save-dev bs-compile-middleware
```

## Usage

In case of the following configuration, if you request to `http://localhost:3000/index.html`, bs-compile-middleware get `path/to/src/index.pug` and compile it. Finally, the compiled html is returned from the Browsersync server.


```js
const browserSync = require('browser-sync').create()
const compileMiddleware = require('bs-compile-middleware').compileMiddleware

// any preprocessor you want to use
const pug = require('pug')

browserSync({
  middleware: compileMiddleware({
    srcDir: 'path/to/src',
    compilers: [
      {
        // a requested extention you want to hook some compilations
        reqExt: 'html',

        // source file extention
        srcExt: 'pug',

        // you can compile a requested source file in compile hook
        // It expects compiled data as return value
        // src - Buffer of the source file
        // filename - file name of the source
        compile: (src, filename) => {
          // example compiling pug
          return pug.render(src.toString(), { filename })
        }
      }
    ]
  })
})
```

## Contribution

Feel free to open issues and pull requests if you find any bugs, want to add any features or so on.

## License

MIT
