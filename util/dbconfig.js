const mysql = require("mysql");

const pool = mysql.createPool({
    host: "localhost",  // 连接的服务器(代码托管到线上后，需改为内网IP，而非外网)
    port: 3306, // mysql服务运行的端口
    database: "apiserver", // 选择某个数据库
    user: "common",   // 用户名
    password: "123456", // 用户密码
})

const query = (sql,sqlArr,callback) => {
    pool.getConnection(function (err,connection) {
        connection.query(sql,sqlArr,function (err, rows) {
            callback(err, rows)
            connection.release()
        })
    })
}

const returnMsg = (errCode, message, data) => {
    return {
        errCode: errCode || 0,
        message: message || "",
        data: data || {}
    }
}

const queryFN = (sql,sqlArr) => {
    return new Promise((resolve, reject) => {
        query(sql,sqlArr, (err, rows) => {
            if (err) reject(err);
            resolve(rows)
        })
    })
}

module.exports = {
    query, returnMsg, queryFN
}