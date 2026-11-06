const allowedOrigins = (process.env.CORS_ORIGINS ||
    'https://magic-vault-ee405.web.app,https://magic-master-sigma.vercel.app,http://localhost:4200,http://localhost:8100')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET es obligatorio en producción');
}

module.exports = {
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    databaseName: 'magic_trading',
    jwtSecret: jwtSecret || 'development-only-secret-change-me',
    allowedOrigins
};
