const out = document.getElementById("output");
const input = document.getElementById("input");
const code = document.getElementById("code");
const runButton = document.getElementById("run");
let sleepSetTimeout_ctrl;

function sleep(ms) {
    clearInterval(sleepSetTimeout_ctrl);
    return new Promise(resolve => sleepSetTimeout_ctrl = setTimeout(resolve, ms));
}

function init() {
    //clear output
    out.value = "";
    console.log(out.text);
}

window.onload = init;


let pos, instructions, memory, ops, inputQueue;

async function start() {
    inputQueue = [];
    runButton.disabled = true;
    out.value = "";
    instructions = code.value;
    memory = Array(3000).fill(0);
    pos = 0;
    ops = 0;
    await run(0);
    runButton.disabled = false;
}

async function run(start) {
    for (let x = start, symbol; x < instructions.length; ++x, ++ops) {
        if (ops > 10000000) {
            console.log("Exceeded operation limit");
            return instructions.length;
        }
        symbol = instructions.charAt(x);
        if (symbol === '<') {
            --pos;
        } else if (symbol === '>') {
            ++pos;
        } else if (symbol === '.') {
            out.value += String.fromCharCode(memory[pos]);
        } else if (symbol === '-') {
            if (memory[pos] > 0) {
                --memory[pos];
            } else {
                memory[pos] = 255;
            }
        } else if (symbol === '+') {
            if (memory[pos] < 255) {
                ++memory[pos];
            } else {
                memory[pos] = 0;
            }
        } else if (symbol === '[') { //SHOULD REWRITE THIS SECTION
            if (memory[pos] !== 0) {
                x = await run(x + 1);
            } else {
                let count = 1;
                while (count > 0) {
                    ++x;
                    if (instructions.charAt(x) === '[') {
                        ++count;
                    } else if (instructions.charAt(x) === ']') {
                        --count;
                    }
                }
            }
        } else if (symbol === ']') {
            if (memory[pos] === 0) {
                return x;
            } else {
                x = start - 1;
            }
        } else if (symbol === ',') {
            out.scrollTop = out.scrollHeight;
            while (inputQueue.length <= 0) {
                input.readOnly = false;
                await waitForEnter();
                for (let x = 0; x < input.value.length; ++x) {
                    inputQueue.push(input.value.charCodeAt(x));
                }
                inputQueue.push(10);
                out.value += "You: " + input.value + "\n";
                input.value = "";
                input.readOnly = true;
            }
            memory[pos] = inputQueue[0];
            inputQueue.shift();
        } else if (symbol === '~') {
            console.log("at pos: " + pos);
            console.log(JSON.parse(JSON.stringify(memory)));
        } else if (symbol === '*') {
            out.scrollTop = out.scrollHeight;
            await sleep(1000);
        }
    }
    return instructions.length;
}

function waitForEnter() {
    return new Promise((resolve) => {
        document.addEventListener('keydown', onKeyHandler);

        function onKeyHandler(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.removeEventListener('keydown', onKeyHandler);
                resolve();
            }
        }
    });
}