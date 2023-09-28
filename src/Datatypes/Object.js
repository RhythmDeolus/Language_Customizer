class ObjectL {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }
  copy() {
    let t = new ObjectL(this.type, this.value);
    t.properties = this.properties;
    t.methods = this.methods;
    return t;
  }
  set(obj) {
    this.type = obj.type;
    this.value = obj.value;
    this.properties = obj.properties;
    this.methods = obj.methods;
  }
}


const Datatypes = {
  OBJECT: 1,
  NUMBER: 2,
  NONE: 3,
  STRING: 4,
  ARRAY: 5,
  BOOLEAN: 6,
}

module.exports = { Datatypes, ObjectL }