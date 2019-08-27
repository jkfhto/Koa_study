'use strict'

/**
 * Expose compositor.
 */

module.exports = compose

/**
 * Compose `middleware` returning
 * a fully valid middleware comprised
 * of all those which are passed.
 *
 * @param {Array} middleware
 * @return {Function}
 * @api public
 */

function compose (middleware) {
  //确保middleware中间件是数组
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
  // 确保middleware中间件数组中的每一个元素是函数
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
  }

  /**
   * @param {Object} context
   * @return {Promise}
   * @api public
   */
  // 返回一个匿名函数闭包, 保持对 middleware，context 的引用
  // 匿名函数接收两个参数，context：上下文环境，next：对应dispatch函数
  //next其实就是控制权的交接棒，next的作用是停止运行当前中间件，将控制权交给下一个中间件，执行下一个中间件的next()之前的代码，当下一个中间件运行的代码遇到了next()，又会将代码执行权交给下下个中间件，当执行到最后一个中间件的时候，控制权发生反转，开始回头去执行之前所有中间件中剩下未执行的代码，这整个流程有点像一个伪递归，当最终所有中间件全部执行完后，会返回一个Promise对象，因为我们的compose函数返回的是一个async的函数，async函数执行完后会返回一个Promise，这样我们就能将所有的中间件异步执行同步化，通过then就可以执行响应函数和错误处理函数
  // 匿名函数执行返回一个promise

  return function (context, next) {
    // last called middleware #
    let index = -1
    return dispatch(0)//执行第一个中间件函数
    function dispatch (i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
      index = i
      let fn = middleware[i]//中间件函数
      if (i === middleware.length) fn = next
      if (!fn) return Promise.resolve()
      try {
        //当最终所有中间件全部执行完后，会返回一个Promise对象
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
