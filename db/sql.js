const format = require('pg-format')

module.exports = {
  existuser: 'SELECT 1 FROM tw_user WHERE user_name = $1',

  fetchPassword: 'SELECT id, user_password FROM tw_user WHERE user_name = $1',

  inserUser: 'INSERT INTO tw_user(user_name, user_password, user_group, mobile) VALUES($1, $2, $3, $4) RETURNING id',

  userList: 'SELECT id, user_name AS name, user_group AS groupId, mobile FROM tw_user WHERE user_group = $1',

  devGroups: 'SELECT id, group_name AS name FROM tw_group',

  projectDegreen: 'SELECT id, degreen_name, task_time, remark from dic_degreen  ORDER BY id',

  insertProject: 'INSERT INTO project(project_name, project_version, project_type,  dev_group, developer_ids, developer_names, project_leader_id, project_leader_name, project_svn,project_prd_url, project_design_svn, project_psd_svn, project_api_svn, project_test_case_svn, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING id',

  genProjects (type) {
    const sql = 'SELECT id, project_name, project_version, project_type,  dev_group, developer_ids, developer_names, project_leader_id, project_leader_name, project_svn,project_prd_url, project_design_svn, project_psd_svn, project_api_svn, project_test_case_svn, status from project '

    if (type === 'id') {
      return sql + 'WHERE id = $1 ORDER BY id LIMIT $2 OFFSET $3'
    } else if (type === 'status') {
      return sql + 'WHERE status = $1'
    } else {
      return sql + 'ORDER BY id LIMIT $1 OFFSET $2'
    }
  },

  projectCount (type) {
    const sql = 'SELECT COUNT(*) FROM project '

    if (type === 'id') {
      return sql + 'WHERE id = $1'
    } else if (type === 'status') {
      return sql + 'WHERE status = $1'
    } else {
      return sql
    }
  },

  toggleProject: `UPDATE project SET status = $1 WHERE id = $2`,

  insertProjectTimeNode (values) {
    return format('INSERT INTO pj_time_node(time_node_name, project_id, start_time, remark) VALUES %L RETURNING id', values)
  },

  timeNodes: 'SELECT id, time_node_name, project_id, start_time, done_time, remark from pj_time_node WHERE project_id = $1 ORDER BY start_time',

  insertProjectPlan (values) {
    return format('INSERT INTO pj_plan(project_id, task_name, task_type, degreen, priority, task_time, start_time, end_time, developer_id, developer_name, progress, remark) VALUES %L RETURNING id', values)
  },

  plans: 'SELECT id, project_id, task_name, task_type, degreen, priority, task_time, start_time, end_time, developer_id, developer_name, progress, remark from pj_plan WHERE project_id = $1 ORDER BY id',

  updatePlanProgress: `UPDATE pj_plan SET progress = $1 WHERE id = $2`,

  projectTypes: 'SELECT id, type_name AS name FROM dic_type'
}
