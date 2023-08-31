import {Token, TokenTypes} from "./Tokenizer.js";

class ASTNode {
    constructor(type) {
        this.type = type;
    }
}

let NodeTypes = Object.freeze({
    STRING: 1,
    NUMBER: 2, 
    BOOLEAN: 3,
    NONE: 4,
    VARDECLARATION: 5,
    BINARY_OP: 6,
    UNARY_OP: 7,
    GROUPING: 8,
    INBUILT_CALL: 9,
    IFSTATEMENT: 10,
    BLOCK: 11,
    IDENTIFIER: 12,
    WHILELOOP: 13,
    FORLOOP: 14,
    EXPRLIST: 15,
    VAREXPRLIST: 16,
    FUNDECLARE: 17,
    FUNCALL: 18,
    RETURNSTMT: 19,
})


class Block extends ASTNode {
    constructor(statements) {
        super(NodeTypes.BLOCK);
        this.statements = statements;
    }
}

class Value extends ASTNode {
    constructor(type, value) {
        super(type);
        this.value = value;
    }
}

class VarExprList extends ASTNode {
    constructor(list) {
        super(NodeTypes.VAREXPRLIST);
        this.list = list;
    }
}

class FunctionDeclaration extends ASTNode {
    constructor(name, parameters, body) {
        super(NodeTypes.FUNDECLARE);
        this.name = name;
        this.parameters = parameters;
        this.body = body;
        this.parent = null;
    }
}

class BinaryOperation extends ASTNode {
    constructor(left, right, op) {
        super(NodeTypes.BINARY_OP);
        this.right = right;
        this.left = left;
        this.op = op
    }
    isAssignable() {
        return typeof this.right == ExprList && this.right.isAssignable();
    }
}

class Grouping extends ASTNode {
    constructor(expr)  {
        super(NodeTypes.GROUPING);
        this.expr = expr;
    }
}

class UnaryOperation extends ASTNode {
    constructor(right, op) {
        super(NodeTypes.UNARY_OP);
        this.right = right;
        this.op = op;
    }
}

class WhileLoop extends ASTNode {
    constructor(condition, block) {
        super(NodeTypes.WHILELOOP);
        this.condition = condition;
        this.block = block;
    }
}

class VarDeclaration extends ASTNode {
    constructor(type, identifier, value) {
        super(type);
        this.identifier = identifier;
        this.value = value;
    }
}

class InBuiltFunctionCalls extends ASTNode {
    constructor(name, operands) {
        super(NodeTypes.INBUILT_CALL);
        this.name = name;
        this.operands = operands;
    }
}

class ReturnStatement extends ASTNode {
    constructor(exprList) {
        super(NodeTypes.RETURNSTMT);
        this.exprList = exprList;
    }
}

class ForLoop extends ASTNode {
    constructor(initialisation, condition, increment, block) {
        super(NodeTypes.FORLOOP);
        this.initialisation = initialisation;
        this.condition = condition;
        this.increment = increment;
        this.block = block;
    }
}

class FunctionCall extends ASTNode {
    constructor(name, exprlist) {
        super(NodeTypes.FUNCALL);
        this.name = name;
        this.exprList = exprlist;
    }
}

class ExprList extends ASTNode {
    constructor(list) {
        super(NodeTypes.EXPRLIST);
        this.list = list;
    }
    isAssignable() {
        for (let item of this.list) {
            if (item.type != NodeTypes.IDENTIFIER) {
                return false;
            }
        }
        return true;
    }
}

class IfStatement extends ASTNode {
    constructor(condition, statements, else_statements) {
        super(NodeTypes.IFSTATEMENT);
        this.condition = condition;
        this.statements = statements;
        this.else_statements = else_statements;
    }
}

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.statements = [];
        this.currToken = 0;
        this.funScope = 0;
    }
    run() {
        while(this.currToken  < this.tokens.length) {
            try {
                this.statements.push(this.statement());
            } catch (err) {
                console.log(err);
                this.synchronize();
            }
        }
        return this.statements;
    }

    statement() {
        if (this.match(TokenTypes.VAR)) {
            let v = this.varDeclaration();
            this.consume(TokenTypes.LINE_END, "Expected an end of line token");
            return v;
        }
        if (this.match(TokenTypes.PRINT)) {
            return this.printStatement();
        }
        if (this.match(TokenTypes.IF)) {
            return this.ifStatement();
        }
        if (this.match(TokenTypes.OPEN_CURLY)) {
            return this.block();
        }
        if (this.match(TokenTypes.WHILE)) {
            return this.whileLoop();
        }
        if (this.match(TokenTypes.FOR)) {
            return this.forLoop();
        }
        if (this.match(TokenTypes.FUNCTION)) {
            return this.funDeclaration();
        } if (this.match(TokenTypes.RETURN)) {
            return this.returnStatement();
        }
        let e = this.expression();
        this.consume(TokenTypes.LINE_END, "Expected a statement");
        return e;
    }

    returnStatement() {
        if (this.funScope === 0) throw new Error("You can only use Return statement inside a function");
        let e = this.expressionList();
        this.consume(TokenTypes.LINE_END, "Expected an end of line token.");
        return new ReturnStatement(e);
    }

    funDeclaration() {
        this.funScope++;
        this.consume(TokenTypes.IDENTIFIER, "Expected an identifier.");
        let i = this.previous().literal;
        this.consume(TokenTypes.OPEN_PARANTHESIS, "Expect '('.");
        let varlist = this.parameterList();
        this.consume(TokenTypes.CLOSE_PARENTHESIS, "Expect ')'.")
        let b = null;
        if (this.match(TokenTypes.OPEN_CURLY)) b = this.block();
        this.funScope--;
        return new FunctionDeclaration(i, varlist, b);
    }

    parameterList() {
        let list = [];
        if (this.check(TokenTypes.CLOSE_PARENTHESIS)) return list;
        do{
            this.consume(TokenTypes.VAR, "Expected a variable declaration");
            list.push(this.varDeclaration());
        } while (!this.isAtEnd() && this.match(TokenTypes.COMMA));

        if (this.isAtEnd()) throw new Error("Unexpected end of stream.");

        return list;
    }

    forLoop() {
        let d = null;
        let condition = null;
        let increment = null;
        this.consume(TokenTypes.OPEN_PARANTHESIS, "Expect '('.");
        if (!this.match(TokenTypes.LINE_END)) {
            d = this.varDeclarationAndExprList();
            this.consume(TokenTypes.LINE_END, "Expected End of line");
        }
        if (!this.match(TokenTypes.LINE_END)) {
            condition = this.or();
            this.consume(TokenTypes.LINE_END, "Expected End of Line.");
        }
        if (!this.match(TokenTypes.CLOSE_PARENTHESIS)) {
            increment = this.assign();
            this.consume(TokenTypes.CLOSE_PARENTHESIS, "Expected ')'.");
        }
        let statement = this.statement();

        return new ForLoop(d, condition, increment, statement);

    }

    expressionList() {
        let list = [];
        list.push(this.or());
        while(!this.isAtEnd() && this.match(TokenTypes.COMMA)) {
            list.push(this.or());
        }
        if (this.isAtEnd()) throw new Error("Unexpected end of stream");
        return new ExprList(list);
    }

    whileLoop() {
        this.consume(TokenTypes.OPEN_PARANTHESIS, "Expect '('");
        let condition = this.or();
        this.consume(TokenTypes.CLOSE_PARENTHESIS, "Expect ')'");
        let b = this.statement();
        return new WhileLoop(condition, b);
    }

    varDeclarationAndExprList() {
        let list = []
        do {
            if (this.match(TokenTypes.VAR)) list.push(this.varDeclaration());
            else list.push(this.or());
        } while ((!this.isAtEnd() && this.match(TokenTypes.COMMA)));
        console.log(list);
        if (this.isAtEnd()) throw new Error("unexpected end of stream.");
        return new VarExprList(list);
    }

    varDeclaration() {
        if (this.match(TokenTypes.IDENTIFIER)) {
            let i = this.previous().literal;
            let e = null;
            if (this.match(TokenTypes.EQUAL)) {
                e = this.or();
            }
            return new VarDeclaration(NodeTypes.VARDECLARATION, i, e);
        }
        throw new Error("Expected an identifer in variable declaration.");
    }

    block() {
        let statments = [];
        while(!this.isAtEnd() && !this.check(TokenTypes.CLOSE_CURLY)) {
            statments.push(this.statement());
        }
        if (this.isAtEnd()) throw new Error("Unexpected end of stream");
        this.consume(TokenTypes.CLOSE_CURLY, "Expect '}'");
        return new Block(statments);
    }

    ifStatement() {
        this.consume(TokenTypes.OPEN_PARANTHESIS, "Expect '(' after if.");
        let e = this.expression();
        this.consume(TokenTypes.CLOSE_PARENTHESIS, "Except ')' after expression.");
        let b = this.statement();
        let else_block = null;
        if (this.match(TokenTypes.ELSE)) {
            else_block = this.statement();
        }
        return new IfStatement(e, b, else_block);
    }

    printStatement() {
        let op = this.previous();
        // console.log("parsing operands");
        // operands.push(this.expression());
        // while (this.match(TokenTypes.COMMA)) {
        //     operands.push(this.expression());
        // }
        let exprList = this.expressionList()
        // console.log(operands);
        this.consume(TokenTypes.LINE_END, "Expect Line End after print statement.");
        return new InBuiltFunctionCalls(op, exprList);
    }

    expression() {
        return this.assign();
    }

    assign() {
        let e1 = this.expressionList();

        while(this.match(TokenTypes.EQUAL)) {
            let t = this.previous();
            let right = this.expressionList();
            if (e1.isAssignable()) {
                e1 =  new BinaryOperation(e1, right, t);
            } else {
                throw new Error("Unable to assign value to non-variable");
            }
        }
        return e1;
    }

    synchronize() {
        this.advance();
        while (!this.isAtEnd()) {
            if (this.previous.type == TokenTypes.LINE_END) return;

            switch(this.peek().type) {
                case TokenTypes.CLASS:
                case TokenTypes.FUNCTION:
                case TokenTypes.VAR:
                case TokenTypes.IF:
                case TokenTypes.FOR:
                case TokenTypes.RETURN:
                case TokenTypes.WHILE:
                    return;
            }

            this.advance();
        }
    }

    equality() {
        let e1 = this.comparison();

        while(this.match(TokenTypes.BANG_EQUAL) || this.match(TokenTypes.EQUAL_EQUAL)) {
            let t = this.previous();
            let right = this.comparison();
            e1 = new BinaryOperation(e1, right, t);
        }
        return e1;
    }

    or() {
        let e1 = this.and();

        while(this.match(TokenTypes.OR)) {
            let t = this.previous();
            let right = this.and();
            e1 = new BinaryOperation(e1, right, t);
        }
        return e1;
    }

    and() {
        let e1 = this.equality();

        while(this.match(TokenTypes.AND)) {
            let t = this.previous();
            let right = this.equality();
            e1 = new BinaryOperation(e1, right, t);
        }
        return e1;
    }

    comparison() {
        let e1 = this.term();

        while(this.match(TokenTypes.GREATER_THAN, TokenTypes.LESS_THAN, TokenTypes.GREATER_THAN_EQUAL_TO, TokenTypes.LESS_THAN_EQUAL_TO)) {
            let op = this.previous();
            let right = this.term();
            e1 = new BinaryOperation(e1, right, op);
        }

        return e1;
    }

    term() {
        let e1 = this.factor();

        while(this.match(TokenTypes.ADD, TokenTypes.MINUS)) {
            let op = this.previous();
            let r = this.factor();
            e1 = new BinaryOperation(e1, r, op);
        }

        return e1;
    }
    factor() {
        let e1 = this.unary();

        while (this.match(TokenTypes.DIV, TokenTypes.MUL)) {
            let op = this.previous();
            let r = this.unary();
            e1 = new BinaryOperation(e1, r, op);
        }
        return e1;
    }

    unary() {
        if (this.match(TokenTypes.NOT, TokenTypes.MINUS)) {
            let op = this.previous();
            let r = this.unary();
            return new UnaryOperation(r, op);
        }

        return this.primary();
    }
    primary() {
        // console.log("parsing primary :" , this.isAtEnd());
        if (this.match(TokenTypes.FALSE)) return new Value(NodeTypes.BOOLEAN, false);
        if (this.match(TokenTypes.TRUE)) return new Value(NodeTypes.BOOLEAN, true);
        if (this.match(TokenTypes.NONE)) return new Value(NodeTypes.NONE, null);
        if (this.match(TokenTypes.STRING)) return new Value(NodeTypes.STRING, this.previous().literal);
        if (this.match(TokenTypes.NUMBER)) return new Value(NodeTypes.NUMBER, Number(this.previous().literal));
        if (this.match(TokenTypes.IDENTIFIER)) {
            let identifer = this.previous().literal;
            if (this.match(TokenTypes.OPEN_PARANTHESIS)) {
                
                let el = new ExprList([]);
                if (!this.check(TokenTypes.CLOSE_PARENTHESIS)) el = this.expressionList();
                this.consume(TokenTypes.CLOSE_PARENTHESIS, "Expected ')'");
                return new FunctionCall(identifer, el);
            }
            return new Value(NodeTypes.IDENTIFIER, identifer);
        }
        if (this.match(TokenTypes.OPEN_PARANTHESIS)) {
            let e1 = this.expression();
            this.consume(TokenTypes.CLOSE_PARENTHESIS, "Expect ')' after expression.");
            return new Grouping(e1);
        }

        throw this.error(this.peek(), "Expect expression");
    }
    error(token, message) {
        // do something here
        return new Error(message);
    }
    isAtEnd() {
        return this.currToken >= this.tokens.length;
    }

    advance() {
        if (!this.isAtEnd()) this.currToken++;
        return this.previous();
    }

    previous() {
        return this.currToken > 0? this.tokens[this.currToken - 1]: null;
    }

    peekAhead() {
        return this.currToken + 1 < this.tokens.length? this.tokens[this.currToken + 1]: null;
    }
    peek() {
        return this.tokens[this.currToken];
    }

    match(...types) {
        for (let type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }

    check(type) {
        if (this.isAtEnd()) return false;
        return this.peek().type == type;
    }

    consume(type, error) {
        if (this.match(type)) {
            return true;
        }
        throw Error(error);
    }

    literal() {
        if (this.tokens[this.currToken].type == TokenTypes.STRING) {
            return new Value(NodeTypes.STRING, this.literal);
        } else if (this.tokens[this.currToken].type == TokenTypes.NUMBER) {
            return new Value(NodeTypes.NUMBER, this.literal);
        } else if (this.tokens[this.currToken].type == TokenTypes.TRUE) {
            return new Value(NodeTypes.BOOLEAN, true);
        } else if (this.tokens[this.currToken].type == TokenTypes.FALSE) {
            return new Value(NodeTypes.BOOLEAN, false);
        } else if (this.tokens[this.currToken].type == TokenTypes.NONE) {
            return new Value(NodeTypes.NONE, null);
        }
        return null;
    }
}


export {Parser, NodeTypes, Value}