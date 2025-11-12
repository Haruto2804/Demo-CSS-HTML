import { autoType } from "./auto-type.js";

// Name:
const userHeaderNameElement = document.querySelector('.user-header__name');
const userHeaderDescriptionElement = document.querySelector('.user-header__description');
const nameList = [
  "Haruto",
];

autoType(nameList,
  userHeaderNameElement,
  300,
  300,
  500);


const descriptionList = [
  "Software Engineer",
  "Web Developer",
  "Creative Thinker",
  "A Problem Solver",
  "Designing Experiences",
  "Always Learning"
];
autoType(descriptionList,
  userHeaderDescriptionElement,
  300,
  300,
  500);
