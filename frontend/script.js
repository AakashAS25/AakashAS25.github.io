function toggleMenu(){
    const menu = document.querySelector('.menu-links');
    const icon = document.querySelector('.hamburger-icon');
    menu.classList.toggle('open');
    icon.classList.toggle('open');
}

// Slider functionality
let currentSlideIndex = 0;

function isMobileView() {
    return window.innerWidth <= 768;
}

function getMaxSlideIndex() {
    return isMobileView() ? 2 : 1; // 3 individual projects for mobile, 2 groups for desktop
}

// Touch/Swipe variables
let startX = 0;
let endX = 0;
let isTouch = false;

function nextSlide() {
    const maxIndex = getMaxSlideIndex();
    if (currentSlideIndex < maxIndex) {
        currentSlideIndex++;
    } else {
        currentSlideIndex = 0; // Loop back to first
    }
    updateSlider();
}

function previousSlide() {
    const maxIndex = getMaxSlideIndex();
    if (currentSlideIndex > 0) {
        currentSlideIndex--;
    } else {
        currentSlideIndex = maxIndex; // Loop to last
    }
    updateSlider();
}

function currentSlide(slideIndex) {
    currentSlideIndex = slideIndex - 1;
    updateSlider();
}

function updateSlider() {
    const sliderTrack = document.getElementById('sliderTrack');
    const slides = document.querySelectorAll('.slide');
    let translateX;
    
    if (isMobileView()) {
        // Mobile: show individual projects and manage visibility
        // Hide all slides first
        slides.forEach(slide => slide.style.display = 'none');
        
        // Show specific slide based on index
        if (currentSlideIndex === 0) {
            // Show first project (Hostel Management)
            slides[0].style.display = 'flex';
            translateX = 0;
        } else if (currentSlideIndex === 1) {
            // Show second project (Survey Form)
            slides[1].style.display = 'flex';
            translateX = 0; // Keep first group visible
        } else if (currentSlideIndex === 2) {
            // Show third project (Django CRM)
            slides[2].style.display = 'flex';
            translateX = -50; // Move to second group
        }
    } else {
        // Desktop: restore all slides and use group-based sliding
        slides.forEach(slide => slide.style.display = 'flex');
        translateX = currentSlideIndex * -50; // Each group is 50% of track
    }
    
    sliderTrack.style.transform = `translateX(${translateX}%)`;
    
    // Update dots
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlideIndex);
    });
}

// Touch/Swipe Event Handlers
function handleTouchStart(event) {
    isTouch = true;
    startX = event.touches[0].clientX;
}

function handleTouchMove(event) {
    if (!isTouch) return;
    event.preventDefault(); // Prevent scrolling while swiping
}

function handleTouchEnd(event) {
    if (!isTouch) return;
    isTouch = false;
    endX = event.changedTouches[0].clientX;
    handleSwipe();
}

function handleSwipe() {
    const swipeThreshold = 50; // Minimum distance for a swipe
    const swipeDistance = startX - endX;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0) {
            // Swiped left - go to next slide
            nextSlide();
        } else {
            // Swiped right - go to previous slide
            previousSlide();
        }
    }
}

// Mouse drag support for desktop
let isDragging = false;
let startMouseX = 0;

function handleMouseDown(event) {
    isDragging = true;
    startMouseX = event.clientX;
    event.preventDefault();
}

function handleMouseMove(event) {
    if (!isDragging) return;
    event.preventDefault();
}

function handleMouseUp(event) {
    if (!isDragging) return;
    isDragging = false;
    const endMouseX = event.clientX;
    const dragDistance = startMouseX - endMouseX;
    const dragThreshold = 50;
    
    if (Math.abs(dragDistance) > dragThreshold) {
        if (dragDistance > 0) {
            nextSlide();
        } else {
            previousSlide();
        }
    }
}

// Initialize touch/swipe functionality when page loads
document.addEventListener('DOMContentLoaded', function() {
    const sliderWrapper = document.querySelector('.slider-wrapper');
    
    if (sliderWrapper) {
        // Touch events for mobile
        sliderWrapper.addEventListener('touchstart', handleTouchStart, { passive: false });
        sliderWrapper.addEventListener('touchmove', handleTouchMove, { passive: false });
        sliderWrapper.addEventListener('touchend', handleTouchEnd, { passive: false });
        
        // Mouse events for desktop drag
        sliderWrapper.addEventListener('mousedown', handleMouseDown);
        sliderWrapper.addEventListener('mousemove', handleMouseMove);
        sliderWrapper.addEventListener('mouseup', handleMouseUp);
        sliderWrapper.addEventListener('mouseleave', handleMouseUp); // Handle mouse leaving area
        
        // Prevent text selection during drag
        sliderWrapper.style.userSelect = 'none';
        sliderWrapper.style.webkitUserSelect = 'none';
    }
    
    // Handle window resize to reset slider position if needed
    window.addEventListener('resize', function() {
        // Reset to first slide when switching between mobile/desktop
        currentSlideIndex = 0;
        updateSlider();
    });

    // Chat widget toggle
    const chatToggle = document.getElementById('chat-toggle');
    const chatPopup = document.getElementById('chat-popup');
    const chatClose = document.getElementById('chat-close');

    if (chatToggle && chatPopup) {
        chatToggle.addEventListener('click', () => {
            const isOpen = chatPopup.classList.toggle('open');
            chatToggle.setAttribute('aria-expanded', String(isOpen));
            if (isOpen) {
                const iframe = document.getElementById('chat-iframe');
                if (iframe && !iframe.src) {
                    const url = iframe.getAttribute('data-src');
                    if (url) iframe.src = url;
                }
            }
        });
    }

    if (chatClose && chatPopup) {
        chatClose.addEventListener('click', () => {
            chatPopup.classList.remove('open');
            chatToggle && chatToggle.setAttribute('aria-expanded', 'false');
        });
    }

    // Close on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && chatPopup && chatPopup.classList.contains('open')) {
            chatPopup.classList.remove('open');
            chatToggle && chatToggle.setAttribute('aria-expanded', 'false');
        }
    });

    // Close when clicking outside the popup (but not when interacting with iframe)
    document.addEventListener('click', (e) => {
        if (!chatPopup || !chatPopup.classList.contains('open')) return;
        const withinWidget = e.target.closest('#chat-widget');
        if (!withinWidget) {
            chatPopup.classList.remove('open');
            chatToggle && chatToggle.setAttribute('aria-expanded', 'false');
        }
    });
});