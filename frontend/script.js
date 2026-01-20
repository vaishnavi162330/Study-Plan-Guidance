const API_BASE_URL = "https://study-plan-guidance.onrender.com/"; // <-- Paste here
const state = {
    topic: "",
    hours: "",
    days: "",
    goal: "Exam Prep",
    level: "Beginner"
};

// --- CHIP SELECTION ---
document.querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        state.goal = btn.dataset.val;
    });
});

// --- GENERATE ACTION ---
const generateBtn = document.getElementById('btn-generate');
if (generateBtn) {
    generateBtn.addEventListener('click', () => {
        const topicInput = document.getElementById('topic-title-input');

        if (!topicInput.value.trim()) {
            topicInput.focus();
            // Pulse Error Effect
            topicInput.style.borderColor = '#FF5E00';
            topicInput.style.boxShadow = '0 0 10px rgba(255, 94, 0, 0.4)';
            setTimeout(() => {
                topicInput.style.borderColor = '';
                topicInput.style.boxShadow = '';
            }, 1000);
            return;
        }

        // Capture Inputs
        state.topic = topicInput.value.trim();
        state.syllabus = document.getElementById('syllabus-input').value.trim();
        state.hours = document.getElementById('hours-input').value.trim();
        state.days = document.getElementById('days-input').value.trim();

        const levelEl = document.querySelector('input[name="level"]:checked');
        if (levelEl) state.level = levelEl.value;

        startGeneration();
    });
}

// --- RESTART / NEW PLAN ---
const restartBtn = document.getElementById('btn-restart');
if (restartBtn) {
    restartBtn.addEventListener('click', () => {
        switchView('step-config');
    });
}

// --- VIEW SWITCHER ---
function switchView(id) {
    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active-view');
        setTimeout(() => {
            if (!v.classList.contains('active-view')) v.classList.add('hidden');
        }, 500); // fade out
    });

    const target = document.getElementById(id);
    target.classList.remove('hidden');
    // Small delay to allow 'hidden' removal to register before opacity transition
    requestAnimationFrame(() => {
        target.classList.add('active-view');
    });
}

// --- API CALL & LOADING ---
function startGeneration() {
    switchView('step-loading');

    // Tech Animation Text Cycle
    const msgs = [
        "ESTABLISHING NEURAL HANDSHAKE...",
        "PARSING SYLLABUS ARCHITECTURE...",
        "OPTIMIZING LEARNING VECTORS...",
        "SYNTHESIZING BLUEPRINT..."
    ];
    let i = 0;
    const msgEl = document.getElementById('loading-msg');

    // Initial Text
    msgEl.innerText = msgs[0];

    const interval = setInterval(() => {
        i++;
        if (i < msgs.length) {
            msgEl.innerText = msgs[i];
        }
    }, 1500);

    fetch(`${API_BASE_URL}/api/generate-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state)
    })
        .then(r => r.json())
        .then(data => {
            clearInterval(interval);
            if (data.error) throw new Error(data.error);
            renderPlan(data);
            switchView('step-results');
        })
        .catch(e => {
            clearInterval(interval);
            const msgEl = document.getElementById('loading-msg');
            msgEl.style.color = '#ef4444'; // Red error
            msgEl.innerHTML = `SYSTEM FAILURE: ${e.message}<br><br><span style="font-size:0.9rem; color:#888;">Reseting neural link...</span>`;

            // Auto reset after 4 seconds
            setTimeout(() => {
                msgEl.style.color = ''; // reset color
                switchView('step-config');
            }, 4000);
        });
}

// --- RENDER LOGIC ---
function renderPlan(data) {
    // 1. Meta Data
    document.getElementById('plan-topic').innerText = state.topic;
    document.getElementById('plan-meta').innerText = `${state.goal} Protocol • ${state.level} Tier`;

    // 2. Sidebar Stats (Strict Logic populated)
    const strategyText = document.getElementById('strategy-text');
    if (strategyText) strategyText.innerText = data.strategy_notes || "Follow the blueprint strictly.";

    const adaptationText = document.getElementById('adaptation-text');
    if (adaptationText) adaptationText.innerText = data.adaptation_rule || "Adjust velocity based on comprehension.";

    const focusList = document.getElementById('focus-list');
    focusList.innerHTML = "";
    if (data.focus_areas && Array.isArray(data.focus_areas)) {
        data.focus_areas.forEach(f => {
            focusList.innerHTML += `<li>${f}</li>`;
        });
    }

    // 3. Timeline Construction
    const timeline = document.getElementById('timeline-container');
    timeline.innerHTML = "";

    if (data.plan && Array.isArray(data.plan)) {
        data.plan.forEach((item, index) => {
            // Subtopics pill generation
            const subtopics = Array.isArray(item.subtopics)
                ? item.subtopics.map(s => `<span>${s}</span>`).join('')
                : "";

            // Dynamic Color Logic based on Intensity/Priority
            let accentColor = '#FF5E00'; // Default Orange
            if (item.intensity) {
                const lowerInt = item.intensity.toLowerCase();
                if (lowerInt.includes('high')) accentColor = '#FF0055'; // Pink/Red for High
                if (lowerInt.includes('medium')) accentColor = '#FF8C00'; // Orange
                if (lowerInt.includes('low')) accentColor = '#00D1FF'; // Cyan for Low
            }

            // Important Highlight
            let importantBadge = "";
            let containerStyle = "";

            if (item.important) {
                accentColor = '#FF0055';
                importantBadge = `<span class="important-badge" style="background:${accentColor}; margin-right:0.5rem;">CRITICAL NODE</span>`;
                containerStyle = `box-shadow: 0 0 20px ${accentColor}20; border-color: ${accentColor}60;`;
            }

            // HTML Structure
            const div = document.createElement('div');
            div.className = 'timeline-item';
            div.style.animationDelay = `${index * 0.1}s`;

            // Inject dynamic style for connector color
            const styleTag = document.createElement('style');
            styleTag.innerHTML = `.timeline-item:nth-child(${index + 1})::before { background: ${accentColor}; box-shadow: 0 0 10px ${accentColor}; }`;
            div.appendChild(styleTag);

            div.innerHTML += `
                <div class="time-col" style="min-width: 80px; text-align: right; padding-right: 1rem; color: #888; font-family:var(--font-mono); font-size:0.9rem;">
                    ${item.duration || "FLEX"}
                </div>

                <div class="content-col" style="${containerStyle}">
                    <h3 style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">
                        <span style="color:${accentColor}">${item.unit_title}</span>
                        <div style="display:flex; align-items:center;">
                            ${importantBadge}
                        </div>
                    </h3>
                    <p style="margin-top:0.5rem; color:#ccc;">${item.description}</p>
                    <div class="subtopics" style="margin-top:1rem;">${subtopics}</div>
                    <small style="display:block; margin-top:1rem; color:#666; font-size:0.75rem;">Click for detailed breakdown</small>
                </div>
            `;

            // Add Click Listener for Sidebar
            div.addEventListener('click', () => openSidebar(item));

            timeline.appendChild(div);
        });
    }
}

// --- SAVE SYSTEM ---
let currentPlanData = null; // Store for saving

// On Generate Success, store data
function handleGenSuccess(data) {
    currentPlanData = data;
    renderPlan(data);
    switchView('step-results');
}

// Modify fetch callback to use handleGenSuccess
// (We need to update the fetch section above or just overwrite the callback logic if possible.
// Since we are replacing the bottom of the file, let's just make sure renderPlan is handled.
// Actually, fetch calls renderPlan directly. We need to capture the data.
// We will update renderPlan to set currentPlanData as well.)

// Overwrite the renderPlan start to capture data? 
// Better: Add Save Listener
const saveBtn = document.getElementById('btn-save');
if (saveBtn) {
    saveBtn.addEventListener('click', () => {
        if (!currentPlanData) return;

        const plans = JSON.parse(localStorage.getItem('study_plans') || '[]');
        const newPlan = {
            id: Date.now(),
            topic: state.topic,
            date: new Date().toLocaleDateString(),
            data: currentPlanData
        };

        plans.unshift(newPlan); // Add to top
        localStorage.setItem('study_plans', JSON.stringify(plans));

        // Visual Feedback
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = `<ion-icon name="checkmark-outline"></ion-icon> Saved`;
        setTimeout(() => {
            saveBtn.innerHTML = originalText;
        }, 2000);

        renderSavedPlans();
    });
}

function renderSavedPlans() {
    const list = document.getElementById('saved-list');
    if (!list) return;

    const plans = JSON.parse(localStorage.getItem('study_plans') || '[]');
    list.innerHTML = "";

    if (plans.length === 0) {
        list.innerHTML = "<p style='color:#666; font-size:0.9rem;'>No saved plans yet.</p>";
        return;
    }

    plans.forEach((p, index) => {
        const item = document.createElement('div');
        item.className = 'saved-item';
        item.innerHTML = `
            <div class="saved-info">
                <h5>${p.topic}</h5>
                <small>${p.date}</small>
            </div>
            <div class="saved-actions">
               <button class="btn-delete" data-idx="${index}">
                   <ion-icon name="trash-outline"></ion-icon>
               </button>
               <ion-icon name="chevron-forward-outline"></ion-icon>
            </div>
        `;

        // Open Plan on Item Click
        item.addEventListener('click', (e) => {
            // Prevent if clicking delete
            if (e.target.closest('.btn-delete')) return;

            state.topic = p.topic;
            currentPlanData = p.data;
            renderPlan(p.data);
            switchView('step-results');
        });

        // Delete Logic
        const delBtn = item.querySelector('.btn-delete');
        delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Delete plan "${p.topic}"?`)) {
                plans.splice(index, 1);
                localStorage.setItem('study_plans', JSON.stringify(plans));
                renderSavedPlans(); // Re-render
            }
        });

        list.appendChild(item);
    });
}

// Init Saved Plans
renderSavedPlans();


// --- SIDEBAR LOGIC ---
const sidebar = document.getElementById('details-sidebar');
const overlay = document.getElementById('sidebar-overlay');
const closeSidebarBtn = document.getElementById('btn-close-sidebar');

function openSidebar(item) {
    document.getElementById('sidebar-title').innerText = item.unit_title.split(':')[1] || item.unit_title; // Clean title
    document.getElementById('sidebar-duration').innerText = item.duration;
    document.getElementById('sidebar-intensity').innerText = item.intensity || "Normal";

    // Rich Breakdown Preference
    const descEl = document.getElementById('sidebar-desc');
    if (item.detailed_guide) {
        descEl.innerHTML = `<strong style="color:var(--primary-orange); display:block; margin-bottom:0.5rem;">Deep Dive:</strong> ${item.detailed_guide}`;
    } else {
        descEl.innerText = item.description;
    }

    const subList = document.getElementById('sidebar-sublist');
    subList.innerHTML = "";
    if (item.subtopics && Array.isArray(item.subtopics)) {
        item.subtopics.forEach(sub => {
            subList.innerHTML += `<li>${sub}</li>`;
        });
    }

    sidebar.classList.add('active');
    overlay.classList.add('active');
}

function closeSidebar() {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
}

if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
if (overlay) overlay.addEventListener('click', closeSidebar);

// Hook into the fetch success to capture data (Patching the global function if needed,
// but simpler to just set currentPlanData inside renderPlan)
const originalRender = renderPlan;
renderPlan = function (data) {
    currentPlanData = data;
    originalRender(data);
};
