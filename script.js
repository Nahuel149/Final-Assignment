const app = CalculatorApp();
const { compose, unless, tap, numberify, trim } = Utils();

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
document.querySelectorAll(".number").forEach((button) => {
  button.addEventListener("click", () => {
    appendNumber(button.textContent);
  });
});

document.querySelectorAll(".operator").forEach((button) => {
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

document.addEventListener("keydown", (event) => {
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
    "+": (n1) => (n2) => n1 + n2,
    "-": (n1) => (n2) => n1 - n2,
    "*": (n1) => (n2) => n1 * n2,
    "/": (n1) => (n2) => n1 / n2,
    "%": (n1) => (n2) => n1 % n2,
  };
  const ERRORS = {
    WRONG_INPUT: "Wrong Input",
    DIVISION_BY_ZERO: "Division By Zero",
  };

  const reset = compose(setResult, getInitialResult);

  const formatInput = compose(numberify, trim);

  const calc = ({ n1, n2, operator }) => OPERATIONS[operator](n1)(n2);

  const operate = compose(
    handleOutput,
    unless(isError)(calc),
    tap(validateInput),
    formatInputs,
    tap(reset),
  );

  return { operate };

  //************************* Helpers

  function getInitialResult() {
    return {
      isError: false,
      ans: null,
      errMsg: "",
    };
  }

  function setResult(res) {
    return (result = res);
  }

  function formatInputs({ n1, n2, ...rest }) {
    return {
      n1: formatInput(n1),
      n2: formatInput(n2),
      ...rest,
    };
  }

  function isError() {
    return result.isError;
  }

  function isDivisionByZero(n) {
    return n === Infinity;
  }

  function validateInput({ n1, n2, ...rest } = {}) {
    return [n1, n2].some(isNaN)
      ? setResult({ ...result, isError: true, errMsg: ERRORS["WRONG_INPUT"] })
      : { n1, n2, ...rest };
  }

  function handleOutput(ans) {
    return setResult(
      isDivisionByZero(ans)
        ? {
            isError: true,
            errMsg: ERRORS["DIVISION_BY_ZERO"],
            ans: null,
          }
        : {
            ...reset(),
            ans,
          },
    );
  }
}

function CalculatorApp() {
  const { operate } = Calculator();
  const display = document.getElementById("display");
  function updateDisplay(v) {
    display.textContent = v;
  }

  let state = getInitialState();

  const ACTIONS = {
    APPEND_NUMBER: "append-number",
    HANDLE_OPERATOR: "handle-operator",
    CALCULATE: "calculate",
    DELETE_LAST_INPUT: "delete-last-input",
  };

  function dispatch(v) {
    const input = v.trim();
    state =
      input === "C"
        ? getInitialState()
        : input === "←"
        ? _dispatch(state, { action: ACTIONS.DELETE_LAST_INPUT })
        : input === "="
        ? _dispatch(
            { ...state, isCalcDone: true },
            { action: ACTIONS.CALCULATE },
          )
        : ["+", "-", "*", "/", "%"].includes(input)
        ? _dispatch(state, { action: ACTIONS.HANDLE_OPERATOR, input })
        : _dispatch(state, { action: ACTIONS.APPEND_NUMBER, input });

    console.log(state);

    updateDisplay(
      state.isError ? state.errMsg : state.currentInput || state.firstOperand,
    );
  }

  return { dispatch };

  /////***********************************

  function _dispatch(state, { action, input }) {
    const { firstOperand, secondOperand, operator, isFirstOperand } = state;
    const currentOperand = isFirstOperand ? firstOperand : secondOperand;

    switch (action) {
      case ACTIONS.APPEND_NUMBER:
        const updated = `${
          state.isError || state.currentInput === "0" ? "" : state.currentInput
        }${input}`;

        return input === "." && hasDot(state.currentInput)
          ? state
          : {
              ...state,
              [!isFirstOperand ? "secondOperand" : "firstOperand"]: updated,
              isError: false,
              currentInput: updated,
            };

      case ACTIONS.HANDLE_OPERATOR:
        return firstOperand
          ? secondOperand
            ? _dispatch(
                { ...state, operator: input, isCalcDone: false },
                {
                  action: ACTIONS.CALCULATE,
                  input: { operator },
                },
              )
            : {
                ...state,
                operator: input,
                isFirstOperand: false,
                currentInput: "",
              }
          : state; //ignore

      case ACTIONS.CALCULATE:
        const { isError, errMsg, ans } = operate({
          n1: firstOperand,
          n2: secondOperand,
          operator: input?.operator ?? operator,
        });

        return firstOperand && secondOperand
          ? {
              ...state,
              firstOperand: isError ? null : ans.toString(),

              operator: isError ? null : operator,

              isFirstOperand: isError || state.isCalcDone,
              secondOperand: "",
              errMsg,
              isError,

              currentInput: "",
            }
          : state;

      case ACTIONS.DELETE_LAST_INPUT:
        console.log(deleteLastInput(getCurrentOperand(state)));
        const afterRemove = compose(deleteLastInput, getCurrentOperand)(state);
        return {
          ...state,
          [isFirstOperand ? "firstOperand" : "secondOperand"]: afterRemove,
          currentInput: afterRemove,
        };
    }
  }
  function hasDot(v) {
    return v?.toString().includes(".");
  }
  function getInitialState() {
    return {
      operator: null,
      firstOperand: "",
      secondOperand: "",
      currentInput: "0",
      isError: false,
      errMsg: "",
      isFirstOperand: true,
      isCalcDone: false,
    };
  }
  function deleteLastInput(v) {
    return v?.toString().slice(0, -1);
  }
  function getCurrentOperand(state) {
    const { isFirstOperand, firstOperand, secondOperand } = state;
    return isFirstOperand ? firstOperand : secondOperand;
  }
}

function Utils() {
  return { compose, tap, unless, trim, numberify };
  function compose(...fns) {
    return (arg) => fns.reduceRight((result, fn) => fn(result), arg);
  }

  function tap(fn) {
    return (arg) => {
      fn(arg);
      return arg;
    };
  }

  function unless(predicate) {
    return (onFalseFn) => (arg) => (predicate(arg) ? arg : onFalseFn(arg));
  }

  function trim(str) {
    return str?.trim();
  }
  function numberify(v) {
    return Number(v);
  }
}
