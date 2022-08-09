const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const {check, validationResult} = require('express-validator')
const User = require('./user')
const user = require('./user')
const PORT = process.env.PORT || 5000

const app = express()

const createPath = (page) => path.resolve(__dirname, 'views', `${page}.ejs`)

app.listen(PORT, () => console.log(`server work ${PORT}`))

mongoose.connect("mongodb+srv://khan:12345@cluster0.fxhhdbb.mongodb.net/?retryWrites=true&w=majority")
        .then((res)=> console.log('db connect'))

app.use(express.urlencoded())
app.use(methodOverride('_method'))

app.get('/', (req, res) => {
    res.render(createPath('main'), {id: "0"})
})

app.get('/edit/:id', async (req, res) => {
    const id = req.params.id
    const user = await User.findById(id)
    password = user.password
    username = user.username
    res.render(createPath('edit'), {id, password, username})
})

app.put('/edit/:id', [
    check('newPassword').isLength({min:1, max:10}),
    check('newName').isLength({min:1, max:10})
], async (req, res) => {
    try{
        const errors = validationResult(req)
            if(!errors.isEmpty()){
                // return res.status(400).json({message: "Поля не должны быть пустыми"})
                return res.status(400).render(createPath('error'), {message: 'Поля не должны быть пустыми'})
            }
        const id = req.params.id
        const newPassword = req.body.newPassword
        const newName = req.body.newName
        await User.findByIdAndUpdate(id, {password: newPassword, username: newName}, {new: true})
        res
        .status(200)
        .render(createPath('error'), {message: 'Данные изменены'})
    }catch(e){
        res.status(400).render(createPath('error'), {message: 'Error 404'})
    }
})

app.post('/login/:id', async (req, res) => {
    try{
        console.log(req.body)
        const {username, password} = req.body
        const user = await User.findOne({username})
        res.status(200).render(createPath('cab'), {
            name: username,
            id: user._id
        })
    } catch(e){
        res.status(400).render(createPath('error'), {message: 'Error 404'})
    }
})

app.delete('/login/:id', async (req, res) => {
    try{
        await User.findByIdAndDelete(req.params.id)
        .then(()=>{return res.sendStatus(400).render(createPath('error'), {message: 'Error 404'})})
    } catch(e){
        res.status(400).render(createPath('error'), {message: 'Error 404'})
    }
})

app.post('/registration', async (req, res) => {
    try{
        const {username, password} = req.body
        const candidate = await User.findOne({username})
        if (candidate){
            return res.status(400).json({message: "Пользователь с таким логином уже есть"})
        }
        const user = new User({ username, password})
        await user.save()
        res.status(200).render(createPath('error'), {message: 'Вы успешно зарегистрированы'})
    } catch(e){
        console.log(e)
        res.status(400)
        .render(createPath('error'), {message: 'Поля не должны быть пустыми'})
    }
})

app.post('/login', async (req, res) => {
    try{
        const {username, password} = req.body
        const user = await User.findOne({username})
        if(!user){
            return res.status(400).render(createPath('error'), {message: `Пользователь ${username} не найден`})
        }
        if(password != user.password){
            return res.status(400).render(createPath('error'), {message: 'Пароль неверен'})
        }
        const id = user._id
        res.redirect(307, `/login/${id}`)
    } catch(e){
        console.log(e)
        res.status(400)
        .render(createPath('error'), {message: 'Поля не должны быть пустыми'})
    }
})

app.use((req, res) => {
    if(req.url === '/delete'){
        res
        .status(200)
        .render(createPath('error'), {message: 'Ваш аккаунт успешно был удален'})
    }
    // if(req.url === '/edited'){
    //     res
    //     .status(200)
    //     .render(createPath('error'), {message: 'Пароль изменен'})
    // }
    res
        .status(404)
        .render(createPath('error'), {message: 'Error 404'})
})