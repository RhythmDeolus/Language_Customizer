const {Datatypes, ObjectL} = require('./Object');

class NoneL extends ObjectL {
  constructor() {
      super(Datatypes.NONE, null);
  }
}

module.exports = { NoneL }