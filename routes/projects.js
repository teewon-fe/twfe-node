const express = require('express')
const router = express.Router()
const db = require('../db')
const sql = require('../db/sql')
const projectHandler = require('../utils/project-handler').projectHandler

router.get('/', async (req, res, next)=>{
  let values = []
  const isPageable = req.query.pageNo
  let developer_id = req.query.developer_id
  developer_id = developer_id ? `(^${developer_id}$|^${developer_id},|,${developer_id},|,${developer_id}$)` : false
  const queryCountParams = [req.headers['global-dev-group']]

  if (isPageable) {
    values = [parseInt(req.query.pageSize), req.query.pageSize * (req.query.pageNo - 1)]
  }

  values.push(req.headers['global-dev-group'])

  if (developer_id) {
    values.push(developer_id)
    queryCountParams.push(developer_id)
  }

  let data = null
  let count = 0

  if (req.query.status) {
    values.unshift(req.query.status)
    queryCountParams.unshift(req.query.status)
    data = await db.query(sql.genProjects('status', isPageable, developer_id), values)
    count = await db.query(sql.projectCount('status', developer_id), queryCountParams)
  } else if (req.query.id) {
    data = await db.query(sql.genProjects('id'), [req.query.id])
    count = await db.query(sql.projectCount('id'), [req.query.id])
  } else {
    data = await db.query(sql.genProjects(null, null, developer_id), values)
    count = await db.query(sql.projectCount(null, developer_id), queryCountParams)
  }

  const list = []

  for (const item of data.rows) {
    const timeNodes = await db.query(sql.timeNodes, [item.id])
    const plans = await db.query(sql.plans, [item.id, req.headers['global-dev-group']])
    item.dev_group = item.dev_group.split(',')
    item.developer_ids = item.developer_ids.split(',').map(id=>parseInt(id))
    item.developer_names = item.developer_names.split(',')
    item.project_leader_id = item.project_leader_id
    item.project_leader_name = item.project_leader_name

    list.push({
      project: item,
      timeNodes: timeNodes.rows,
      plans: plans.rows
    })
  }

  projectHandler(list)

  res.json(res.genData('success', {
    list,
    total: parseInt(count.rows[0].count)
  }))
})

router.get('/plans', async (req, res, next)=>{
  const {developer_id} = req.query

  const data = await db.query(sql.getPlansByUserId, [parseInt(developer_id)])

  res.json(res.genData('success', {
    list: data.rows
  }))
})

router.post('/', (req, res, next)=>{
  const project = req.body.project

  db.query(sql.insertProject, [
    project.project_name,
    project.project_version,
    project.project_type,
    project.dev_group.sort().join(','),
    project.developer_ids.join(','),
    project.developer_names.join(','),
    project.project_leader_id,
    project.project_leader_name,
    project.project_svn,
    project.project_prd_url,
    project.project_design_svn,
    project.project_psd_svn,
    project.project_api_svn,
    project.project_test_case_svn,
    project.status || 'doing',
    project.remark || null,
    project.project_fe_leader_id,
    project.project_fe_leader_name
  ]).then(data=>{
    let timeNodes = req.body.timeNodes
    timeNodes = timeNodes.map(item=>[item.time_node_name, data.rows[0].id, item.start_time, item.remark])
    db.query(sql.insertProjectTimeNode(timeNodes))

    let plans = req.body.plans
    plans = plans.map(item=>[data.rows[0].id, item.task_name, item.task_type, item.degreen || 0, item.priority || 0, parseFloat(item.task_time || 0), item.start_time ? item.start_time + ':00' : null, item.end_time ?  item.end_time + ':00' : null, item.developer_id || null, item.developer_name || null, item.no])
    db.query(sql.insertProjectPlan(plans))

    res.json(res.genData('success', {
      projectId: data.rows[0].id
    }))
  })
})

router.put('/', async (req, res, next)=>{
  const project = req.body.project

  await db.query(sql.updateProject, [
    req.body.id,
    project.project_name,
    project.project_version,
    project.project_type,
    project.dev_group.sort().join(','),
    project.developer_ids.join(','),
    project.developer_names.join(','),
    project.project_leader_id,
    project.project_leader_name,
    project.project_svn,
    project.project_prd_url,
    project.project_design_svn,
    project.project_psd_svn,
    project.project_api_svn,
    project.project_test_case_svn,
    project.remark,
    project.project_fe_leader_id,
    project.project_fe_leader_name
  ])

  for (const timeNode of req.body.timeNodes) {
    const values = [
      timeNode.time_node_name,
      timeNode.start_time,
      timeNode.remark
    ]

    if (timeNode.id) {
      values.unshift(timeNode.id)
      await db.query(sql.updateTimeNode, values)
    } else {
      values.splice(1, 0, req.body.id)
      db.query(sql.insertProjectTimeNode([values]))
    }
  }

  for (const plan of req.body.plans) {
    const values = [
      plan.task_name,
      plan.task_type,
      plan.degreen || 0,
      plan.priority || 0,
      plan.task_time || 0,
      plan.start_time ? plan.start_time + ':00' : null,
      plan.end_time ? plan.end_time + ':00' : null,
      plan.developer_id || null,
      plan.developer_name || null,
      plan.no
    ]

    if (plan.id) {
      values.unshift(plan.id)
      await db.query(sql.updatePlan, values)
    } else {
      values.unshift(req.body.id)
      await db.query(sql.insertProjectPlan([values]))
    }    
  }

  for (const delPlanId of req.body.delPlanIds) {
    await db.query(sql.deletePlan(), [delPlanId])
  }

  for (const delTimeNodeId of req.body.delTimeNodeIds) {
    await db.query(sql.deleteTimeNode(), [delTimeNodeId])
  }

  res.json(res.genData('success'))
})

router.delete('/:id/:pwd', async (req, res, next)=>{
  const data = await db.query(sql.fetchPasswordById, [req.headers['user-id']])

    if (data.rows[0].user_password === req.params.pwd) {
      await db.query(sql.deletePlan('project'), [parseInt(req.params.id)])
      await db.query(sql.deleteTimeNode('project'), [parseInt(req.params.id)])
      await db.query(sql.deleteProject, [parseInt(req.params.id)])

      res.json(res.genData('success'))
    } else {
      res.json(res.genData('passwordError'))
    }
})

router.get('/list', async (req, res, next)=>{
  const values = [parseInt(req.query.pageSize || 1000), req.query.pageSize && req.query.pageNo ? req.query.pageSize * (req.query.pageNo - 1) : 0]
  let data = null

  if (req.query.status) {
    values.unshift(req.query.status)
    data = await db.query(sql.genProjects('status'), values)
  } else if (req.query.id) {
    data = await db.query(sql.genProjects('id'), [req.query.id])
  } else {
    data = await db.query(sql.genProjects(), values)
  }

  res.json(res.genData('success', {
    list: data.rows
  }))
})

router.get('/count', async (req, res, next)=>{
  let data = null
  let developer_id = req.query.developer_id
  developer_id = req.query.developer_id ? `(^${developer_id}$|^${developer_id},|,${developer_id},|,${developer_id}$)` : false

  const totalParams = [req.headers['global-dev-group']]

  if (developer_id) {
    totalParams.push(developer_id)
  }

  const doingParams = ['doing'].concat(totalParams)

  const total =  await db.query(sql.projectCount(null, developer_id), totalParams)
  const doing =  await db.query(sql.projectCount('status', developer_id), doingParams)

  res.json(res.genData('success', {
    total: parseInt(total.rows[0].count),
    doing: parseInt(doing.rows[0].count)
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

router.put('/plan', (req, res, next)=>{
  const plan = {...req.body}

  db.query(sql.updatePlanProgress, [plan.progress, plan.id]).then(data=>{
    res.json(res.genData('success', {
      id: plan.id
    }))     
  })
})

router.get('/types', async (req, res, next)=>{
  const data = await db.query(sql.projectTypes)

  res.json(res.genData('success', {
    list: data.rows
  }))
})

router.get('/doing-projects', async (req, res, next)=>{
  const data = await db.query(sql.getDoingProjectNames)

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

router.get('/month-task-time', async (req, res, next)=>{
  const data = await db.query(sql.getTotalTaskTimeByMounth, [req.query.ym])

  res.json(res.genData('success', {
    totalTime: parseFloat(parseInt(data.rows[0].total_time).toFixed(1))
  }))
})

router.get('/month-progress', async (req, res, next)=>{
  const data = await db.query(sql.getTotalProgress, [req.query.ym] )

  res.json(res.genData('success', {
    totalProgress: parseFloat(parseInt(data.rows[0].total_progress).toFixed(1))
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
//       token:parseInt(Math.random()*100000000)
//     }))
//   }).catch(err => {
//     console.log(err)
//     res.send(res.genData('dbError'))
//   })
// })

module.exports = router