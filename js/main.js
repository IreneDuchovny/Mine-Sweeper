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
    secsPassed: 0
}

var gMines = []


function initGame() {
    gGame.isOn = true
    gBoard = buildBoard()
    console.table(gBoard)
    console.log(gBoard)

    setMinesNegsCount()
    renderBoard(gBoard)
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
    board[1][0] = createCell(MINE, true)
    gMines[0] = { i: 1, j: 0 }
    board[3][2] = createCell(MINE, true)
    gMines[1] = { i: 3, j: 2 }
    return board
}


function renderBoard(board) {
    var strHTML = ''

    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'

        for (var j = 0; j < board[0].length; j++) {
            var cellContent = EMPTY
            var cell = board[i][j]
            var className = cell.className
            var cellData = 'data-i="' + i + '" data-j="' + j + '"'

            if (cell.minesAroundCount === 0 && cell.isShown) {
                cellContent = cell.icon
            } else if (cell.minesAroundCount > 0 && cell.isShown) {
                cellContent = cell.minesAroundCount
            }

            strHTML += `<td class="${className}" ${cellData}
            onclick="CellClicked(this,${i},${j})">
            ${cellContent}</td>`
        }
        strHTML += '</tr>\n'
    }

    var elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
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
                currCell.minesAroundCount++
            }
        }
    }
}
function CellClicked(elCell, i, j) {
    //gGame.isOn=true
    const cell = gBoard[i][j]
    // console.log('cell',cell )
    if (gGame.isOn) {
        cell.isShown = true
        cell.className = 'clickedCell'
        if (cell.isMine) {
            gameOver()
        }
        renderBoard(gBoard)


    }
    //     //TODO: ON CLICK:
    //     //TODO: START TIMER,
    // TODO: CALL expandShown (board, elCell, i, j) when cell EMPTY
    //TODO: RENDERCELL?
    console.log('elCell', elCell)
}

function gameOver() {
    for (var k = 0; k < gMines.length; k++) {
        var rowIdx = gMines[k].i
        var colIdx = gMines[k].j
        var cell= gBoard[rowIdx][colIdx]
        cell.isShown=true
    }
    renderBoard(gBoard)
    console.log('gameOver')
    var smileyChange= document.querySelector('button')
    smileyChange.innerText= LOSE
    gGame.isOn=false
}

