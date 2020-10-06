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
  
  next()
}