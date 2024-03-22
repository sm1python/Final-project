const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const business = require('./js/business.js')

let app = express()
const handlebars = require('express-handlebars')
app.set('views', __dirname+"/templates")
app.set('view engine', 'handlebars')
app.engine('handlebars', handlebars.engine())
app.use(bodyParser.urlencoded())
app.use(cookieParser())



app.get('/login', (req, res) => {
    res.render('login', {layout: undefined, message: req.query.message})
})

app.post('/login', async (req,res) => {
    let username = req.body.username
    let password = req.body.password
    if (username == "" || password == "") {
        res.redirect("/?message=Invalid Username/Password")
        return
    }
    let userType = await business.checkLogin(username, password)
    if (!userType) {
        res.redirect("/?message=Invalid Username/Password")
        return
    }

    // at this point the credentials are good so we will ask for a session....
    // storing the password in the session would be silly because we wouldn't want it
    // to be stored in plaintext (assume that the user collection doesn't use plaintext passwords)
    let session = await business.startSession({
        UserName: username,
        UserType: userType
    })
    res.cookie('#', session.uuid, {expires: session.expiry})

    if (userType == 'admin') {
        res.redirect('/admin')
    }
    else if (userType == 'standard') {
        res.redirect('/standard')
    }
})

app.listen(8000, () => { console.log("Running")})