export function hideAllMenus() {
    const menus = ['main-menu', 'bot-setup', 'online-setup', 'matchmaking', 'settings-menu', 'pause-menu', 'leaderboard'];
    menus.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
}

export function setupMenuListeners(gameState, startMatchmaking, startGame, backToMain) {
    // Advanced Settings Window functions
    window.updateTargetScore = (val) => {
        gameState.settings.targetScore = parseInt(val);
        document.getElementById('target-score-val').innerText = val.toLocaleString('fa-IR');
    };

    window.updateGameSpeed = (val) => {
        const labels = { 1: 'آرام', 2: 'متوسط', 3: 'سریع' };
        gameState.settings.gameSpeed = parseInt(val);
        document.getElementById('game-speed-val').innerText = labels[val];
    };

    window.toggleRule = (ruleKey) => {
        gameState.settings[ruleKey] = !gameState.settings[ruleKey];
        const btn = document.getElementById(`rule-${ruleKey}`);
        btn.innerText = gameState.settings[ruleKey] ? 'فعال' : 'غیرفعال';
        btn.classList.toggle('active', gameState.settings[ruleKey]);
    };

    // Initialize defaults visually
    window.updateTargetScore(62);
    window.updateGameSpeed(2);
    ['allowJackSur', 'allowLastCardSur', 'cancelOpponentSur'].forEach(k => {
        gameState.settings[k] = false;
        const btn = document.getElementById(`rule-${k}`);
        if(btn) btn.classList.remove('active');
    });

    const checkName = () => {
        const input = document.getElementById('user-name-input');
        const error = document.getElementById('name-error');
        if (!input.value.trim()) {
            input.classList.add('border-red-500', 'animate-pulse');
            error.innerText = "برای بازی نام خود را وارد کنید";
            error.classList.remove('hidden');
            setTimeout(() => {
                input.classList.remove('border-red-500', 'animate-pulse');
            }, 2000);
            return false;
        }
        error.classList.add('hidden');
        return true;
    };

    window.showBotSetup = () => {
        if (!checkName()) return;
        gameState.isMultiplayer = false;
        hideAllMenus();
        document.getElementById('bot-setup').classList.remove('hidden');
        window.setPlayerCount(gameState.settings.playerCount);
    };

    window.showOnlineSetup = () => {
        if (!checkName()) return;
        gameState.isMultiplayer = true;
        hideAllMenus();
        document.getElementById('online-setup').classList.remove('hidden');
        window.setPlayerCount(gameState.settings.playerCount);
    };

    window.startMatchmaking = startMatchmaking;
    window.startGame = startGame;
    window.backToMain = backToMain;

    window.showSettings = () => {
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('settings-menu').classList.remove('hidden');
    };

    window.setPlayerCount = (n) => {
        gameState.settings.playerCount = n;
        [2, 3, 4].forEach(num => {
            const botEl = document.getElementById(`pc-${num}`);
            const onlineEl = document.getElementById(`pc-online-${num}`);
            if (botEl) botEl.classList.toggle('opacity-50', num !== n);
            if (onlineEl) onlineEl.classList.toggle('opacity-50', num !== n);
        });
    };

    window.setCardBack = (n) => {
        gameState.settings.cardBack = n;
        [1, 2, 3].forEach(num => {
            document.getElementById(`cb-${num}`).classList.toggle('active', num === n);
        });
    };

    window.setCarpet = (n) => {
        gameState.settings.carpet = n;
        document.getElementById('game-canvas').style.backgroundImage = `url('carpet_${n}.png')`;
        [1, 2, 3].forEach(num => {
            document.getElementById(`cp-${num}`).classList.toggle('active', num === n);
        });
    };
}