# 简单的自定义错误处理中间件

```javascript
//koa-json-error
//当前自定义错误处理中间件无法捕获处理404错误，由Koa直接处理
//当前自定义错误处理中间件可以捕获运行时错误，以及手动抛出的错误
function error() {
    return async (ctx, next) => {
        try {
            await next()
        } catch (e) {
            //500：兼容运行时报错
            ctx.status = e.status || e.statusCode || 500;
            ctx.body = {
                message: err.message,
            }
        }
    };
}
```
