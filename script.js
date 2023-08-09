const display = document.getElementById("display");
let currentInput = "";
let currentOperator = "";
let firstNumber = null;

function updateDisplay() {
    display.textContent = currentInput;
}

function appendNumber(number) {
    if (currentInput === "0" || currentInput === "Error") {
        currentInput = number;
    } else {
        currentInput += number;
    }
    updateDisplay();
}

function handleOperator(operator) {
    if (firstNumber === null) {
        firstNumber = parseFloat(currentInput);
        currentInput = "";
        currentOperator = operator;
    }
}

function operate() {
    const secondNumber = parseFloat(currentInput);
    if (isNaN(secondNumber)) {
        currentInput = "Error";
    } else {
        switch (currentOperator) {
            case "+":
                currentInput = (firstNumber + secondNumber).toString();
                break;
            case "-":
                currentInput = (firstNumber - secondNumber).toString();
                break;
            case "*":
                currentInput = (firstNumber * secondNumber).toString();
                break;
            case "/":
                if (secondNumber === 0) {
                    currentInput = "Error: Division by zero";
                } else {
                    currentInput = (firstNumber / secondNumber).toString();
                }
                break;
        }
    }
    firstNumber = null;
    currentOperator = "";
    updateDisplay();
}

function clear() {
    currentInput = "";
    firstNumber = null;
    currentOperator = "";
    updateDisplay();
}

// Event Listeners
document.querySelectorAll(".number").forEach(button => {
    button.addEventListener("click", () => {
        appendNumber(button.textContent);
    });
});

document.querySelectorAll(".operator").forEach(button => {
    button.addEventListener("click", () => {
        handleOperator(button.textContent);
    });
});

document.getElementById("equals").addEventListener("click", operate);

document.getElementById("clear").addEventListener("click", clear);

document.getElementById("decimal").addEventListener("click", () => {
    if (!currentInput.includes(".")) {
        currentInput += ".";
        updateDisplay();
    }
});

document.getElementById("backspace").addEventListener("click", () => {
    currentInput = currentInput.slice(0, -1);
    updateDisplay();
});

// Keyboard support

document.addEventListener("keydown", event => {
    const key = event.key;
    if (!isNaN(key) || key === ".") {
        appendNumber(key);
    } else if (key === "+" || key === "-" || key === "*" || key === "/") {
        handleOperator(key);
    } else if (key === "=" || key === "Enter") {
        operate();
    } else if (key === "Backspace") {
        currentInput = currentInput.slice(0, -1);
        updateDisplay();
    } else if (key === "Escape") {
        clear();
    }
});

function Calculator() {
    let result;

    const OPERATIONS = {
        "+": add,
        "-": subtract,
        "*": multiply,
        "/": divide,
        "%": module,
    };
    const ERRORS = {
        WRONG_INPUT: "Wrong Input",
        DIVISION_BY_ZERO: "Division By Zero",
    };
    const getInitialResult = (res) => ({
        ...res,
        isError: false,
        ans: null,
        errMsg: "",
    });
    const setResult = (res) => (result = res);
    const reset = compose(setResult, getInitialResult);

    const formatInput = compose(numberify, trim);
    const formatInputs = ({ n1, n2, ...rest }) => ({
        n1: formatInput(n1),
        n2: formatInput(n2),
        ...rest,
    });

    const isError = () => result.isError;
    const isDivisionByZero = (n) => n === Infinity;
    const validateInput = ({ n1, n2, ...rest } = {}) =>
        n1 && n2
            ? { n1, n2, ...rest }
            : setResult({ ...result, isError: true, errMsg: ERRORS["WRONG_INPUT"] });
    const handleOutput = (ans) =>
        isDivisionByZero(ans)
            ? setResult({
                isError: true,
                errMsg: ERRORS["DIVISION_BY_ZERO"],
                ans: null,
            })
            : {
                ...reset(),
                ans,
            };

    const calc = ({ n1, n2, operator }) => OPERATIONS[operator](n1)(n2);

    const operate = compose(
        handleOutput,
        unless(isError, calc),
        tab(validateInput),
        formatInputs,
        tab(reset),
    );
    const add = (n1) => (n2) => n1 + n2;
    const subtract = (n1) => (n2) => n1 - n2;
    const multiply = (n1) => (n2) => n1 * n2;
    const divide = (n1) => (n2) => n1 / n2;
    const module = (n1) => (n2) => n1 % n2;

    return { operate };

    //*************************helpers
    function compose(...fns) {
        return (arg) => fns.reduceRight((result, fn) => fn(result), arg);
    }

    function tab(fn) {
        return (arg) => {
            fn();
            return arg;
        };
    }

    function unless(predicate) {
        return (onFalseFn) => (arg) => (predicate(arg) ? arg : onFalseFn(arg));
    }
    function trim(str) {
        return str.trim();
    }
    function numberify(v) {
        return Number(v);
    }
}
