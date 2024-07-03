const K = 4; // Change K to 4 for the 4x4 puzzle
const canvas = document.getElementById('puzzleCanvas');
const ctx = canvas.getContext('2d');
const tileSize = 100;
const padding = 10; 
const gridWidth = K * tileSize + (K - 1) * padding; 
const gridHeight = K * tileSize + (K - 1) * padding; 
canvas.width = gridWidth;
canvas.height = gridHeight;
let play = 0;

let puzzle = [
    [12, 1, 2, 6],
    [10, 8, 7, 4],
    [5, 11, 3, 15],
    [9, 13, 14, 0]
];

const goal = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
    [13, 14, 15, 0]
];

const dx = [-1, 0, 1, 0];
const dy = [0, 1, 0, -1];

let expanded = 0;
let explored = 0;
let solutionPath = [];

function isSolvable(board) {
    let inv_count = 0;
    const flat_board = board.flat();
    for (let i = 0; i < flat_board.length; i++) {
        for (let j = i + 1; j < flat_board.length; j++) {
            if (flat_board[i] && flat_board[j] && flat_board[i] > flat_board[j]) {
                inv_count++;
            }
        }
    }
    return inv_count % 2 === 0;
}

function check(r, c) {
    return r >= 0 && c >= 0 && r < K && c < K;
}

function hammingDistance(board) {
    let cnt = 0;
    for (let i = 0; i < K; i++) {
        for (let j = 0; j < K; j++) {
            if (board[i][j] !== 0 && board[i][j] !== i * K + j + 1) {
                cnt++;
            }
        }
    }
    return cnt;
}

function manhattanDistance(board) {
    let manhattan = 0;
    for (let i = 0; i < K; i++) {
        for (let j = 0; j < K; j++) {
            const val = board[i][j];
            if (val !== 0) {
                const goalX = Math.floor((val - 1) / K);
                const goalY = (val - 1) % K;
                manhattan += Math.abs(goalX - i) + Math.abs(goalY - j);
            }
        }
    }
    return manhattan;
}

class Node {
    constructor(board, parent, move, priority) {
        this.board = board;
        this.parent = parent;
        this.move = move;
        this.priority = priority;
    }
}

class MinHeap {
    constructor(comparator) {
        this.data = [];
        this.comparator = comparator;
    }

    push(element) {
        this.data.push(element);
        this.heapifyUp();
    }

    pop() {
        if (this.size() > 1) {
            this.swap(0, this.size() - 1);
            const poppedValue = this.data.pop();
            this.heapifyDown();
            return poppedValue;
        }
        return this.data.pop();
    }

    peek() {
        return this.data[0];
    }

    size() {
        return this.data.length;
    }

    isEmpty() {
        return this.size() === 0;
    }

    heapifyUp() {
        let index = this.size() - 1;
        while (this.hasParent(index) && this.comparator(this.data[index], this.data[this.getParentIndex(index)]) < 0) {
            this.swap(index, this.getParentIndex(index));
            index = this.getParentIndex(index);
        }
    }

    heapifyDown() {
        let index = 0;
        while (this.hasLeftChild(index)) {
            let smallerChildIndex = this.getLeftChildIndex(index);
            if (this.hasRightChild(index) && this.comparator(this.data[this.getRightChildIndex(index)], this.data[this.getLeftChildIndex(index)]) < 0) {
                smallerChildIndex = this.getRightChildIndex(index);
            }
            if (this.comparator(this.data[index], this.data[smallerChildIndex]) < 0) {
                break;
            } else {
                this.swap(index, smallerChildIndex);
            }
            index = smallerChildIndex;
        }
    }

    getLeftChildIndex(parentIndex) { return 2 * parentIndex + 1; }
    getRightChildIndex(parentIndex) { return 2 * parentIndex + 2; }
    getParentIndex(childIndex) { return Math.floor((childIndex - 1) / 2); }

    hasLeftChild(index) { return this.getLeftChildIndex(index) < this.size(); }
    hasRightChild(index) { return this.getRightChildIndex(index) < this.size(); }
    hasParent(index) { return this.getParentIndex(index) >= 0; }

    leftChild(index) { return this.data[this.getLeftChildIndex(index)]; }
    rightChild(index) { return this.data[this.getRightChildIndex(index)]; }
    parent(index) { return this.data[this.getParentIndex(index)]; }

    swap(indexOne, indexTwo) {
        [this.data[indexOne], this.data[indexTwo]] = [this.data[indexTwo], this.data[indexOne]];
    }
}

function solvePuzzle() {
    const pq = new MinHeap((a, b) => a.priority - b.priority);
    const vis = new Set();
    const root = new Node(puzzle, null, 0, 0);
    pq.push(root);
    explored++;

    while (!pq.isEmpty()) {
        const cur = pq.pop();

        const boardStr = JSON.stringify(cur.board);
        if (vis.has(boardStr)) continue;
        vis.add(boardStr);
        expanded++;

        if (manhattanDistance(cur.board) === 0) {
            console.log(`Number of moves: ${cur.move}`);
            solutionPath = [];
            let node = cur;
            while (node) {
                solutionPath.push(node.board);
                node = node.parent;
            }
            solutionPath.reverse();
            return;
        }

        for (let r = 0; r < K; r++) {
            for (let c = 0; c < K; c++) {
                if (cur.board[r][c] === 0) {
                    for (let i = 0; i < 4; i++) {
                        const nr = r + dx[i];
                        const nc = c + dy[i];

                        if (check(nr, nc)) {
                            const newBoard = cur.board.map(row => row.slice());
                            [newBoard[r][c], newBoard[nr][nc]] = [newBoard[nr][nc], newBoard[r][c]];

                            if (!vis.has(JSON.stringify(newBoard))) {
                                const newNode = new Node(newBoard, cur, cur.move + 1, cur.move + 1 + manhattanDistance(newBoard));
                                pq.push(newNode);
                                explored++;
                            }
                        }
                    }
                }
            }
        }
    }
}

function drawRoundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

function drawTile(number, x, y, isMoving) {
    const roundedRadius = 10;
    const tileWidth = tileSize - 4;
    const tileHeight = tileSize - 4;

    // Draw the tile with rounded corners
    ctx.fillStyle = '#00cccc';
    drawRoundedRect(x + 2, y + 2, tileWidth, tileHeight, roundedRadius);
    ctx.fill();
    ctx.stroke();

    if (number !== 0) {
        // Draw the number inside the tile
        ctx.font = '30px Arial';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(number, x + tileSize / 2, y + tileSize / 2);

        // if (isMoving) {
        //     ctx.strokeStyle = 'red'; // Color for moving tile
        //     ctx.lineWidth = 5;
        //     drawRoundedRect(x + 2, y + 2, tileWidth, tileHeight, roundedRadius);
        //     ctx.stroke();
        // }
    } else {
        // Draw colored border for the empty cell (0)
        ctx.strokeStyle = '#00cccc';
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, y + 2, tileWidth, tileHeight);
    }
}

function drawPuzzle(puzzle) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate the starting position to center the puzzle grid
    const startX = (canvas.width - gridWidth) / 2;
    const startY = (canvas.height - gridHeight) / 2;

    // Find the tile that is moving
    let movingTile = [-1, -1];

    if (animationStep < solutionPath.length) {
        const nextPuzzle = solutionPath[animationStep];
        for (let i = 0; i < K; i++) {
            for (let j = 0; j < K; j++) {
                if (puzzle[i][j] !== nextPuzzle[i][j] && puzzle[i][j] !== 0) {
                    movingTile = [i, j];
                    break;
                }
            }
            if (movingTile[0] !== -1) break;
        }
    }

    for (let i = 0; i < K; i++) {
        for (let j = 0; j < K; j++) {
            const number = puzzle[i][j];
            const isMoving = movingTile[0] === i && movingTile[1] === j;
            drawTile(number, startX + j * (tileSize + padding), startY + i * (tileSize + padding), isMoving);
        }
    }
}

let animationStep = 0;
let isAnimating = false;

function animate() {
    if (isAnimating && animationStep < solutionPath.length) {
        puzzle = solutionPath[animationStep];
        animationStep++;
        if (animationStep === solutionPath.length) {
            isAnimating = false;
        }
        drawPuzzle(puzzle);
        setTimeout(animate, 500);
    }
}

function startAnimation() {
    isAnimating = true;
    animationStep = 0;
    document.getElementById('solveButton').disabled = true;
    animate();
}

function resetPuzzle() {
    puzzle = [
        [12, 1, 2, 6],
        [10, 8, 7, 4],
        [5, 11, 3, 15],
        [9, 13, 14, 0]
    ];
    play = 0 ;
    isAnimating = false;
    drawPuzzle(puzzle);
}

function manualMove(r, c, nr, nc) {
    [puzzle[r][c], puzzle[nr][nc]] = [puzzle[nr][nc], puzzle[r][c]];
    drawPuzzle(puzzle);
}

canvas.addEventListener('click', (event) => {
    if(play == 2) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const startX = (canvas.width - gridWidth) / 2;
        const startY = (canvas.height - gridHeight) / 2;

        const c = Math.floor((x - startX) / (tileSize + padding));
        const r = Math.floor((y - startY) / (tileSize + padding));

        if (check(r, c)) {
            for (let i = 0; i < 4; i++) {
                const nr = r + dx[i];
                const nc = c + dy[i];
                if (check(nr, nc) && puzzle[nr][nc] === 0) {
                    manualMove(r, c, nr, nc);
                    break;
                }
            }
        }
    }
});

document.getElementById('startButton').addEventListener('click', () => {
    if (document.getElementById('startButton').textContent === 'Play Game') {
        drawPuzzle(puzzle);
        document.getElementById('startButton').textContent = 'Reset';
        document.getElementById('solveButton').disabled = true;
        play = 2;
    }
    else {
        resetPuzzle();
        document.getElementById('startButton').textContent = 'Play Game';
        document.getElementById('solveButton').disabled = false;
    }
});

document.getElementById('solveButton').addEventListener('click', () => {
    play = 1 ;
    if (isSolvable(puzzle.flat())) {
        document.getElementById('solveButton').disabled = true;
        document.getElementById('startButton').textContent = 'Reset';
        console.log(play) ;
        solvePuzzle();
        startAnimation();
        
    } else {
        console.log("Unsolvable Puzzle");
    }
});

drawPuzzle(puzzle);
