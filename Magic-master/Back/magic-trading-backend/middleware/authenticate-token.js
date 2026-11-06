const jwt = require('jsonwebtoken');

function createAuthenticateToken(secret) {
    return (req, res, next) => {
        const [scheme, token] = (req.headers.authorization || '').split(' ');
        if (scheme !== 'Bearer' || !token) {
            return res.status(401).json({ message: 'No se proporcionó token de autenticación' });
        }

        try {
            req.user = jwt.verify(token, secret, { algorithms: ['HS256'] });
            next();
        } catch {
            res.status(403).json({ message: 'Token inválido o expirado' });
        }
    };
}

module.exports = { createAuthenticateToken };
