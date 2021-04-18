const express = require('express')
const router = express.Router()
const db = require('../db')
const sql = require('../db/sql')
const dateFormat = require('dateformat')
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
        doneTaskTime = parseFloat((doneTaskTime > workdays ? workdays : doneTaskTime).toFixed(2))

        kpi.push({
            ...user,
            workdays,
            doneTaskTime,
            progress: parseFloat((doneTaskTime / workdays * 100).toFixed(2))
        })
    }

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

module.exports = router