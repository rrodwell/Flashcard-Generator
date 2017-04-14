var fs = require("fs");
var inquirer = require("inquirer");
var prompt = require("prompt");

var FILE_NAME = "flashcards.txt";
var numQuestion = 0;

//Start object asking what the user wants to do
var start = {
    type: "list",
    message: "Where would you like to begin?",
    choices: ["Make Flashcards", "Begin Studying"],
    name: "choice"
};

//Object constructors for the type of flashcard
function BasicCard(front,back){
    this.front = front;
    this.back = back;
}

function ClozeCard(text,partial,cloze){
    this.text = text;
    this.partial = partial;
    this.cloze = cloze;
}



//Ask user to pick which type of flashcard to make
function pickType(){
    inquirer.prompt([
        {
            type: "confirm",
            message: "Instructions: There are two differnt types of cards you can make. BASIC is where the user will guess the correct answer and CLOZE is where the user will fill in the blank. Would you like to continue?",
            name: "confirm",
            default: true
        },

        {
            type: "list",
            message: "Which type of flashcard do you want to make?",
            choices: ["Basic Cards", "Cloze Cards"],
            name: "choice"
        }

    ]).then(function(userChoice){

        if(userChoice.choice === "Basic Cards"){
            makeFlashCards("BASIC");
        } else {
            makeFlashCards("CLOZE");
        }

    });
}

function makeFlashCards(cardType) {
    //ask user for question(input)
    //ask user for correct answer(input)
    //ask if they want to make another flashcard(choice)
    inquirer.prompt([
        {
            type: "input",
            message: "What is the question?",
            name: "question"
        },

        {
            type: "input",
            message: "What is the answer?",
            name: "answer"
        },

        {
            type: "confirm",
            message: "Would you like to add another question?",
            name: "confirm",
            default: true
        }

    ]).then(function (userChoice) {

        if (cardType === "CLOZE") {
            //check if the answer is in the question
            if (userChoice.question.indexOf(userChoice.answer) > -1) {
                var flashcard = "\n" + cardType + "," + userChoice.question + "," + userChoice.answer;
                fs.appendFile(FILE_NAME, flashcard, function (err) {
                    if (err) {
                        console.log(err);
                    }
                });
                if (userChoice.confirm === true) {
                    makeFlashCards(cardType);
                }
            } else {
                console.log("The answer needs to apart of the question.");
                makeFlashCards(cardType);
            }
        } else {
            //Log flashcards in txt file or FireBase(time depending)
            var flashcard = "\n" + cardType + "," + userChoice.question + "," + userChoice.answer;
            fs.appendFile(FILE_NAME, flashcard, function (err) {
                if (err) {
                    console.log(err);
                }
            });
            if (userChoice.confirm === true) {
                makeFlashCards(cardType);
            }
        }

    });
}


//readFile function
function read(count){
   //read txt file
    //split data by question BASIC or CLOZE
    //make new prototype obj accordingly
    //run studyFlashCards
    fs.readFile(FILE_NAME, "utf8",function(err, data){
        if(err){ console.log(err); }
        var flashcards = [];
        var questionCount = data.split("\n");
        for (var i = 0; i < questionCount.length; i++) {
            if(questionCount[i] !== ""){
                //split question and answer
                //remove question type
                var card = questionCount[i].split(",");
                if(card[0] === "BASIC"){
                    var basicOBJ = new BasicCard(card[1],card[2]);
                    flashcards.push(basicOBJ);
                } else {
                    var partialCloze = card[1].replace(card[2],"_______");
                    var clozeOBJ = new ClozeCard(card[1],partialCloze,card[2]);
                    flashcards.push(clozeOBJ);
                }
            }
        }
        inquireQuestion(flashcards,count);
    });
}


function inquireQuestion(questionOBJ,count) {
    if(count < questionOBJ.length) {
        if ((questionOBJ[count] instanceof ClozeCard)) {
            console.log("Question: " + questionOBJ[count].partial);
            inquirer.prompt([
                {
                    type: "input",
                    message: "What is your answer?",
                    name: "answer"
                }
            ]).then(function (userChoice) {
                studyCloze(userChoice,questionOBJ,count);
            });
        } else {
            console.log("Question: " + questionOBJ[count].front);
            inquirer.prompt([
                {
                    type: "input",
                    message: "What is your answer?",
                    name: "answer"
                }
            ]).then(function (userChoice) {
                studyBasic(userChoice,questionOBJ,count);
            });
        }
    }
}

//Study Basic cards
function studyBasic(choice,cardsArr,num){
    if (choice.answer === cardsArr[num].back) {
        console.log("That is CORRECT!");
        var newCount = num+1;
        inquireQuestion(cardsArr, newCount);
    } else {
        console.log("That is INCORRECT...");
        console.log("The right answer is "+ cardsArr[num].back);
        var newCount = num+1;
        inquireQuestion(cardsArr, newCount);
    }
}

//Study Cloze cards
function studyCloze(choice,cardsArr,num){
    if (choice.answer === cardsArr[num].cloze) {
        console.log("That is CORRECT!");
        var newCount = num+1;
        inquireQuestion(cardsArr, newCount);
    } else {
        console.log("That is INCORRECT...");
        console.log("The right answer is '"+ cardsArr[num].text+"'");

        var newCount = num+1;
        inquireQuestion(cardsArr, newCount);
    }
}

//Start program
function Begin(obj){
    inquirer.prompt([
        obj
    ]).then(function(userChoice){

        if(userChoice.choice === "Make Flashcards"){
            console.log("Lets make 'em!");
            pickType();
        } else {
            console.log("Lets study!");
            read(numQuestion);
        }
    });
}

Begin(start);
