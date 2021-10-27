const CELL_SIZE=30;
const TIME_PER_MOVE=100;
const APPLE_COUNT=50;
const ROWS = Math.floor((document.documentElement.scrollHeight-document.getElementById("hud").scrollHeight)/CELL_SIZE);
const COLS = Math.floor(document.documentElement.scrollWidth<=600?document.documentElement.scrollWidth:600/CELL_SIZE);

class Player {
	constructor(x,y,direction){
		this.startPositionX=x;
		this.startPositionY=y;
		this.startDirection=direction;
		this.coords=[
			{x:x,y:y,imageRotation:90,turningDirection:undefined},
			{x:x-1,y:y,imageRotation:90,turningDirection:undefined},
			{x:x-2,y:y,imageRotation:90,turningDirection:undefined}		
		];
		this.lives=3;
		this.score=0;
		this.previousDirection=direction;
		this.currentDirection=direction;
	}

	reset(){
		this.lives=3;
		this.score=0;
		this.coords=[
			{x:this.startPositionX,y:this.startPositionY,imageRotation:90,turningDirection:undefined},
			{x:this.startPositionX-1,y:this.startPositionY,imageRotation:90,turningDirection:undefined},
			{x:this.startPositionX-2,y:this.startPositionY,imageRotation:90,turningDirection:undefined}		
		];
		this.previousDirection=this.startDirection;
		this.currentDirection=this.startDirection;
	}

	turnBody(){
		switch(this.currentDirection){
			case "right" : {
				if (this.previousDirection==="up") {
					this.coords[1].imageRotation=0;
				} else if (this.previousDirection==="down"){
					this.coords[1].imageRotation=270;
				}
				break;
			};
			case "left" : {
				if (this.previousDirection==="up") {
					this.coords[1].imageRotation=90;
				} else if (this.previousDirection==="down"){
					this.coords[1].imageRotation=180;
				}
				break;
			};
			case "up" : {
				if (this.previousDirection==="right") {
					this.coords[1].imageRotation=180;
				} else if (this.previousDirection==="left"){
					this.coords[1].imageRotation=270;
				}
				break;
			};
			case "down" : {
				if (this.previousDirection==="right") {
					this.coords[1].imageRotation=90;
				} else if (this.previousDirection==="left"){
					this.coords[1].imageRotation=0;
				}
				break;
			};
		}

		this.coords[1].turningDirection=this.currentDirection;
	}

	changeDirection(newDirection) {
		switch(newDirection) {
			case "right" : {
				if (this.currentDirection!=="right" && this.currentDirection!=="left") {
					this.currentDirection="right";
				}
				break;
			};
			case "left" : {
				if (this.currentDirection!=="left" && this.currentDirection!=="right") {
					this.currentDirection="left";
				}
				break;
			};
			case "up" : {
				if (this.currentDirection!=="up" && this.currentDirection!=="down") {
					this.currentDirection="up";
				}
				break;
			};
			case "down" : {
				if (this.currentDirection!=="down" && this.currentDirection!=="up") {
					this.currentDirection="down";
				}
				break;
			};
		}
	}

	move(){
		this.coords.slice().reverse().forEach((coord,index,arr)=>{
			if (index<arr.length-1) {
				arr[index].x = arr[index+1].x;
				arr[index].y = arr[index+1].y;
				if (index===0 && arr[index+1].turningDirection) {
					switch(arr[index+1].turningDirection) {
						case "left":{
							arr[index].imageRotation=-90;
							break;
						};
						case "right":{
							arr[index].imageRotation=90;
							break;
						};
						case "up":{
							arr[index].imageRotation=0;
							break;
						};
						case "down":{
							arr[index].imageRotation=180;
							break;
						};
					}
				} else {
					arr[index].imageRotation=arr[index+1].imageRotation;
					arr[index].turningDirection=arr[index+1].turningDirection;
				}
			}
		});

		switch(this.currentDirection) {
			case "right" : {
				this.coords[0].x+=1;
				this.coords[0].imageRotation=90;
				if (this.coords[0].x+1>COLS) {
					this.coords[0].x=0;
				}
				break;
			};
			case "left" : {
				this.coords[0].x-=1;
				this.coords[0].imageRotation=-90;
				if (this.coords[0].x<0){
					this.coords[0].x=COLS;
				}
				break;
			};
			case "up" : {
				this.coords[0].y-=1;
				this.coords[0].imageRotation=0;
				if (this.coords[0].y<0){
					this.coords[0].y=ROWS;
				}
				break;
			};
			case "down" : {
				this.coords[0].y+=1;
				this.coords[0].imageRotation=180;
				if (this.coords[0].y+1>ROWS) {
					this.coords[0].y=0;
				}
				break;
			};
		}

		if (this.previousDirection!==this.currentDirection){
			this.turnBody();
			this.previousDirection=this.currentDirection;
		}
	}
}

function generateApples(){
	let apples=[];
	for (let i=0;i<APPLE_COUNT;i++){
		apples.push({
			x:Math.floor(Math.random()*(COLS-1))+1,
			y:Math.floor(Math.random()*(ROWS-1))+1
		});
	}
	return apples;
}

function initGame(){
	player=new Player(5,5,"right");
	lastTime = 0;
	highScore = 0;
	paused = false;
	animationFrameID = undefined;
	state = "stopped";
	infoBox = document.getElementById("info-box");
	livesText = document.getElementById("lives");
	squares = document.getElementsByClassName("square");
	apples = [];

	for(let y=0;y<ROWS;y++) {
		var row = document.createElement("div");
		row.classList.add("row");
		for(let x=0;x<COLS;x++) {
			var square = document.createElement("div");
			square.classList.add("square");
			row.appendChild(square);
		}
		document.getElementById("field").appendChild(row);
	}

	this.addEventListener('keydown', event => {
	  	switch (event.key) {
	  		case " " : {
	  			if (state==="stopped") {
					startGame();
				}
				break;
	  		};
	  		case "Escape" : {
				if (state==='running') {
					state='paused';
					infoBox.innerHTML = "The game is paused.<br>Press esc to continue.";
					infoBox.classList.add("show");
				} else if (state==='paused'){
					state='running';
					infoBox.classList.remove("show");
				}
	  			break;
	  		};
	  		case "ArrowLeft" : {
	  			player.changeDirection("left");
				break;
	  		};
	  		case "ArrowUp" : {
	  			player.changeDirection("up");
				break;
	  		};
	  		case "ArrowRight" : {
	  			player.changeDirection("right");
				break;
	  		};
	  		case "ArrowDown" : {
	  			player.changeDirection("down");
				break;
	  		};
	  	}
	})
}

function update(currentTime){
	if (lastTime) {
		if (state==='running' && ((currentTime-lastTime)>TIME_PER_MOVE)) {
			document.getElementById("score").innerHTML = player.score;
			document.getElementById("lives").innerHTML = player.lives;
			document.getElementById("playerCoords").innerHTML = "x="+player.coords[0].x+" y="+player.coords[0].y;

			for(let y=0;y<ROWS;y++) {
				for(let x=0;x<COLS;x++) {
					squares[y*COLS+x].className="square";

					let indexOfSnakePart = player.coords.findIndex(coord=>coord.y===y && coord.x===x);
					if (indexOfSnakePart>=0) {
						squares[y*COLS+x].classList.add("sprite","player");
						if (indexOfSnakePart===0){
							squares[y*COLS+x].classList.add("head");
						} else if (indexOfSnakePart===player.coords.length-1){
							squares[y*COLS+x].classList.add("tail");
						} else {
							squares[y*COLS+x].classList.add("body");
							if (player.coords[indexOfSnakePart].turningDirection){
								squares[y*COLS+x].classList.add("turn");
							}
						}
						squares[y*COLS+x].style.transform="rotate("+player.coords[indexOfSnakePart].imageRotation+"deg)";
					} else if (apples.some(apple=>apple.y===y && apple.x===x)) {
						squares[y*COLS+x].classList.add("sprite","apple");
					}
				}
			}

			if (player.coords.some((coord,i,a)=>coord !== a[0] && coord.x===a[0].x && coord.y===a[0].y)) {
				--player.lives;
				livesText.innerHTML = player.lives;

				if (player.lives===0) {
					player.score>highScore?highScore=player.score:'';
					infoBox.innerHTML = "You died.<br>Your high score is: "+highScore+"<br>Press SPACE to restart";
					infoBox.classList.add("show");
					state="stopped";
				}
			}

			let foundApple=apples.find(apple=>apple.x===player.coords[0].x && apple.y===player.coords[0].y);
			if (foundApple) {
				player.score += 1;
				player.coords.push({
					x:player.coords[player.coords.length-1].x,
					y:player.coords[player.coords.length-1].y,
					turningDirection:player.currentDirection,
					imageRotation:player.coords[0].imageRotation
				});
				apples.splice(apples.findIndex(apple=>apple.x===player.coords[0].x && apple.y===player.coords[0].y),1);
			}

			player.move();
			lastTime=currentTime;
		}
	} else {
		lastTime=currentTime;
	}

	animationFrameID = requestAnimationFrame(update);
}

function startGame(){
	apples=generateApples();
	player.reset();
	infoBox.classList.remove("show");
	state="running";

	if (animationFrameID) cancelAnimationFrame(animationFrameID);
	animationFrameID=window.requestAnimationFrame(update);
}

initGame();
