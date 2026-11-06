const express = require('express');
const { AuthService } = require('../services/auth.service');

function createAuthRoutes(db, jwtSecret) {
    const router = express.Router();
    const service = new AuthService(db.collection('usuarios'), jwtSecret);

    router.post('/registro', async (req, res) => {
        try {
            const id = await service.register(req.body);
            res.status(201).json({ message: 'Usuario registrado con éxito', id });
        } catch (error) {
            res.status(error.status || 500).json({
                message: error.message || 'Error al registrar usuario',
                ...(error.errors ? { errores: error.errors } : {})
            });
        }
    });

    router.post('/login', async (req, res) => {
        try {
            const result = await service.login(req.body);
            res.json({ message: 'Usuario autenticado con éxito', ...result });
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message || 'Error al iniciar sesión' });
        }
    });

    return router;
}

module.exports = { createAuthRoutes };
