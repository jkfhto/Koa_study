# koa-json-error

[koa-json-error](https://www.npmjs.com/package/koa-json-error)

```javascript
const Koa = require('koa')
const app = new Koa()
const error = require('koa-json-error')

//注册错误处理中间件
app.use(error({
    //生成环境屏蔽调用堆栈信息
    postFormat: (e, { stack, ...rest }) => process.env.NODE_ENV === 'production' ? rest : { stack, ...rest }
}));

app.use((ctx) => {
    ctx.throw(412)
})

app.listen(3000)

//错误信息
{
    "message": "Precondition Failed",
    "name": "PreconditionFailedError",
    "status": 412
}
```
