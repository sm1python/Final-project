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
    let expiry = new Date(Date.now() + 1000*60*5)
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
    await persistence.deleteSession(key)
}


module.exports = {
    checkLogin, startSession, getSessionData, deleteSession
}