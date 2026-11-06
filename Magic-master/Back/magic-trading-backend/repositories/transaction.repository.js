const { ObjectId } = require('mongodb');

class TransactionRepository {
    constructor(collection) {
        this.collection = collection;
    }

    findForUser(userId) {
        const id = new ObjectId(userId);
        return this.collection.find({
            $or: [{ buyerId: id }, { sellerId: id }]
        }).sort({ createdAt: -1 }).toArray();
    }

    findPendingForParticipant(transactionId, userId) {
        const id = new ObjectId(userId);
        return this.collection.findOne({
            _id: new ObjectId(transactionId),
            status: 'pending',
            $or: [{ buyerId: id }, { sellerId: id }]
        });
    }

    create(transaction) {
        return this.collection.insertOne(transaction);
    }

    setConfirmation(transactionId, field) {
        return this.collection.updateOne(
            { _id: new ObjectId(transactionId), [field]: false, status: 'pending' },
            { $set: { [field]: true } }
        );
    }

    findById(transactionId) {
        return this.collection.findOne({ _id: new ObjectId(transactionId) });
    }

    complete(transactionId) {
        return this.collection.updateOne(
            { _id: new ObjectId(transactionId), status: 'pending' },
            { $set: { status: 'completed', completedAt: new Date() } }
        );
    }

    cancel(transactionId, userId) {
        return this.collection.findOneAndUpdate(
            {
                _id: new ObjectId(transactionId),
                status: 'pending',
                $or: [{ buyerId: new ObjectId(userId) }, { sellerId: new ObjectId(userId) }]
            },
            { $set: { status: 'cancelled', cancelledAt: new Date(), cancelledBy: new ObjectId(userId) } },
            { returnDocument: 'after' }
        );
    }
}

module.exports = { TransactionRepository };
