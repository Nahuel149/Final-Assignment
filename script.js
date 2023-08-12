const { compose, unless, tap, numberify, trim } = Utils();
const app = CalculatorApp();

// Event Listeners
const listener = (e) => app.dispatch(e.target.textContent);

[
  ...document.querySelectorAll(".number"),
  ...document.querySelectorAll(".operator"),
  document.getElementById("equals"),
  document.getElementById("clear"),
  document.getElementById("decimal"),
  document.getElementById("backspace"),
].forEach((element) => element.addEventListener("click", listener));

// Keyboard support

document.addEventListener("keydown", (event) => {
  event.preventDefault(); 

  const supportedKeys = [
    ".", "=", "+", "-", "*", "/", "Escape", "Backspace", "Enter",
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
    "Delete"
  ];

  const key = event.key;

  if (supportedKeys.includes(key)) {
    if (key === "Delete") {
      app.dispatch("AC");
    } else if (!isNaN(key) || key === ".") {
      app.dispatch(key);
    } else if (key === "=" || key === "Enter") {
      app.dispatch("=");
    } else {
      app.dispatch(key);
    }
  }
});

function addCommas(numberString) {
  const parts = numberString.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

function Calculator() {
  let result;

  const OPERATIONS = {
    "+": (n1) => (n2) => n1 + n2,
    "−": (n1) => (n2) => n1 - n2,
    x: (n1) => (n2) => n1 * n2,
    "÷": (n1) => (n2) => n1 / n2,
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
    const formattedValue = addCommas(v);
    display.textContent = formattedValue;
  }

  let state = getInitialState();

  const ACTIONS = {
    APPEND_NUMBER: "append-number",
    HANDLE_OPERATOR: "handle-operator",
    CALCULATE: "calculate",
    DELETE_LAST_INPUT: "delete-last-input",
    HANDLE_NEGATIVE: "handle-negative",
  };

  function dispatch(v) {
    const input = v.trim();
    state = ["AC", "Escape"].includes(input)
        ? getInitialState()
        : ["Backspace", "←"].includes(input)
            ? _dispatch(state, { action: ACTIONS.DELETE_LAST_INPUT })
            : ["=", "Enter"].includes(input)
                ? _dispatch({ ...state, isCalcDone: true }, { action: ACTIONS.CALCULATE })
                : ["+", "−", "x", "÷", "%", "*", "/", "-", "+"].includes(input)
                    ? _dispatch(state, { action: ACTIONS.HANDLE_OPERATOR, input })
                    : ["+/-"].includes(input)
                        ? _dispatch(state, { action: ACTIONS.HANDLE_NEGATIVE })
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
        const inputWithoutCommas = state.currentInput.replace(/,/g, "");
        const updated = `${
            state.isError || inputWithoutCommas === "0" ? "" : inputWithoutCommas
        }${input}`.slice(0, 13);

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
        if (!firstOperand || !secondOperand) return state;

        const { isError, errMsg, ans } = operate({
          n1: firstOperand,
          n2: secondOperand,
          operator: input?.operator ?? operator,
        });

        return {
          ...state,
          firstOperand: isError ? null : ans.toString(),

          operator: isError ? null : operator,

          isFirstOperand: isError || state.isCalcDone,
          secondOperand: "",
          errMsg,
          isError,

          currentInput: "",
        };

      case ACTIONS.DELETE_LAST_INPUT:
        const afterRemove = compose(deleteLastInput, getCurrentOperand)(state);
        return {
          ...state,
          [isFirstOperand ? "firstOperand" : "secondOperand"]: afterRemove,
          currentInput: afterRemove,
        };

      case ACTIONS.HANDLE_NEGATIVE:
        const toggeled = compose(toggleNegative, getCurrentOperand)(state);
        return {
          ...state,
          [isFirstOperand ? "firstOperand" : "secondOperand"]: toggeled,
          currentInput: toggeled,
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
  function toggleNegative(v) {
    if (v === "0" || !v) return "0";
    v = v?.toString();
    return v.includes("-") ? v.slice(1) : `-${v}`;
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
