var express = require('express');
var router = express.Router();
var User = require('../controller/userController')

let fs = require('fs');
let multer = require("multer");
let upload = multer({dest:'./public/avatar/'}).single("file");
let moreUpload = multer({dest:'./public/uploads/'}).array("file",5);
router.post('/register',User.register)
router.post('/login',User.login)
router.get('/logout',User.logout)
router.get('/isLogin',User.isLogin)
router.post('/updateUserInfo',User.updateUserInfo)
router.post('/setPassword',User.setPassword)
router.post('/bindEmail',User.bindEmail)
router.post('/bindPhone',User.bindPhone)
router.post('/editUserImg',upload,User.editUserImg)
router.post('/uploadMoreImg',moreUpload,User.uploadMoreImg);
router.post('/emailCode',User.emailCode)
router.post('/codeLogin',User.codeLogin)
router.post('/forgetPassword',User.forgetPassword)
router.get('/getUserAvatar',User.getUserAvatar)

module.exports = router;
