const format = require('pg-format')

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

  // 按组查询用户信息
  userListByGroup: `SELECT id, user_name, user_group, mobile, role FROM tw_user where user_group = $1 AND status = 'normal'`,

  devGroups: 'SELECT id, group_name AS name FROM tw_group',

  projectDegreen: 'SELECT id, degreen_name, task_time, remark from dic_degreen  ORDER BY id',

  insertProject: 'INSERT INTO project(project_name, project_version, project_type, dev_group, developer_ids, developer_names, project_leader_id, project_leader_name, project_svn, project_prd_url, project_design_svn, project_psd_svn, project_api_svn, project_test_case_svn, status, remark) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING id',

  updateProject: `UPDATE project SET project_name = $2, project_version = $3, project_type = $4, dev_group = $5, developer_ids = $6, developer_names = $7, project_leader_id = $8, project_leader_name = $9, project_svn = $10, project_prd_url = $11, project_design_svn = $12, project_psd_svn = $13, project_api_svn = $14, project_test_case_svn = $15, remark = $16 WHERE id = $1`,

  deleteProject: 'delete from project where id = $1',

  genProjects(type, isPageable) {
    const sql = 'SELECT id, project_name, project_version, project_type,  dev_group, developer_ids, developer_names, project_leader_id, project_leader_name, project_svn,project_prd_url, project_design_svn, project_psd_svn, project_api_svn, project_test_case_svn, status, remark from project '

    if (type === 'id') {
      return sql + 'WHERE id = $1'
    } else if (type === 'status') {
      if (isPageable) {
        return sql + `WHERE status = $1 AND dev_group like $4 ORDER BY id DESC LIMIT $2 OFFSET $3`
      } else {
        return sql + `WHERE status = $1 AND dev_group like $2 ORDER BY id DESC`
      }      
    } else {
      return sql + `WHERE dev_group like '%1%' ORDER BY id DESC LIMIT $1 OFFSET $2`
    }

    return sql
  },

  projectCount(type) {
    const sql = 'SELECT COUNT(*) FROM project '

    if (type === 'id') {
      return sql + `WHERE id = $1 && dev_group like $2`
    } else if (type === 'status') {
      return sql + `WHERE status = $1 && dev_group like $2`
    } else {
      return sql + `WHERE dev_group like $1`
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

  timeNodes: 'SELECT id, time_node_name, project_id, start_time, done_time, remark from pj_time_node WHERE project_id = $1 ORDER BY start_time',

  insertProjectPlan(values) {
    return format('INSERT INTO pj_plan(project_id, task_name, task_type, degreen, priority, task_time, start_time, end_time, developer_id, developer_name, no) VALUES %L RETURNING id', values)
  },

  plans: 'SELECT id, project_id, task_name, task_type, degreen, priority, task_time, start_time, end_time, developer_id, developer_name, progress, remark from pj_plan WHERE project_id = $1 ORDER BY no',

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

  projectTypes: 'SELECT id, type_name AS name FROM dic_type',

  specialDates: 'select * from dic_special_date',

  // 查询某开发的工作排期开始时间与结束时间不在同一个月的排期
  crossMonthWork: `select * from pj_plan WHERE developer_id = $1 AND to_char(start_time, 'yyyy-MM') = $2  AND to_char(start_time, 'yyyy-MM') <> to_char(end_time, 'yyyy-MM')`,

  getWorktime: `select * from worktime`,

  // 获取当月已排期工时
  getTotalTaskTimeByMounth: `select sum(task_time) as total_time from pj_plan WHERE to_char(start_time, 'yyyy-MM') = $1`,

  getTotalProgress: `select sum(task_time * progress) as total_progress from pj_plan WHERE to_char(start_time, 'yyyy-MM') = $1`,

  insertIssue(values) {
    return format('INSERT INTO issues(descript, type, project_id, project_name, create_developer_id, create_developer, handle_developer, resolve_time, status, remark) VALUES %L RETURNING id', values)
  },

  deleteIssue: 'delete from issues where id = $1',

  updateIssue: 'UPDATE issues SET descript = $2, type = $3, project_id = $4, project_name = $5, create_developer_id = $6, create_developer = $7, handle_developer = $8, resolve_time = $9, status = $10, remark = $11 WHERE id = $1',

  // 获取要处理的所有问题
  genIssueList (type) {
    if (type) {
      return `select * from issues where type = $1 AND status = 'doing'`
    } else {
      return `select * from issues where status = 'doing'`
    }
  },

  // 获取某开发的工作开始时间与结束时间都在同一月的总工作量
  getTaskTimsByMonth: `select sum(task_time) from pj_plan WHERE developer_id = $1 AND to_char(start_time, 'yyyy-MM') = $2  AND to_char(end_time, 'yyyy-MM') = $2`,

  // 某开发查询大于某月的【已完成】工作量
  doneTaskTimeByMounth: `select sum(task_time * progress) from pj_plan WHERE developer_id = $1 AND start_time >= to_date($2, 'yyyy-MM')`
}
