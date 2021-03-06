const express = require('express')
const router = express.Router()
const db = require('../db')
const sql = require('../db/sql')
const dateFormat = require('dateformat')
const jira = require('../jira/jira')

const worktime = {
    amStart: '09:00:00',
    amEnd: '12:00:00',
    pmStart: '13:30:00',
    pmEnd: '18:00:00'
}

const timeToMs = function (t) {
    let ms = 0

    t.split(':').map((item, idx) => {
        if (idx === 0) {
            ms += item * 60 * 60 * 1000
        } else if (idx === 1) {
            ms += item * 60 * 1000
        } else {
            ms += item * 1000
        }
    })

    return ms
}

const scoreRule = {
    done_task_time: 10,
    delay_developer_id: -10,
    secondary_delay_developer_id: -5,
    ng_developer_id: -10,
    secondary_ng_developer_id: -5,
    delay_bug_num: -1,
    prd_review_num: -10,
    normal_bug_num: 2.5,
    red_bug_num: -10,
    org_bug_num: -5,
    design_doc: 1,
    code_maintainability: -1,
    train_and_share: 1,
    patent: 1,
    not_submmited_progress: -1,
    key_task: 1
}

const amMs = timeToMs(worktime.amEnd) - timeToMs(worktime.amStart)
const pmMs = timeToMs(worktime.pmEnd) - timeToMs(worktime.pmStart)

const computeWorkdaysForLastTask = async function (userId, ym) {
    const tasks = await db.query(sql.crossMonthWork, [userId, ym])
    const specialDates = await db.query(sql.specialDates)
    const currentMonth = (new Date(`${ym}-01`)).getMonth()

    let holiday = specialDates.rows.filter(item => {
        return item.type === 'holiday'
    }).map(item => item.value)

    let overtime = specialDates.rows.filter(item => {
        return item.type === 'overtime'
    }).map(item => item.value)

    let totalDays = 0
    let days = 0
    let dateMonth = currentMonth
    let date = 0
    let dateMs = 0
    let dateStr = ''
    let day = 0
    let progressDays = 0

    for (const task of tasks.rows) {
        totalDays += parseFloat(task.task_time)
        progressDays += parseFloat(task.task_time * task.progress)
        dateMs = 0

        while (true) {
            if (dateMs === 0) {
                dateMs = task.start_time.getTime()
                const isAm = dateFormat(task.start_time, 'H') <= 12
                let firstMs = 0

                if (isAm) {
                    firstMs = ((new Date(dateFormat(task.start_time, 'yyyy-mm-dd') + ' ' + worktime.amEnd)).getTime() - dateMs) + pmMs
                } else {
                    firstMs = (new Date(dateFormat(task.start_time, 'yyyy-mm-dd') + ' ' + worktime.pmEnd)).getTime() - dateMs
                }

                days += firstMs / (amMs + pmMs)
            }

            dateMs += 86400000
            date = new Date(dateMs)
            dateMonth = date.getMonth()

            if (dateMonth === currentMonth) {
                day = date.getDay()
                dateStr = dateFormat(date, 'yyyy-mm-dd')

                if (holiday.includes(dateStr)) {
                    continue
                }

                if (overtime.includes(dateStr)) {
                    days++
                    continue
                }

                if (![0, 6].includes(day)) {
                    days++
                }
            } else {
                break
            }
        }
    }

    return {
        totalDays,
        progressDays,
        firstDays: days
    }
}

router.get('/', async (req, res, next) => {
    // 按组获取所有用户信息
    const userData = await db.query(sql.userListByGroup, [req.query.user_group])

    const ymChar = req.query.ym || dateFormat(new Date(), 'yyyy-mm')
    const prevYmChar = dateFormat(new Date(`${ymChar}-01`) - 86400000, 'yyyy-mm')
    const kpi = []
    const kpiData = await db.query(sql.countKpiByMounth, [ymChar, req.query.user_group])

    for (const user of userData.rows) {
        const worddaysInMonth = await db.query(sql.getTaskTimsByMonth, [user.id, ymChar])
        const workdaysLastTask = await computeWorkdaysForLastTask(user.id, ymChar)
        const prevWorkdaysLastTask = await computeWorkdaysForLastTask(user.id, prevYmChar)
        const doneTaskTimeData = await db.query(sql.doneTaskTimeByMounth, [user.id, ymChar])
        const workdays = parseFloat((parseFloat(worddaysInMonth.rows[0].sum || 0) + workdaysLastTask.firstDays + (prevWorkdaysLastTask.totalDays - prevWorkdaysLastTask.firstDays)).toFixed(2))

        // 完成工作量在上个月的跨月工作量中在当月已完成的工作量
        const d = prevWorkdaysLastTask.progressDays - prevWorkdaysLastTask.firstDays
        let doneTaskTime = (doneTaskTimeData.rows[0].sum || 0) + (d > 0 ? d : 0)

        // 完成工作量不能大于当月的总任务工时
        doneTaskTime = Math.round((doneTaskTime > workdays ? workdays : doneTaskTime))

        const userKpiData = {done_task_time: {
            kpi_num: doneTaskTime,
            score: doneTaskTime * 10
        }}

        let totalScore = doneTaskTime * 10

         kpiData.rows.filter(item=> item.developer_id === user.id).forEach(item => {
            userKpiData[item.kpi_type] = {...item}

            // bug数基数计算：初级开发每人天1.8个bug，中级以上开发每人天1.3个bug
            if (item.kpi_type === 'normal_bug_num') {
                const levelNum = user.user_level > 1 ? 1.3 : 1.8

                userKpiData[item.kpi_type].score = Math.round((parseFloat(item.total_task_time) * levelNum * item.kpi_fix_num - parseInt(item.kpi_num)) * scoreRule[item.kpi_type])
            } else {
                if (item.kpi_type === 'red_bug_num') {
                    item.kpi_num = Math.round(item.kpi_num - (item.total_task_time / 20))

                    if (item.kpi_num < 0) {
                        item.kpi_num  = 0
                    }
                } else if (item.kpi_type === 'org_bug_num') {
                    item.kpi_num = Math.round(item.kpi_num - (item.total_task_time / 10))

                    if (item.kpi_num < 0) {
                        item.kpi_num  = 0
                    }
                }

                userKpiData[item.kpi_type].score = Math.round(parseInt(item.kpi_num) * scoreRule[item.kpi_type])
            }

            totalScore += userKpiData[item.kpi_type].score
        })

        for (const key of Object.keys(scoreRule)) {
            if (!userKpiData[key]) {
                userKpiData[key] = {
                    kpi_num: 0,
                    score: 0
                }
            }

            if (userKpiData[key].score > 0) {
                userKpiData[key].score = '+' + userKpiData[key].score 
            }
        }


        // 非null角色为组长或管理员，不需要统计kpi
        if (!user.role) {
            kpi.push({
                ...user,
                workdays,
                doneTaskTime,
                kpiData: userKpiData,
                totalScore: Math.round(totalScore),
                progress: parseFloat((doneTaskTime / workdays * 100).toFixed(2))
            })
        }        
    }

    kpi.sort((k1, k2) => k2.totalScore - k1.totalScore)

    res.json(res.genData('success', {
        list: kpi
    }))
})

// 增加问题
router.post('/issue', async (req, res, next)=>{
    let issue = [[req.body.descript, req.body.type, req.body.project_id || null, req.body.project_name || null, req.body.create_developer_id, req.body.create_developer, req.body.group_id, req.body.handle_developer || null, req.body.resolve_time || null, req.body.status || null, req.body.remark || null]]
    const data = await db.query(sql.insertIssue(issue))

    res.json(res.genData('success', {
        issueId: data.rows[0].id
    }))
})

// 删除问题
router.delete('/issue/:id', async (req, res, next)=>{
    const data = await db.query(sql.deleteIssue, [parseInt(req.params.id)])

    res.json(res.genData('success'))
})

// 修改问题
router.put('/issue', async (req, res, next)=>{
    let issue = [req.body.id, req.body.descript, req.body.type, req.body.project_id || null, req.body.project_name || null, req.body.create_developer_id, req.body.create_developer, req.body.group_id, req.body.handle_developer || null, req.body.resolve_time || null, req.body.status || null, req.body.remark || null]

    db.query(sql.updateIssue, issue).then(data=>{
        res.json(res.genData('success', {
            id: req.body.id
        }))
    })
})

// 查询所有问题
router.get('/issues', async (req, res, next)=>{
    let data = null
    const ymChar = req.query.ym || dateFormat(new Date(), 'yyyy-mm')

    if (req.query.type) {
        data = await db.query(sql.genIssueList(req.query.type), [req.query.type, req.headers['global-dev-group'], `%${req.query.status || ''}%`])
    } else {
        data = await db.query(sql.genIssueList(), [req.headers['global-dev-group'], `%${req.query.status || ''}%`])
    }

    data.rows.forEach(item=>{
        item.resolve_time = dateFormat(item.resolve_time, 'yyyy-mm-dd')
    })

    res.json(res.genData('success', {
        list: data.rows
    }))
})

// 查询jira
router.get('/jira', async (req, res, next)=>{
    const data = await jira.searchJira(req.query)

    res.json(res.genData('success', {
        list: data.users
    }))
})

// 写入kpi
router.post('/', async (req, res, next)=>{
    const time_node = req.body.time_node

    if (time_node) {
        const submitted_kpi_group = time_node.submitted_kpi_group || []

        if (!submitted_kpi_group.includes(req.headers['user-group'])) {
            submitted_kpi_group.push(req.headers['user-group'])
        }

        await db.query(sql.updateActualStartTime, [
            time_node.id, 
            time_node.actual_start_time || dateFormat(new Date(), 'yyyy-mm-dd'),
            time_node.delay_cause || null,
            time_node.ng_status || null,
            submitted_kpi_group.join(',')
        ])

        await db.query(sql.deleteUserKpiByTimeNode, [time_node.id, req.headers['user-group']])
    }    

    const kpis = req.body.kpis
    const values = []

    for (const [key, kpiList] of Object.entries(kpis)) {
        for (const item of kpiList) {
            item.kpi_num_original = item.kpi_num

            // 如果为需求评审或普通bug数，需要计算其对应开发的总工时数
            if (['prd_review_num', 'normal_bug_num', 'reg_bug_num', 'org_bug_num'].includes(item.kpi_type)) {
                const baseData = await db.query(sql.countTaskTime, [item.project_id, item.developer_id])
                item.kpi_total_task_time = parseInt(baseData.rows[0].total_task_time)

                if (item.kpi_type === 'prd_review_num') {
                    item.kpi_num = item.kpi_num > item.kpi_total_task_time / 3 ? 1 : 0
                }
            }

            if (time_node && time_node.actual_start_time) {
                // 如果为转测失败主负责人或转测失败组内开发人员指定了时间，不能用实际开始时间覆盖时间
                // 因为有可能转测是在30号转测，下个月才出转测结论
                if (!['ng_developer_id', 'secondary_ng_developer_id'].includes(item.kpi_type) || item.kpi_time === time_node.start_time) {
                    item.kpi_time = time_node.actual_start_time
                }             
            }

            values.push([
                item.kpi_type,
                item.kpi_num,
                item.kpi_time,
                item.developer_id,
                item.developer_name,
                item.dev_group,
                item.project_id || null,
                item.time_node_id || null,
                item.kpi_total_task_time || 0,
                item.kpi_num_original,
                item.kpi_fix_num || 1
            ])
        }        
    }

    if (values.length > 0) {
        db.query(sql.insertKpi(values)).then(data=>{
            res.json(res.genData('success'))
        })
    } else {
        res.json(res.genData('success'))
    }    
})

// 更新kpi
router.put('/', async (req, res, next)=>{
    if (req.body.time_node_id) {
        await db.query(sql.updateActualStartTime, [req.body.time_node_id, req.body.actual_start_time || dateformat(new Date(), 'yyyy-mm-dd')])
    }

    const kpis = req.body.kpis

    for (let i = 0; i < kpis.length; i++) {
        const kpi = kpis[i];
        
        db.query(sql.updateProject, kpi).then(data=>{
            res.json(res.genData('success'))
        })
    }

    res.json(res.genData('success'))
})

// 按时间节点id查询kpi
router.get('/getApisByTimeNode', async (req, res, next)=>{
    const data = await db.query(sql.getApisByTimeNode, [req.query.time_node_id])
    const result = {}

    for (const row of data.rows) {
        if (!result[row.kpi_type]) {
            result[row.kpi_type] = []
        }

        row.kpi_num = row.kpi_num_original
        result[row.kpi_type].push(row)
    }

    res.json(res.genData('success', {
        kpis: result
    }))
})

module.exports = router