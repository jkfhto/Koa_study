# 增，删，改，查

```javascript
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

//定义模型
const userSchema = new Schema({
    name: { type: String, required: true },
})

//访问模型
const User = model('User', userSchema);

//获取用户列表
async find(ctx) {
    ctx.body = await User.find();
}

//获取指定id用户
async findById(ctx) {
    const user = await User.findById(ctx.params.id)
    if (!user) {
        ctx.throw(404, '用户不存在')
    } else {
        ctx.body = user;
    }
}

//新增用户
async create(ctx) {
    ctx.verifyParams({
        name: { type: 'string', required: true },
    });
    const user = await new User(ctx.request.body).save();
    ctx.body = user;
}

//修改指定id用户信息
async update(ctx) {
    ctx.verifyParams({
        name: { type: 'string', required: true },
    });
    const user = await User.findByIdAndUpdate(ctx.params.id,ctx.request.body);
    if (!user) {
        ctx.throw(404, '用户不存在')
    } else {
        ctx.body = user;
    }
}

//删除指定id用户
async delete(ctx) {
    const user = await User.findByIdAndRemove(ctx.params.id);
    if (!user) {
        ctx.throw(404, '用户不存在')
    } else {
        ctx.status = 204;
    }
}
```
