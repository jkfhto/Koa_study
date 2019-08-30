# Postman处理Authorization

- 用户登录设置全局变量
  
  ```javascript
  //服务端返回的token数据
  {
    "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZDY3ZDVjNGFmZTkwMTkzY2NmODY3OTkiLCJuYW1lIjoi55So5oi3MSIsImlhdCI6MTU2NzEzMTc3NywiZXhwIjoxNTY3MjE4MTc3fQ.z4xV02hl7TPzbiVyDOc1kFyuZwxM6D8RLxcPh0p2nVM"
  }

  //根据服务端返回的token数据  在登录接口的Tests栏设置全局变量
  //获取响应体
  var JsonData =JSON.parse(responseBody);
  //获取token
  var auth_token = JsonData.token;
  //设置全局变量
  pm.globals.set('token',auth_token)
  ```

  ![用户登录设置全局变量](../../resources/global_variable.png)

- 在需要进行用户认证的接口请求头添加Authorization字段，这样每次请求时，对应的接口就会携带token数据传到服务器，服务器根据token数据进行认证等其他业务操作
  ![添加Authorization字段](../../resources/authorization1.png)
  ![添加Authorization字段](../../resources/authorization2.png)