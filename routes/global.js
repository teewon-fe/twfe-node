const express = require('express')
const router = express.Router()
const db = require('../db')
const sql = require('../db/sql')

router.get('/time', async (req, res, next)=>{
  res.json(res.genData('success', {
    time: new Date().getTime()
  }))
})

module.exports = router