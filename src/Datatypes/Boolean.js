const {Datatypes, ObjectL } = require('./Object');

class BooleanL extends ObjectL {
  constructor(value) {
      super(Datatypes.BOOLEAN, value);
  }
}

module.exports = { BooleanL }