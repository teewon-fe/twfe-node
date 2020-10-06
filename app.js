const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const port = 3000
const genData = require('./middleware/data')
const auth = require('./middleware/auth')

// cross rdomain
app.all('*', (req, res, next) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PUT,POST,GET,UPDATE,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': '*'
  })

  if (req.method === 'OPTIONS') {
    res.send(200)
  } else {
    next()
  }
})

// swagger
app.use('/v1', express.static('swagger'))

// vue-www
app.use(express.static('www'))

app.use(bodyParser.json())
app.use(genData)
app.use(auth)

// user route
const usersRouter = require('./routes/users');
app.use('/user', usersRouter);

// dic route
const dicRouter = require('./routes/dic');
app.use('/dic', dicRouter);

// project route
const projectsRouter = require('./routes/projects');
app.use('/project', projectsRouter);

app.listen(port, () => console.log(`Example app listening on port ${port}!`))