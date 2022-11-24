'use strict'

const MINE = '💣'
const FLAG = '🚩'
const WIN = '😎'
const LOSE = '🤯'
const NORMAL = '😊'
const EMPTY = ' '

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
    isTimeRunning: false
}


var gMines = []

function initGame() {
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        livesLeft: gLevel.lives,
        isTimeRunning: false
    }
    gBoard = buildBoard()
    console.table(gBoard)
    console.log(gBoard)

    renderBoard(gBoard)
    var elRestartBtn = document.querySelector('.restart-button')
    elRestartBtn.innerText = NORMAL
    var elFlagsNum = document.querySelector('.flags-count')
    elFlagsNum.innerText = gLevel.mines + ' ' + FLAG
    console.log('gLevel.mines', gLevel.mines)
    gameTimer()
    if (gInterval) clearInterval(gInterval)
}

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

function placeMineRandom(board, forbiddenI, forbiddenJ) {
    for (var i = 0; i < gLevel.mines; i++) {
        var iRand = getRandomInt(0, gLevel.size)
        var jRand = getRandomInt(0, gLevel.size)
        if (!board[iRand][jRand].isMine && (forbiddenI !== iRand && forbiddenJ !== jRand)) {
            board[iRand][jRand] = createCell(MINE, true)
            gMines[i] = { i: iRand, j: jRand }
        }
        else {
            i--
        }

    }
}

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

function setLevel(size, mines, lives) {
    gLevel.size = size
    gLevel.mines = mines
    gLevel.lives = lives
    initGame()

}
//gets the mine negs around count 
function setMinesNegsCount() {

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
function expandShown(gBoard, elCell, i, j) {
    console.log('board expandShown', gBoard)
    console.log('expandShown', elCell)
    console.log('i', i)
    console.log('j', j)
    //
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
                if(currCell.icon===EMPTY && currCell.minesAroundCount===0)
                {
                    expandShown(gBoard, elCell, i, j)
                }

            }
        }
    }
    console.log('gGame.shownCount', gGame.shownCount)
    console.log('gBoard', gBoard)
}

function cellMarked(elcell, i, j) {
    console.log('rightClick', elcell)
    console.log('i', i)
    console.log('j', j)

    if (!gGame.isTimeRunning) {
        gInterval = setInterval(gameTimer, 1000)
        gGame.isTimeRunning = true
        placeMineRandom(gBoard, i, j)

        setMinesNegsCount()
    }
    var currCell = gBoard[i][j]
    if (gGame.isOn && !currCell.isShown) {
        // render DOM
        var cellLocation = { i: i, j: j }
        console.log('cellLocation', cellLocation)
        // get model cell


        // mark cell
        if (gGame.markedCount < gLevel.mines || currCell.isMarked) {
            if (!currCell.isMarked) {
                currCell.isMarked = true
                gGame.markedCount++
                console.log('up', gGame.markedCount)
                renderCell(cellLocation, FLAG)
            } else {
                currCell.isMarked = false
                gGame.markedCount--
                console.log('down', gGame.markedCount)
                renderCell(cellLocation, EMPTY)
            }
            var elFlagsNum = document.querySelector('.flags-count')
            elFlagsNum.innerText = (gLevel.mines - gGame.markedCount) + ' ' + FLAG
        }
    }
    checkGameOver()
}

//TODO: ON CLICK:
//TODO:win when all the mines are flagged + all cells shown
//TODO: show button with bumber of flags left
function CellClicked(elCell, i, j) {

    if (!gGame.isTimeRunning) {
        gInterval = setInterval(gameTimer, 1000)
        gGame.isTimeRunning = true
        placeMineRandom(gBoard, i, j)

        setMinesNegsCount()

    }
    //gGame.isOn=true
    const cell = gBoard[i][j]
    // console.log('cell',cell )
    if (gGame.isOn && !cell.isShown && !cell.isMarked) {
        cell.isShown = true

        console.log('gGame.shownCount', gGame.shownCount)
        cell.className = 'clickedCell'
        if (cell.isMine) {
            if (gGame.livesLeft === 0) {
                console.log('gGame.livesLeft', gGame.livesLeft)
                cell.className = 'mine-boom'
                gameOver()
                return
            }
            gGame.livesLeft--

        }
        else {
            gGame.shownCount++
        }
        if (cell.minesAroundCount === 0 && !cell.isMine) {
            expandShown(gBoard, elCell, i, j)
        }

        renderBoard(gBoard)
        checkGameOver()
    }


    console.log('elCell', elCell)
}
function checkGameOver() {
    var exShownCells = gLevel.size * gLevel.size - gLevel.mines
    if (gGame.markedCount === gLevel.mines && exShownCells === gGame.shownCount) {
        gameWin()
    }
}

function gameWin() {
    var elWinBtn = document.querySelector('.restart-button')
    elWinBtn.innerText = WIN
    gGame.isOn = false
    clearInterval(gInterval)
}
function gameOver() {
    for (var k = 0; k < gMines.length; k++) {
        var rowIdx = gMines[k].i
        var colIdx = gMines[k].j
        var cell = gBoard[rowIdx][colIdx]
        cell.isShown = true
        if (cell.className !== 'mine-boom') cell.className = 'clickedCell'
    }
    renderBoard(gBoard)
    console.log('gameOver')
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


//TODO: UTILS
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function getClassName(location) {
    const cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}
function renderCell(location, value) {
    const cellSelector = '.' + getClassName(location) // cell-i-j
    const elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value
}



