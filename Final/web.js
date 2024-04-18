const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const business = require('./business.js')

let app = express()
const {engine} = require('express-handlebars')
app.set('views',__dirname+"/templates");
app.set('view engine','handlebars')
app.engine('handlebars',engine())
app.use(bodyParser.urlencoded())
app.use(cookieParser())


app.get('/', async(req, res) => {
    let loco = await business.getLocations()
    res.render('index', {location: loco, message: req.query.message})
})

app.get('/login', (req, res) => {
    res.render('mainlogin', {message: req.query.message})
})

app.post('/login', async (req,res) => {
    let username = req.body.username
    let password = req.body.password
    if (username == "" || password == "") {
        res.redirect("/login/?message=Invalid Username/Password")
        return
    }
    let userType = await business.checkLogin(username, password)
    if (!userType) {
        res.redirect("/login/?message=Invalid Username/Password")
        return
    }
    
    let session = await business.startSession({
        UserName: username,
        UserType: userType
    })
    res.cookie('Session_id', session.uuid, {expires: session.expiry})

    if (userType == 'admin') {
        res.redirect('/admin')
    }
    else if (userType == 'member') {
        res.redirect('/member')
    }
})


app.get('/member', async (req, res) => {
    let loco = await business.getLocations()
    let sessionKey = req.cookies.Session_id
    if (!sessionKey) {
        res.redirect("/?message=Not logged in1")
        return
    }
    let sessionData = await business.getSessionData(sessionKey)
    if (!sessionData) {
        res.redirect("/?message=Not logged in]")
        return
    }

    if (sessionData && sessionData.Data && sessionData.Data.UserType && sessionData.Data.UserType != 'member') {
        res.redirect("/?message=Invalid User Type")
        return
    }
    res.render('member_landing', {username: sessionData.Data.UserName, location: loco, message: req.query.message})
})

app.get('/logout', async (req, res) => {
    await business.deleteSession(req.cookies.Session_id)
    res.cookie('Session_id', '', {expires: new Date(Date.now())})
    res.redirect('/')
})

app.get('/admin', async (req, res) => {
    let sessionKey = req.cookies.Session_id
    if (!sessionKey) {
        res.redirect("/?message=Not logged in")
        return
    }
    let sessionData = await business.getSessionData(sessionKey)
    if (!sessionData) {
        res.redirect("/?message=Not logged in")
        return
    }
    if (sessionData && sessionData.Data && sessionData.Data.UserType && sessionData.Data.UserType != 'admin') {
        res.redirect("/?message=Invalid User Type")
        return
    }
    res.render('admin_landing', {username: sessionData.Data.UserName})
})

app.get('/register', (req, res) => {
    res.render('mainregister', {message: req.query.message});
})

app.post('/register', async(req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let conPass = req.body.conPass
    let email = req.body.email

    if (!username || !password || !conPass || !email) {
        return res.redirect('/register?message=Please fill out all fields');
    }

    let tr = await business.registerUser(username, password, conPass, email);
    if (!tr) {
        res.render('error')
    }

    res.redirect('/login?message=Registration successful. Please log in.');
});

app.post('/textPost', async(req,res)=>{
    let location = req.body.location
    let foodPlaced = req.body.foodPlaceed
    let waterPlaced = req.body.waterPlaced
    let foodRemaining = req.body.foodRemaining
    let description = req.body.description
    let picture = req.body.picture
    let catsCount = req.body.catsCount
    let data = {
        location:location,
        foodPlaced:foodPlaced,
        foodRemaining:foodRemaining,
        waterPlaced:waterPlaced,
        description:description,
        picture:picture,
        catsCount:catsCount
    }
    business.savePost(data)
    res.redirect('/member')
   
})

app.get('/post', async (req, res) => {
    let sessionKey = req.cookies.Session_id
    if (!sessionKey) {
        res.redirect("/?message=Not logged in1")
        return
    }
    let sessionData = await business.getSessionData(sessionKey)
    if (!sessionData) {
        res.redirect("/?message=Not logged in2")
        return
    }
    res.render('post', {username: sessionData.Data.UserName})
})

app.get('/forgot-password', async (req, res) => {
    res.render('forgotPassword')
})

app.post('/forgot-password', async (req, res) => {
    let email = req.body.email
    let t = await business.resetPass(email)
    if (!t) {
        res.redirect('/forgot-password?message=email is not found', {message: message})
    }
    res.redirect('forgot-password2')
})

app.get('/forgot-password2', async (req, res) => {
    res.render('forgotPassword2')
})

app.post('/forgot-password2', async (req, res) => {
    let key = req.body.key
    let pass = req.body.password
    let email = req.body.email
    let data = {
        key:key,
        password:pass,
        email:email
    }
    let t = await business.checkKey(data)
    if (!t) {
        res.redirect('/forgot-password2?message=email is not found', {message: message})
    }
    res.redirect('login')
})


app.get('/reset-password', async (req, res) => {
    res.render('resetPassword')
})


app.post('/reset-password', async (req, res) => {
    let username = req.body.username
    let oldPass = req.body.oldPass
    let newPass = req.body.newPass
    let conPass = req.body.conPass
    let data = {
        oldPass : oldPass,
        newPass : newPass,
        conPass : conPass,
        username : username
    }
    let t = await business.updatePass(data)
    if (!t) {
        res.redirect('/reset-password?message=error', {message: message})
    }
    else{
        res.redirect('/login?message=please login', {message: message})
    }

})

app.use((req, res, next) => {
    res.status(404).render('error');
});


app.listen(8000, () => { console.log("Running")})
