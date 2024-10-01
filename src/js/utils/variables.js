const difficultName = { 1: 'Fácil', 2: 'Normal', 3: 'Difícil' };

export const MAIN_CONTAINER = () => {
  const main = document.createElement('main');

  main.innerHTML = `
    <main>
      <h1 class="main-title">English Quiz Game</h1>
      <p>
        As perguntas são aleatórias, então prepare-se em: 1, 2, 3 e...
        <button class="btn" data-quiz="start">COMEÇAR!</button>
      </p>
    </main>
  `;
};

export const QUIZ_CONTAINER = ({ difficult, question, answer, aditionalWords = [] }) => {
  const section = document.createElement('section');
  const splitedAnswer = answer.split(' ');
  const shuffleWords = [...splitedAnswer, ...aditionalWords].sort(() => Math.random() - 0.5);
  const liButtonsWithWords = shuffleWords.reduce((acc, word) => {
    const cleanWord = word.replace(/[?!,]/, '');
    const newButton = (word) => `<li><button class="btn">${word}</button></li>`;
    acc += newButton(cleanWord);
    return acc;
  }, '');

  section.setAttribute('id', 'quiz-container');

  section.innerHTML = `
    <img class="img-teacher" src="./src/imgs/teacher-300x300.jpg" alt="Professora Fabiana">
    <span class="difficult">#${difficultName[difficult]}</span>
    <h2 class="quiz-title">Traduza a frase abaixo:</h2>
    <p id="question">${question}</p>

    <div class="alternatives-container">
      <div class="lines-container">
        <div class="line-field">
          <ul>
            ${liButtonsWithWords}
          </ul>
        </div>
      </div>

      <ol id="alternatives">
        ${liButtonsWithWords}
      </ol>

      <div class="button-controls">
        <button class="btn" data-quiz="next">Próximo</button>
      </div>
    </div>`;

  return section;
};

export const CONCLUSION_CONTAINER = ({ questionsQty, errors, hits }) => {
  return `
    <section id="conclusion">
      <h1>Pontuação</h1>
      <ul>
        <li>
          <p class="qty">Total de perguntas: <span>${questionsQty}</span></p>
        </li>
        <li>
          <p class="hits">Acertos: <span>${hits}</span></p>
        </li>
        <li>
          <p class="err">Errors: <span>${errors}</span></p>
        </li>
        <li>
          <p class="porc">% de acertos: <span>${Math.floor(
            (hits / (hits + errors)) * 100
          )}</span></p>
        </li>
      </ul>
      <button class="btn">Jogar novamente ✨</button>
    </section>
  `;
};
