module.exports = {
  apps: [
    {
      name: 'basis-forum-web',
      cwd: '/var/www/basis-forum/apps/web',
      script: './node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
      },
      max_memory_restart: '500M',
      autorestart: true,
    },
    {
      name: 'basis-forum-admin',
      cwd: '/var/www/basis-forum/apps/admin',
      script: './node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
        PORT: '3001',
      },
      max_memory_restart: '500M',
      autorestart: true,
    },
  ],
};
