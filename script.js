class VideoSwitcher {
    constructor() {
        this.nextButton = document.querySelector('.next-btn');
        this.video = document.querySelector('.hero-video');
        this.heroInfo = document.querySelector('.hero-info h1');
        this.gamingText = document.querySelector('.gaming-text');
        
        // Enhanced movie data with titles and themes
        this.movieData = [
            {
                src: 'videos/hero-10.mp4',
                title: 'THE AMAZING',
                subtitle: 'SPIDERMAN 2',
                theme: 'classic'
            },
            {
                src: 'videos/hero-7-1.mp4',
                title: 'THE SPECTACULAR',
                subtitle: 'WEB-SLINGER',
                theme: 'modern'
            },
            {
                src: 'videos/hero-8-1.mp4',
                title: 'THE ULTIMATE',
                subtitle: 'HERO',
                theme: 'dark'
            },
            {
                src: 'videos/hero-9-1.mp4',
                title: 'THE FRIENDLY',
                subtitle: 'NEIGHBORHOOD',
                theme: 'bright'
            },
            {
                src: 'videos/hero-6.mp4',
                title: 'THE INCREDIBLE',
                subtitle: 'SPIDER-MAN',
                theme: 'vintage'
            }
        ];
        
        this.currentIndex = 0;
        this.isTransitioning = false;
        this.autoPlayInterval = null;
        this.autoPlayDelay = 8000; // 8 seconds
        
        this.init();
    }
    
    init() {
        if (!this.nextButton || !this.video) {
            console.warn('Video switcher elements not found');
            return;
        }
        
        this.setupEventListeners();
        this.createProgressIndicator();
        this.startAutoPlay();
        this.preloadVideos();
    }
    
    setupEventListeners() {
        // Next button click
        this.nextButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.switchToNext();
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === ' ') {
                e.preventDefault();
                this.switchToNext();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.switchToPrevious();
            }
        });
        
        // Pause auto-play on hover
        this.nextButton.addEventListener('mouseenter', () => {
            this.pauseAutoPlay();
        });
        
        this.nextButton.addEventListener('mouseleave', () => {
            this.startAutoPlay();
        });
        
        // Video events
        this.video.addEventListener('loadstart', () => {
            this.showLoadingState();
        });
        
        this.video.addEventListener('canplay', () => {
            this.hideLoadingState();
        });
        
        this.video.addEventListener('error', (e) => {
            console.error('Video loading error:', e);
            this.handleVideoError();
        });
    }
    
    createProgressIndicator() {
        // Create progress dots
        const progressContainer = document.createElement('div');
        progressContainer.className = 'video-progress';
        progressContainer.innerHTML = `
            <div class="progress-dots">
                ${this.movieData.map((_, index) => 
                    `<button class="progress-dot ${index === 0 ? 'active' : ''}" 
                            data-index="${index}" 
                            aria-label="Switch to video ${index + 1}">
                    </button>`
                ).join('')}
            </div>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
        `;
        
        // Insert after hero-info
        const heroSection = document.querySelector('.hero-section');
        heroSection.appendChild(progressContainer);
        
        // Add click events to dots
        progressContainer.querySelectorAll('.progress-dot').forEach(dot => {
            dot.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.switchToVideo(index);
            });
        });
    }
    
    switchToNext() {
        if (this.isTransitioning) return;
        
        const nextIndex = (this.currentIndex + 1) % this.movieData.length;
        this.switchToVideo(nextIndex);
    }
    
    switchToPrevious() {
        if (this.isTransitioning) return;
        
        const prevIndex = this.currentIndex === 0 
            ? this.movieData.length - 1 
            : this.currentIndex - 1;
        this.switchToVideo(prevIndex);
    }
    
    async switchToVideo(newIndex) {
        if (this.isTransitioning || newIndex === this.currentIndex) return;
        
        this.isTransitioning = true;
        this.pauseAutoPlay();
        
        const currentData = this.movieData[newIndex];
        
        try {
            // Add transition effects
            await this.addTransitionEffects();
            
            // Switch video source
            this.video.src = currentData.src;
            
            // Update text content with animation
            this.updateTextContent(currentData);
            
            // Update progress indicator
            this.updateProgressIndicator(newIndex);
            
            // Update theme
            this.updateTheme(currentData.theme);
            
            this.currentIndex = newIndex;
            
            // Wait for video to load
            await this.waitForVideoLoad();
            
        } catch (error) {
            console.error('Error switching video:', error);
            this.handleVideoError();
        } finally {
            this.isTransitioning = false;
            this.startAutoPlay();
        }
    }
    
    async addTransitionEffects() {
        return new Promise(resolve => {
            // Fade out effect
            this.video.style.transition = 'opacity 0.5s ease';
            this.video.style.opacity = '0.3';
            
            // Text slide effect
            if (this.heroInfo) {
                this.heroInfo.style.transform = 'translateX(-50px)';
                this.heroInfo.style.opacity = '0.5';
            }
            
            if (this.gamingText) {
                this.gamingText.style.transform = 'translateX(50px)';
                this.gamingText.style.opacity = '0.5';
            }
            
            setTimeout(resolve, 300);
        });
    }
    
    updateTextContent(data) {
        // Animate text changes
        if (this.heroInfo) {
            setTimeout(() => {
                this.heroInfo.textContent = data.title;
                this.heroInfo.style.transform = 'translateX(0)';
                this.heroInfo.style.opacity = '1';
            }, 200);
        }
        
        if (this.gamingText) {
            setTimeout(() => {
                this.gamingText.textContent = data.subtitle;
                this.gamingText.style.transform = 'translateX(0)';
                this.gamingText.style.opacity = '1';
            }, 300);
        }
    }
    
    updateProgressIndicator(newIndex) {
        const dots = document.querySelectorAll('.progress-dot');
        const progressFill = document.querySelector('.progress-fill');
        
        // Update active dot
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === newIndex);
        });
        
        // Update progress bar
        if (progressFill) {
            const progress = ((newIndex + 1) / this.movieData.length) * 100;
            progressFill.style.width = `${progress}%`;
        }
    }
    
    updateTheme(theme) {
        // Remove existing theme classes
        document.body.classList.remove('theme-classic', 'theme-modern', 'theme-dark', 'theme-bright', 'theme-vintage');
        
        // Add new theme class
        document.body.classList.add(`theme-${theme}`);
    }
    
    waitForVideoLoad() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Video load timeout'));
            }, 10000);
            
            const onCanPlay = () => {
                clearTimeout(timeout);
                this.video.removeEventListener('canplay', onCanPlay);
                this.video.removeEventListener('error', onError);
                
                // Fade video back in
                this.video.style.opacity = '1';
                resolve();
            };
            
            const onError = (e) => {
                clearTimeout(timeout);
                this.video.removeEventListener('canplay', onCanPlay);
                this.video.removeEventListener('error', onError);
                reject(e);
            };
            
            this.video.addEventListener('canplay', onCanPlay);
            this.video.addEventListener('error', onError);
        });
    }
    
    preloadVideos() {
        // Preload next video for smoother transitions
        const nextIndex = (this.currentIndex + 1) % this.movieData.length;
        const nextVideo = document.createElement('video');
        nextVideo.src = this.movieData[nextIndex].src;
        nextVideo.preload = 'metadata';
    }
    
    startAutoPlay() {
        this.pauseAutoPlay(); // Clear existing interval
        
        this.autoPlayInterval = setInterval(() => {
            if (!this.isTransitioning) {
                this.switchToNext();
            }
        }, this.autoPlayDelay);
        
        // Update progress bar animation
        this.startProgressAnimation();
    }
    
    pauseAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
        
        this.pauseProgressAnimation();
    }
    
    startProgressAnimation() {
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.transition = `width ${this.autoPlayDelay}ms linear`;
        }
    }
    
    pauseProgressAnimation() {
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.transition = 'width 0.3s ease';
        }
    }
    
    showLoadingState() {
        this.nextButton.classList.add('loading');
        this.nextButton.innerHTML = '<div class="spinner"></div>';
    }
    
    hideLoadingState() {
        this.nextButton.classList.remove('loading');
        this.nextButton.innerHTML = 'NEXT';
    }
    
    handleVideoError() {
        console.error('Video failed to load, skipping to next');
        // Skip to next video on error
        setTimeout(() => {
            this.switchToNext();
        }, 1000);
    }
    
    // Public methods for external control
    play() {
        this.startAutoPlay();
    }
    
    pause() {
        this.pauseAutoPlay();
    }
    
    goToVideo(index) {
        if (index >= 0 && index < this.movieData.length) {
            this.switchToVideo(index);
        }
    }
    
    getCurrentVideo() {
        return this.movieData[this.currentIndex];
    }
}

// Enhanced CSS for the video switcher
const videoSwitcherCSS = `
.video-progress {
    position: absolute;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
}

.progress-dots {
    display: flex;
    gap: 12px;
}

.progress-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.5);
    background: transparent;
    cursor: pointer;
    transition: all 0.3s ease;
}

.progress-dot:hover {
    border-color: #edff66;
    transform: scale(1.2);
}

.progress-dot.active {
    background: linear-gradient(45deg, #ff0000, #edff66);
    border-color: #edff66;
    box-shadow: 0 0 15px rgba(237, 255, 102, 0.5);
}

.progress-bar {
    width: 200px;
    height: 3px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(45deg, #ff0000, #edff66);
    border-radius: 2px;
    width: 20%;
    transition: width 0.3s ease;
}

.next-btn.loading {
    animation: pulse 1.5s infinite;
}

.spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Theme variations */
.theme-classic { --accent-color: #ff0000; }
.theme-modern { --accent-color: #00ff00; }
.theme-dark { --accent-color: #800080; }
.theme-bright { --accent-color: #ffff00; }
.theme-vintage { --accent-color: #ff8c00; }

/* Responsive adjustments */
@media (max-width: 768px) {
    .video-progress {
        bottom: 80px;
    }
    
    .progress-bar {
        width: 150px;
    }
    
    .progress-dots {
        gap: 8px;
    }
    
    .progress-dot {
        width: 10px;
        height: 10px;
    }
}
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = videoSwitcherCSS;
document.head.appendChild(style);

// Initialize the video switcher when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.videoSwitcher = new VideoSwitcher();
});

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VideoSwitcher;
}
// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    mobileMenuBtn.addEventListener('click', function() {
        mobileMenuBtn.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a link
    const mobileMenuLinks = mobileMenu.querySelectorAll('a');
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenuBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!mobileMenuBtn.contains(event.target) && !mobileMenu.contains(event.target)) {
            mobileMenuBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 768) {
            mobileMenuBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
        }
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Video autoplay fallback for mobile devices
    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo) {
        // Try to play video on user interaction for mobile devices
        const playVideo = () => {
            heroVideo.play().catch(e => {
                console.log('Video autoplay failed:', e);
            });
        };
        
        // Attempt to play on various user interactions
        ['touchstart', 'click', 'scroll'].forEach(event => {
            document.addEventListener(event, playVideo, { once: true });
        });
    }
    
    // Add loading animation for better UX
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
    });
});

// Intersection Observer for animations (optional enhancement)
if ('IntersectionObserver' in window) {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.hero-info, .gaming-text').forEach(el => {
        observer.observe(el);
    });
}

