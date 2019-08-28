# 获取HTTP请求参数

- 获取query
  
  ```javascript
  ctx.query
  ```

- 获取Router Params
  
  ```javascript
  ctx.params
  ```

- 获取body
  - 首先通过中间件处理body，然后通过ctx.request.body获取body
  - [bodyparser](https://github.com/koajs/bodyparser)中间件
  - [koa-body](https://github.com/dlau/koa-body)中间件
  
  ```javascript
  //bodyParser简单实现
  function bodyParser() {
    return async (ctx, next) => {
      ctx.request.body = await new Promise((resolve, reject) => {
        let arr = [];
        ctx.req.on("data", function(data) {
          arr.push(data);
        });
        ctx.req.on("end", function(data) {
          resolve(Buffer.concat(arr).toString());
        });
      });
      //执行下一个中间件
      await next();
    };
  }
  ```

- 获取header
  
  ```javascript
  ctx.header
  ```