# 检测用户id是否合法的中间件

```javascript
const mongoose = require('mongoose')
//检测用户id是否合法的中间件
function isValidById() {
    return async (ctx, next) => {
        try {
            //判断id是否合法
            const isValid = mongoose.Types.ObjectId.isValid(ctx.params.id)
            if (isValid) {
                await next()
            } else {
                ctx.status = 404
                ctx.body = { message: '用户不存在', code: 0 }
                // ctx.throw(404)
            }
        } catch (e) {
            ctx.status = e.status || e.statusCode || 500
            ctx.body = {
                message: e.message,
            }
        }
    }
}

```
