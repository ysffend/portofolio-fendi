const questions = [
  {
    question: "Ibukota Indonesia?",
    answers: ["Jakarta", "Bandung", "Surabaya", "Medan"],
    correct: 0
  },
  {
    question: "2 + 2 = ?",
    answers: ["3", "4", "5", "6"],
    correct: 1
  },
  {
    question: "Warna langit?",
    answers: ["Merah", "Biru", "Kuning", "Hijau"],
    correct: 1
  },
  {
    question: "Bahasa HTML digunakan untuk?",
    answers: ["Styling", "Struktur Web", "Database", "Server"],
    correct: 1
  }
];

let usedQuestions = [];
let currentPlayer = 1;
let score1 = 0;
let score2 = 0;

const questionEl = document.getElementById("question");
const answerBtns = document.querySelectorAll(".answer");
const turnText = document.getElementById("turn");

// shuffle array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// random jawaban
function shuffleAnswers(q) {
  const correctAnswer = q.answers[q.correct];
  shuffleArray(q.answers);
  q.correct = q.answers.indexOf(correctAnswer);
}

// load soal random
function loadQuestion() {
  if (usedQuestions.length === questions.length) {
    alert("Game selesai!");
    return;
  }

  let randomIndex;

  do {
    randomIndex = Math.floor(Math.random() * questions.length);
  } while (usedQuestions.includes(randomIndex));

  usedQuestions.push(randomIndex);

  const q = questions[randomIndex];

  shuffleAnswers(q);

  questionEl.textContent = q.question;
  questionEl.dataset.correct = q.correct;

  answerBtns.forEach((btn, i) => {
    btn.textContent = q.answers[i];
  });
}

// klik jawaban
answerBtns.forEach((btn, i) => {
  btn.addEventListener("click", () => {
    const correct = parseInt(questionEl.dataset.correct);

    if (i === correct) {
      if (currentPlayer === 1) {
        score1++;
        document.getElementById("score1").textContent = score1;
      } else {
        score2++;
        document.getElementById("score2").textContent = score2;
      }
    }

    // pindah player
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    turnText.textContent = "Giliran: Player " + currentPlayer;

    loadQuestion();
  });
});

// start game
loadQuestion();