var React = require('react-native');
var {
  Platform,
} = React;
var default_options = {
  enable_mixpanel: true,
  google_places_key: "AIzaSyAIyzF7rwaUDp1KhMCCjbkgplap_WkrjoU"
};
var config;

switch (process.env.NODE_ENV || "development") {
  case "production":
    config = Object.assign(default_options, {
      env: "production",
      api_host: "https://www.tred.com",
      mixpanel_token: "006d2db0f4408244bf79faf76a60b4a0",
      sentry_dsn: Platform.OS === 'android' ? "https://e78f8b39ce1f4b0a9d9cf3eadec231e6@app.getsentry.com/60715" : "https://78ea8804e6be448ab5dbaa78a8333206@app.getsentry.com/60714",
    });
    break;
  case "development":
  default:
    config = Object.assign(default_options, {
      env: "development",
      api_host: "https://staging.tred.com",
//      api_host: "http://127.0.0.1",
//      api_port: 4000
      mixpanel_token: "c07707bbc14d5fd7f004a82e9151f501",
      sentry_dsn: Platform.OS === 'android' ? "https://c86486ead3b94b71805362d02372d39c@app.getsentry.com/60718" : "https://35a4f47f955b410d9c1f0400af445847@app.getsentry.com/60717",
    });
    break;
}

module.exports = config;
