const { createPool, pools } = require('../createPool');

describe('createPool', () => {
  it('survives an idle client error instead of crashing (#31)', () => {
    const pool = createPool('test-pool', 'postgres://localhost:5432/unused');
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    // An 'error' event with no listener would throw here.
    expect(() => pool.emit('error', new Error('connection terminated'))).not.toThrow();
    expect(consoleError).toHaveBeenCalledWith(
      'Idle client error in the test-pool database pool:',
      'connection terminated'
    );

    // Still the same pool afterwards: nothing gets swapped out.
    expect(pools.get('test-pool')).toBe(pool);
    consoleError.mockRestore();
  });

  it('registers each pool by name', () => {
    require('../juicebox/db');
    require('../fitness-tracker/db/client');
    require('../scents/db/client');

    expect([...pools.keys()]).toEqual(expect.arrayContaining(['juicebox', 'fitness', 'scents']));
  });

  it('never logs connection strings when pools are created (#30)', () => {
    const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.isolateModules(() => {
      require('../juicebox/db');
      require('../scents/db/client');
      require('../fitness-tracker/db/client');
    });

    const logged = consoleLog.mock.calls.flat().join(' ');
    expect(logged).not.toMatch(/postgres(ql)?:\/\//);
    consoleLog.mockRestore();
  });
});
