import * as THREE from 'three';

export function initBackground3D(containerId, cardBackUrl) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0); // Transparent background
    container.appendChild(renderer.domElement);

    const loader = new THREE.TextureLoader();
    const cardTexture = loader.load(cardBackUrl);
    
    // Add Lighting for "Higher Graphics"
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xd4af37, 2, 20);
    pointLight.position.set(2, 5, 5);
    scene.add(pointLight);

    const cardGeometry = new THREE.PlaneGeometry(0.8, 1.1);
    const cardMaterial = new THREE.MeshStandardMaterial({ 
        map: cardTexture, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
        roughness: 0.1,
        metalness: 0.8,
        emissive: new THREE.Color(0xd4af37),
        emissiveIntensity: 0.1
    });

    const cards = [];
    const count = 40; // Increased count for better visual density

    for (let i = 0; i < count; i++) {
        const card = new THREE.Mesh(cardGeometry, cardMaterial);
        resetCard(card);
        // Stagger initial positions
        card.position.y = Math.random() * 25 - 10;
        scene.add(card);
        cards.push(card);
    }

    camera.position.z = 6;

    function resetCard(card) {
        card.position.x = (Math.random() - 0.5) * 20;
        card.position.y = 10 + Math.random() * 10;
        card.position.z = (Math.random() - 0.5) * 6;
        card.rotation.x = Math.random() * Math.PI * 2;
        card.rotation.y = Math.random() * Math.PI * 2;
        card.rotation.z = Math.random() * Math.PI * 2;
        card.userData.speed = 0.015 + Math.random() * 0.035;
        card.userData.rotSpeed = {
            x: (Math.random() - 0.5) * 0.04,
            y: (Math.random() - 0.5) * 0.04,
            z: (Math.random() - 0.5) * 0.04
        };
    }

    function animate() {
        requestAnimationFrame(animate);

        cards.forEach(card => {
            card.position.y -= card.userData.speed;
            card.rotation.x += card.userData.rotSpeed.x;
            card.rotation.y += card.userData.rotSpeed.y;
            card.rotation.z += card.userData.rotSpeed.z;

            if (card.position.y < -8) {
                resetCard(card);
            }
        });

        renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
}