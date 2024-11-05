/*
 * @poppinss/exception
 *
 * (c) Poppinss
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { fileURLToPath } from 'node:url'
import { createError, Exception } from '../src/exception.js'

test.group('Exception', () => {
  test('create exception with error code', ({ expect }) => {
    const error = new Exception('Some message', {
      code: 'E_SOME_MESSAGE',
    })

    expect(error.message).toEqual('Some message')
    expect(error.status).toEqual(500)
    expect(error.code).toEqual('E_SOME_MESSAGE')
  })

  test('create exception with error status', ({ expect }) => {
    const error = new Exception('Some message', {
      code: 'E_SOME_MESSAGE',
      status: 401,
    })

    expect(error.message).toEqual('Some message')
    expect(error.status).toEqual(401)
    expect(error.code).toEqual('E_SOME_MESSAGE')
  })

  test('point stack trace to correct file', ({ expect }) => {
    expect.assertions(1)

    try {
      throw new Exception('Some message')
    } catch (error) {
      console.log(import.meta.url)
      console.log(fileURLToPath(import.meta.url))
      console.log(error.stack.split('\n')[1])
      expect(error.stack.split('\n')[1]).toMatch(new RegExp(fileURLToPath(import.meta.url)))
    }
  })

  test('point stack trace to correct file with a sub-class', ({ expect }) => {
    expect.assertions(1)

    class UserNotFound extends Exception {
      static message = 'Unable to find user'
      static status = 404
    }

    try {
      throw new UserNotFound(UserNotFound.message)
    } catch (error) {
      expect(error.stack.split('\n')[1]).toMatch(new RegExp(fileURLToPath(import.meta.url)))
    }
  })

  test('use static properties', ({ expect }) => {
    class UserNotFound extends Exception {
      static message = 'Unable to find user'
      static status = 404
      static code = 'E_USER_NOT_FOUND'
    }

    const error = new UserNotFound(UserNotFound.message)
    expect(error.message).toEqual('Unable to find user')
    expect(error.status).toEqual(404)
    expect(error.code).toEqual('E_USER_NOT_FOUND')
  })

  test('define error help description', ({ expect }) => {
    class UserNotFound extends Exception {
      static message = 'Unable to find user'
      static status = 404
      static code = 'E_USER_NOT_FOUND'
      static help = 'Make sure the user exists in the table'
    }

    const error = new UserNotFound(UserNotFound.message)
    expect(error.message).toEqual('Unable to find user')
    expect(error.status).toEqual(404)
    expect(error.code).toEqual('E_USER_NOT_FOUND')
    expect(error.help).toEqual('Make sure the user exists in the table')
  })

  test('set error cause', ({ expect }) => {
    class UserNotFound extends Exception {
      static message = 'Unable to find user'
    }

    const error = new UserNotFound(UserNotFound.message, { cause: new Error('foo') })
    expect(error.message).toEqual('Unable to find user')
    expect((error.cause as any).message).toEqual('foo')
  })

  test('create error without runtime error message', ({ expect }) => {
    class UserNotFound extends Exception {
      static message = 'Unable to find user'
    }

    const error = new UserNotFound()
    expect(error.message).toEqual('Unable to find user')
    expect(error.stack!).toMatch(/UserNotFound: Unable to find user/)
  })

  test('Convert error to string', ({ expect }) => {
    class UserNotFound extends Exception {
      static message = 'Unable to find user'
    }

    const error = new UserNotFound()
    expect(error.toString()).toEqual('UserNotFound: Unable to find user')

    const errorWithCode = new UserNotFound(UserNotFound.message, { code: 'E_USER_NOT_FOUND' })
    expect(errorWithCode.toString()).toEqual('UserNotFound [E_USER_NOT_FOUND]: Unable to find user')
  })

  test('get class string name', ({ expect }) => {
    class UserNotFound extends Exception {
      static message = 'Unable to find user'
    }

    const error = new UserNotFound()
    expect(Object.prototype.toString.call(error)).toEqual('[object UserNotFound]')
  })

  test('raise exception with empty message', ({ expect }) => {
    const error = new Exception()
    expect(error.message).toEqual('')
  })

  test('create anonymous exception class', ({ expect }) => {
    expect.assertions(2)
    const E_USER_NOT_FOUND = createError('Unable to find user', 'E_USER_NOT_FOUND')

    try {
      throw new E_USER_NOT_FOUND()
    } catch (error) {
      expect(error.message).toEqual('Unable to find user')
      expect(error.stack.split('\n')[1]).toMatch(new RegExp(fileURLToPath(import.meta.url)))
    }
  })

  test('create anonymous exception class with formatted errors', ({ expect }) => {
    expect.assertions(2)
    const E_USER_NOT_FOUND = createError<[string]>('Unable to find %s', 'E_USER_NOT_FOUND')

    try {
      throw new E_USER_NOT_FOUND(['user'])
    } catch (error) {
      expect(error.message).toEqual('Unable to find user')
      expect(error.stack.split('\n')[1]).toMatch(new RegExp(fileURLToPath(import.meta.url)))
    }
  })

  test('provide name to exception class created using "createError" method', ({ expect }) => {
    expect.assertions(2)
    const E_USER_NOT_FOUND = createError('Unable to find user', 'E_USER_NOT_FOUND')

    try {
      throw new E_USER_NOT_FOUND()
    } catch (error) {
      expect(error.name).toEqual('Exception')
      expect(String(error)).toEqual('Exception [E_USER_NOT_FOUND]: Unable to find user')
    }
  })
})
