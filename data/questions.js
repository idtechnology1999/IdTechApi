const questions = [
  {
    id: 1,
    question: "How many parts does a 'for' loop have?",
    options: ["2", "3", "4", "5"],
    answer: "3",
  },
  {
    id: 2,
    question: "In a for loop 'for(init; condition; increment)', which part runs first?",
    options: ["condition", "increment", "init", "the body"],
    answer: "init",
  },
  {
    id: 3,
    question: "What happens if the condition in a for loop is false at the start?",
    options: [
      "The body runs once",
      "The loop never runs",
      "The condition is skipped",
      "An error occurs",
    ],
    answer: "The loop never runs",
  },
  {
    id: 4,
    question: "When does the increment part of a for loop execute?",
    options: [
      "Before the condition",
      "After each iteration of the body",
      "At the start of the loop",
      "Only if the condition is false",
    ],
    answer: "After each iteration of the body",
  },
  {
    id: 5,
    question: "Which statement can exit a for loop immediately?",
    options: ["continue", "break", "exit", "stop"],
    answer: "break",
  },
  {
    id: 6,
    question: "What does the 'forEach()' method do?",
    options: [
      "Creates a new array",
      "Executes a function for each element",
      "Filters an array",
      "Sorts an array",
    ],
    answer: "Executes a function for each element",
  },
  {
    id: 7,
    question: "Is it possible to break out of a forEach loop?",
    options: [
      "Yes, using break",
      "No, forEach cannot be stopped",
      "Yes, using exit",
      "Yes, using continue",
    ],
    answer: "No, forEach cannot be stopped",
  },
  {
    id: 8,
    question: "How many arguments can the forEach callback function receive?",
    options: ["1", "2", "3", "4"],
    answer: "3",
  },
  {
    id: 9,
    question: "What does forEach() return?",
    options: ["A new array", "undefined", "The original array", "A boolean"],
    answer: "undefined",
  },
  {
    id: 10,
    question: "Which loop is best for iterating over all elements of an array?",
    options: ["for loop", "forEach", "while loop", "Both for and forEach"],
    answer: "Both for and forEach",
  },
  {
    id: 11,
    question: "In a forEach callback (value, index, array), what does 'index' represent?",
    options: [
      "The element value",
      "The position number of the element",
      "The array itself",
      "The length of the array",
    ],
    answer: "The position number of the element",
  },
  {
    id: 12,
    question: "Can forEach be called on a JavaScript object?",
    options: [
      "Yes, always",
      "No, forEach is only for arrays",
      "Yes, if the object has a length property",
      "Only on strings",
    ],
    answer: "No, forEach is only for arrays",
  },
  {
    id: 13,
    question: "What will 'for(var i=0; i<3; i++){}' leave i as after the loop?",
    options: ["0", "2", "3", "undefined"],
    answer: "3",
  },
  {
    id: 14,
    question: "Which statement skips the current iteration and moves to the next?",
    options: ["break", "continue", "skip", "next"],
    answer: "continue",
  },
  {
    id: 15,
    question: "Does forEach modify the original array?",
    options: [
      "Yes, always",
      "No, forEach does not modify the original array by itself",
      "Only if you return a value",
      "It creates a new array",
    ],
    answer: "No, forEach does not modify the original array by itself",
  },
];

module.exports = questions;
