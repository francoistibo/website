'use strict';

// GLOBAL VARS
var x, y, dx, dy, mouseFollowKey, mouseX, mouseY, xPos, yPos = 0;

// SELECTOR VARS
var cursor = document.getElementById("cursor");
var link = document.querySelectorAll("ul.social");
// console.log(basicLink);

// FPS VARS
var fps = 40;
var now;
var then = Date.now();
var interval = 1000/fps;
var delta;

// FUNCTION : SET MOUSE POSITION
function setMousePosition(e) {
  mouseX = e.clientX || e.pageX;
  mouseY = e.clientY || e.pageY;
}

// FUNCTION : MOUSE CURSOR FOLLOW
function followMouse() {
  now = Date.now();
  delta = now - then;

  if (delta > interval) {
    then = now - (delta % interval);

    if (!x || !y) {
      x = mouseX;
      y = mouseY;
    } else {
      dx = (mouseX - x) * 0.1;
      dy = (mouseY - y) * 0.1;

      if (Math.abs(dx) + Math.abs(dy) < .1) {
        x = mouseX;
        y = mouseY;
      } else {
        x += dx;
        y += dy;
      }
    }

    cursor.style.left = x + "px";
    cursor.style.top = y + "px";
  }

  requestAnimationFrame(followMouse);
}

// FUNCTION : MOUSE CURSOR DISAPPEAR
function cursorBehavior() {
  followMouse();

  for (var i = 0 ; i < link.length ; i++) {
    link[i].addEventListener("mouseover", function(){
      cursor.classList.add("cursor-link-hover");
    }, false);

    link[i].addEventListener("mouseleave", function(){
      document.querySelector(".cursor-link-hover").classList.remove("cursor-link-hover");
    }, false);
  }
}

// FUNCTION : INIT
function init() {
  cursorBehavior();
}

// LISTENER : MOUSE MOVE
window.addEventListener("mousemove", setMousePosition, false);

// LISTENER : DOCUMENT LOADED
document.addEventListener('DOMContentLoaded', function() {
  init();
});
