let moveCount ,rods ,moves ,prevLeft ,numDisks ,resume ;

function reset() {
    moveCount = 0;
    rods = [[], [], []];
    moves = [];
    prevLeft = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ;
    numDisks ;
    resume = 0 ; 
}

reset();


function createDisks(numDisks) {
    const rod1 = document.getElementById('rod1');
    rod1.innerHTML = '';
    rods = [[], [], []];
    for (let i = numDisks; i >= 1; i--) {
        rods[0].push(i);
        const disk = document.createElement('div');
        disk.className = 'disk';
        disk.id = `disk${i}`;
        disk.style.width = `${i * 50}px`; 
        disk.style.height = '20px';
        disk.style.left = `${7.5-(i * 25)}px`;
        disk.style.transform = `translateY(-${(numDisks - i) * 20}px)`;
        rod1.appendChild(disk);
    }
}

function recordMoves(n, fromRod, toRod, auxRod) {
    if (n === 0) return;
    recordMoves(n - 1, fromRod, auxRod, toRod);
    moves.push([fromRod, toRod]);
    recordMoves(n - 1, auxRod, toRod, fromRod);
}

function moveDisk(disk, fromRod, toRod) {
    const fromElement = document.getElementById(`rod${fromRod + 1}`);
    const toElement = document.getElementById(`rod${toRod + 1}`);
    const diskElement = document.getElementById(`disk${disk}`);

    rods[toRod].push(disk);
    // console.log(rods[toRod].length,' ',toRod+1) ;
    rods[fromRod].pop();

    const targetPosition = (rods[toRod].length - 1) * 20;
    const fromRodPosition = fromElement.getBoundingClientRect().left;
    const toRodPosition = toElement.getBoundingClientRect().left;

    diskElement.style.transition = `transform 1s ease-in-out`;
    
    let tx = prevLeft[disk] ;
    diskElement.style.transform = `translate(${tx}px, -200px)`
    console.log(diskElement.style.transform);
    // if(toRod == 1) {
    //     document.getElementById('rod2').appendChild(diskElement);
    // }
    // else if(toRod == 2) {
    //     document.getElementById('rod3').appendChild(diskElement);
    // }
    setTimeout(() => {
        diskElement.style.transform = `translate(${toRodPosition - fromRodPosition + tx}px, -200px)`;
        // prevLeft[disk] = diff ;
        setTimeout(() => {
                // let tx = prevLeft[disk] ;
                diskElement.style.transform = `translate(${toRodPosition - fromRodPosition + tx}px ,-${targetPosition}px)`;
                prevLeft[disk] = toRodPosition - fromRodPosition + tx ;
                console.log(diskElement.style.transform);
            }, 1000);
    }, 1000);
}


function animateMoves() {
    console.log(resume) ;
    if(resume){
        if (moves.length === 0) return;

        const [fromRod, toRod] = moves.shift();
        const disk = rods[fromRod].slice(-1)[0];
        console.log(disk);
        // console.log(rods);

        moveDisk(disk, fromRod, toRod);
        moveCount++;
        document.getElementById('moveCount').textContent = moveCount;
        
        const moveList = document.getElementById('moveList');
        const moveItem = document.createElement('li');
        moveItem.textContent = `Move disk ${disk} from rod ${fromRod + 1} to rod ${toRod + 1}`;
        moveList.appendChild(moveItem);

        setTimeout(animateMoves, 3000);
    }
}

document.getElementById('startBtn').addEventListener('click', () => {
    if(document.getElementById('startBtn').textContent == 'Reset'){
        window.location.reload();
    }
    const numDisks = parseInt(document.getElementById('numDisks').value);
    document.getElementById('moveCount').textContent = moveCount;
    resume = 1 ;
    document.getElementById('pauseBtn').textContent = 'Pause' ;
    document.getElementById('moveList').innerHTML = ''; 
    document.getElementById('startBtn').textContent = 'Reset' ;
    document.getElementById('numDisks').disabled = true ;
    createDisks(numDisks);
    recordMoves(numDisks, 0, 2, 1);
    setTimeout(animateMoves, 500);
});


document.getElementById('pauseBtn').addEventListener('click', () => {
    if(resume == 0){
        console.log('resume') ;
        document.getElementById('pauseBtn').style.background = 'red' ;
        document.getElementById('pauseBtn').textContent = 'Pause' ;
        resume = 1 ;
        animateMoves() ;
    }
    else{
        console.log('pause') ;
        document.getElementById('pauseBtn').style.background = 'green' ;
        document.getElementById('pauseBtn').textContent = 'Resume' ;
        resume = 0 ;
    }

});

document.getElementById('numDisks').addEventListener('input', () => {
    numDisks = parseInt(document.getElementById('numDisks').value);
    moveCount = 0;
    document.getElementById('moveCount').textContent = moveCount;
    document.getElementById('moveList').innerHTML = ''; // Clear previous moves
    createDisks(numDisks);
});

createDisks(parseInt(document.getElementById('numDisks').value));
