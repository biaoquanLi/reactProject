var express = require('express');
var router = express.Router();
const {
    UserModel,
    ChatModel
} = require('../db/models')
const md5 = require('blueimp-md5')
const filter = {
    password: 0,
    __v: 0
} // 查询时过滤出指定的属性
// 注册接口
router.post('/register', (req, res) => {
    const {
        username,
        password,
        type
    } = req.body
    UserModel.findOne({
        username
    }, function (error, user) { // 先查询该用户是否已注册
        console.log('user', user)
        if (user) { //已注册,提示失败信息
            res.send({
                code: 1,
                msg: '此用户已存在'
            })
        } else {
            new UserModel({
                username,
                type,
                password: md5(password)
            }).save(function (error, user) {
                res.cookie('userId', user._id, {
                    maxAge: 1000 * 60 * 60 * 24
                })
                if (!error) {
                    res.send({
                        code: 0,
                        data: {
                            _id: user._id,
                            username,
                            type
                        }
                    })
                }
            })
        }
    })
})

// 登录接口
router.post('/login', (req, res) => {
    const {
        username,
        password
    } = req.body
    UserModel.findOne({
        username,
        password: md5(password)
    }, filter, (error, user) => {
        if (user) { //登录成功
            res.cookie('userId', user._id, {
                maxAge: 1000 * 60 * 60 * 24
            })
            res.send({
                code: 0,
                data: user
            })
        } else { // 登录失败
            res.send({
                code: 1,
                msg: '用户名或密码错误'
            })
        }
    })
})

// 更新用户信息
router.post('/update', (req, res) => {
    const userid = req.cookies.userId
    const {
        header,
        info,
        post,
        salary,
        company
    } = req.body
    if (!userid) {
        res.send({
            code: 1,
            msg: '请先登录'
        })
    } else {
        UserModel.findByIdAndUpdate({
            _id: userid
        }, {
            header,
            info,
            post,
            salary,
            company
        }, (error, oldUser) => {
            if (!oldUser) {
                res.clearCookie('userId')
                res.send({
                    code: 1,
                    msg: '请先登录'
                })
            } else {
                const data = Object.assign(oldUser, {
                    header,
                    info,
                    post,
                    salary,
                    company
                })
                res.send({
                    code: 0,
                    data
                })
            }
        })
    }
})

//获取用户信息
router.get('/user', (req, res) => {
    const userId = req.cookies.userId
    if (userId) {
        UserModel.findOne({
            _id: userId
        }, filter, (error, user) => {
            res.send({
                code: 0,
                data: user
            })
        })
    } else {
        res.send({
            code: 1,
            msg: '请先登录'
        })
    }
})

// 获取用户列表
router.get('/userlist', (req, res) => {
    const {
        type
    } = req.query
    UserModel.find({
        type
    }, filter, (error, userList) => {
        res.send({
            code: 0,
            data: userList
        })
    })
})
// 获取当前用户的聊天消息列表
router.get('/msglist', (req, res) => {
    const userId = req.cookies.userId

    UserModel.find((error, data) => {
        console.log('data', data)
        var users = {}
        data.forEach(value => {
            users[value._id] = {
                username: value.username,
                header: value.header
            }
        })
        ChatModel.find({
            '$or': [{
                from: userId
            }, {
                to: userId
            }]
        }, (error, chatMsgs) => {
            res.send({
                code: 0,
                data: {
                    users,
                    chatMsgs
                }
            })
        })
    })
})
// 修改指定消息为已读
router.post('/readmsg', (req, res) => {
    const {
        from
    } = req.body
    const to = req.cookies.userId
    ChatModel.update({
        from,
        to,
        read: false
    }, {
        read: true
    }, {
        multi: true
    }, (error, doc) => {
        res.send({
            code: 0,
            data: doc.nModified
        }) // 更新的数量    
    })

})
module.exports = router;