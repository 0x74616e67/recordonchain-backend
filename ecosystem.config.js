module.exports = {
  apps: [
    {
      name: "qukuailianji",
      script: "./bin/www",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
