const { ObjectId } = require('mongodb');
const { availableCards, transactionCardFilter } = require('../transaction.utils');

class UserRepository {
    constructor(collection) {
        this.collection = collection;
    }

    findById(id) {
        return this.collection.findOne({ _id: new ObjectId(id) });
    }

    getAvailableSells(user) {
        return availableCards(user?.sells || []);
    }

    async lockCards(ownerId, cards, transactionId) {
        for (const card of cards) {
            const result = await this.collection.updateOne(
                { _id: new ObjectId(ownerId), sells: { $elemMatch: transactionCardFilter(card.cardId) } },
                { $set: { 'sells.$.inTransaction': true, 'sells.$.transactionId': transactionId } }
            );
            if (result.modifiedCount !== 1) {
                throw new Error(`La carta ${card.cardId} ya no está disponible`);
            }
        }
    }

    releaseTransactionCards(transactionId) {
        return this.collection.updateMany(
            {},
            {
                $set: { 'sells.$[card].inTransaction': false },
                $unset: { 'sells.$[card].transactionId': '' }
            },
            { arrayFilters: [{ 'card.transactionId': transactionId }] }
        );
    }

    removeCards(ownerId, cards) {
        return Promise.all(cards.map(card => this.collection.updateOne(
            { _id: ownerId },
            { $pull: { sells: { cardId: card.cardId } } }
        )));
    }

    removeWant(ownerId, cardName) {
        return this.collection.updateOne(
            { _id: ownerId },
            { $pull: { wants: { cardName } } }
        );
    }
}

module.exports = { UserRepository };
