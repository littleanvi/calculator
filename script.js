const expressionDisplay = document.getElementById("expression");
const resultDisplay = document.getElementById("result");
const buttons = document.querySelector(".buttons");

let current = "0";
let storedValue = null;
let operator = null;
let waitingForOperand = false;
let expressionText = "";
let error = false;

function updateDisplay() {
    resultDisplay.textContent = current;
    expressionDisplay.textContent = expressionText;
}

function formatNumber(number) {
    if (!Number.isFinite(number)) {
        throw new Error("Invalid calculation");
    }

    const rounded = Number(number.toPrecision(12));
    return Object.is(rounded, -0) ? "0" : String(rounded);
}

function resetCalculator() {
    current = "0";
    storedValue = null;
    operator = null;
    waitingForOperand = false;
    expressionText = "";
    error = false;
    updateDisplay();
}

function inputNumber(number) {
    if (error) resetCalculator();

    if (waitingForOperand) {
        current = number;
        waitingForOperand = false;
    } else if (current === "0") {
        current = number;
    } else if (current === "-0") {
        current = "-" + number;
    } else if (current.replace("-", "").replace(".", "").length < 15) {
        current += number;
    }

    updateDisplay();
}

function inputDecimal() {
    if (error) resetCalculator();

    if (waitingForOperand) {
        current = "0.";
        waitingForOperand = false;
    } else if (!current.includes(".")) {
        current += ".";
    }

    updateDisplay();
}

function calculate(a, b, op) {
    switch (op) {
        case "+": return a + b;
        case "−": return a - b;
        case "×": return a * b;
        case "÷":
            if (b === 0) {
                throw new Error("Cannot divide by zero");
            }
            return a / b;
        default: return b;
    }
}

function chooseOperator(nextOperator) {
    if (error) return;

    const inputValue = Number(current);

    if (operator && !waitingForOperand) {
        try {
            const result = calculate(storedValue, inputValue, operator);
            current = formatNumber(result);
            storedValue = Number(current);
        } catch (err) {
            showError(err.message);
            return;
        }
    } else {
        storedValue = inputValue;
    }

    operator = nextOperator;
    waitingForOperand = true;
    expressionText = `${current} ${operator}`;
    updateDisplay();
}

function showError(message) {
    current = message;
    expressionText = "";
    storedValue = null;
    operator = null;
    waitingForOperand = true;
    error = true;
    updateDisplay();
}

function equals() {
    if (error || operator === null || waitingForOperand) return;

    const first = storedValue;
    const second = Number(current);
    const selectedOperator = operator;

    try {
        const result = calculate(first, second, selectedOperator);
        expressionText = `${formatNumber(first)} ${selectedOperator} ${formatNumber(second)} =`;
        current = formatNumber(result);
        storedValue = null;
        operator = null;
        waitingForOperand = true;
        updateDisplay();
    } catch (err) {
        showError(err.message);
    }
}

function changeSign() {
    if (error) return;

    current = formatNumber(-Number(current));
    updateDisplay();
}

function percentage() {
    if (error) return;

    current = formatNumber(Number(current) / 100);
    updateDisplay();
}

function deleteLast() {
    if (error) {
        resetCalculator();
        return;
    }

    if (waitingForOperand) return;

    if (current.length > 1) {
        current = current.slice(0, -1);
        if (current === "-") current = "0";
    } else {
        current = "0";
    }

    updateDisplay();
}

buttons.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    if (button.dataset.number !== undefined) {
        inputNumber(button.dataset.number);
        return;
    }

    if (button.dataset.operator) {
        chooseOperator(button.dataset.operator);
        return;
    }

    switch (button.dataset.action) {
        case "clear": resetCalculator(); break;
        case "delete": deleteLast(); break;
        case "decimal": inputDecimal(); break;
        case "sign": changeSign(); break;
        case "percent": percentage(); break;
        case "equals": equals(); break;
    }
});

// Keyboard support
document.addEventListener("keydown", (event) => {
    if (/^[0-9]$/.test(event.key)) {
        inputNumber(event.key);
    } else if (event.key === ".") {
        inputDecimal();
    } else if (event.key === "+") {
        chooseOperator("+");
    } else if (event.key === "-") {
        chooseOperator("−");
    } else if (event.key === "*") {
        chooseOperator("×");
    } else if (event.key === "/") {
        event.preventDefault();
        chooseOperator("÷");
    } else if (event.key === "Enter" || event.key === "=") {
        event.preventDefault();
        equals();
    } else if (event.key === "Backspace") {
        deleteLast();
    } else if (event.key === "Escape") {
        resetCalculator();
    }
});

updateDisplay();