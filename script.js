// Basic JavaScript setup with floating flakes animation
document.addEventListener('DOMContentLoaded', function() {
    console.log('Boeing 757 website loaded successfully!');
    
    // Get the image element
    const image = document.querySelector('.center-image');
    const container = document.querySelector('.container');
    
    // Add error handling for image loading
    if (image) {
        image.addEventListener('error', function() {
            console.error('Failed to load image: boeing-757.png');
        });
        
        image.addEventListener('load', function() {
            console.log('Image loaded successfully');
        });
        
        // Optional: Add click event to image
        image.addEventListener('click', function() {
            console.log('Boeing 757 image clicked!');
        });
    }
    
    // Create subtle background elements
    createBackgroundElements();
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