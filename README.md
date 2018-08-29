# state-definition

state-definition provides late-binding and memoization for state definitions in tests. It was inspired by RSpec's `let` expressions.

## Features

* Properties defined can reference other properties in the state definition.
* Properties can be defined as functions, but are accessed as properties.
* Properties are evaluated as-needed. This means that if you redefine a state property like we do with isGroupAdmin, its value will bubble up to other properties when they are referenced in tests.
* Property values are memoized. Once evaluated, functions that define properties will not be called again. This is useful when state definitions involve stateful operations like creating a database entry or rendering a React component with Enzyme.

## Example usage

```javascript
describe('User permission to edit', () => {  
  let s;
  beforeEach(() => {
    s = new StateDefinition({
      post: create('post'),
      isGroupAdmin: false,
      group: (state) => create('group', { isAdmin: state.isGroupAdmin }),
      user: (state) => create('user', { group: state.group }),
    });
  });

  const subject = () => { s.post.edit(s.user) }

  it('cannot edit another user's post', () => {
    expect(subject).toThrow();
  });

  describe('when user is a member of an admin group', () => {
    beforeEach(() => {
      s.define({ isGroupAdmin: true });
    });

    it('can edit another user's post', () => {
      expect(subject).not.toThrow();
    });
  });
});
```

### Constructor

Initialize StateDefinition with an object of property definition expressions. Definitions can either be simple expressions or functions. Functions take the StateDefinition object itself as the first parameter. The StateDefinition object is also the `this` context in definition functions.

### define

Redefine StateDefinition properties by calling `define` in nested describe functions.

### Usage

Simply refer to any StateDefinition property by the key name irrespective of if the property was defined as a simple expression or a function.
