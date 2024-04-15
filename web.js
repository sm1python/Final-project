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
    res.render('login', {message: req.query.message})
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

    if (sessionData && sessionData.Data && sessionData.Data.UserType && sessionData.Data.UserType != 'member') {
        res.redirect("/?message=Invalid User Type")
        return
    }
    res.render('member_landing', {username: sessionData.Data.UserName})
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
    res.render('register', {message: req.query.message});
})

app.post('/register', async(req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let userType = req.body.userType;

    // Basic input validation
    if (!username || !password) {
        return res.redirect('/register?message=Please fill out all fields');
    }
    // Check if the username already exists
    let existingUser = await persistence.getUserDetails(username);
    if (existingUser) {
        return res.redirect('/register?message=Username already exists');
    }
    // Register the user
    await business.registerUser(username, password, userType);

    // Redirect to login page with success message
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

app.listen(8000, () => { console.log("Running")})
