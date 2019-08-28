# koa-parameter

[koa-parameter](https://github.com/koajs/parameter)

```javascript
const Koa = require('koa')
const app = new Koa()
const bodyparser = require('koa-bodyparser');
const parameter = require('koa-parameter');
app.use(bodyparser());
//注册参数校验中间件
app.use(parameter(app));

app.use(async function (ctx) {
    ctx.verifyParams({
        name: { type: 'string', required: true },
        age: { type: 'number', required: true }
    });
});

app.listen(3000)

//错误信息
{
    "message": "Validation Failed",
    "errors": [
        {
            "message": "should be a string",
            "code": "invalid",
            "field": "name"
        },
        {
            "message": "required",
            "field": "age",
            "code": "missing_field"
        }
    ],
    "params": {
        "name": 111
    }
}
```
