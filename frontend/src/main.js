function typeNumber(num) {
  let currentElem = rows[currentRow].querySelectorAll('.cell');
  if(currentCol < 4 && !buffer.has(num)){
    currentElem[currentCol].textContent = num;
    currentCol++;
    buffer.add(num);
  }
}

function deleteNumber() {
  let currentElem = rows[currentRow].querySelectorAll('.cell');
  if(currentCol > 0){
    currentCol--;
    buffer.delete(currentElem[currentCol].textContent);
    currentElem[currentCol].textContent = '';
  }
}

async function submitNumber() {
  if(currentCol === 4){
    const userInput = Array.from(rows[currentRow].querySelectorAll('.cell')).map(cell => cell.textContent).join('');
    const strikeCount = await showResult(userInput);
    let currentElem = rows[currentRow].querySelectorAll('.cell');

    if(strikeCount === 4){
      currentElem.forEach(cell => cell.style.backgroundColor = 'pink');
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`정답입니다! ${currentRow+1}번 만에 맞혔어요!`);
      await resetGame();
      return;
    } 
    else {
      currentElem.forEach(cell => cell.style.backgroundColor = 'gray');
      currentRow++;
      if(currentRow === 10){
        const t = await (await fetch('/api/target')).json();
        alert(`게임 오버! 정답은 ${t.target_number}입니다.`);
        await resetGame();
      }
      else {
        currentCol=0;
        buffer.clear();
      }
    }
  }
}

async function resetGame() {
  rows.forEach(row => row.querySelectorAll('.cell').forEach(c => {
    c.textContent = '';
    c.style.backgroundColor = '';
  }));
  resultTexts.forEach(r => r.textContent = 'S:-, B:-, O:-');
  currentRow = 0;
  currentCol = 0;
  buffer.clear();
  await fetch('/api/target', { method: 'POST' });
}

async function showResult(userInput){
  let strike = 0;
  let ball = 0;
  const data = await fetch('/api/check_guess', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ guess: userInput })
  });
  const result = await data.json();
  strike = result.strikes;
  ball = result.balls;

  resultTexts[currentRow].textContent = `S:${strike}, B:${ball}, O:${4-strike-ball}`;
  return strike;
}

const rows = document.querySelectorAll('.row');
const resultTexts = document.querySelectorAll('.result-text');

let currentRow = 0;
let currentCol = 0;
let buffer = new Set();

document.querySelectorAll('.number-btn').forEach(button => {
  button.addEventListener('click', () => {
    const num = button.getAttribute('data-key');
    if(num === 'submit'){
      submitNumber();
    } else if(num === 'delete'){
      deleteNumber();
    } else {
      typeNumber(num);
    }
  });
});

document.addEventListener('keydown', (event)=>{
  const key = event.key;
  if(key >= '0' && key <= '9'){
    typeNumber(key);
  }
  else if(key === 'Backspace'){
    deleteNumber();
  }
  else if(key === 'Enter'){
    submitNumber();
  }
});

await resetGame();
