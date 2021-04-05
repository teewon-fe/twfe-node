const apiCodes = require('../data/api-codes')

module.exports = (req, res, next) => {
  res.genData = (code, data) => {
    return {
      code:apiCodes[code].code || '200', 
      message:apiCodes[code].message,
      resType: apiCodes[code].resType,
      data: data || null
    }
  }

  if (req.headers['global-dev-group']) {
    req.headers['global-dev-group'] = `%${req.headers['global-dev-group'].split(',').sort().join(',')}%`
  } else {
    req.headers['global-dev-group'] = '%%'
  }
  
  next()
}