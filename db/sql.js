const format = require('pg-format')

const $in = function (startIndex, num) {
  let result = []

  for (let i=startIndex; i<startIndex+num; i++) {
    result.push(`$${i}`)
  }

  return result.join(',')
}

module.exports = {
  existuser: 'SELECT 1 FROM tw_user WHERE user_name = $1',

  fetchPassword: 'SELECT id, user_name, user_group, mobile, user_password, role FROM tw_user WHERE user_name = $1',

  fetchPasswordById: 'SELECT id, user_name, user_group, mobile, user_password, role FROM tw_user WHERE id = $1',

  inserUser: 'INSERT INTO tw_user(user_name, user_password, user_group, mobile) VALUES($1, $2, $3, $4) RETURNING id',

  user: 'SELECT tw_user.id, user_name, user_group, group_name, mobile, role FROM tw_user inner join tw_group on tw_user.user_group = tw_group.id WHERE tw_user.id = $1',

  getUserCountByGroup: `select count(*) from tw_user WHERE user_group = $1 AND status = 'normal'`,

  userList (groupIds, status) {
    if (groupIds) {
      return `SELECT tw_user.id, user_name AS name, user_group AS groupId, group_name, mobile, role, status FROM tw_user INNER JOIN tw_group ON tw_user.user_group = tw_group.id WHERE user_group in (${groupIds}) ORDER BY id`
    } else {
      return `SELECT tw_user.id, user_name AS name, user_group AS groupId, group_name, mobile, role, status FROM tw_user INNER JOIN tw_group ON tw_user.user_group = tw_group.id ORDER BY id`
    }
  },

  usernames: `SELECT id, user_name AS name FROM tw_user where status = 'normal'`,

  // 获取用户信息按id
  userById: `select * from tw_user where id = $1`,

  // 按组查询用户信息
  userListByGroup: `SELECT id, user_name, user_group, mobile, role FROM tw_user where user_group = $1 AND status = 'normal'`,

  devGroups: 'SELECT id, group_name AS name FROM tw_group',

  projectDegreen: 'SELECT id, degreen_name, task_time, remark from dic_degreen  ORDER BY id',

  insertProject: 'INSERT INTO project(project_name, project_version, project_type, dev_group, developer_ids, developer_names, project_leader_id, project_leader_name, project_svn, project_prd_url, project_design_svn, project_psd_svn, project_api_svn, project_test_case_svn, status, remark, project_fe_leader_id, project_fe_leader_name) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING id',

  updateProject: `UPDATE project SET project_name = $2, project_version = $3, project_type = $4, dev_group = $5, developer_ids = $6, developer_names = $7, project_leader_id = $8, project_leader_name = $9, project_svn = $10, project_prd_url = $11, project_design_svn = $12, project_psd_svn = $13, project_api_svn = $14, project_test_case_svn = $15, remark = $16, project_fe_leader_id = $17, project_fe_leader_name = $18 WHERE id = $1`,

  deleteProject: 'delete from project where id = $1',

  genProjects(params = {}) {
    let [type, isPageable, developer_id, status, ym] = [params.type, params.isPageable, params.developer_id, params.status || [], params.ym]

    if (typeof status === 'string') {
      status = [status]
    }

    status = `('${status.filter(item=>['done', 'doing'].includes(item)).join("','")}')`

    const sql = `SELECT project.id, project_name, project_version, project_type, dev_group, developer_ids, developer_names, project_leader_id, project_leader_name, project_svn, project_prd_url, project_design_svn, project_psd_svn, project_api_svn, project_test_case_svn, status, project_fe_leader_id, project_fe_leader_name, project.remark from project ${/\d{4}-\d{1,2}/.test(ym) ? 'JOIN pj_time_node ON project.id = pj_time_node.project_id ' : ' '}`

    let ymSql = ''

    if (/\d{4}-\d{1,2}/.test(ym)) {
      ymSql = ` AND to_char(pj_time_node.start_time, 'yyyy-MM') = '${ym}' OR to_char(pj_time_node.start_time, 'yyyy-MM') = '9999-01' GROUP BY project.id `
    }

    if (type === 'id') {
      return sql + 'WHERE id = $1'
    } else if (type === 'status') {
      if (isPageable) {
        if (developer_id) {
          return sql + `WHERE status IN ${status} AND dev_group like $3 AND developer_ids ~ $4 ${ymSql} ORDER BY id DESC LIMIT $1 OFFSET $2`
        } else {
          return sql + `WHERE status IN ${status} AND dev_group like $3 ${ymSql} ORDER BY id DESC LIMIT $1 OFFSET $2`
        }
      } else {
        if (developer_id) {
          return sql + `WHERE status IN ${status} AND dev_group like $1 AND developer_ids ~ $2 ${ymSql} ORDER BY id DESC`
        } else {
          return sql + `WHERE status IN ${status} AND dev_group like $1 ${ymSql} ORDER BY id DESC`
        }
      }
    } else {
      if (developer_id) {
        return sql + `WHERE dev_group like $3 AND developer_ids ~ $4 ${ymSql} ORDER BY id DESC LIMIT $1 OFFSET $2`
      } else {
        return sql + `WHERE dev_group like $3 ${ymSql} ORDER BY id DESC LIMIT $1 OFFSET $2`
      }
    }

    return sql
  },

  projectCount(params = {}) {
    let [type, developer_id, status, ym] = [params.type, params.developer_id, params.status || [], params.ym]

    if (typeof status === 'string') {
      status = [status]
    }

    status = `('${status.filter(item=>['done', 'doing'].includes(item)).join("','")}')`

    const sql = `SELECT COUNT(*) FROM project ${/\d{4}-\d{1,2}/.test(ym) ? 'JOIN pj_time_node ON project.id = pj_time_node.project_id ' : ' '}`

    let ymSql = ''

    if (/\d{4}-\d{1,2}/.test(ym)) {
      ymSql = ` AND to_char(pj_time_node.start_time, 'yyyy-MM') = '${ym}' OR to_char(pj_time_node.start_time, 'yyyy-MM') = '9999-01' GROUP BY project.id `
    }

    if (type === 'id') {
      return sql + `WHERE id = $1`
    } else if (type === 'status') {
      if (developer_id) {
        return sql + `WHERE status IN ${status} AND dev_group like $1 AND developer_ids ~ $2 ${ymSql}`
      } else {
        return sql + `WHERE status IN ${status} AND dev_group like $1 ${ymSql}`
      }      
    } else {
      if (developer_id) {
        return sql + `WHERE dev_group like $1 AND developer_ids ~ $2 ${ymSql}`
      } else {
        return sql + `WHERE dev_group like $1 ${ymSql}`
      }      
    }
  },

  toggleProject: `UPDATE project SET status = $1 WHERE id = $2`,

  getDoingProjectNames: `select id, project_name from project where status = 'doing' ORDER BY id DESC`,

  insertProjectTimeNode(values) {
    return format('INSERT INTO pj_time_node(time_node_name, project_id, start_time, remark) VALUES %L RETURNING id', values)
  },

  deleteTimeNode(type) {
    const sql = 'delete from pj_time_node where '

    if (type === 'project') {
      return sql + 'project_id = $1'
    } else {
      return sql + 'id = $1'
    }
  },

  updateTimeNode: 'UPDATE pj_time_node SET time_node_name = $2, start_time = $3, remark = $4 WHERE id = $1',

  updateActualStartTime: 'UPDATE pj_time_node SET actual_start_time = $2, delay_cause = $3, ng_status = $4, submitted_kpi_group = $5 WHERE id = $1',

  updatePrdReviewNum: 'UPDATE project SET prd_review_num = $2 WHERE id = $1',

  updateTestInfo: 'UPDATE pj_time_node SET actual_start_time = $2, delay_developer_id = $3, secondary_delay_developer_id = $4, delay_cause = $5, ng_status = $6, ng_developer_id = $7, secondary_ng_developer_id = $8, delay_bug_num = $9 WHERE id = $1',

  updatePublishInfo: 'UPDATE project SET normal_bug_num = $2, red_bug_num = $3, org_bug_num = $4, design_doc = $5 WHERE id = $1',

  timeNodes: 'SELECT id, time_node_name, project_id, start_time, actual_start_time, remark, delay_cause, ng_status, ng_cause, submitted_kpi_group from pj_time_node WHERE project_id = $1 ORDER BY start_time',
  
  timeNodesById: 'SELECT * from pj_time_node WHERE id = $1',

  insertProjectPlan(values) {
    return format('INSERT INTO pj_plan(project_id, task_name, task_type, degreen, priority, task_time, start_time, end_time, developer_id, developer_name, no) VALUES %L RETURNING id', values)
  },

  plans: `SELECT pj_plan.id as id, project_id, task_name, task_type, degreen, priority, task_time, start_time, end_time, developer_id, developer_name, progress, pj_plan.remark as remark, user_group as dev_group from pj_plan LEFT JOIN tw_user ON pj_plan.developer_id = tw_user.id WHERE project_id = $1 AND (task_type = 'group' OR user_group like $2) ORDER BY no`,

  updatePlan: 'UPDATE pj_plan SET task_name = $2, task_type = $3, degreen = $4, priority = $5, task_time = $6, start_time = $7, end_time = $8, developer_id = $9, developer_name = $10, no = $11 WHERE id = $1',

  deletePlan(type) {
    const sql = 'delete from pj_plan where '

    if (type === 'project') {
      return sql + 'project_id = $1'
    } else {
      return sql + 'id = $1'
    }
  },

  updatePlanProgress: `UPDATE pj_plan SET progress = $1 WHERE id = $2`,

  projectTypes: 'SELECT id, type_name AS name FROM dic_type ORDER BY id',

  specialDates: 'select * from dic_special_date',

  // 查询某开发的工作排期开始时间与结束时间不在同一个月的排期
  crossMonthWork: `select * from pj_plan WHERE developer_id = $1 AND to_char(start_time, 'yyyy-MM') = $2  AND to_char(start_time, 'yyyy-MM') <> to_char(end_time, 'yyyy-MM')`,

  getWorktime: `select * from worktime`,

  // 获取当月已排期工时
  getTotalTaskTimeByMounth: `select sum(task_time) as total_time from pj_plan WHERE to_char(start_time, 'yyyy-MM') = $1`,

  getTotalProgress: `select sum(task_time * progress) as total_progress from pj_plan WHERE to_char(start_time, 'yyyy-MM') = $1`,

  insertIssue(values) {
    return format('INSERT INTO issues(descript, type, project_id, project_name, create_developer_id, create_developer, group_id, handle_developer, resolve_time, status, remark) VALUES %L RETURNING id', values)
  },

  deleteIssue: 'delete from issues where id = $1',

  updateIssue: 'UPDATE issues SET descript = $2, type = $3, project_id = $4, project_name = $5, create_developer_id = $6, create_developer = $7, group_id = $8, handle_developer = $9, resolve_time = $10, status = $11, remark = $12 WHERE id = $1',

  // 获取要处理的所有问题
  genIssueList (type) {
    if (type) {
      return `select * from issues where type = $1 AND group_id like $2 AND status like $3`
    } else {
      return `select * from issues where group_id like $1 AND status like $2`
    }
  },

  // 获取某开发的工作开始时间与结束时间都在同一月的总工作量
  getTaskTimsByMonth: `select sum(task_time) from pj_plan WHERE developer_id = $1 AND to_char(start_time, 'yyyy-MM') = $2  AND to_char(end_time, 'yyyy-MM') = $2`,

  // 某开发查询大于某月的【已完成】工作量
  doneTaskTimeByMounth: `select sum(task_time * progress) from pj_plan WHERE developer_id = $1 AND start_time >= to_date($2, 'yyyy-MM')`,

  // 获取某用户的计划
  getPlansByUserId: `SELECT pj_plan.id as id, project_id, project_name, task_name, task_type, degreen, priority, task_time, start_time, end_time, developer_id, developer_name, progress, pj_plan.remark as remark from pj_plan LEFT JOIN project ON pj_plan.project_id = project.id WHERE developer_id = $1 AND project.status = 'doing' ORDER BY start_time ASC`,

  // 按人统计工时
  countTasktimesByDeveloper (query) {
    let sql = `SELECT developer_id, developer_name, SUM(task_time) AS task_times FROM pj_plan JOIN tw_user ON pj_plan.developer_id = tw_user.id WHERE task_type <> 'group' AND to_char(start_time, 'yyyy') like $1`
    let startIndex = 2

    if (query.groups.length > 0) {
      sql += ` AND user_group IN (${$in(startIndex, query.groups.length)})`
      startIndex += query.groups.length
    }

    if (query.months.length > 0) {
      sql += ` AND to_char(start_time, 'MM') IN (${$in(startIndex, query.months.length)})`
    }

    return sql + ` GROUP BY developer_id, developer_name`
  },

  // 插入kpi
  insertKpi(values) {
    return format('INSERT INTO kpi(kpi_type, kpi_num, kpi_time, developer_id, developer_name, dev_group, project_id, time_node_id, kpi_total_task_time) VALUES %L RETURNING id', values)
  },

  // 更新kpi
  updateKpi: `UPDATE kpi SET kpi_type = $2, kpi_num = $3, kpi_time = $4, developer_id = $5,  developer_name = $6, dev_group = $7, project_id = $8, time_node_id = $9,  kpi_total_task_time = $10 WHERE id = $1`,

  // 删除kpi
  deleteKpi: `delete from kpi where id = $1`,

  // 删除指定开发者的同时间节点的kpi项
  deleteUserKpiByTimeNode: `DELETE FROM kpi WHERE time_node_id = $1 AND dev_group = $2`,

  // 查询kpi
  getApisByTimeNode: `SELECT * FROM kpi WHERE time_node_id = $1`,

  // 查询某项目某开发的非改单工作量
  countTaskTime: `select SUM(task_time) as total_task_time from pj_plan where project_id = $1 AND developer_id = $2 AND "degreen" <> 9`
}


