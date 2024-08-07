const HL = require('./src/index');

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
  expect(run("var a = 0; { def f1() { print a;} f1(); var a = 1; f1();}")).toBe('00');
})

test("array", () => {
  expect(run("print [];")).toBe('[]');
  expect(run("print [1, 2, 3];")).toBe('[1, 2, 3]');
  expect(run("print [1, 2, 3][0];")).toBe('1');
  expect(run("var a = [1, 2, 3]; a[0] = 0; print a;")).toBe('[0, 2, 3]');
  expect(run("var a = [1, 2, 3]; print a.length;")).toBe('3');
  expect(run("var a = [1, 2, 3]; print a.push(4); print a;")).toBe('None[1, 2, 3, 4]');
  expect(run("var a = [1, 2, 3]; print a.pop(); print a;")).toBe('3[1, 2]');
  expect(run("var a = [1, 2, 3]; print a.unshift(4); print a;")).toBe('None[4, 1, 2, 3]');
  expect(run("var a = [1, 2, 3]; print a.shift(); print a;")).toBe('1[2, 3]');
})

test("inbuiltcalls", () => {
    expect(run("print get_time();")).toMatch(/\d+(\.)?\d+/);
})
