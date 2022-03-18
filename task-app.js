function TaskApp(options) {

	"use strict";

	
    // var options = options || {};

	// Init variables
	var taskSet 	= options.tasks || {};
	var taskTypes 	= options.types || {};
	var loadingBG 	= options.bg || null;
	var taskMode 	= options.mode || 'main'; // 'quiz'
	var themePath 	= options.path || mishkaData.root_url + "/wp-content/themes/fluida-child"; // 'quiz'
	var taskTeaserWindowStr 	= options.teaserWin || ".task-section"; // 'quiz'
	// var taskModeBit 	= taskMode === 'main' ? 1 : 0;

	// Sounds
	var soundsPath = mishkaData.root_url + "/wp-content/uploads/task/sounds/";
	var correctSound = new Audio(soundsPath+"correct.mp3");
	var wrongSound = new Audio(soundsPath+"wrong.mp3");
	var helpSound = new Audio(soundsPath+"help.mp3");

	// Global settings
	// var userScreenWidth = document.documentElement.clientWidth || document.body.clientWidth;
	// var mobileDevice = (userScreenWidth < 800) ? 1 : 0;


	// State varables
	var currentTask = 0; // current task on user's screen
	var state = 'waitAnswer'; // state of the app
	// Available states :
	// 'waitAnswer' 
	// 'wrongAnswer' 
	// 'correctAnswer' 
	// 'notAvailable' 

	// Scores varables
	var scores = 0;
	// var scoreIcon = '<i class="blicon-diamond"></i>';
	var scoreIcon = "<svg class='task-icon'><use xlink:href='"+ themePath +"/resources/img/sprite1.svg?v=1.7#raspberry'></use></svg>";

	//--------------------------------------------------
	// init and set workspace

	var appBg =  createElement({				
		classes: 	["task-app-bg"]				
	});
	
	body.appendChild(appBg);

	var workspace =  createElement({				
		classes: 	["task-app-workspace"]				
	});

	appBg.appendChild(workspace);
	appBg.insertAdjacentHTML('beforeend','<div class="circle1"></div>');
	appBg.insertAdjacentHTML('beforeend','<div class="circle2"></div>');

	var topbar =  createElement({				
		classes: 	["task-topbar"]				
	});
	var mainPanel =  createElement({				
		classes: 	["task-main-panel"]				
	});
	// var desktopHeight = (appBg.clientHeight > 800 * 0.98 - 110) ? 800 * 0.98 - 110 : appBg.clientHeight - 40;
	// mainPanel.style.height = (appBg.clientHeight < 800) ? appBg.clientHeight : desktopHeight + 'px';
	mainPanel.style.height = ((appBg.clientHeight < 800) ? appBg.clientHeight : appBg.clientHeight - 400) + 'px';
	
	
	var cntrlBar =  createElement({				
		classes: 	["task-cntrl-bar"]				
	});

	var helpPanel =  createElement({				
		classes: 	["help-panel"]				
	});
	helpPanel.innerHTML = '<div class="help-text"></div><div class="close-help"><div class="mdiv"><div class="md"></div></div></div>';
	var closeHelpBtn = helpPanel.querySelector(".close-help");
	cntrlBar.appendChild(helpPanel);

	workspace.appendChild(topbar);
	workspace.appendChild(mainPanel);
	workspace.appendChild(cntrlBar);

	//--------------------------------------------------
	// init control panel buttons

	// main center button
	var buttonMain = createElement({				
		classes: 	["main-button"]				
	});	
	cntrlBar.appendChild(buttonMain);

	// next nav button
	var buttonNext = createElement({				
		classes: 	["next-button"]				
	});	
	buttonNext.innerHTML = '<i></i>'
	cntrlBar.appendChild(buttonNext);

	// next nav button
	var buttonHelp = createElement({				
		classes: 	["help-button"]				
	});	
	buttonHelp.innerHTML = '<i class="fa fa-question" aria-hidden="true"></i>'
	cntrlBar.appendChild(buttonHelp);
	

	//--------------------------------------------------
	// init topbar buttons

	// Progress bar
	var progressPanel = createElement({				
		classes: 	["progress-panel"]				
	});	
	topbar.appendChild(progressPanel);

	// Exit button
	var exitButton = createElement({				
		classes: 	["exit-button"]				
	});	
	exitButton.innerHTML = '<div class="mdiv"><div class="md"></div></div>';
	topbar.appendChild(exitButton);

	// Score bar
	var scorePanel = createElement({				
		classes: 	["score-panel"]				
	});	
	scorePanel.innerHTML = scoreIcon + '&nbsp;<span>0</span>';
	topbar.appendChild(scorePanel);

	
	// ResultScreen
	var resultScreen = createElement({				
		classes: 	["result-screen"]				
	});	

	// console.log(taskSet);
	// console.log(taskTypes);
	
	var tasks = new Array();
	// init all UI elements for the first interaction 
	init();
	
	// console.log(tasks);	

	//--------------------------------------------------
	// CLICK EVENTS
	buttonMain.addEventListener('click', btnMainClickHandler, false);
	buttonNext.addEventListener('click', btnNextClickHandler, false);
	exitButton.addEventListener('click', btnExitClickHandler, false);
	buttonHelp.addEventListener('click', btnHelpClickHandler, false);
	buttonHelp.addEventListener('click', btnHelpClickHandler, false);
	closeHelpBtn.addEventListener('click', btnCloseHelpClickHandler, false);

	//--------------------------------------------------
	// CLICK HANDLERS

	function btnMainClickHandler(){
		animateBtn(buttonMain);

		switch (state) {
			case 'waitAnswer':
				var checkResult = tasks[currentTask].checkAnswer();
				if(checkResult !== -1){
					if(checkResult){
						displayCorrect();					
						state = 'correctAnswer';
						tasks[currentTask].freeze();
						scores++;
						correctSound.play();
					} else {
						displayWrong();
						state = 'wrongAnswer';
						tasks[currentTask].freeze();
						wrongSound.play();
					}
				} else {
					btnHelpClickHandler();
				}	
				break;
				case 'correctAnswer':					
					if(currentTask < tasks.length-1){
						animateTransition(function(){console.log('callback')});	
						nextTask();
						state = 'waitAnswer';		
					} else {
						state = 'notAvailable';
						setTimeout(displayResultScreen,2000);							
					}			
					break;
			case 'wrongAnswer':				
				displayWait();
				tasks[currentTask].init();
				state = 'waitAnswer';
				break;
			default:
				break;
		}
			
	}

	function btnNextClickHandler(){
		if(currentTask < tasks.length-1){
			animateTransition(function(){				
				tasks[currentTask].animateFirstInteraction();
			});	
			animateBtn(buttonNext);
			nextTask();
			state = 'waitAnswer';		
		} else {
			displayResultScreen();
		}
	}

	function btnExitClickHandler(){
		if(resultScreen) resultScreen.remove();
		animateBtn(exitButton);
		loadingBG.setBG({"title" : "Пока!","bgClass" : "mango"});
		appBg.style.display = "none";
		setTimeout(loadingBG.removeBG, 500);			
		body.classList.remove("y-scroll-disable");
		html.classList.remove("y-scroll-disable");
		var taskTeaserWindow = document.querySelector(taskTeaserWindowStr);
		taskTeaserWindow.scrollIntoView();
		window.history.pushState({state:'book'},null, window.location.pathname);
		window.removeEventListener('popstate', popStateHandler);
	}
	
	function btnHelpClickHandler(){
		if(!helpPanel.classList.contains("active")){
			if(tasks[currentTask].type != 4){
				helpPanel.querySelector(".help-text").innerHTML = tasks[currentTask].question;
			} else {
				helpPanel.querySelector(".help-text").innerHTML = 'Перетащи картинки слева к подходящим картинкам справа';
			}
			helpPanel.classList.add("active");	
			helpPanel.style.top = -helpPanel.offsetHeight + 2 + "px";	
			// helpPanel.style.zIndex = 2;
			helpSound.play();	
		} 
		// else {
		// 	helpPanel.classList.remove("active");
		// 	// helpPanel.style.zIndex = -1;	
		// }
	}

	function btnCloseHelpClickHandler(){
		helpPanel.classList.remove("active");
	}
	

	//--------------------------------------------------
	// METHODS

	function getNextTask(){
		return currentTask + 1;
	}

	// switch to the next task
	function nextTask(){
		mainPanel.innerHTML = '';
		displayWait();
		currentTask = getNextTask();
		tasks[currentTask].render();
		switchProgress();
		switchScores();
		helpPanel.classList.remove("active");
	}

	// set position on the progress panel
	function switchProgress(){
		progressPanel.innerHTML = (currentTask+1) + " / " + tasks.length;
	}

	// set position on the progress panel
	function switchScores(){
		scorePanel.querySelector('span').innerHTML = scores;
	}

	// Animate transitions between tasks, while next is loading
	function animateTransition(callback = null){
		loadingBG.setBG({
			"title" : " ",
			"spinner" : "hourglass",
			"bgClass" : "s-blue",
		});
		setTimeout(loadingBG.removeBG.bind(null,callback),100);	
	}

	// display when user responded wrong 
	function displayWrong(){
		mainPanel.classList.add("wrong");
		appBg.classList.add("wrong");
		buttonMain.classList.add("wrong");
		buttonMain.innerHTML = "ЕЩЕ РАЗ!";
	}

	// display when user responded correct 
	function displayCorrect(){
		mainPanel.classList.add("correct");
		appBg.classList.add("correct");
		buttonMain.classList.add("correct");
		buttonMain.innerHTML = "ДАЛЬШЕ!";
	}

	// display when answer is waited by user
	function displayWait(){
		mainPanel.classList.remove("wrong");
		appBg.classList.remove("wrong");
		buttonMain.classList.remove("wrong");
		mainPanel.classList.remove("correct");
		appBg.classList.remove("correct");
		buttonMain.classList.remove("correct");
		buttonMain.innerHTML = "ПРОВЕРИТЬ";
	}

	// display last result screen
	function displayResultScreen(){

		var resultScreenInner = createElement({				
			classes: 	["result-screen-inner"]				
		});	

		// repeat challenge button
		var buttonRepeat = createElement({				
			classes: 	["repeat-button"]				
		});	
		buttonRepeat.innerHTML = "ПОВТОРИТЬ";

		// next nav button
		var buttonFin = createElement({				
			classes: 	["fin-button"]				
		});

		buttonFin.innerHTML = "ВЫХОД";

		var congratsArray = ["Соберись:)", "Неплохо!", "Неплохо!", "Хорошо!", "Молодец!", "Отлично!"];
		var resultMark = Math.round(scores/tasks.length*(congratsArray.length-1));
		
		var resultScreenInnerStr = '<div class="congrats">'+congratsArray[resultMark]+'</div>';
		if(scores > 0){
			resultScreenInnerStr += '<p>Ты набрал</p><div class="scores">';		
			for (var index = 0; index < tasks.length; index++) {
				if( scores-- > 0 ){
					resultScreenInnerStr += '<span class="circle">' + scoreIcon + '</span>';
				} else {
					resultScreenInnerStr += '<span class="circle"></span>';
				}
			}
			resultScreenInnerStr += '</div>';
		} else {
			resultScreenInnerStr += '<p>Ты ничего не набрал</p>';	
		}
		if (navigator.share) {
			resultScreenInnerStr += '<div class="placeholder-text native-sharing"><div>Нравятся задания?</div><div>Не забудь поделиться с друзьями </div><div class="share-btn"><i class="blicon-share2"></i></div></div>';
		}
		
		// resultScreenInnerStr += '<div class="circle1"></div>';
		// resultScreenInnerStr += '<div class="circle2"></div>';
		resultScreenInner.innerHTML = resultScreenInnerStr;

		resultScreenInner.appendChild(buttonRepeat);
		resultScreenInner.appendChild(buttonFin);

		resultScreen.innerHTML = '';
		resultScreen.appendChild(resultScreenInner);

		body.appendChild(resultScreen);

		buttonRepeat.addEventListener('click', btnRepeatClickHandler.bind(this,taskMode), false);
		buttonFin.addEventListener('click', btnExitClickHandler, false);

		function btnRepeatClickHandler(taskMode){
			resultScreen.remove();
			loadingBG.setBG();
			init(taskMode);
		}	
		if (navigator.share) {		
			set_share_btn();
		}
		
	}

	function popStateHandler(){
		btnExitClickHandler();
	}

	// Reset init state of the app like at the first interaction with a user
	function init(initTaskMode = taskMode){
		taskMode = initTaskMode;
		tasks = new Array();
		//--------------------------------------------------
		// unfold all tasks sorted by type from db to one array 		
		var j = 0;
		for (var i = 0; i < taskSet.length; i++) {
			// Init current element of the task array by object of TaskType[i] class, if i = 0 -> TaskType0
			// And filter mode : quiz or main
			if(taskTypes[i] == 0 && taskMode === 'main') continue;
			if(taskTypes[i] != 0 && taskMode === 'quiz') continue;
			
			for (var ii = 0; ii < taskSet[i].tasksByType.length;ii++) {			
				tasks[j] = new window['TaskType'+taskTypes[i]](mainPanel, taskSet[i].tasksByType[ii]);
				tasks[j].question = taskSet[i].question;
				tasks[j++].type = taskTypes[i];
			}
		}

		// Browser History
		var urlAppTitle = 'task-app';
		window.history.pushState({state:'app'},null, window.location.pathname + "?" + urlAppTitle + "&" + taskMode );

		window.addEventListener('popstate', popStateHandler);

		state = 'waitAnswer';
		currentTask = 0;
		scores = 0;
		appBg.style.display = "block";
		html.classList.add("y-scroll-disable");
		body.classList.add("y-scroll-disable");

		// topbar 
		switchProgress();
		scorePanel.querySelector('span').innerHTML = scores;
		// cntrl bar
		buttonMain.innerHTML = "ПРОВЕРИТЬ";
		buttonNext.style.display = "block";	
		
		mainPanel.innerHTML = '';
		tasks[currentTask].render();

		helpPanel.classList.remove("active");

		displayWait();

		// get rid off loading background	
		if(loadingBG) {
			setTimeout(function(){
				loadingBG.removeBG();
				tasks[currentTask].animateFirstInteraction();
			},100);	
		}
	}

	return{
		init: function(taskMode){ init(taskMode) },
	}
};
function TaskBase(parent, dbData) {	
	this.answersArray = new Array();
	this.usersAnswerNum;
	this.parent = parent;
	this.dbData = dbData;
}

var body = document.querySelector('body');
var html = document.querySelector("html");
TaskBase.prototype.parent = body;
TaskBase.prototype.freezeState = 0;
TaskBase.prototype.dbData = 0;
// TaskBase.prototype.constructor = function(parent){
	
// };

TaskBase.prototype = {

	// freezeState : freezeState,

	freeze : function freeze(element){
		this.freezeState = 1;
	},

	markAnswer : function markAnswer(element){
		element.classList.add("marked");
		// animateEl(element, 10, 0, 200);
	},

	unmarkAnswer : function unmarkAnswer(element){
		element.classList.remove("marked");
		// animateEl(element, 0, 0, 200);
	},

	checkAnswer : function checkAnswer(){
		if(this.usersAnswerNum === '') return -1;
		return parseInt(this.usersAnswerNum) === this.dbData.corr_answs;
	},

	checkMultipleAnswer : function checkAnswer(){
		if(this.usersAnswerNumArray.length === 0) return -1;
		for (var i = 0; i < this.usersAnswerNumArray.length; i++) {
			if( !this.dbData.corr_answs.includes(this.usersAnswerNumArray[i]) ){
				return false;
			}
		}
		for (var i = 0; i < this.dbData.corr_answs.length; i++) {
			if( !this.usersAnswerNumArray.includes(this.dbData.corr_answs[i]) ){
				return false;
			}
		}
		return true;
	},

	checkOrderedAnswer : function checkAnswer(){
		var result = true;
		for(var n=0; n < this.questionsArray.length; n++) {
			var userAns = this.questionsArray[n].getAttribute("attempt-pos");
			var corrAns = this.questionsArray[n].getAttribute("answer-num");
			if(userAns) {
				userAns = parseInt(userAns) + 1;
				corrAns = parseInt(corrAns);
				if(userAns != corrAns) result = false;
			} else return -1;
		}
		return result;
	},

	init : function init(){		
		this.freezeState = 0;
		this.usersAnswerNum = '';
		this.usersAnswerNumArray = new Array();
		for (var i = 1; i <= this.answersArray.length; i++) {
			this.unmarkAnswer(this.answersArray[i-1]);
		}
	},

	renderQuestion : function renderQuestion(){
		var questionEl = createElement({				
			classes: 	["question-window"]				
		});
		questionEl.innerHTML = this.dbData.taskText;
		this.parent.appendChild(questionEl);
	},

	renderQuestionImg : function renderQuestionImg(height = "auto"){
		var questionEl = createElement({				
			classes: 	["question-img-window"]				
		});
		questionEl.innerHTML = '<img style="height:'+height+'px" src="' + this.dbData.question_img + '">';
		this.parent.querySelector(".question-window").appendChild(questionEl);
	},

	// Animate elements of the task after all task is loaded
	animateFirstInteraction : function animateFirstInteraction(){},
	
	// Click Handler on answer options with exclusion other unswer options
	answerClickHandler : function answerClickHandler(e){
		if(this.freezeState) return;
		var target = e.target.classList.contains("answer-option", "option") ? e.target : e.target.parentElement;
		this.usersAnswerNum = target.getAttribute('answer-num');		
		for (var i = 1; i <= this.answersArray.length; i++) {
			if(i == this.usersAnswerNum) this.markAnswer(this.answersArray[i-1]);	
			else 					this.unmarkAnswer(this.answersArray[i-1]);
		}
		// animateAnswer(this);
	},

	// Click Handler on answer options without exclusion other answer options
	answerClickHandlerInclude : function answerClickHandlerInclude(e){
		if(this.freezeState) return;
		var target = e.target.classList.contains("answer-option", "option") ? e.target : e.target.parentElement;
		
		var num = parseInt(target.getAttribute('answer-num'));		
		if(this.answersArray[num-1].classList.contains("marked")){
			this.unmarkAnswer(this.answersArray[num-1]);
			this.usersAnswerNumArray = this.usersAnswerNumArray.filter(function(el){
				return el !== num;
			});
			// console.log(this.usersAnswerNumArray);
		} else {
			this.markAnswer(this.answersArray[num-1]);
			this.usersAnswerNumArray.push(num);
			// console.log(this.usersAnswerNumArray);
		}
	}
}

function TaskType0(parent, dbData) {	

	TaskBase.call(this, parent, dbData); // call parent constructor
	this.init();

	this.renderAnswers = function renderAnswers(){		
		var answersWindow = createElement({				
			classes: 	["answers-window"]					
		});
		for (var i = 0; i < this.dbData.answers.length; i++) {
			this.answersArray[i] = createElement({				
				classes: 	["answer-option", "option"],
				attrs: 	{"answer-num": i+1}			
			});
			this.answersArray[i].innerHTML = this.dbData.answers[i];	
			answersWindow.appendChild(this.answersArray[i]);
			this.answersArray[i].addEventListener('click', this.answerClickHandler.bind(this), false);
		}		
		this.parent.appendChild(answersWindow);
	}

	this.render = function render(){
		this.renderQuestion();
		this.renderAnswers();
	}
}

function TaskType1(parent, dbData) {

	TaskBase.call(this, parent, dbData); // call parent constructor
	this.init();

	this.renderAnswers = function renderAnswers(){		
		var answersWindow = createElement({				
			classes: 	["answers-window", "two-colomn"]					
		});
		for (var i = 0; i < this.dbData.answers.length; i++) {
			this.answersArray[i] = createElement({				
				classes: 	["answer-option", "option"],
				attrs: 	{"answer-num": i+1}			
			});
			this.answersArray[i].innerHTML = this.dbData.answers[i];	
			answersWindow.appendChild(this.answersArray[i]);
			this.answersArray[i].addEventListener('click', this.answerClickHandler.bind(this), false);
		}		
		this.parent.appendChild(answersWindow);
	}

	this.render = function render(){
		this.renderQuestion();
		this.renderQuestionImg();
		this.renderAnswers();
	}

}

function TaskType2(parent, dbData) {

	TaskBase.call(this, parent, dbData); // call parent constructor
	this.init();

	this.renderAnswers = function renderAnswers(){		
		var answersWindow = createElement({				
			classes: 	["answers-window", "two-colomn", "answers-img"]					
		});
		for (var i = 0; i < this.dbData.answers.length; i++) {
			this.answersArray[i] = createElement({				
				classes: 	["answer-option", "option"],
				attrs: 	{"answer-num": i+1}			
			});
			this.answersArray[i].innerHTML = '<img src="' + this.dbData.answers[i] + '">';
			answersWindow.appendChild(this.answersArray[i]);
			this.answersArray[i].addEventListener('click', this.answerClickHandler.bind(this), false);
		}		
		this.parent.appendChild(answersWindow);
	}

	this.render = function render(){
		this.renderQuestion();		
		this.renderAnswers();
	}

}

function TaskType3(parent, dbData) {

	TaskBase.call(this, parent, dbData); // call parent constructor
	this.init();

	this.renderAnswers = function renderAnswers(){		
		var answersWindow = createElement({				
			classes: 	["answers-window", "two-colomn", "answers-img"]					
		});
		for (var i = 0; i < this.dbData.answers.length; i++) {
			this.answersArray[i] = createElement({				
				classes: 	["answer-option", "option"],
				attrs: 	{"answer-num": i+1}			
			});
			this.answersArray[i].innerHTML = '<img src="' + this.dbData.answers[i] + '">';
			answersWindow.appendChild(this.answersArray[i]);
			this.answersArray[i].addEventListener('click', this.answerClickHandler.bind(this), false);
		}		
		this.parent.appendChild(answersWindow);
	}

	this.render = function render(){
		this.renderQuestion();	
		this.renderQuestionImg(200);	
		this.renderAnswers();
	}
}

function TaskType4(parent, dbData) {
	"use strict";

	this.questionsArray = new Array();
	this.attemptsArray = new Array();
	this.questionsXY = {};
	this.ansPlacesBusy = [];
	this.questPlacesBusy = [];

	TaskBase.call(this, parent, dbData); // call parent constructor

	this.init();

	var userScreenWidth = document.documentElement.clientWidth || document.body.clientWidth;
	var appleDevice = navigator.userAgent.match(/ipad|ipod|iphone/i);
	var mobileDevice = (userScreenWidth < 1000) ? 1 : 0;
	var movePointerEvent = (mobileDevice || appleDevice) ? 'touchmove' : 'mousemove';
	var endPointerEvent = (mobileDevice || appleDevice) ? 'touchend' : 'mouseup';

	var startPos = {};
	var startTouch = {};
	var dragEn = false; 
	var target = {};
	
	// listeners of touch
	var start = function(event){
		event.preventDefault();		
		// if(!event.isPrimary) return;
		// console.log(event);

		// var startPointerEvent = (mobileDevice || appleDevice) ? 'touchstart' : 'mousedown';
		mobileDevice = (event.type === 'mousedown') ? 0 : 1;
		movePointerEvent = (mobileDevice || appleDevice) ? 'touchmove' : 'mousemove';
		endPointerEvent = (mobileDevice || appleDevice) ? 'touchend' : 'mouseup';

		dragEn = true;

		target =  event.target;
		// console.log('start!');
		// console.log(target);
		while(!target.classList.contains("question-option")) {
			target = target.parentElement;
		}
		// target.setPointerCapture(event.pointerId);

		var style = target.style;
		if(style) style.zIndex = "2";

		// get initial touch coords
		startTouch = {			
			x: mobileDevice ? event.touches[0].screenX : event.clientX,
			y: mobileDevice ? event.touches[0].screenY : event.clientY,
		};

		// startPos = {			
		// 	x: target.getBoundingClientRect().left,
		// 	y: target.getBoundingClientRect().top,
		// };

		var startPosTmp = getElementPosRelativeToParent(target, target.parentElement.parentElement);	
		startPos = {			
			x: startPosTmp.left,
			y: startPosTmp.top,
		};

		window.addEventListener(movePointerEvent, moveBind, false);
		window.addEventListener(endPointerEvent, endBind, false);
	}

	var move = function (event) {
		event.preventDefault();
		// if(!event.isPrimary || !dragEn) return;
		if(!dragEn) return;

		// var target =  event.target;
		// console.log(target);
		// while(!target.classList.contains("question-option")) {
		// 	target = target.parentElement;
		// }

		// measure change in x and y
		var delta = {
			x: (mobileDevice ? event.touches[0].screenX : event.clientX) - startTouch.x,
			y: (mobileDevice ? event.touches[0].screenY : event.clientY) - startTouch.y
		}
		// console.log(delta);

		var questNum = target.getAttribute("quest-num");
		
		var tmpX = delta.x + startPos.x - this.questionsXY[questNum].x;
		var tmpY = delta.y + startPos.y - this.questionsXY[questNum].y;
		// var tmpX = delta.x;
		// var tmpY = delta.y;
		
		translate(target, tmpX, tmpY, 0);
	}

	var end = function (event) {
		event.preventDefault();
		// if(!event.isPrimary) return;

		dragEn = false;

		
		// var target =  event.target;
		// console.log('end!');
		// console.log(target);
		// while(!target.classList.contains("question-option")) {
		// 	target = target.parentElement;
		// }	
		
		var style = target.style;
		if(style) style.zIndex = "1";
		// calc place

		// remove from ansPlacesBusy or questPlacesBusy prev value
		var attemptNum = target.getAttribute("attempt-pos");
		if(attemptNum) this.ansPlacesBusy[attemptNum] = false;

		var questNum = target.getAttribute("quest-pos");
		if(questNum) this.questPlacesBusy[questNum] = false;

		// var targetXY = {
		// 	top: target.getBoundingClientRect().top,
		// 	left: target.getBoundingClientRect().left
		// }

		var targetXY = getElementPosRelativeToParent(target, target.parentElement.parentElement);
		
		var min = 1234568790;
		var ind = 0;
		var attempt = false;
		for(var n=0; n<this.answersArray.length; n++) {
			// var attemptXY = {
			// 	top: this.attemptsArray[n].getBoundingClientRect().top,
			// 	left: this.attemptsArray[n].getBoundingClientRect().left
			// }

			var attemptXY = getElementPosRelativeToParent(this.attemptsArray[n], this.attemptsArray[n].parentElement.parentElement);

			var d = (targetXY.top - attemptXY.top)**2 + (targetXY.left - attemptXY.left)**2;
			if((d < min) && !this.ansPlacesBusy[n]) {
				min = d;
				ind = n;
				attempt = true;
			}
		}

		for(var n=0; n<this.questionsArray.length; n++) {			
			var d = (targetXY.top - this.questionsXY[n].y)**2 + (targetXY.left - this.questionsXY[n].x)**2;
			if((d < min) && !this.questPlacesBusy[n]) {
				min = d;
				ind = n;
				attempt = false;
			}
		}

		var questNum = target.getAttribute("quest-num");

		var tmpX = 0;
		var tmpY = 0;
		if(attempt) {
			target.setAttribute("attempt-pos", ind);
			var questPos = target.getAttribute("quest-pos");
			if(questPos){
				this.questPlacesBusy[questPos] = false;
				// target.setAttribute("quest-pos", null);
				target.removeAttribute("quest-pos");
				
			}
			this.ansPlacesBusy[ind] = true;	
			var tmpXY = getElementPosRelativeToParent(this.attemptsArray[ind], this.attemptsArray[ind].parentElement.parentElement);
			tmpX = tmpXY.left - this.questionsXY[questNum].x;
			tmpY = tmpXY.top - this.questionsXY[questNum].y;
			// tmpX = this.attemptsArray[ind].getBoundingClientRect().left - this.questionsXY[questNum].x;
			// tmpY = this.attemptsArray[ind].getBoundingClientRect().top - this.questionsXY[questNum].y;
		} else {
			target.setAttribute("quest-pos", ind);
			var attemptPos = target.getAttribute("attempt-pos");
			if(attemptPos){
				this.ansPlacesBusy[attemptPos] = false;
				// target.setAttribute("attempt-pos", null);
				target.removeAttribute("attempt-pos");
			}
			this.questPlacesBusy[ind] = true;	
			tmpX = this.questionsXY[ind].x - this.questionsXY[questNum].x;
			tmpY = this.questionsXY[ind].y - this.questionsXY[questNum].y;
		}
		
		translate(target, tmpX, tmpY, 500);
		// translate(target, 0, 0, 500);
		// target.startPos.left += tmpX;
		// target.startPos.top += tmpY;

		// target.releasePointerCapture(event.pointerId);

		// target.removeEventListener(startPointerEvent, startBind, false);
		window.removeEventListener(movePointerEvent, moveBind, false);
		window.removeEventListener(endPointerEvent, endBind, false);

		window.addEventListener('transitionend', transitionEnd.bind(this), false);		
	}

	var transitionEnd = function (event) {

		// var target =  event.target;
		// while(!target.classList.contains("question-option")) {
		// 	target = target.parentElement;
		// }

		var style = target.style;
		if(style) style.removeProperty("z-index");
	}

	// store bind functions in variables to preserve content
	var startBind = start.bind(this);
	var moveBind = move.bind(this);
	var endBind = end.bind(this);

	function translate(elem, dx, dy, speed) {
        var style = elem.style;

        if (!style) return;

        style.webkitTransitionDuration =
            style.MozTransitionDuration =
            style.msTransitionDuration =
            style.OTransitionDuration =
            style.transitionDuration = speed + 'ms';
		

        // style.transitionTimingFunction = "ease-out";   
        style.webkitTransform = 'translateX(' + dx + 'px) ' + 'translateZ(0) ' + 'translateY(' + dy + 'px)';
        style.msTransform =
		style.MozTransform =
		style.OTransform = 'translateX(' + dx + 'px) ' + 'translateZ(0) ' + 'translateY(' + dy + 'px)';
    }

	this.renderAnswers = function renderAnswers(){	
		
		var taskWindow = createElement({				
			classes: 	["common-window"]					
		});		
		var questionsWindow = createElement({				
			classes: 	["questions-window-colomn", "task-colomn-3", "answers-img"]					
		});
		var answersWindow = createElement({				
			classes: 	["answers-window-colomn", "task-colomn-3", "answers-img"]					
		});
		var attemptsWindow = createElement({				
			classes: 	["attempts-window-colomn", "task-colomn-3", "answers-img"]					
		});

		for (var i = 0; i < this.dbData.answers.length; i++) {
			this.questionsArray[i] = createElement({				
				classes: 	["question-option", "option"],
				attrs: 	{"answer-num": this.dbData.order[i]}			
			});
			this.answersArray[i] = createElement({				
				classes: 	["answer-option", "option"],
				attrs: 	{"question-num": i+1}			
			});
			this.attemptsArray[i] = createElement({				
				classes: 	["attempt-option", "option"],
				attrs: 	{"attempt-num": i+1}			
			});

			this.questionsArray[i].innerHTML 	= '<img src="' + this.dbData.questions[i] + '">';
			
			// this.attemptsArray[i].innerHTML 	= '<img src="' + this.dbData.answers[i] + '">';
			questionsWindow.appendChild(this.questionsArray[i]);
			answersWindow.appendChild(this.answersArray[i]);
			attemptsWindow.appendChild(this.attemptsArray[i]);			
		}	

		for (var i = 0; i < this.dbData.answers.length; i++) {
			this.answersArray[this.dbData.order[i]-1].innerHTML = '<img src="' + this.dbData.answers[i] + '">';
		}
		
		taskWindow.appendChild(questionsWindow);
		taskWindow.appendChild(attemptsWindow);
		taskWindow.appendChild(answersWindow);
		this.parent.appendChild(taskWindow);

		// this must be doen after all animations
		setTimeout(function(){
			for(var n=0; n<this.questionsArray.length; n++) {
				this.questionsArray[n].addEventListener('mousedown', startBind, false);
				this.questionsArray[n].addEventListener('touchstart', startBind, false);
				this.questionsArray[n].ondragstart = () => false;				
				this.questionsArray[n].setAttribute("quest-num", n);
				this.questionsArray[n].setAttribute("quest-pos", n);

				var tmpXY = getElementPosRelativeToParent(this.questionsArray[n], this.questionsArray[n].parentElement.parentElement);
				this.questionsXY[n] = {
					x: tmpXY.left,
					y: tmpXY.top
				}
				// this.questionsXY[n] = {
				// 	x: this.questionsArray[n].getBoundingClientRect().left,
				// 	y: this.questionsArray[n].getBoundingClientRect().top
				// }
				this.ansPlacesBusy[n] = false;
				this.questPlacesBusy[n] = true;
				var style = this.questionsArray[n].style;
				if(style) style.touchAction = "none";
			}
		}.bind(this),1500);
		
	}

	this.animateFirstInteraction = function animateFirstInteraction(){
		for (var i = 0; i < this.questionsArray.length; i++) {
			shakeEl(this.questionsArray[i]);			
		}		
	}

	this.render = function render(){
		this.renderQuestion();				
		this.renderAnswers();
	}

	this.checkAnswer = function checkAnswer(){
		return this.checkOrderedAnswer();
	}
}

function TaskType5(parent, dbData) {

	this.usersAnswerNumArray = new Array();	

	TaskBase.call(this, parent, dbData); // call parent constructor

	this.init(parent);

	this.renderAnswers = function renderAnswers(){		
		var answersWindow = createElement({				
			classes: 	["answers-window", "three-colomn", "answers-img"]					
		});
		for (var i = 0; i < this.dbData.answers.length; i++) {
			this.answersArray[i] = createElement({				
				classes: 	["answer-option", "option"],
				attrs: 	{"answer-num": i+1}			
			});
			this.answersArray[i].innerHTML = '<img src="' + this.dbData.answers[i] + '">';
			answersWindow.appendChild(this.answersArray[i]);
			this.answersArray[i].addEventListener('click', this.answerClickHandlerInclude.bind(this), false);
		}		
		this.parent.appendChild(answersWindow);
	}

	this.render = function render(){
		this.renderQuestion();	
		// this.renderQuestionImg(100);	
		this.renderAnswers();
	}

	this.checkAnswer = function checkAnswer(){
		return this.checkMultipleAnswer();
	}
}

function TaskType6(parent, dbData) {
	this.usersAnswerNumArray = new Array();	

	TaskBase.call(this, parent, dbData); // call parent constructor

	this.init(parent);

	this.renderAnswers = function renderAnswers(){		
		var answersWindow = createElement({				
			classes: 	["answers-window", "three-colomn", "answers-img"]					
		});
		for (var i = 0; i < this.dbData.answers.length; i++) {
			this.answersArray[i] = createElement({				
				classes: 	["answer-option", "option"],
				attrs: 	{"answer-num": i+1}			
			});
			this.answersArray[i].innerHTML = '<img src="' + this.dbData.answers[i] + '">';
			answersWindow.appendChild(this.answersArray[i]);
			this.answersArray[i].addEventListener('click', this.answerClickHandlerInclude.bind(this), false);
		}		
		this.parent.appendChild(answersWindow);
	}

	this.render = function render(){
		this.renderQuestion();	
		this.renderQuestionImg(200);	
		this.renderAnswers();
	}

	this.checkAnswer = function checkAnswer(){
		return this.checkMultipleAnswer();
	}
}

function TaskType7(parent, dbData) {
	// console.log(7);
}

TaskType0.prototype = Object.create(TaskBase.prototype);
TaskType1.prototype = Object.create(TaskBase.prototype);
TaskType2.prototype = Object.create(TaskBase.prototype);
TaskType3.prototype = Object.create(TaskBase.prototype);
TaskType4.prototype = Object.create(TaskBase.prototype);
TaskType5.prototype = Object.create(TaskBase.prototype);
TaskType6.prototype = Object.create(TaskBase.prototype);
TaskType7.prototype = Object.create(TaskBase.prototype);

