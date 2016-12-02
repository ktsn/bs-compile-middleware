// @flow

import fs from 'fs'
import path from 'path'
import url from 'url'

interface Options {
  srcDir: string;
  compilers: CompilerOptions[];
}

interface CompilerOptions {
  reqExt: string;
  srcExt: string;
  compile: (src: any, filename: string) => any;
}

export function compileMiddleware (options: Options) {
  const compilers = options.compilers.map(c => {
    return {
      reqRE: new RegExp(`\\.${c.reqExt}$`),
      getSrcPath (pathname: string) {
        return path.join(
          options.srcDir,
          pathname.replace(this.reqRE, '.' + c.srcExt)
        )
      },
      compile: c.compile
    }
  })

  return (req: any, res: any, done: Function) => {
    const pathname = normalizePathname(url.parse(req.url).pathname || '')

    forEachAsync(
      compilers,
      (compiler, next) => {
        if (!compiler.reqRE.test(pathname)) return next()

        const srcPath = compiler.getSrcPath(pathname)
        if (!fs.existsSync(srcPath)) return next()

        fs.readFile(srcPath, (error, data) => {
          if (error) {
            res.end(formatError(error))
            return next(true)
          }

          let out
          try {
            out = compiler.compile(data, srcPath)
          } catch (error) {
            out = formatError(error)
          }

          res.end(out)
          next(true)
        })
      },
      done
    )
  }
}

function normalizePathname (pathname: string): string {
  if (/\/$/.test(pathname)) {
    pathname = path.join(pathname, 'index.html')
  }
  return pathname
}

function forEachAsync <T>(
  xs: T[],
  f: (x: T, next: (isEnd: ?boolean) => void) => void,
  done: () => void
): void {
  if (xs.length === 0) return done()

  const [head, ...tail] = xs
  f(head, isEnd => {
    if (isEnd) return done()
    forEachAsync(tail, f, done)
  })
}

function formatError (error: Error) {
  return error.stack
}
