/*
 * NOTE: This Parser was coded by: 
 * Alexander Schenkel- https://github.com/bylexus/fparse
 * MIT LICENCE
 */

 const MATH_CONSTANTS = {
    PI: Math.PI,
    E: Math.E,
    LN2: Math.LN2,
    LN10: Math.LN10,
    LOG2E: Math.LOG2E,
    LOG10E: Math.LOG10E,
    SQRT1_2: Math.SQRT1_2,
    SQRT2: Math.SQRT2
};

export default class Formula {
    /**
     * @param {String} fStr The formula string, e.g. 'sin(x)/cos(y)'
     * @param {Object} options An options object. Supported options:
     * @param {Formula} parentFormula Internally used to build a Formula AST
     */
    constructor(fStr, options = {}) {
        this.formulaExpression = null;
        this.options = Object.assign(
            {
                memoization: false
            },
            options
        );
        this._variables = [];
        this._memory = {};
        this.setFormula(fStr);
        return this;
    }

    /**
     *
     * @param {String} formulaString The formula string to set/parse
     * @return {this} The Formula object (this)
     */
    setFormula(formulaString) {
        if (formulaString) {
            this.formulaExpression = null;
            this._variables = [];
            this._memory = {};
            this.formulaStr = formulaString;
            this.formulaExpression = this.parse(formulaString);
        }
        return this;
    }

    /**
     * Enable memoization: An expression is only evaluated once for the same input.
     * Further evaluations with the same input will return the in-memory stored result.
     */
    enableMemoization() {
        this.options.memoization = true;
    }

    /**
     * Disable in-memory memoization: each call to evaluate() is executed from scratch.
     */
    disableMemoization() {
        this.options.memoization = false;
        this._memory = {};
    }

 
    splitFunctionParams(toSplit) {
        // do not split on ',' within matching brackets.
        let pCount = 0,
            paramStr = '';
        const params = [];
        for (let chr of toSplit.split('')) {
            if (chr === ',' && pCount === 0) {
                // Found function param, save 'em
                params.push(paramStr);
                paramStr = '';
            } else if (chr === '(') {
                pCount++;
                paramStr += chr;
            } else if (chr === ')') {
                pCount--;
                paramStr += chr;
                if (pCount < 0) {
                    throw new Error('ERROR: Too many closing parentheses!');
                }
            } else {
                paramStr += chr;
            }
        }
        if (pCount !== 0) {
            throw new Error('ERROR: Too many opening parentheses!');
        }
        if (paramStr.length > 0) {
            params.push(paramStr);
        }
        return params;
    }

 
    cleanupInputString(s) {
        s = s.replace(/[\s]+/g, '');
        // surround known math constants with [], to parse them as named variables [xxx]:
        Object.keys(MATH_CONSTANTS).forEach((c) => {
            s = s.replace(new RegExp(`\\b${c}\\b`, 'g'), `[${c}]`);
        });
        return s;
    }

    /**
     * @param {String} str The formula string, e.g. '3*sin(PI/x)'
     * @returns {Expression} An expression object, representing the expression tree
     */
    parse(str) {
        // clean the input string first. spaces, math constant replacements etc.:
        str = this.cleanupInputString(str);
        // start recursive call to parse:
        return this._do_parse(str);
    }

    /**
     * @see parse(): this is the recursive parse function, without the clean string part.
     * @param {String} str
     * @returns {Expression} An expression object, representing the expression tree
     */
    _do_parse(str) {
        let lastChar = str.length - 1,
            act = 0,
            state = 0,
            expressions = [],
            char = '',
            tmp = '',
            funcName = null,
            pCount = 0;

        while (act <= lastChar) {
            switch (state) {
                case 0:
                    char = str.charAt(act);
                    if (char.match(/[0-9.]/)) {
                        state = 'within-nr';
                        tmp = '';
                        act--;
                    } else if (this.isOperator(char)) {
                        // was an operator (or the beginning):
                        if (char === '-') {
                            if (expressions.length === 0 || this.isOperatorExpr(expressions[expressions.length - 1])) {
                                state = 'within-nr';
                                tmp = '-';
                                break;
                            }
                        }

                        // Found a simple operator, store as expression:
                        if (act === lastChar || this.isOperatorExpr(expressions[expressions.length - 1])) {
                            state = -1; // invalid to end with an operator, or have 2 operators in conjunction
                            break;
                        } else {
                            expressions.push(Expression.createOperatorExpression(char));
                            state = 0;
                        }
                    } else if (char === '(') {
                        // left parenthes found, seems to be the beginning of a new sub-expression:
                        state = 'within-parentheses';
                        tmp = '';
                        pCount = 0;
                    } else if (char === '[') {
                        state = 'within-named-var';
                        tmp = '';
                    } else if (char.match(/[a-zA-Z]/)) {
                        if (act < lastChar && str.charAt(act + 1).match(/[a-zA-Z0-9_]/)) {
                            tmp = char;
                            state = 'within-func';
                        } else {
                            // - If the last char was a number (e.g. 3x), we need to create a multiplication out of it (3*x)
                            if (
                                expressions.length > 0 &&
                                expressions[expressions.length - 1] instanceof ValueExpression
                            ) {
                                expressions.push(Expression.createOperatorExpression('*'));
                            }
                            expressions.push(new VariableExpression(char));
                            this.registerVariable(char);
                            state = 0;
                            tmp = '';
                        }
                    }
                    break;
                case 'within-nr':
                    char = str.charAt(act);
                    if (char.match(/[0-9.]/)) {
                        //Still within number, store and continue
                        tmp += char;
                        if (act === lastChar) {
                            expressions.push(new ValueExpression(tmp));
                            state = 0;
                        }
                    } else {
                        // Number finished on last round, so add as expression:
                        if (tmp === '-') {
                            // just a single '-' means: a variable could follow (e.g. like in 3*-x), we convert it to -1: (3*-1x)
                            tmp = -1;
                        }
                        expressions.push(new ValueExpression(tmp));
                        tmp = '';
                        state = 0;
                        act--;
                    }
                    break;

                case 'within-func':
                    char = str.charAt(act);
                    if (char.match(/[a-zA-Z0-9_]/)) {
                        tmp += char;
                    } else if (char === '(') {
                        funcName = tmp;
                        tmp = '';
                        pCount = 0;
                        state = 'within-func-parentheses';
                    } else {
                        throw new Error('Wrong character for function at position ' + act);
                    }

                    break;

                case 'within-named-var':
                    char = str.charAt(act);
                    if (char === ']') {
                        // end of named var, create expression:
                        expressions.push(new VariableExpression(tmp));
                        this.registerVariable(tmp);
                        tmp = '';
                        state = 0;
                    } else if (char.match(/[a-zA-Z0-9_]/)) {
                        tmp += char;
                    } else {
                        throw new Error('Character not allowed within named variable: ' + char);
                    }
                    break;

                case 'within-parentheses':
                case 'within-func-parentheses':
                    char = str.charAt(act);
                    if (char === ')') {
                        if (pCount <= 0) {
                            // Yes, we found the closing parenthesis, create new sub-expression:
                            if (state === 'within-parentheses') {
                                expressions.push(new BracketExpression(this._do_parse(tmp)));
                            } else if (state === 'within-func-parentheses') {
                                let args = this.splitFunctionParams(tmp).map((a) => this._do_parse(a));
                                expressions.push(new FunctionExpression(funcName, args, this));
                                funcName = null;
                            }
                            state = 0;
                        } else {
                            pCount--;
                            tmp += char;
                        }
                    } else if (char === '(') {
                        // begin of a new sub-parenthesis, increase counter:
                        pCount++;
                        tmp += char;
                    } else {
                        // all other things are just added to the sub-expression:
                        tmp += char;
                    }
                    break;
            }
            act++;
        }

        if (state !== 0) {
            throw new Error('Could not parse formula: Syntax error.');
        }

        return this.buildExpressionTree(expressions);
    }

    /**
     * @see parse(): Builds an expression tree from the given expression array.
     * @param {*} expressions
     * @return {Expression} The root Expression of the built expression tree
     */
    buildExpressionTree(expressions) {
        if (expressions.length < 1) {
            return null;
        }
        const exprCopy = [...expressions];
        let idx = 0;
        let expr = null;
        // Replace all Power expressions with a partial tree:
        while (idx < exprCopy.length) {
            expr = exprCopy[idx];
            if (expr instanceof PowerExpression) {
                if (idx === 0 || idx === exprCopy.length - 1) {
                    throw new Error('Wrong operator position!');
                }
                expr.base = exprCopy[idx - 1];
                expr.exponent = exprCopy[idx + 1];
                exprCopy[idx - 1] = expr;
                exprCopy.splice(idx, 2);
            } else {
                idx++;
            }
        }

        // Replace all Mult/Div expressions with a partial tree:
        idx = 0;
        expr = null;
        while (idx < exprCopy.length) {
            expr = exprCopy[idx];
            if (expr instanceof MultDivExpression) {
                if (idx === 0 || idx === exprCopy.length - 1) {
                    throw new Error('Wrong operator position!');
                }
                expr.left = exprCopy[idx - 1];
                expr.right = exprCopy[idx + 1];
                exprCopy[idx - 1] = expr;
                exprCopy.splice(idx, 2);
            } else {
                idx++;
            }
        }

        // Replace all Plus/Minus expressions with a partial tree:
        idx = 0;
        expr = null;
        while (idx < exprCopy.length) {
            expr = exprCopy[idx];
            if (expr instanceof PlusMinusExpression) {
                if (idx === 0 || idx === exprCopy.length - 1) {
                    throw new Error('Wrong operator position!');
                }
                expr.left = exprCopy[idx - 1];
                expr.right = exprCopy[idx + 1];
                exprCopy[idx - 1] = expr;
                exprCopy.splice(idx, 2);
            } else {
                idx++;
            }
        }
        if (exprCopy.length !== 1) {
            throw new Error('Could not parse formula: incorrect syntax?');
        }
        return exprCopy[0];
    }

    isOperator(char) {
        return typeof char === 'string' && char.match(/[\+\-\*\/\^]/);
    }

    isOperatorExpr(expr) {
        return (
            expr instanceof PlusMinusExpression || expr instanceof MultDivExpression || expr instanceof PowerExpression
        );
    }

    registerVariable(varName) {
        if (this._variables.indexOf(varName) < 0) {
            this._variables.push(varName);
        }
    }

    getVariables() {
        return this._variables;
    }

    /**

     * @param {Object|Array} valueObj An object containing values for variables and (unknown) functions,
     *   or an array of such objects: If an array is given, all objects are evaluated and the results
     *   also returned as array.
     * @return {Number|Array} The evaluated result, or an array with results
     */
    evaluate(valueObj) {
        // resolve multiple value objects recursively:
        if (valueObj instanceof Array) {
            return valueObj.map((v) => this.evaluate(v));
        }
        let expr = this.getExpression();
        if (!(expr instanceof Expression)) {
            throw new Error('No expression set: Did you init the object with a Formula?');
        }
        if (this.options.memoization) {
            let res = this.resultFromMemory(valueObj);
            if (res !== null) {
                return res;
            } else {
                res = expr.evaluate({ ...MATH_CONSTANTS, ...valueObj });
                this.storeInMemory(valueObj, res);
                return res;
            }
        }
        return expr.evaluate({ ...MATH_CONSTANTS, ...valueObj });
    }

    hashValues(valueObj) {
        return JSON.stringify(valueObj);
    }

    resultFromMemory(valueObj) {
        let key = this.hashValues(valueObj);
        let res = this._memory[key];
        if (res !== undefined) {
            return res;
        } else {
            return null;
        }
    }

    storeInMemory(valueObj, value) {
        this._memory[this.hashValues(valueObj)] = value;
    }

    getExpression() {
        return this.formulaExpression;
    }

    getExpressionString() {
        return this.formulaExpression ? this.formulaExpression.toString() : '';
    }

    static calc(formula, valueObj, options = {}) {
        valueObj = valueObj || {};
        return new Formula(formula, options).evaluate(valueObj);
    }
}

class Expression {
    static createOperatorExpression(operator, left = null, right = null) {
        if (operator === '^') {
            return new PowerExpression(operator, left, right);
        }
        if (operator === '*' || operator === '/') {
            return new MultDivExpression(operator, left, right);
        }
        if (operator === '+' || operator === '-') {
            return new PlusMinusExpression(operator, left, right);
        }
        throw new Error(`Unknown operator: ${operator}`);
    }

    evaluate(params = {}) {
        throw new Error('Must be defined in child classes');
    }

    toString() {
        return '';
    }
}

class BracketExpression extends Expression {
    constructor(expr) {
        super();
        this.innerExpression = expr;
        if (!(this.innerExpression instanceof Expression)) {
            throw new Error('No inner expression given for bracket expression');
        }
    }
    evaluate(params = {}) {
        return this.innerExpression.evaluate(params);
    }
    toString() {
        return `(${this.innerExpression.toString()})`;
    }
}

class ValueExpression extends Expression {
    constructor(value) {
        super();
        this.value = Number(value);
        if (isNaN(this.value)) {
            throw new Error('Cannot parse number: ' + value);
        }
    }
    evaluate(params = {}) {
        return this.value;
    }
    toString() {
        return String(this.value);
    }
}

class PlusMinusExpression extends Expression {
    constructor(operator, left = null, right = null) {
        super();
        if (!['+', '-'].includes(operator)) {
            throw new Error(`Operator not allowed in Plus/Minus expression: ${operator}`);
        }
        this.operator = operator;
        this.left = left;
        this.right = right;
    }

    evaluate(params = {}) {
        if (this.operator === '+') {
            return this.left.evaluate(params) + this.right.evaluate(params);
        }
        if (this.operator === '-') {
            return this.left.evaluate(params) - this.right.evaluate(params);
        }
        throw new Error('Unknown operator for PlusMinus expression');
    }

    toString() {
        return `${this.left.toString()} ${this.operator} ${this.right.toString()}`;
    }
}

class MultDivExpression extends Expression {
    constructor(operator, left = null, right = null) {
        super();
        if (!['*', '/'].includes(operator)) {
            throw new Error(`Operator not allowed in Multiply/Division expression: ${operator}`);
        }
        this.operator = operator;
        this.left = left;
        this.right = right;
    }

    evaluate(params = {}) {
        if (this.operator === '*') {
            return this.left.evaluate(params) * this.right.evaluate(params);
        }
        if (this.operator === '/') {
            return this.left.evaluate(params) / this.right.evaluate(params);
        }
        throw new Error('Unknown operator for MultDiv expression');
    }

    toString() {
        return `${this.left.toString()} ${this.operator} ${this.right.toString()}`;
    }
}

class PowerExpression extends Expression {
    constructor(base = null, exponent = null) {
        super();
        this.base = base;
        this.exponent = exponent;
    }

    evaluate(params = {}) {
        return Math.pow(this.base.evaluate(params), this.exponent.evaluate(params));
    }

    toString() {
        return `${this.base.toString()}^${this.exponent.toString()}`;
    }
}
class FunctionExpression extends Expression {
    constructor(fn, argumentExpressions, formulaObject = null) {
        super();
        this.fn = fn;
        this.argumentExpressions = argumentExpressions || [];
        this.formulaObject = formulaObject;
    }

    evaluate(params = {}) {
        params = params || {};
        const paramValues = this.argumentExpressions.map((a) => a.evaluate(params));

        // the function name, call this one:
        if (params[this.fn] instanceof Function) {
            return params[this.fn].apply(this, paramValues);
        }
        // perhaps the Formula object has the function? so call it:
        else if (this.formulaObject && this.formulaObject[this.fn] instanceof Function) {
            return this.formulaObject[this.fn].apply(this.formulaObject, paramValues);
        }
        // Has the JS Math object a function as requested? Call it:
        else if (Math[this.fn] instanceof Function) {
            return Math[this.fn].apply(this, paramValues);
        }
        // No more options left: sorry!
        else {
            throw new Error('Function not found: ' + this.fn);
        }
    }

    toString() {
        return `${this.fn}(${this.argumentExpressions.map((a) => a.toString()).join(', ')})`;
    }
}

class VariableExpression extends Expression {
    constructor(varName) {
        super();
        this.varName = varName || '';
    }

    evaluate(params = {}) {
        // params contain variable / value pairs: If this object's variable matches
        if (params[this.varName] !== undefined) {
            return Number(params[this.varName]);
        } else {
            throw new Error('Cannot evaluate ' + this.varName + ': No value given');
        }
    }
    toString() {
        return `${this.varName}`;
    }
}

Formula.Expression = Expression;
Formula.BracketExpression = BracketExpression;
Formula.PowerExpression = PowerExpression;
Formula.MultDivExpression = MultDivExpression;
Formula.PlusMinusExpression = PlusMinusExpression;
Formula.ValueExpression = ValueExpression;
Formula.VariableExpression = VariableExpression;
Formula.FunctionExpression = FunctionExpression;
Formula.MATH_CONSTANTS = MATH_CONSTANTS;
