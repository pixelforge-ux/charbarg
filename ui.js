import gsap from 'gsap';
import { playSound } from './audio.js';

export function createCardUI(card, cardBackIndex, isBack = false) {
    const div = document.createElement('div');
    div.className = 'card';
    
    // Ultra high quality graphics styles
    div.style.boxShadow = '0 20px 40px rgba(0,0,0,0.8), inset 0 0 20px rgba(212, 175, 55, 0.3)';
    div.style.border = '1px solid rgba(212, 175, 55, 0.5)';
    div.style.transition = 'filter 0.4s ease, transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease';

    if (isBack) {
        div.style.backgroundImage = `url('card_back_${cardBackIndex}.png')`;
    } else {
        const suitChar = card.suit[0];
        const val = card.value === '10' ? '0' : card.value;
        const imgUrl = `https://deckofcardsapi.com/static/img/${val}${suitChar.toUpperCase()}.png`;
        div.style.backgroundImage = `url('${imgUrl}')`;
        div.style.backgroundSize = '100% 100%';
    }
    return div;
}

export function showSur() {
    playSound('sfx_sur');
    const el = document.getElementById('sur-text');
    gsap.set(el, { scale: 0.5, opacity: 0 });
    gsap.to(el, { opacity: 1, scale: 1.2, duration: 0.5, ease: "back.out(1.7)", onComplete: () => {
        gsap.to(el, { opacity: 0, scale: 2, delay: 0.8, duration: 0.4 });
    }});
}

export function animateCardMove(cardDiv, targetPos, duration = 0.5, delay = 0) {
    return gsap.to(cardDiv, {
        left: targetPos.left,
        top: targetPos.top,
        bottom: targetPos.bottom !== undefined ? targetPos.bottom : 'auto',
        right: targetPos.right !== undefined ? targetPos.right : 'auto',
        rotation: targetPos.rotation || 0,
        duration,
        delay,
        ease: "power2.out"
    });
}

export function updateTurnIndicator(playerId, isActive = true) {
    const ptr = document.getElementById('turn-ptr');
    if (!ptr) return;

    gsap.killTweensOf(ptr);
    gsap.set(ptr, { y: 0 }); // Reset vertical float offset

    if (!isActive || playerId === null || playerId === undefined) {
        gsap.to(ptr, { opacity: 0, duration: 0.2, onComplete: () => {
            ptr.style.display = 'none';
        }});
        return;
    }
    ptr.style.display = 'block';

    const targets = {
        0: { left: '50%', bottom: '170px', top: 'auto', right: 'auto', rotation: 0 },
        1: { left: '50%', top: '140px', bottom: 'auto', right: 'auto', rotation: 180 },
        2: { left: '140px', top: '50%', right: 'auto', bottom: 'auto', rotation: 90 },
        3: { right: '140px', top: '50%', left: 'auto', bottom: 'auto', rotation: -90 }
    };

    const config = targets[playerId];
    if (!config) return;

    gsap.set(ptr, { y: 0 });
    gsap.to(ptr, {
        opacity: 1,
        left: config.left,
        top: config.top,
        bottom: config.bottom,
        right: config.right,
        xPercent: -50,
        yPercent: -50,
        rotation: config.rotation,
        duration: 0.5,
        ease: "back.out(1.2)",
        onComplete: () => {
            gsap.to(ptr, {
                y: -15,
                duration: 0.8,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }
    });
}

export function showPointsPopup(points, playerId) {
    if (points === 0) return;
    
    const popup = document.createElement('div');
    const isNegative = points < 0;
    popup.className = `absolute z-[100] font-black text-2xl ${isNegative ? 'text-red-500' : 'text-yellow-400'} pointer-events-none drop-shadow-lg`;
    popup.innerText = `${points > 0 ? '+' : ''}${points.toLocaleString('fa-IR')}`;
    
    const targets = {
        0: { left: '50%', bottom: '210px' },
        1: { left: '50%', top: '180px' },
        2: { left: '180px', top: '50%' },
        3: { right: '180px', top: '50%' }
    };

    const config = targets[playerId] || targets[0];
    Object.assign(popup.style, config);
    document.getElementById('game-canvas').appendChild(popup);

    gsap.fromTo(popup, 
        { scale: 0.5, opacity: 0, y: 0 },
        { 
            scale: 1.5, 
            opacity: 1, 
            y: -50, 
            duration: 0.8, 
            ease: "back.out(2)",
            onComplete: () => {
                gsap.to(popup, { opacity: 0, y: -100, duration: 0.4, onComplete: () => popup.remove() });
            }
        }
    );
}

export function showStickerUI(sticker, playerId) {
    const bubble = document.createElement('div');
    bubble.className = 'absolute z-[110] bg-white/10 backdrop-blur-md rounded-full w-12 h-12 flex items-center justify-center text-2xl shadow-xl pointer-events-none border border-white/20';
    bubble.innerText = sticker;

    // Add float animation class
    bubble.style.animation = 'float-sticker 1s ease-in-out infinite alternate';

    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes float-sticker {
            from { transform: translateY(0px) scale(1); }
            to { transform: translateY(-10px) scale(1.1); }
        }
    `;
    if (!document.getElementById('sticker-anim-style')) {
        style.id = 'sticker-anim-style';
        document.head.appendChild(style);
    }

    const targets = {
        0: { left: 'calc(50% + 80px)', bottom: '100px' },
        1: { left: 'calc(50% + 80px)', top: '100px' },
        2: { left: '100px', top: 'calc(50% - 60px)' },
        3: { right: '100px', top: 'calc(50% - 60px)' }
    };

    const config = targets[playerId] || targets[0];
    Object.assign(bubble.style, config);
    document.getElementById('game-canvas').appendChild(bubble);

    gsap.fromTo(bubble, 
        { scale: 0, rotation: -20 },
        { 
            scale: 1, 
            rotation: 0, 
            duration: 0.4, 
            ease: "back.out(2)",
            onComplete: () => {
                gsap.to(bubble, { 
                    y: -20, 
                    opacity: 0, 
                    delay: 2, 
                    duration: 0.5, 
                    onComplete: () => bubble.remove() 
                });
            }
        }
    );
}