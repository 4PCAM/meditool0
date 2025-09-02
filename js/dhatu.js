document.addEventListener('DOMContentLoaded', function() {
    // Load saved data
    loadDhatuData();
    
    // Add event listeners to symptom items
    const symptomItems = document.querySelectorAll('.symptom-item');
    symptomItems.forEach(item => {
        item.addEventListener('click', function() {
            toggleSymptom(this);
        });
    });
    
    // Add event listeners to severity buttons
    const severityBtns = document.querySelectorAll('.severity-btn');
    severityBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            setSeverity(this);
        });
    });
});

function toggleSymptom(item) {
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
    updateDhatuScores();
    
    // Check completion
    checkDhatuCompletion();
}

function setSeverity(btn) {
    // Remove active class from all buttons in this symptom
    const symptomItem = btn.closest('.symptom-item');
    const allBtns = symptomItem.querySelectorAll('.severity-btn');
    allBtns.forEach(b => b.classList.remove('active'));
    
    // Add active class to clicked button
    btn.classList.add('active');
    
    // Update scores
    updateDhatuScores();
}

function updateDhatuScores() {
    const dhatus = ['rasa', 'rakta', 'mamsa', 'meda', 'asthi', 'majja', 'shukra'];
    const scores = {};
    
    // Initialize scores
    dhatus.forEach(dhatu => {
        scores[dhatu] = { kshaya: 0, vriddhi: 0 };
    });
    
    // Calculate scores from selected symptoms
    const selectedItems = document.querySelectorAll('.symptom-item.selected');
    selectedItems.forEach(item => {
        const dhatu = item.dataset.dhatu;
        const type = item.dataset.type;
        const activeBtn = item.querySelector('.severity-btn.active');
        const severity = activeBtn ? parseInt(activeBtn.dataset.score) : 0;
        
        if (scores[dhatu] && scores[dhatu][type] !== undefined) {
            scores[dhatu][type] += severity;
        }
    });
    
    // Update display
    dhatus.forEach(dhatu => {
        const kshayaEl = document.getElementById(`${dhatu}-kshaya-score`);
        const vriddhiEl = document.getElementById(`${dhatu}-vriddhi-score`);
        
        if (kshayaEl) kshayaEl.textContent = scores[dhatu].kshaya;
        if (vriddhiEl) vriddhiEl.textContent = scores[dhatu].vriddhi;
    });
    
    // Save to global data
    assessmentData.dhatu = scores;
}

function checkDhatuCompletion() {
    // Check if at least one symptom is selected for each dhatu
    const dhatus = ['rasa', 'rakta', 'mamsa', 'meda', 'asthi', 'majja', 'shukra'];
    let allCompleted = true;
    
    dhatus.forEach(dhatu => {
        const selectedItems = document.querySelectorAll(`.symptom-item[data-dhatu="${dhatu}"].selected`);
        if (selectedItems.length === 0) {
            allCompleted = false;
        }
    });
    
    // Enable/disable complete button
    const completeBtn = document.getElementById('dhatu-complete-btn');
    if (completeBtn) {
        completeBtn.disabled = !allCompleted;
    }
}

function loadDhatuData() {
    const saved = localStorage.getItem('4pcam_dhatu_data');
    if (saved) {
        const data = JSON.parse(saved);
        
        // Restore selected symptoms
        Object.keys(data).forEach(dhatu => {
            Object.keys(data[dhatu]).forEach(type => {
                if (data[dhatu][type] > 0) {
                    // Find and select symptoms for this dhatu/type
                    const items = document.querySelectorAll(`.symptom-item[data-dhatu="${dhatu}"][data-type="${type}"]`);
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
        });
        
        // Update scores
        updateDhatuScores();
    }
}

// Save data when leaving page
window.addEventListener('beforeunload', () => {
    localStorage.setItem('4pcam_dhatu_data', JSON.stringify(assessmentData.dhatu));
});
