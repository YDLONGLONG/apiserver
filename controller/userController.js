let fs = require('fs');
const hmac = require('../util/hmac')
const mail = require('../util/mail')
var { returnMsg, queryFN } = require('../util/dbconfig');

//获取用户信息
let getUser = (data)=>{
    let sql = `select * from user where email=? or phone=? or username=? or userid=?`;
    let sqlArr = [data,data,data,data];
    return queryFN(sql,sqlArr);
}

//创建用户详情表
let createUserInfo = (userid)=>{
    let sql = `insert into userinfo(userid,createtime) values(?,?)`;
    let sqlArr =  [userid,new Date()];
    return queryFN(sql,sqlArr);
}

//用户注册
let register = async (req,res)=>{
    let account = req.body.account;
    let password = req.body.password;
    let phone = /^1\d{10}$/;
    let email =  /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
    if(phone.test(account)){//手机号+密码
        //检测用户是否第一次注册
        let sql0 = `select * from user where phone=?`;
        let sqlArr0 = [account];
        let result0 = await queryFN(sql0,sqlArr0);
        if(result0.length==0){
            let avatar = 'https://picsum.photos/id/824/200/200';
            let sql = `insert into user(username,password,avatar,phone) value(?,?,?,?)`;
            let sqlArr = [account,password,avatar,account];
            let result = await queryFN(sql,sqlArr);
            if(result.affectedRows == 1){//执行成功
                //执行成功，获取用户信息
                //获取用户信息方法
                let user = await getUser(account);
                res.send(returnMsg(0,"注册成功",user))
                //绑定用户副表
                let userinfo =  await createUserInfo(user[0].userid);
                if(userinfo.affectedRows == 1){
                    return user;
                }else{
                    return false;
                }
            }else{
                res.send(returnMsg(1,"注册失败"))
            }
        }else{
            res.send(returnMsg(2,"该手机号已被注册"))
        }
    }else if(email.test(account)){//邮箱+密码
        //检测用户是否第一次注册
        let sql0 = `select * from user where email=?`;
        let sqlArr0 = [account];
        let result0 = await queryFN(sql0,sqlArr0);
        if(result0.length==0){
            let avatar = 'https://picsum.photos/id/824/200/200';
            let sql = `insert into user(username,password,avatar,email) value(?,?,?,?)`;
            let sqlArr = [account,password,avatar,account];
            let result = await queryFN(sql,sqlArr);
            if(result.affectedRows == 1){//执行成功
                //执行成功，获取用户信息
                //获取用户信息方法
                let user = await getUser(account);
                res.send(returnMsg(0,"注册成功",user))
                //绑定用户副表
                let userinfo =  await createUserInfo(user[0].userid);
                if(userinfo.affectedRows == 1){
                    return user;
                }else{
                    return false;
                }
            }else{
                res.send(returnMsg(1,"注册失败"))
            }
        }else{
            res.send(returnMsg(2,"该邮箱已被注册"))
        }
    }
    
}

//获取用户的详情
let getUserInfo = (userid)=>{
    let sql = `select * from userinfo where userid=?`;
    let sqlArr = [userid];
    return queryFN(sql,sqlArr);
}

//获取用户的头像
let getUserAvatar = async (req,res)=>{
    let userid = req.query.userid;
    let sql = `select avatar from user where userid=?`;
    let sqlArr = [userid];
    let result = await queryFN(sql,sqlArr);
    res.send(returnMsg(0,"获取头像成功",result))
}

//登录
let login = async (req,res)=>{
    let account = req.body.account,
        password = req.body.password;
    let phone = /^1\d{10}$/;
    let email =  /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
    if(phone.test(account)){//手机号+密码
        let sql = 'select * from user where phone=? and password=?';
        let sqlArr = [account,password];
        let result = await queryFN(sql,sqlArr);
        if(result!=0){
            let userid = result[0].userid;
            let result1 = await getUserInfo(userid);
            result[0].userinfo = result1[0];
            req.session.login = true
            res.send(returnMsg(0,"登录成功",result))
        }else{
            res.send(returnMsg(1,"手机号不存在或密码不正确"))
        }
    }else if(email.test(account)){//邮箱+密码
        let sql = `select * from user where email=? and password=?`;
        let sqlArr = [account,password];
        let result = await queryFN(sql,sqlArr);
        if(result!=0){
            let userid = result[0].userid;
            let result1 = await getUserInfo(userid);
            result[0].userinfo = result1[0];
            req.session.login = true
            res.send(returnMsg(0,"登录成功",result))
        }else{
            res.send(returnMsg(1,"邮箱不存在或密码不正确"))
        }
    }
}

//发送邮箱验证码
let emailCode = async (req,res)=>{
    let {email} = req.body
    if (!email) return res.send(returnMsg(2,"请输入邮箱"))
    let sql = 'select * from code where email=?';
    let sqlArr = [email];
    let code = await queryFN(sql,sqlArr)
    let randNum
    if(code.length==0){
        randNum = parseInt(Math.random() * 899999 + '') + 100000;
        await mail.sendMail(email, randNum)
        let sql1 = `insert into code(email,createtime,code) value(?,?,?)`;
        let sqlArr1 = [email,Date.now(),randNum];
        await queryFN(sql1,sqlArr1)
        return res.send(returnMsg(0,"验证码发送成功"))
    }else if(Number(code[0].createtime) + 5 * 60 * 1000  < Date.now()){
        randNum = parseInt(Math.random() * 899999 + '') + 100000;
        await mail.sendMail(email, randNum)
        let sql2 = `update code set createtime=?,code=? where email=?`;
        let sqlArr2 = [Date.now(),randNum,email];
        await queryFN(sql2,sqlArr2)
        return res.send(returnMsg(0,"验证码发送成功"))
    }else{
        res.send(returnMsg(1,"验证码未过期,请勿重复获取"))
    }
    
}

//验证码登录
let codeLogin = async (req,res)=>{
    let account = req.body.account,
        code = req.body.code;
    let phone = /^1\d{10}$/;
    let email =  /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
    if(phone.test(account)){//手机号+密码
        let sql = 'select * from user where phone=?';
        let sqlArr = [account];
        let result = await queryFN(sql,sqlArr);
        if(result!=0){
            let sql1 = 'select code,createtime from code where phone=?';
            let sqlArr1 = [account];
            let myCode = await queryFN(sql1,sqlArr1);
            if (code != myCode[0].code) return res.send(returnMsg(1,"验证码不正确"))
            if (Number(myCode[0].createtime) + 5 * 60 * 1000 > Date.now()) {
                let userid = result[0].userid;
                let result1 = await getUserInfo(userid);
                result[0].userinfo = result1[0];
                req.session.login = true
                res.send(returnMsg(0,"登录成功",result))
            }else{
                res.send(returnMsg(2,"验证码过期,请重新获取"))
            }
        }else{
            res.send(returnMsg(1,"手机号不存在或密码不正确"))
        }
    }else if(email.test(account)){//邮箱+密码
        let sql = `select * from user where email=?`;
        let sqlArr = [account];
        let result = await queryFN(sql,sqlArr);
        if(result!=0){
            let sql1 = 'select code,createtime from code where email=?';
            let sqlArr1 = [account];
            let myCode = await queryFN(sql1,sqlArr1);
            if (code != myCode[0].code) return res.send(returnMsg(1,"验证码不正确"))
            if (Number(myCode[0].createtime) + 5 * 60 * 1000 > Date.now()) {
                let userid = result[0].userid;
                let result1 = await getUserInfo(userid);
                result[0].userinfo = result1[0];
                req.session.login = true
                res.send(returnMsg(0,"登录成功",result))
            }else{
                res.send(returnMsg(2,"验证码过期,请重新获取"))
            }
        }else{
            res.send(returnMsg(1,"邮箱不存在或密码不正确"))
        }
    }
}

//退出
let logout = (req, res) => {
    req.session.destroy()
    res.send(returnMsg(0,"退出成功"))
}

//是否登录
let isLogin = (req, res) => {
    if (req.session.login) {
        res.send(returnMsg(0, '已登录'))
    }else{
        res.send(returnMsg(2, '未登录'))
    }
}

//修改用户名称
let setUserName = async (userid,username)=>{
    let sql = `update user set username=? where userid=?`;
    let sqlArr = [username,userid];
    let res = await queryFN(sql,sqlArr);
    if(res.affectedRows==1){
        return true;
    }else{
        return false;
    }
}

//修改用户详细信息
let setUserInfo = async (userid,age,sex,birthday,address)=>{
    let sql = `update userinfo set age=?,sex=?,birthday=?,address=? where userid=? `;
    let sqlArr = [age,sex,birthday,address,userid]
    let res = await queryFN(sql,sqlArr);
    if(res.affectedRows == 1){
        let user = await getUser(userid);
        let userinfo = await getUserInfo(userid);
        user[0].userinfo = userinfo[0];
        return user;
    }
}

//修改资料
let updateUserInfo = async (req,res)=>{
    let {userid,username,age,sex,birthday,address} = req.body;
    let result = await setUserName(userid,username);
    if(result){
        let data = await setUserInfo(userid,age,sex,birthday,address);
        if(data.length){
            res.send(returnMsg(0,"用户信息修改成功",data))
        }else{
            res.send(returnMsg(1,"用户信息修改失败"))
        }
    }else{
        res.send(returnMsg(1,"用户信息修改失败"))
    }
}

//检查用户密码
let checkUserPwd = async (userid)=>{
    let sql = `select password from user where userid=?`;
    let sqlArr = [userid];
    let res = await queryFN(sql,sqlArr);
    if(res.length){
        return res[0].password;
    }else{
        return 0;
    }
}

//修改用户密码
let setPassword = async (req,res)=>{
    let {userid,oldpassword,newpassword}=req.body;
    let userPwd = await checkUserPwd(userid);    
    if(userPwd){
        if(userPwd == oldpassword){
            let sql = `update user set password=? where userid=?`;
            let sqlArr = [newpassword,userid];
            let result = await queryFN(sql,sqlArr);
            if(result.affectedRows){
                res.send(returnMsg(0,"密码修改成功"))
            }else{
                res.send(returnMsg(1,"密码修改失败"))
            }
        }else{
            res.send(returnMsg(2,"原密码不正确"))
        }
    }else{
        let sql = `update user set password=? where userid=?`;
        let sqlArr = [newpassword,userid];
        let result = await queryFN(sql,sqlArr);
        if(result.affectedRows){
            res.send(returnMsg(0,"密码修改成功"))
        }else{
            res.send(returnMsg(1,"密码修改失败"))
        }
    }    
}

//忘记密码
let forgetPassword = async (req,res)=>{
    let account = req.body.account,
        code = req.body.code,
        password = req.body.password;
    let phone = /^1\d{10}$/;
    let email =  /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
    if(phone.test(account)){//手机号+密码
        let sql = 'select * from user where phone=?';
        let sqlArr = [account];
        let result = await queryFN(sql,sqlArr);
        if(result!=0){
            let sql1 = 'select code,createtime from code where phone=?';
            let sqlArr1 = [account];
            let myCode = await queryFN(sql1,sqlArr1);
            if (code != myCode[0].code) return res.send(returnMsg(1,"验证码不正确"))
            if (Number(myCode[0].createtime) + 5 * 60 * 1000 > Date.now()) {
                let sql2 = `update user set password=? where phone=?`;
                let sqlArr2 = [password,account];
                await queryFN(sql2,sqlArr2);
                res.send(returnMsg(0,"密码修改成功"))
            }else{
                res.send(returnMsg(2,"验证码过期,请重新获取"))
            }
        }else{
            res.send(returnMsg(1,"手机号不存在或密码不正确"))
        }
    }else if(email.test(account)){//邮箱+密码
        let sql = `select * from user where email=?`;
        let sqlArr = [account];
        let result = await queryFN(sql,sqlArr);
        if(result!=0){
            let sql1 = 'select code,createtime from code where email=?';
            let sqlArr1 = [account];
            let myCode = await queryFN(sql1,sqlArr1);
            if (code != myCode[0].code) return res.send(returnMsg(1,"验证码不正确"))
            if (Number(myCode[0].createtime) + 5 * 60 * 1000 > Date.now()) {
                let sql2 = `update user set password=? where email=?`;
                let sqlArr2 = [password,account];
                await queryFN(sql2,sqlArr2);
                res.send(returnMsg(0,"密码修改成功"))
            }else{
                res.send(returnMsg(2,"验证码过期,请重新获取"))
            }
        }else{
            res.send(returnMsg(1,"邮箱不存在或密码不正确"))
        }
    }
}

//绑定用户邮箱接口
let bindEmail = async (req,res)=>{
    let {userid,email} = req.body;
    let sql = `update user set email=? where userid=?`;
    let sqlArr = [email,userid];
    let result = await queryFN(sql,sqlArr);
    if(result.affectedRows == 1){
        res.send(returnMsg(0,"邮箱绑定成功"))
    }else{
        res.send(returnMsg(1,"邮箱绑定失败"))
    }
}

//绑定用户手机号接口
let bindPhone = async (req,res)=>{
    let {userid,phone} = req.body;
    let sql = `update user set phone=? where userid=?`;
    let sqlArr = [phone,userid];
    let result = await queryFN(sql,sqlArr);
    if(result.affectedRows == 1){
        res.send(returnMsg(0,"手机号绑定成功"))
    }else{
        res.send(returnMsg(1,"手机号绑定失败"))
    }
}
//图片上传
let editUserImg = async (req,res)=>{
    if(req.file.length === 0){
        res.render('error',{message:'上传文件不能为空！'});
    }else{
        let file = req.file;
        fs.renameSync('./public/avatar/'+file.filename,'./public/avatar/'+file.originalname);
        res.set({
            'content-type':'application/JSON; charset=utf-8'
        })
        let {userid}=req.body;
        let avatar = '/public/avatar/'+file.originalname;
        let sql =`update user set avatar=? where userid=?`;
        let sqlArr = [avatar,userid];
        let result = await queryFN(sql,sqlArr);
        if(result.affectedRows == 1){
            res.send(returnMsg(0,"头像修改成功",avatar))
        }else{
            res.send(returnMsg(1,"头像修改失败"))
        }
    }
}

//批量多图上传
let uploadMoreImg=async(req,res)=>{
    //console.log(req.files)
    if(req.files.length === 0){
        res.render('error',{message:'上传文件不能为空！'});
    }else{
        let sql = `insert into image (url,createtime,userid) values `;
        let sqlArr = [];
        for(var i in req.files){
            res.set({
                'content-type':'application/json; charset=utf8'
            });
            let file = req.files[i];
            fs.renameSync('./public/uploads/'+file.filename,'./public/uploads/'+file.originalname);
            let {userid} = req.query;
            let url = '/public/uploads/'+file.originalname;
            if(req.files.length-1 == i){
                sql += '(?)'
            }else{
                sql += '(?),'
            }
            //console.log(sql);
            sqlArr.push([url,Date.now(),userid])
        }
        //批量存储到数据库
        let result = await queryFN(sql,sqlArr)
        console.log(result)
        if(result.affectedRows == 3){
            res.send(returnMsg(0,"图片上传成功",req.files))
        }else{
            res.send(returnMsg(1,"图片上传失败"))
        }
    }
}

module.exports = {
    register,
    login,
    logout,
    isLogin,
    updateUserInfo,
    setPassword,
    bindEmail,
    bindPhone,
    editUserImg,
    uploadMoreImg,
    emailCode,
    codeLogin,
    forgetPassword,
    getUserAvatar
}