const { ObjectId } = require('mongodb');

class TransactionService {
    constructor({ users, transactions }) {
        this.users = users;
        this.transactions = transactions;
    }

    async listForUser(userId) {
        return this.transactions.findForUser(userId);
    }

    async create({ buyerId, sellerId, buyerWants, sellerWants }) {
        if (!ObjectId.isValid(buyerId) || !ObjectId.isValid(sellerId) || buyerId === sellerId) {
            throw Object.assign(new Error('El usuario destinatario no es válido'), { status: 400 });
        }
        if (!Array.isArray(buyerWants) || !Array.isArray(sellerWants) ||
            (buyerWants.length === 0 && sellerWants.length === 0)) {
            throw Object.assign(new Error('Debes seleccionar al menos una carta'), { status: 400 });
        }

        const [buyer, seller] = await Promise.all([
            this.users.findById(buyerId),
            this.users.findById(sellerId)
        ]);
        if (!buyer || !seller) {
            throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });
        }

        const snapshot = (requested, owner) => {
            const available = new Map(this.users.getAvailableSells(owner).map(card => [card.cardId, card]));
            return requested.map(card => available.get(card.cardId)).filter(Boolean);
        };
        const sellerCards = snapshot(buyerWants, seller);
        const buyerCards = snapshot(sellerWants, buyer);
        if (sellerCards.length !== buyerWants.length || buyerCards.length !== sellerWants.length) {
            throw Object.assign(new Error('Una o más cartas ya no están disponibles'), { status: 409 });
        }

        const result = await this.transactions.create({
            buyerId: new ObjectId(buyerId),
            sellerId: new ObjectId(sellerId),
            buyerUsername: buyer.usuario,
            sellerUsername: seller.usuario,
            buyerWants: sellerCards,
            sellerWants: buyerCards,
            buyerConfirmed: false,
            sellerConfirmed: false,
            status: 'pending',
            createdAt: new Date()
        });

        try {
            await this.users.lockCards(sellerId, sellerCards, result.insertedId);
            await this.users.lockCards(buyerId, buyerCards, result.insertedId);
            return result.insertedId;
        } catch (error) {
            await this.users.releaseTransactionCards(result.insertedId);
            await this.transactions.collection.deleteOne({ _id: result.insertedId });
            throw Object.assign(error, { status: error.status || 409 });
        }
    }

    async confirm(transactionId, userId) {
        const transaction = await this.transactions.findPendingForParticipant(transactionId, userId);
        if (!transaction) {
            throw Object.assign(new Error('Transacción no encontrada'), { status: 404 });
        }

        const field = transaction.buyerId.toString() === userId ? 'buyerConfirmed' : 'sellerConfirmed';
        await this.transactions.setConfirmation(transactionId, field);
        const updated = await this.transactions.findById(transactionId);

        if (updated.buyerConfirmed && updated.sellerConfirmed) {
            await this.transactions.complete(transactionId);
            await this.users.removeCards(updated.sellerId, updated.buyerWants);
            await this.users.removeCards(updated.buyerId, updated.sellerWants);
            await Promise.all([
                ...updated.buyerWants.map(card => this.users.removeWant(updated.buyerId, card.cardName)),
                ...updated.sellerWants.map(card => this.users.removeWant(updated.sellerId, card.cardName))
            ]);
            await this.users.releaseTransactionCards(new ObjectId(transactionId));
        }

        return { transactionCompleted: updated.buyerConfirmed && updated.sellerConfirmed };
    }

    async cancel(transactionId, userId) {
        const transaction = await this.transactions.cancel(transactionId, userId);
        if (!transaction) {
            throw Object.assign(new Error('Transacción no encontrada o ya finalizada'), { status: 404 });
        }
        await this.users.releaseTransactionCards(new ObjectId(transactionId));
    }
}

module.exports = { TransactionService };
