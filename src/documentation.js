import { reverseKeywords, TokenTypes } from "./Tokenizer.js"

function documentations() {
  return [
    {
      "id": 1,
      "title": "Variables",
      "desc": "Here is how to declare variables", 
      "code": `${reverseKeywords[TokenTypes.VAR]} variable_name; // without definition\n` +
      `${reverseKeywords[TokenTypes.VAR]} variable_name = 'hello'; // with definition\n`
    },
    {
      "id": 2,
      "title": "If/Else",
      "desc": "Here is how to write if/else statements", 
      "code": `${reverseKeywords[TokenTypes.IF]} ( expression ) {\n` +
      `  ...\n`+
      `} ${reverseKeywords[TokenTypes.ELSE]} {\n` +
      `  ...\n` +
      `}\n` +
      `//or\n` +
      `${reverseKeywords[TokenTypes.IF]} ( expression ) statement1;\n` +
      `${reverseKeywords[TokenTypes.ELSE]} statement2;`
    },
    {
      "id": 3,
      "title": "While loop",
      "desc": "Here is how to write a While loop", 
      "code": `${reverseKeywords[TokenTypes.WHILE]} ( expression ) {\n` +
      `  ...\n`+
      `}\n` +
      `//or\n` +
      `${reverseKeywords[TokenTypes.WHILE]} ( expression ) statement1;\n`
    },
    {
      "id": 4,
      "title": "For loop",
      "desc": "Here is how to write a For loop", 
      "code": `${reverseKeywords[TokenTypes.FOR]} (initialization_statement; test_expression ; update_expression) {\n` +
      `  ...\n`+
      `}\n` +
      `//or\n` +
      `${reverseKeywords[TokenTypes.FOR]} (initialization_statement; test_expression ; update_expression) statement1;`
    },
    {
      "id": 5,
      "title": "Functions",
      "desc": "Here is how to define a function", 
      "code": `${reverseKeywords[TokenTypes.FUNCTION]} function_name (${reverseKeywords[TokenTypes.VAR]} a, ${reverseKeywords[TokenTypes.VAR]} b, ...) {\n` +
      `  ...\n`+
      `}\n`
    },
    {
      "id": 6,
      "title": "Comments",
      "desc": "Here is how to write a comment", 
      "code": `// this is a comment`
    },
    {
      "id": 7,
      "title": "Print Statement",
      "desc": "Here is how to write to the output", 
      "code": `${reverseKeywords[TokenTypes.PRINT]} 'hello world';`
    },
    {
      "id": 8,
      "title": "Variable Assignment",
      "desc": "Here is how to assign a value to variables", 
      "code": `variable_name = 'hello world'; // single variable assignment\n` +
      `//or\n` +
      `variable1, variable2 = 'hello', 'world'; // multiple variable assignment`
    }
  ]
}


export { documentations }