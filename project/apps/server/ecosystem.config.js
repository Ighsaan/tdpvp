module.exports = {
  apps: [
    {
      name: "tdpvp-server",
      script: "dist/index.js",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      time: true
    }
  ]
};
