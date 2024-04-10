
import { INITIAL_WORDS } from "./modules/INITIAL_WORDS.js";

const $time = document.querySelector('time');
const $paragraph = document.querySelector('p');
const $input = document.querySelector('input');
const $game = document.querySelector('#game')
const $results = document.querySelector('#results')
const $wpm = $results.querySelector('#results-wpm')
const $accuracy = $results.querySelector('#results-accuracy')
const $button = document.querySelector('#reload-button')

const INITIAL_TIME = 30;
let words = [];
let currentTime = INITIAL_TIME;

initGame()
initEvents()

function initGame() {
    $game.style.display = 'flex';
    $results.style.display = 'none';
    $input.value = '';

    words = INITIAL_WORDS.toSorted(
        () => Math.random() -0.5
    ).slice(0, 40)
    currentTime = INITIAL_TIME

    $time.textContent = currentTime;
    $paragraph.innerHTML = words.map((word, index) => {
        const letters = word.split('')

        return `<word>
            ${letters
                .map(letter => `<letter>${letter}</letter>`)
                .join('')
            }
        </word>
        `
    }).join('')

    const $firstWord = $paragraph.querySelector('word')
    $firstWord.classList.add('active')
    $firstWord.querySelector('letter').classList.add('active')

    const intervalId = setInterval(() => {
        currentTime--
        $time.textContent = currentTime

        if (currentTime === 0) {
            clearInterval(intervalId)
            gameOver()
        }
    }, 1000)
}

function initEvents() {
    document.addEventListener('keydown', () => {
        $input.focus()
    })
    $input.addEventListener('keydown', onKeyDown)
    $input.addEventListener('keyup', onKeyUp)
    $button.addEventListener('click', initGame )
}

function onKeyDown(event) {

    const $currrentWord = $paragraph.querySelector('word.active')
    const $currentLetter = $currrentWord.querySelector('letter.active')

    const { key } = event;
    if (key === ' ') {
        event.preventDefault()

        const $nextWord = $currrentWord.nextElementSibling
        const $nextLetter = $nextWord.querySelector('letter')

        $currrentWord.classList.remove('active', 'marked')
        $currentLetter.classList.remove('active')

        $nextWord.classList.add('active')
        $nextLetter.classList.add('active')

        $input.value = '';

        const hasMissedLetters = $currrentWord
            .querySelectorAll('letter:not(.correct)').length > 0

        const classToAdd = hasMissedLetters ? 'marked' : 'correct'
        $currrentWord.classList.add(classToAdd)
        return
    }
    if (key === 'Backspace') {
        const $prevWord = $currrentWord.previousElementSibling
        const $prevLetter = $currentLetter.previousElementSibling

        if (!$prevWord && !$prevLetter) {
            event.preventDefault()
            return
        }

        const $wordMarked = $paragraph.querySelector('word.marked')
        if ($wordMarked && !$prevLetter) {
            event.preventDefault();
            $prevWord.classList.remove('marked')
            $prevWord.classList.add('active')

            const $letterToGo = $prevWord.querySelector('letter:last-child')
            $currentLetter.classList.remove('active')
            $letterToGo.classList.add('active')

            $input.value = [
                ...$prevWord.querySelectorAll('letter.correct, letter.incorrect')
            ].map($el => {
                return $el.classList.contains('correct') ? $el.innerText : '*'
            })
            .join('')
        }
    }
}

function onKeyUp() {
    // Recuperem els elements actuals
    const $currrentWord = $paragraph.querySelector('word.active')
    const $currentLetter = $currrentWord.querySelector('letter.active')

    const currentWord = $currrentWord.innerText.trim()
    $input.maxLength = currentWord.length
    // console.log({ value: $input.value, currentWord })

    const $allLetters = $currrentWord.querySelectorAll('letter');
    $allLetters.forEach($letter => $letter.classList.remove('correct', 'incorrect'))

    $input.value.split('').forEach((char, index) => {
        const $letter = $allLetters[index]
        const letterToCheck = currentWord[index]

        const isCorrect = char === letterToCheck
        const letterClass = isCorrect ? 'correct' : 'incorrect'
        $letter.classList.add(letterClass)
    })

    $currentLetter.classList.remove('active', 'is-last')
    const inputLenght = $input.value.length;
    const $nextActiveLetter = $allLetters[inputLenght]

    if ($nextActiveLetter) {
        $nextActiveLetter.classList.add('active')
    } else {
        $currentLetter.classList.add('active', 'is-last')
        //TODO: cridar la funció gameOver si es la última paraula
    }
}

function gameOver() {
   $game.style.display = 'none';
   $results.style.display = 'flex';

   const correctWords = $paragraph.querySelectorAll('word.correct').length
   const corectLetter = $paragraph.querySelectorAll('letter.correct').length
   const incorrectLetter = $paragraph.querySelectorAll('letter.incorrect').length

   const totalLetters = corectLetter + incorrectLetter
   const accuracy = totalLetters > 0
        ? (corectLetter / totalLetters) * 100
        : 0

    const wpm = correctWords * 60 / INITIAL_TIME
    $wpm.textContent = wpm
    $accuracy.textContent = `${accuracy.toFixed(2)}`
}
