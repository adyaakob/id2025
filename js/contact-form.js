document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                organization: document.getElementById('organization').value,
                message: document.getElementById('message').value
            };
            
            // Here you would typically send the data to your server
            // For now, we'll just log it and show a success message
            console.log('Form submission:', formData);
            
            // Show success message
            alert('Thank you for your message! We will get back to you soon.');
            
            // Clear the form
            contactForm.reset();
        });
    }
});
