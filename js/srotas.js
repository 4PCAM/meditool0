document.addEventListener('DOMContentLoaded', function() {
    // Load saved data
    loadSrotasData();
    
    // Add event listeners to symptom items
    const symptomItems = document.querySelectorAll('.symptom-item');
    symptomItems.forEach(item => {
        item.addEventListener('click', function() {
            toggleSrotasSymptom(this);
        });
    });
    
    // Add event listeners to severity buttons
    const severityBtns = document.querySelectorAll('.severity-btn');
    severityBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            setSrotasSeverity(this);
        });
    });
});

function toggleSrotasSymptom(item) {
    // Toggle selected state
    item.classList.toggle('selected');
    
    // Show/hide severity controls
    const severityControls = item.querySelector('.severity-controls');
    if (item.classList.contains('selected')) {
        severityControls.style.display = 'flex';
        
        // Set default severity if none selected
        const activeBtn = severityControls.querySelector('.severity-btn.active');
        if (!activeBtn) {
            const firstBtn = severityControls.querySelector('.severity-btn');
            if (firstBtn) firstBtn.classList.add('active');
        }
    } else {
        severityControls.style.display = 'none';
        
        // Remove active state from severity buttons
        const activeBtns = severityControls.querySelectorAll('.severity-btn.active');
        activeBtns.forEach(btn => btn.classList.remove('active'));
    }
    
    // Update scores
    updateSrotasScores();
    
    // Check completion
    checkSrotasCompletion();
}

function setSrotasSeverity(btn) {
    // Remove active class from all buttons in this symptom
    const symptomItem = btn.closest('.symptom-item');
    const allBtns = symptomItem.querySelectorAll('.severity-btn');
    allBtns.forEach(b => b.classList.remove('active'));
    
    // Add active class to clicked button
    btn.classList.add('active');
    
    // Update scores
    updateSrotasScores();
}

function updateSrotasScores() {
    const srotasList = [
        'pranavaha', 'udakavaha', 'annavaha', 'rasavaha', 'raktavaha',
        'mamsavaha', 'medavaha', 'asthivaha', 'majjavaha', 'shukravaha',
        'mutravaha', 'purishavaha', 'swedavaha', 'artavavaha', 'stanyavaha'
    ];
    const scores = {};
    
    // Initialize scores
    srotasList.forEach(srotas => {
        scores[srotas] = 0;
    });
    
    // Calculate scores from selected symptoms
    const selectedItems = document.querySelectorAll('.symptom-item.selected');
    selectedItems.forEach(item => {
        const srotas = item.dataset.srotas;
        const activeBtn = item.querySelector('.severity-btn.active');
        const severity = activeBtn ? parseInt(activeBtn.dataset.score) : 0;
        
        if (scores[srotas] !== undefined) {
            scores[srotas] += severity;
        }
    });
    
    // Update display
    srotasList.forEach(srotas => {
        const scoreEl = document.getElementById(`${srotas}-score`);
        if (scoreEl) scoreEl.textContent = scores[srotas];
    });
    
    // Save to global data
    assessmentData.srotas = scores;
}

function checkSrotasCompletion() {
    // Check if at least one symptom is selected for each srotas
    const srotasList = [
        'pranavaha', 'udakavaha', 'annavaha', 'rasavaha', 'raktavaha',
        'mamsavaha', 'medavaha', 'asthivaha', 'majjavaha', 'shukravaha',
        'mutravaha', 'purishavaha', 'swedavaha', 'artavavaha', 'stanyavaha'
    ];
    let allCompleted = true;
    
    srotasList.forEach(srotas => {
        const selectedItems = document.querySelectorAll(`.symptom-item[data-srotas="${srotas}"].selected`);
        if (selectedItems.length === 0) {
            allCompleted = false;
        }
    });
    
    // Enable/disable complete button
    const completeBtn = document.getElementById('srotas-complete-btn');
    if (completeBtn) {
        completeBtn.disabled = !allCompleted;
    }
}

function loadSrotasData() {
    const saved = localStorage.getItem('4pcam_srotas_data');
    if (saved) {
        const data = JSON.parse(saved);
        
        // Restore selected symptoms
        Object.keys(data).forEach(srotas => {
            if (data[srotas] > 0) {
                // Find and select symptoms for this srotas
                const items = document.querySelectorAll(`.symptom-item[data-srotas="${srotas}"]`);
                items.forEach(item => {
                    item.classList.add('selected');
                    const severityControls = item.querySelector('.severity-controls');
                    severityControls.style.display = 'flex';
                    
                    // Set default severity
                    const firstBtn = severityControls.querySelector('.severity-btn');
                    if (firstBtn) firstBtn.classList.add('active');
                });
            }
        });
        
        // Update scores
        updateSrotasScores();
    }
}

// Save data when leaving page
window.addEventListener('beforeunload', () => {
    localStorage.setItem('4pcam_srotas_data', JSON.stringify(assessmentData.srotas));
});
