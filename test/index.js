/* globals Promise */
import fs from 'fs'
import path from 'path'
import assert from 'assert'
import pug from 'pug'
import { compileMiddleware } from '../src/index'

function test ({
  request,
  expects,
  compilers
}) {
  return new Promise(resolve => {
    const middleware = compileMiddleware({
      srcDir: path.resolve(__dirname, 'fixtures'),
      compilers
    })

    const exec = () => middleware({
      url: request
    }, {
      end: dest => {
        assert.equal(dest.trim(), readExpects(expects))
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
})

function readExpects (filename) {
  return fs.readFileSync(path.resolve(__dirname, 'expects', filename), 'utf8').trim()
}
