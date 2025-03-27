// Mobile Navigation Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', function() {
        navLinks.classList.toggle('show');
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navLinks.contains(event.target);
        const isClickOnHamburger = hamburger.contains(event.target);
        
        if (navLinks.classList.contains('show') && !isClickInsideNav && !isClickOnHamburger) {
            navLinks.classList.remove('show');
        }
    });
    
    // Subject box hover effects
    const subjectBoxes = document.querySelectorAll('.subject-box');
    
    subjectBoxes.forEach(box => {
        box.addEventListener('mouseenter', function() {
            const icon = this.querySelector('i');
            icon.classList.add('fa-bounce');
        });
        
        box.addEventListener('mouseleave', function() {
            const icon = this.querySelector('i');
            icon.classList.remove('fa-bounce');
        });
    });
});