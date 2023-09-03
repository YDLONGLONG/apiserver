var { returnMsg, queryFN } = require('../util/dbconfig');

//发表动态
let sendTrend = async (req,res)=>{
    let {userid,title,content} = req.body;
    let sql = `insert into trend(userid,title,content,createdate) values(?,?,?,?)`;
    let sqlArr =  [userid,title,content,new Date()];
    let result = await queryFN(sql,sqlArr);
    if(result.affectedRows == 1){
        res.send(returnMsg(0,"发表动态成功"))
    }else{
        res.send(returnMsg(1,"发表动态失败"))
    }
}

//删除动态
let deleteTrend = async (req,res)=>{
    let {trendid} = req.body;
    let sql = `delete from trend where trendid=?`;
    let sqlArr =  [trendid];
    let result = await queryFN(sql,sqlArr);
    if(result.affectedRows == 1){
        res.send(returnMsg(0,"删除动态成功"))
    }else{
        res.send(returnMsg(1,"删除动态失败"))
    }
}

//分页获取动态
let getAllTrend = async (req,res)=>{
    let {nowpage} = req.query;
    let pagesize = 5;
    let sql = `select * from trend ORDER BY trendid DESC limit ?,?`;
    let sqlArr =  [pagesize*nowpage,pagesize];
    let result = await queryFN(sql,sqlArr);
    if(result.length!=0){
        res.send(returnMsg(0,"分页获取动态成功",result))
    }else{
        res.send(returnMsg(1,"分页获取动态失败"))
    }
}

//根据id获取动态
let getTrend = async (req,res)=>{
    let {userid} = req.query;
    let sql = `select * from trend where userid=?`;
    let sqlArr =  [userid];
    let result = await queryFN(sql,sqlArr);
    if(result.length!=0){
        res.send(returnMsg(0,"获取动态成功",result))
    }else{
        res.send(returnMsg(1,"获取动态失败"))
    }
}

// 获取单个动态详情
let getTrendInfo = async (req,res)=>{
    let {trendid} = req.query;
    let sql = `select * from trend where trendid=?`;
    let sqlArr =  [trendid];
    let result = await queryFN(sql,sqlArr);
    if(result.length!=0){
        res.send(returnMsg(0,"获取动态详情成功",result))
    }else{
        res.send(returnMsg(1,"获取动态详情失败"))
    }
}

//发表评论
let sendComment = async (req,res)=>{
    let {trendid,commentator,content} = req.body;
    let sql = `insert into trendcomment(trendid,commentator,content,createdate) values(?,?,?,?)`;
    let sqlArr =  [trendid,commentator,content,new Date()];
    let result = await queryFN(sql,sqlArr);
    if(result.affectedRows == 1){
        res.send(returnMsg(0,"发表评论成功"))
    }else{
        res.send(returnMsg(1,"发表评论失败"))
    }
}

//删除评论
let deleteComment = async (req,res)=>{
    let {commentid} = req.body;
    let sql = `delete from trendcomment where commentid=?`;
    let sqlArr =  [commentid];
    let result = await queryFN(sql,sqlArr);
    if(result.affectedRows == 1){
        res.send(returnMsg(0,"删除评论成功"))
    }else{
        res.send(returnMsg(1,"删除评论失败"))
    }
}

//获取全部评论
let getComment  = async (req,res)=>{
    let {trendid} = req.query;
    let sql = `select * from trendcomment where trendid=?`;
    let sqlArr =  [trendid];
    let result = await queryFN(sql,sqlArr);
    if(result.length!=0){
        res.send(returnMsg(0,"获取评论成功",result))
    }else{
        res.send(returnMsg(1,"获取评论失败"))
    }
}

//回复评论
let sendReply= async (req,res)=>{
    let {commentid,commentator,you,content} = req.body;
    let sql = `insert into trendreply(commentid,commentator,you,reply_content,reply_createdate) values(?,?,?,?,?)`;
    let sqlArr =  [commentid,commentator,you,content,new Date()];
    let result = await queryFN(sql,sqlArr);
    if(result.affectedRows == 1){
        res.send(returnMsg(0,"回复评论成功"))
    }else{
        res.send(returnMsg(1,"回复评论失败"))
    }
}

//删除回复
let deleteReply= async (req,res)=>{
    let {replyid} = req.body;
    let sql = `delete from trendreply where replyid=?`;
    let sqlArr =  [replyid];
    let result = await queryFN(sql,sqlArr);
    if(result.affectedRows == 1){
        res.send(returnMsg(0,"删除回复成功"))
    }else{
        res.send(returnMsg(1,"删除回复失败"))
    }
}

//获取全部回复
let getReply  = async (req,res)=>{
    let {commentid} = req.query;
    let sql = `select * from trendreply where commentid=?`;
    let sqlArr =  [commentid];
    let result = await queryFN(sql,sqlArr);
    if(result.length!=0){
        res.send(returnMsg(0,"获取回复成功",result))
    }else{
        res.send(returnMsg(1,"获取回复失败"))
    }
}

//获取全部评论回复
let getAllCR  = async (req,res)=>{
    let {commentid} = req.query;
    let sql = `select trendcomment.*,user.username from trendcomment,user where user.username=trendcomment.commentator and commentid=?`;
    let sqlArr =  [commentid];
    let result = await queryFN(sql,sqlArr);

    let sql1 = `select trendreply.*,user.username from trendreply,user where user.username=trendreply.you and commentid=?`;
    let sqlArr1 =  [commentid];
    let result1 = await queryFN(sql1,sqlArr1);
    result[0].reply = result1
    
    if(result.length!=0){
        res.send(returnMsg(0,"获取评论成功",result))
    }else{
        res.send(returnMsg(1,"获取评论失败"))
    }
}

//查找动态根据标题或者内容
let searchTrend = async (req,res)=>{
    let {keyWord,nowpage} = req.query;
    let pagesize = 5;
    let sql = `select * from trend where title like '%${keyWord}%' or content like '%${keyWord}%' ORDER BY trendid DESC limit ?,?`;
    let sqlArr =  [pagesize*nowpage,pagesize];
    let result = await queryFN(sql,sqlArr);
    if(result.length!=0){
        res.send(returnMsg(0,"查找动态成功",result))
    }else{
        res.send(returnMsg(1,"查找动态失败"))
    }
}

module.exports = {
    sendTrend,
    deleteTrend,
    getTrend,
    getTrendInfo,
    sendComment,
    deleteComment,
    getComment,
    sendReply,
    getAllTrend,
    getReply,
    deleteReply,
    getAllCR,
    searchTrend
}