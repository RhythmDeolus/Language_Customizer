const { Datatypes, ObjectL } = require('./Object');
const { NumberL } = require('./Number');
const { NoneL } = require('./None');


const ArrayProperties = {
  length() {
    return new NumberL(this.value.length);
  }
}

const ArrayMethods = {
  push(obj) {
    if (obj instanceof ObjectL) this.value.push(obj);
    return new NoneL();
  },
  pop() {
    return this.value.pop() || new NoneL();
  },
  shift() {
    return this.value.shift() || new NoneL();
  },
  unshift(obj) {
    if (obj instanceof ObjectL) this.value.unshift(obj);
    return new NoneL();
  },
}

class ArrayL extends ObjectL {
  constructor(value) {
    super(Datatypes.ARRAY, value);
    this.properties = ArrayProperties;
    this.methods = ArrayMethods;
  }
}

module.exports = { ArrayL }