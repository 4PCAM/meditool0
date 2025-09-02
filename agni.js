document.addEventListener('DOMContentLoaded', function() {
    // Load saved data
    loadAgniData();
    
    // Add event listeners to all clickable cells
    document.querySelectorAll('.clickable-cell').forEach(cell => {
        cell.addEventListener('click', function() {
            handleAgniClick(this);
        });
    });
});

function handleAgniClick(cell) {
    const parameter = cell.dataset.parameter;
    const type = cell.dataset.type;
    
    // Remove previous selection for this parameter
    document.querySelectorAll(`[data-pillar="agni"][data-parameter="${parameter}"]`).forEach(c => {
        c.classList.remove('selected');
    });
    
    // Add selection to clicked cell
    cell.classList.add('selected');
    
    // Update scores
    updateAgniScores(parameter, type);
    
    // Check if assessment is complete (all 8 parameters selected)
    checkAgniCompletion();
}

function updateAgniScores(parameter, selectedType) {
    // Remove previous score for this parameter
    if (assessmentData.selections['agni_' + parameter]) {
        const prevType = assessmentData.selections['agni_' + parameter];
        assessmentData.agni[prevType]--;
    }
    
    // Add new score
    assessmentData.agni[selectedType]++;
    assessmentData.selections['agni_' + parameter] = selectedType;
    
    // Update display
    updateAgniDisplay();
}

function updateAgniDisplay() {
    // Update score cards
    document.getElementById('agni-vishama-score').textContent = assessmentData.agni.vishama;
    document.getElementById('agni-tikshna-score').textContent = assessmentData.agni.tikshna;
    document.getElementById('agni-manda-score').textContent = assessmentData.agni.manda;
    document.getElementById('agni-sama-score').textContent = assessmentData.agni.sama;

    // Calculate total dusti score
    const totalDustiScore = assessmentData.agni.vishama + assessmentData.agni.tikshna + assessmentData.agni.manda;
    
    // Determine severity
    let severity, severityClass, clinicalRisk = '';
    if (totalDustiScore === 0 && assessmentData.agni.sama > 0) {
        severity = 'SAMA AGNI (Balanced)';
        severityClass = 'normal';
        clinicalRisk = 'Ideal digestion, proper dhatu nourishment, immunity';
    } else if (totalDustiScore >= 1 && totalDustiScore <= 4) {
        severity = 'MILD AGNI DUSTI';
        severityClass = 'mild';
    } else if (totalDustiScore >= 5 && totalDustiScore <= 6) {
        severity = 'MODERATE AGNI DUSTI';
        severityClass = 'moderate';
    } else if (totalDustiScore >= 7) {
        severity = 'SEVERE AGNI DUSTI';
        severityClass = 'severe';
    } else {
        severity = 'Assessment in progress...';
        severityClass = 'mild';
    }

    // Find dominant agni type
    let dominantType = '';
    let maxScore = 0;
    Object.keys(assessmentData.agni).forEach(type => {
        if (assessmentData.agni[type] > maxScore) {
            maxScore = assessmentData.agni[type];
            dominantType = type;
        }
    });

    // Set clinical risks based on dominant type
    const risks = {
        vishama: 'IBS, flatulence, irregular metabolism, anxiety (Vata dominance)',
        tikshna: 'Hyperacidity, ulcers, gastritis, inflammation (Pitta dominance)',
        manda: 'Ama formation, metabolic sluggishness, weight gain (Kapha dominance)',
        sama: 'Ideal digestion, proper dhatu nourishment, immunity (Tridosha Balance)'
    };

    if (maxScore > 0) {
        clinicalRisk = risks[dominantType];
    }

    // Update results display
    const resultsHTML = `
        <p><strong>Total Dusti Score:</strong> ${totalDustiScore}/8</p>
        <p><strong>Severity:</strong> <span class="severity-indicator ${severityClass}">${severity}</span></p>
        ${maxScore > 0 ? `<p><strong>Dominant Pattern:</strong> ${dominantType.charAt(0).toUpperCase() + dominantType.slice(1)} Agni (Score: ${maxScore})</p>` : ''}
        <p><strong>Clinical Risk:</strong> ${clinicalRisk}</p>
    `;
    
    const agniResultsEl = document.getElementById('agni-results');
    if (agniResultsEl) agniResultsEl.innerHTML = resultsHTML;
}

function checkAgniCompletion() {
    const agniParameters = ['hunger', 'digestion', 'stool', 'bloating', 'appetite', 'tongue', 'afterfood', 'weight'];
    const selectedCount = agniParameters.filter(param => assessmentData.selections['agni_' + param]).length;
    
    const completeBtn = document.getElementById('agni-complete-btn');
    if (completeBtn) {
        if (selectedCount === 8) {
            completeBtn.disabled = false;
            completeBtn.style.background = 'linear-gradient(135deg, #00b894, #00a085)';
        } else {
            completeBtn.disabled = true;
            completeBtn.style.background = '#ddd';
        }
    }
    
    // Update progress text
    const agniResultsEl = document.getElementById('agni-results');
    if (agniResultsEl) {
        if (selectedCount < 8) {
            agniResultsEl.innerHTML = `
                <p><strong>Progress:</strong> ${selectedCount}/8 parameters assessed</p>
                <p><em>Please complete all parameters to see detailed results.</em></p>
            `;
        }
    }
}

function loadAgniData() {
    const saved = localStorage.getItem('4pcam_agni_data');
    if (saved) {
        const data = JSON.parse(saved);
        
        // Restore agni scores
        Object.keys(data).forEach(type => {
            if (assessmentData.agni[type] !== undefined) {
                assessmentData.agni[type] = data[type];
            }
        });
        
        // Restore selections
        const savedSelections = localStorage.getItem('4pcam_agni_selections');
        if (savedSelections) {
            assessmentData.selections = JSON.parse(savedSelections);
            
            // Restore visual selections
            Object.keys(assessmentData.selections).forEach(key => {
                if (key.startsWith('agni_')) {
                    const parameter = key.replace('agni_', '');
                    const type = assessmentData.selections[key];
                    const cell = document.querySelector(`[data-pillar="agni"][data-parameter="${parameter}"][data-type="${type}"]`);
                    if (cell) {
                        cell.classList.add('selected');
                    }
                }
            });
        }
        
        // Update display
        updateAgniDisplay();
    }
}

// Save data when leaving page
window.addEventListener('beforeunload', () => {
    localStorage.setItem('4pcam_agni_data', JSON.stringify(assessmentData.agni));
    localStorage.setItem('4pcam_agni_selections', JSON.stringify(assessmentData.selections));
});