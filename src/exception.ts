/*
 * @poppinss/exception
 *
 * (c) Poppinss
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { format } from 'node:util'

/**
 * Create a custom error class with the ability to define the error
 * code, status, and the help text.
 *
 * ```js
 * export class FileNotFoundException extends Exception {
 *   static status = 500
 *   static code = 'E_FILE_NOT_FOUND'
 * }
 *
 * throw new FileNotFoundException(
 *  `Unable to find file from ${filePath} location`
 * )
 * ```
 */
export class Exception extends Error {
  /**
   * Define the error metadata as static properties to avoid
   * setting them repeatedly on the error instance
   */
  declare static help?: string
  declare static code?: string
  declare static status?: number
  declare static message?: string

  /**
   * Name of the class that raised the exception.
   */
  name: string

  /**
   * Optional help description for the error. You can use it to define additional
   * human readable information for the error.
   */
  declare help?: string

  /**
   * A machine readable error code. This will allow the error handling logic
   * to narrow down exceptions based upon the error code.
   */
  declare code?: string

  /**
   * A status code for the error. Usually helpful when converting errors
   * to HTTP responses.
   */
  status: number

  constructor(message?: string, options?: ErrorOptions & { code?: string; status?: number }) {
    super(message, options)

    const ErrorConstructor = this.constructor as typeof Exception

    this.name = ErrorConstructor.name
    this.message = message || ErrorConstructor.message || ''
    this.status = options?.status || ErrorConstructor.status || 500

    const code = options?.code || ErrorConstructor.code
    if (code !== undefined) {
      this.code = code
    }

    const help = ErrorConstructor.help
    if (help !== undefined) {
      this.help = help
    }

    Error.captureStackTrace(this, ErrorConstructor)
  }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  toString() {
    if (this.code) {
      return `${this.name} [${this.code}]: ${this.message}`
    }
    return `${this.name}: ${this.message}`
  }
}

/**
 * Helper to create an anonymous error class.
 *
 * ```ts
 *
 * const E_RESOURCE_NOT_FOUND = createError<[number]>(
 *   'Unable to find resource with id %d',
 *   'E_RESOURCE_NOT_FOUND'
 * )
 * const id = 1
 * throw new E_RESOURCE_NOT_FOUND([id])
 *```
 */
export function createError<T extends any[] = never>(
  message: string,
  code: string,
  status?: number
): typeof Exception & T extends never
  ? { new (args?: any, options?: ErrorOptions): Exception }
  : { new (args: T, options?: ErrorOptions): Exception } {
  return class extends Exception {
    static message = message
    static code = code
    static status = status

    constructor(args: T, options?: ErrorOptions) {
      super(format(message, ...(args || [])), options)
      this.name = 'Exception'
    }
  }
}
