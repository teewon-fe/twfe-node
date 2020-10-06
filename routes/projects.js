const express = require('express')
const router = express.Router()
const db = require('../db')
const sql = require('../db/sql')

router.post('/', (req, res, next)=>{
  const {
    projectName,
    projectVersion,
    projectType,
    groupId,
    developerIds,
    developerNames,
    projectLeaderId,
    projectLeaderName,
    projectSvn,
    projectPrdUrl,
    projectDesignSvn,
    projectPsdSvn,
    projectApiSvn,
    projectTestCaseSvn,
    status
  } = req.body.project

  const values = [
    projectName,
    projectVersion,
    projectType,
    groupId,
    developerIds.join(','),
    developerNames.join(','),
    projectLeaderId,
    projectLeaderName,
    projectSvn,
    projectPrdUrl,
    projectDesignSvn,
    projectPsdSvn,
    projectApiSvn,
    projectTestCaseSvn,
    status || 'doing'
  ]

  db.query(sql.insertProject, values).then(data=>{
    let timeNodes = req.body.timeNodes
    timeNodes = timeNodes.map(item=>[item.timeNodeName, data.rows[0].id, item.startTime, item.remark])
    db.query(sql.insertProjectTimeNode(timeNodes))

    let plans = req.body.plans
    plans = plans.map(item=>[data.rows[0].id, item.taskName, item.taskType, item.degreen || 0, item.priority || 0, parseFloat(item.taskTime || 0), item.startTime ? item.startTime + ':00' : null, item.endTime ?  item.endTime + ':00' : null, item.developerId, item.developerName,  item.progress ? parseFloat(item.progress / 100) : 0, item.remark])
    db.query(sql.insertProjectPlan(plans))

    res.json(res.genData('success', {
      projectId: data.rows[0].id
    }))
  })
})

router.get('/', async (req, res, next)=>{
  const values = [parseInt(req.query.pageSize), req.query.pageSize * (req.query.pageNo - 1)]

  let data = null
  let count = 0

  if (req.query.status) {
    data = await db.query(sql.genProjects('status'), [req.query.status])
    count = await db.query(sql.projectCount('status'), [req.query.status])
  } else if (req.query.id) {
    values.unshift(req.query.id)
    data = await db.query(sql.genProjects('id'), values)
    count = await db.query(sql.projectCount('id'), [req.query.id])
  } else {
    data = await db.query(sql.genProjects(), values)
    count = await db.query(sql.projectCount())
  }

  const list = []

  for (const item of data.rows) {
    const timeNodes = await db.query(sql.timeNodes, [item.id])
    const plans = await db.query(sql.plans, [item.id])
    list.push({
      project: item,
      timeNodes: timeNodes.rows,
      plans: plans.rows
    })
  }

  res.json(res.genData('success', {
    list,
    total: parseInt(count.rows[0].count)
  }))
})

router.get('/list', async (req, res, next)=>{
  let data = null

  if (req.query.status) {
    data = await db.query(sql.genProjects('status'), [req.query.status])
  } else if (req.query.id) {
    values.unshift(req.query.id)
    data = await db.query(sql.genProjects('id'), values)
  } else {
    data = await db.query(sql.genProjects(), values)
  }

  res.json(res.genData('success', {
    list: data.rows
  }))
})

router.get('/plans', (req, res, next)=>{
  db.query(sql.plans, [parseInt(req.query.projectId)]).then(data=>{
    res.json(res.genData('success', {
      list: data.rows
    }))
  })
})

router.put('/plans', (req, res, next)=>{
  req.body.forEach((plan,idx)=>{
    db.query(sql.updatePlanProgress, [plan.progress, plan.id]).then(data=>{
      if (idx + 1 === req.body.length) {
        res.json(res.genData('success', {
          id: plan.id
        }))
      }      
    })
  })
})

router.get('/types', async (req, res, next)=>{
  const data = await db.query(sql.projectTypes)

  res.json(res.genData('success', {
    list: data.rows
  }))
})

router.get('/timenodes', async (req, res, next)=>{
  const data = await db.query(sql.timeNodes, [req.query.projectId])

  res.json(res.genData('success', {
    list: data.rows
  }))
})

router.put('/close', (req, res, next)=>{
  db.query(sql.toggleProject, [req.body.status, req.body.id]).then(data=>{
    res.json(res.genData('success', {
      id: req.body.id
    }))
  })
})

// router.get('/summary', async (req, res, next)=>{
//   let project = {total: 0, doing: 0}
//   let timeNode = {scheduled: 0, rest: 0}
//   let efficiency = {current: 0, target: 1.5}
//   let bug = {month: 0, total: 0}

//   project.total = await db.query(sql.projectCount())
//   project.doing = await db.query(sql.projectCount('status'), ['doing'])

//   if (req.query.status) {
//     data = await db.query(sql.genProjects('status'), [req.query.status])
//     count = await db.query(sql.projectCount('status'), [req.query.status])
//   } else if (req.query.id) {
//     values.unshift(req.query.id)
//     data = await db.query(sql.genProjects('id'), values)
//     count = await db.query(sql.projectCount('id'), [req.query.id])
//   } else {
//     data = await db.query(sql.genProjects(), values)
//     count = await db.query(sql.projectCount())
//   }

//   const list = []

//   for (const item of data.rows) {
//     const timeNodes = await db.query(sql.timeNodes, [item.id])
//     const plans = await db.query(sql.plans, [item.id])
//     list.push({
//       project: item,
//       timeNodes: timeNodes.rows,
//       plans: plans.rows
//     })
//   }

//   res.json(res.genData('success', {
//     list,
//     total: parseInt(count.rows[0].count)
//   }))
// })

// router.post('/', (req, res, next)=>{
//   const {username, password, groupId, mobile} = req.body

//   db.query(sql.inserUser, [username, password, groupId, mobile]).then(data=>{
//     res.json(res.genData('registerSuccess', {
//       userId: data.rows[0].id,
//       sessionid:parseInt(Math.random()*100000000)
//     }))
//   }).catch(err => {
//     console.log(err)
//     res.send(res.genData('dbError'))
//   })
// })

module.exports = router