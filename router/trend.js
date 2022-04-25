var express = require('express');
var router = express.Router();
var Trend = require('../controller/trendController')

router.post('/sendTrend',Trend.sendTrend)
router.post('/deleteTrend',Trend.deleteTrend)
router.get('/getTrend',Trend.getTrend)
router.get('/getTrendInfo',Trend.getTrendInfo)
router.post('/sendComment',Trend.sendComment)
router.post('/deleteComment',Trend.deleteComment)
router.get('/getComment',Trend.getComment)
router.post('/sendReply',Trend.sendReply)
router.get('/getReply',Trend.getReply)
router.post('/deleteReply',Trend.deleteReply)
router.get('/getAllTrend',Trend.getAllTrend)

module.exports = router;
