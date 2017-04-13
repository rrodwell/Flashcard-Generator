var fs = require("fs");
var inquirer = require("inquirer");
var prompt = require("prompt");

var FILE_NAME = "flashcards.txt";

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

function ClozeCard(text,cloze){
    this.text = text;
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

function makeFlashCards(cardType){
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

    ]).then(function(userChoice){

        //Log flashcards in txt file or FireBase(time depending)
        var flashcard = "\n"+cardType+","+userChoice.question+","+ userChoice.answer;
        fs.appendFile(FILE_NAME, flashcard, function(err){
            if(err){ console.log(err); }
        });
        if(userChoice.confirm === true){
            makeFlashCards(cardType);
        }
    });
}


//readFile function
function read(){
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
                    var clozeOBJ = new ClozeCard(card[1],card[2]);
                    flashcards.push(clozeOBJ);
                }
            }
        }
        studyFlashCards(flashcards);
    });
}

//callback function
function callback(){
  console.log("Next flashcard.");
}

//Study
function studyFlashCards(arrFlashcards){
    for (var i = 0; i < arrFlashcards.length; i++) {
        if(arrFlashcards[i] instanceof ClozeCard){
            console.log("cloze");
        } else {
            inquireBasic(arrFlashcards[i], callback);
            break;
        }
        continue;
    }
}

function inquireBasic(questionOBJ,callback){
    console.log(questionOBJ.front);
    inquirer.prompt([
        {
            type: "input",
            message: "What is your answer?",
            name: "answer"
        }
    ]).then(function(userChoice){
        if(userChoice.answer === questionOBJ.back){
            console.log("That is correct!");
            callback();
        } else {
            console.log("I'm sorry, that is incorrect...");
        }
        // callback();
    });
}

function inquireCloze(){
    inquirer.prompt([
        {

        }
    ]).then(function(userChoice){

    });
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
            read();
        }
    });
}

Begin(start);
