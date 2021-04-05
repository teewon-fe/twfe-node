module.exports = {
  noAuth: {
    code: '3000',
    message: '用户未登录',
    resType: 'error'
  },
  loginSuccess: {
    code: '200',
    message: '登录成功',
    resType: 'success'
  },
  passwordError: {
    code: '3001',
    message: '用户名或密码错误',
    resType: 'error'
  },
  noUser: {
    code: '3002',
    message: '用户不存在',
    resType: 'error'
  },
  registerSuccess: {
    message: '注册成功'
  },
  dbError:{
    code: '3003',
    message: '数据异常',
    resType: 'error'
  },
  paramsError:{
    code: '3004',
    message: '参数错误',
    resType: 'error'
  },
  success: {
    message: '操作成功'
  }
}
