const express = require('express');
const { ObjectId } = require('mongodb');
const { UserRepository } = require('../repositories/user.repository');
const { TransactionRepository } = require('../repositories/transaction.repository');
const { TransactionService } = require('../services/transaction.service');

function createTransactionRoutes(db, authenticateToken) {
    const router = express.Router();
    const service = new TransactionService({
        users: new UserRepository(db.collection('usuarios')),
        transactions: new TransactionRepository(db.collection('transactions'))
    });

    router.get('/transactions', authenticateToken, async (req, res) => {
        try {
            res.json(await service.listForUser(req.user.id));
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener transacciones' });
        }
    });

    router.post('/transaction/create', authenticateToken, async (req, res) => {
        try {
            const transactionId = await service.create({ buyerId: req.user.id, ...req.body });
            res.status(201).json({ message: 'Transacción creada correctamente', transactionId });
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message || 'Error al crear transacción' });
        }
    });

    router.put('/transaction/:id/confirm', authenticateToken, async (req, res) => {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Identificador no válido' });
        }
        try {
            res.json({ message: 'Confirmación registrada', ...await service.confirm(req.params.id, req.user.id) });
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    });

    router.put('/transaction/:id/cancel', authenticateToken, async (req, res) => {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Identificador no válido' });
        }
        try {
            await service.cancel(req.params.id, req.user.id);
            res.json({ message: 'Transacción cancelada correctamente' });
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    });

    return router;
}

module.exports = { createTransactionRoutes };
