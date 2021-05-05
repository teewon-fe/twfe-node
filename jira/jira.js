var JiraApi = require('jira-client');

var jira = new JiraApi({
  protocol: 'http',
  host: '192.168.102.222',
  port: '8888',
  username: 'twfe',
  password: '123456',
  apiVersion: '2',
  strictSSL: false
});


// jira.searchJira('affectedVersion in versionMatch("V001R001C01SP10") AND created >= 2021-01-01 AND created <= 2021-04-30 AND 问题产生人 in (蒋皓天) ORDER BY priority DESC').then(function(issue) {
//   console.log('Status: ' + issue.fields.status.name);
// }).catch(function(err) {
//   console.error(err);
// })

module.exports = {
  mapJql (keyword, username, type) {
    if (type === 'normal_bug_num') {
      return `affectedVersion in versionMatch("${keyword}") AND created >= 2021-01-01 AND created <= 2021-04-30 AND 问题产生人 in (${username})`
    } else if (type === 'red_bug_num') {
      return `affectedVersion in versionMatch("${keyword}") AND priority = '严重'  AND created >= 2021-01-01 AND created <= 2021-04-30 AND 问题产生人 in (${username})`
    } else if (type === 'org_bug_num') {
      return `affectedVersion in versionMatch("${keyword}") AND (D_回归失败次数 > 0 OR 缺陷来源细分 = '修改引入' OR status = 'Reopened')  AND created >= 2021-01-01 AND created <= 2021-04-30 AND 问题产生人 in (${username})`
    }
  },

  async searchJira (params) {
    const types = ['normal_bug_num', 'red_bug_num', 'org_bug_num']

    for (const user of params.users) {
      for (let i = 0; i < types.length; i++) {
        const type = types[i]

        await jira.searchJira(this.mapJql(params.keyword, user.developer_name, type)).then(function(issue) {
          user[type] = issue.total
          // console.log('Status: ' + issue.fields.status.name);
        }).catch(function(err) {
          // console.error(err);
        })
      }
    }

    return params
  }
}



