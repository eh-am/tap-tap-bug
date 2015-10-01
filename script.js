'use strict';

var GAME_WIDTH = 400;
var GAME_HEIGHT = 600;

var FOOD_WIDTH = 20;
var FOOD_HEIGHT = 20;

var game = document.getElementById("game");
var ctx = game.getContext('2d');
var foods = [];

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
	console.log("yes");
}






function getRandomNum(min, max){
	return Math.floor(Math.random() * (max - min + 1)) + min;
}


startGame();



