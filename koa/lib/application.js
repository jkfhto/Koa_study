
'use strict';

/**
 * Module dependencies.模块依赖
 */

const isGeneratorFunction = require('is-generator-function');//判断当前传入的function是不是标准的generator function
const debug = require('debug')('koa:application');//轻量级js debug调试工具
const onFinished = require('on-finished');//事件监听 当http请求完成，关闭或者出错时，调用注册好的回调函数
const response = require('./response');//响应请求 向客户端或http请求的发起者返回数据
const compose = require('koa-compose');//将 koa各个中间件合并执行，结合 next() 就形成了洋葱式模型
const isJSON = require('koa-is-json');//判断数据是不是json格式的
const context = require('./context');//http请求周期内的作用域环境，托管请求，响应，方便它们之间互相访问
const request = require('./request');//获取请求相关的数据 来源，cookie，query参数等
const statuses = require('statuses');//响应的状态码
const Emitter = require('events');//自定义事件 发布订阅
const util = require('util');//工具类
const Stream = require('stream');//数据流
const http = require('http');//node.js最核心模块
const only = require('only');//白名单选择 返回对象的白名单属性
const convert = require('koa-convert');//将koa老版本的generator中间件转换为promise中间件
const deprecate = require('depd')('koa');//简单判断 当前使用的koa的某些接口，或暴露的某些方法是不是过期了即将被废弃 并给出相应升级提示

/**
 * 继承Emitter自定义事件 订阅错误事件实现框架层的错误捕获机制
 * Expose `Application` class.
 * Inherits from `Emitter.prototype`.
 */

module.exports = class Application extends Emitter {
  /**
   * Initialize a new `Application`.
   *
   * @api public
   */

  /**
    *
    * @param {object} [options] Application options
    * @param {string} [options.env='development'] Environment
    * @param {string[]} [options.keys] Signed cookie keys
    * @param {boolean} [options.proxy] Trust proxy headers
    * @param {number} [options.subdomainOffset] Subdomain offset
    *
    */

  constructor(options) {
    super();
    options = options || {};
    this.proxy = options.proxy || false;
    this.subdomainOffset = options.subdomainOffset || 2;
    this.env = options.env || process.env.NODE_ENV || 'development';//环境变量
    if (options.keys) this.keys = options.keys;
    this.middleware = [];//用于存储中间件函数的数组
    this.context = Object.create(context);//上下文
    this.request = Object.create(request);//请求对象
    this.response = Object.create(response);//响应对象
    if (util.inspect.custom) {
      this[util.inspect.custom] = this.inspect;
    }
  }

  /**
   * 生成服务器实例
   * Shorthand for:
   *
   *    http.createServer(app.callback()).listen(...)
   *
   * @param {Mixed} ...
   * @return {Server}
   * @api public
   */

  listen(...args) {
    debug('listen');
    const server = http.createServer(this.callback());
    return server.listen(...args);
  }

  /**
   * Return JSON representation.
   * We only bother showing settings.
   *
   * @return {Object}
   * @api public
   */

  toJSON() {
    return only(this, [
      'subdomainOffset',
      'proxy',
      'env'
    ]);
  }

  /**
   * Inspect implementation.
   *
   * @return {Object}
   * @api public
   */

  inspect() {
    return this.toJSON();
  }

  /**
   * 缓存中间件
   * Use the given middleware `fn`.
   *
   * Old-style middleware will be converted.
   *
   * @param {Function} fn
   * @return {Application} self
   * @api public
   */

  use(fn) {
    if (typeof fn !== 'function') throw new TypeError('middleware must be a function!');
    //
    if (isGeneratorFunction(fn)) {
      deprecate('Support for generators will be removed in v3. ' +
                'See the documentation for examples of how to convert old middleware ' +
                'https://github.com/koajs/koa/blob/master/docs/migration.md');
      fn = convert(fn);
    }
    debug('use %s', fn._name || fn.name || '-');
    this.middleware.push(fn);//将中间件缓存在this.middleware数组中
    return this;
  }

  /**
   * Return a request handler callback
   * for node's native http server.
   *
   * @return {Function}
   * @api public
   */

  callback() {
    //koa各个中间件合并执行，结合 next() 就形成了洋葱式模型
    const fn = compose(this.middleware);

    if (!this.listenerCount('error')) this.on('error', this.onerror);
    // handleRequest 函数相当于 http.creatServer 的回调函数, 有 req, res 两个参数, 
    // 代表原生的 request, response 对象.
    const handleRequest = (req, res) => {
      const ctx = this.createContext(req, res);//生成上下文 托管请求，响应，方便它们之间互相访问
      return this.handleRequest(ctx, fn);//通过洋葱模型 处理http请求
    };

    return handleRequest;
  }

  /**
   * 负责执行中间件所有的函数, 并在中间件函数执行结束的时候调用 respond，处理响应
   * Handle request in callback.
   *
   * @api private
   */

  handleRequest(ctx, fnMiddleware) {
    const res = ctx.res;//获取相应对象
    res.statusCode = 404;//设置默认的状态码404
    const onerror = err => ctx.onerror(err);//异常处理的回调函数
    const handleResponse = () => respond(ctx);//响应请求 向客户端返回数据
    // 为 res 对象添加错误处理响应, 当 res 响应结束时, 执行 context 中的 onerror 函数
    // (这里需要注意区分 context 与 koa 实例中的 onerror)
    onFinished(res, onerror);
    //将ctx上下文对象交给中间件数组 
    //通过洋葱模型执行中间件，处理请求，中间件执行过程中会使用try catch捕获异常，错误。如果存在异常，错误。直接返回一个状态为rejected的promise对象。外层通过使用promise的catch方法，就可以把所有的中间件的异常全部捕获到，实现了中间件的错误异常捕获。如果不存在异常，会返回一个状态为resolved的promise对象。外层通过使用promise的then方法，处理最终的结果，向请求对象响应数据
    return fnMiddleware(ctx).then(handleResponse).catch(onerror);
  }

  /**
   * 生成上下文 托管请求，响应，方便它们之间互相访问
   * Initialize a new context.
   *
   * @api private
   */

  createContext(req, res) {
    const context = Object.create(this.context);
    const request = context.request = Object.create(this.request);//挂载node.js原生request对象
    const response = context.response = Object.create(this.response);//挂载node.js原生response对象
    context.app = request.app = response.app = this;
    context.req = request.req = response.req = req;
    context.res = request.res = response.res = res;
    request.ctx = response.ctx = context;
    request.response = response;
    response.request = request;
    context.originalUrl = request.originalUrl = req.url;
    context.state = {};
    return context;
  }

  /**
   * Default error handler.
   *
   * @param {Error} err
   * @api private
   */

  onerror(err) {
    if (!(err instanceof Error)) throw new TypeError(util.format('non-error thrown: %j', err));

    if (404 == err.status || err.expose) return;
    if (this.silent) return;

    const msg = err.stack || err.toString();
    console.error();
    console.error(msg.replace(/^/gm, '  '));
    console.error();
  }
};

/**
 * 向客户端返回数据
 * Response helper.
 */

function respond(ctx) {
  // allow bypassing koa
  if (false === ctx.respond) return;

  if (!ctx.writable) return;

  const res = ctx.res;
  let body = ctx.body;
  const code = ctx.status;

  // ignore body
  if (statuses.empty[code]) {
    // strip headers
    ctx.body = null;
    return res.end();
  }

  if ('HEAD' == ctx.method) {
    if (!res.headersSent && isJSON(body)) {
      ctx.length = Buffer.byteLength(JSON.stringify(body));
    }
    return res.end();
  }

  // status body
  if (null == body) {
    if (ctx.req.httpVersionMajor >= 2) {
      body = String(code);
    } else {
      body = ctx.message || String(code);
    }
    if (!res.headersSent) {
      ctx.type = 'text';
      ctx.length = Buffer.byteLength(body);
    }
    return res.end(body);
  }

  // responses
  if (Buffer.isBuffer(body)) return res.end(body);//处理二进制文件
  if ('string' == typeof body) return res.end(body);//处理字符串
  if (body instanceof Stream) return body.pipe(res);//处理Stream

  // body: json 处理json
  body = JSON.stringify(body);
  if (!res.headersSent) {
    ctx.length = Buffer.byteLength(body);
  }
  res.end(body);
}
