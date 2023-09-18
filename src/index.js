const { Tokenizer, Keywords, TokenTypes, reverseKeywords, KeyColors, KeyDesc, CompilerError } = require("./Tokenizer.js");

const { Parser } = require("./Parser.js");

const { Interpreter, RuntimeError } = require("./Interpreter.js");

const { documentations } = require("./documentation.js");

class HL {
    run(text, out) {
        try {
            let tokeizer = new Tokenizer();
            let tokens = tokeizer.parse(text);
            let parser = new Parser(tokens);
            let statements = parser.run();
            let interpreter = new Interpreter(statements, out);
            interpreter.run();
        } catch (err) {
            if (err instanceof CompilerError || err instanceof RuntimeError) {
                out.err = true;
                out.errMsg = err.toString();
            } else {
                throw err;
            }
        }

    }
    getKeywords() {
        return Keywords;
    }
    getReverseKeywords() {
        return reverseKeywords;
    }
    setKeyword(pid, nkey) {
        delete Keywords[reverseKeywords[Number(pid)]];
        Keywords[nkey] = Number(pid);
        reverseKeywords[Number(pid)] = nkey;
    }
    getKeyColors() {
        return KeyColors;
    }
    getKeyDesc() {
        return KeyDesc;
    }
    getDocumentation() {
        return documentations();
    }
}

let hl = new HL();

module.exports = { hl };

