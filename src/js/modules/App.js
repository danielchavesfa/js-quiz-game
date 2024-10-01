import { QUIZ_CONTAINER, CONCLUSION_CONTAINER } from '../utils/variables.js';

export default class App {
  init() {
    const buttonStart = document.querySelector('[data-quiz="start"]');
    const body = document.body;
    const audioCorrect = new Audio('./src/audios/correct.wav');
    const audioWrong = new Audio('./src/audios/wrong.wav');
    let conclusion = {
      questionsQty: 0,
      errors: 0,
      hits: 0,
    };
    let quizContainerIndex = 0;

    buttonStart.addEventListener('click', (event) => {
      const main = document.querySelector('main');

      function getRandomWords(question) {
        const splittedQuestions = question.split(' ');
        const cleanWords = splittedQuestions.map((word) => word.replace(/[?!,]/, ''));
        return cleanWords.sort(() => Math.random() - 0.5);
      }

      function getAditionalWords(words = [], quantity = 5) {
        const randomWords = new Set();

        while (randomWords.size < quantity) {
          randomWords.add(words[Math.floor(Math.random() * words.length)]);
        }

        return randomWords;
      }

      async function getQuestions(quizIndex) {
        try {
          const response = await fetch('./src/data/questions.json');
          const questionsJSON = await response.json();

          conclusion.questionsQty = questionsJSON.length;

          const reduceQuestions = (acc, question) =>
            (acc = [...acc, ...getRandomWords(question.answer)]);
          const randomWords = questionsJSON.reduce(reduceQuestions, []);
          const aditionalWords = getAditionalWords(randomWords);

          const quizContainerQuestionsArray = questionsJSON.map((question) => {
            const quiz = QUIZ_CONTAINER({ ...question, aditionalWords });
            const buttons = quiz.querySelectorAll('#alternatives button');
            const lineFields = quiz.querySelector('.line-field > ul');
            const btnNext = quiz.querySelector('[data-quiz="next"]');

            lineFields.innerHTML = '';

            //adiciona evento nos botões de resposta
            buttons.forEach((btn, index) => {
              btn.addEventListener('click', (event) => {
                const li = document.createElement('li');
                const cloneBtn = btn.cloneNode(true);

                //adiciona evento no botão para conseguir colocar de volta
                cloneBtn.addEventListener('click', () => {
                  const buttonIndex = cloneBtn.dataset.answer;
                  const li = cloneBtn.parentElement;

                  buttons[buttonIndex].removeAttribute('disabled', '');
                  buttons[buttonIndex].classList.remove('choice');
                  li.remove();
                });

                cloneBtn.setAttribute('data-answer', index);
                li.appendChild(cloneBtn);
                btn.setAttribute('disabled', '');
                btn.classList.add('choice');
                lineFields.appendChild(li);
              });
            });

            btnNext.addEventListener('click', (event) => {
              const button = event.target;
              const lineFieldsButtons = [...lineFields.querySelectorAll('button')];
              const phrase = lineFieldsButtons.reduce((acc, word) => {
                acc += `${word.innerText} `;
                return acc;
              }, '');
              const isAnswerCorrect = phrase.trim() === question.answer.replace(/[?!,]/, '');

              if (isAnswerCorrect) {
                console.log('acertou');
                const control = document.querySelector('.button-controls');
                const newButton = button.cloneNode(true);

                conclusion.hits++;
                newButton.classList.add('green');
                control.replaceChild(newButton, button);
                audioCorrect.volume = 0.75;
                audioCorrect.play();

                newButton.addEventListener('click', () => {
                  if (newButton.classList.contains('green')) {
                    quizIndex++;
                    quiz.remove();
                    setTimeout(renderQuestion, 300, quizIndex);
                  }
                });

                return;
              }

              console.log('errou');
              conclusion.errors++;
              button.classList.add('red');
              audioWrong.volume = 0.75;
              audioWrong.play();
            });

            return quiz;
          });

          if (quizContainerQuestionsArray[quizIndex]) {
            body.appendChild(quizContainerQuestionsArray[quizIndex]);
            return;
          }

          //caso não tenha mais perguntas
          const conclusionContainer = CONCLUSION_CONTAINER(conclusion);
          body.insertAdjacentHTML('afterbegin', conclusionContainer);
          const btnRestart = document.querySelector('#conclusion .btn');

          btnRestart.addEventListener('click', () => {
            const conclusionContainer = document.querySelector('#conclusion');
            Object.entries(conclusion).forEach(([key, value]) => (conclusion[key] = 0));
            conclusionContainer.remove();
            main.style.display = 'block';
            main.classList.remove('off');
            main.querySelector('[data-quiz="start"]').disabled = false;
          });
        } catch (error) {
          console.error(error);
        }
      }

      function renderQuestion(quizIndex) {
        main.style.display = 'none';
        getQuestions(quizIndex);
      }

      //inicia aqui
      event.target.setAttribute('disabled', '');
      main.classList.add('off');
      setTimeout(renderQuestion, 300, quizContainerIndex);
    });
  }
}
