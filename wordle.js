const loaderEl = document.querySelector('.loader')
const lettersEl = document.querySelectorAll('.letter')

const totalLettersCount = lettersEl.length
let currentLetterLimit = 0

const wordLength = 5
const totalTries = 6

let guess = ''
let guessLength = guess.length
let currentTries = 1

let isTakingInput = (guessLength < wordLength) && (currentLetterLimit < totalLettersCount)
let GameInPlay = true

const validateWord = async (val) => {
    loaderEl.classList.remove('hidden')
    const response = await fetch('https://words.dev-apis.com/validate-word', {
        method: 'POST',
        body: JSON.stringify({ word: val }),
    })
    const feedback = await response.json()
    return feedback.validWord
}

const isLetter = letter => {
    return /^[a-zA-Z]$/.test(letter)
}

const getWordObj = word => {
    return word.split('').reduce((acc, c) => {
        if (acc[c]) {
            acc[c] += 1
        } else {
            acc[c] = 1
        }

        return acc
    }, {})
}

const compareWords = (guessWord, value) => {
    let arr = []
    const wordObj = getWordObj(value)

    for (let i = 0; i < value.length; i++) {
        if (value[i] === guessWord[i]) {
            arr[i] = 'correct'
            wordObj[guessWord[i]] -= 1
        }
    }

    for (let i = 0; i < value.length; i++) {
        if (value[i] === guessWord[i]) {

        } else if (value.includes(guessWord[i]) && (wordObj[guessWord[i]] > 0)) {
            arr[i] = 'close'
            wordObj[guessWord[i]] -= 1
        } else {
            arr[i] = 'wrong'
        }

    }

    return arr
}

const getWordOfTheDay = async () => {
    loaderEl.classList.remove('hidden')
    const response = await fetch('https://words.dev-apis.com/word-of-the-day')
    const message = await response.json()
    return message.word
}

const handleBackspace = () => {
    const highLimit = currentTries * wordLength
    const lowLimit = highLimit - wordLength
    
    if (currentLetterLimit > lowLimit && currentLetterLimit <= highLimit) {
        currentLetterLimit--
        guess = guess.substring(0, guess.length - 1)
        guessLength = guess.length
        lettersEl[currentLetterLimit].textContent = ''
        isTakingInput = (guessLength < wordLength) && (currentLetterLimit < totalLettersCount)
    }
}

const handleEnter = async value => {

    if (guessLength === wordLength) {
        const isGuessValid = await validateWord(guess)
        loaderEl.classList.add('hidden')
        
        if (isGuessValid) {
            const backgrounds = compareWords(guess, value)
            let isGuessCorrect = backgrounds.every(val => val === 'correct')
            if (isGuessCorrect) {
                for (let i = currentLetterLimit - 5; i < currentLetterLimit; i++) {
                    lettersEl[i].classList.add('correct')
                }
                alert('you won')
                GameInPlay = false
                return
            } else {
                for (let i = currentLetterLimit - 5; i < currentLetterLimit; i++) {
                    lettersEl[i].classList.add(backgrounds[i % 5])
                }
                if (currentTries === totalTries) {
                    alert(`you lose, the correct word is ${value}`)
                    GameInPlay = false
                    return
                }
            }
            currentTries += 1
            guess = ''
            guessLength = guess.length
            isTakingInput = (guessLength < wordLength) && (currentLetterLimit < totalLettersCount)
        } else {
            for (let i = currentLetterLimit - 5; i < currentLetterLimit; i++) {
                lettersEl[i].classList.add('wrong-word')
            }
            setTimeout(() => {
                for (let i = currentLetterLimit - 5; i < currentLetterLimit; i++) {
                    lettersEl[i].classList.remove('wrong-word')
                }
            }, 500)
        }
    }
}

const gamePlay = async () => {
    const wordOfTheDay = await getWordOfTheDay()
    loaderEl.classList.add('hidden')
    
    document.addEventListener('keydown', e => {
        console.log('pressing', isTakingInput)
        if (GameInPlay) {
            if (isLetter(e.key) && isTakingInput) {
                guess += e.key.toLowerCase()
                lettersEl[currentLetterLimit].textContent = e.key
                guessLength = guess.length
                currentLetterLimit++
                isTakingInput = (guessLength < wordLength) && (currentLetterLimit < totalLettersCount)
            } else if (e.key === 'Backspace') {
                handleBackspace()
            } else if (e.key === 'Enter') {
                handleEnter(wordOfTheDay)
            }
        }
    })

    
}

gamePlay()