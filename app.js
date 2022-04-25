var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var session = require('express-session')

var userRouter = require('./router/user');
var trendRouter = require('./router/trend');
var app = express();

//改写
var http = require('http');
var server = http.createServer(app);

//跨域
var cors = require("cors");
app.use(cors({
    origin: ['http://localhost','http://localhost:4002'],
    credentials: true
}))

//session
app.use(
    session({
        cookie: {maxAge: 7 * 24 * 60 * 60},
        secret: 'lyc',
        resave: false,
        saveUninitialized: true
    })
)

//静态资源
app.use(express.static(path.join(__dirname, '/')));
//post请求
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use('/user', userRouter);
app.use('/trend', trendRouter);
server.listen(3000,()=>{console.log("各单位请注意,3000端口已被征用")});