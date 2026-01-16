// Basic JavaScript setup with floating flakes animation
document.addEventListener('DOMContentLoaded', function() {
    console.log('Site loaded');
    
    // Get the image element
    let image = document.querySelector('.center-image');
    const container = document.querySelector('.container');
    const wrapper = document.querySelector('.image-wrapper');
    const quoteEl = document.querySelector('.quote-layer');
    
    // Add error handling for image loading
    if (image) {
        image.addEventListener('error', function() {
            console.error('Failed to load image:', image.src);
        });
        
        image.addEventListener('load', function() {
            console.log('Image loaded successfully');
        });
        
        // Ensure base image participates in layering
        image.classList.add('image-layer');
    }
    
    // Create subtle background elements
    createBackgroundElements();

    // Add interactive tilt + parallax
    enableInteractivity(container, image);

    // Start carousel if images exist
    startImageCarousel(wrapper, image, (idx) => {
        // Update quote on each cycle
        if (quoteEl) setQuote(getRandomQuote(), false);
    });

    // Set initial quote
    if (quoteEl) setQuote(getRandomQuote(), true);
});

function createBackgroundElements() {
    const container = document.querySelector('.container');
    const elementCount = 12; // Fewer, more subtle elements
    
    for (let i = 0; i < elementCount; i++) {
        createBackgroundElement(container);
    }
}

function createBackgroundElement(container) {
    const element = document.createElement('div');
    element.className = 'bg-element';
    
    // Randomly choose color (black or orange)
    const isOrange = Math.random() > 0.6; // More black than orange for subtlety
    element.classList.add(isOrange ? 'orange' : 'black');
    
    // Randomly choose size
    const sizes = ['small', 'medium', 'large'];
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    element.classList.add(size);
    
    // Random positioning
    element.style.left = Math.random() * 100 + 'vw';
    element.style.top = Math.random() * 100 + 'vh';
    
    // Random animation
    const animations = ['slowFloat', 'pulse', 'drift'];
    const animation = animations[Math.floor(Math.random() * animations.length)];
    
    // Longer, more subtle durations
    const duration = 15 + Math.random() * 20; // 15-35 seconds
    const delay = Math.random() * 10;
    
    element.style.animation = `${animation} ${duration}s ease-in-out ${delay}s infinite`;
    
    container.appendChild(element);
}

// Function to add more interactivity in the future
function addInteractivity() {
    // This function can be expanded for additional features
}

function enableInteractivity(container, image) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const bgElements = Array.from(document.querySelectorAll('.bg-element'));

    let rafId = null;
    let targetX = 0.5;
    let targetY = 0.5;

    function onMove(e) {
        const rect = container.getBoundingClientRect();
        const cx = (e.clientX - rect.left) / rect.width;
        const cy = (e.clientY - rect.top) / rect.height;
        targetX = Math.min(Math.max(cx, 0), 1);
        targetY = Math.min(Math.max(cy, 0), 1);
        if (!rafId) rafId = requestAnimationFrame(updateScene);
    }

    function updateScene() {
        rafId = null;
        // Update CSS variables for glow + tilt
        container.style.setProperty('--mx', `${targetX * 100}%`);
        container.style.setProperty('--my', `${targetY * 100}%`);

        const rotateMax = 8; // degrees
        const rx = (0.5 - targetY) * rotateMax;
        const ry = (targetX - 0.5) * rotateMax;
        container.style.setProperty('--rx', `${rx}deg`);
        container.style.setProperty('--ry', `${ry}deg`);

        // Parallax background elements
        const amp = 12; // movement amplitude in px
        for (const el of bgElements) {
            const depth = el.classList.contains('large') ? 0.3 : el.classList.contains('medium') ? 0.6 : 1;
            const tx = (targetX - 0.5) * amp * depth;
            const ty = (targetY - 0.5) * amp * depth;
            el.style.transform = `translate(${tx}px, ${ty}px)`;
        }
    }

    if (!prefersReducedMotion) {
        container.addEventListener('mousemove', onMove);
        container.addEventListener('click', (e) => createRipple(e, container));
    }
}

function createRipple(e, container) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const rect = container.getBoundingClientRect();
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;
    container.appendChild(ripple);
    ripple.addEventListener('animationend', () => {
        ripple.remove();
    });
}

function startImageCarousel(wrapper, initialImageEl, onCycle) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const images = [
        'res/img/dal.png',
        'res/img/ice.jpg',
        'res/img/trm.jpg',
        'res/img/ual.jpg'
    ];

    if (!images.length || !wrapper || !initialImageEl) return;

    // Preload
    images.forEach(src => { const im = new Image(); im.src = src; });

    // Prepare base and overlay
    let current = initialImageEl;
    current.src = images[0];
    let overlay = document.createElement('img');
    overlay.className = 'image-layer image-hidden';
    overlay.setAttribute('aria-hidden', 'true');
    wrapper.appendChild(overlay);

    let index = 0;
    const nextIndex = () => (index + 1) % images.length;

    function crossfade(toIdx) {
        const nextSrc = images[toIdx];
        // Preload next, then fade
        const pre = new Image();
        pre.onload = () => {
            overlay.src = nextSrc;
            // Fade in overlay, fade out current
            requestAnimationFrame(() => {
                overlay.classList.remove('image-hidden');
                current.classList.add('image-hidden');
            });

            const onEnd = () => {
                // Swap refs
                current.classList.remove('image-hidden');
                // Make overlay the new current visually by swapping nodes/refs
                const tmp = current;
                current = overlay;
                overlay = tmp;
                // Ensure the (now overlay) is hidden and on top of stack order
                overlay.classList.add('image-hidden');
                overlay.setAttribute('aria-hidden', 'true');
                current.removeEventListener('transitionend', onEnd);
                if (typeof onCycle === 'function') onCycle(toIdx);
            };
            current.addEventListener('transitionend', onEnd, { once: true });
        };
        pre.src = nextSrc;
        index = toIdx;
    }

    // Initial image already set; run every 5s
    const intervalMs = 5000;
    if (prefersReducedMotion) {
        // No fade, hard swap
        setInterval(() => {
            const to = nextIndex();
            current.src = images[to];
            index = to;
            if (typeof onCycle === 'function') onCycle(to);
        }, intervalMs);
    } else {
        setInterval(() => crossfade(nextIndex()), intervalMs);
    }
}

// Quotes: short original lines to blend over images
const QUOTES = [
    "Chase horizons, not limits.",
    "Quiet skies, loud dreams.",
    "Lift comes to those who try.",
    "Glide through the noise.",
    "Eyes up, throttle steady.",
    "Find the line, fly it.",
    "Calm hands, bold heart.",
    "Small moves, big miles.",
    "Climb steady, wings ready.",
    "Trust the climb.",
    "Rise above the ordinary.",
    "Navigate your own course.",
    "Reach higher, reach further.",
    "Let momentum build.",
    "Steady altitude, bold vision.",
    "Break through the clouds.",
    "Keep your wings sharp.",
    "Ascend with purpose.",
    "Every climb starts here.",
    "Push past the air.",
    "Level flight is boring.",
    "Aim for the stars, land on dreams.",
    "Velocity plus vision.",
    "Climb when others coast.",
    "Clear skies ahead.",
    "Throttle up, hold steady.",
    "Wings don't question the wind.",
    "Rise before the rush.",
    "Find your cruising altitude.",
    "Climb like your life depends on it.",
    "Blue skies, bolder dreams.",
    "Navigate uncertainty with grace.",
    "Catch the jet stream.",
    "Slow burn, steady climb.",
    "Drift where currents take you.",
    "Trust your instruments.",
    "Fly against the grain.",
    "Keep nose forward.",
    "Turbulence makes you stronger.",
    "Soar, don't settle.",
    "Heights reward the bold.",
    "Find your heading.",
    "Wings spread, heart first.",
    "Climb until others stop looking.",
    "Every mile builds momentum.",
    "Glide through doubt.",
    "Rise with intention.",
    "Navigate change smoothly.",
    "Push the envelope gently.",
    "Steady hands, wild dreams.",
    "Break the sound barrier inside.",
    "Altitude equals perspective.",
    "Climb for the view.",
    "Trust the wind beneath.",
    "Flight is faith in motion.",
    "Navigate by the North Star.",
    "Throttle steady, aim high.",
    "Wings teach what words can't.",
    "Climb because you can.",
    "Every flight changes you.",
    "Rise above the noise.",
    "Heading true, spirit high.",
    "Catch updrafts of opportunity.",
    "Hold the line, climb further.",
    "Sky's not a limit, it's a beginning.",
    "Fly with intention, land with grace.",
    "Navigate your own wind.",
    "Climb slow, climb steady, climb far.",
    "Blue is the only direction.",
    "Trust the system, trust yourself.",
    "Rise when the world sleeps.",
    "Glide through complexity.",
    "Wings beat stronger than doubt.",
    "Altitude comes to those who try.",
    "Navigate toward your true heading.",
    "Every climb is a choice.",
    "Throttle forward, heart higher.",
    "Sky rewards the patient.",
    "Rise, rest, rise again.",
    "Climb into your own weather.",
    "Hold fast, fly free.",
    "Navigate the updrafts of life.",
    "Wings spread, fears fall.",
    "Altitude is a state of mind.",
    "Find your wind, follow it.",
    "Climb the ladder, skip the fear.",
    "Blue calls to the bold.",
    "Trust the air, trust yourself.",
    "Rise above what holds you.",
    "Navigate by stars, not shadows.",
    "Throttle and dream align here.",
    "Climb because the view waits.",
    "Sky bends to the brave.",
    "Glide past old limits.",
    "Wings teach persistence.",
    "Altitude speaks louder.",
    "Navigate forward with grace.",
    "Every ascent earns its view.",
    "Climb steady, smile stronger.",
    "Blue is calling again.",
    "Trust the current, trust the climb.",
    "Rise when others rest.",
    "Hold your heading, fly far.",
    "Navigate the storms inside.",
    "Wings silence the doubters.",
    "Climb toward what you want.",
    "Throttle full, heart fuller.",
    "Sky rewards the tenacious.",
    "Glide through what scares you.",
    "Altitude earned, freedom found.",
    "Navigate with compass and heart.",
    "Rise to your own level.",
    "Climb the mountain with wings.",
    "Blue skies breed bold souls.",
    "Trust the flight, trust the climb.",
    "Wings spread, world shifts.",
    "Navigate by need, not noise.",
    "Climb into yourself first.",
    "Every updraft is an invite.",
    "Throttle steady, aim true.",
    "Sky holds no judgement.",
    "Glide past the expected.",
    "Altitude is the best teacher.",
    "Navigate toward your horizon.",
    "Rise with the sun inside.",
    "Climb because it matters.",
    "Hold the line, hold the dream.",
    "Wings carry more than weight.",
    "Navigate the open sky.",
    "Climb steady, climb free.",
    "Blue rewards those who look up.",
    "Trust the wings, trust the wind.",
    "Rise above, rise beyond.",
    "Glide through fear's whispers.",
    "Altitude equals clarity.",
    "Navigate your own path upward.",
    "Every flight is a choice.",
    "Throttle toward tomorrow.",
    "Sky whispers to the listening.",
    "Climb when doubt arrives.",
    "Wings beat in rhythm of hope.",
    "Navigate slowly, fly wisely.",
    "Rise to meet yourself.",
    "Climb the sky, own the view.",
    "Blue is the color of beginning.",
    "Trust the turn, trust the climb.",
    "Glide past yesterday's limits.",
    "Altitude brings perspective.",
    "Navigate with open wings.",
    "Rise above the static.",
    "Climb for the story.",
    "Hold your course, hold your dream.",
    "Wings know what hearts seek.",
    "Navigate toward your version.",
    "Climb slow, fly long.",
    "Every rise is a victory.",
    "Throttle with purpose.",
    "Sky calls to the curious.",
    "Glide through the question marks.",
    "Altitude earned through trying.",
    "Navigate by heart's compass.",
    "Rise when it matters most.",
    "Climb beyond what was.",
    "Blue skies mean new chances.",
    "Trust the journey upward.",
    "Wings teach what words forget.",
    "Navigate toward freedom.",
    "Climb with patience and power.",
    "Every updraft is an answer.",
    "Throttle steady, vision clear.",
    "Sky opens to the brave.",
    "Glide into who you're becoming.",
    "Altitude is the reward.",
    "Navigate by your own North.",
    "Rise above the why.",
    "Climb toward your calling.",
    "Hold the vision, fly the path.",
    "Wings carry hope higher.",
    "Navigate the space between.",
    "Climb because you're worthy.",
    "Blue skies earn their beauty.",
    "Trust the air that holds you.",
    "Rise with every breath.",
    "Glide past the impossible.",
    "Altitude changes everything.",
    "Navigate toward your truth.",
    "Climb into your own power.",
];

let lastQuoteIdx = -1;
function getRandomQuote() {
    if (!QUOTES.length) return "";
    let i;
    do { i = Math.floor(Math.random() * QUOTES.length); } while (QUOTES.length > 1 && i === lastQuoteIdx);
    lastQuoteIdx = i;
    return QUOTES[i];
}

function setQuote(text, immediate = false) {
    const el = document.querySelector('.quote-layer');
    if (!el) return;
    if (immediate) {
        el.textContent = text;
        el.classList.add('quote-visible');
        return;
    }
    el.classList.remove('quote-visible');
    setTimeout(() => {
        el.textContent = text;
        el.classList.add('quote-visible');
    }, 250);
}