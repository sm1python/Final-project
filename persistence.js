const mongodb = require('mongodb')

let client = undefined
let db = undefined
let users = undefined
let session = undefined
let location = undefined

async function connectDatabase() {
    if (!client) {
        client = new mongodb.MongoClient('mongodb+srv://60301991:Manutd137@ahmed.ikee5hi.mongodb.net/')
        await client.connect()
        db = client.db('Project')
        users = db.collection('UserAccounts')
        session = db.collection('SessionData')
        location = db.collection('locations')
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

async function saveUser(username, password) {
    await connectDatabase(); // Ensure database connection

    await users.insertOne({
        username: username,
        password: password,
        userType: userType
    });
}

async function getLocations(){
    await connectDatabase()
    let result = location.find()
    let resultData = result.toArray()
    return resultData
}

module.exports = {
    getUserDetails, saveSession, getSessionData, deleteSession, saveUser, getLocations
}

/*
async function connectDatabase() {
    if (!client) {
        client = new mongodb.MongoClient('mongodb+srv://robert:12class34@cluster0.qgtdkrd.mongodb.net/')
        await client.connect()
        db = client.db('bookstore')
        users = db.collection('UserAccounts')
        session = db.collection('SessionData')
    }
}
*/
