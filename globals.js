console.log("globals.js loaded");
const GAME_WIDTH = 1920;
const GAME_HEIGHT = 1080;
const PLAYER_SPEED = 10;
const SHIELD_DURATION = 6000; // 6 seconds
const SHIELD_COOLDOWN = 20000; // 20 seconds
const BULLET_SPEED = 17.25;
const ALIEN_BULLET_SPEED = 6;
const MOTHERSHIP_SPEED = 5;
const MAX_ROUNDS = 5;
const PLAYER_LIVES = 3;
const MOTHERSHIP_POINTS = 50;
const STARTING_ROUND = 4;

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
    activeDiveInProgress: false,
    round4Offset: 0,
    round4Direction: 1
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
