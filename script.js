import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

// UI Elementlar
const uiLayer = document.getElementById('ui-layer');
const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');
const bgMusic = document.getElementById('bg-music');
const mainContent = document.getElementById('main-content');

// Boshlang'ich animatsiyalar
setTimeout(() => {
    const title = document.getElementById('grand-title');
    title.style.display = 'block';
    title.classList.add('animate-pop-in');
    
    confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.5 },
        colors: ['#ffb6c1', '#ff69b4', '#ffffff', '#ffd700'],
        zIndex: 1000 
    });
    
    setTimeout(() => {
        const qBox = document.getElementById('question-box');
        qBox.style.display = 'block';
        qBox.classList.add('animate-fade-in');
    }, 2500);
}, 800); 

btnNo.addEventListener('mouseover', function() {
    const x = Math.random() * 200 - 100;
    const y = Math.random() * 100 - 50;
    this.style.transform = `translate(${x}px, ${y}px)`;
});
btnNo.addEventListener('click', () => {
    alert("Sizda tanlov yo'q! Baribir ko'rasiz! 😁");
    btnYes.click(); 
});

    btnYes.addEventListener('click', () => {
        uiLayer.style.opacity = '0';
        setTimeout(() => { uiLayer.style.display = 'none'; }, 1500);
        
        bgMusic.volume = 0.6;
        // bgMusic.play() ni olib tashladik, o'rniga tugmani ko'rsatamiz
        document.getElementById('music-control').style.display = 'block';
        
        setTimeout(() => {
            createPuzzleEffect();
        }, 500);
    });

// Rasmni parchalardan yig'ish
let isAssembled = false;

function createPuzzleEffect() {
    const container = document.getElementById('puzzle-container');
    container.style.display = 'block';
    
    // Rasm butun ekranni egallashi uchun 100% o'lcham olamiz
    let screenW = window.innerWidth;
    let screenH = window.innerHeight;
    container.style.width = screenW + 'px';
    container.style.height = screenH + 'px';
    
    // Asil rasm proporsiyasi (960x720 -> 4:3). "object-fit: cover" mantiqi:
    let imgRatio = 960 / 720; 
    let screenRatio = screenW / screenH;
    let bgW, bgH;
    
    if (screenRatio > imgRatio) {
        bgW = screenW;
        bgH = screenW / imgRatio;
    } else {
        bgH = screenH;
        bgW = screenH * imgRatio;
    }
    
    // Rasmni markazga to'g'irlash uchun ofsetlar
    let offsetX = (bgW - screenW) / 2;
    let offsetY = (bgH - screenH) / 2;

    const rows = 12; 
    const cols = 16; 
    const pieceWidth = screenW / cols;
    const pieceHeight = screenH / rows;

    for(let r=0; r<rows; r++) {
        for(let c=0; c<cols; c++) {
            const piece = document.createElement('div');
            piece.className = 'puzzle-piece';
            
            piece.style.width = (pieceWidth + 1.5) + 'px';
            piece.style.height = (pieceHeight + 1.5) + 'px';
            piece.style.left = (c * pieceWidth) + 'px';
            piece.style.top = (r * pieceHeight) + 'px';
            
            piece.style.backgroundSize = `${bgW}px ${bgH}px`;
            piece.style.backgroundPosition = `-${c * pieceWidth + offsetX}px -${r * pieceHeight + offsetY}px`;
            
            const tx = (Math.random() - 0.5) * 3000;
            const ty = (Math.random() - 0.5) * 3000;
            const tz = (Math.random() - 0.5) * 3000;
            const rotX = (Math.random() - 0.5) * 1080;
            const rotY = (Math.random() - 0.5) * 1080;
            
            piece.style.transform = `translate3d(${tx}px, ${ty}px, ${tz}px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(0)`;
            piece.style.opacity = '0';
            
            // Scroll uchun tezlik (velocity) saqlab qo'yamiz
            let index = r * cols + c;
            piece.dataset.vx = (Math.sin(index * 123) - 0.5) * 4;
            piece.dataset.vy = (Math.cos(index * 321) - 0.5) * 4;
            piece.dataset.vz = (Math.sin(index * 213) - 0.5) * 4;
            piece.dataset.rx = (Math.cos(index * 111) - 0.5) * 1.5;
            piece.dataset.ry = (Math.sin(index * 222) - 0.5) * 1.5;
            
            container.appendChild(piece);
        }
    }
    
    setTimeout(() => {
        const pieces = document.querySelectorAll('.puzzle-piece');
        pieces.forEach((piece) => {
            setTimeout(() => {
                piece.style.transform = `translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) scale(1)`;
                piece.style.opacity = '1';
                piece.style.boxShadow = 'none';
                piece.style.border = 'none';
            }, Math.random() * 2500); 
        });
    }, 100);
    
    setTimeout(() => {
        // Rasm butun ekranni egallab turadi, chetlariga yumshoq maska (gradient)
        container.style.maskImage = 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0.1) 100%)';
        container.style.webkitMaskImage = 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0.1) 100%)';
        
        // Animatsiyani to'xtatamiz (scroll tezkor ishlashi uchun)
        const pieces = document.querySelectorAll('.puzzle-piece');
        pieces.forEach(p => p.style.transition = 'none');
        isAssembled = true;
        
        start3DZoom(); 
    }, 3500);
}

// Scroll qilinganda rasmni parchalash logikasi
window.addEventListener('scroll', () => {
    if (!isAssembled) return;
    
    const scrollY = window.scrollY;
    const pieces = document.querySelectorAll('.puzzle-piece');
    const container = document.getElementById('puzzle-container');
    
    // Maskani olib tashlaymiz (bo'laklar butun ekranga ucha olishi uchun)
    if (scrollY > 20) {
        container.style.maskImage = 'none';
        container.style.webkitMaskImage = 'none';
    } else {
        container.style.maskImage = 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0.1) 100%)';
        container.style.webkitMaskImage = 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0.1) 100%)';
    }

    pieces.forEach((piece) => {
        const vx = parseFloat(piece.dataset.vx);
        const vy = parseFloat(piece.dataset.vy);
        const vz = parseFloat(piece.dataset.vz);
        const rx = parseFloat(piece.dataset.rx);
        const ry = parseFloat(piece.dataset.ry);
        
        const tx = scrollY * vx;
        const ty = scrollY * vy;
        const tz = scrollY * vz;
        const rotX = scrollY * rx;
        const rotY = scrollY * ry;
        
        const opacity = Math.max(1 - (scrollY / 800), 0); // 800px pastga tushguncha yo'qoladi
        
        piece.style.transform = `translate3d(${tx}px, ${ty}px, ${tz}px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1)`;
        piece.style.opacity = opacity;
    });
    
    container.style.opacity = Math.max(1 - (scrollY / 800), 0);
    if (scrollY > 800) {
        container.style.pointerEvents = 'none'; // Elementlarni bloklamasligi uchun
    } else {
        container.style.pointerEvents = 'auto';
    }
});

function start3DZoom() {
    mainContent.style.display = 'block';
    
    let zoomInterval = setInterval(() => {
        if (camera.position.z > 80) {
            camera.position.z -= 1.0;
        } else {
            clearInterval(zoomInterval);
            controls.enableZoom = true;
        }
    }, 20);
}

const container3D = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x1a0a1e, 0.002);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 150);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container3D.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.0;
controls.enableZoom = false;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0xff69b4, 3, 300);
pointLight1.position.set(30, 30, 30);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x8a2be2, 3, 300);
pointLight2.position.set(-30, -30, 30);
scene.add(pointLight2);

// Orqa fonda faqat yuraklar va koinot yulduzlari qoldi.


const hearts = [];
const heartShape = new THREE.Shape();
const x = 0, y = 0;
heartShape.moveTo( x + 5, y + 5 );
heartShape.bezierCurveTo( x + 5, y + 5, x + 4, y, x, y );
heartShape.bezierCurveTo( x - 6, y, x - 6, y + 7,x - 6, y + 7 );
heartShape.bezierCurveTo( x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19 );
heartShape.bezierCurveTo( x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7 );
heartShape.bezierCurveTo( x + 16, y + 7, x + 16, y, x + 10, y );
heartShape.bezierCurveTo( x + 7, y, x + 5, y + 5, x + 5, y + 5 );

const extrudeSettings = { depth: 1.5, bevelEnabled: true, bevelSegments: 3, steps: 2, bevelSize: 0.5, bevelThickness: 0.5 };
const heartGeo = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
heartGeo.center();
heartGeo.rotateZ(Math.PI);

const heartMat = new THREE.MeshStandardMaterial({ 
    color: 0xff1493, metalness: 0.7, roughness: 0.1, emissive: 0x330011
});

for(let i=0; i<60; i++) {
    const heart = new THREE.Mesh(heartGeo, heartMat);
    heart.position.set((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200);
    heart.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
    const scale = Math.random() * 0.2 + 0.05;
    heart.scale.set(scale, scale, scale);
    heart.userData = {
        rx: (Math.random() - 0.5) * 0.02, ry: (Math.random() - 0.5) * 0.02,
        rz: (Math.random() - 0.5) * 0.02, vy: Math.random() * 0.2 + 0.1
    };
    scene.add(heart);
    hearts.push(heart);
}

const particlesGeo = new THREE.BufferGeometry();
const particlesCount = 15000; // Juda ko'p yulduzlar
const posArray = new Float32Array(particlesCount * 3);
const colorsArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount; i++) {
    // Spiral gallaktika formulasi
    const radius = Math.random() * 400;
    const spinAngle = radius * 0.02;
    const branchAngle = ((i % 3) / 3) * Math.PI * 2; // 3 ta shox
    
    const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 40;
    const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 20;
    const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 40;

    posArray[i*3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    posArray[i*3+1] = randomY; 
    posArray[i*3+2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;
    
    // Koinot ranglari: To'q ko'kdan Pushtigacha (Deep blue to Pink)
    const mixedColor = new THREE.Color(0x00bfff).lerp(new THREE.Color(0xff69b4), Math.random());
    colorsArray[i*3] = mixedColor.r;
    colorsArray[i*3+1] = mixedColor.g;
    colorsArray[i*3+2] = mixedColor.b;
}

particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
particlesGeo.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
const particlesMat = new THREE.PointsMaterial({
    size: 1.5, vertexColors: true, blending: THREE.AdditiveBlending, transparent: true
});
const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
scene.add(particlesMesh);

const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    hearts.forEach(heart => {
        heart.rotation.x += heart.userData.rx; heart.rotation.y += heart.userData.ry; heart.position.y += heart.userData.vy;
        if (heart.position.y > 150) heart.position.y = -150;
    });
    particlesMesh.rotation.y = elapsedTime * 0.02;

    controls.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Instagram Karusel Logikasi
const instaCaptions = [
    `Jiddiy rasmga tushaman deb, ichida kulgisi qistab turgan holat. Qoshlar 10/10, lekin nigohlar "tezroq rasmga ol, bo'ynim og'rib ketdi" deyapti. 😅`,
    `Soch qanday turganini tekshirish jarayoni... yoki shunchaki "Kutishdan charchadim, qachon ovqatlanamiz?" pozasi. Baribir go'zal! 💅`,
    `Qachonki barcha darslar/ishlar tugab, o'zini dunyodagi eng baxtli insondek his qilganda! (Aslida ertaga erta turish kerakligini hali bilmaydi) 😎✨`,
    `Parijdan kelgan "Fransuzka"! Qizil beretka va maxsus "xira effekti"... Retrokamera deb o'ylaysiz, lekin aslida kamerani artish esdan chiqqan. Shunda ham vapshe stilda! 🗼🥐`,
    `Qilgan hazillarimga rozi bo'l, men seni juda yaxshi ko'raman! Alloh umringni ziyoda qilsin, kelajaging nurli bo'lsin. Alloh senga eng yaxshi jufti halolni nasib etsin, o'zingga esa insof bersin 😂 Ota-onangni baxtiga sen, sening baxtingga ota-onang doim sog' bo'lishsin! Seni yaxshi ko'raman! ❤️`
];
let instaSlideIndex = 0;

window.nextSlide = function() {
    setSlide((instaSlideIndex + 1) % 5);
}
window.prevSlide = function() {
    setSlide((instaSlideIndex - 1 + 5) % 5);
}
window.setSlide = function(index) {
    const slides = document.querySelectorAll('.insta-slide');
    const dots = document.querySelectorAll('.dot');
    const captionText = document.getElementById('insta-caption-text');
    
    if (!slides.length) return;
    
    slides[instaSlideIndex].classList.remove('active');
    dots[instaSlideIndex].classList.remove('active');
    
    instaSlideIndex = index;
    
    slides[instaSlideIndex].classList.add('active');
    dots[instaSlideIndex].classList.add('active');
    captionText.innerHTML = instaCaptions[instaSlideIndex];
}

// CHEK (RECEIPT) MODAL LOGIKASI
window.openReceipt = function() {
    document.getElementById('receipt-modal').classList.add('active');
}

window.closeReceipt = function(e) {
    // Faqat qora fonga bosganda yopiladi (chekning o'ziga bossa yopilmaydi)
    if (e.target.id === 'receipt-modal') {
        document.getElementById('receipt-modal').classList.remove('active');
    }
}


// Yo'q tugmasi bosilganda chiroyli xatni ko'rsatish
window.showAngryLetter = function() {
    document.getElementById('receipt-modal').classList.remove('active');
    document.getElementById('angry-letter-modal').classList.add('active');
}

// Chiroyli xat ochilishi va pastki o'chirish ekrani chiqishi
window.openBeautifulLetter = function(el) {
    if (el.classList.contains('open')) return;
    el.classList.add('open');
    
    // Maktub ochilgach, pastki "sayt o'chirilmoqda" yozuvi paydo bo'ladi
    window.deletionStartTimeoutId = setTimeout(() => {
        const warning = document.getElementById('bottom-deletion-warning');
        warning.classList.remove('hidden');
        warning.classList.add('visible');
        
        let timeLeft = 30;
        const timeDisplay = document.getElementById('bottom-time');
        const progressBar = document.getElementById('b-progress');
        
        progressBar.style.transition = 'width 30s linear';
        window.deletionTimeoutId = setTimeout(() => { progressBar.style.width = '100%'; }, 50);
        
        window.deletionIntervalId = setInterval(() => {
            timeLeft--;
            timeDisplay.innerText = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(window.deletionIntervalId);
                warning.innerHTML = "<h3 style='margin:0;'>XATOLIK YUZ BERDI! QAYTA URINAMAN...</h3>";
                
                setTimeout(() => {
                    location.reload(); // Sahifani boshqatdan yuklaydi
                }, 3000);
            }
        }, 1000);
        
    }, 1500); // Konvert ochilishi va xat chiqishini (1.5s) kutamiz
}

// Chekni aniq orqaga tugmasi orqali yopish
window.closeReceiptExplicit = function() {
    document.getElementById('receipt-modal').classList.remove('active');
}

// Chiroyli xat ekranidan orqaga qaytish (jarayonni to'xtatib)
window.closeAngryLetter = function(e) {
    e.stopPropagation();
    
    // 1. Taymerlarni to'xtatamiz
    if (window.deletionIntervalId) clearInterval(window.deletionIntervalId);
    if (window.deletionTimeoutId) clearTimeout(window.deletionTimeoutId);
    if (window.deletionStartTimeoutId) clearTimeout(window.deletionStartTimeoutId);
    
    // 2. O'chirish ogohlantirishini yashiramiz
    const warning = document.getElementById('bottom-deletion-warning');
    warning.classList.remove('visible');
    warning.classList.add('hidden');
    
    // 3. Konvertni yopamiz
    const envelope = document.querySelector('.beautiful-envelope-wrapper');
    if (envelope) envelope.classList.remove('open');
    
    // 4. Progress barni nolga qaytaramiz
    const progressBar = document.getElementById('b-progress');
    if (progressBar) {
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';
    }
    
    // 5. Orqaga (Chek ekraniga) qaytamiz
    document.getElementById('angry-letter-modal').classList.remove('active');
    document.getElementById('receipt-modal').classList.add('active');
}

// "Ha" tugmasi bosilganda kartani ko'rsatish
window.showCardModal = function() {
    document.getElementById('receipt-modal').classList.remove('active');
    document.getElementById('card-modal').classList.add('active');
}

// Kartadan orqaga qaytish
window.closeCardModal = function() {
    document.getElementById('card-modal').classList.remove('active');
    document.getElementById('receipt-modal').classList.add('active'); // Chekni qayta ochib berish
}

// Musiqani boshqarish
let isMusicPlaying = false;
window.toggleMusic = function() {
    const bgMusic = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-control');
    
    if (isMusicPlaying) {
        bgMusic.pause();
        musicBtn.innerHTML = '🎵 Eshitish';
        isMusicPlaying = false;
    } else {
        bgMusic.play();
        musicBtn.innerHTML = '⏸️ To\'xtatish';
        isMusicPlaying = true;
    }
};
