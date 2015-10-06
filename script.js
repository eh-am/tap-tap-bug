

var GAME_WIDTH = 400;
var GAME_HEIGHT = 600;
var GAME_TIME = 60;

var FOOD_WIDTH = 20;
var FOOD_HEIGHT = 20;

var BUG_WIDTH = 10;
var BUG_HEIGHT = 40;

var game = document.getElementById("game");
var ctx = game.getContext('2d');
var foods = [];
var bugs = [];


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
	
	spawnBug();

	var currentTime = GAME_TIME;
	document.getElementById("timer-content").textContent = currentTime;
	setInterval(function (){
		if (gamePaused === true) return;

		document.getElementById("timer-content").textContent = currentTime--; 
		if (currentTime === 0){
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
}

function gameOver(){
	// Todo
}

function spawnBug(){
	var bug = {
		x: getRandomNum(BUG_WIDTH/2, GAME_WIDTH - BUG_WIDTH/2),
		y: -BUG_HEIGHT/2,
		velocity: 75,
		width: BUG_WIDTH,
		height: BUG_HEIGHT,
		rotation: 0,
		needsRotation: false,
		angle : 0,
		movedY: false,
		format: "rectangle"
	};

	ctx.fillStyle = "rgba(200, 45, 55, 1)";
	ctx.fillRect(bug.x, bug.y, bug.width, bug.height);

	ctx.fillStyle = "rgba(0, 0, 0, 1)";
	ctx.fillRect(bug.x + bug.width/2, bug.y + bug.height, 2, 2);	//a black dot to show the bug's direction

	var t = 0; 
	var km = 0;
	setInterval(function (){
		updateBug(bug);
	}, 1000/bug.velocity);
	bugs.push(bug);
}

function updateBugs(){
	bugs.forEach(function (bug){
		updateBug(bug);
	});

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

	// console.log("nearest food of distance " + getDistanceBetween(bug, nearestFood));
	// 	console.log("food mais perto");
	// console.log(nearestFood);

	// shows the nearest food
	// TODO: remove
	ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
	ctx.fillRect(nearestFood.x, nearestFood.y, 5, 5);

	return nearestFood;

}

	function getDistanceBetween(obj1, obj2){
		var distance;
		var v1 = Math.pow((obj1.x - obj2.x), 2);
		var v2 = Math.pow((obj1.y - obj2.y), 2);
		distance = Math.sqrt(v1 + v2, 2);

		// console.log("bug pos " + obj1.x + " : " + obj1.y );
		// console.log("food pos " + obj2.x + " : " + obj2.y );
	//	console.log("distance " + distance);
		return distance;
	}

function rotateBugToFood(nearestFood, bug){
	ctx.save();
	
	// if (parseInt(bug.angle) === 0){
	// 	ctx.clearRect(bug.x, bug.y, bug.width, bug.height);
	// 	ctx.clearRect(bug.x + bug.width/2, bug.y + bug.height, 2, 2);	//a black dot to show the bug's direction
	// }

	var angle = findAngle(nearestFood.x + nearestFood.width/2, nearestFood.y + nearestFood.height/2, bug.x + bug.width/2, bug.y + bug.height/2);
	var pivotX = bug.x + bug.width/2;
	var pivotY = bug.y + bug.height/2;

	bug.angleDesired = (angle + 0.5 * Math.PI);
	//bug.angleDesired = (angle + Math.PI);
	//bug.angleDesired = angle * Math.PI;
	console.log("angle desired " + bug.angleDesired);
	console.log(" current angle " + bug.angle);

	bug.angle += (Math.sign(bug.angleDesired - bug.angle) * Math.PI/180);


	ctx.translate(pivotX, pivotY);
	//ctx.rotate(angle + 0.5 * Math.PI);
	ctx.rotate(bug.angle);


//	ctx.clearRect(bug.x - pivotX, bug.y - pivotY, bug.width, bug.height);
	//ctx.clearRect((bug.x + bug.width/2) - pivotX, (bug.y + bug.height) - pivotY, 2, 2);

	ctx.fillStyle = "rgba(200, 45, 55, 1)";
	ctx.fillRect(bug.x - pivotX, bug.y - pivotY, bug.width, bug.height);

	ctx.fillStyle = "rgba(0, 0, 0, 1)";
	ctx.fillRect((bug.x + bug.width/2) - pivotX, (bug.y + bug.height) - pivotY, 2, 2);

	ctx.restore();
}

	function findAngle(x1,y1,x2,y2){
		return theta = Math.atan2(y2-y1, x2-x1);
	}

function updateBug(bug){
	if (gamePaused === true) return;
	
	ctx.clearRect(0,0, GAME_WIDTH, GAME_HEIGHT);
	FoodGenerator.redraw();

	var nearestFood = getNearestFoodFrom(bug);


	// check for collision
	handleEat(bug, nearestFood);

	rotateBugToFood(nearestFood, bug);
	if (parseInt(bug.angle)  === parseInt(bug.angleDesired)){
		// if it's aligned
		moveForward();	
	}
	


	function moveForward(){

			console.log("forward new")	
			ctx.save();
			var pivotX = bug.x + bug.width/2;
			var pivotY = bug.y + bug.height/2;


			ctx.translate(pivotX, pivotY);
			ctx.rotate(bug.angle);

			ctx.clearRect(bug.x - pivotX, bug.y - pivotY, bug.width, bug.height);
			ctx.clearRect((bug.x + bug.width/2) - pivotX, (bug.y + bug.height) - pivotY, 2, 2);

			
			var moveX = (Math.sign((nearestFood.x + nearestFood.width/2) - (bug.x + bug.width/2)));					
			var moveY = (Math.sign((nearestFood.y + nearestFood.height/2) - (bug.y + bug.height/2)));

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
					bug.x += (Math.sign((nearestFood.x + nearestFood.width/2) - (bug.x + bug.width/2)));	
				}
			}
			
			// TODO
			// check if it collides with other bug

			ctx.fillStyle = "rgba(200, 45, 55, 1)";
			ctx.fillRect(bug.x - pivotX, bug.y - pivotY, bug.width, bug.height);

			ctx.fillStyle = "rgba(0, 0, 0, 1)";
			ctx.fillRect((bug.x + bug.width/2) - pivotX, (bug.y + bug.height) - pivotY, 2, 2);

			ctx.restore();
	}


	function handleEat(bug, nearestFood){
		if (isNextTo(bug.x + bug.width/2, nearestFood.x + nearestFood.width/2, nearestFood.width/2) &&
			isNextTo(bug.y + bug.height/2, nearestFood.y + nearestFood.height/2, nearestFood.height/2)){
			console.log("comeu");
			FoodGenerator.removeFood(nearestFood);
		}
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



function getRandomNum(min, max){
	return Math.floor(Math.random() * (max - min + 1)) + min;
}


startGame();




