# 图片上传

## 图片上传的功能点

- 基础功能：上传图片，生成图片链接
- 附加功能：限制上传图片的大小与类型，生成高中低三种分辨率的图片链接，生成CDN

## 上传图片的技术方案

- 阿里云OSS等云服务，推荐在生产环境下使用
- 直接上传到服务器，不推荐在生产环境下使用。
  - 不稳定，服务器故障，可能会丢失数据。
  - 分布式支持不友好。

## 使用 [koa-body](https://github.com/dlau/koa-body) 处理图片上传

- 安装koa-body，替换koa-bodyparser
  - koa-bodyparser：只支持JSON，form格式的请求体，不支持文件格式的请求体
- 处理图片上传
  
    ```javascript
    const Koa = require('koa')
    const koaBody = require('koa-body');
    const path = require('path');
    const Router = require('koa-router');

    const app = new Koa();
    const router = new Router();

    //注册中间件
    app.use(koaBody({
        //支持文件上传
        multipart: true,
        formidable: {
            //设置上传目录
            uploadDir: path.join(__dirname, '/public/upload/'),
            //保留扩展名
            keepExtensions: true,
            // 设置上传文件大小最大限制，默认2M
            maxFileSize: 20 * 1024 * 1024
        }
    }));

    //实现控制器逻辑

    function upload(ctx, next) {
        //获取上传文件
        const { file } = ctx.request.files;
        //获取文件名+扩展名
        const basename = path.basename(file.path)
        //返回文件路径
        ctx.body = { url: `${ctx.origin}/upload/${basename}` }
    }

    //注册路由
    router.post('/upload', upload);
    app.use(router.routes(), router.allowedMethods())
    ```

## 使用 [koa-static](https://github.com/koajs/static) 中间件生成静态资源服务器

图片上传成功后，通过静态资源服务器，可以通过链接直接访问

```javascript
//注册中间件 并设置静态资源的目录
app.use(require('koa-static')(__dirname + '/public'))
```
