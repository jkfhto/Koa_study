# 基于JWT 用户认证，授权自定义中间件

## 用户认证

```javascript

const JWT = require('jsonwebtoken')

//密钥
const secret = 'jwt-secret'

//用户认证
function authentication() {
    return async (ctx, next) => {
        //通过 HTTP 请求的头信息Authorization字段 获取token
        const { authorization = '' } = ctx.request.header;
        const token = authorization.replace('Bearer ','');
        try {
            //用户认证 并获取用户信息
            const user = JWT.verify(token, secret);
            ctx.state.user = user;//绑定用户信息
            await next();
        } catch (e) {
            //捕获错误 未认证通过
            ctx.throw(401, e.message)
        }
    }
}

```

## 用户授权

```javascript
//用户授权
function authorization() {
    return async (ctx, next) => {
        //简单的授权操作 确保当前用户不能修改其他用户的数据
        if(ctx.params.id!==ctx.state.user._id){
            ctx.throw(403,'没有权限')
        }else{
            await next()
        }
    }
}

```

## 其他

- [Postman处理Authorization](../postman/authorization.md)