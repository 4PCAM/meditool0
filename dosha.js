document.addEventListener('DOMContentLoaded', function() {
    // Load saved data
    loadDoshaData();
    
    // Add event listeners to all clickable cells
    const clickableCells = document.querySelectorAll('.clickable-cell');
    clickableCells.forEach(cell => {
        cell.addEventListener('click', function() {
            handleDoshaClick(this);
        });
    });
});

function handleDoshaClick(cell) {
    const dosha = cell.dataset.dosha;
    const parameter = cell.dataset.parameter;
    const score = parseInt(cell.dataset.score) || 0;
    
    // Remove previous selection for this parameter
    document.querySelectorAll(`[data-parameter="${parameter}"]`).forEach(c => {
        c.classList.remove('selected');
        // Remove any existing severity controls
        const existingControls = c.querySelector('.dosha-severity-controls');
        if (existingControls) {
            existingControls.remove();
        }
    });
    
    // Add selection to clicked cell
    cell.classList.add('selected');
    
    // Inject severity controls if not already present
    if (!cell.querySelector('.dosha-severity-controls')) {
        injectSeverityControls(cell, dosha, parameter);
    }
    
    // Update scores
    updateDoshaScores(dosha, parameter, score);
    
    // Check if assessment is complete
    checkDoshaCompletion();
}

function injectSeverityControls(cell, dosha, parameter) {
    const controls = document.createElement('div');
    controls.className = 'dosha-severity-controls';
    controls.style.display = 'flex';
    controls.style.justifyContent = 'center';
    controls.style.gap = '6px';
    controls.style.marginTop = '8px';
    
    // If NAD column → only one 0 button (green)
    if (dosha === 'nad') {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'dosha-severity-btn';
        btn.dataset.dosha = dosha;
        btn.dataset.parameter = parameter;
        btn.dataset.score = '0';
        btn.textContent = '0';
        btn.style.background = '#a8e6a3'; // light green
        btn.style.color = '#333';
        btn.style.border = 'none';
        btn.style.padding = '6px 8px';
        btn.style.borderRadius = '6px';
        btn.style.fontWeight = '600';
        btn.style.cursor = 'pointer';
        btn.style.minWidth = '36px';
        btn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
        
        btn.addEventListener('click', e => {
            e.stopPropagation();
            setDoshaSeverity(dosha, parameter, 0, btn);
        });
        
        controls.appendChild(btn);
    } else {
        // For Vata/Pitta/Kapha → 0, 1, 2 buttons
        const scores = [0, 1, 2];
        const colors = ['#a8e6a3', '#ffeaa7', '#fd79a8']; // green, yellow, red
        
        scores.forEach((score, index) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'dosha-severity-btn';
            btn.dataset.dosha = dosha;
            btn.dataset.parameter = parameter;
            btn.dataset.score = score.toString();
            btn.textContent = score.toString();
            btn.style.background = colors[index];
            btn.style.color = score === 0 ? '#333' : 'white';
            btn.style.border = 'none';
            btn.style.padding = '6px 8px';
            btn.style.borderRadius = '6px';
            btn.style.fontWeight = '600';
            btn.style.cursor = 'pointer';
            btn.style.minWidth = '36px';
            btn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
            
            btn.addEventListener('click', e => {
                e.stopPropagation();
                setDoshaSeverity(dosha, parameter, score, btn);
            });
            
            controls.appendChild(btn);
        });
    }
    
    cell.appendChild(controls);
}

function setDoshaSeverity(dosha, parameter, score, btn) {
    // Remove active class from all buttons in this cell
    const allBtns = btn.parentElement.querySelectorAll('.dosha-severity-btn');
    allBtns.forEach(b => b.classList.remove('active'));
    
    // Add active class to clicked button
    btn.classList.add('active');
    
    // Update scores
    updateDoshaScores(dosha, parameter, score);
    
    // Save selection
    if (!assessmentData.doshaSelections) {
        assessmentData.doshaSelections = {};
    }
    assessmentData.doshaSelections[`${dosha}_${parameter}` = {
        dosha: dosha,
        parameter: parameter,
        score: score,
        severityText: score === 0 ? 'Normal' : score === 1 ? 'Mild' : 'Severe'
    };
}

function updateDoshaScores(dosha, parameter, score) {
    // Reset all dosha scores for this parameter first
    ['vata', 'pitta', 'kapha', 'nad'].forEach(d => {
        const key = `${d}_${parameter}`;
        if (assessmentData.doshaSelections && assessmentData.doshaSelections[key]) {
            const oldScore = assessmentData.doshaSelections[key].score;
            if (assessmentData.dosha[d] !== undefined) {
                assessmentData.dosha[d] -= oldScore;
            }
        }
    });
    
    // Add new score
    if (dosha !== 'nad' && assessmentData.dosha[dosha] !== undefined) {
        assessmentData.dosha[dosha] += score;
    }
    
    // Update display
    updateDoshaDisplay();
}

function updateDoshaDisplay() {
    // Update score cards
    document.getElementById('vata-score').textContent = assessmentData.dosha.vata || 0;
    document.getElementById('pitta-score').textContent = assessmentData.dosha.pitta || 0;
    document.getElementById('kapha-score').textContent = assessmentData.dosha.kapha || 0;

    // Calculate assessment
    const vScore = assessmentData.dosha.vata || 0;
    const pScore = assessmentData.dosha.pitta || 0;
    const kScore = assessmentData.dosha.kapha || 0;
    const maxScore = Math.max(vScore, pScore, kScore);

    let dominant = 'Balanced';
    if (maxScore === vScore && vScore > 0) dominant = 'Vata Dūṣṭi Dominant';
    else if (maxScore === pScore && pScore > 0) dominant = 'Pitta Dūṣṭi Dominant';
    else if (maxScore === kScore && kScore > 0) dominant = 'Kapha Dūṣṭi Dominant';

    // Generate results
    const resultsHTML = `
        <p><strong>Dominant Pattern:</strong> ${dominant}</p>
        <p><strong>Vata Status:</strong> <span class="severity-indicator ${getDoshaSeverityClass(vScore)}">${getDoshaSeverityText(vScore)}</span></p>
        <p><strong>Pitta Status:</strong> <span class="severity-indicator ${getDoshaSeverityClass(pScore)}">${getDoshaSeverityText(pScore)}</span></p>
        <p><strong>Kapha Status:</strong> <span class="severity-indicator ${getDoshaSeverityClass(kScore)}">${getDoshaSeverityText(kScore)}</span></p>
        <p><strong>Total Score:</strong> ${vScore + pScore + kScore}/30</p>
    `;
    
    const doshaResultsEl = document.getElementById('dosha-results');
    if (doshaResultsEl) doshaResultsEl.innerHTML = resultsHTML;
}

function getDoshaSeverityClass(score) {
    if (score <= 4) return 'normal';
    if (score <= 9) return 'mild';
    if (score <= 14) return 'moderate';
    return 'severe';
}

function getDoshaSeverityText(score) {
    if (score <= 4) return 'No significant dushti';
    if (score <= 9) return 'Mild dushti';
    if (score <= 14) return 'Moderate dushti';
    return 'Severe dushti';
}

function checkDoshaCompletion() {
    const parameters = ['agni', 'mala', 'mutra', 'sveda', 'sparsha', 'bala', 'manasika', 'gati', 'roopam', 'jihva'];
    const selectedCount = parameters.filter(param => {
        return ['vata', 'pitta', 'kapha', 'nad'].some(dosha => 
            assessmentData.doshaSelections && assessmentData.doshaSelections[`${dosha}_${param}`]
        );
    }).length;
    
    const completeBtn = document.getElementById('dosha-complete-btn');
    if (completeBtn) {
        if (selectedCount === 10) {
            completeBtn.disabled = false;
            completeBtn.style.background = 'linear-gradient(135deg, #00b894, #00a085)';
        } else {
            completeBtn.disabled = true;
            completeBtn.style.background = '#ddd';
        }
    }
    
    // Update progress text
    const doshaResultsEl = document.getElementById('dosha-results');
    if (doshaResultsEl && selectedCount < 10) {
        doshaResultsEl.innerHTML = `
            <p><strong>Progress:</strong> ${selectedCount}/10 parameters assessed</p>
            <p><em>Please complete all parameters to view detailed results.</em></p>
        `;
    }
}

function loadDoshaData() {
    const saved = localStorage.getItem('4pcam_dosha_data');
    if (saved) {
        const data = JSON.parse(saved);
        
        // Restore dosha scores
        Object.keys(data).forEach(dosha => {
            if (assessmentData.dosha[dosha] !== undefined) {
                assessmentData.dosha[dosha] = data[dosha];
            }
        });
        
        // Restore selections
        const savedSelections = localStorage.getItem('4pcam_dosha_selections');
        if (savedSelections) {
            assessmentData.doshaSelections = JSON.parse(savedSelections);
            
            // Restore visual selections and severity controls
            Object.keys(assessmentData.doshaSelections).forEach(key => {
                const selection = assessmentData.doshaSelections[key];
                const cell = document.querySelector(`[data-dosha="${selection.dosha}"][data-parameter="${selection.parameter}"]`);
                if (cell) {
                    cell.classList.add('selected');
                    injectSeverityControls(cell, selection.dosha, selection.parameter);
                    
                    // Set active button
                    const activeBtn = cell.querySelector(`[data-score="${selection.score}"]`);
                    if (activeBtn) {
                        activeBtn.classList.add('active');
                    }
                }
            });
        }
        
        // Update display
        updateDoshaDisplay();
    }
}

// Save data when leaving page
window.addEventListener('beforeunload', () => {
    localStorage.setItem('4pcam_dosha_data', JSON.stringify(assessmentData.dosha));
    localStorage.setItem('4pcam_dosha_selections', JSON.stringify(assessmentData.doshaSelections));
});