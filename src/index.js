import {Tokenizer, Keywords, TokenTypes, reverseKeywords, KeyColors, KeyDesc, CompilerError} from "./Tokenizer.js";

import { Parser } from "./Parser.js";

import { Interpreter, RuntimeError } from "./Interpreter.js";

import {documentations} from "./documentation.js";

class HL {
    run(text, out) {
        try{
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

export default {hl};

