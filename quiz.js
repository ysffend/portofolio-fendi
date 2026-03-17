// =======================
// CONFIG
// =======================
const WIN_SCORE = 5;

// =======================
// STATE
// =======================
let currentPlayer = 1;
let score1 = 0;
let score2 = 0;

// =======================
// ELEMENT
// =======================
const questionEl = document.getElementById("question");
const answerBtns = document.querySelectorAll(".answer");
const turnText = document.getElementById("turn");

// =======================
// SHUFFLE
// =======================
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// =======================
// GENERATE QUESTION (UNLIMITED)
// =======================
function generateQuestion() {
  const a = Math.floor(Math.random() * 20);
  const b = Math.floor(Math.random() * 20);

  const correctAnswer = a + b;

  let answers = [
    correctAnswer,
    correctAnswer + Math.floor(Math.random() * 3) + 1,
    correctAnswer - (Math.floor(Math.random() * 3) + 1),
    correctAnswer + Math.floor(Math.random() * 5) + 2
  ];

  shuffleArray(answers);

  return {
    question: `${a} + ${b} = ?`,
    answers: answers.map(String),
    correct: answers.indexOf(correctAnswer)
  };
}

// =======================
// LOAD QUESTION
// =======================
function loadQuestion() {
  const q = generateQuestion();

  questionEl.textContent = q.question;
  questionEl.dataset.correct = q.correct;

  answerBtns.forEach((btn, i) => {
    btn.textContent = q.answers[i];
  });
}

// =======================
// CLICK HANDLER
// =======================
answerBtns.forEach((btn, i) => {
  btn.addEventListener("click", () => {
    const correct = parseInt(questionEl.dataset.correct);

    // cek jawaban
    if (i === correct) {
      if (currentPlayer === 1) {
        score1++;
        document.getElementById("score1").textContent = score1;
      } else {
        score2++;
        document.getElementById("score2").textContent = score2;
      }
    }

    // cek pemenang
    if (score1 >= WIN_SCORE) {
      alert("🎉 Player 1 MENANG!");
      resetGame();
      return;
    }

    if (score2 >= WIN_SCORE) {
      alert("🎉 Player 2 MENANG!");
      resetGame();
      return;
    }

    // ganti player
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    turnText.textContent = "Giliran: Player " + currentPlayer;

    loadQuestion();
  });
});

// =======================
// RESET GAME
// =======================
function resetGame() {
  score1 = 0;
  score2 = 0;
  currentPlayer = 1;

  document.getElementById("score1").textContent = 0;
  document.getElementById("score2").textContent = 0;

  turnText.textContent = "Giliran: Player 1";

  loadQuestion();
}

// =======================
// START GAME
// =======================
loadQuestion();