const {
    availableCards,
    cardIds,
    cardIsAvailable,
    transactionCardFilter
} = require('./transaction.utils');

describe('transaction card availability', () => {
    it('hides cards reserved by a pending transaction', () => {
        expect(availableCards([
            { cardId: 'available', inTransaction: false },
            { cardId: 'reserved', inTransaction: true },
            { cardId: 'legacy' }
        ])).toEqual([
            { cardId: 'available', inTransaction: false },
            { cardId: 'legacy' }
        ]);
    });

    it('returns only valid card identifiers', () => {
        expect(cardIds([{ cardId: 'a' }, { cardId: '' }, {}, { cardId: 'b' }]))
            .toEqual(['a', 'b']);
    });

    it('builds a filter that prevents double reservation', () => {
        expect(transactionCardFilter('card-1')).toEqual({
            cardId: 'card-1',
            $or: [
                { inTransaction: { $exists: false } },
                { inTransaction: false }
            ]
        });
    });

    it('treats missing reservation state as available', () => {
        expect(cardIsAvailable({ cardId: 'legacy-card' })).toBe(true);
        expect(cardIsAvailable({ cardId: 'locked-card', inTransaction: true })).toBe(false);
    });
});
