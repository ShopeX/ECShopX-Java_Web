<p align="center"><img width="600" height="416" alt="logo2" src="logo.png" /></p>

### <p align="center">Desktop Frontend</p>

# Getting started

Node.js (current LTS) and pnpm are required to run the project. To be sure about the version compatibility you can enable Node's corepack.

### Installation

```
cd ECShopX_web-frontend
pnpm i
```

### Configure the .env file

```shell
# Backend API Base URL
NUXT_PUBLIC_API_BASE=
```

### Cloud Deployment: Backend API Base URL

When deploying to a server or cloud host, requests fail until `NUXT_PUBLIC_API_BASE` points at your **own** backend instead of the default.

- **Which variable / file?** Set `NUXT_PUBLIC_API_BASE` in `.env`. If it is left empty the app falls back to `/api`, so requests hit the frontend host itself.
- **Do I need the port?** Only when the backend is reached directly on a non-standard port — the PHP API listens on `8005` by default. Behind a domain proxied by Nginx on 80/443, omit the port.
- **Rebuild after every change.** `NUXT_PUBLIC_*` variables are embedded at build time. After editing the env file you must re-run the build. Run it from the project root (where `package.json` lives). 

```shell
# Behind a domain (Nginx on 80/443) — no port needed, end with /api/h5app
NUXT_PUBLIC_API_BASE=https://your-domain.com/api/h5app
# Direct public IP on a non-standard port — include the port
NUXT_PUBLIC_API_BASE=http://1.2.3.4:8005/api/h5app

# Rebuild after changing the value
pnpm build
```

### Run project

```
pnpm dev
```

### Build packages

```
pnpm build
```

## License

Each ECShopX source file included in this distribution is licensed under the Apache License 2.0, together with the additional terms imposed by ShopeX.

Open Software License (Apache 2.0) – Please see LICENSE.txt for the full text of the Apache 2.0 license.

每个包含在本发行版中的 ECShopX 源文件，均依据 Apache 2.0 开源许可证与ShopeX商派附加条款进行授权。

开源软件许可协议（Apache 2.0） —— 请参阅 LICENSE.txt 文件以获取 Apache 2.0 协议的完整文本。
