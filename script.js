

var GAME_WIDTH = 400;
var GAME_HEIGHT = 600;
var GAME_TIME = 60;
var GAME_FPS = 60;
var GAME_BACKGROUND = "242, 241, 239";
var gameScore = 0;

var FOOD_WIDTH = 20;
var FOOD_HEIGHT = 20;

var BUG_WIDTH = 10;
var BUG_HEIGHT = 40;

var game = document.getElementById("game");
var ctx = game.getContext('2d');
var foods = [];
var bugs = [];
var BUGS_ARCHETYPES = [
	{color: "0, 0, 0", velocity: [150, 200], score: 5, probability: [0, 3]}, //red
	{color: "192, 57, 43", velocity: [75, 100], score: 3, probability: [3, 6]} ,//red
	{color: "243, 156, 18", velocity: [60, 80], score: 1, probability: [6, 11]} //orange
];

var gamePaused = false;

var gameLoopId; // id of the setInterval event, used to clear it later
var handleTimerId; // id of the setInterval event, used to clear it later


/**
* Prepare some initial stuff
*/
var init = function(){
	/* set the highscore */
	var highScore = localStorage.getItem("ttb-highScore") || 0;
	document.getElementById("highScore").textContent = highScore;

	var startButton = document.getElementById("startGameButton");
	startButton.addEventListener("click", function (e){
		e.preventDefault();
		startGame();
	});


	// Pop-up Window listeners
	document.getElementById("try-again").addEventListener("click", function(){
		destroyEverything();
		startGame();
	});

	document.getElementById("exit").addEventListener("click", function(){
		setNewHighScore(gameScore);
		destroyEverything();
		showInitialScreen();
	});

	document.getElementById("pause-play").addEventListener("click", handlePauseButton); // handle pause/play event
	document.addEventListener("click", handleKillClick); // handle click on screen event

}();



/***************************************
************** bureaucracy *************
****************************************
* stuff that are needed for the game   *
* but not necessarily about the engine *
***************************************/


/*
*	Hides the game page and shows the start page
*/
function showInitialScreen(){
	document.getElementById("game-wrapper").className = "hide";
	document.getElementById("start-page").className = "";
}

function getSelectedLevel(){
	return parseInt(document.startPageForm['level'].value);
}

function updateScore(score){
	gameScore += score;
	document.getElementById("score-content").textContent = gameScore;

	if (gameScore > localStorage.getItem("ttb-highScore")){
		// adds a pulse effect when the reaches a new high score
		document.getElementById("score-content").className = "pulse-once";
	}
}


/**
**	EVENTS
**/

/*
*	Handle the timer 
*/
function handleTimer(){
	if (gamePaused === true) return; // if game is paused, do nothing
	document.getElementById("timer-content").textContent = currentTime; 

	// handles game over here so that the game pace keeps discrete (1 second per "turn")
	if (currentTime-- <= 0 || foods.length <= 0) gameOver();
}


/*
*	When the pause/play button is clicked, toggle the state and the icon	
*/
function handlePauseButton(){
	if (gamePaused === false)
		document.getElementById("pause-play").innerHTML = "&#9658;"; // changes to a play icon
	else
		document.getElementById("pause-play").innerHTML = "&#10074;&#10074;"; // changes to a pause icon
	
	gamePaused = !gamePaused;
}

/*
*	Handle when the user clicks in any part of the screen
*	with the purpose of killing a bug
*/
function handleKillClick(e){
	if (gamePaused === true) return;
	var canvas = document.getElementById("game");
  	var d;
	
	console.log(e);
	bugs.forEach(function (bug){
		d = getDistanceBetween({ x: e.x - canvas.offsetLeft, y: e.y - canvas.offsetTop}, bug);
		// if there's any bug in a radius of 30 px
		if (d <= 30){			
			updateScore(bug.score);	
			bug.available = false;// kill bug
		}
	});
}

/*
*	Updates the highscore 
*/
function setNewHighScore(highScore){
	var oldHighScore = localStorage.getItem("ttb-highScore");
	// updates the highscore if necessary
	if (highScore > oldHighScore){
		localStorage.setItem("ttb-highScore", highScore)
		document.getElementById("highScore").textContent = highScore;
	}
}


/*
*	Advances from level 1 to level 2
*/
function startLevelTwo(){
	destroyEverything();

	document.getElementById("level1").checked = false;
	document.getElementById("level2").checked = true;
	startGame();
}



function startGame(){
	
	var selectedLevel = getSelectedLevel();

	document.getElementById("game-wrapper").className = "";
	document.getElementById("start-page").className = "hide";
	document.getElementById("pop-up").className = "hide";
	document.getElementById("intro-pop-up").className = "pop-up";
	document.getElementById("intro-pop-up-content").textContent = "Level " + selectedLevel;



	// starts the game after 2 seconds
	setTimeout(function (){
		document.getElementById("intro-pop-up").className = "hide"; //hide the "level X" popup

		ctx.canvas.width = GAME_WIDTH;
		ctx.canvas.height = GAME_HEIGHT;
		
		// generate all the foods
		FoodGenerator.generate();

		// spawns the first bug
		setTimeout(spawnBug, getRandomSpawnTime());

		//sets the timer
		currentTime = GAME_TIME;
		document.getElementById("timer-content").textContent = currentTime--; // sets game time
		handleTimerId = setInterval(handleTimer, 1000); // updates game time



		gameLoopId = setInterval(gameLoop, 1000/GAME_FPS);


	}, 2000);
}



function gameOver(){
	setNewHighScore(gameScore);

	if (currentTime <= 0 &&
		foods.length > 0 && 
		getSelectedLevel() === 1){ //if finished first stage
		startLevelTwo();
	}else{
		document.getElementById("high-score-pop-up").textContent = gameScore;
		document.getElementById("pop-up").className = "pop-up";
		gamePaused = true;
	}
}



function destroyEverything(){
	foods = [];
	bugs = [];
	gamePaused = false;
	gameScore = 0;
	document.getElementById("score-content").textContent = 0;

	clearInterval(handleTimerId);
	clearInterval(gameLoopId);
}


/***********************************
************** GAME *************
************************************/

/*
*	Main Game Loop
*/
function gameLoop(){
	if (gamePaused === true) return;
	ctx.clearRect(0,0, GAME_WIDTH, GAME_HEIGHT); // remove everything on canvas

	// draws the background
	ctx.fillStyle = "rgb(" + GAME_BACKGROUND + ")";
	ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

	FoodGenerator.redraw(); // redraw all the foods


	bugs.forEach(function (bug){
		updateBug(bug); // update bug position
		renderBug(bug); // redraw bug
	});

	if (foods.length <= 0) gameOver();
}


/*
*	Update the bug position, availability etc
*/
function updateBug(bug){
	var nearestFood = getNearestFoodFrom(bug);

	// if all foods have been eaten
	if (nearestFood === undefined) {
		gameOver();
		return ;
	}

	// if bug is fading, do nothing
	if (bug.available === false) return;
	

	handleEat(bug, nearestFood);
	rotateBugToFood(nearestFood, bug);
	moveForward(bug);
}

	
/*
*	Creates a new bug on screen
*/
function spawnBug(){
	// do nothing if the game is paused
	if (gamePaused === true) return;

	// each bug triggers the spawner for the next one
	setTimeout(spawnBug, getRandomSpawnTime());

	var bugArchetype = getBugArchetype();

	var bug = {
		id: bugs.length,
		x: getRandomNum(BUG_WIDTH/2, GAME_WIDTH - BUG_WIDTH/2),
		y: -BUG_HEIGHT - BUG_HEIGHT/2,
		velocity: bugArchetype.velocity[getSelectedLevel() - 1],
		width: BUG_WIDTH,
		height: BUG_HEIGHT,
		color: bugArchetype.color,
		rotation: 0,
		angle : 0,
		available: true,
		opacity: 1,
		score: bugArchetype.score,
		format: "rectangle"
	};

	bugs.push(bug);
}


/*
*	Get one type of bug randomically
*/
function getBugArchetype(){
	var r = getRandomNum(0, 10);
	var bug;
	BUGS_ARCHETYPES.forEach(function (b){
		if (r >= b.probability[0] && r < b.probability[1]){
			bug = b;
		}
	});
	return bug;
}



/*
*  Return the nearest food based on x and y position
*/
function getNearestFoodFrom(bug){
	var nearestFood = foods[0];
	foods.forEach(function (food){
		var distance = getDistanceBetween(bug, food);
		if (distance < getDistanceBetween(bug, nearestFood) 
			&& food.available === true){
			nearestFood = food;
		}
	});

	return nearestFood;
}



/*
* Rotate the bug towards the nearest food
*/
function rotateBugToFood(nearestFood, bug){
	ctx.save();

	// find the angle between the nearest food and the bug
	var angle = findAngle(nearestFood.x + nearestFood.width/2,
		 				  nearestFood.y + nearestFood.height/2,
						  bug.x, bug.y);

	//set a pivot in the middle of the bug
	var pivotX = bug.x + bug.width/2;
	var pivotY = bug.y + bug.height/2;

	bug.angleDesired = angle + (90 * Math.PI/180);
	bug.angle += Math.sign(bug.angleDesired - bug.angle) * Math.PI/180;
	
	ctx.translate(pivotX, pivotY);
	ctx.rotate(bug.angle);


	ctx.restore();
}




function moveForward(bug){
	var nearestFood = getNearestFoodFrom(bug);
	
	
	var rX = (nearestFood.x + nearestFood.width/2) - (bug.x + bug.width/2);
	var rY = (nearestFood.y + nearestFood.height/2) - (bug.y + bug.height);
	// fix flickering when angle desired is next to 0
	var moveX = (parseInt(rX) === 0) ? 0 : (Math.sign((nearestFood.x + nearestFood.width/2) - (bug.x + bug.width/2)));	
	var moveY = (parseInt(rY) === 0) ? 0 : (Math.sign((nearestFood.y + nearestFood.height/2) - (bug.y + bug.height)));

	moveX *= bug.velocity/GAME_FPS;
	moveY *= bug.velocity/GAME_FPS;


	// creates a preview version of this current bug after moving
	var futureBug = {
		id: bug.id,
		velocity: bug.velocity,
		x: bug.x + moveX,
		y: bug.y + moveY,
		width: BUG_WIDTH,
		height: BUG_HEIGHT,
		format: 'rectangle'
	}

	// if it's going to collide, dont't move
	for (var i = 0; i < bugs.length; i++){			
		if (bugs[i].id === futureBug.id) continue; //if it's the same bug
		if (hasStrongCollision(futureBug, bugs[i]) === true){				
			// the bigger velocity prevails
			if (futureBug.velocity >= bugs[i].velocity) continue;

			// if it's far away frmo the food than the bug, don't move
			if (getDistanceBetween(futureBug, nearestFood) >= getDistanceBetween(bugs[i], nearestFood)){
				return;
			}
			
		}
	}
	

	// if it has to move in X and Y
	if (parseInt(moveY) !== 0 && parseInt(moveX ) !== 0){
		// walks half of it should be (to not disrespect the velocity)
		bug.y += moveY/2;
		bug.x += moveX/2;
	}else {
		// walks only in one direction (parseInt casts to 0 when it's almost 0)
		bug.y += parseInt(moveY);
		bug.x += parseInt(moveX);	
	}

}


function handleEat(bug, nearestFood){
	// if the bug is near to the center of the food
	if (isNextTo(bug.x + bug.width/2, nearestFood.x + nearestFood.width/2, nearestFood.width/3) &&
		isNextTo(bug.y + bug.height, nearestFood.y + nearestFood.height/2, nearestFood.height/3)){
		FoodGenerator.removeFood(nearestFood);
	}
}

/*
*	Rendering the bug
*/
function renderBug(bug){
	ctx.save();

	var pivotX = bug.x + bug.width/2;
	var pivotY = bug.y + bug.height/2;
	ctx.translate(pivotX, pivotY);
	ctx.rotate(bug.angle);

	if (bug.available === false){
		bug.opacity -= 0.05;
	}
	if (bug.opacity <= 0){ //if disappeared, stop drawing
		bugs = bugs.filter(function (b){
			if (b.id === bug.id &&
				b.available === false) return false;
			else return true;

		});
	}

	redrawBug(bug);
	ctx.restore();
}


/*
*	Draws bug on each game loop
*/
function redrawBug(bug){
	var pivotX = bug.x + bug.width/2;
	var pivotY = bug.y + bug.height/2;

	var path = new Path2D();
	ctx.fillStyle = "rgba(" + bug.color + ", " + bug.opacity +")";

	

	//draws the head
	path.arc(0,
			 (bug.y + bug.height) - pivotY,
			 BUG_WIDTH - 4,
			 0,
			 2 * Math.PI);

	path.ellipse(0, 0, BUG_WIDTH/2, BUG_HEIGHT - 13, 0, 0, 2 * Math.PI);
	ctx.fill(path);
	
	
	ctx.fillStyle = "rgba(" + bug.color + ", " + bug.opacity +")";
	ctx.beginPath();

	ctx.globalAlpha = bug.opacity;
	var pivotLegs = {
		x: 0,
		y: -10
	};

	// draw the legs
	for (var i = 0; i < 3; i++, pivotLegs.y += 15){
    	ctx.moveTo(pivotLegs.x, pivotLegs.y);
    	ctx.lineTo(pivotLegs.x - bug.width, pivotLegs.y - 10);
    	ctx.moveTo(pivotLegs.x - bug.width, pivotLegs.y - 10);
    	ctx.lineTo(pivotLegs.x - bug.width, pivotLegs.y - 16);

		ctx.moveTo(pivotLegs.x, pivotLegs.y);	
    	ctx.lineTo(pivotLegs.x + bug.width, pivotLegs.y - 10);   
    	ctx.moveTo(pivotLegs.x + bug.width, pivotLegs.y - 10);
    	ctx.lineTo(pivotLegs.x + bug.width, pivotLegs.y - 16);     	

	}
	

	// draw the antennas
	ctx.moveTo(0, 20);
	ctx.lineTo(10, 30)
	
	ctx.moveTo(0, 20);
	ctx.lineTo(-10, 30)

	ctx.strokeStyle = "rgba(" + bug.color + ", " + bug.opacity +")";
	ctx.stroke();
}





/***********************************
************** HELPERS *************
************************************/

function getRandomSpawnTime(){
	var times = [1000, 2000, 3000];
	return times[getRandomNum(0, 2)];
}
function getRandomNum(min, max){ return Math.floor(Math.random() * (max - min + 1)) + min; }

function getDistanceBetween(obj1, obj2){
	var distance;
	var v1 = Math.pow((obj1.x - obj2.x), 2);
	var v2 = Math.pow((obj1.y - obj2.y), 2);
	return Math.sqrt(v1 + v2, 2);
}

function findAngle(x1,y1,x2,y2){
	return Math.atan2(y2-y1, x2-x1);
}

function hasStrongCollision(obj1, obj2){
	// collision only handling rectangles
	if (obj1.format === 'rectangle' && obj2.format === 'rectangle'){
		if (obj1.x < obj2.x + obj2.width &&
	   		obj1.x + obj1.width > obj2.x &&
	   		obj1.y < obj2.y + obj2.height &&
	   		obj1.height + obj1.y > obj2.y) {
		    return true;
		}

		return false;		
	}
}

/*
* 	returns true if two values are inside a 'margin'
*/
function isNextTo(val1, val2, threshold){
	if  (((val2 >= val1 - threshold) &&
		 (val2 <= val1 + threshold)) ||

		 ((val1 >= val2 - threshold) &&
		 (val1 <= val2 + threshold)))
		{
		return true;
	}
	return false;
}