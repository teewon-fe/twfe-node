const express = require('express')
const router = express.Router()
const db = require('../db')
const sql = require('../db/sql')

router.get('/', async (req, res, next)=>{
  const {username, password} = req.query
  const existuser = await db.query(sql.existuser, [username])

  if (existuser.rowCount > 0) {
    const data = await db.query(sql.fetchPassword, [username])

    if (data.rows[0].user_password === password) {
      res.json(res.genData('loginSuccess', {
        userId: data.rows[0].id,
        sessionid:parseInt(Math.random()*100000000)
      }))
    } else {
      res.json(res.genData('passwordError'))
    }
  } else {
    res.json(res.genData('noUser'))
  }
})

router.get('/id', (req, res, next)=>{
  db.query(sql.user, [req.query.id]).then(data=>{
    res.json(res.genData('success', {
      user: data.rows[0]
    }))
  })
})

router.get('/list', async (req, res, next)=>{
  const {groupId} = req.query
  const data = await db.query(sql.userList, [groupId])

  res.json(res.genData('success', {
    list: data.rows
  }))
})

router.get('/groups', async (req, res, next)=>{
  const data = await db.query(sql.devGroups)

  res.json(res.genData('success', {
    list: data.rows
  }))
})

router.post('/', (req, res, next)=>{
  const {username, password, groupId, mobile} = req.body

  db.query(sql.inserUser, [username, password, groupId, mobile]).then(data=>{
    res.json(res.genData('registerSuccess', {
      userId: data.rows[0].id,
      sessionid:parseInt(Math.random()*100000000)
    }))
  }).catch(err => {
    console.log(err)
    res.send(res.genData('dbError'))
  })
})

module.exports = router