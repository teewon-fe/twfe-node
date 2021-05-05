const dateFormat = require('dateformat')

module.exports = {
  async projectHandler (projectList) {
    return projectList.map(item => {
      item.project.task_time = 0
      item.project.invested_time = 0
      item.project.progress = 0
      item.project.delay = 0
      item.project.progress_day = 0
      item.project.expectant_progress = 0
      item.project.expectant_progress_day = 0

      let taskNums = 0
      item.project.next_time_node = {
        start: new Date(),
        time_node_name: '已结束'
      }

      for (let i = 0; i< item.timeNodes.length; i++) {
        const tn = item.timeNodes[i]
        const nextTn = item.timeNodes[i + 1]

        // try {
        //   tn.delay_developer_id = tn.delay_developer_id ? JSON.parse(tn.delay_developer_id).split(',') : []
        //   tn.secondary_delay_developer_id = tn.secondary_delay_developer_id ? JSON.parse(tn.secondary_delay_developer_id).split(',') : []
        //   tn.ng_developer_id = tn.ng_developer_id ? JSON.parse(tn.ng_developer_id).split(',') : []
        //   tn.secondary_ng_developer_id = tn.secondary_ng_developer_id ? JSON.parse(tn.secondary_ng_developer_id).split(',') : []
        //   tn.delay_bug_num = tn.delay_bug_num ? JSON.parse(tn.delay_bug_num).split(',') : []  
        // } catch {
        //   debugger
        // }
        
        tn.start_time = dateFormat(tn.start_time, 'yyyy-mm-dd') + ' 23:59:59'
        tn.actual_start_time = tn.actual_start_time && dateFormat(tn.actual_start_time, 'yyyy-mm-dd')
        const start = new Date(tn.start_time)
        tn.kpi_status = 'wating'

        if (new Date() <= start) {
          if (item.project.next_time_node.time_node_name === '已结束') {
            item.project.next_time_node = {
              start: tn.start_time,
              time_node_name: tn.time_node_name
            }
          }
        } else {
          tn.status = 'active'

          if (!tn.actual_start_time) {
            tn.status = 'risk'
          }

          // 组内kpi是否已登记
          tn.kpi_status = 'doing'

          if (tn.submitted_kpi_group) {
            tn.submitted_kpi_group = tn.submitted_kpi_group.split(',')
            const groups = item.project.dev_group.filter(item => tn.submitted_kpi_group.includes(item))

            if (groups.length > 0) {
              tn.kpi_status = 'done'
            }
          } else {
            tn.submitted_kpi_group = []            
          }
        }

        if (nextTn) {
          if (nextTn.actual_start_time) {
            tn.status = 'done'
            tn.actual_start_time = dateFormat(tn.actual_start_time, 'yyyy-mm-dd')
          }
        } else {
          if (tn.actual_start_time) {
            tn.status = 'done'
            tn.actual_start_time = dateFormat(tn.actual_start_time, 'yyyy-mm-dd')
          }
        }

        tn.text = `${tn.time_node_name}(${dateFormat(start, 'yyyy-mm-dd')})`


      }

      if (item.project.next_time_node.time_node_name === '已结束') {
        item.project.next_time_node.text = '已结束'
      } else {
        item.project.next_time_node.text = `${item.project.next_time_node.time_node_name}(${dateFormat(item.project.next_time_node.start, 'yyyy-mm-dd')})`
      }

      const developers = {}
      const planList = []

      item.plans.forEach((plan, idx) => {
        if (plan.task_type === 'normal') {
          taskNums++
          item.project.progress_day += parseFloat((plan.progress || 0) * plan.task_time)
          item.project.task_time += parseFloat(plan.task_time)

          if (!developers[plan.developer_name]) {
            developers[plan.developer_name] = {
              task_nums: 0,
              progress: 0,
              progress_day: 0,
              task_time: 0,
              delay: 0,
              expectant_progress: 0,
              expectant_progress_day: 0,
              developer_id: plan.developer_id,
              developer_name: plan.developer_name,
              dev_group: plan.dev_group
            }
          }

          if (new Date() >= new Date(plan.end_time)) {
            item.project.expectant_progress_day += parseFloat(plan.task_time)
            developers[plan.developer_name].expectant_progress_day += parseFloat(plan.task_time)
          }

          if (new Date() >= new Date(plan.end_time)) {
            item.project.invested_time += parseFloat(plan.task_time)
          }

          developers[plan.developer_name].task_nums++
          developers[plan.developer_name].task_time += parseFloat(plan.task_time)
          developers[plan.developer_name].progress_day += parseFloat(plan.progress * plan.task_time)

          if (new Date() >= new Date(plan.end_time) && plan.progress<1) {
            plan.status = 'risky'
          }

          if (plan.progress >= 1) {
            plan.status = 'done'
          }

          plan.start_time = dateFormat(plan.start_time, 'yyyy-mm-dd HH:MM')
          plan.end_time = dateFormat(plan.end_time, 'yyyy-mm-dd HH:MM')

          planList.push(plan)
        } else {
          if (item.plans[idx+1] && item.plans[idx+1].task_type !== 'group') {
            planList.push(plan)
          }
        }
      })

      item.plans = planList

      item.developers = [...Object.values(developers)].map(dp => {
        dp.progress = parseFloat((dp.progress_day / dp.task_time * 100).toFixed(2))        
        dp.expectant_progress = parseFloat((dp.expectant_progress_day / dp.task_time * 100).toFixed(2))
        dp.task_time = parseFloat(dp.task_time.toFixed(2))
        dp.delay = parseFloat((dp.expectant_progress_day - dp.progress_day).toFixed(2))
        return dp
      })

      item.project.expectant_progress = parseFloat((item.project.expectant_progress_day / item.project.task_time * 100).toFixed(2)) || 0
      item.project.progress = parseFloat((item.project.progress_day / item.project.task_time * 100).toFixed(2)) || 0
      item.project.delay =  parseFloat((item.project.expectant_progress_day - item.project.progress_day).toFixed(2))

      let status = 'doing'

      if (item.project.status === 'done') {
        status = 'done'
      } else if (item.project.progress < item.project.expectant_progress) {
        status = 'risky'
      }

      item.project.status = status
      item.project.task_time = parseFloat(item.project.task_time.toFixed(2))
      item.project.invested_time = parseFloat(item.project.invested_time.toFixed(2))
    })
  }
}
