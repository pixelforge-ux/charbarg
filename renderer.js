import gsap from 'gsap';
import { createCardUI } from './ui.js';
import { calculateCurrentScore } from './engine.js';

export function renderBoard(gameState, playCardAction) {
    const tableEl = document.getElementById('table-cards');
    const handContainers = {
        0: document.getElementById('player-hand'),
        1: document.getElementById('opponent-hand-top'),
        2: document.getElementById('opponent-hand-left'),
        3: document.getElementById('opponent-hand-right')
    };
    
    tableEl.innerHTML = '';
    Object.values(handContainers).forEach(el => el.innerHTML = '');

    gameState.table.forEach((card, i) => {
        const isActive = card === gameState.activeCard;
        const cardDiv = createCardUI(card, gameState.settings.cardBack);
        const angle = (i * 15) % 360;
        const left = `calc(50% - 32px + ${(i % 4 - 1.5) * 25}px)`;
        const top = `calc(50% - 45px + ${(Math.floor(i/4) - 0.5) * 25}px)`;
        
        cardDiv.style.left = left;
        cardDiv.style.top = top;
        cardDiv.style.transform = `rotate(${angle - 7}deg)`;

        if (isActive) {
            cardDiv.style.zIndex = '100';
            cardDiv.style.boxShadow = '0 0 40px #d4af37, 0 0 20px #d4af37';
            cardDiv.style.transform = `rotate(${angle - 7}deg) scale(1.3) translateY(-10px)`;
            cardDiv.style.border = '2px solid #d4af37';
        }

        tableEl.appendChild(cardDiv);
        
        if (!card.animPlayed) {
            card.animPlayed = true;
            gsap.from(cardDiv, { scale: 0, rotation: 360, duration: 0.3, ease: "back.out" });
        }
    });
    
    gameState.players.forEach((player, pIdx) => {
        const container = handContainers[pIdx];
        if (!container) return;

        player.hand.forEach((card, cIdx) => {
            const isSelf = pIdx === 0;
            const cardDiv = createCardUI(card, gameState.settings.cardBack, !isSelf);
            
            if (isSelf) {
                cardDiv.style.pointerEvents = 'auto';
                cardDiv.onclick = () => {
                    if (gameState.turn === 0 && !gameState.dealing && !gameState.processing) playCardAction(0, card);
                };
                const offset = (cIdx - (player.hand.length - 1) / 2) * 85;
                const rotation = (cIdx - (player.hand.length - 1) / 2) * 6;
                const yOffset = Math.abs(cIdx - (player.hand.length - 1) / 2) * 4;

                cardDiv.style.left = `calc(50% - 32px + ${offset}px)`;
                cardDiv.style.bottom = `${10 - yOffset}px`;
                cardDiv.style.transform = `rotate(${rotation}deg)`;
                
                if (!card.animPlayed) {
                    card.animPlayed = true;
                    gsap.from(cardDiv, { 
                        y: 150, 
                        rotation: rotation + (Math.random() * 20 - 10), 
                        opacity: 0, 
                        duration: 0.6, 
                        ease: "back.out(1.2)",
                        delay: cIdx * 0.08 
                    });
                }
            } else {
                if (pIdx === 1) { // Top
                    const offset = (cIdx - (player.hand.length - 1) / 2) * 40;
                    cardDiv.style.left = `calc(50% - 32px + ${offset}px)`;
                    cardDiv.style.top = '0';
                    cardDiv.style.transform = 'rotate(180deg)';
                } else if (pIdx === 2) { // Left
                    const offset = (cIdx - (player.hand.length - 1) / 2) * 30;
                    cardDiv.style.top = `calc(50% - 45px + ${offset}px)`;
                    cardDiv.style.left = '0';
                    cardDiv.style.transform = 'rotate(90deg)';
                } else if (pIdx === 3) { // Right
                    const offset = (cIdx - (player.hand.length - 1) / 2) * 30;
                    cardDiv.style.top = `calc(50% - 45px + ${offset}px)`;
                    cardDiv.style.right = '0';
                    cardDiv.style.transform = 'rotate(-90deg)';
                }

                if (!card.animPlayed) {
                    card.animPlayed = true;
                    const axis = (pIdx === 1) ? 'y' : 'x';
                    const val = (pIdx === 1 || pIdx === 2) ? -150 : 150;
                    gsap.from(cardDiv, { 
                        [axis]: val, 
                        rotation: pIdx === 1 ? 180 : (pIdx === 2 ? 90 : -90),
                        opacity: 0, 
                        duration: 0.6, 
                        ease: "power2.out",
                        delay: cIdx * 0.08 
                    });
                }
            }
            container.appendChild(cardDiv);
        });
    });
    
    updateScoreboardUI(gameState);
}

export function animateCollectCards(cards, playerId) {
    const tableCards = document.querySelectorAll('#table-cards .card');
    const targets = {
        0: { x: 0, y: 500, opacity: 0, scale: 0.5 },
        1: { x: 0, y: -500, opacity: 0, scale: 0.5 },
        2: { x: -500, y: 0, opacity: 0, scale: 0.5 },
        3: { x: 500, y: 0, opacity: 0, scale: 0.5 }
    };
    const config = targets[playerId] || targets[0];

    cards.forEach((card, idx) => {
        // Find the DOM element for this card. 
        // This is tricky because we recreate cards on render, but cards objects have properties.
        // We look for a card div that hasn't been removed yet.
        // Simplified: animate ALL cards in the 'cards' list that are currently in the DOM.
        tableCards.forEach(el => {
            // We'll use a data attribute or simple match if we had unique IDs.
            // Since we don't, we'll animate based on the fact that these cards were just played.
            // For now, let's look at the style backgroundImage which contains the suit/val
            const suitChar = card.suit[0].toUpperCase();
            const valChar = card.value === '10' ? '0' : card.value;
            if (el.style.backgroundImage.includes(`${valChar}${suitChar}`)) {
                gsap.to(el, {
                    ...config,
                    duration: 0.8,
                    delay: idx * 0.05,
                    rotation: 720,
                    ease: "power2.in",
                    onComplete: () => el.remove()
                });
            }
        });
    });
}

function updateScoreboardUI(gameState) {
    const scoresContainer = document.getElementById('scores-container');
    scoresContainer.innerHTML = '';
    gameState.players.forEach((p, i) => {
        const badge = document.createElement('div');
        badge.className = 'score-badge whitespace-nowrap bg-black/40 text-xs flex items-center gap-1';
        if (gameState.turn === i && gameState.isGameActive) badge.classList.add('border-yellow-400', 'bg-yellow-400/20');
        
        const currentHandScore = calculateCurrentScore(gameState.players, i).total;
        const displayScore = p.totalScore + currentHandScore;

        badge.innerHTML = `
            <span dir="auto" class="font-bold">${p.name}</span>: 
            <span class="text-yellow-400">${displayScore.toLocaleString('fa-IR')}</span>
        `;
        scoresContainer.appendChild(badge);
    });

    document.getElementById('deck-count').innerText = `بانک: ${gameState.deck.length.toLocaleString('fa-IR')}`;
    
    // Ensure labels are visible
    gameState.players.forEach((p, i) => {
        const label = document.getElementById(`name-label-${i}`);
        if (label) label.innerText = p.name;
    });
}

export function showLeaderboard(gameState) {
    const leaderboard = document.getElementById('leaderboard');
    const content = document.getElementById('leaderboard-content');
    content.innerHTML = '';

    const results = gameState.players.map(p => ({
        id: p.id,
        name: p.name,
        totalScore: p.totalScore
    }));

    results.sort((a, b) => b.totalScore - a.totalScore);

    results.forEach((res, index) => {
        const isUser = res.id === 0;
        const row = document.createElement('div');
        row.className = `p-4 rounded-2xl border ${isUser ? 'border-yellow-500 bg-yellow-500/10' : 'border-gray-700 bg-gray-800/50'}`;
        
        row.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="font-bold text-lg ${isUser ? 'text-yellow-400' : 'text-white'}">
                    ${index + 1}. ${res.name}
                </span>
                <span class="text-2xl font-black text-yellow-500">${res.totalScore.toLocaleString('fa-IR')} امتیاز</span>
            </div>
        `;
        content.appendChild(row);
    });

    leaderboard.classList.remove('hidden');
}