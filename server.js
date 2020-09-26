require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
//DB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify : false
})
mongoose.connection.on('connected', ()=> {
    console.log('Mongoose is connected !');
})
//=====
const apiPostRouter = require('./routes/posts.router')
const apiUserRouter = require('./routes/users.router')
const apiAuthRouter = require('./routes/auth.router')

const app = express()
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
  }))
//router
app.use('/api/posts', cors(), apiPostRouter)
app.use('/api/users', cors(), apiUserRouter)
app.use('/api/auth', cors(), apiAuthRouter)

app.listen(process.env.PORT || 3000)
