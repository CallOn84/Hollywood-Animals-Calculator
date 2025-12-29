const MULTI_SELECT_CATEGORIES = ["Genre", "Supporting Character", "Theme & Event"];
let searchIndex = [];

window.onload = async function() {
    try {
        await loadExternalData();
        initializeSelectors();
        buildSearchIndex();
        setupSearchListener();
        setupScoreSync(); 
        console.log("Initialization Complete.");
    } catch (error) {
        console.error("Failed to load data:", error);
    }
};

function setupScoreSync() {
    const pairs = [
        { slider: 'comScoreSlider', input: 'comScoreInput' },
        { slider: 'artScoreSlider', input: 'artScoreInput' }
    ];

    pairs.forEach(pair => {
        const slider = document.getElementById(pair.slider);
        const input = document.getElementById(pair.input);

        slider.addEventListener('input', (e) => {
            input.value = e.target.value;
            updateSliderTrack(slider);
        });

        input.addEventListener('input', (e) => {
            let val = parseFloat(e.target.value);
            if (val > 10) val = 10;
            if (val < 0) val = 0;
            if (!isNaN(val)) {
                slider.value = val;
                updateSliderTrack(slider);
            }
        });
        updateSliderTrack(slider);
    });
}

function updateSliderTrack(slider) {
    const value = (slider.value - slider.min) / (slider.max - slider.min) * 100;
    const isArt = slider.classList.contains('art-slider');
    const color = isArt ? '#a0a0ff' : '#d4af37'; 
    slider.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${value}%, #444 ${value}%, #444 100%)`;
}

// Reuse this logic for percentage sliders
function updatePercentSliderTrack(slider) {
    const value = slider.value; // min is 0, max is 100
    const color = '#d4af37';
    slider.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${value}%, #444 ${value}%, #444 100%)`;
}

async function loadExternalData() {
    try {
        const [tagRes, weightRes] = await Promise.all([
            fetch('data/TagData.json'),
            fetch('data/TagsAudienceWeights.json')
        ]);

        if (!tagRes.ok || !weightRes.ok) return;

        const tagDataRaw = await tagRes.json();
        const weightDataRaw = await weightRes.json();

        for (const [tagId, data] of Object.entries(tagDataRaw)) {
            if (!weightDataRaw[tagId]) continue;

            let category = "Unknown";
            if (data.type === 0) category = "Genre";
            else if (data.type === 1) category = "Setting";
            else if (data.CategoryID) {
                switch (data.CategoryID) {
                    case "Protagonist": category = "Protagonist"; break;
                    case "Antagonist": category = "Antagonist"; break;
                    case "SupportingCharacter": category = "Supporting Character"; break;
                    case "Theme": category = "Theme & Event"; break;
                    case "Finale": category = "Finale"; break;
                    default: category = data.CategoryID;
                }
            } 
            if (tagId.startsWith("EVENTS_")) category = "Theme & Event";

            GAME_DATA.tags[tagId] = {
                id: tagId,
                name: beautifyTagName(tagId),
                category: category,
                art: parseFloat(data.artValue || 0),
                com: parseFloat(data.commercialValue || 0),
                weights: parseWeights(weightDataRaw[tagId].weights)
            };
        }
    } catch(e) {
        console.warn("External JSON load failed, relying on data.js default", e);
    }
}

function parseWeights(weightObj) {
    let clean = {};
    for (let key in weightObj) {
        clean[key] = parseFloat(weightObj[key]);
    }
    return clean;
}

function beautifyTagName(raw) {
    let name = raw;
    const prefixes = ["PROTAGONIST_", "ANTAGONIST_", "SUPPORTINGCHARACTER_", "THEME_", "EVENTS_", "FINALE_", "EVENT_"];
    prefixes.forEach(p => {
        if (name.startsWith(p)) name = name.substring(p.length);
    });
    
    return name.replace(/_/g, ' ')
               .toLowerCase()
               .split(' ')
               .map(word => word.charAt(0).toUpperCase() + word.slice(1))
               .join(' ');
}

function initializeSelectors() {
    const container = document.getElementById('selectors-container');
    container.innerHTML = ''; 

    GAME_DATA.categories.forEach(category => {
        const tagsInCategory = Object.values(GAME_DATA.tags).filter(t => 
            t.category === category
        ).sort((a, b) => a.name.localeCompare(b.name));

        if (tagsInCategory.length === 0) return;

        const groupDiv = document.createElement('div');
        groupDiv.className = 'category-group';
        groupDiv.id = `group-${category.replace(/\s/g, '-')}`;

        const header = document.createElement('div');
        header.className = 'category-header';
        
        const label = document.createElement('div');
        label.className = 'category-label';
        label.innerText = category;
        header.appendChild(label);

        if (MULTI_SELECT_CATEGORIES.includes(category)) {
            const addBtn = document.createElement('button');
            addBtn.className = 'add-btn';
            addBtn.innerHTML = '+';
            addBtn.onclick = () => addDropdown(category);
            header.appendChild(addBtn);
        }

        groupDiv.appendChild(header);

        const inputsContainer = document.createElement('div');
        inputsContainer.className = 'inputs-container';
        inputsContainer.id = `inputs-${category.replace(/\s/g, '-')}`;
        groupDiv.appendChild(inputsContainer);

        container.appendChild(groupDiv);

        addDropdown(category);
    });
}

function addDropdown(category, selectedId = null) {
    const containerId = `inputs-${category.replace(/\s/g, '-')}`;
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!MULTI_SELECT_CATEGORIES.includes(category) && container.children.length > 0) {
        const select = container.querySelector('select');
        if (selectedId) select.value = selectedId;
        return;
    }

    const tags = Object.values(GAME_DATA.tags).filter(t => t.category === category)
                 .sort((a, b) => a.name.localeCompare(b.name));

    const row = document.createElement('div');
    row.className = 'select-row';
    if (category === 'Genre') row.classList.add('genre-row'); // Tag for easy finding

    // SELECT DROPDOWN
    const select = document.createElement('select');
    select.className = 'tag-selector';
    select.dataset.category = category;

    const defOpt = document.createElement('option');
    defOpt.value = "";
    defOpt.innerText = selectedId ? "-- Select --" : `-- Select ${category} --`;
    select.appendChild(defOpt);

    tags.forEach(tag => {
        const opt = document.createElement('option');
        opt.value = tag.id;
        opt.innerText = tag.name;
        select.appendChild(opt);
    });

    if (selectedId) select.value = selectedId;
    row.appendChild(select);

    // GENRE SPECIFIC: PERCENTAGE CONTROLS
    if (category === 'Genre') {
        const percentWrapper = document.createElement('div');
        percentWrapper.className = 'genre-percent-wrapper hidden'; // Hidden by default (if only 1)
        
        const numInput = document.createElement('input');
        numInput.type = 'number';
        numInput.className = 'percent-input';
        numInput.min = 0;
        numInput.max = 100;
        numInput.value = 100;

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.className = 'styled-slider percent-slider';
        slider.min = 0;
        slider.max = 100;
        slider.value = 100;

        const label = document.createElement('span');
        label.innerText = '%';
        label.style.fontSize = '0.8rem';
        label.style.color = '#888';

        // Sync Logic
        numInput.addEventListener('input', (e) => {
            slider.value = e.target.value;
            updatePercentSliderTrack(slider);
        });
        slider.addEventListener('input', (e) => {
            numInput.value = e.target.value;
            updatePercentSliderTrack(slider);
        });

        updatePercentSliderTrack(slider);

        percentWrapper.appendChild(slider);
        percentWrapper.appendChild(numInput);
        percentWrapper.appendChild(label);
        row.appendChild(percentWrapper);
    }

    if (MULTI_SELECT_CATEGORIES.includes(category)) {
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '×';
        removeBtn.onclick = () => {
            row.remove();
            if (category === 'Genre') updateGenreControls();
        };
        row.appendChild(removeBtn);
    }

    container.appendChild(row);

    if (category === 'Genre') {
        updateGenreControls();
    }
}

// Logic to handle 1 genre vs multiple genres UI
function updateGenreControls() {
    const container = document.getElementById('inputs-Genre');
    if (!container) return;

    const rows = container.querySelectorAll('.genre-row');
    const count = rows.length;

    // Calculate even split
    const evenSplit = Math.floor(100 / count);

    rows.forEach(row => {
        const wrapper = row.querySelector('.genre-percent-wrapper');
        const input = row.querySelector('.percent-input');
        const slider = row.querySelector('.percent-slider');

        if (count > 1) {
            // Show controls
            wrapper.classList.remove('hidden');
            // If checking specifically on ADD action, we might want to auto-distribute. 
            // For simplicity, we auto-distribute if the value is currently 100 (meaning it was a single or new)
            // But to avoid overwriting user manual changes, we only set if it seems like a reset state or new item
            // A simple approach: Always auto-balance on add/remove for V1 UX.
            input.value = evenSplit;
            slider.value = evenSplit;
            updatePercentSliderTrack(slider);
        } else {
            // Hide controls (Implicitly 100%)
            wrapper.classList.add('hidden');
            input.value = 100; // Reset to 100 for calculation logic
        }
    });
}

function buildSearchIndex() {
    searchIndex = Object.values(GAME_DATA.tags).map(tag => {
        return {
            id: tag.id,
            name: tag.name,
            category: tag.category
        };
    });
}

function setupSearchListener() {
    const input = document.getElementById('globalSearch');
    const resultsBox = document.getElementById('searchResults');

    input.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        resultsBox.innerHTML = '';
        
        if (query.length < 2) {
            resultsBox.classList.add('hidden');
            return;
        }

        const matches = searchIndex.filter(item => 
            item.name.toLowerCase().includes(query) || 
            item.category.toLowerCase().includes(query)
        );

        if (matches.length > 0) {
            resultsBox.classList.remove('hidden');
            matches.forEach(match => {
                const div = document.createElement('div');
                div.className = 'search-item';
                div.innerHTML = `<strong>${match.name}</strong> <small>${match.category}</small>`;
                div.onclick = () => {
                    selectTagFromSearch(match);
                    input.value = '';
                    resultsBox.classList.add('hidden');
                };
                resultsBox.appendChild(div);
            });
        } else {
            resultsBox.classList.add('hidden');
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target !== input && e.target !== resultsBox) {
            resultsBox.classList.add('hidden');
        }
    });
}

function selectTagFromSearch(tagObj) {
    const category = tagObj.category;
    const containerId = `inputs-${category.replace(/\s/g, '-')}`;
    const container = document.getElementById(containerId);

    if (!container) return;

    const selects = container.querySelectorAll('select.tag-selector');
    let filled = false;

    // Try to fill empty slot first
    for (let select of selects) {
        if (select.value === "") {
            select.value = tagObj.id;
            filled = true;
            break;
        }
    }

    if (!filled) {
        if (MULTI_SELECT_CATEGORIES.includes(category)) {
            addDropdown(category, tagObj.id);
        } else {
            // Single select category, replace value
            if (selects.length > 0) selects[0].value = tagObj.id;
        }
    }
    
    const group = document.getElementById(`group-${category.replace(/\s/g, '-')}`);
    if (group) {
        group.style.borderColor = '#d4af37';
        setTimeout(() => group.style.borderColor = '', 500);
        group.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function analyzeMovie() {
    // --- COLLECT SELECTED TAGS AND PERCENTAGES ---
    const tagInputs = []; // Objects: { id: string, percent: number (0-1), category: string }

    // Genre Processing
    const genreRows = document.querySelectorAll('#inputs-Genre .genre-row');
    
    // Calculate Total Percentage Input by user for Normalization
    let totalGenreInput = 0;
    const genreData = [];

    genreRows.forEach(row => {
        const select = row.querySelector('select');
        const input = row.querySelector('.percent-input');
        
        if (select.value) {
            let val = parseFloat(input.value);
            if (isNaN(val) || val < 0) val = 0;
            totalGenreInput += val;
            
            genreData.push({
                id: select.value,
                inputVal: val
            });
        }
    });

    // Avoid division by zero
    if (totalGenreInput === 0 && genreData.length > 0) totalGenreInput = 1;

    genreData.forEach(g => {
        tagInputs.push({
            id: g.id,
            percent: g.inputVal / totalGenreInput, // Normalized (e.g., 50/100 = 0.5)
            category: "Genre"
        });
    });

    // Other Categories Processing
    document.querySelectorAll('.tag-selector').forEach(sel => {
        if (sel.dataset.category === "Genre") return; // Already handled
        if (sel.value) {
            tagInputs.push({
                id: sel.value,
                percent: 1.0, // Non-genres are additive (100% impact)
                category: sel.dataset.category
            });
        }
    });

    if(tagInputs.length === 0) {
        alert("Please select at least one tag.");
        return;
    }

    // --- READ USER INPUTS ---
    const inputCom = parseFloat(document.getElementById('comScoreInput').value) || 0;
    const inputArt = parseFloat(document.getElementById('artScoreInput').value) || 0;

    // --- CALCULATE DEMOGRAPHIC WEIGHTS ---
    let scores = { "YM": 0, "YF": 0, "TM": 0, "TF": 0, "AM": 0, "AF": 0 };

    tagInputs.forEach(item => {
        const tagData = GAME_DATA.tags[item.id];
        if(!tagData) return;

        // Apply weights based on category logic (Genre = Fractional, Others = Additive)
        // Note: item.percent is already calculated correctly above based on category
        const multiplier = item.percent;

        for(let demo in scores) {
            if(tagData.weights[demo]) {
                scores[demo] += (tagData.weights[demo] * multiplier);
            }
        }
    });

    // Determine Winner based on Population Weight * Tag Score
    let weightedScores = {};
    for(let demo in scores) {
        weightedScores[demo] = scores[demo] * GAME_DATA.demographics[demo].weight;
    }
    let winner = Object.keys(weightedScores).reduce((a, b) => weightedScores[a] > weightedScores[b] ? a : b);
    let winnerName = GAME_DATA.demographics[winner].name;
    
    // --- DETERMINE MOVIE LEAN ---
    let movieLean = 0; 
    let leanText = "Balanced";
    
    if (inputArt > inputCom + 0.1) {
        movieLean = 1;
        leanText = "Artistic";
    } else if (inputCom > inputArt + 0.1) {
        movieLean = 2;
        leanText = "Commercial";
    }

    // --- FILTER AGENTS ---
    let validAgents = GAME_DATA.adAgents.filter(agent => {
        if (!agent.targets.includes(winner)) return false;
        return agent.type === 0 || agent.type === movieLean;
    });

    // Sort by Level (Efficiency) Descending
    validAgents.sort((a, b) => b.level - a.level);

    // --- RENDER RESULTS ---
    document.getElementById('results').classList.remove('hidden');
    
    // 1. Target Audience Display
    document.getElementById('targetAudienceDisplay').innerHTML = `
        <span style="color: #ffd700;">${winnerName}</span>
        <span style="font-size: 0.5em; color: #888; vertical-align: middle;">(${winner})</span>
    `;

    // 2. Advertisers Display
    let agentHtml = "";
    if (validAgents.length === 0) {
        agentHtml = `<div style="color:red; padding:10px; font-size: 0.9em;">No effective advertisers match this demographic and movie type.</div>`;
    } else {
        agentHtml = validAgents.map(a => {
            let typeLabel = a.type === 0 ? "Univ." : (a.type === 1 ? "Art" : "Com");
            return `
            <div style="padding: 8px 0; border-bottom: 1px solid #333; display:flex; justify-content:space-between; align-items:center;">
                <span>${a.name}</span>
                <span style="font-size:0.8em; color:#888;">[${typeLabel}]</span>
            </div>`;
        }).join('');
    }
    document.getElementById('adAgentDisplay').innerHTML = agentHtml;
    
    // 3. Movie Lean
    document.getElementById('movieLeanDisplay').innerHTML = `
        <span style="color: ${movieLean === 1 ? '#a0a0ff' : (movieLean === 2 ? '#d4af37' : '#fff')}">${leanText}</span>
    `;

    // 4. Preferred Holiday
    let bestHoliday = GAME_DATA.holidays.find(h => {
        if(Array.isArray(h.target)) return h.target.includes(winner);
        return h.target === winner || h.target === "ALL";
    });
    
    if(!bestHoliday) bestHoliday = { name: "None", bonus: "0%" };

    let bonusText = "";
    if (bestHoliday.name === "None") {
        bonusText = "No specific holiday synergy.";
    } else {
        bonusText = `${bestHoliday.bonus} Bonus Towards ${winnerName} (${winner})`;
    }

    document.getElementById('holidayDisplay').innerHTML = `
        <div style="color: #fff;">${bestHoliday.name}</div>
        <div class="holiday-bonus">${bonusText}</div>
    `;

    // 5. Campaign Strategy
    let preDuration = 6;
    let releaseDuration = 4;
    let postDuration = 0;
    let totalWeeks = 10;
    
    if (inputCom >= 9.0) {
        postDuration = 4;
        totalWeeks = 14;
    }

    document.getElementById('campaignStrategyDisplay').innerHTML = `
        <div class="strategy-row">
            <div class="campaign-block pre">
                <span class="camp-title">Pre-Release</span>
                <div class="camp-value">${preDuration}<span class="camp-unit">wks</span></div>
            </div>
            
            <div class="campaign-block release">
                <span class="camp-title">Release</span>
                <div class="camp-value">${releaseDuration}<span class="camp-unit">wks</span></div>
            </div>

            <div class="campaign-block post" style="opacity: ${postDuration > 0 ? 1 : 0.3}">
                <span class="camp-title">Post-Release</span>
                <div class="camp-value">${postDuration}<span class="camp-unit">wks</span></div>
            </div>
        </div>

        <div style="text-align:center; font-size:0.85rem; color:#888; border-top:1px solid #333; padding-top:8px;">
            Total Duration: <strong style="color:#fff;">${totalWeeks} Weeks</strong>
        </div>
    `;
    
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}