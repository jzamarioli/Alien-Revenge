console.log("globals.js loaded");
var GAME_WIDTH = 1920;
var GAME_HEIGHT = 1080;
var PLAYER_SPEED = 10;
var SHIELD_DURATION = 6000; // 6 seconds
var SHIELD_COOLDOWN = 20000; // 20 seconds
var BULLET_SPEED = 17.25;
var ALIEN_BULLET_SPEED = 6;
var MOTHERSHIP_SPEED = 5;
var MAX_ROUNDS = 5;
var PLAYER_LIVES = 3;
var MOTHERSHIP_POINTS = 50;
var STARTING_ROUND = 1;

// Variables that need to be shared
var gameState = {
    state: 'MENU',
    lives: PLAYER_LIVES,
    score: 0,
    round: STARTING_ROUND,
    mothershipPoints: MOTHERSHIP_POINTS,
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
var mothership = null;
var aliens = [];
var alienBullets = [];
var explosions = [];
var floatingTexts = [];

var images = {};
