
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
    if (req.headers['session-id']) {
      next()
    } else {
      res.status(403).json(res.genData('noAuth'))
    }
  }
}