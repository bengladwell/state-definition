import StateDefinition from '.';

describe('StateDefinition', () => {
  let s;
  const initialState = {
    foo: 'bar',
    fiz: 222,
    customGetter: context => context.fiz * 2,
  };

  function itWorksAsExpected() {
    it('sets initial data', () => {
      expect(s.foo).toBe('bar');
      expect(s.fiz).toBe(222);
    });

    it('handles custom getter methods', () => {
      expect(s.customGetter).toBe(444);
    });

    it('handles changing properties', () => {
      s.define({
        foo: 'buz',
        newCustomGetter: context => `${context.foo} ${context.fiz}`,
      });
      expect(s.foo).toBe('buz');
      expect(s.fiz).toBe(222);
      expect(s.customGetter).toBe(444);
      expect(s.newCustomGetter).toBe('buz 222');
    });


    it('can add new properties', () => {
      s.define({ hello: 'world' });
      expect(s.hello).toBe('world');

      s.define({ hello: 'dlrow' });
      expect(s.hello).toBe('dlrow');
    });

    it('correctly reverts to the previous state', () => {
      expect(s.hello).toBe(undefined);
      expect(s.foo).toBe('bar');
      expect(s.customGetter).toBe(444);

      s.define({ hello: 'world', foo: 'bop', fiz: 321 });

      expect(s.hello).toBe('world');
      expect(s.foo).toBe('bop');
      expect(s.customGetter).toBe(642);

      s.revert();

      expect(s.hello).toBe(undefined);
      expect(s.foo).toBe('bar');
      expect(s.customGetter).toBe(444);
    });

    it('prevents _values, _table, and _oldTable properties from being set', () => {
      expect(() => s.define({ _table: 'myTable' })).toThrow();
      expect(() => s.define({ _oldTable: 'myOldTable' })).toThrow();
      expect(() => s.define({ _values: 'myValuesProperty' })).toThrow();
    });

    it('caches the value of state properties until define or revert is called', () => {
      const newGetter = jest.fn(context => context.fiz / 2);

      s.define({ newGetter });
      expect(s.newGetter).toBe(111);
      expect(s.newGetter).toBe(111);
      expect(newGetter).toHaveBeenCalledTimes(1);

      s.define({ fiz: 50 });

      expect(s.newGetter).toBe(25);
      expect(s.newGetter).toBe(25);
      expect(newGetter).toHaveBeenCalledTimes(2);

      s.revert();

      expect(s.newGetter).toBe(111);
      expect(s.newGetter).toBe(111);
      expect(s.newGetter).toBe(111);
      expect(newGetter).toHaveBeenCalledTimes(3);
    });
  }

  describe('when using constructor', () => {
    beforeEach(() => {
      s = new StateDefinition({ ...initialState });
    });
    itWorksAsExpected();
  });

  describe('when defining state after initialization', () => {
    beforeEach(() => {
      s = new StateDefinition();
      s.define({ ...initialState });
    });
    itWorksAsExpected();
  });
});
