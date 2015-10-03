

var GAME_WIDTH = 400;
var GAME_HEIGHT = 600;

var FOOD_WIDTH = 20;
var FOOD_HEIGHT = 20;

var BUG_WIDTH = 10;
var BUG_HEIGHT = 40;

var game = document.getElementById("game");
var ctx = game.getContext('2d');
var foods = [];
var bugs = [];

var startButton = document.getElementById("startGameButton");
startButton.addEventListener("click", function (e){
	e.preventDefault();
	console.log("started");
	//startGame();
});




function startGame(){
	ctx.canvas.width = GAME_WIDTH;
	ctx.canvas.height = GAME_HEIGHT;

	ctx.fillStyle = "rgba(255, 255, 230, 0.5)";
	ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
	

	console.log(FoodGenerator);
	FoodGenerator.generate();
	//spawnInitialFood();
	
	spawnBug();

}

function spawnBug(){
	var bug = {
		x: getRandomNum(BUG_WIDTH/2, GAME_WIDTH - BUG_WIDTH/2),
		y: -BUG_HEIGHT/2,
		velocity: 6,
		width: BUG_WIDTH,
		height: BUG_HEIGHT,
		rotation: 0,
		format: "rectangle"
	};

	ctx.fillStyle = "rgba(200, 45, 55, 1)";
	ctx.fillRect(bug.x, bug.y, bug.width, bug.height);

	ctx.fillStyle = "rgba(0, 0, 0, 1)";
	ctx.fillRect(bug.x + bug.width/2, bug.y + bug.height, 2, 2);	//a black dot to show the bug's direction

	setInterval(function (){
		updateBug(bug);
	}, 100);
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
		if (distance < getDistanceBetween(bug, nearestFood)){
			nearestFood = food;
		}
	});

	console.log("nearest food of distance " + getDistanceBetween(bug, nearestFood));
		console.log("food mais perto");
	console.log(nearestFood);

	// shows the nearest food
	// TODO: remove
	ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
	ctx.fillRect(nearestFood.x, nearestFood.y, 5, 5);

	return nearestFood;

	function getDistanceBetween(obj1, obj2){
		var distance;
		var v1 = Math.pow((obj1.x - obj2.x), 2);
		var v2 = Math.pow((obj1.y - obj2.y), 2);
		distance = Math.sqrt(v1 + v2, 2);

		// console.log("bug pos " + obj1.x + " : " + obj1.y );
		// console.log("food pos " + obj2.x + " : " + obj2.y );
		console.log("distance " + distance);
		return distance;
	}
}

function updateBug(bug){
	ctx.clearRect(bug.x, bug.y, bug.width, bug.height);
	ctx.clearRect(bug.x + bug.width/2, bug.y + bug.height, 2, 2);
	console.log("updating");

	var nearestFood = getNearestFoodFrom(bug);

	if (bug.x + bug.width >= GAME_WIDTH ||
		bug.y + bug.height >= GAME_HEIGHT ||
		bug.x - bug.width <= 0){
		console.log("stop walking");
		return;
	}

	// rotates or moves in x axis
	if (nearestFood.y + nearestFood.height >= bug.y &&
		nearestFood.y + nearestFood.height <= bug.y + bug.height){

		//TODO: rotate

		// it doesn't need to rotate anymore
		if (90 === Math.abs(bug.rotation)){

			// nao precisa MAIS rotacionar
			ctx.save();
			var pivotX = bug.x + bug.width/2;
			var pivotY = bug.y + bug.height/2;
			ctx.translate(pivotX, pivotY);

			ctx.clearRect(bug.x - pivotX, bug.y - pivotY, bug.width, bug.height);
			ctx.rotate(bug.rotation * Math.PI/180);

			ctx.fillStyle = "rgba(200, 45, 55, 1)";

			// moves the bug into the right direction
			bug.x += (bug.velocity * Math.sign(nearestFood.x - bug.x));

			ctx.fillRect(bug.x - pivotX + bug.velocity, bug.y - pivotY,
														bug.width, bug.height);
			ctx.restore();
				return;
		} else {
			rotateBug();	
			return;
		}
		
	}else {
		bug.y += bug.velocity;
	}


	function rotateBug(){
		ctx.save();
		var pivotX = bug.x + bug.width/2;
		var pivotY = bug.y + bug.height/2;

		ctx.translate(pivotX, pivotY);
		ctx.clearRect(bug.x - pivotX, bug.y - pivotY, bug.width, bug.height);

		bug.rotation += (bug.velocity * Math.sign(bug.x - nearestFood.x));


		//it's almost 90 degrees!
		if ((90 - bug.velocity) <= Math.abs(bug.rotation) &&
			(90 + bug.velocity) >= Math.abs(bug.rotation) &&
			90 !== Math.abs(bug.rotation)
			){
			// set to 90 degrees then
			bug.rotation = 90 * Math.sign(bug.x - nearestFood.x);
		}

		

		ctx.rotate(bug.rotation * Math.PI/180);

		ctx.fillStyle = "rgba(200, 45, 55, 1)";
		ctx.fillRect(bug.x - pivotX, bug.y - pivotY, bug.width, bug.height);
		ctx.restore();
	}


	ctx.fillStyle = "rgba(200, 45, 55, 1)";
	ctx.fillRect(bug.x, bug.y, bug.width, bug.height);

	ctx.fillStyle = "rgba(0, 0, 0, 1)";
	ctx.fillRect(bug.x + bug.width/2, bug.y + bug.height, 2, 2);	//a black dot to show the bug's direction

	ctx.restore();
}



function getRandomNum(min, max){
	return Math.floor(Math.random() * (max - min + 1)) + min;
}


startGame();



