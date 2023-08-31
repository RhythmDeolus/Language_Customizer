import {Tokenizer, Keywords, TokenTypes} from "./Tokenizer.js";

import { Parser } from "./Parser.js";

import { Interpreter } from "./Interpreter.js";

// import fs from 'fs';


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
}

var hl = new HL();

export {hl};
// let text = fs.readFileSync('./test.lux', 'utf8');

// let text = "print 'hello world';";


// console.log(tokens);



// console.log(statements);
// console.log(interpreter.globals);

