# leigod-auto-pause

利用雷神加速器api（包含了登陆接口的签名认证逻辑）以及Github的Actions定时自动暂停时长

## Usage

### Set secrets

Fork项目之后，设置Actions的secrets

可以设置多个账号，用逗号 ',' 分割，账号和密码需要一一对应

```
USERNAME_ARR="17000000001,17000000002"
PASSWORD_ARR="password1,password2"
```

![image](https://github.com/user-attachments/assets/48c31718-d395-402e-9515-b504a1c1e54d)

![image](https://github.com/user-attachments/assets/d824c236-af23-482f-afd0-875baba0608c)

### Run actions

可以在Actions里手动触发，默认是北京实际凌晨3点触发

如需修改schedule时间，请修改`./.github/workflows/main.yml`文件

![image](https://github.com/user-attachments/assets/7d153d6c-ebdb-4cc7-a4a9-002a59adcb71)


## Run locally

修改.env文件的 `USERNAME_ARR` 和 `PASSWORD_ARR`

```
npm i
node index.js
```

请使用18.x及以上nodejs版本

## References

- [himcs/LeishenAuto](https://github.com/himcs/LeishenAuto/)
- [jiajiaxd/leigod-api](https://github.com/jiajiaxd/leigod-api)
