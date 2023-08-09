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

    const OPERATIONS = {
        '+' : add,
        '-' : subtract,
        '*' : multiply,
        '/' : divide,
        '%' : module,
    }


    const operate = ({operator, n1, n2} = {})  => OPERATIONS[operator](n1)(n2);
    const add = (n1) => (n2) => n1 + n2;
    const subtract = (n1) => (n2) => n1 - n2;
    const multiply = (n1) => (n2) => n1 * n2;
    const divide = (n1) => (n2) => n2 === 0 ?  n1 / n2 : null
    const module = (n1) => n2 => n1 % n2;

    return {operate}


}