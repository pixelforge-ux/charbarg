import gsap from 'gsap';
import { SUITS, VALUES, NUMERIC_VALUES } from './constants.js';
import { playSound } from './audio.js';
import { createDeck, shuffle, getPossibleTakes, calculateCurrentScore, evaluateCardsValue } from './engine.js';
import { createCardUI, showSur, animateCardMove, updateTurnIndicator, showPointsPopup, showStickerUI } from './ui.js';

// --- Constants & State ---
// tombstone: removed SUITS, VALUES, NUMERIC_VALUES constants

let gameState = {
    deck: [],
    players: [],
    table: [],
    turn: 0,
    lastTaker: null,
    isHandEnding: false,
    settings: {
        cardBack: 1,
        carpet: 1,
        botDifficulty: 'medium',
        playerCount: 2,
        userName: "",
        targetScore: 62,
        gameSpeed: 2,
        allowJackSur: false,
        allowLastCardSur: false,
        cancelOpponentSur: false
    },
    pendingOpponents: [],
    isGameActive: false,
    dealing: false,
    isPaused: false,
    processing: false
};

// tombstone: removed audioCtx and playSound(name) helper

import { generateNames, generateGenericName } from './utils.js';
import { hideAllMenus, setupMenuListeners } from './menu.js';
import { initBackground3D } from './bg3d.js';
import { renderBoard, showLeaderboard } from './renderer.js';

const NAMES_LIST = generateNames();

// --- Initialization ---

function startLoading() {
    const splash = document.getElementById('splash-screen');
    const progress = document.getElementById('loader-progress');
    const mainMenu = document.getElementById('main-menu');
    
    if (!splash || mainMenu.style.opacity === '1') return; // Prevent double init
    
    mainMenu.style.opacity = '0';
    
    // Initialize 3D background immediately
    initBackground3D('bg-3d-container', 'card_back_1.png');

    // Load saved name
    const savedName = localStorage.getItem('four_leaf_user_name');
    if (savedName) {
        gameState.settings.userName = savedName;
        document.getElementById('user-name-input').value = savedName;
    }

    let p = 0;
    const interval = setInterval(() => {
        p += 5 + Math.random() * 15;
        if (p >= 100) {
            p = 100;
            clearInterval(interval);
            setTimeout(() => {
                splash.style.opacity = '0';
                mainMenu.style.opacity = '1';
                setTimeout(() => {
                    splash.style.display = 'none';
                }, 800);
            }, 400);
        }
        if (progress) progress.style.width = `${p}%`;
    }, 80);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startLoading);
} else {
    startLoading();
}

// tombstone: removed FIRST_NAMES, LAST_NAMES, NAMES_LIST generation (moved to utils.js)
// tombstone: removed hideAllMenus() (moved to menu.js)
// tombstone: removed menu-related window functions (moved to menu.js)

const startMatchmaking = () => {
    hideAllMenus();
    document.getElementById('matchmaking').classList.remove('hidden');
    const foundContainer = document.getElementById('found-players');
    foundContainer.innerHTML = '';
    const count = gameState.settings.playerCount;
    let found = 0;
    gameState.pendingOpponents = [];
    
    const interval = setInterval(() => {
        found++;
        const name = NAMES_LIST[Math.floor(Math.random() * NAMES_LIST.length)];
        gameState.pendingOpponents.push(name);
        
        const pDiv = document.createElement('div');
        pDiv.className = 'flex flex-col items-center bg-gray-800 p-3 rounded-xl border border-yellow-500 animate-bounce';
        pDiv.innerHTML = `<div class="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center font-bold mb-2">P</div>
                          <span class="text-xs">${name}</span>`;
        foundContainer.appendChild(pDiv);
        
        if (found >= count - 1) {
            clearInterval(interval);
            setTimeout(() => {
                document.getElementById('matchmaking').classList.add('hidden');
                window.startGame();
            }, 1500);
        }
    }, 800 + Math.random() * 400);
};

const startGame = () => {
    hideAllMenus();
    const hud = document.getElementById('hud');
    hud.style.opacity = '1';
    hud.style.display = 'flex';
    
    if (gameState.isMultiplayer) {
        document.getElementById('sticker-toggle').classList.remove('opacity-0');
        document.getElementById('sticker-toggle').classList.add('pointer-events-auto');
    } else {
        document.getElementById('sticker-toggle').classList.add('opacity-0');
        document.getElementById('sticker-toggle').classList.remove('pointer-events-auto');
    }

    gameState.isPaused = false;
    initGame();
};

const backToMain = () => {
    hideAllMenus();
    document.getElementById('main-menu').classList.remove('hidden');
};

setupMenuListeners(gameState, startMatchmaking, startGame, backToMain);

window.pauseGame = () => {
    if (!gameState.isGameActive) return;
    gameState.isPaused = true;
    document.getElementById('pause-menu').classList.remove('hidden');
    hideExitConfirm(); // Reset confirmation state if it was open
};

window.resumeGame = () => {
    gameState.isPaused = false;
    document.getElementById('pause-menu').classList.add('hidden');
    const currentPlayer = gameState.players[gameState.turn];
    if (currentPlayer && currentPlayer.isBot) {
        setTimeout(() => botMove(currentPlayer), 500);
    }
};

window.showExitConfirm = () => {
    document.getElementById('pause-main-content').classList.add('hidden');
    document.getElementById('exit-confirm-content').classList.remove('hidden');
};

window.hideExitConfirm = () => {
    document.getElementById('pause-main-content').classList.remove('hidden');
    document.getElementById('exit-confirm-content').classList.add('hidden');
};

window.exitGame = () => {
    gameState.isGameActive = false;
    updateTurnIndicator(null, false);
    const ptr = document.getElementById('turn-ptr');
    if (ptr) {
        ptr.style.opacity = '0';
        gsap.killTweensOf(ptr);
    }
    hideAllMenus();
    const hud = document.getElementById('hud');
    hud.style.opacity = '0';
    hud.style.display = 'none';
    document.getElementById('sticker-toggle').classList.add('opacity-0');
    document.getElementById('sticker-toggle').classList.remove('pointer-events-auto');
    document.getElementById('main-menu').classList.remove('hidden');
    // Clean up cards from previous game
    document.getElementById('table-cards').innerHTML = '';
    document.getElementById('player-hand').innerHTML = '';
    document.getElementById('opponent-hand-top').innerHTML = '';
    document.getElementById('opponent-hand-left').innerHTML = '';
    document.getElementById('opponent-hand-right').innerHTML = '';
};

window.updateUserName = (name) => {
    const trimmed = name.trim();
    if (trimmed) {
        gameState.settings.userName = trimmed;
        localStorage.setItem('four_leaf_user_name', trimmed);
        console.log("Name saved to storage:", trimmed);
    } else {
        localStorage.removeItem('four_leaf_user_name');
        gameState.settings.userName = "";
    }
};

window.toggleStickerPanel = () => {
    const panel = document.getElementById('sticker-panel');
    const isHidden = panel.classList.contains('opacity-0');
    panel.classList.toggle('opacity-0', !isHidden);
    panel.classList.toggle('pointer-events-none', !isHidden);
};

window.sendSticker = (sticker) => {
    if (!gameState.isMultiplayer) return;
    showStickerUI(sticker, 0);
    window.toggleStickerPanel();
};

function initGame() {
    gameState.deck = createDeck(SUITS, VALUES, NUMERIC_VALUES);
    shuffle(gameState.deck);
    
    // Assign random name if user didn't provide one and it's not in localStorage
    if (!gameState.settings.userName || gameState.settings.userName.trim() === "") {
        const stored = localStorage.getItem('four_leaf_user_name');
        if (stored) {
            gameState.settings.userName = stored;
        } else {
            gameState.settings.userName = generateGenericName();
        }
    }

    gameState.players = [];
    const difficulties = ['easy', 'medium', 'hard'];
    for (let i = 0; i < gameState.settings.playerCount; i++) {
        let name;
        if (i === 0) {
            name = gameState.settings.userName;
        } else if (gameState.isMultiplayer && gameState.pendingOpponents[i-1]) {
            name = gameState.pendingOpponents[i-1];
        } else {
            // Use "Robot X" for bot names
            name = `ربات ${i}`;
        }
        
        const botDifficulty = gameState.isMultiplayer 
            ? difficulties[Math.floor(Math.random() * difficulties.length)] 
            : gameState.settings.botDifficulty;
            
        gameState.players.push({
            id: i,
            name: name,
            hand: [],
            captured: [],
            totalScore: 0,
            sursCount: 0,
            isBot: i !== 0,
            difficulty: botDifficulty
        });
        
        // Update visual labels
        const label = document.getElementById(`name-label-${i}`);
        if (label) {
            label.innerText = name;
            label.style.display = 'block';
        }
    }
    
    // Hide unused labels
    for (let i = gameState.settings.playerCount; i < 4; i++) {
        const label = document.getElementById(`name-label-${i}`);
        if (label) label.style.display = 'none';
    }
    
    gameState.table = [];
    gameState.turn = 0;
    gameState.isGameActive = true;
    gameState.lastTaker = null;
    gameState.activeCard = null;

    dealInitial();
}

// tombstone: removed function createDeck()
// tombstone: removed function shuffle(array)

// --- Game Logic ---

function concludeHand() {
    if (gameState.isHandEnding) return;
    gameState.isHandEnding = true;

    // Last cards go to last taker
    if (gameState.lastTaker !== null) {
        gameState.players[gameState.lastTaker].captured.push(...gameState.table);
        gameState.table = [];
    }

    // Calculate hand scores and add to total
    gameState.players.forEach(p => {
        const breakdown = calculateCurrentScore(gameState.players, p.id, true);
        p.totalScore += breakdown.total;
    });

    renderBoard(gameState, playCard); // Visual update for last cards

    // Check if game is over
    const maxScore = Math.max(...gameState.players.map(p => p.totalScore));
    if (maxScore >= gameState.settings.targetScore) {
        gameState.isGameActive = false;
        updateTurnIndicator(null, false);
        setTimeout(() => showLeaderboard(gameState), 1500);
    } else {
        // Start next hand
        setTimeout(() => {
            startNextHand();
        }, 3000);
    }
}

function startNextHand() {
    gameState.isHandEnding = false;
    gameState.deck = createDeck(SUITS, VALUES, NUMERIC_VALUES);
    shuffle(gameState.deck);
    
    gameState.players.forEach(p => {
        p.captured = [];
        p.hand = [];
        p.sursCount = 0;
    });

    gameState.table = [];
    gameState.lastTaker = null;
    dealInitial();
}

function endGame() {
    gameState.isGameActive = false;
    updateTurnIndicator(null, false);
    showLeaderboard(gameState);
}

function dealInitial() {
    gameState.dealing = true;
    for (let i = 0; i < 4; i++) {
        const card = gameState.deck.pop();
        if (card) gameState.table.push(card);
    }
    
    gameState.players.forEach(p => {
        for (let i = 0; i < 4; i++) {
            const card = gameState.deck.pop();
            if (card) p.hand.push(card);
        }
    });
    
    renderBoard(gameState, playCard);
    playSound('sfx_deal');
    gameState.dealing = false;
    checkTurn();
}

function dealRound() {
    if (gameState.deck.length === 0) {
        endGame();
        return;
    }
    
    gameState.players.forEach(p => {
        for (let i = 0; i < 4; i++) {
            p.hand.push(gameState.deck.pop());
        }
    });
    
    renderBoard(gameState, playCard);
    playSound('sfx_deal');
    checkTurn();
}

function checkTurn() {
    if (!gameState.isGameActive) return;
    const currentPlayer = gameState.players[gameState.turn];
    updateTurnIndicator(gameState.turn);

    if (currentPlayer.isBot) {
        const delays = { 1: 2500, 2: 1500, 3: 800 };
        const delay = delays[gameState.settings.gameSpeed] || 1500;
        setTimeout(() => botMove(currentPlayer), delay);
    }
}

function botMove(bot) {
    if (!gameState.isGameActive || gameState.isPaused) return;

    // Chance to send sticker - Only allowed in Multiplayer mode to simulate real players
    if (gameState.isMultiplayer && Math.random() > 0.82) {
        const emojis = ['😊', '😂', '😠', '😮', '😎', '🤔', '🥳', '😱', '👍', '👎', '🔥', '❤️', '🃏', '👑', '🤫'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        showStickerUI(randomEmoji, bot.id);
    }
    
    let cardToPlay = bot.hand[0];
    for (let card of bot.hand) {
        const possible = getPossibleTakes(card, gameState.table);
        if (possible.length > 0) {
            cardToPlay = card;
            break;
        }
    }
    
    playCard(bot.id, cardToPlay);
}

async function playCard(playerId, card) {
    if (gameState.isPaused || gameState.dealing || gameState.processing) return;
    
    const speedFactor = [2, 1, 0.5][gameState.settings.gameSpeed - 1] || 1;
    gameState.processing = true;

    const player = gameState.players[playerId];
    player.hand = player.hand.filter(c => c !== card);
    
    // 1. Move card to table visually first
    gameState.table.push(card);
    gameState.activeCard = card; // Set active card to highlight it
    renderBoard(gameState, playCard);
    
    // 2. Wait for players to see the played card (using a shorter delay for better flow)
    const baseDelay = 1200 * speedFactor;
    await new Promise(resolve => setTimeout(resolve, baseDelay));

    if (!gameState.isGameActive || gameState.isPaused) {
        gameState.processing = false;
        return;
    }
    
    gameState.activeCard = null; 

    // 3. Check for takes after the display delay
    const takes = getPossibleTakes(card, gameState.table.filter(c => c !== card));
    
    if (takes.length > 0) {
        const capturedCards = [card, ...takes];
        const movePoints = evaluateCardsValue(capturedCards);
        
        // Visual: Trigger the capture animation
        import('./renderer.js').then(m => m.animateCollectCards(capturedCards, playerId));
        
        player.captured.push(...capturedCards);
        gameState.table = gameState.table.filter(c => !capturedCards.includes(c));
        gameState.lastTaker = playerId;
        
        let surPoints = 0;
        const isLastRound = gameState.deck.length === 0;
        const anyCardsLeftInHands = gameState.players.some(p => p.hand.length > 0);
        
        const canSurWithJack = gameState.settings.allowJackSur || card.value !== 'J';
        const canSurLastCard = gameState.settings.allowLastCardSur || (anyCardsLeftInHands || !isLastRound);

        if (gameState.table.length === 0 && canSurWithJack && canSurLastCard) {
            player.sursCount++;
            surPoints = 5;
            showSur();
            
            if (gameState.settings.cancelOpponentSur) {
                gameState.players.forEach(p => {
                    if (p.id !== playerId && p.sursCount > 0) {
                        p.sursCount--;
                        showPointsPopup(-5, p.id);
                    }
                });
            }
        }
        
        const totalPointsGained = movePoints + surPoints;
        if (totalPointsGained > 0) {
            showPointsPopup(totalPointsGained, playerId);
        }
        
        playSound('sfx_take');
        // Delay turn progression for capture animation
        await new Promise(resolve => setTimeout(resolve, 800 * speedFactor));
    }
    
    renderBoard(gameState, playCard);
    
    gameState.turn = (gameState.turn + 1) % gameState.players.length;
    gameState.processing = false;
    
    const allHandsEmpty = gameState.players.every(p => p.hand.length === 0);
    if (allHandsEmpty) {
        if (gameState.deck.length === 0) {
            concludeHand();
        } else {
            const delays = { 1: 1500, 2: 1000, 3: 500 };
            const delay = delays[gameState.settings.gameSpeed] || 1000;
            setTimeout(dealRound, delay);
        }
    } else {
        checkTurn();
    }
}

// tombstone: removed function getPossibleTakes(playedCard, tableCards)

// --- UI Rendering ---

// tombstone: removed renderBoard() (moved to renderer.js)
// tombstone: removed endGame() (moved to renderer.js)