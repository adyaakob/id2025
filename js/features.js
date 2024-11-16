class FeatureManager {
    constructor() {
        this.featureButtons = document.querySelectorAll('.feature-btn');
        this.featureContent = document.querySelector('.feature-content');
        
        // Feature content database
        this.features = {
            overview: {
                title: 'Company Info',
                content: `
                    <div class="content-wrapper">
                        <div class="info-section">
                            <div class="info-column">
                                <div style="text-align: center; padding: 20px;">
                                    <div style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #2c3e50;">TEQ ARMADA SDN BHD</div>
                                    <div style="font-size: 16px;">B5-2A Ostina Business Avenue</div>
                                    <div style="font-size: 16px;">43650 Bandar Baru Bangi</div>
                                    <div style="font-size: 16px;">Selangor Darul Ehsan</div>
                                    <div style="font-size: 16px;"><i class="fas fa-globe"></i> www.teqarmada.com</div>
                                </div>
                            </div>
                            <div class="info-column">
                                <div style="text-align: center; padding: 20px;">
                                    <div style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #2c3e50;">JAZLAN BIN ABDUL JALIL</div>
                                    <div style="font-size: 16px; color: #3498db; margin-bottom: 10px;">Manager, Sales and Marketing</div>
                                    <div style="font-size: 16px;"><i class="fas fa-mobile-alt"></i> +6016 693 4865</div>
                                    <div style="font-size: 16px;"><i class="fas fa-phone"></i> +603 3851 3314</div>
                                    <div style="font-size: 16px;"><i class="fas fa-envelope"></i> jazlan@teqarmada.com</div>
                                </div>
                            </div>
                            <div class="info-column">
                                <div style="text-align: center; padding: 20px;">
                                    <div style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #2c3e50;">ENQUIRY</div>
                                    <div style="font-size: 16px;">For product information and business opportunities, please contact us at:</div>
                                    <div style="font-size: 16px;"><i class="fas fa-phone"></i> +603 3851 3314</div>
                                    <div style="font-size: 16px;"><i class="fas fa-envelope"></i> enquiry@teqarmada.com</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `
            },
            features: {
                title: 'Contact Us',
                content: `
                    <div class="info-section">
                        <div class="contact-info">
                            <p><i class="fas fa-phone"></i> +1 (555) 123-4567</p>
                            <p><i class="fas fa-envelope"></i> info@companyname.com</p>
                            <p><i class="fas fa-clock"></i> Mon-Fri: 9AM-5PM EST</p>
                        </div>
                    </div>
                `
            },
            specifications: {
                title: 'Contact Form',
                content: `
                    <div class="info-section">
                        <form class="contact-form" id="contactForm">
                            <input type="text" placeholder="Name" required>
                            <input type="email" placeholder="Email" required>
                            <input type="tel" placeholder="Phone">
                            <button type="submit"><i class="fas fa-paper-plane"></i> Send</button>
                        </form>
                    </div>
                `
            },
            gallery: {
                title: 'Social Media',
                content: `
                    <div class="info-section">
                        <div class="social-links">
                            <a href="#" class="social-link"><i class="fab fa-linkedin"></i> LinkedIn</a>
                            <a href="#" class="social-link"><i class="fab fa-twitter"></i> Twitter</a>
                            <a href="#" class="social-link"><i class="fab fa-facebook"></i> Facebook</a>
                        </div>
                    </div>
                `
            }
        };

        this.initializeFeatures();
    }

    initializeFeatures() {
        // Set default content
        this.showFeature('overview');

        // Add click handlers
        this.featureButtons.forEach(button => {
            button.addEventListener('click', () => {
                const feature = button.getAttribute('data-feature');
                this.showFeature(feature);
            });
        });
    }

    showFeature(featureKey) {
        const feature = this.features[featureKey];
        this.featureContent.innerHTML = feature.content;
        
        // Update active button
        this.featureButtons.forEach(button => {
            button.classList.toggle('active', button.getAttribute('data-feature') === featureKey);
        });
    }
}

// Initialize feature manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const featureManager = new FeatureManager();
});
