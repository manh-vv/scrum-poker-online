const { db } = require('./db');

describe('test db', () => {
  let refAvailableRoom;

  beforeEach(() => {
    db.goOnline();
    refAvailableRoom = db.ref('test-data/');
  });

  afterEach(() => {
    db.goOffline();
  });

  it('should create data in db', async () => {
    await refAvailableRoom.set({
      syncScope: 'global',
      rooms: [],
    });
    expect(true).toBe(true);
  });

  it('should read data in db', done => {
    refAvailableRoom.on('value', async snapshot => {
      expect(snapshot.val()).toBeTruthy();
      done();
    });
  });
});
