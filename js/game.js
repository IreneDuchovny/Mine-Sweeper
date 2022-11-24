'use strict'
//consts
const MINE = '💣'
const FLAG = '🚩'
const WIN = '😎'
const LOSE = '🤯'
const NORMAL = '😊'
const EMPTY = ' '
const HINT = '🙈'

//global variables
var gBoard
var gInterval

var gLevel = {
    size: 4,
    mines: 2,
    lives: 1
}

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    isHint: false,
    isTimeRunning: false
}

var gMines = []

//functions
function initGame() {
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        livesLeft: gLevel.lives,
        isTimeRunning: false,
        lives: gLevel.lives,
        hiddenMines: gLevel.mines
    }
    gBoard = undefined;
    gBoard = buildBoard()
    // console.table(gBoard)
    // console.log(gBoard)
    renderBoard(gBoard)
    initUi()
    gameTimer()
    if (gInterval) clearInterval(gInterval)
}

function initUi() {
    //icon of start game
    var elRestartBtn = document.querySelector('.restart-button')
    elRestartBtn.innerText = NORMAL
    //counts mines left to flag
    var elFlagsNum = document.querySelector('.flags-count')
    elFlagsNum.innerText = gGame.hiddenMines + ' ' + FLAG

    // console.log('gLevel.mines', gLevel.mines)
    //     var elHint= document.querySelector('hints-count')
    // elHint.innerText= 

}
//creates a cell structure
function createCell(icon, isMine) {
    return {
        minesAroundCount: 0,
        isShown: false,
        isMine: isMine,
        isMarked: false,
        icon: icon,
        className: 'notClickedCell'
    }
}

//creates an empty board with initial cell structure (based on chosen level)
function buildBoard() {
    const board = []
    for (var i = 0; i < gLevel.size; i++) {
        board.push([])
        for (var j = 0; j < gLevel.size; j++) {
            board[i][j] = createCell(EMPTY, false)
        }
    }

    return board
}

// randomly places mines on board
function placeMineRandom(board, forbiddenI, forbiddenJ) {
    //forbbides  mine placment on first click 
    for (var i = 0; i < gLevel.mines; i++) {
        var iRand = getRandomInt(0, gLevel.size - 1)
        var jRand = getRandomInt(0, gLevel.size - 1)
        if (!board[iRand][jRand].isMine && (forbiddenI !== iRand && forbiddenJ !== jRand)) {
            board[iRand][jRand] = createCell(MINE, true)
            gMines[i] = { i: iRand, j: jRand }
        }
        else {
            i--
        }

    }
}

//renders the board based on the model
function renderBoard(board) {
    var strHTML = ''

    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'

        for (var j = 0; j < board[0].length; j++) {
            var cellContent = EMPTY
            var cell = board[i][j]
            var className = cell.className
            var cellClass = 'cell-' + i + '-' + j
            if (cell.minesAroundCount === 0 && cell.isShown) {
                cellContent = cell.icon
            } else if (cell.minesAroundCount > 0 && cell.isShown) {
                cell.icon = cell.minesAroundCount
                cellContent = cell.icon
            } else if (cell.isMarked && !cell.isShown) {
                cellContent = FLAG
            }


            strHTML += `<td class="${className} ${cellClass}"
            onclick="CellClicked(this,${i},${j})" oncontextmenu="event.preventDefault();cellMarked(this,${i},${j})">
            ${cellContent}</td>`
        }
        strHTML += '</tr>\n'
    }

    var elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
    var elLives = document.querySelector('.lives')
    elLives.innerText = `lives: ${gGame.livesLeft}`



}
// defindes level parameters
function setLevel(size, mines, lives) {
    gLevel.size = size
    gLevel.mines = mines
    gLevel.lives = lives
    initGame()

}
//sets the mine negs counts
function setMinesNegsCount() {
    // loop through the mines and calculates negs
    for (var k = 0; k < gMines.length; k++) {
        var rowIdx = gMines[k].i
        var colIdx = gMines[k].j

        for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
            if (i < 0 || i >= gBoard.length) continue
            for (var j = colIdx - 1; j <= colIdx + 1; j++) {
                if (i === rowIdx && j === colIdx) continue
                if (j < 0 || j >= gBoard[0].length) continue
                var currCell = gBoard[i][j]
                if (!currCell.isMine) currCell.minesAroundCount++
            }
        }
    }
}
//opens all cell if no mine around and repeats until no empty cells
function expandShown(gBoard, elCell, i, j) {
    // console.log('board expandShown', gBoard)
    // console.log('expandShown', elCell)
    // console.log('i', i)
    // console.log('j', j)
    var rowIdx = i
    var colIdx = j

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= gBoard[0].length) continue
            var currCell = gBoard[i][j]
            if (!currCell.isShown && !currCell.isMarked) {
                currCell.isShown = true
                currCell.className = 'clickedCell'
                gGame.shownCount++
                if (currCell.icon === EMPTY && currCell.minesAroundCount === 0) {
                    expandShown(gBoard, elCell, i, j)
                }

            }
        }
    }
    // console.log('gGame.shownCount', gGame.shownCount)
    // console.log('gBoard', gBoard)
}

//when cell is marked with right mouse click the function: starts timer, marks a cell if posibble and reveals flag
function cellMarked(elcell, i, j) {
    // console.log('rightClick', elcell)
    // console.log('i', i)
    // console.log('j', j)

    if (!gGame.isTimeRunning) {
        gInterval = setInterval(gameTimer, 1000)
        gGame.isTimeRunning = true
        placeMineRandom(gBoard, i, j)
        setMinesNegsCount()
    }
    // get model cell
    var currCell = gBoard[i][j]
    if (gGame.isOn && !currCell.isShown) {
        var cellLocation = { i: i, j: j }
        // console.log('cellLocation', cellLocation)

        // after all potential mines are marked, we allow only cell unmarking (doesnt allow extra flag marking)
        if (gGame.markedCount < gGame.hiddenMines || currCell.isMarked) {
            if (!currCell.isMarked) {
                currCell.isMarked = true
                gGame.markedCount++
                // console.log('up', gGame.markedCount)
                renderCell(cellLocation, FLAG)
            } else {
                currCell.isMarked = false
                gGame.markedCount--
                // console.log('down', gGame.markedCount)
                renderCell(cellLocation, EMPTY)
            }
            var elFlagsNum = document.querySelector('.flags-count')
            elFlagsNum.innerText = (gGame.hiddenMines - gGame.markedCount) + ' ' + FLAG
        }
    }
    checkGameOver()
}

//TODO:showHintArea(true)
//when cell is clicked the function :starts timer,reveal cell/s if possible,checks if game over
function CellClicked(elCell, i, j) {
    // if (gGame.isHint){
    //     gGame.isHint=false
    //     showHintArea(true,i,j)
    //     setTimeout(() => {
    //         showHintArea(false,i,j)

    //     }, 1000)
    //     return
    // }
    if (!gGame.isTimeRunning) {
        gInterval = setInterval(gameTimer, 1000)
        gGame.isTimeRunning = true
        placeMineRandom(gBoard, i, j)
        setMinesNegsCount()
    }

    const cell = gBoard[i][j]
    // console.log('cell',cell )
    if (gGame.isOn && !cell.isShown && !cell.isMarked) {
        cell.isShown = true
        gGame.shownCount++
        // console.log('gGame.shownCount', gGame.shownCount)
        cell.className = 'clickedCell'
        if (cell.isMine) {
            if (gGame.livesLeft === 0) {
                // console.log('gGame.livesLeft', gGame.livesLeft)
                cell.className = 'mine-boom'
                gameOver()
                return
            }
            gGame.livesLeft--
            // Decrease  total mines to find after allowed reveal (lives > 0)
            gGame.hiddenMines--
            var elFlagsNum = document.querySelector('.flags-count')
            elFlagsNum.innerText = (gGame.hiddenMines - gGame.markedCount) + ' ' + FLAG

        }

        if (cell.minesAroundCount === 0 && !cell.isMine) {
            expandShown(gBoard, elCell, i, j)
        }

        renderBoard(gBoard)

    }

    checkGameOver()
    // console.log('elCell', elCell)
}
//checks if all hidden mines were caught
function checkGameOver() {
    var exShownCells = gLevel.size * gLevel.size - gGame.hiddenMines
    if (gGame.markedCount === gGame.hiddenMines && exShownCells === gGame.shownCount) {
        gameWin()
    }
}

//wins and ends game with icon
function gameWin() {
    var elWinBtn = document.querySelector('.restart-button')
    elWinBtn.innerText = WIN
    gGame.isOn = false
    clearInterval(gInterval)
}
//ends game after lost, opens mines on board and ends the game with icon
function gameOver() {
    for (var k = 0; k < gMines.length; k++) {
        var rowIdx = gMines[k].i
        var colIdx = gMines[k].j
        var cell = gBoard[rowIdx][colIdx]
        cell.isShown = true
        if (cell.className !== 'mine-boom') cell.className = 'clickedCell'
    }
    renderBoard(gBoard)
    // console.log('gameOver')
    var elRestartBtn = document.querySelector('.restart-button')
    elRestartBtn.innerText = LOSE
    gGame.isOn = false
    clearInterval(gInterval)
}

function gameTimer() {
    var elTimeLabel = document.querySelector(".game-time");
    elTimeLabel.innerText = 'Time : ' + gGame.secsPassed
    ++gGame.secsPassed

}
function hintsClick(elHint) {
    gGame.isHint = true
    elHint.innerText = '🙉'
    elHint.disabled = true

}





