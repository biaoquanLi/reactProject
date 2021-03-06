// 包含n个接口请求的函数

import ajax from './ajax'

export const reqRegister = (user) => ajax('/register', user, 'POST') //注册

export const reqLogin = ({ //登录
    username,
    password
}) => ajax('/login', {
    username,
    password
}, 'POST')

export const reqUpdate = (user) => ajax('/update', user, 'POST') //修改

export const reqUser = () => ajax('/user') // 获取用户信息

export const reqUserList = (type) => ajax('/userlist', { type }) // 获取用户列表

export const reqChatList = () => ajax('/msglist') //获取当前用户的聊天消息列表

export const reqSetRead = (from) => ajax('/readmsg', { from }, 'POST') //修改指定消息为已读