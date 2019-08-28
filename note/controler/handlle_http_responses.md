# 发送HTTP响应

- 发送 status
  
  ```javascript
  //发送成功的状态码
  ctx.status = 200;
  ```

- 发送 body
  
  ```javascript
  ctx.body = {name:'hello'};
  ```

- 发送 header
  
  ```javascript
  //使用ctx.set设置响应头
  ctx.set('Content-Type', 'text/html')
  ```
