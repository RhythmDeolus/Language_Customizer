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
        while(t && t.fun) {
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
            this.variables[variable] = value;
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
        for(let statement of this.statements) {
            this.evaluate(statement);
        }
    }

    evaluate(statement) {
        switch(statement.type) {
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
                return statement.value;
            case NodeTypes.IDENTIFIER:
                return this.currEnv.resolveGet(statement.value);
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

        for(this.evaluate(statement.initialisation);
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
        this.currEnv.resolveSet(statement.identifier, e);
    }
    evaluateIfStatement(statement){
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
        switch(statement.name.type) {
            case TokenTypes.PRINT:
                let t = []
                for (let operand of statement.operands.list) {
                    t.push(this.evaluate(operand));
                }
                for (let i of t) {
                    this.printValue(i);
                }
        }
    }
    printValue(value) {
        if (value === null) this.out.value += "None";
        else if (value === true) this.out.value += "True";
        else if (value === false) this.out.value +="False";
        else this.out.value += value;
    }
    evalBinary(statement) {
        switch(statement.op.type) {
            case TokenTypes.ADD:
                return this.evaluate(statement.left)  + this.evaluate(statement.right);
            case TokenTypes.MINUS:
                return this.evaluate(statement.left)  - this.evaluate(statement.right);
            case TokenTypes.DIV:
                return this.evaluate(statement.left)  / this.evaluate(statement.right);
            case TokenTypes.MUL:
                let left = this.evaluate(statement.left);
                let right = this.evaluate(statement.right);
                if (typeof left === typeof "" && typeof right == typeof 1) {
                    if (Number.isInteger(right) && right >= 0) {
                        let result = "";
                        for (let i = 0; i < right; i++) {
                            result += left;
                        }
                        return result;
                    } else this.raiseRuntimeError("Can not multiply string with a non-integer number.");
                }
                return left * right;
            case TokenTypes.EQUAL_EQUAL:
                return this.evaluate(statement.left) === this.evaluate(statement.right);
            case TokenTypes.BANG_EQUAL:
                return this.evaluate(statement.left) !== this.evaluate(statement.right);
            case TokenTypes.GREATER_THAN:
                return this.evaluate(statement.left)  > this.evaluate(statement.right);
            case TokenTypes.GREATER_THAN_EQUAL_TO:
                return this.evaluate(statement.left)  >= this.evaluate(statement.right);
            case TokenTypes.LESS_THAN:
                return this.evaluate(statement.left)  < this.evaluate(statement.right);
            case TokenTypes.LESS_THAN_EQUAL_TO:
                return this.evaluate(statement.left)  <= this.evaluate(statement.right);
            case TokenTypes.OR:
                return this.evaluate(statement.left)  || this.evaluate(statement.right);
            case TokenTypes.AND:
                return this.evaluate(statement.left)  && this.evaluate(statement.right);
            case TokenTypes.EQUAL:
                let list = [];
                for (let item of statement.right.list) {
                    list.push(this.evaluate(item));
                }
                for (let i = 0; i < statement.left.list.length; i++) {
                    let t = this.currEnv.resolveSet(statement.left.list[i].value, list[i]);
                    if (!t) this.raiseRuntimeError("Variable not defined.", statement.left.list[i]);
                }
                return statement.left;
        }
    }
    evalUnary(statement) {
        switch(statement.op) {
            case TokenTypes.NOT:
                return ! this.evaluate(statement.right);
            case TokenTypes.MINUS:
                return - this.evaluate(statement.right);
        }
    }
}


export {Interpreter, RuntimeError};