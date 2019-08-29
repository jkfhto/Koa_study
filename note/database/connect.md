# 连接数据库

```javascript
const mongoose = require('mongoose');

//连接数据库
mongoose.connect('mongodb://localhost/my_database', { useNewUrlParser: true }, () => {
    console.log('MongoDB连接成功')
});

//监听错误
mongoose.connection.on('error', console.error)

```
