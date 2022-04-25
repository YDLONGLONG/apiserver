const crypto = require('crypto')

//hmac加密
function hmac (str) {
  return crypto.createHmac('md5', 'lyc').update(str).digest('hex')
}

module.exports = hmac
