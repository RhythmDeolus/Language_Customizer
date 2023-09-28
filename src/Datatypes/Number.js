const {Datatypes, ObjectL } = require('./Object');

class NumberL extends ObjectL {
  constructor(value) {
      super(Datatypes.NUMBER, value);
  }
}

module.exports = { NumberL }