# Koa_study

## Koa简介

Koa 是一个新的 web 框架，由 Express 幕后的原班人马打造， 致力于成为 web 应用和 API 开发领域中的一个更小、更富有表现力、更健壮的基石。 通过利用 async 函数，Koa 帮你丢弃回调函数，并有力地增强错误处理。 Koa 并没有捆绑任何中间件， 而是提供了一套优雅的方法，帮助您快速而愉快地编写服务端应用程序

- 基于Node.js：Node.js模块
- 下一代：蚕食第一代Web框架Express的市场
- web 框架
- 更小、更富有表现力、更健壮
- 利用async函数，丢弃回调函数
- 增强错误处理：try catch
- 没有捆绑任何中间件

## 应用服务对象

能够提供接收，解析，响应，中间件。http流程全链路，这些服务能力的综合体。可以看成一个应用服务对象。

## Koa核心对象

- ```Application```：Web服务对象。接收，解析，响应http请求。
- ```Context```：执行上下文。http请求周期内的作用域环境，托管请求，响应和中间件，方便它们之间互相访问。
- ```Request```：请求对象。是在 node 的 vanilla 请求对象之上的抽象，提供了诸多对 HTTP 服务器开发有用的功能。
- ```Response```：响应对象。是在 node 的 vanilla 响应对象之上的抽象，提供了诸多对 HTTP 服务器开发有用的功能。
- ```Middlewares```：中间件。在解析请求，响应请求中间存在第三方中间件，来增强Koa的服务能力。
  - koa的中间件机制是一个剥洋葱式的模型，多个中间件通过use放进一个数组队。列然后从外层开始执行，遇到next后进入队列中的下一个中间件，所有中间件执行完后开始回帧，执行队列中之前中间件中未执行的代码部分，这就是剥洋葱模型，koa的中间件机制
- 错误捕获和错误处理
  - ```中间件的错误处理捕获```：通过洋葱模型执行中间件，处理请求，中间件执行过程中会使用try catch捕获异常，错误。如果存在异常，错误。直接返回一个状态为rejected的promise对象。外层通过使用promise的catch方法，就可以把所有的中间件的异常全部捕获到，实现了中间件的错误异常捕获。如果不存在异常，会返回一个状态为resolved的promise对象。外层通过使用promise的then方法，处理最终的结果，向请求对象响应数据。
  - ```框架层面的错误处理捕获```：通过继承```Emitter```自定义事件 可以订阅错误事件实现框架层的错误捕获机制

## Koa源码分析

- [application.js](./koa/lib/application.js)
- [context.js](./koa/lib/context.js)：context 的核心就是通过 delegates 这一个库, 将 request, response 对象上的属性方法代理到 context 对象上
- [request.js](./koa/lib/request.js)：主要是对原生的 http 模块的 request 对象进行封装, 其实就是对 request 对象某些属性或方法通过重写 getter/setter 函数进行代理
  ![request](./resources/request.png)
- [response.js](./koa/lib/response.js)：主要是对原生的 http 模块的 response 对象进行封装, 其实就是对 response 对象某些属性或方法通过重写 getter/setter 函数进行代理
  ![response](./resources/response.png)
- [koa-compose](./koa-compose/index.js)：将 koa各个中间件合并执行，结合 next() 就形成了洋葱式模型

## 路由

- 路由是什么？
  - 决定了不同URL是如何被解析执行的
  - 在Koa中，是一个中间件
- 为什么需要路由？
  - 如果没有路由
    - 所有请求都做相同的处理
    - 所有请求都会返回相同的结果
  - 路由存在的意义
    - 处理不同的url
    - 处理不同的HTTP请求方法
    - 解析url上的参数
- 路由中间件
  - [koa-router](https://github.com/ZijianHe/koa-router)

## 控制器

- 控制器是什么？
  - 处理路由分配的任务
  - 在Koa中，是一个中间件
- 为什么需要控制器？
  - [获取HTTP请求参数](./note/controler/get_http_request_parameter.md)
    - Query String，如：?q=keyword，一般是可选参数，有大小限制，敏感数据传输不安全
    - Router Params，如：/user/:id，一般是必选参数
    - Body，如：{name:'hello'}，适合参数多，数据量大安全性要求高的数据
    - Header，如Accept，cookie等
  - 处理业务逻辑，（获取数据，操作数据等）
  - [发送HTTP响应](./note/controler/handlle_http_responses.md)
    - 发送Status，如200/400等
    - 发送Body，如：{name:'hello'}
    - 发送Header，如Allow，Content-Type等
- 编写控制器最佳实践
  - 每个资源的控制器放在不同的文件里
  - 尽量使用类+类方法的形式编写控制器
  - 严谨的错误处理

## 错误处理

- 什么是错误处理?
  - 编程语言或计算机硬件中的一种机制
  - 处理软件或信息系统中出现的异常情况
- 异常状况有哪些?
  - 运行时错误（语法没有错误，程序运行时出错），返回500
  - 逻辑错误，如找不到（404），先决条件失败（用户id不存在，412），无法处理的实体（参数格式不对，422）等
- 为什么要用错误处理
  - 防止程序挂掉 try catch捕获异常，错误
  - 告诉用户错误信息
  - 便于开发者调试

### Koa自带的错误处理

- 默认会返回404
- 对于运行时错误，Koa会自动返回500
- 使用ctx.throw([status], [msg], [properties])：手动抛出一个错误
  
  ```javascript
  ctx.throw(412,'先决条件失败：id对应的数据不存在！');
  ```

### 错误处理中间件

- [简单的自定义错误处理中间件](./note/error_handling/customize.md)
- [koa-json-error](./note/error_handling/koa-json-error.md)：捕获错误，并返回json类型的错误对象
- [koa-parameter](./note/error_handling/koa-parameter.md)：无法处理的实体，参数校验

## 其他

- HTTP options方法的作用是什么？
  - 检测服务器所支持的请求方法
  - CORS中的预检请求 允许跨域再发送真实请求
- koa-router中allowedMethods的作用
  - 响应options请求，返回支持的请求方法
  - 返回405（不允许：koa支持的请求方法，但是没有实现）和501（没实现：koa不支持的请求方法）状态码


## 参考

- [koa 源码解析](https://www.jianshu.com/p/3e0f4077d3e4)