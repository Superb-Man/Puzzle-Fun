let piles = [];
let isPlayerTurn = true;


function renderBoard() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    piles.forEach((pile, index) => {
        const pileDiv = document.createElement('div');
        pileDiv.className = 'pile';
        pileDiv.id = `pile${index}`;

        for (let i = 0; i < pile; i++) {
            const stick = document.createElement('div');
            stick.className = 'stick';
            stick.dataset.pile = index;
            stick.dataset.stick = i;
            pileDiv.appendChild(stick);
        }

        gameBoard.appendChild(pileDiv);
    });

    if (!isPlayerTurn) {
        setTimeout(botMove, 1000);
    }
}

function handleMove(event) {
    if (!isPlayerTurn) return;

    const stick = event.target;
    if (stick.classList.contains('stick')) {
        const pileIndex = parseInt(stick.dataset.pile);
        const stickIndex = parseInt(stick.dataset.stick);

        console.log(pileIndex, stickIndex);

        const pileDiv = document.getElementById(`pile${pileIndex}`);
        const sticksToRemove = Array.from(pileDiv.children).slice(stickIndex);

        sticksToRemove.forEach((stickToRemove, idx) => {
            setTimeout(() => {
                stickToRemove.style.opacity = 0;
                stickToRemove.style.transform = 'translateY(-20px)';

                setTimeout(() => {
                    stickToRemove.remove();
                }, 500);
            }, idx * 100);
        });

        setTimeout(() => {
            piles[pileIndex] -= sticksToRemove.length;
            if (piles[pileIndex] === 0) piles.splice(pileIndex, 1);

            isPlayerTurn = false;
            renderBoard();
            checkWinner();
        }, sticksToRemove.length * 100);
    }
}

function botMove() {
    if (piles.length === 0) return;

    let xorSum = 0;
    for (let i = 0; i < piles.length; i++) {
        xorSum ^= piles[i];
    }

    if (xorSum === 0) {
        for (let i = 0; i < piles.length; i++) {
            if (piles[i] > 0) {
                piles[i]--;
                if (piles[i] === 0) piles.splice(i, 1);
                break;
            }
        }
    } else { //winning move
        for (let i = 0; i < piles.length; i++) {
            let targetPile = piles[i] ^ xorSum;
            if (targetPile < piles[i]) {
                piles[i] = targetPile;
                if (piles[i] === 0) piles.splice(i, 1);
                break;
            }
        }
    }

    isPlayerTurn = true;
    renderBoard();
    checkWinner();
}

function checkWinner() {
    if (piles.length === 0) {
        const winnerText = isPlayerTurn ? 'Bot wins!' : 'Player wins!';
        document.getElementById('winner').textContent = winnerText;
        document.getElementById('gameBoard').removeEventListener('click', handleMove);
    }
}

document.getElementById('startBtn').addEventListener('click', () => {
    if(document.getElementById('startBtn').textContent === 'Reset'){
        window.location.reload();
    }

    const numberOfPiles = parseInt(document.getElementById('pileInput').value);
    piles = Array.from({ length: numberOfPiles }, () => Math.floor(Math.random() * 7) + 1);
    document.getElementById('winner').textContent = '';
    isPlayerTurn = true;
    document.getElementById('pileInput').disabled = true;
    document.getElementById('startBtn').textContent = 'Reset';
    renderBoard();
});

// document.getElementById('resetBtn').addEventListener('input', () => {
//     window.location.reload();
//     // piles = [];
//     // renderBoard();
//     // document.getElementById('winner').textContent = '';
// });

document.getElementById('gameBoard').addEventListener('click', handleMove);
