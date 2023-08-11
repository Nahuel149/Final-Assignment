const display = document.getElementById('display')
let currentInput = ''
let operations = []

function updateDisplay() {
  display.textContent = currentInput
}

function appendNumber(number) {
  if (currentInput === '0' || currentInput === 'Error') {
    currentInput = number
  } else {
    currentInput += number
  }
  updateDisplay()
}

function handleOperator(operator) {
  operations.push(currentInput)
  operations.push(operator)
  currentInput = ''
}

function operate() {
  operations.push(currentInput)
  let result = parseFloat(operations[0])

  for (let i = 1; i < operations.length; i += 2) {
    const operator = operations[i]
    const operand = parseFloat(operations[i + 1])
    switch (operator) {
      case '+':
        result += operand
        break
      case '-':
        result -= operand
        break
      case '*':
        result *= operand
        break
      case '%':
        result %= operand
        break
      case '/':
        if (operand === 0) {
          currentInput = 'Error: Division by zero'
          updateDisplay()
          return
        }
        result /= operand
        break
    }
  }

  currentInput = result.toString()
  operations = []
  updateDisplay()
}

function clear() {
  currentInput = ''
  operations = []
  updateDisplay()
}

// Event Listeners
document.querySelectorAll('.number').forEach((button) => {
  button.addEventListener('click', () => {
    appendNumber(button.textContent)
  })
})

document.querySelectorAll('.operator').forEach((button) => {
  button.addEventListener('click', () => {
    handleOperator(button.textContent)
  })
})

document.getElementById('equals').addEventListener('click', operate)

document.getElementById('clear').addEventListener('click', clear)

document.getElementById('decimal').addEventListener('click', () => {
  if (!currentInput.includes('.')) {
    currentInput += '.'
    updateDisplay()
  }
})

document.getElementById('backspace').addEventListener('click', () => {
  currentInput = currentInput.slice(0, -1)
  updateDisplay()
})

// Keyboard support
document.addEventListener('keydown', (event) => {
  const key = event.key
  if (!isNaN(key) || key === '.') {
    appendNumber(key)
  } else if ('+-*/%'.includes(key)) {
    handleOperator(key)
  } else if (key === '=' || key === 'Enter') {
    operate()
  } else if (key === 'Backspace') {
    currentInput = currentInput.slice(0, -1)
    updateDisplay()
  } else if (key === 'Escape') {
    clear()
  }
})
