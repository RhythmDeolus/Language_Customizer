const { NodeTypes, Value } = require("./Parser.js");
const { TokenTypes } = require("./Tokenizer.js");

let inbuilt_calls = {
    get_time() {
        return new Value(NodeTypes.NUMBER, Date.now());
    }
}


const {TypeToObject, Datatypes, ArrayL, ObjectL, NumberL, StringL, NoneL, BooleanL} = require('./Datatypes')

class ReturnError extends Error {
    constructor(value) {
        super("Returning from function");
        this.value = value;
    }
}

class FunctionCall {
    constructor(prev, fun) {
        this.fun = fun;
        this.prev = prev;
    }
}

class Variable  {
    constructor(value) {
        this.value = value;
    }
}


class Operations {
    newValue(type, a) {
        let t = TypeToObject.get(type);
        if (t) return new t(a);
        this.raiseRuntimeError("Unable to find the Datatype.")
    }
    checkB(a, b, typea, typeb) {
        return a.type === typea && b.type === typeb;
    }
    getValueAfterOpB(a, b, op) {
        switch(op.type) {
            case TokenTypes.ADD:
                return this.add(a, b);
            case TokenTypes.MINUS:
                return this.sub(a, b);
            case TokenTypes.DIV:
                return this.div(a, b);
            case TokenTypes.MUL:
                return this.mul(a, b);
            case TokenTypes.EQUAL_EQUAL:
                return this.equal_equal(a, b);
            case TokenTypes.BANG_EQUAL:
                return this.not_equal(a, b);
            case TokenTypes.GREATER_THAN:
                return this.greater(a, b);
            case TokenTypes.GREATER_THAN_EQUAL_TO:
                return this.greater_equal(a, b);
            case TokenTypes.LESS_THAN:
                return this.less(a, b);
            case TokenTypes.LESS_THAN_EQUAL_TO:
                return this.less_equal(a, b);
            case TokenTypes.OR:
                return this.or(a, b);
            case TokenTypes.AND:
                return this.and(a, b);
            case TokenTypes.OPEN_BRACKET:
                return this.index(a, b);
            default:
                console.log("No operation found");
                break;
        }
    }

    getValueAfterOpU(a, op) {
        switch(op.type) {
            case TokenTypes.MINUS:
                return this.uminus(a);
            case TokenTypes.NOT:
                return this.not(a);
        }
    }

    operateB(a, b, op) {
        let result = this.getValueAfterOpB(a, b, op);
        if (result !== undefined) return result;
        this.raiseOperationError(op, a, b);
    }
    operateU(a, op) {
        let result = this.getValueAfterOpU(a, op);
        if (result !== undefined) return result;
        this.raiseOperationError(op, a);
    }

    raiseOperationError(operation, a, b) {
        this.raiseRuntimeError(`Can't do operation ${operation.literal} on ${this.getDataTypeName(a.type)}` + (b === undefined? '' :` and ${this.getDataTypeName(b.type)}.`));
    }
    getDataTypeName(enum_val) {
        for(let key in NodeTypes) {
            if (NodeTypes[key] === enum_val) return key;
        }
        return null;
    }

    index(a, b) {
        if (this.checkB(a, b, Datatypes.ARRAY, Datatypes.NUMBER)) {
            return a.value[b.value];
        }
    }
    add(a, b) {
        if (this.checkB(a, b, Datatypes.NUMBER, Datatypes.NUMBER) ||
        this.checkB(a, b, Datatypes.STRING, Datatypes.STRING))
        return this.newValue(a.type, a.value + b.value);
    }
    sub(a, b) {
        if (this.checkB(a, b, Datatypes.NUMBER, Datatypes.NUMBER) )
        return this.newValue(Datatypes.NUMBER, a.value - b.value);
    }
    mul(a, b) {
        if (this.checkB(a, b, Datatypes.STRING, Datatypes.NUMBER)) {
            if (Number.isInteger(b.value) && b.value >= 0) {
                let result = "";
                for (let i = 0; i < b.value; i++) {
                    result += a.value;
                }
                return this.newValue(Datatypes.STRING, result);
            } else this.raiseRuntimeError("Can not multiply string with a non-integer number.");
        }
        if (this.checkB(a, b, Datatypes.NUMBER, Datatypes.NUMBER)) return this.newValue(Datatypes.NUMBER, a.value * b.value);
    }
    div(a, b) {
        if (this.checkB(a, b, Datatypes.NUMBER, Datatypes.NUMBER))
        return this.newValue(Datatypes.NUMBER, a.value / b.value);
    }
    areSameType(a, b) {
        return a.type === b.type;
    }
    equal_equal(a, b) {
        if (this.areSameType(a, b))
        return this.newValue(Datatypes.BOOLEAN, a.value === b.value);
    }
    not_equal(a, b) {
        if (this.areSameType(a, b))
        return this.newValue(Datatypes.BOOLEAN, a.value !== b.value);
    }
    areType(a, b, type) {
        return a.type == type && b.type == type;
    }
    isType(a, type) {
        return a.type == type;
    }
    greater(a, b) {
        if (this.areType(a, b, Datatypes.NUMBER) || 
        this.areType(a, b, Datatypes.STRING))
        return this.newValue(Datatypes.BOOLEAN, a.value > b.value);
    }
    greater_equal(a, b) {
        if (this.areType(a, b, Datatypes.NUMBER) || 
        this.areType(a, b, Datatypes.STRING))
        return this.newValue(Datatypes.BOOLEAN, a.value >= b.value);
    }
    less(a, b) {
        if (this.areType(a, b, Datatypes.NUMBER) || 
        this.areType(a, b, Datatypes.STRING))
        return this.newValue(Datatypes.BOOLEAN, a.value < b.value);
    }
    less_equal(a, b) {
        if (this.areType(a, b, Datatypes.NUMBER) || 
        this.areType(a, b, Datatypes.STRING))
        return this.newValue(Datatypes.BOOLEAN, a.value <= b.value);
    }
    and(a, b) {
        if (this.areType(a, b, Datatypes.BOOLEAN))
        return this.newValue(Datatypes.BOOLEAN, a.value && b.value);
    }
    or(a, b) {
        if (this.areType(a, b, Datatypes.BOOLEAN))
        return this.newValue(Datatypes.BOOLEAN, a.value || b.value);
    }
    not(a) {
        if (this.isType(a, Datatypes.BOOLEAN))
        return this.newValue(Datatypes.BOOLEAN, !a.value);
    }
    uminus(a) {
        if (this.isType(a, Datatypes.NUMBER))
        return this.newValue(Datatypes.NUMBER, -a.value);
    }
    raiseRuntimeError(msg) {
        throw new RuntimeError(msg, this.callStack);
    }

}

let op = new Operations();

class RuntimeError extends Error {
    constructor(message, stack) {
        super(message)
        this.name = this.constructor.name;
        this.stack = stack;
    }
    toString() {
        let r = `${this.name}: ${this.message}\n`;
        r += 'Stack: \n';
        let t = this.stack;
        while (t && t.fun) {
            r += `\t${t.fun.name || t.fun}\n`;
            t = t.prev;
        }
        return r;
    }
}

class Enviourment {
    constructor(parent, name) {
        this.parent = parent;
        this.name = name;
        this.variables = {};
    }
    resolveGet(variable) {
        if (variable in this.variables) {
            return this.variables[variable].value;
        } else if (this.parent != null) {
            return this.parent.resolveGet(variable);
        }
        return undefined;
    }
    resolveSet(variable, value) {
        if (variable in this.variables) {
            this.variables[variable] = new Variable(value);
            return true;
        } else if (this.parent != null) {
            return this.parent.resolveSet(variable, value);
        }
        return false;
    }
    isDeclared(variable) {
        return variable in this.variables;
    }
    declare(variable) {
        let stashedEnvironment = new Enviourment(this.parent, this.name);
        stashedEnvironment.variables = this.variables;
        this.variables = {};
        this.parent = stashedEnvironment;
        this.variables[variable] = null;
    }
}

class Interpreter {
    constructor(statements, out) {
        this.statements = statements;
        this.globalEnv = new Enviourment(null);
        this.currEnv = this.globalEnv;
        this.callStack = new FunctionCall(null, '<main>');
        this.out = out;
    }
    run() {
        for (let statement of this.statements) {
            this.evaluate(statement);
        }
    }

    moveEnviourment() {
        let newEnviourment = new Enviourment(this.currEnv);
        newEnviourment.parent = this.currEnv;
        this.currEnv = newEnviourment;
    }

    evaluate(statement) {
        switch (statement.type) {
            case NodeTypes.INBUILT_CALL:
                return this.inbuiltcall(statement);
            case NodeTypes.BINARY_OP:
                return this.evalBinary(statement);
            case NodeTypes.UNARY_OP:
                return this.evalUnary(statement);
            case NodeTypes.GROUPING:
                let e = this.evaluate(statement.expr);
                return e.copy();
            case NodeTypes.STRING:
                return new StringL(statement.value);
            case NodeTypes.NONE:
                return new NoneL();
            case NodeTypes.BOOLEAN:
                return new BooleanL(statement.value);
            case NodeTypes.NUMBER:
                return new NumberL(statement.value);
            case NodeTypes.ARRAY:
                return new ArrayL(statement.value);
            case NodeTypes.IDENTIFIER:
                let value = this.currEnv.resolveGet(statement.value)
                if (value === undefined) {
                    this.raiseRuntimeError("Undefined Identifer.")
                } else if (value === null) {
                    this.raiseRuntimeError("Uninitialized variable access.")
                } else {
                    return this.currEnv.resolveGet(statement.value);
                }
                break;
            case NodeTypes.BLOCK:
                return this.evaluateBlock(statement);
            case NodeTypes.IFSTATEMENT:
                return this.evaluateIfStatement(statement);
            case NodeTypes.VARDECLARATION:
                return this.evaluateVarDeclaration(statement);
            case NodeTypes.WHILELOOP:
                return this.evaluateWhileLoop(statement);
            case NodeTypes.FORLOOP:
                return this.evaluateForLoop(statement);
            case NodeTypes.VAREXPRLIST:
                return this.evaluateVarExprList(statement);
            case NodeTypes.FUNDECLARE:
                return this.evaluateFunDeclaration(statement);
            case NodeTypes.FUNCALL:
                return this.evaluateFunCall(statement);
            case NodeTypes.EXPRLIST:
                return this.evaluateExprList(statement);
            case NodeTypes.RETURNSTMT:
                return this.evaluateReturnStatement(statement);
            case NodeTypes.ARRAYLITERAL:
                return this.evaluateArrayLiteral(statement);
        }
    }

    evaluateArrayLiteral(statement) {
        let list = [];
        for (let t of statement.value.list) {
            list.push(this.evaluate(t));
        }
        return new ArrayL(list);
    }

    evaluateReturnStatement(statement) {
        let e = this.evaluate(statement.exprList);
        throw new ReturnError(e.copy());
    }

    raiseRuntimeError(msg) {
        throw new RuntimeError(msg, this.callStack);
    }

    evaluateExprList(statement) {
        if (statement.list.length !== 1) this.raiseRuntimeError("Can't have Have an expression list without assigment");
        return this.evaluate(statement.list[0]);
    }

    evaluateFunCall(statement) {
        let evaluatedList = [];

        let returnEnv = this.currEnv;

        for (let expr of statement.exprList.list) {
            evaluatedList.push(this.evaluate(expr));
        }


        let fun = this.currEnv.resolveGet(statement.name);

        if (!fun && statement.name in inbuilt_calls) {
            return  inbuilt_calls[statement.name](...evaluatedList);
        }

        if (!fun?.value || fun.value.type !== NodeTypes.FUNDECLARE) this.raiseRuntimeError("Undefined function.");

        fun = fun.value;
        this.currEnv = fun?.parent; // closure

        this.currEnv = new Enviourment(this.currEnv);

        this.callStack = new FunctionCall(this.callStack, fun);

        for (let i = 0; i < fun.parameters.length; i++) {
            let v = fun.parameters[i];
            this.moveEnviourment();
            this.currEnv.declare(v.identifier);
            if (v.value) this.currEnv.resolveSet(v.identifier, this.evaluate(v.value));
            this.currEnv.resolveSet(v.identifier, evaluatedList[i]);
        }
        let r = new NoneL();
        try {
            this.evaluate(fun.body);
        } catch (err) {
            if (err instanceof ReturnError) {
                r = err.value;
            } else {
                throw err;
            }
        }
        this.currEnv = this.currEnv.parent;
        this.currEnv = returnEnv;
        this.callStack = this.callStack.prev;
        return r;
    }
    evaluateFunDeclaration(statement) {
        statement.parent = this.currEnv;
        this.moveEnviourment();
        this.currEnv.declare(statement.name);
        this.currEnv.resolveSet(statement.name, new Value(NodeTypes.FUNDECLARE, statement));
    }

    evaluateVarExprList(statement) {
        for (let s of statement.list) {
            this.evaluate(s);
        }
    }

    evaluateForLoop(statement) {
        this.currEnv = new Enviourment(this.currEnv);

        for (this.evaluate(statement.initialisation);
            this.isTruthy(this.evaluate(statement.condition));
            this.evaluate(statement.increment)) {
            this.evaluate(statement.block);
        }
        this.currEnv = this.currEnv.parent;
    }
    isTruthy(e) {
        return e.value == true;
    }

    evaluateWhileLoop(statement) {
        while (this.isTruthy(this.evaluate(statement.condition))) {
            this.evaluate(statement.block);
        }
    }
    evaluateVarDeclaration(statement) {
        let e = null;
        if (statement.value) e = this.evaluate(statement.value);
        this.moveEnviourment();
        this.currEnv.declare(statement.identifier);
        if (e !== null) this.currEnv.resolveSet(statement.identifier, e);
    }
    evaluateIfStatement(statement) {
        let e = this.evaluate(statement.condition);
        if (this.isTruthy(e)) {
            this.evaluate(statement.statements);
        } else if (statement.else_statements) this.evaluate(statement.else_statements);
    }
    evaluateBlock(block) {
        this.currEnv = new Enviourment(this.currEnv);
        for (let s of block.statements) {
            this.evaluate(s);
        }
        this.currEnv = this.currEnv.parent;
    }
    inbuiltcall(statement) {
        switch (statement.name.type) {
            case TokenTypes.PRINT:
                let t = []
                for (let operand of statement.operands.list) {
                    let e = this.evaluate(operand);
                    t.push(e);
                }
                for (let i of t) {
                    this.printValue(i);
                }
        }
    }
    print(t) {
        this.out.value += t;
    }
    printValue(value) {
        if (value.type === Datatypes.NONE) this.out.value += "None";
        else if (value.value === true) this.out.value += "True";
        else if (value.value === false) this.out.value += "False";
        else if (value.type === Datatypes.ARRAY) {
            this.print("[");
            for (let i = 0; i < value.value.length; i++) {
                this.printValue(value.value[i]);
                if (i !== value.value.length - 1) {
                    this.print(", ");
                }
            }
            this.print("]");
        }
        else this.out.value += value.value;
    }
    evalBinary(statement) {
        if (statement.op.type === TokenTypes.EQUAL) return this.assign(statement.left, statement.right);
        if (statement.op.type === TokenTypes.DOT) return this.dot(statement.left, statement.right);
        return op.operateB(this.evaluate(statement.left), this.evaluate(statement.right), statement.op);
    }
    dot(left, right) {
        let el = this.evaluate(left);
        if (right.type === NodeTypes.FUNCALL) {
            let list = [];
            for (let item of right.exprList?.list) {
                list.push(this.evaluate(item));
            }
            if (el && el.methods  && right.name in el.methods) return el.methods[right.name].bind(el)(...list);
            this.raiseRuntimeError("method is not defined.");
        } else if (right.type === NodeTypes.IDENTIFIER) {
            if (el && el.properties  && right.value in el.properties) return el.properties[right.value].bind(el)();
            this.raiseRuntimeError("property is not defined.");
        }
        this.raiseRuntimeError("Invalid use of dot operator.");
    }
    assign(left, right) {
        let list = [];
        let leftList = []
        for (let item of right.list) {
            list.push(this.evaluate(item));
        }
        for (let item of left.list) {
            leftList.push(this.evaluate(item));
        }
        for (let i = 0; i < leftList.length; i++) {
            if (!leftList[i]) this.raiseRuntimeError("Variable not defined.");
            leftList[i].set(list[i])
        }
        return left;
    }
    evalUnary(statement) {
        return op.operateU(this.evaluate(statement.right), statement.op);
    }
}


module.exports = { Interpreter, RuntimeError };
