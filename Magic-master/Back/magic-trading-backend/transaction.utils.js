function cardIsAvailable(card) {
    return card && card.inTransaction !== true;
}

function availableCards(cards = []) {
    return cards.filter(cardIsAvailable);
}

function cardIds(cards = []) {
    return cards
        .map(card => card && card.cardId)
        .filter(cardId => typeof cardId === 'string' && cardId.length > 0);
}

function transactionCardFilter(cardId) {
    return {
        cardId,
        $or: [
            { inTransaction: { $exists: false } },
            { inTransaction: false }
        ]
    };
}

module.exports = {
    availableCards,
    cardIds,
    cardIsAvailable,
    transactionCardFilter
};
