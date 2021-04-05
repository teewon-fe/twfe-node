const crypto = require('crypto')
const ekey = '3U6vTprJKmENLxWn'
const iv = 'FkJL7EDzjqWjcaY3'

module.exports ={
  toEncryption: function (value) {
    const cipher = crypto.createCipheriv('aes-128-cbc', ekey, iv);
    cipher.update(value+'','utf8', 'hex')
    return cipher.final('hex');
  },

  toDecrypt: function (value) {
    const decipher = crypto.createDecipheriv('aes-128-cbc', ekey, iv);
    decipher.update(value, 'hex', 'utf8')
    return decipher.final().toString();
  }
}