# JWT

## 什么是JWT

- Json Web Token 是一个开放标准（RFC 7519）
- 定义了一种紧凑且独立的方式，可以将各方之间的信息作为JSON对象进行安全传输
- 该信息可以验证和信任，因为是经过数字签名的

## JWT的构成

- Header（头部）
- Payload（有效载荷）
- Signature（签名）

## JWT例子

![JWT例子](../../resources/jwt.jpg)

## Header

- alg：表示签名的算法（algorithm），默认是 HMAC SHA256（写成 HS256）
- typ：表示这个令牌（token）的类型（type），JWT 令牌统一写为JWT

Header 部分是一个 JSON 对象，描述 JWT 的元数据，通常是下面的样子.

```javascript
{
  "alg": "HS256",
  "typ": "JWT"
}
```

## Payload

- 存储需要传递的信息，如用户ID，用户名等
- 还包含元数据，如过期时间，发布人等
- 与Header不同，Payload可以加密

Payload 里面是 Token 的具体内容，这些内容里面有一些是标准字段，你也可以添加其它需要的内容。下面是标准字段：

- iss (issuer)：签发人
- exp (expiration time)：过期时间
- sub (subject)：主题
- aud (audience)：受众
- nbf (Not Before)：生效时间
- iat (Issued At)：签发时间
- jti (JWT ID)：编号

## Signature

- 先是用 Base64 编码的 header.payload 
- 保证Token在传输过程中没有被篡改或损坏
- 需要指定一个密钥（secret）。这个密钥只有服务器才知道，不能泄露给用户。然后，使用 Header 里面指定的签名算法（默认是 HMAC SHA256），按照下面的公式产生签名
  
  ```javascript
  HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret)
  ```

- 然后把 base64(header).base64(payload).base64(signature) 作为 JWT token返回客户端

## 校验简介

整个JWT的结构是由header.playload.sign连接组成，只有sign是用密钥加密的，而所有的信息都在header和playload中可以直接获取，sign的作用只是校验header和playload的信息是否被篡改过，所以JWT不能保护数据，但以上的特性可以很好的应用在权限认证上

## JWT的工作原理

- 客户端使用用户名跟密码请求登录
- 服务端收到请求，去验证用户名与密码
- 验证成功后，服务端会将用户ID等信息，作为JWT的有效载荷（Payload）签发一个 Token，再把这个 Token 发送给客户端
- 客户端收到 Token 以后可以把它存储起来，比如放在 Cookie 里或者 Local Storage 里
- 客户端每次向服务端请求资源的时候需要带着服务端签发的 Token
  - 你可以把它放在 Cookie 里面自动发送，但是这样不能跨域，
  - 所以更好的做法是放在 HTTP 请求的头信息Authorization字段里面。
  
    ```script
    Authorization: Bearer <token>
    ```

  - 另一种做法是，跨域的时候，JWT 就放在 POST 请求的数据体里面
- 服务端收到请求，会去验证Token是否存在，如果存在会验证Token的有效性，例如检查签名是否正确，令牌是否过期等。验证通过后端会使用Token中包含的用户信息，进行其他业务逻辑，处理请求

## JWT vs Session

- 可扩展性
  - 应用程序分布式部署的情况下，Session需要做多机数据共享，通常可以存在数据库或者redis里面。而JWT不需要
- 安全性
  - 数据保存在Cookie 里或者 Local Storage 里，可能被篡改。需要进行签名或加密提高安全性防止XSS攻击。
  - 由于cookie存在CSRF攻击风险，需要确保有必要的CSRF保护措施。
  - 此外，最好不要将敏感数据放在Token中。
  - 如果可以，请使用https协议，防止中间人攻击
  - 由于JWT的payload是使用base64编码的，并没有加密，因此JWT中不能存储敏感数据。而Session的信息是存在服务端的，相对来说更安全
- RESTful API
  - JWT不在服务端存储任何状态。RESTful API的原则之一是无状态，发出请求时，总会返回带有参数的响应，不会产生附加影响。Session中用户的认证状态引入这种附加影响，这破坏了这一原则。另外JWT的载荷中可以存储一些常用信息，用于交换信息，有效地使用 JWT，可以降低服务器查询数据库的次数
- 性能
  - JWT太长。由于是无状态使用JWT，所有的数据都被放到JWT里，如果还要进行一些数据交换，那载荷会更大，经过编码之后导致JWT非常长，cookie的限制大小一般是4k，cookie很可能放不下，所以JWT一般放在local storage里面。并且用户在系统中的每一次http请求都会把JWT携带在Header里面，http请求的Header可能比Body还要大。而SessionId只是很短的一个字符串，因此使用JWT的http请求比使用Session的开销大得多
  - Session数据保存在数据库中，需要进行数据库查询，也会消耗一定的性能。
- 时效性
  - JWT时效性比Session差，一旦签发一个JWT，在到期之前就会始终有效，无法中途废弃。Session可以在服务端手动的，主动的销毁。
  - JWT由于时效性问题，可能会导致用户权限，资料无法实现更新等问题

## Base64URL

JWT 作为一个令牌（token），有些场合可能会放到 URL（比如 api.example.com/?token=xxx）。Base64 有三个字符+、/和=，在 URL 里面有特殊含义，所以要被替换掉：=被省略、+替换成-，/替换成_ 。这就是 Base64URL 算法


