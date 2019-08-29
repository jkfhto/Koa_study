# 增，删，改，查

```javascript
const mongoose = require('mongoose');
const JWT = require('jsonwebtoken');

const { Schema, model } = mongoose;

//定义模型
const userSchema = new Schema({
    //查询数据时过滤__v属性
    __v: { type: Number, select: false },
    name: { type: String, required: true },
    //select: false 查询数据时过滤用户密码信息
    password: { type: String, required: true, select: false },
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
    //参数验证
    ctx.verifyParams({
        name: { type: 'string', required: true },
        password: { type: 'string', required: true },
    });
    const {name} = ctx.request.body;
    //判断用户是否存在 确保用户名不重复
    const repeatUser = await User.findOne({name})
    if (repeatUser){
        ctx.throw(409,'用户已存在！')
    }else{
        const user = await new User(ctx.request.body).save();
        ctx.body = user;
    }
}

//修改指定id用户信息
async update(ctx) {
    //参数验证
    ctx.verifyParams({
        name: { type: 'string', required: true },
        password: { type: 'string', required: true },
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

//JWT实现用户登录
async login(ctx) {
    //参数验证
    ctx.verifyParams({
        name: { type: 'string', required: true },
        password: { type: 'string', required: true },
    });
    const user = await User.findOne(ctx.request.body);
    if (!user) {
        ctx.throw(401, '用户名或密码错误！')
    } else {
        const { _id, name } = user;
        //生成token 设置过期时间为1天
        //'jwt-secret'：密钥
        const token = JWT.sign({ _id, name }, 'jwt-secret', { expiresIn: '1d' });
        ctx.body = { token };
    }
}
```
