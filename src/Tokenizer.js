let TokenTypes = Object.freeze({
    LINE_END : 0,
    MINUS : 1,
    ADD : 2,
    MUL : 3,
    DIV : 4,
    NUMBER : 5,
    STRING : 6,
    EQUAL : 7,
    GREATER_THAN : 8,
    LESS_THAN: 9,
    GREATER_THAN_EQUAL_TO : 10,
    LESS_THAN_EQUAL_TO : 11,
    NOT : 12,
    TRUE : 13,
    FALSE: 14,
    AND: 15,
    OR: 16,
    IDENTIFIER: 17,
    OPEN_CURLY: 18,
    CLOSE_CURLY: 19,
    OPEN_PARANTHESIS: 20,
    CLOSE_PARENTHESIS: 21,
    OPEN_BRACKET: 22,
    CLOSE_BRACKET: 23,
    VAR : 24,
    IF : 25,
    ELSE : 26,
    WHILE : 27,
    FOR : 28,
    FUNCTION : 29,
    NONE: 30,
    BANG_EQUAL: 31,
    EQUAL_EQUAL: 32,
    CLASS: 33,
    RETURN: 34,
    PRINT: 35,
    COMMA: 36,
})


let Keywords = {
    "var" : TokenTypes.VAR,
    "if" : TokenTypes.IF,
    "else" : TokenTypes.ELSE,
    "while" : TokenTypes.WHILE,
    "for" : TokenTypes.FOR,
    "def" : TokenTypes.FUNCTION,
    "True" : TokenTypes.TRUE,
    "False" : TokenTypes.FALSE,
    "None" : TokenTypes.NONE,
    "print" : TokenTypes.PRINT,
    "class" : TokenTypes.CLASS,
    "return" : TokenTypes.RETURN,
    "or" : TokenTypes.OR,
    "and" : TokenTypes.AND,
}

class Token {
    constructor(lineno, type, literal) {
        this.lineno = lineno;
        this.type = type;
        this.literal = literal;
    }
    // toString() {
    //     return `Token { Line-No: ${this.lineno}, Type: ${this.type}, Literal: ${this.literal} }`;
    // }
}

class Tokenizer {
    constructor() {
        this.tokens = [];
        this.text = "";
        this.currIndex = -1;
        this.currLine = 1;
        this.currliteral = "";
    }
    parse(text) {
        this.text = text;
        this.currIndex = 0;
        while (this.currIndex < text.length) {
            let c = text[this.currIndex];
            let lineno = this.currLine;
            switch(c) {
                case "(":
                    this.tokens.push(new Token(lineno, TokenTypes.OPEN_PARANTHESIS, c))
                    break;
                case ")":
                    this.tokens.push(new Token(lineno, TokenTypes.CLOSE_PARENTHESIS, c))
                    break;
                case "[":
                    this.tokens.push(new Token(lineno, TokenTypes.OPEN_BRACKET, c))
                    break;
                case "]":
                    this.tokens.push(new Token(lineno, TokenTypes.CLOSE_BRACKET, c))
                    break;
                case "{":
                    this.tokens.push(new Token(lineno, TokenTypes.OPEN_CURLY, c))
                    break;
                case "}":
                    this.tokens.push(new Token(lineno, TokenTypes.CLOSE_CURLY, c))
                    break;
                case "+":
                    this.tokens.push(new Token(lineno, TokenTypes.ADD, c))
                    break;
                case "-":
                    this.tokens.push(new Token(lineno, TokenTypes.MINUS, c))
                    break;
                case "*":
                    this.tokens.push(new Token(lineno, TokenTypes.MUL, c))
                    break;
                case "/":
                    this.tokens.push(new Token(lineno, TokenTypes.DIV, c))
                    break;
                case ";":
                    this.tokens.push(new Token(lineno, TokenTypes.LINE_END, c))
                    break;
                case "<":
                    if (this.peek() == "=") {
                        this.currIndex += 1;
                        this.tokens.push(new Token(lineno, TokenTypes.LESS_THAN_EQUAL_TO, "<="))
                        break;
                    }
                    this.tokens.push(new Token(lineno, TokenTypes.LESS_THAN, c))
                    break;
                case ">":
                    if (this.peek() == "=") {
                        this.currIndex += 1;
                        this.tokens.push(new Token(lineno, TokenTypes.GREATER_THAN_EQUAL_TO, ">="))
                        break;
                    }
                    this.tokens.push(new Token(lineno, TokenTypes.GREATER_THAN, c))
                    break;
                case "=":
                    if (this.peek() == '=') {
                        console.log("parising double equal", lineno);
                        this.currIndex += 1;
                        this.tokens.push(new Token(lineno, TokenTypes.EQUAL_EQUAL, "=="))
                        break;
                    }
                    this.tokens.push(new Token(lineno, TokenTypes.EQUAL, c))
                    break;
                case ",":
                    this.tokens.push(new Token(lineno, TokenTypes.COMMA, c))
                    break;
                case "!":
                    if (this.peek() == "=") {
                        this.currIndex += 1;
                        this.tokens.push(new Token(lineno, TokenTypes.BANG_EQUAL, "!="))
                        break;
                    }
                    this.tokens.push(new Token(lineno, TokenTypes.NOT, c))
                    break;
                case "&":
                    if (this.peek() == "&") {
                        this.currIndex += 1;
                        this.tokens.push(new Token(lineno, TokenTypes.AND, "&&"));
                    }
                    else throw Error("Unidentified Token");
                    break;
                case "|":
                    if (this.peek() == '|') {
                        this.currIndex += 1;
                        this.tokens.push(new Token(lineno, TokenTypes.OR, "||"));
                    }
                    else throw Error("Unidentified Token");
                    break;
                case "\n":
                    this.currLine++;
                    break;
                case "\"":
                case "'":
                    this.string_l(c);
                    break;
                default:
                    if (this.isNumber(c)) {
                        this.number_l();
                    } else if (this.isLetter(c)) {
                        this.identifier_l();
                    }
            }
            this.currIndex++;
        }
        let t = this.tokens
        this.tokens = [];
        this.currIndex = -1;
        this.currliteral = "";
        this.currLine = 1;
        return t;
    }
    string_l(c) {
        let i = this.currIndex;
        let escaping = false;
        let string_building = "";
        let map = {
            "a" : "\a",
            "b" : "\b",
            "f" : "\f",
            "n" : "\n",
            "r" : "\r",
            "t" : "\t",
            "v" : "\v",
        }
        while (this.peek() != null && (this.peek() !== c || escaping)) {
            if (this.peek() == "\\" && !escaping) {
                escaping = true;
            } else if (escaping) {
                let t = this.peek();
                if (this.peek() in map) t = map[this.peek()];
                string_building += t;
                escaping = false;
            } else {
                string_building += this.peek();
            }
            this.currIndex++;
        }
        if (this.peek() === null) {
            throw Error("String not ending");
        }
        // let literal = this.text.slice(i + 1, this.currIndex + 1);
        this.currIndex++;
        this.tokens.push(new Token(this.currLine, TokenTypes.STRING, string_building));
    }
    identifier_l() {
        let i = this.currIndex;
        while (this.isAlphaNumeric(this.peek())) {
            this.currIndex++;
        }
        let literal = this.text.slice(i, this.currIndex + 1);
        if (literal in Keywords) {
            this.tokens.push(new Token(this.currLine, Keywords[literal], literal));
            return;
        }
        this.tokens.push(new Token(this.currLine, TokenTypes.IDENTIFIER, literal));
    }
    isAlphaNumeric(c) {
        return c != null  && (this.isLetter(c) || this.isNumber(c));
    }
    isLetter(c) {
        if (c == null) return false;
        let t = c.charCodeAt(0);
        return (t >= 65 && t < 91) || (t >= 97 && t < 123);
    }
    isNumber(c) {
        if (c == null) return false;
        let t = c.charCodeAt(0);
        return (t >= 48 && t < 58);
    }
    number_l() {
        let i = this.currIndex;
        while (!isNaN(this.peek() - 0)) {
            this.currIndex++;
        }
        if (this.match(".")) {
            while(!isNaN(this.peek() - 0)) {
                this.currIndex++;
            }
        }
        let literal = this.text.slice(i, this.currIndex + 1);
        this.tokens.push(new Token(this.currLine, TokenTypes.NUMBER, literal));
    }
    peek() {
        return this.currIndex + 1 < this.text.length? this.text[this.currIndex + 1]: null;
    }
    match(c) {
        if (c == this.peek()) {
            this.currIndex++;
            return true;
        }
        return false;
    }
}

export  {Tokenizer, Token, TokenTypes, Keywords};