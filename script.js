

var GAME_WIDTH = 400;
var GAME_HEIGHT = 600;
var GAME_TIME = 60;
var GAME_FPS = 70;
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
	{color: "230, 126, 34", velocity: [60, 80], score: 1, probability: [6, 11]} //orange
];

var gamePaused = false;

var startButton = document.getElementById("startGameButton");
startButton.addEventListener("click", function (e){
	e.preventDefault();

	startGame();
});

function getSelectedLevel(){



	var selectedValue = document.startPageForm['level'].value;
	return selectedValue;
}

function updateScore(score){
	gameScore += score;
	document.getElementById("score-content").textContent = gameScore;
}



function startGame(){
	document.getElementById("game-wrapper").className = "";
	var selectedLevel = getSelectedLevel();
	document.getElementById("start-page").className = "hide";

	ctx.canvas.width = GAME_WIDTH;
	ctx.canvas.height = GAME_HEIGHT;

	ctx.fillStyle = "rgba(255, 255, 230, 0.5)";
	ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
	

	console.log(FoodGenerator);
	FoodGenerator.generate();
	//spawnInitialFood();
	
	//spawnBug();
	setTimeout(spawnBug, getRandomSpawnTime());

	var currentTime = GAME_TIME;
	document.getElementById("timer-content").textContent = currentTime;
	setInterval(function (){
		if (gamePaused === true) return;

		document.getElementById("timer-content").textContent = currentTime--; 
		if (currentTime <= 0 || foods.length <= 0){
			gameOver();
		}
	}, 1000);

	document.getElementById("pause-play").addEventListener("click", function(){
		if (gamePaused === false){
			document.getElementById("pause-play").innerHTML = "&#9658;";
			gamePaused = true;
		} else {
			document.getElementById("pause-play").innerHTML = "&#10074;&#10074;";
			gamePaused = false;
		}

	});

	setInterval(gameLoop, 1000/GAME_FPS);
	document.addEventListener("click", handleKillClick);
}

/*
*	Handle when the user clicks to kill a bug
*/
function handleKillClick(e){
	console.log("cliquei");
	if (gamePaused === true) return;
	var canvas = document.getElementById("game");
  	var d;
	
	bugs.forEach(function (bug){
		d = getDistanceBetween({ x: e.x - canvas.offsetLeft, y: e.y - canvas.offsetTop}, bug);
		if (d <= 30){
			killBug(bug);
		}
	});
}

function killBug(bug){
	// TODO
	// updates scores
	updateScore(bug.score);
	bug.available = false;

}

function gameOver(){
	// Todo
	gamePaused = true;
}

function gameLoop(){
	if (gamePaused === true) return;
	ctx.clearRect(0,0, GAME_WIDTH, GAME_HEIGHT);
	FoodGenerator.redraw();


	bugs.forEach(function (bug){
		updateBug(bug); // update bug position
		renderBug(bug); // redraw bug
	});
	if (foods.length <= 0) gameOver();
}

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
function spawnBug(){
	setTimeout(spawnBug, getRandomSpawnTime());
	if (gamePaused === true){
		return;
	}

	var bugArchetype = getBugArchetype();
	console.log(bugArchetype);

	var bug = {
		id: bugs.length,
		x: getRandomNum(BUG_WIDTH/2, GAME_WIDTH - BUG_WIDTH/2),
		y: -BUG_HEIGHT,
		velocity: bugArchetype.velocity[getSelectedLevel()],
		width: BUG_WIDTH,
		height: BUG_HEIGHT,
		color: bugArchetype.color,
		rotation: 0,
		angle : 0,
		movedY: false,
		available: true,
		opacity: 1,
		score: bugArchetype.score,
		format: "rectangle"
	};

	ctx.fillStyle = "rgba(" + bug.color + "," + bug.opacity + ")";
	ctx.fillRect(bug.x, bug.y, bug.width, bug.height);

	ctx.fillStyle = "rgba(0, 0, 0, 1)";
	ctx.fillRect(bug.x + bug.width/2, bug.y + bug.height, 2, 2);	//a black dot to show the bug's direction

	bugs.push(bug);
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

	function getDistanceBetween(obj1, obj2){
		var distance;
		var v1 = Math.pow((obj1.x - obj2.x), 2);
		var v2 = Math.pow((obj1.y - obj2.y), 2);
		return Math.sqrt(v1 + v2, 2);
	}

function rotateBugToFood(nearestFood, bug){
	ctx.save();


	// find the angle between the nearest food and the bug
	var angle = findAngle(nearestFood.x + nearestFood.width/2,
		 				  nearestFood.y + nearestFood.height/2,
						  bug.x, bug.y);

	//set a pivot in the middle of the bug
	var pivotX = bug.x + bug.width/2;
	var pivotY = bug.y + bug.height/2;


	bug.angleDesired = (angle + 0.5 * Math.PI);	
	bug.angle += (Math.sign(bug.angleDesired - bug.angle) * Math.PI/180);


	ctx.translate(pivotX, pivotY);
	ctx.rotate(bug.angle);


	// draw the bug
	ctx.fillStyle = "rgba(" + bug.color + "," + bug.opacity + ")";
	ctx.fillRect(bug.x - pivotX, bug.y - pivotY, bug.width, bug.height);

	ctx.fillStyle = "rgba(0, 0, 0, 1)";
	ctx.fillRect((bug.x + bug.width/2) - pivotX, (bug.y + bug.height) - pivotY, 2, 2);

	ctx.restore();
}

	function findAngle(x1,y1,x2,y2){
		return Math.atan2(y2-y1, x2-x1);
	}

function updateBug(bug){
	var nearestFood = getNearestFoodFrom(bug);
	if (nearestFood === undefined) {
		gameOver();
		return ;
	}

	if (bug.available === false){
		return;
	}
	// check for collision
	handleEat(bug, nearestFood);

	rotateBugToFood(nearestFood, bug);


	// if it's aligned
	if (parseInt(bug.angle) === parseInt(bug.angleDesired)){
		moveForward();	
	}
	

	function moveForward(){
		console.log("forward new")	
	

		var nearestFood = getNearestFoodFrom(bug);
		
		var moveX = (Math.sign((nearestFood.x + nearestFood.width/2) - (bug.x + bug.width/2)));					
		var moveY = (Math.sign((nearestFood.y + nearestFood.height/2) - (bug.y + bug.height)));

		moveX *= bug.velocity/GAME_FPS;
		moveY *= bug.velocity/GAME_FPS;

		var futureBug = {
			id: bug.id,
			velocity: bug.velocity,
			x: bug.x + moveX*2,
			y: bug.y + moveY*2,
			width: BUG_WIDTH,
			height: BUG_HEIGHT,
			format: 'rectangle'
		}

		// if it's going to collide, dont't move
		for (var i = 0; i < bugs.length; i++){			
			if (bugs[i].id === futureBug.id) continue; //if it's the same bug
			if (hasStrongCollision(futureBug, bugs[i]) === true){
				// if it's next to the food than the other bug, continue
				if (futureBug.velocity > bugs[i].velocity) continue;

				if (getDistanceBetween(futureBug, nearestFood) >= getDistanceBetween(bugs[i], nearestFood)){
					return;
				}
				
			}
		}
		
		// TODO
		// check if it collides with other bug

		// alternates movement between X and Y
		if (bug.movedY === true){ 
			if (parseInt(moveX) !== 0){ //if it's X turn and it has something to do
				bug.x += moveX;
				bug.movedY = false;
			}else{ // it's x turn but it's already aligned on x
				bug.y += moveY;
			}
		}else{
			if (parseInt(moveY) !== 0){
				bug.y += moveY;
				bug.movedY = true;
			}else{ //se nao precisa andar em y
				bug.x += moveX;
			}
		}



		// draw bug
		//redrawBug();


	}


	function handleEat(bug, nearestFood){
		// if the bug is near to the center of the food
		if (isNextTo(bug.x + bug.width/2, nearestFood.x + nearestFood.width/2, nearestFood.width/3) &&
			isNextTo(bug.y + bug.height, nearestFood.y + nearestFood.height/2, nearestFood.height/3)){
			FoodGenerator.removeFood(nearestFood);
		}
	}
}

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

		redrawBug();
		ctx.restore();



		function redrawBug(){
			ctx.fillStyle = "rgba(" + bug.color + ", " + bug.opacity +")";
			ctx.fillRect(bug.x - pivotX, bug.y - pivotY, bug.width, bug.height);

			ctx.fillStyle = "rgba(0, 0, 0, 1)";
			ctx.fillRect((bug.x + bug.width/2) - pivotX, (bug.y + bug.height) - pivotY, 2, 2);
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

function hasStrongCollision(obj1, obj2){
	// TODO
	// collision only handling rectangles for now
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


function getRandomSpawnTime(){
	var times = [1000, 2000, 3000];
	return times[getRandomNum(0, 2)];
}
function getRandomNum(min, max){
	return Math.floor(Math.random() * (max - min + 1)) + min;
}


startGame();




