module.exports = {
    secretKey: process.env.SECRET_KEY || '12345',
    mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017/conFusion',
}