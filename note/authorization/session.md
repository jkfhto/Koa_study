# Session

## Session 工作原理

客户端第一次正常访问服务器，服务器生成一个sessionid来标识用户并保存用户信息（服务器有一个专门的地方来保存所有用户的sessionId），在response headers中作为cookie的一个值返回，客户端收到后把cookie保存在本地，下次再发请求时会在request headers中带上这个sessionId，服务器通过查找这个sessionId就知道用户状态了，并更新sessionId的最后访问时间。sessionId也可以设置失效时间。总言之cookie是保存在客户端，session是存在服务器，session依赖于cookie

## Session 的优势

- 相比于JWT，最大的优势就在于可以主动清除session
- session保存在服务器端，相对更安全
- 结合cookie使用，较为灵活，兼容性较好

## Session 的劣势

- cookie + session在跨域场景表象不好，cookie有同源策略限制
- 如果是分布式部署，需要做多机共享session机制（使用redis存储session数据）
- 基于cookie机制存在CSRF攻击风险
- 查询session信息可能会有数据库查询操作，带来一定的性能问题
