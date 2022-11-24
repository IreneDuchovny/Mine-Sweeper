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
    mines: 2
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
        isTimeRunning: false
    }
    gBoard = buildBoard()
    console.table(gBoard)
    console.log(gBoard)
    placeMineRandom(gBoard)
    setMinesNegsCount()
    renderBoard(gBoard)
    var elRestartBtn = document.querySelector('.restart-button')
    elRestartBtn.innerText = NORMAL
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

function placeMineRandom(board) {
    for (var i = 0; i < gLevel.mines; i++) {
        var iRand = getRandomInt(0, gLevel.size)
        var jRand = getRandomInt(0, gLevel.size)
        if (!board[iRand][jRand].isMine) {
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
                cellContent = cell.iconד
            } else if (cell.minesAroundCount > 0 && cell.isShown) {
                cellContent = cell.minesAroundCount
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
}

function setLevel(size, mines) {
    gLevel.size = size
    gLevel.mines = mines
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


function cellMarked(elcell, i, j) {
    console.log('rightClick', elcell)
    console.log('i', i)
    console.log('j', j)

    if (!gGame.isTimeRunning) {
        gInterval = setInterval(gameTimer, 1000)
        gGame.isTimeRunning = true
    }
    var currCell = gBoard[i][j]
    if (gGame.isOn && !currCell.isShown) {
        // render DOM
        var cellLocation = { i: i, j: j }
        console.log('cellLocation', cellLocation)
        // get model cell


        // mark cell
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

    }
}

//TODO: ON CLICK:
// TODO: CALL expandShown (board, elCell, i, j) when cell EMPTY
//TODO:win when all the mines are flagged + all cells shown
//TODO: bonus- recursion
//TODO: win state (go through gGame)
function CellClicked(elCell, i, j) {

    if (!gGame.isTimeRunning) {
        gInterval = setInterval(gameTimer, 1000)
        gGame.isTimeRunning = true
    }
    //gGame.isOn=true
    const cell = gBoard[i][j]
    // console.log('cell',cell )
    if (gGame.isOn && !cell.isShown) {
        cell.isShown = true
        gGame.shownCount++
        console.log('gGame.shownCount',gGame.shownCount )
        cell.className = 'clickedCell'
        if (cell.isMine) {
            cell.className = 'mine-boom'
            gameOver()
            return
        }
        if (cell.isMarked) {
            gGame.markedCount--
            console.log('down after left click', gGame.markedCount)
            cell.isMarked = false

        }
        renderBoard(gBoard)

    }


    console.log('elCell', elCell)
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
    elTimeLabel.innerText = 'Time Played : ' + gGame.secsPassed
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



