console.log("globals.js loaded");
var GAME_WIDTH = 1920;
var GAME_HEIGHT = 1080;
var PLAYER_SPEED = 10;
var SHIELD_DURATION = 6000; // 6 seconds
var SHIELD_COOLDOWN = 10000; // 10 seconds
var BULLET_SPEED = 17.25; // Increased by 15%
var ALIEN_BULLET_SPEED = 8;
var MAX_ROUNDS = 5;

// Variables that need to be shared
var gameState = {
    state: 'MENU',
    score: 0,
    round: 1,
    lastTime: 0,
    roundTimer: 0,
    messageTimer: 0,
    activeDiveInProgress: false
};

var highScore = localStorage.getItem('alienRevengeHighScore') || 0;

var bgImage = null;
var playerImage = null;
var alienSprites = {};

var player;
var aliens = [];
var alienBullets = [];

var images = {};
