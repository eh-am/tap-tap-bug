

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
		velocity: 75,
		width: BUG_WIDTH,
		height: BUG_HEIGHT,
		rotation: 0,
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
		if (distance < getDistanceBetween(bug, nearestFood)){
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
}

function updateBug(bug){
	ctx.clearRect(bug.x, bug.y, bug.width, bug.height);
	ctx.clearRect(bug.x + bug.width/2, bug.y + bug.height, 2, 2);
	//console.log("updating");

	console.log("vamos ver as foods");
	console.log(foods);
	var nearestFood = getNearestFoodFrom(bug);
	// check for collision
	handleEat(bug, nearestFood);


	if (bug.x + bug.width >= GAME_WIDTH ||
		bug.y + bug.height >= GAME_HEIGHT ||
		bug.x - bug.width <= 0){
		console.log("stop walking");
		return;
	}

	// rotates or moves in x axis
	if (nearestFood.y + nearestFood.height/2 >= (bug.y + bug.height/2) &&
		nearestFood.y + nearestFood.height/2 <= (bug.y + bug.height/2)){

		//TODO: rotate

		// it doesn't need to rotate anymore
		//if (90 === Math.abs(bug.rotation)){
		if (bug.needsRotation === false){
			console.log("ja rotacionei, agora andando no x");
			// nao precisa MAIS rotacionar
			ctx.save();
			var pivotX = bug.x + bug.width/2;
			var pivotY = bug.y + bug.height/2;
			ctx.translate(pivotX, pivotY);

			ctx.rotate(bug.rotation * Math.PI/180);
			ctx.clearRect(bug.x - pivotX, bug.y - pivotY, bug.width, bug.height);
		

			ctx.fillStyle = "rgba(200, 45, 55, 1)";

			// moves the bug into the right direction
			bug.x += (Math.sign(nearestFood.x - bug.x));

			ctx.fillRect(bug.x - pivotX + 1, bug.y - pivotY,
														bug.width, bug.height);
			console.log(bug.x + " : " + bug.y);
			ctx.restore();
			return;
		} else {
			//prepareCanvas();
			//console.log("rotacionando");
			bug.needsRotation = true;
			rotateBug();	
			return;
		}
		
	}else {
		//console.log("andando no y");
		bug.y += (Math.sign(nearestFood.y - bug.y));
	}
	ctx.fillStyle = "rgba(200, 45, 55, 1)";
	ctx.fillRect(bug.x, bug.y, bug.width, bug.height);

	ctx.fillStyle = "rgba(0, 0, 0, 1)";
	ctx.fillRect(bug.x + bug.width/2, bug.y + bug.height, 2, 2);	//a black dot to show the bug's direction

	ctx.restore();


	function handleEat(bug, nearestFood){
		if (isNextTo(bug.x + bug.width/2, nearestFood.x + nearestFood.width/2, 5) &&
			isNextTo(bug.y + bug.height/2, nearestFood.y + nearestFood.height/2, 5)){
			console.log("comeu");
			FoodGenerator.removeFood(nearestFood);
		}
	}


	function rotateBug(){
		ctx.save();
		var pivotX = bug.x + bug.width/2;
		var pivotY = bug.y + bug.height/2;
		ctx.translate(pivotX, pivotY);

		ctx.clearRect(bug.x - pivotX, bug.y - pivotY, bug.width, bug.height);

		bug.rotation += (1 * Math.sign(bug.x - nearestFood.x));


		//it's almost 90 degrees!
		if (Math.abs(90 - 1) <= Math.abs(bug.rotation) &&
			Math.abs(90 + 1) >= Math.abs(bug.rotation) &&
			90 !== Math.abs(bug.rotation)
			){
			// set to 90 degrees then
			bug.rotation = 90 * Math.sign(bug.x - nearestFood.x);
			bug.needsRotation = false;
		}

		
		ctx.rotate(bug.rotation * Math.PI/180);

		ctx.fillStyle = "rgba(200, 45, 55, 1)";
		ctx.fillRect(bug.x - pivotX, bug.y - pivotY, bug.width, bug.height);
		ctx.restore();
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




