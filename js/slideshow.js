// Slideshow functionality
const initSlideshow = () => {
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const pauseBtn = document.querySelector('.pause-btn');
    
    let currentSlide = 0;
    let isPlaying = true;
    let slideInterval = null;

    const showSlide = (index) => {
        slides.forEach(slide => slide.classList.remove('active'));
        slides[index].classList.add('active');
    };

    const nextSlide = () => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    };

    const prevSlide = () => {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    };

    const startSlideshow = () => {
        if (slideInterval) clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 3000);
    };

    const stopSlideshow = () => {
        if (slideInterval) {
            clearInterval(slideInterval);
            slideInterval = null;
        }
    };

    // Event listeners
    prevBtn.addEventListener('click', () => {
        stopSlideshow();
        prevSlide();
        if (isPlaying) startSlideshow();
    });

    nextBtn.addEventListener('click', () => {
        stopSlideshow();
        nextSlide();
        if (isPlaying) startSlideshow();
    });

    pauseBtn.addEventListener('click', () => {
        isPlaying = !isPlaying;
        if (isPlaying) {
            startSlideshow();
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            stopSlideshow();
            pauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    });

    // Initialize
    showSlide(currentSlide);
    startSlideshow();
};

// Start when DOM is loaded
document.addEventListener('DOMContentLoaded', initSlideshow);
