const dateFormat = require('dateformat')

module.exports = {
  projectHandler (projectList) {
    return projectList.map(item => {
      item.project.task_time = 0
      item.project.invested_time = 0
      item.project.progress = 0
      item.project.expectant_progress = 0

      let taskNums = 0
      item.project.next_time_node = {
        start: new Date(),
        time_node_name: '--'
      }

      for (const tn of item.timeNodes) {
        tn.start_time = dateFormat(tn.start_time, 'yyyy-mm-dd')
        const start = new Date(tn.start_time)

        if (new Date() <= start) {
          item.project.next_time_node = {
            start: tn.start_time,
            time_node_name: tn.time_node_name
          }
        } else {
          tn.status = 'active'
        }

        if (tn.done_time) {
          tn.status = 'done'
          tn.done_time = dateFormat(tn.done_time, 'yyyy-mm-dd')
        }

        tn.text = `${tn.time_node_name}(${dateFormat(start, 'yyyy-mm-dd')})`
      }

      if (item.project.next_time_node.time_node_name === '--') {
        item.project.next_time_node.text = '--'
      } else {
        item.project.next_time_node.text = `${item.project.next_time_node.time_node_name}(${dateFormat(item.project.next_time_node.start, 'yyyy-mm-dd')})`
      }

      const developers = {}
      item.plans.forEach(plan => {
        if (plan.task_type === 'normal') {
          taskNums++
          item.project.progress += plan.progress || 0
          item.project.task_time += parseFloat(plan.task_time)

          if (!developers[plan.developer_name]) {
            developers[plan.developer_name] = {
              task_nums: 0,
              progress: 0,
              tast_time: 0,
              expectant_progress: 0,
              developer_id: plan.developer_id,
              developer_name: plan.developer_name
            }
          }

          if (new Date() >= new Date(plan.end_time)) {
            item.project.expectant_progress++
            developers[plan.developer_name].expectant_progress++
          }

          if (new Date() >= new Date(plan.end_time)) {
            item.project.invested_time += parseFloat(plan.task_time)
          }

          developers[plan.developer_name].task_nums++
          developers[plan.developer_name].tast_time += parseFloat(plan.task_time)
          developers[plan.developer_name].progress += parseFloat(plan.progress)

          if (new Date() >= new Date(plan.end_time) && plan.progress<1) {
            plan.status = '有风险'
          }

          plan.start_time = dateFormat(plan.start_time, 'yyyy-mm-dd HH:MM')
          plan.end_time = dateFormat(plan.end_time, 'yyyy-mm-dd HH:MM')
        }
      })

      item.developers = [...Object.values(developers)].map(dp => {
        dp.progress = parseFloat((dp.progress / dp.task_nums * 100).toFixed(2))
        dp.expectant_progress = parseFloat((dp.expectant_progress / dp.task_nums * 100).toFixed(2))
        return dp
      })

      item.project.expectant_progress = parseFloat((item.project.expectant_progress / taskNums * 100).toFixed(2))
      item.project.progress = parseFloat((item.project.progress / taskNums * 100).toFixed(2))

      let status = '正常进行中'

      if (item.project.status === 'done') {
        status = '已完成'
      } else if (item.project.progress < item.project.expectant_progress) {
        status = '有风险'
      }

      item.project.status = status
      item.project.task_time = parseFloat(item.project.task_time.toFixed(2))
      item.project.invested_time = parseFloat(item.project.invested_time.toFixed(2))
    })
  }
}
