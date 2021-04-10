const express = require('express')
const router = express.Router()
const db = require('../db')
const sql = require('../db/sql')
const encrypt = require('../utils/encrypt')

router.get('/', async (req, res, next)=>{
  const {username, password} = req.query
  const existuser = await db.query(sql.existuser, [username])

  if (existuser.rowCount > 0) {
    const data = await db.query(sql.fetchPassword, [username])

    if (data.rows[0].user_password === password) {
      res.json(res.genData('loginSuccess', {
        userId: data.rows[0].id,
        role: data.rows[0].role,
        userGroup: data.rows[0].user_group,
        mobile: data.rows[0].mobile,
        token:encrypt.toEncryption(`${parseInt(Math.random()*10000)}_${data.rows[0].id}_${parseInt(Math.random()*10000)}`)
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
  let {groupIds} = req.query

  if (!groupIds || /^[_a-z\d]+$/.test(groupIds.replace(/,/g, ''))) {
    groupIds = groupIds ? groupIds.split(',').map(item=>`'${item}'`) : ''

    const data = await db.query(sql.userList(groupIds))

    res.json(res.genData('success', {
      list: data.rows
    }))
  } else {
    res.send(res.genData('paramsError'))
  }
})

router.get('/usernames', async (req, res, next)=>{
  const data = await db.query(sql.usernames)

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

router.get('/count', async (req, res, next)=>{
  const {groupId} = req.query
  const data = await db.query(sql.getUserCountByGroup, [groupId])

  res.json(res.genData('success', {
    count: parseInt(data.rows[0].count)
  }))
})

router.post('/', (req, res, next)=>{
  const {username, password, groupId, mobile} = req.body

  db.query(sql.inserUser, [username, password, groupId, mobile]).then(data=>{
    res.json(res.genData('registerSuccess', {
      userId: data.rows[0].id,
      token:encrypt.toEncryption(`${parseInt(Math.random()*10000)}_${data.rows[0].id}_${parseInt(Math.random()*10000)}`)
    }))
  }).catch(err => {
    console.log(err)
    res.send(res.genData('dbError'))
  })
})

module.exports = router