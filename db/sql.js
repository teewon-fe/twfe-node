const format = require('pg-format')

module.exports = {
  existuser: 'SELECT 1 FROM tw_user WHERE user_name = $1',

  fetchPassword: 'SELECT id, user_password FROM tw_user WHERE user_name = $1',

  fetchPasswordById: 'SELECT id, user_password FROM tw_user WHERE id = $1',

  inserUser: 'INSERT INTO tw_user(user_name, user_password, user_group, mobile) VALUES($1, $2, $3, $4) RETURNING id',

  user: 'SELECT tw_user.id, user_name, user_group, group_name, mobile FROM tw_user inner join tw_group on tw_user.user_group = tw_group.id WHERE tw_user.id = $1',

  userList: 'SELECT id, user_name AS name, user_group AS groupId, mobile FROM tw_user WHERE user_group = $1',

  devGroups: 'SELECT id, group_name AS name FROM tw_group',

  projectDegreen: 'SELECT id, degreen_name, task_time, remark from dic_degreen  ORDER BY id',

  insertProject: 'INSERT INTO project(project_name, project_version, project_type, dev_group, developer_ids, developer_names, project_leader_id, project_leader_name, project_svn, project_prd_url, project_design_svn, project_psd_svn, project_api_svn, project_test_case_svn, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING id',

  updateProject: `UPDATE project SET project_name = $2, project_version = $3, project_type = $4, dev_group = $5, developer_ids = $6, developer_names = $7, project_leader_id = $8, project_leader_name = $9, project_svn = $10, project_prd_url = $11, project_design_svn = $12, project_psd_svn = $13, project_api_svn = $14, project_test_case_svn = $15 WHERE id = $1`,

  deleteProject: 'delete from project where id = $1',

  genProjects (type) {
    const sql = 'SELECT id, project_name, project_version, project_type,  dev_group, developer_ids, developer_names, project_leader_id, project_leader_name, project_svn,project_prd_url, project_design_svn, project_psd_svn, project_api_svn, project_test_case_svn, status from project '

    if (type === 'id') {
      return sql + 'WHERE id = $1'
    } else if (type === 'status') {
      return sql + 'WHERE status = $1 ORDER BY id LIMIT $2 OFFSET $3'
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

  deleteTimeNode (type) {
    const sql = 'delete from pj_time_node where '

    if (type === 'project') {
      return sql + 'project_id = $1'
    } else {
      return sql + 'id = $1'
    }
  },

  updateTimeNode: 'UPDATE pj_time_node SET time_node_name = $2, start_time = $3, remark = $4 WHERE id = $1',

  timeNodes: 'SELECT id, time_node_name, project_id, start_time, done_time, remark from pj_time_node WHERE project_id = $1 ORDER BY start_time',

  insertProjectPlan (values) {
    return format('INSERT INTO pj_plan(project_id, task_name, task_type, degreen, priority, task_time, start_time, end_time, developer_id, developer_name, no) VALUES %L RETURNING id', values)
  },

  plans: 'SELECT id, project_id, task_name, task_type, degreen, priority, task_time, start_time, end_time, developer_id, developer_name, progress, remark from pj_plan WHERE project_id = $1 ORDER BY no',

  updatePlan: 'UPDATE pj_plan SET task_name = $2, task_type = $3, degreen = $4, priority = $5, task_time = $6, start_time = $7, end_time = $8, developer_id = $9, developer_name = $10, no = $11 WHERE id = $1',

  deletePlan (type) {
    const sql = 'delete from pj_plan where '

    if (type === 'project') {
      return sql + 'project_id = $1'
    } else {
      return sql + 'id = $1'
    }
  },
  
  updatePlanProgress: `UPDATE pj_plan SET progress = $1 WHERE id = $2`,

  projectTypes: 'SELECT id, type_name AS name FROM dic_type'
}
