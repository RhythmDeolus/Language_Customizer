import { NodeTypes, Value } from "./Parser.js";
import { TokenTypes } from "./Tokenizer.js";

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

class Operations {
    newValue(type, a) {
        return new Value(type, a);
    }
    checkB(a, b, typea, typeb) {
        if (a.type === typea && b.type === typeb) return true;
        return false;
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
        console.log(a, b, op);
        let result = this.getValueAfterOpB(a, b, op);
        console.log(result);
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
    add(a, b) {
        if (this.checkB(a, b, NodeTypes.NUMBER, NodeTypes.NUMBER) ||
        this.checkB(a, b, NodeTypes.STRING, NodeTypes.STRING))
        return this.newValue(a.type, a.value + b.value);
    }
    sub(a, b) {
        if (this.checkB(a, b, NodeTypes.NUMBER, NodeTypes.NUMBER) )
        return this.newValue(NodeTypes.NUMBER, a.value - b.value);
    }
    mul(a, b) {
        if (this.checkB(a, b, NodeTypes.STRING, NodeTypes.NUMBER)) {
            if (Number.isInteger(b.value) && b.value >= 0) {
                let result = "";
                for (let i = 0; i < b.value; i++) {
                    result += a.value;
                }
                return this.newValue(NodeTypes.STRING, result);
            } else this.raiseRuntimeError("Can not multiply string with a non-integer number.");
        }
        if (this.checkB(a, b, NodeTypes.NUMBER, NodeTypes.NUMBER)) return this.newValue(NodeTypes.NUMBER, a.value * b.value);
    }
    div(a, b) {
        if (this.checkB(a, b, NodeTypes.NUMBER, NodeTypes.NUMBER))
        return this.newValue(NodeTypes.NUMBER, a.value / b.value);
    }
    areSameType(a, b) {
        return a.type === b.type;
    }
    equal_equal(a, b) {
        if (this.areSameType(a, b))
        return this.newValue(NodeTypes.BOOLEAN, a.value === b.value);
    }
    not_equal(a, b) {
        if (this.areSameType(a, b))
        return this.newValue(NodeTypes.BOOLEAN, a.value !== b.value);
    }
    areType(a, b, type) {
        return a.type == type && b.type == type;
    }
    isType(a, type) {
        return a.type == type;
    }
    greater(a, b) {
        if (this.areType(a, b, NodeTypes.NUMBER) || 
        this.areType(a, b, NodeTypes.STRING))
        return this.newValue(NodeTypes.BOOLEAN, a.value > b.value);
    }
    greater_equal(a, b) {
        if (this.areType(a, b, NodeTypes.NUMBER) || 
        this.areType(a, b, NodeTypes.STRING))
        return this.newValue(NodeTypes.BOOLEAN, a.value >= b.value);
    }
    less(a, b) {
        if (this.areType(a, b, NodeTypes.NUMBER) || 
        this.areType(a, b, NodeTypes.STRING))
        return this.newValue(NodeTypes.BOOLEAN, a.value < b.value);
    }
    less_equal(a, b) {
        if (this.areType(a, b, NodeTypes.NUMBER) || 
        this.areType(a, b, NodeTypes.STRING))
        return this.newValue(NodeTypes.BOOLEAN, a.value <= b.value);
    }
    and(a, b) {
        if (this.areType(a, b, NodeTypes.BOOLEAN))
        return this.newValue(NodeTypes.BOOLEAN, a.value && b.value);
    }
    or(a, b) {
        if (this.areType(a, b, NodeTypes.BOOLEAN))
        return this.newValue(NodeTypes.BOOLEAN, a.value || b.value);
    }
    not(a) {
        if (this.isType(a, NodeTypes.BOOLEAN))
        return this.newValue(NodeTypes.BOOLEAN, !a.value);
    }
    uminus(a) {
        if (this.isType(a, NodeTypes.NUMBER))
        return this.newValue(NodeTypes.NUMBER, -a.value);
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
            return this.variables[variable];
        } else if (this.parent != null) {
            return this.parent.resolveGet(variable);
        }
        return undefined;
    }
    resolveSet(variable, value) {
        if (variable in this.variables) {
            this.variables[variable] = new Value(value.type, value.value);
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

    evaluate(statement) {
        switch (statement.type) {
            case NodeTypes.INBUILT_CALL:
                return this.inbuiltcall(statement);
            case NodeTypes.BINARY_OP:
                return this.evalBinary(statement);
            case NodeTypes.UNARY_OP:
                return this.evalUnary(statement);
            case NodeTypes.GROUPING:
                return this.evaluate(statement.expr);
            case NodeTypes.STRING:
            case NodeTypes.NONE:
            case NodeTypes.BOOLEAN:
            case NodeTypes.NUMBER:
                return statement;
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
        }
    }

    evaluateReturnStatement(statement) {
        throw new ReturnError(this.evaluate(statement.exprList));
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

        console.log(fun);

        if (!fun || fun.type !== NodeTypes.FUNDECLARE) this.raiseRuntimeError("Undefined function.");

        this.currEnv = fun.parent; // closure

        this.currEnv = new Enviourment(this.currEnv);

        this.callStack = new FunctionCall(this.callStack, fun);

        for (let i = 0; i < fun.parameters.length; i++) {
            let v = fun.parameters[i];
            this.currEnv.declare(v.identifier);
            if (v.value) this.currEnv.resolveSet(v.identifier, this.evaluate(v.value));
            this.currEnv.resolveSet(v.identifier, evaluatedList[i]);
        }
        let r = null;
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
        this.currEnv.declare(statement.name);
        this.currEnv.resolveSet(statement.name, statement);
    }

    evaluateVarExprList(statement) {
        for (let s of statement.list) {
            this.evaluate(s);
        }
    }

    evaluateForLoop(statement) {
        this.currEnv = new Enviourment(this.currEnv);

        for (this.evaluate(statement.initialisation);
            this.evaluate(statement.condition);
            this.evaluate(statement.increment)) {
            this.evaluate(statement.block);
        }
        this.currEnv = this.currEnv.parent;
    }

    evaluateWhileLoop(statement) {
        while (this.evaluate(statement.condition)) {
            this.evaluate(statement.block);
        }
    }
    evaluateVarDeclaration(statement) {
        let e = null;
        if (statement.value) e = this.evaluate(statement.value);
        this.currEnv.declare(statement.identifier);
        if (e !== null) this.currEnv.resolveSet(statement.identifier, e);
    }
    evaluateIfStatement(statement) {
        let e = this.evaluate(statement.condition);
        if (e) {
            this.evaluate(statement.statements);
        } else {
            if (statement.else_statements) this.evaluate(statement.else_statements);
        }
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
    printValue(value) {
        if (value.type === NodeTypes.NONE) this.out.value += "None";
        else if (value.value === true) this.out.value += "True";
        else if (value.value === false) this.out.value += "False";
        else this.out.value += value.value;
    }
    evalBinary(statement) {
        return op.operateB(this.evaluate(statement.left), this.evaluate(statement.right), statement.op);
    }
    assign(left, right) {
        let list = [];
        for (let item of right.list) {
            list.push(this.evaluate(item));
        }
        for (let i = 0; i < left.list.length; i++) {
            let t = this.currEnv.resolveSet(left.list[i].value, list[i]);
            if (!t) this.raiseRuntimeError("Variable not defined.", left.list[i]);
        }
        return left;
    }
    evalUnary(statement) {
        return op.operateU(this.evaluate(statement.right), statement.op);
    }
}


export { Interpreter, RuntimeError };