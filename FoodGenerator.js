
var FoodGenerator = (function (){
	function spawnInitialFood(){
		for (var i = 0; i < 5; i++) drawFood();
	}
	function redraw(){
		foods.forEach(function (food){
			ctx.fillStyle = "rgba(100, 100, 200, " + food.opacity + ")";			
			ctx.fillRect(food.x, food.y, FOOD_WIDTH, FOOD_HEIGHT);
			if (food.available === false) food.opacity -= 0.05;

			if (food.opacity <= 0){ //if disappeared, stop drawing
				foods = foods.filter(function (f){
				if (f.id !== food.id) return true;
					else return false;
				});
			}
		});
	}
	function drawFood(){
		var newFood = generateFoodPosition();

		foods.push(newFood);
		ctx.fillStyle = "rgba(100, 100, 200, 0.5)";
		ctx.fillRect(newFood.x, newFood.y, FOOD_WIDTH, FOOD_HEIGHT);
	}

	function generateFoodPosition(){
		function generate(){
			var food = {
				id: foods.length,
				width: FOOD_WIDTH,
				height: FOOD_HEIGHT,
				opacity: 1,
				available: true
			};

			food.x = getRandomNum(FOOD_WIDTH, GAME_WIDTH - FOOD_WIDTH);
			food.y = getRandomNum(GAME_HEIGHT * 0.2, GAME_HEIGHT - FOOD_HEIGHT);

			food.format = 'rectangle';

			return food;	
		}
		
		var newFood;
		
		do {
			newFood = generate();
		} while (hasFoodOverlap(newFood));
		
		return newFood;
	}
	function hasFoodOverlap(newFood){
		var hasOverlap = false;
		for (var i = 0; i < foods.length; i++){
			if (hasFoodCollision(newFood, foods[i])) hasOverlap = true;
		}
		return hasOverlap;
	}

	function removeFood(food){
		//TODO
		console.log("removendo comida ");
		food.available = false;
		//ctx.clearRect(food.x, food.y, FOOD_WIDTH, FOOD_HEIGHT);
	}

	function hasFoodCollision(obj1, obj2){
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

	return {
		generate : spawnInitialFood,
		removeFood : removeFood,
		redraw : redraw,
	};

})();
