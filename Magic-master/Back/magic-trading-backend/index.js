const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const config = require('./config');
const { createAuthenticateToken } = require('./middleware/authenticate-token');
const { createTransactionRoutes } = require('./routes/transaction.routes');
const { createAuthRoutes } = require('./routes/auth.routes');
const { createUserRoutes } = require('./routes/user.routes');

const app = express();
const { port, mongoUri: MONGODB_URI, jwtSecret: signingSecret, allowedOrigins } = config;

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Origen no permitido por CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(helmet());
app.use(bodyParser.json({ limit: '100kb' }));
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false
}));

// Conexión a MongoDB
const client = new MongoClient(MONGODB_URI);

async function connect() {
    try {
        await client.connect();
        console.log('Conectado a MongoDB');
    } catch (err) {
        console.error('Error conectando a MongoDB:', err);
        process.exit(1);
    }
}

// Manejo de cierre de conexión
process.on('SIGINT', async () => {
    await client.close();
    console.log('Conexión a MongoDB cerrada');
    process.exit(0);
});

connect();
app.use('/api', createAuthRoutes(client.db(config.databaseName), signingSecret));

const authenticateToken = createAuthenticateToken(signingSecret);

app.use('/api', createUserRoutes(client.db(config.databaseName), authenticateToken));
app.use('/api', createTransactionRoutes(client.db(config.databaseName), authenticateToken));

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor backend corriendo en http://localhost:${port}`);
});