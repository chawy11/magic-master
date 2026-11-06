import { getAvailableCards } from './card-availability';

describe('getAvailableCards', () => {
  it('does not expose cards reserved by a pending transaction', () => {
    expect(getAvailableCards([
      { cardId: 'available' },
      { cardId: 'locked', inTransaction: true }
    ])).toEqual([{ cardId: 'available' }]);
  });
});
