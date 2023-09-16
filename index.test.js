import HL from './src/index';

function run(input) {
  let out = {
    value: "",
  }
  HL.hl.run(input, out);
  if (out.err) console.log(out.errMsg);

  return out.value;
}

test('print statement', () => {
  expect(run('print "hello";')).toBe('hello');
})

test('variables', () => {
  expect(run('var a = "hello";\n print a;')).toBe('hello');
})

test('if/else statements', () => {
  expect(run('if (True) print "hello"; else print "world";')).toBe('hello');
  expect(run('if (False) print "hello"; else print "world";')).toBe('world');
})

test("operators", () => {
  expect(run("print 1 + 1;")).toBe('2');
  expect(run("print '1'+ '1';")).toBe('11');
  expect(run("print 1 - 1;")).toBe('0');
  expect(run("print 1/1;")).toBe('1');
  expect(run("print 1*3;")).toBe('3');
  expect(run("print 1 == 3;")).toBe('False');
  expect(run("print 1 != 3;")).toBe('True');
  expect(run("print 1 >= 3;")).toBe('False');
  expect(run("print 1 <= 3;")).toBe('True');
  expect(run("print True and False;")).toBe('False');
  expect(run("print True or False;")).toBe('True');
  expect(run("print !True;")).toBe('False');
  expect(run("print -1;")).toBe('-1');
})

test("while loop", () => {
  expect(run("var a = 0; while (a < 10) {print a; a = a + 1;}")).toBe('0123456789');
})

test("for loop", () => {
  expect(run("for (var a = 0; a < 10; a = a + 1) {print a;}")).toBe('0123456789');
})

test("comments", () => {
  expect(run("// print nothing")).toBe('');
})


test("functions", () => {
  expect(run("def f1() { return 'hello';} print f1();")).toBe('hello');
})