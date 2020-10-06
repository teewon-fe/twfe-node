const express = require('express')
const router = express.Router()
const db = require('../db')
const sql = require('../db/sql')

router.get('/degreens', async (req, res, next)=>{
  const data = await db.query(sql.projectDegreen)

  res.json(res.genData('success', {
    list: data.rows
  }))
})

router.get('/list', (req, res, next)=>{
  res.json(res.genData('success', {
    list: [
      {
        name: 'a',
        value: '333'
      }
    ]
  }))
})

module.exports = router