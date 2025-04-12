// Function to reset progress data
function resetProgressData() {
    // Initialize structure with 0% for all subjects/topics
    let progress = {};
    
    Object.keys(SUBJECTS).forEach(subject => {
        progress[subject] = {
            overall: 0,
            topics: {}
        };
        
        SUBJECTS[subject].forEach(topic => {
            progress[subject].topics[topic] = 0;
        });
    });
    
    // Save reset progress to localStorage
    localStorage.setItem('quizProgress', JSON.stringify(progress));
    return progress;
}

// Modify your initialization to reset on page load
document.addEventListener('DOMContentLoaded', function() {
    // Only reset if no existing progress
    let existing = localStorage.getItem('quizProgress');
    if (!existing) {
        resetProgressData();
    }

    // Add styles
    addStyles();
    
    // Render progress tracker with existing or new data
    renderProgressTracker();
});
