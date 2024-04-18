const mongodb = require('mongodb')

let client = undefined
let db = undefined
let users = undefined
let session = undefined
let location = undefined
let keys = undefined

async function connectDatabase() {
    if (!client) {
        client = new mongodb.MongoClient('mongodb+srv://60301991:Manutd137@ahmed.ikee5hi.mongodb.net/')
        await client.connect()
        db = client.db('Project')
        users = db.collection('UserAccounts')
        session = db.collection('SessionData')
        location = db.collection('locations')
        keys = db.collection('smth')
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

async function saveUser(username, password, email) {
    await connectDatabase();
    await users.insertOne({
        UserName : username,
        Password : password,
        email : email,
        UserType : 'member'
    });
}

async function getLocations(){
    await connectDatabase()
    let result = location.find()
    let resultData = result.toArray()
    return resultData
}

async function savePost(data) {
    await connectDatabase()
    await post.insertOne(data)
}

async function updatePass(data){
    await connectDatabase()
    await users.updateOne({UserName: data.username}, {$set:{Password:data.newPass}})
}

async function resetPassword(data){
    await connectDatabase()
    await users.updateOne({email: data.email}, {$set:{Password:data.password}})
}

async function getUserEmail(email) {
    await connectDatabase()
    let result = await users.find({email: email})
    let resultData = await result.toArray()
    return resultData[0]
}

async function saveKey(Key) {
    await connectDatabase()
    await keys.insertOne(keys);

}

async function getKey(key) {
    await connectDatabase()
    let result = await keys.find({key: key})
    let resultData = await result.toArray()
    return resultData[0]
}

module.exports = {
    getUserDetails, saveSession, getSessionData, deleteSession, saveUser, getLocations, updatePass, savePost, resetPassword, getUserEmail, saveKey, getKey
}
