// Global data storage
let assessmentData = {
    patient: {},
    agni: { vishama: 0, tikshna: 0, manda: 0, sama: 0 },
    dosha: { vata: 0, pitta: 0, kapha: 0 },
    dhatu: {},
    srotas: {},
    selections: {},
    completed: { agni: false, dosha: false, dhatu: false, srotas: false }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date
    const dateEl = document.getElementById('assessmentDate');
    if (dateEl) dateEl.valueAsDate = new Date();
    
    // Add form validation listeners
    const formFields = ['patientName', 'ageSex', 'complaints'];
    formFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', validateForm);
            field.addEventListener('blur', savePatientData);
        }
    });
    
    // Load saved data
    loadAutoSaved();
    
    // Update progress
    updateProgress();
});

// Form validation
function validateForm() {
    const name = document.getElementById('patientName')?.value.trim();
    const ageSex = document.getElementById('ageSex')?.value.trim();
    const complaints = document.getElementById('complaints')?.value.trim();
    
    const isValid = name && ageSex && complaints;
    
    // Enable/disable first pillar based on form completion
    const agniBtn = document.getElementById('agni-btn');
    if (agniBtn) {
        if (isValid) {
            agniBtn.classList.remove('locked');
            agniBtn.classList.add('available');
        } else {
            agniBtn.classList.add('locked');
            agniBtn.classList.remove('available');
        }
    }
}

// Save patient data
function savePatientData() {
    const patientData = {
        name: document.getElementById('patientName')?.value || '',
        ageSex: document.getElementById('ageSex')?.value || '',
        patientId: document.getElementById('patientId')?.value || '',
        assessmentDate: document.getElementById('assessmentDate')?.value || '',
        complaints: document.getElementById('complaints')?.value || '',
        pastHistory: document.getElementById('pastHistory')?.value || '',
        additionalPoints: document.getElementById('additionalPoints')?.value || '',
        referredBy: document.getElementById('referredBy')?.value || ''
    };
    
    assessmentData.patient = patientData;
    localStorage.setItem('4pcam_patient_data', JSON.stringify(patientData));
}

// Navigation functions
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    const el = document.getElementById(pageId + '-page') || document.getElementById(pageId);
    if (el) el.classList.add('active');
}

function goToMain() {
    window.location.href = 'index.html';
}

// Start assessment
function startAssessment(pillar) {
    // Validate form for first assessment
    if (pillar === 'agni') {
        const name = document.getElementById('patientName')?.value.trim();
        const ageSex = document.getElementById('ageSex')?.value.trim();
        const complaints = document.getElementById('complaints')?.value.trim();
        
        if (!name || !ageSex || !complaints) {
            alert('Please fill in all required fields (Name, Age/Sex, Chief Complaints) before starting the assessment.');
            return;
        }
    }
    
    // Check if pillar is available (locked/available class)
    const btn = document.getElementById(pillar + '-btn');
    if (btn && btn.classList.contains('locked')) {
        alert('Complete the previous assessments first to unlock this pillar.');
        return;
    }
    
    // Navigate to assessment page
    window.location.href = `${pillar}-assessment.html`;
}

// Complete assessment
function completeAssessment(pillar) {
    // Save data
    saveAssessmentData(pillar);
    
    // Mark as completed
    assessmentData.completed[pillar] = true;
    localStorage.setItem('4pcam_completed', JSON.stringify(assessmentData.completed));
    
    // Navigate to main page
    window.location.href = 'index.html';
}

// Progress management
function updateProgress() {
    const completed = JSON.parse(localStorage.getItem('4pcam_completed') || '{}');
    
    // Update pillar buttons
    if (completed.agni) {
        updatePillarButton('agni', 'completed');
    }
    if (completed.dosha) {
        updatePillarButton('dosha', 'completed');
    }
    if (completed.dhatu) {
        updatePillarButton('dhatu', 'completed');
    }
    if (completed.srotas) {
        updatePillarButton('srotas', 'completed');
    }
    
    // Unlock next pillar
    if (completed.agni) {
        updatePillarButton('dosha', 'available');
    }
    if (completed.dosha) {
        updatePillarButton('dhatu', 'available');
    }
    if (completed.dhatu) {
        updatePillarButton('srotas', 'available');
    }
    
    // Update progress bar
    const progressCount = Object.values(completed).filter(Boolean).length;
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
        progressFill.style.width = `${(progressCount / 4) * 100}%`;
    }
    
    // Show completion status
    if (progressCount === 4) {
        const statusEl = document.getElementById('completionStatus');
        if (statusEl) {
            statusEl.style.display = 'block';
            statusEl.innerHTML = `
                <strong>Assessment Complete!</strong> All 4 pillars have been evaluated. 
                <a href="final-report.html" class="btn btn-primary">View Final Report</a>
            `;
        }
    }
}

function updatePillarButton(pillar, status) {
    const btn = document.getElementById(pillar + '-btn');
    if (btn) {
        btn.classList.remove('locked', 'available', 'completed');
        btn.classList.add(status);
    }
}

// Data persistence
function saveAssessmentData(pillar) {
    localStorage.setItem(`4pcam_${pillar}_data`, JSON.stringify(assessmentData[pillar]));
}

function loadAutoSaved() {
    // Load patient data
    const patientData = localStorage.getItem('4pcam_patient_data');
    if (patientData) {
        assessmentData.patient = JSON.parse(patientData);
        
        // Populate form fields
        Object.keys(assessmentData.patient).forEach(key => {
            const field = document.getElementById(key);
            if (field) field.value = assessmentData.patient[key];
        });
    }
    
    // Load completion status
    const completed = localStorage.getItem('4pcam_completed');
    if (completed) {
        assessmentData.completed = JSON.parse(completed);
    }
}

// Auto-save functionality
let autoSaveTimer;
function setupAutoSave() {
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(() => {
                savePatientData();
            }, 1000);
        });
    });
}

// Initialize auto-save when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAutoSave);
} else {
    setupAutoSave();
}
