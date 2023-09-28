const {Datatypes, ObjectL } = require('./Object');

class StringL extends ObjectL {
  constructor(value) {
      super(Datatypes.STRING, value);
  }
}

module.exports = { StringL }