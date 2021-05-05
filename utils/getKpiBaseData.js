const db = require('../db')
const sql = require('../db/sql')

module.exports = {
 async getKpiBaseData (project_id, developer_id) {
    const taskTime = await db.query(sql.countTaskTime, [project_id, developer_id])

    return {
      taskTime,
      userLevel
    }
 }
}