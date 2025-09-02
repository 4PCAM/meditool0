let combinedData = {};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadAssessmentData();
    generateReport();
});

function loadAssessmentData() {
    const saved = localStorage.getItem('4pcam_combined_data');
    if (saved) {
        try {
            combinedData = JSON.parse(saved);
            
            // Verify all assessments are completed
            if (!combinedData.patient || !combinedData.agni || !combinedData.dosha || 
                !combinedData.dhatu || !combinedData.srotas) {
                alert('Incomplete assessment data found. Please complete all 4 pillars.');
                window.location.href = 'index.html';
                return;
            }
            
        } catch (e) {
            alert('Error loading assessment data. Please start over.');
            window.location.href = 'index.html';
            return;
        }
    } else {
        // Try to load individual assessment data
        combinedData = {
            patient: JSON.parse(localStorage.getItem('4pcam_patient_data') || '{}'),
            agni: JSON.parse(localStorage.getItem('4pcam_agni_data') || '{}'),
            dosha: JSON.parse(localStorage.getItem('4pcam_dosha_data') || '{}'),
            dhatu: JSON.parse(localStorage.getItem('4pcam_dhatu_data') || '{}'),
            srotas: JSON.parse(localStorage.getItem('4pcam_srotas_data') || '{}')
        };
        
        // Save combined data
        localStorage.setItem('4pcam_combined_data', JSON.stringify(combinedData));
    }
}

function generateReport() {
    // Set report date
    const now = new Date();
    document.getElementById('report-date').innerHTML = `
        <p><strong>Report Generated:</strong> ${now.toLocaleDateString()} ${now.toLocaleTimeString()}</p>
    `;

    // Load patient information
    loadPatientInfo();

    // Load each pillar assessment
    loadAgniAssessment();
    loadDoshaAssessment();
    loadDhatuAssessment();
    loadSrotasAssessment();

    // Generate clinical summary
    generateClinicalSummary();

    // Generate recommendations
    generateRecommendations();
}

function loadPatientInfo() {
    const patient = combinedData.patient;
    const infoEl = document.getElementById('patient-info');
    
    infoEl.innerHTML = `
        <div><strong>Name:</strong> ${patient.name || 'N/A'}</div>
        <div><strong>Age/Sex:</strong> ${patient.ageSex || 'N/A'}</div>
        <div><strong>Patient ID:</strong> ${patient.patientId || 'N/A'}</div>
        <div><strong>Date of Assessment:</strong> ${patient.assessmentDate || 'N/A'}</div>
        <div><strong>Referred By:</strong> ${patient.referredBy || 'N/A'}</div>
        <div style="grid-column: 1/-1;"><strong>Chief Complaints:</strong> ${patient.complaints || 'N/A'}</div>
        <div style="grid-column: 1/-1;"><strong>Past History:</strong> ${patient.pastHistory || 'Not specified'}</div>
        <div style="grid-column: 1/-1;"><strong>Additional Points:</strong> ${patient.additionalPoints || 'Not specified'}</div>
    `;
}

function loadAgniAssessment() {
    const agni = combinedData.agni;
    const reportEl = document.getElementById('agni-report');

    // Load scores
    reportEl.innerHTML = `
        <div class="score-grid">
            <div class="score-card">
                <div class="score-value">${agni.vishama || 0}</div>
                <div class="score-label">Viṣama Agni</div>
            </div>
            <div class="score-card">
                <div class="score-value">${agni.tikshna || 0}</div>
                <div class="score-label">Tīkṣṇa Agni</div>
            </div>
            <div class="score-card">
                <div class="score-value">${agni.manda || 0}</div>
                <div class="score-label">Manda Agni</div>
            </div>
            <div class="score-card">
                <div class="score-value">${agni.sama || 0}</div>
                <div class="score-label">Sama Agni</div>
            </div>
        </div>
    `;

    // Calculate assessment
    const totalDusti = (agni.vishama || 0) + (agni.tikshna || 0) + (agni.manda || 0);
    let severity, severityClass;

    if (totalDusti === 0 && agni.sama > 0) {
        severity = 'SAMA AGNI (Balanced)';
        severityClass = 'normal';
    } else if (totalDusti <= 4) {
        severity = 'MILD AGNI DUSTI';
        severityClass = 'mild';
    } else if (totalDusti <= 6) {
        severity = 'MODERATE AGNI DUSTI';
        severityClass = 'moderate';
    } else {
        severity = 'SEVERE AGNI DUSTI';
        severityClass = 'severe';
    }

    // Find dominant agni type
    let dominantType = '';
    let maxScore = 0;
    Object.keys(agni).forEach(type => {
        if (agni[type] > maxScore) {
            maxScore = agni[type];
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

    let clinicalRisk = risks[dominantType] || 'Comprehensive digestive assessment required';

    // Update results display
    const resultsHTML = `
        <p><strong>Total Dusti Score:</strong> ${totalDusti}/8</p>
        <p><strong>Assessment:</strong> <span class="severity-indicator ${severityClass}">${severity}</span></p>
        ${maxScore > 0 ? `<p><strong>Dominant Pattern:</strong> ${dominantType.charAt(0).toUpperCase() + dominantType.slice(1)} Agni (Score: ${maxScore})</p>` : ''}
        <p><strong>Clinical Risk:</strong> ${clinicalRisk}</p>
    `;
    
    reportEl.innerHTML += resultsHTML;
}

function loadDoshaAssessment() {
    const dosha = combinedData.dosha;
    const reportEl = document.getElementById('dosha-report');

    // Load scores
    reportEl.innerHTML = `
        <div class="score-grid">
            <div class="score-card">
                <div class="score-value">${dosha.vata || 0}</div>
                <div class="score-label">Vata Dushti</div>
            </div>
            <div class="score-card">
                <div class="score-value">${dosha.pitta || 0}</div>
                <div class="score-label">Pitta Dushti</div>
            </div>
            <div class="score-card">
                <div class="score-value">${dosha.kapha || 0}</div>
                <div class="score-label">Kapha Dushti</div>
            </div>
        </div>
    `;

    // Determine dominant dosha
    const vScore = dosha.vata || 0;
    const pScore = dosha.pitta || 0;
    const kScore = dosha.kapha || 0;
    const maxScore = Math.max(vScore, pScore, kScore);

    let dominant = 'Balanced State';
    if (maxScore === vScore && vScore > 0) dominant = `Vata Dūṣṭi Dominant`;
    else if (maxScore === pScore && pScore > 0) dominant = `Pitta Dūṣṭi Dominant`;
    else if (maxScore === kScore && kScore > 0) dominant = `Kapha Dūṣṭi Dominant`;

    assessmentEl.innerHTML += `
        <p><strong>Dominant Pattern:</strong> ${dominant}</p>
        <p><strong>Vata Status:</strong> <span class="severity-indicator ${getDoshaSeverityClass(vScore)}">${getDoshaSeverityText(vScore)}</span></p>
        <p><strong>Pitta Status:</strong> <span class="severity-indicator ${getDoshaSeverityClass(pScore)}">${getDoshaSeverityText(pScore)}</span></p>
        <p><strong>Kapha Status:</strong> <span class="severity-indicator ${getDoshaSeverityClass(kScore)}">${getDoshaSeverityText(kScore)}</span></p>
    `;
}

function loadDhatuAssessment() {
    const dhatu = combinedData.dhatu;
    const assessmentEl = document.getElementById('dhatu-assessment');
    const symptomsEl = document.getElementById('dhatu-symptoms');

    // Calculate overall dhatu scores
    let totalKshaya = 0;
    let totalVriddhi = 0;
    let dhatuHTML = '<div class="score-grid">';

    Object.keys(dhatu.scores || {}).forEach(dhatuName => {
        const scores = dhatu.scores[dhatuName];
        totalKshaya += scores.kshaya || 0;
        totalVriddhi += scores.vriddhi || 0;
        
        dhatuHTML += `
            <div class="score-card">
                <div class="score-value">${(scores.kshaya || 0) + (scores.vriddhi || 0)}</div>
                <div class="score-label">${dhatuName.charAt(0).toUpperCase() + dhatuName.slice(1)}</div>
            </div>
        `;
    });

    dhatuHTML += '</div>';

    const totalDhatuScore = totalKshaya + totalVriddhi;
    let severity = 'normal';
    let severityText = 'No significant dhatu dushti';
    
    if (totalDhatuScore >= 1 && totalDhatuScore <= 10) {
        severity = 'mild';
        severityText = 'Mild dhatu imbalance';
    } else if (totalDhatuScore >= 11 && totalDhatuScore <= 20) {
        severity = 'moderate';
        severityText = 'Moderate dhatu dysfunction';
    } else if (totalDhatuScore >= 21) {
        severity = 'severe';
        severityText = 'Severe dhatu pathology';
    }

    dhatuHTML += `
        <p><strong>Total Dhatu Score:</strong> ${totalDhatuScore} (Kshaya: ${totalKshaya}, Vriddhi: ${totalVriddhi})</p>
        <p><strong>Assessment:</strong> <span class="severity-indicator ${severity}">${severityText}</span></p>
    `;

    assessmentEl.innerHTML = dhatuHTML;

    // Load symptoms
    const selectedSymptoms = dhatu.selectedSymptoms || {};
    let symptomsHTML = '';
    
    Object.keys(selectedSymptoms).forEach(dhatuName => {
        const dhatuSymptoms = selectedSymptoms[dhatuName];
        const kshayaSymptoms = dhatuSymptoms.kshaya || [];
        const vriddhiSymptoms = dhatuSymptoms.vriddhi || [];
        
        if (kshayaSymptoms.length > 0 || vriddhiSymptoms.length > 0) {
            symptomsHTML += `
                <div style="margin-bottom: 15px;">
                    <strong>${dhatuName.charAt(0).toUpperCase() + dhatuName.slice(1)} Dhatu:</strong>
                    ${kshayaSymptoms.length > 0 ? `
                        <div style="margin-top: 5px;"><em>Kshaya (Depletion):</em></div>
                        <div class="symptom-tags" style="margin-top: 5px;">
                            ${kshayaSymptoms.map(s => `<span class="symptom-tag">${s.symptom} (${s.severity})</span>`).join('')}
                        </div>
                    ` : ''}
                    ${vriddhiSymptoms.length > 0 ? `
                        <div style="margin-top: 5px;"><em>Vriddhi (Excess):</em></div>
                        <div class="symptom-tags" style="margin-top: 5px;">
                            ${vriddhiSymptoms.map(s => `<span class="symptom-tag">${s.symptom} (${s.severity})</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        }
    });

    symptomsEl.innerHTML = symptomsHTML || '<p>No specific dhatu symptoms recorded</p>';
}

function loadSrotasAssessment() {
    const srotas = combinedData.srotas;
    const assessmentEl = document.getElementById('srotas-assessment');
    const symptomsEl = document.getElementById('srotas-symptoms');

    // Calculate overall srotas scores
    let totalScore = 0;
    let srotasHTML = '<div class="score-grid">';

    const srotasNames = {
        pranavaha: 'Pranavaha',
        udakavaha: 'Udakavaha',
        annavaha: 'Annavaha',
        rasavaha: 'Rasavaha',
        raktavaha: 'Raktavaha',
        mamsavaha: 'Mamsavaha',
        medavaha: 'Medavaha',
        asthivaha: 'Asthivaha',
        majjavaha: 'Majjavaha',
        shukravaha: 'Shukravaha',
        mutravaha: 'Mutravaha',
        purishavaha: 'Purishavaha',
        swedavaha: 'Swedavaha',
        artavavaha: 'Artavavaha',
        stanyavaha: 'Stanyavaha'
    };

    Object.keys(srotas.scores || {}).forEach(srotasName => {
        const score = srotas.scores[srotasName] || 0;
        totalScore += score;
        
        srotasHTML += `
            <div class="score-card">
                <div class="score-value">${score}</div>
                <div class="score-label">${srotasNames[srotasName]}</div>
            </div>
        `;
    });

    srotasHTML += '</div>';

    let severity = 'normal';
    let severityText = 'No significant srotas dysfunction';
    
    if (totalScore >= 1 && totalScore <= 10) {
        severity = 'mild';
        severityText = 'Mild srotas dysfunction';
    } else if (totalScore >= 11 && totalScore <= 20) {
        severity = 'moderate';
        severityText = 'Moderate srotas blockage';
    } else if (totalScore >= 21) {
        severity = 'severe';
        severityText = 'Severe srotas pathology';
    }

    srotasHTML += `
        <p><strong>Total Srotas Score:</strong> ${totalScore}</p>
        <p><strong>Assessment:</strong> <span class="severity-indicator ${severity}">${severityText}</span></p>
    `;

    assessmentEl.innerHTML = srotasHTML;

    // Load symptoms
    const selectedSymptoms = srotas.selectedSymptoms || {};
    let symptomsHTML = '';
    
    Object.keys(selectedSymptoms).forEach(srotasName => {
        const symptoms = selectedSymptoms[srotasName] || [];
        if (symptoms.length > 0) {
            symptomsHTML += `
                <div style="margin-bottom: 15px;">
                    <strong>${srotasNames[srotasName]} Srotas:</strong>
                    <div class="symptom-tags" style="margin-top: 8px;">
                        ${symptoms.map(s => `<span class="symptom-tag">${s.symptom} (${s.severity})</span>`).join('')}
                    </div>
                </div>
            `;
        }
    });

    symptomsEl.innerHTML = symptomsHTML || '<p>No specific srotas symptoms recorded</p>';
}

function generateClinicalSummary() {
    const agni = combinedData.agni;
    const dosha = combinedData.dosha;
    const dhatu = combinedData.dhatu;
    const srotas = combinedData.srotas;

    // Agni Summary
    const agniTotal = (agni.vishama || 0) + (agni.tikshna || 0) + (agni.manda || 0);
    let agniStatus = 'Sama Agni (Optimal)';
    if (agniTotal > 0) {
        if (agniTotal <= 4) agniStatus = 'Mild Agni Dusti';
        else if (agniTotal <= 6) agniStatus = 'Moderate Agni Dusti';
        else agniStatus = 'Severe Agni Dusti';
    }
    document.getElementById('agni-summary').innerHTML = `
        <p><strong>Status:</strong> ${agniStatus}</p>
        <p><strong>Score:</strong> ${agniTotal}/8</p>
        <p><strong>Impact:</strong> ${getAgniImpact(agniTotal)}</p>
    `;

    // Dosha Summary
    const vScore = dosha.vata || 0;
    const pScore = dosha.pitta || 0;
    const kScore = dosha.kapha || 0;
    const maxScore = Math.max(vScore, pScore, kScore);
    
    let dominantDosha = 'Balanced State';
    if (maxScore === vScore && vScore > 0) dominantDosha = `Vata Dushti (${vScore})`;
    else if (maxScore === pScore && pScore > 0) dominantDosha = `Pitta Dushti (${pScore})`;
    else if (maxScore === kScore && kScore > 0) dominantDosha = `Kapha Dushti (${kScore})`;
    
    document.getElementById('dosha-summary').innerHTML = `
        <p><strong>Pattern:</strong> ${dominantDosha}</p>
        <p><strong>Total Score:</strong> ${vScore + pScore + kScore}</p>
        <p><strong>Constitution:</strong> ${getDoshaConstitution(vScore, pScore, kScore)}</p>
    `;

    // Dhatu Summary
    const dhatuScores = dhatu.scores || {};
    const totalDhatuSymptoms = Object.values(dhatu.selectedSymptoms || {}).reduce((total, d) => {
        return total + (d.kshaya ? d.kshaya.length : 0) + (d.vriddhi ? d.vriddhi.length : 0);
    }, 0);
    
    document.getElementById('dhatu-summary').innerHTML = `
        <p><strong>Affected Dhatus:</strong> ${Object.keys(dhatuScores).filter(d => 
            (dhatuScores[d].kshaya || 0) + (dhatuScores[d].vriddhi || 0) > 0
        ).length}/7</p>
        <p><strong>Total Symptoms:</strong> ${totalDhatuSymptoms}</p>
        <p><strong>Priority:</strong> ${getDhatuPriority(dhatuScores)}</p>
    `;

    // Srotas Summary
    const srotasScores = srotas.scores || {};
    const totalSrotasScore = Object.values(srotasScores).reduce((total, score) => total + score, 0);
    const affectedSrotas = Object.keys(srotasScores).filter(s => srotasScores[s] > 0).length;
    
    document.getElementById('srotas-summary').innerHTML = `
        <p><strong>Affected Channels:</strong> ${affectedSrotas}/15</p>
        <p><strong>Total Score:</strong> ${totalSrotasScore}</p>
        <p><strong>Severity:</strong> ${getSrotasSeverity(totalSrotasScore)}</p>
    `;
}

function generateRecommendations() {
    const agni = combinedData.agni;
    const dosha = combinedData.dosha;
    const dhatu = combinedData.dhatu;
    const srotas = combinedData.srotas;
    
    const recommendations = [];
    
    // Agni-based recommendations
    const agniTotal = (agni.vishama || 0) + (agni.tikshna || 0) + (agni.manda || 0);
    if (agniTotal > 0) {
        if (agni.vishama > agni.tikshna && agni.vishama > agni.manda) {
            recommendations.push('Focus on Vata pacifying diet and lifestyle to regularize Agni');
        } else if (agni.tikshna > agni.vishama && agni.tikshna > agni.manda) {
            recommendations.push('Implement Pitta pacifying measures to reduce excessive digestive fire');
        } else if (agni.manda > agni.vishama && agni.manda > agni.tikshna) {
            recommendations.push('Initiate Kapha reducing therapies to enhance digestive capacity');
        }
    }
    
    // Dosha-based recommendations
    const vScore = dosha.vata || 0;
    const pScore = dosha.pitta || 0;
    const kScore = dosha.kapha || 0;
    const maxDosha = Math.max(vScore, pScore, kScore);
    
    if (maxDosha > 0) {
        if (vScore === maxDosha) {
            recommendations.push('Vata balancing treatments: oil massage, warm food, regular routine');
        } else if (pScore === maxDosha) {
            recommendations.push('Pitta balancing treatments: cooling diet, stress management, bitter herbs');
        } else if (kScore === maxDosha) {
            recommendations.push('Kapha balancing treatments: exercise, spicy food, drying therapies');
        }
    }
    
    // Dhatu-based recommendations
    const dhatuScores = dhatu.scores || {};
    Object.keys(dhatuScores).forEach(dhatu => {
        const total = (dhatuScores[dhatu].kshaya || 0) + (dhatuScores[dhatu].vriddhi || 0);
        if (total > 5) {
            recommendations.push(`${dhatu.charAt(0).toUpperCase() + dhatu.slice(1)} dhatu requires specific nourishment therapy`);
        }
    });
    
    // Srotas-based recommendations
    const srotasScores = srotas.scores || {};
    Object.keys(srotasScores).forEach(srotas => {
        if (srotasScores[srotas] > 5) {
            recommendations.push(`${srotas.charAt(0).toUpperCase() + srotas.slice(1)} srotas channel clearing needed`);
        }
    });
    
    // Default recommendations
    if (recommendations.length === 0) {
        recommendations.push('Maintain current balanced state with preventive healthcare');
        recommendations.push('Regular follow-up assessments recommended');
    }
    
    // Display recommendations
    const listEl = document.getElementById('recommendations-list');
    listEl.innerHTML = recommendations.map(rec => `<li class="recommendation-item">${rec}</li>`).join('');
}

// Helper functions
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

function getAgniImpact(score) {
    if (score === 0) return 'Optimal digestive capacity';
    if (score <= 4) return 'Minor digestive irregularities';
    if (score <= 6) return 'Significant digestive dysfunction';
    return 'Severe digestive pathology requiring immediate attention';
}

function getDoshaConstitution(vata, pitta, kapha) {
    const scores = [vata, pitta, kapha];
    const names = ['Vata', 'Pitta', 'Kapha'];
    const dominant = [];
    const max = Math.max(...scores);
    
    scores.forEach((score, i) => {
        if (score === max && score > 0) dominant.push(names[i]);
    });
    
    if (dominant.length === 0) return 'Balanced Constitution';
    if (dominant.length === 1) return `${dominant[0]} Predominant`;
    return `${dominant.join('-')} Mixed Type`;
}

function getDhatuPriority(scores) {
    let maxScore = 0;
    let priority = 'All dhatus balanced';
    
    Object.keys(scores).forEach(dhatu => {
        const total = (scores[dhatu].kshaya || 0) + (scores[dhatu].vriddhi || 0);
        if (total > maxScore) {
            maxScore = total;
            priority = `${dhatu.charAt(0).toUpperCase() + dhatu.slice(1)} dhatu requires attention`;
        }
    });
    
    return priority;
}

function getSrotasSeverity(score) {
    if (score === 0) return 'All channels functioning optimally';
    if (score <= 15) return 'Mild channel dysfunction';
    if (score <= 30) return 'Moderate channel blockage';
    if (score <= 50) return 'Severe channel pathology';
    return 'Critical channel dysfunction requiring immediate intervention';
}

// Export and action functions
async function exportToPDF() {
    const { jsPDF } = window.jspdf;
    
    if (!jsPDF) {
        alert('PDF library not loaded. Please try again.');
        return;
    }

    try {
        // Hide action buttons temporarily
        const actionsSection = document.querySelector('.actions-section');
        actionsSection.style.display = 'none';
        
        // Create PDF
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Use html2canvas to convert content to image
        const canvas = await html2canvas(document.getElementById('report-container'), {
            scale: 1.5,
            useCORS: true,
            logging: false,
            scrollX: 0,
            scrollY: 0,
            windowWidth: 1200
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.7);
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 295; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        // Add first page
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Add additional pages if needed
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        // Generate filename
        const patientName = combinedData.patient.name || 'Patient';
        const date = new Date().toISOString().split('T')[0];
        const filename = `${patientName.replace(/\s+/g, '_')}_4PCAM_Report_${date}.pdf`;

        // Save the PDF
        pdf.save(filename);
        
        // Show action buttons again
        actionsSection.style.display = 'flex';
        
        alert('PDF report generated successfully!');
        
    } catch (error) {
        console.error('PDF generation failed:', error);
        alert('Failed to generate PDF. Please try printing instead.');
        // Show action buttons again
        document.querySelector('.actions-section').style.display = 'flex';
    }
}

function printReport() {
    // Hide action buttons for printing
    const actionsSection = document.querySelector('.actions-section');
    actionsSection.style.display = 'none';
    
    // Print
    window.print();
    
    // Show action buttons again after print dialog
    setTimeout(() => {
        actionsSection.style.display = 'flex';
    }, 100);
}

function saveReport() {
    // Create comprehensive report data
    const reportData = {
        metadata: {
            reportGeneratedOn: new Date().toISOString(),
            systemVersion: '4-PCAM v1.0',
            assessmentComplete: true
        },
        patient: combinedData.patient,
        assessments: {
            agni: combinedData.agni,
            dosha: combinedData.dosha,
            dhatu: combinedData.dhatu,
            srotas: combinedData.srotas
        },
        summary: {
            agni: getAgniSummary(),
            dosha: getDoshaSummary(),
            dhatu: getDhatuSummary(),
            srotas: getSrotasSummary()
        },
        recommendations: getRecommendationsList()
    };

    // Save as JSON file
    const reportJSON = JSON.stringify(reportData, null, 2);
    const blob = new Blob([reportJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    const patientName = combinedData.patient.name || 'Patient';
    const date = new Date().toISOString().split('T')[0];
    a.download = `${patientName.replace(/\s+/g, '_')}_4PCAM_Complete_${date}.json`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('Complete assessment data saved successfully!');
}

function resetAllData() {
    if (confirm('⚠️ Are you sure you want to delete ALL assessment data?\\n\\nThis will permanently remove:\\n• Patient information\\n• All assessment results\\n• All selected symptoms\\n• This report\\n\\nThis action cannot be undone!')) {
        // Clear all localStorage data
        localStorage.removeItem('4pcam_patient_data');
        localStorage.removeItem('4pcam_agni_data');
        localStorage.removeItem('4pcam_dosha_data');
        localStorage.removeItem('4pcam_dhatu_data');
        localStorage.removeItem('4pcam_srotas_data');
        localStorage.removeItem('4pcam_combined_data');
        localStorage.removeItem('4pcam_completed');
        localStorage.removeItem('4pcam_agni_selections');
        localStorage.removeItem('4pcam_dosha_selections');

        alert('✅ All data has been reset successfully!');
        window.location.href = 'index.html';
    }
}

// Helper functions for report data
function getAgniSummary() {
    const agni = combinedData.agni;
    const total = (agni.vishama || 0) + (agni.tikshna || 0) + (agni.manda || 0);
    
    return {
        totalScore: total,
        maxScore: 8,
        status: total === 0 ? 'Sama Agni' : total <= 4 ? 'Mild Dusti' : total <= 6 ? 'Moderate Dusti' : 'Severe Dusti',
        dominantType: getDominantAgniType(agni),
        selectedSymptoms: Object.keys(agni.selectedSymptoms || {}).length
    };
}

function getDoshaSummary() {
    const dosha = combinedData.dosha;
    const vScore = dosha.vata || 0;
    const pScore = dosha.pitta || 0;
    const kScore = dosha.kapha || 0;
    
    return {
        vataScore: vScore,
        pittaScore: pScore,
        kaphaScore: kScore,
        totalScore: vScore + pScore + kScore,
        dominantDosha: getDominantDoshaType(vScore, pScore, kScore),
        selectedSymptoms: Object.values(dosha.selectedSymptoms || {}).reduce((total, symptoms) => total + symptoms.length, 0)
    };
}

function getDhatuSummary() {
    const dhatu = combinedData.dhatu;
    const scores = dhatu.scores || {};
    
    let totalKshaya = 0;
    let totalVriddhi = 0;
    let affectedDhatus = 0;
    
    Object.keys(scores).forEach(d => {
        const kshaya = scores[d].kshaya || 0;
        const vriddhi = scores[d].vriddhi || 0;
        totalKshaya += kshaya;
        totalVriddhi += vriddhi;
        if (kshaya > 0 || vriddhi > 0) affectedDhatus++;
    });
    
    return {
        totalKshaya,
        totalVriddhi,
        totalScore: totalKshaya + totalVriddhi,
        affectedDhatus,
        totalDhatus: 7,
        selectedSymptoms: Object.values(dhatu.selectedSymptoms || {}).reduce((total, d) => 
            total + (d.kshaya ? d.kshaya.length : 0) + (d.vriddhi ? d.vriddhi.length : 0), 0)
    };
}

function getSrotasSummary() {
    const srotas = combinedData.srotas;
    const scores = srotas.scores || {};
    const totalScore = Object.values(scores).reduce((total, score) => total + score, 0);
    const affectedSrotas = Object.keys(scores).filter(s => scores[s] > 0).length;
    
    return {
        totalScore,
        affectedSrotas,
        totalSrotas: 15,
        selectedSymptoms: Object.values(srotas.selectedSymptoms || {}).reduce((total, symptoms) => total + symptoms.length, 0)
    };
}

function getRecommendationsList() {
    // Return the current recommendations from the page
    const recommendationElements = document.querySelectorAll('.recommendation-item');
    return Array.from(recommendationElements).map(el => el.textContent);
}

function getDominantAgniType(agni) {
    const types = ['vishama', 'tikshna', 'manda', 'sama'];
    let maxScore = 0;
    let dominant = 'balanced';
    
    types.forEach(type => {
        if ((agni[type] || 0) > maxScore) {
            maxScore = agni[type];
            dominant = type;
        }
    });
    
    return dominant;
}

function getDominantDoshaType(vata, pitta, kapha) {
    const max = Math.max(vata, pitta, kapha);
    if (max === 0) return 'balanced';
    if (max === vata) return 'vata';
    if (max === pitta) return 'pitta';
    return 'kapha';
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        printReport();
    }
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveReport();
    }
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        exportToPDF();
    }
});
