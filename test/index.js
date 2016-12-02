import fs from 'fs'
import path from 'path'
import assert from 'assert'
import pug from 'pug'
import { compileMiddleware } from '../src/index'

const noop = () => {}

describe('bs-compile-middleware', () => {
  it('compiles requested resource', done => {
    const middleware = compileMiddleware({
      srcDir: path.resolve(__dirname, 'fixtures'),
      compilers: [
        {
          reqExt: 'html',
          srcExt: 'pug',
          compile: (src, filename) => {
            return pug.render(src, {
              filename,
              pretty: true
            }).trim()
          }
        }
      ]
    })

    middleware({
      url: 'http://localhost:3000/'
    }, {
      end: dest => {
        assert.equal(dest, readExpects('index.html'))
        done()
      }
    }, noop)
  })
})

function readExpects (filename) {
  return fs.readFileSync(path.resolve(__dirname, 'expects', filename), 'utf8').trim()
}
