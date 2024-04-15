const persistence = require("./persistence.js")
const crypto = require("crypto")

// This function will return the type of user that attempted to log in.  If the username/password
// is incorrect the function returns undefined.
async function checkLogin(username, password) {
    let details = await persistence.getUserDetails(username)
    if (details.UserName === username && details.Password === password) {
        return details.UserType
    }
    return undefined
}

// Save the data (might be an object) into the persistence.  The expiry time will be 5 minutes from
// the current time.  The session key will be returned so that the presentation layer can
// send it as a cookie.
async function startSession(data) {
    let uuid = crypto.randomUUID()
    let expiry = new Date(Date.now() + 1000*60*1)
    await persistence.saveSession(uuid, expiry, data)
    return {
        uuid: uuid,
        expiry: expiry
    }
}

async function getSessionData(key) {
    return await persistence.getSessionData(key)
}

async function deleteSession(key) {
    //delete ahead of time of the expiry
    await persistence.deleteSession(key)
}

async function registerUser(username, password) {
    // to save user details to persistence layer
    await persistence.saveUser(username, password);
}

async function getLocations(){
    return await persistence.getLocations()
}

async function savePost(data){
    return await persistence.savePost(data)
}

module.exports = {
    checkLogin, startSession, getSessionData, deleteSession, registerUser, getLocations, savePost
}
