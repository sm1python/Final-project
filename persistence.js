const mongodb = require('mongodb')

let client = undefined
let db = undefined
let users = undefined
let session = undefined


async function connectDatabase() {
    if (!client) {
        client = new mongodb.MongoClient('#')
        await client.connect()
        db = client.db('#')
        users = db.collection('UserAccounts')
        session = db.collection('SessionData')
    }
}

async function getUserDetails(username) {
    await connectDatabase()
    let result = await users.find({UserName: username})
    let resultData = await result.toArray()
    return resultData[0]
}

async function saveSession(uuid, expiry, data) {
    await connectDatabase()
    await session.insertOne({
        SessionKey: uuid,
        Expiry: expiry,
        Data: data
    })
}

async function getSessionData(key) {
    await connectDatabase()
    let result = await session.find({SessionKey: key})
    let resultData = await result.toArray()
    return resultData[0]
}

async function deleteSession(key) {
    await session.deleteOne({SessionKey: key})
}

module.exports = {
    getUserDetails, saveSession, getSessionData, deleteSession
}