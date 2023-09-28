const {ObjectL, Datatypes} = require('./Object');
const {ArrayL} = require('./Array');
const {NumberL} = require('./Number');
const {StringL} = require('./String');
const {BooleanL} = require('./Boolean');
const {NoneL} = require('./None');

const TypeToObject = new Map();

TypeToObject.set(Datatypes.OBJECT, ObjectL);
TypeToObject.set(Datatypes.ARRAY, ArrayL);
TypeToObject.set(Datatypes.STRING, StringL);
TypeToObject.set(Datatypes.NONE, NoneL);
TypeToObject.set(Datatypes.NUMBER, NumberL);
TypeToObject.set(Datatypes.BOOLEAN, BooleanL);


module.exports = {
  TypeToObject,
  Datatypes,
  ObjectL,
  ArrayL,
  NumberL,
  StringL,
  BooleanL,
  NoneL
}