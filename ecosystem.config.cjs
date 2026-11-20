module.exports = {
  apps: [
    {
      name: 'ecshopx-web',
      script: './.output/server/index.mjs',
      exec_mode: 'cluster', // 可选：多核集群
      instances: 'max',
      port: 3000,
      autorestart: true,
      env: {
        NODE_ENV: 'production',
        NITRO_HOST: '127.0.0.1', // 建议走 Nginx 反代
        PORT: 3000,
      },
    },
  ],
}
