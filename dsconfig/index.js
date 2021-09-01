const settings = require('./appsettings.json');

const dsOauthServer = settings.production
  ? 'https://account.docusign.com'
  : 'https://account-d.docusign.com';

settings.gatewayAccountId = process.env.DS_PAYMENT_GATEWAY_ID || settings.gatewayAccountId;
settings.appUrl = process.env.DS_APP_URL || settings.appUrl;
settings.privateKeyLocation = process.env.DS_PRIVATE_KEY_PATH  || settings.privateKeyLocation;

exports.config = {
  dsOauthServer,
  ...settings
};
