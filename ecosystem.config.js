module.exports = {
  apps: [{
    name: 'VOICE-PLAYGROUND-COMMON-ui',
    script: 'npm',
    args: 'run start',
    env: {
      NODE_ENV: 'production',
      PORT: '3000'  // Set your custom port here
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};