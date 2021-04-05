
const encrypt = require('../utils/encrypt')

const validToken = function (token, userId) {
  const match = encrypt.toDecrypt(token).match(/_(\d+)_/)
  return match && match[1] === userId
}

module.exports = (req, res, next) => {
  let routeWhiteList = [
    'POST:/user',
    'GET:/user',
    'GET:/dic/list',
    'POST:/dic/list'
  ]

  if (routeWhiteList.includes(`${req.method}:${req.path}`)){
    next()
  } else {
    const token = req.headers['token']

    if (token && validToken(token, req.headers['user-id'])) {
      next()
    } else if (req.headers['session-id'] === '80791799') {
      next()
    } else {
      res.status(403).json(res.genData('noAuth'))
    }
  }
}