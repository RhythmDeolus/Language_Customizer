import {Tokenizer, Keywords, TokenTypes, reverseKeywords, KeyColors, KeyDesc} from "./Tokenizer.js";

import { Parser } from "./Parser.js";

import { Interpreter } from "./Interpreter.js";

class HL {
    run(text, out) {
        let tokeizer = new Tokenizer();
        let tokens = tokeizer.parse(text);
        let parser = new Parser(tokens);
        let statements = parser.run();
        let interpreter = new Interpreter(statements, out);
        interpreter.run();
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
}

let hl = new HL();

export {hl};

