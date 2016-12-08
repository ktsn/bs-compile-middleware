/* globals Promise */
import fs from 'fs'
import path from 'path'
import assert from 'assert'
import pug from 'pug'
import { compileMiddleware } from '../src/index'

const noop = () => {}

function test ({
  request,
  expects,
  expectsMatch,
  compilers
}) {
  return new Promise(resolve => {
    const middleware = compileMiddleware({
      srcDir: path.resolve(__dirname, 'fixtures'),
      compilers
    })

    const buf = []
    const exec = () => middleware({
      url: request
    }, {
      setHeader: noop,
      write: data => {
        buf.push(data)
      },
      end: () => {
        const dest = buf.join()
        if (expects) {
          assert.equal(dest.trim(), readExpects(expects))
        } else if (expectsMatch) {
          assert(expectsMatch.test(dest.trim()))
        } else {
          throw new Error('[test] expects or expectsMatch is required')
        }
        resolve()
      }
    }, resolve)

    assert.doesNotThrow(exec)
  })
}

describe('bs-compile-middleware', () => {
  it('compiles requested resource', () => {
    return test({
      request: 'http://localhost:3000/',
      expects: 'index.html',
      compilers: [
        {
          reqExt: 'html',
          srcExt: 'pug',
          compile: (src, filename) => {
            return pug.render(src, {
              filename,
              pretty: true
            })
          }
        }
      ]
    })
  })

  it('response compile error', () => {
    return test({
      request: 'http://localhost:3000/error.html',
      expectsMatch: /The end of the string reached with no closing bracket \) found./,
      compilers: [
        {
          reqExt: 'html',
          srcExt: 'pug',
          compile: (src, filename) => {
            return pug.render(src, {
              filename,
              pretty: true
            })
          }
        }
      ]
    })
  })
})

function readExpects (filename) {
  return fs.readFileSync(path.resolve(__dirname, 'expects', filename), 'utf8').trim()
}
