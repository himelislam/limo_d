module.exports = {
    app: {
        port: process.env.PORT,
        environment: process.env.NODE_ENV,
        cors_origin: process.env.CORS_ORIGIN,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
    mongo: {
        user: process.env.MONGO_USER || "user",
        password: process.env.MONGO_PASSWORD || "password",
        uri: process.env.MONGO_URI ||
            `mongodb+srv://himel7100:fNwyaH2VNqxjp94m@limodcluster.zs6tdfo.mongodb.net/?retryWrites=true&w=majority&appName=limodCluster`,
        session_secret: process.env.MONGO_SESSION_SECRET
    },
    mailer:{
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    }
};