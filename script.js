//jshint esnext:true

document.addEventListener('DOMContentLoaded', function () {
var buttonDisable = false;
var activationId = -1;
var strictMode = false;
var fourFingerMode = true;
var lastNote = null;
var lastSound = null;
var lastKeyPressed = null;
var start = false;
var freePlayMode = true; 
var cpuSequenceArray = [];
var playerSequenceArray = [];
var notesArray = [
	{id: "leftButton", colors:{button:{red:73 , green:193 , blue:254 }, outline:{red:59 , green:138 , blue:254 }, highlight:{red:220 , green:232 , blue:254 }}},
	{id: "rightButton", colors:{button:{red:109 , green:60 , blue:26 }, outline:{red:102 , green:51 , blue:0 }, highlight:{red:233 , green:227 , blue:178 }}},
	{id: "upButton", colors:{button:{red:77 , green:255 , blue:77 }, outline:{red:47 , green:218 , blue:1 }, highlight:{red:227 , green:237 , blue:209 }}},
	{id: "downButton", colors:{button:{red:223 , green:51 , blue:141 }, outline:{red:200 , green:3 , blue:183 }, highlight:{red:234 , green:172 , blue:201 }}},
	{id: "aButton", colors:{button:{red:209 , green:63 , blue:10 }, outline:{red:158 , green:27 , blue:15 }, highlight:{red:238 , green:220 , blue:187 }}}
	]


////////////////////////////////Pattern selector functions start//////////////////////////////////////////

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function generateSequence(){
	var xFingeredOcorina = fourFingerMode? 4 : 5;
	cpuSequenceArray.push(getRandomInt(xFingeredOcorina));
	updateHeartCount(cpuSequenceArray.length, "#ff0000"); 
	playSequence();
return
}

//speed up the tempo on the 5th 9th and thirteenth steps
function playSequence(){
	let tempo = [1200, 1000, 800, 600, 400]; 
	let time = 0;
	let count = 0;
	if(cpuSequenceArray.length >= 4 && cpuSequenceArray <= 7){
		time = 1;
	} else if(cpuSequenceArray.length >= 8 && cpuSequenceArray <= 11){
		time = 2
	} else if(cpuSequenceArray.length >= 12){
		time = 3;
	}

	var playSequenceIntervalId = setInterval( function(){
			if(count >= cpuSequenceArray.length){
				clearInterval(playSequenceIntervalId);
			}else{
				calculateColorChange(cpuSequenceArray[count], true);
				playNote(cpuSequenceArray[count]);
				setTimeout(calculateColorChange(cpuSequenceArray[count], false), tempo[time]/2);
				count++
			}
	}, tempo[time]);
return
}

////////////////////////////////Pattern selector functions stop//////////////////////////////////////////

function updateHeartCount(num, color){
	for(i = 0; i < num; i++){
		let targetHeart = "#heart"+(i+1)
		$(targetHeart).css("fill", color);
	}
}

function updateHeartCountRestart(num, stopAt){
//cpuSequenceArray.length, "none"
	var count = num;
	var heartDrainIntervalId = setInterval(()=>{
		if(count <= stopAt){
			clearInterval(heartDrainIntervalId);
		} else if(count > stopAt){
			let targetHeart = "#heart"+(count)
		$(targetHeart).css("fill", "none");
		play("#loseHeart");
		count--;
		}
	},450);
}

//called by handleClick
function calculateColorChange(note, changeToAlternateColor){
	var originalColor = notesArray[note].id === "aButton"? {
			button:{red:138, green:94, blue: 197}, 
			outline:{red:104, green:45, blue:197}, 
			highlight:{red:238, green:197, blue:233}
		} : { 
			button: {red:255, green:205, blue:0}, 
			outline:{red:255, green:158, blue:1}, 
			highlight: {red:255, green:238, blue:169}
		};
	var alternateColor = {
		button:{red:notesArray[note].colors.button.red, green:notesArray[note].colors.button.green, blue:notesArray[note].colors.button.blue}, 
		outline:{red:notesArray[note].colors.outline.red, green:notesArray[note].colors.outline.green, blue:notesArray[note].colors.outline.blue}, 
		highlight:{red:notesArray[note].colors.highlight.red, green:notesArray[note].colors.highlight.green, blue:notesArray[note].colors.highlight.blue}
	}	
	/*Subtracts the new colors from the original colors to find the differences between them 
	and then devides the results by 25 to find the increment that will be used to change the colors*/
	var increment = changeToAlternateColor? {
		button:{
			red: (originalColor.button.red-notesArray[note].colors.button.red)/25, 
			green: (originalColor.button.green-notesArray[note].colors.button.green)/25, 
			blue: (originalColor.button.blue-notesArray[note].colors.button.blue)/25
		}, 
		outline:{
			red: (originalColor.outline.red-notesArray[note].colors.outline.red)/25, 
			green: (originalColor.outline.green-notesArray[note].colors.outline.green)/25, 
			blue: (originalColor.outline.blue-notesArray[note].colors.outline.blue)/25
		}, 
		highlight:{
			red: (originalColor.highlight.red-notesArray[note].colors.highlight.red)/25, 
			green: (originalColor.highlight.green-notesArray[note].colors.highlight.green)/25, 
			blue: (originalColor.highlight.blue-notesArray[note].colors.highlight.blue)/25
		}
	} : {
		button:{
			red: (notesArray[note].colors.button.red-originalColor.button.red)/25, 
			green: (notesArray[note].colors.button.green-originalColor.button.green)/25, 
			blue: (notesArray[note].colors.button.blue-originalColor.button.blue)/25
		}, 
		outline:{
			red: (notesArray[note].colors.outline.red-originalColor.outline.red)/25, 
			green: (notesArray[note].colors.outline.green-originalColor.outline.green)/25, 
			blue: (notesArray[note].colors.outline.blue-originalColor.outline.blue)/25
		}, 
		highlight:{
			red: (notesArray[note].colors.highlight.red-originalColor.highlight.red)/25, 
			green: (notesArray[note].colors.highlight.green-originalColor.highlight.green)/25, 
			blue: (notesArray[note].colors.highlight.blue-originalColor.highlight.blue)/25
		}
	};
	var startingColor = changeToAlternateColor? originalColor : alternateColor;
	changeColors(notesArray[note].id, startingColor, increment);
	}

//called by handle color change
function changeColors(buttonId, startingColor, increment){
	var count = 0;
	var buttonFillColor = startingColor.button;
	var highlightFillColor = startingColor.highlight;
	var outlineStrokeColor = startingColor.outline;
	//console.log("buttonFillColor is: ",Math.round(buttonFillColor.red + increment.button.red, 0));
	var intervalId = setInterval( function(){
		//console.log("count is: "+count+" buttonFillColor is: red:"+buttonFillColor.red+" , green:"+buttonFillColor.green+" , blue:"+buttonFillColor.blue);
		if(count>25){
			clearInterval(intervalId);
		}
		if(count <= 25){
		buttonFillColor.red = Math.round(buttonFillColor.red - increment.button.red, 0);
		buttonFillColor.green = Math.round(buttonFillColor.green - increment.button.green, 0);
		buttonFillColor.blue = Math.round(buttonFillColor.blue - increment.button.blue, 0);
		highlightFillColor.red =  Math.round(highlightFillColor.red - increment.highlight.red, 0);
		highlightFillColor.green = Math.round(highlightFillColor.green - increment.highlight.green, 0);
		highlightFillColor.blue = Math.round(highlightFillColor.blue - increment.highlight.blue, 0);
		outlineStrokeColor.red = Math.round(outlineStrokeColor.red - increment.outline.red, 0);
		outlineStrokeColor.green = Math.round(outlineStrokeColor.green - increment.outline.green, 0);
		outlineStrokeColor.blue = Math.round(outlineStrokeColor.blue - increment.outline.blue, 0);
		$("#"+buttonId).css("fill", "rgb("+buttonFillColor.red+", "+buttonFillColor.green+", "+buttonFillColor.blue+")");
		$("#"+buttonId+"Highlight").css("fill", "rgb("+highlightFillColor.red+", "+highlightFillColor.green+", "+highlightFillColor.blue+")");
		$("#"+buttonId+"Outline").css("stroke", "rgb("+outlineStrokeColor.red+", "+outlineStrokeColor.green+", "+outlineStrokeColor.blue+")");
		}
	count++;

	},15);
	buttonDisable = false;
}

//called by handleClick
function playNote(note){
	var noteId = "#"+notesArray[note].id.slice(0,notesArray[note].id.length-6)+"Note";
	//console.log("lastNote is "+lastNote);
	if(lastNote !== null){
		$(lastNote)[0].load();
	}
	$(noteId)[0].play();
	return lastNote = noteId;
}


////////////////////////////////Menu Button functions start//////////////////////////////////////////
function startGame(){
	if(start){
		play("#buttonError");
		return
	}
	freePlayMode = false;
	start = true;
	play("#startUp");
	updateHeartCount(cpuSequenceArray.length, "none");
	setTimeout(()=>{generateSequence()},1000);
}

function restartGame(){
	let timer = cpuSequenceArray.length*450;
	$("#message").html("");
	if(!start){
		updateHeartCountRestart(cpuSequenceArray.length, 0);
		return
	} else{
		updateHeartCountRestart(cpuSequenceArray.length, 1);
	}
	playerSequenceArray = [];
	cpuSequenceArray = [];
	setTimeout(()=>{generateSequence()},timer);
}

function toggleStrictMode(){
	strictMode = strictMode? false : true;
	if(strictMode){
		$("#strictMode").html("Strict Mode On")
		play("#select");
	} else{
		$("#strictMode").html("Strict Mode Off")
		play("#unselect");
	}
}

function togglefingerMode(){
	fourFingerMode = fourFingerMode? false: true;
	if(fourFingerMode){
		$("#xFingers").html("4 Fingers");
		play("#unselect");
	} else{
		$("#xFingers").html("5 Fingers");
		play("#select");
	}
}

function toggleFreePlay(){
	if(start){
		start = false;
	}
	if(freePlayMode){
		play("#buttonError");
		return
	} else{
		freePlayMode = true;
		play("#startUp");
		setTimeout(()=>{restartGame()}, 1200);
	}
}

////////////////////////////////Menu Button functions stop//////////////////////////////////////////
//plays sounds of elements passed in by ID name stops the last sound if it is still playing before starting the next sound
function play(sound){
	if(lastSound !== null){
		$(lastSound)[0].load();
	}
	$(sound)[0].play();
	return lastSound = sound;
}

function sequenceError(){
	if(strictMode){
		play("#noteError");
		setTimeout(()=>{play("#gameOver")},500);
		setTimeout(()=>{play("#laugh")},2500);
		setTimeout(()=>{restartGame()},4000);;
	} else {
		playerSequenceArray = [];
		play("#noteError");
		setTimeout(()=>{play("#hey")},500);
		setTimeout(()=>{play("#listen")},1000);
		setTimeout(()=>{playSequence()},1200);
	}
}

function giveNextStep(){
	console.log(notesArray[cpuSequenceArray[playerSequenceArray.length]].id);
	return;
}

function victory(){
	$("#message").html("Congratulations you win!!");
	play("#win1");
	setTimeout(()=>{play("#win2")},2500);
}

function updateAndCheckPlayerSequenceArray(note){
	playerSequenceArray.push(note)

	for(i = 0; i < playerSequenceArray.length; i++){
		if(playerSequenceArray[i] !== cpuSequenceArray[i]){
			sequenceError();
			break;
		}
	}
	if(playerSequenceArray.length === cpuSequenceArray.length){
		if(cpuSequenceArray.length === 20){
			victory();
			return;
		}
		play("#songCorrect");
		playerSequenceArray = [];
		setTimeout(()=>{generateSequence()},500);
		//return;
	}
	giveNextStep()
	return
} 


function handleClick(note){

	if(buttonDisable === true){
		console.log("buttonDisable is: "+buttonDisable);
		return
	} else{
		buttonDisable = true;
		//console.log("clicked ", $("#leftButton").fill);
		if(start){
			updateAndCheckPlayerSequenceArray(note);
		}
	calculateColorChange(note, true);
	playNote(note);
	}
}


function handleRelease(note){
	buttonDisable = false;
	calculateColorChange(note, false);
}

//click and release handlers arguments are the position of the notes in the notesArray
handleLeftClick = (()=>{
	handleClick(0);
});

handleLeftRelease = (()=>{
	handleRelease(0);
});

handleRightClick = (()=>{
	handleClick(1);
});

handleRightRelease = (()=>{
	handleRelease(1);
});

handleUpClick = (()=>{
	handleClick(2);
});

handleUpRelease = (()=>{
	handleRelease(2);
});

handleDownClick = (()=>{
	handleClick(3);
});

handleDownRelease = (()=>{
	handleRelease(3);
});

handleAClick = (()=>{
	handleClick(4);
});

handleARelease = (()=>{
	handleRelease(4);
});

//listens for key presses and maps arrows and a to keys to the proper functions
document.addEventListener("keydown", function(event) {
	if(event.which !== lastKeyPressed){ //checks to see if the same key is being repeated without being released
		lastKeyPressed = event.which; //if a new key is pressed it is  saved to the lastKeypressed variable
		if(event.which === 37 || event.which === 100){
			handleLeftClick();
		}else if(event.which === 39 || event.which === 102){
	  		handleRightClick();
		}else if(event.which === 38 || event.which === 104){
	  		handleUpClick();
		}else if(event.which === 40 || event.which === 98){
	  		handleDownClick();
		}else if(event.which === 65 || event.which === 101){
	  		handleAClick();
		}
	}
});

//listens for key releases and maps arrows and a to keys to the proper functions
document.addEventListener("keyup", function(event) {
	lastKeyPressed = null; //notes that a key was released and clears the lastkeyPressed so that keydown can accept a repeat key.
	if(event.which === 37 || event.which === 100){
	  	handleLeftRelease();
	}else if(event.which === 39 || event.which === 102){
	  		handleRightRelease();
	}else if(event.which === 38 || event.which === 104){
	  		handleUpRelease();
	}else if(event.which === 40 || event.which === 98){
	  		handleDownRelease();
	}else if(event.which === 65 || event.which === 101){
	  		handleARelease();
	}
});

//Left Arrow event listeners
$("#leftButton").on('mousedown', handleLeftClick);
$("#leftButtonArrow").on('mousedown', handleLeftClick);
$("#leftButtonHighlight").on('mousedown', handleLeftClick);
$("#leftButton").on('mouseup', handleLeftRelease);
$("#leftButtonArrow").on('mouseup', handleLeftRelease);
$("#leftButtonHighlight").on('mouseup', handleLeftRelease);
//Right Arrow event listeners
$("#rightButton").on('mousedown', handleRightClick);
$("#rightButtonArrow").on('mousedown', handleRightClick);
$("#rightButtonHighlight").on('mousedown', handleRightClick);
$("#rightButton").on('mouseup', handleRightRelease);
$("#rightButtonArrow").on('mouseup', handleRightRelease);
$("#rightButtonHighlight").on('mouseup', handleRightRelease);
//Up Arrow event listeners
$("#upButton").on('mousedown', handleUpClick);
$("#upButtonArrow").on('mousedown', handleUpClick);
$("#upButtonHighlight").on('mousedown', handleUpClick);
$("#upButton").on('mouseup', handleUpRelease);
$("#upButtonArrow").on('mouseup', handleUpRelease);
$("#upButtonHighlight").on('mouseup', handleUpRelease);
//Down Arrow event listeners
$("#downButton").on('mousedown', handleDownClick);
$("#downButtonArrow").on('mousedown', handleDownClick);
$("#downButtonHighlight").on('mousedown', handleDownClick);
$("#downButton").on('mouseup', handleDownRelease);
$("#downButtonArrow").on('mouseup', handleDownRelease);
$("#downButtonHighlight").on('mouseup', handleDownRelease);
//A button event Listeners
$("#aButton").on('mousedown', handleAClick);
$("#aButtonText").on('mousedown', handleAClick);
$("#aButtonHighlight").on('mousedown', handleAClick);
$("#aButton").on('mouseup', handleARelease);
$("#aButtonText").on('mouseup', handleARelease);
$("#aButtonHighlight").on('mouseup', handleARelease);
//Start button
$("#start").on('click', startGame);
//Restart button
$("#restart").on('click', restartGame);
//Strict mode toggle button
$("#strictMode").on('click', toggleStrictMode);
// four finger five finger toggle
$("#xFingers").on('click', togglefingerMode);
// Turns freePlayMode mode on and start off
$("#freePlayMode").on('click', toggleFreePlay);


function test(){
	sequenceError()
}

//Test button
$('#testButton').on('click', victory);


});