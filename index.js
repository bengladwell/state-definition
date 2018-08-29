/*!
  Copyright (c) 2017 CoverMyMeds.
  Licensed under the MIT License (MIT)
*/
/* global define */

(function globalDefine() {
  class StateDefinition {
    constructor(varDefs) {
      Object.defineProperty(this, '_table', {
        value: {},
        configurable: true,
        enumerable: false,
      });
      Object.defineProperty(this, '_oldTable', {
        value: {},
        configurable: true,
        enumerable: false,
      });
      if (varDefs) {
        this.define(varDefs);
      }
    }

    define(varDefs) {
      this._extendTable();
      this.setProps(varDefs);

      Object.defineProperty(this, '_values', {
        value: {},
        configurable: true,
        enumerable: false,
      });
    }

    setProps(propDefs) {
      Object.assign(this._table, propDefs);

      // provide shortcut getters on this object down to the internal table object
      Object.keys(propDefs).forEach((key) => {
        if (key === '_table' || key === '_oldTable' || key === '_values') {
          throw new Error('Cannot define `_values`, `_table`, or `_oldTable` state properties');
        }
        Object.defineProperty(this, key, {
          get: this._valueGetter(key, typeof propDefs[key] === 'function' ? this._table[key] : () => this._table[key]),
          configurable: true,
          enumerable: true,
        });
      });
    }

    _extendTable() {
      const newTable = Object.create(this._table);
      Object.defineProperty(this, '_oldTable', {
        value: this._table,
        configurable: true,
        enumerable: false,
      });

      Object.defineProperty(this, '_table', {
        value: newTable,
        configurable: true,
        enumerable: false,
      });
    }

    revert() {
      Object.keys(this).forEach((shortcutKey) => {
        // if the shortcut getter refers to a property only on most recent table,
        // delete the shortcut
        if (Object.prototype.hasOwnProperty.call(this._table, shortcutKey)
          && !(shortcutKey in this._oldTable)) {
          delete this[shortcutKey];
        }
      });

      Object.defineProperty(this, '_table', {
        value: this._oldTable,
        configurable: true,
        enumerable: false,
      });
      Object.defineProperty(this, '_values', {
        value: {},
        configurable: true,
        enumerable: false,
      });
      delete this._oldTable;
    }

    _valueGetter(key, f) {
      return () => {
        if (this._values[key]) {
          return this._values[key];
        }

        const value = f.call(this, this);
        this._values[key] = value;
        return value;
      };
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    StateDefinition.default = StateDefinition;
    module.exports = StateDefinition;
  } else if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
    // register as 'state-definition', consistent with npm package name
    define('state-definition', [], () => StateDefinition);
  } else {
    window.StateDefinition = StateDefinition;
  }
}());
