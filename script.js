const MULTI_SELECT_CATEGORIES = ["Genre", "Supporting Character", "Theme & Event"];
let searchIndex = [];
let currentTab = 'synergy'; 

// --- LOCALIZATION VARIABLES ---
let localizationMap = {}; 
let currentLanguage = 'English';

// --- GENERATOR STATE ---
let generatedScripts = [];
let savedScripts = [];
let savedScriptIdCounter = 0;

window.onload = async function() {
    try {
        await changeLanguage('English', false); 
        await loadExternalData();
        
        initializeSelectors('advertisers');
        initializeSelectors('synergy');
        initializeSelectors('generator');
        
        buildSearchIndex();
        setupSearchListeners();
        setupScoreSync(); 
        setupGeneratorSync(); // New listener for generator slider
        
        console.log("Initialization Complete.");
    } catch (error) {
        console.error("Failed to load data:", error);
    }
};

async function changeLanguage(langName, shouldRender = true) {
    currentLanguage = langName;
    const fileName = `localization/${langName}.json`;
    try {
        const res = await fetch(fileName);
        if (!res.ok) throw new Error(`Could not load ${fileName}`);
        const locData = await res.json();
        localizationMap = {};
        if (locData.IdMap && locData.locStrings) {
            for (const [tagId, index] of Object.entries(locData.IdMap)) {
                if (locData.locStrings[index]) {
                    localizationMap[tagId] = locData.locStrings[index];
                }
            }
        }
        if (Object.keys(GAME_DATA.tags).length > 0) {
            updateAllTagNames();
            buildSearchIndex(); 
            if (shouldRender) {
                const savedSynergy = collectTagInputs('synergy');
                const savedAdvertisers = collectTagInputs('advertisers');
                const savedGenerator = collectTagInputs('generator');
                
                initializeSelectors('synergy');
                initializeSelectors('advertisers');
                initializeSelectors('generator');
                
                restoreSelection('synergy', savedSynergy);
                restoreSelection('advertisers', savedAdvertisers);
                restoreSelection('generator', savedGenerator);
                
                // Re-render generated lists with new names
                renderGeneratedScripts();
                renderSavedScripts();
            }
        }
    } catch (e) {
        console.error("Localization Error:", e);
    }
}

function updateAllTagNames() {
    for (const tagId in GAME_DATA.tags) {
        GAME_DATA.tags[tagId].name = beautifyTagName(tagId);
    }
}

function restoreSelection(context, savedInputs) {
    if(!savedInputs || savedInputs.length === 0) return;
    savedInputs.forEach(input => {
        const category = input.category;
        const containerId = `inputs-${category.replace(/\s/g, '-')}-${context}`;
        const container = document.getElementById(containerId);
        if(!container) return;
        
        // Find empty slot
        const selects = container.querySelectorAll('select');
        let placed = false;
        for(let sel of selects) {
            if(sel.value === "") {
                sel.value = input.id;
                placed = true;
                break;
            }
        }
        // If no empty slot, add one
        if(!placed && MULTI_SELECT_CATEGORIES.includes(category)) {
            addDropdown(category, input.id, context);
            placed = true;
        }
    });
    
    if(context !== 'generator' && savedInputs.some(i => i.category === 'Genre')) {
        updateGenreControls(context);
        const genreRows = document.querySelectorAll(`#inputs-Genre-${context} .genre-row`);
        const genres = savedInputs.filter(i => i.category === 'Genre');
        genreRows.forEach((row, idx) => {
            if(genres[idx]) {
                const val = Math.round(genres[idx].percent * 100);
                row.querySelector('.percent-input').value = val;
                row.querySelector('.percent-slider').value = val;
                updatePercentSliderTrack(row.querySelector('.percent-slider'));
            }
        });
    }
}

function switchTab(tabName) {
    currentTab = tabName;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const btns = document.querySelectorAll('.tab-btn');
    
    if(tabName === 'synergy') btns[0].classList.add('active');
    else if(tabName === 'generator') btns[1].classList.add('active');
    else btns[2].classList.add('active');
    
    document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
}

function setupScoreSync() {
    const pairs = [
        { slider: 'comScoreSlider', input: 'comScoreInput' },
        { slider: 'artScoreSlider', input: 'artScoreInput' }
    ];
    pairs.forEach(pair => {
        const slider = document.getElementById(pair.slider);
        const input = document.getElementById(pair.input);
        if(!slider || !input) return;
        
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

function setupGeneratorSync() {
    const slider = document.getElementById('genTargetScore');
    const display = document.getElementById('genTargetDisplay');
    if(slider) {
        slider.addEventListener('input', (e) => {
            display.innerText = parseFloat(e.target.value).toFixed(1);
            updateSliderTrack(slider);
        });
        updateSliderTrack(slider);
    }
}

function updateSliderTrack(slider) {
    const value = (slider.value - slider.min) / (slider.max - slider.min) * 100;
    const isArt = slider.classList.contains('art-slider');
    const color = isArt ? '#a0a0ff' : '#d4af37'; 
    slider.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${value}%, #444 ${value}%, #444 100%)`;
}

function updatePercentSliderTrack(slider) {
    const value = slider.value;
    const color = '#d4af37';
    slider.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${value}%, #444 ${value}%, #444 100%)`;
}

async function loadExternalData() {
    try {
        const [tagRes, weightRes, compRes, genreRes] = await Promise.all([
            fetch('data/TagData.json'),
            fetch('data/TagsAudienceWeights.json'),
            fetch('data/TagCompatibilityData.json'),
            fetch('data/GenrePairs.json')
        ]);
        if (!tagRes.ok || !weightRes.ok) return;
        const tagDataRaw = await tagRes.json();
        const weightDataRaw = await weightRes.json();
        if (compRes.ok) GAME_DATA.compatibility = await compRes.json();
        if (genreRes.ok) GAME_DATA.genrePairs = await genreRes.json();
        
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

function beautifyTagName(rawId) {
    if (localizationMap[rawId]) {
        return localizationMap[rawId];
    }
    let name = rawId;
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

function initializeSelectors(context) {
    const container = document.getElementById(`selectors-container-${context}`);
    container.innerHTML = ''; 
    GAME_DATA.categories.forEach(category => {
        const tagsInCategory = Object.values(GAME_DATA.tags).filter(t => 
            t.category === category
        ).sort((a, b) => a.name.localeCompare(b.name));
        
        if (tagsInCategory.length === 0) return;
        
        const groupDiv = document.createElement('div');
        groupDiv.className = 'category-group';
        groupDiv.id = `group-${category.replace(/\s/g, '-')}-${context}`;
        
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
            addBtn.onclick = () => addDropdown(category, null, context);
            header.appendChild(addBtn);
        }
        groupDiv.appendChild(header);
        
        const inputsContainer = document.createElement('div');
        inputsContainer.className = 'inputs-container';
        inputsContainer.id = `inputs-${category.replace(/\s/g, '-')}-${context}`;
        groupDiv.appendChild(inputsContainer);
        container.appendChild(groupDiv);
        
        // Initial drop down
        addDropdown(category, null, context);
    });
}

function addDropdown(category, selectedId = null, context = currentTab) {
    const containerId = `inputs-${category.replace(/\s/g, '-')}-${context}`;
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // For single-selects in non-generator tabs, avoid duplicates if one exists
    if (!MULTI_SELECT_CATEGORIES.includes(category) && container.children.length > 0) {
        const select = container.querySelector('select');
        if (selectedId) select.value = selectedId;
        return;
    }

    const tags = Object.values(GAME_DATA.tags).filter(t => t.category === category)
                 .sort((a, b) => a.name.localeCompare(b.name));
    
    const row = document.createElement('div');
    row.className = 'select-row';
    if (category === 'Genre' && context !== 'generator') row.classList.add('genre-row'); 
    
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

    // Percentage logic only for manual builders (Synergy/Advertisers)
    if (category === 'Genre' && context !== 'generator') {
        const percentWrapper = document.createElement('div');
        percentWrapper.className = 'genre-percent-wrapper hidden'; 
        
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
            if (category === 'Genre' && context !== 'generator') updateGenreControls(context);
        };
        row.appendChild(removeBtn);
    }
    
    container.appendChild(row);
    if (category === 'Genre' && context !== 'generator') {
        updateGenreControls(context);
    }
}

function updateGenreControls(context) {
    const container = document.getElementById(`inputs-Genre-${context}`);
    if (!container) return;
    const rows = container.querySelectorAll('.genre-row');
    const count = rows.length;
    const evenSplit = Math.floor(100 / count);
    
    rows.forEach(row => {
        const wrapper = row.querySelector('.genre-percent-wrapper');
        const input = row.querySelector('.percent-input');
        const slider = row.querySelector('.percent-slider');
        
        if (count > 1) {
            wrapper.classList.remove('hidden');
            if (input.value == 100 && count > 1) {
                input.value = evenSplit;
                slider.value = evenSplit;
            }
            updatePercentSliderTrack(slider);
        } else {
            wrapper.classList.add('hidden');
            input.value = 100; 
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

function setupSearchListeners() {
    setupSingleSearch('globalSearchAdvertisers', 'searchResultsAdvertisers', 'advertisers');
    setupSingleSearch('globalSearchSynergy', 'searchResultsSynergy', 'synergy');
}

function setupSingleSearch(inputId, resultId, context) {
    const input = document.getElementById(inputId);
    const resultsBox = document.getElementById(resultId);
    
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
                    selectTagFromSearch(match, context);
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

function selectTagFromSearch(tagObj, context) {
    const category = tagObj.category;
    const containerId = `inputs-${category.replace(/\s/g, '-')}-${context}`;
    const container = document.getElementById(containerId);
    if (!container) return;

    // Check existing
    const selects = container.querySelectorAll('select.tag-selector');
    let filled = false;
    for (let select of selects) {
        if (select.value === "") {
            select.value = tagObj.id;
            filled = true;
            break;
        }
    }
    
    // Add new if full
    if (!filled) {
        if (MULTI_SELECT_CATEGORIES.includes(category)) {
            addDropdown(category, tagObj.id, context);
        } else {
            if (selects.length > 0) selects[0].value = tagObj.id;
        }
    }

    const group = document.getElementById(`group-${category.replace(/\s/g, '-')}-${context}`);
    if (group) {
        group.style.borderColor = '#d4af37';
        setTimeout(() => group.style.borderColor = '', 500);
        group.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function collectTagInputs(context) {
    const tagInputs = []; 
    
    if (context === 'generator') {
        // Generator doesn't use percentages, just IDs
        const container = document.getElementById(`selectors-container-${context}`);
        container.querySelectorAll('.tag-selector').forEach(sel => {
            if (sel.value) {
                tagInputs.push({
                    id: sel.value,
                    percent: 1.0, 
                    category: sel.dataset.category
                });
            }
        });
        return tagInputs;
    }

    // Normal logic with percentages for Synergy/Advertisers
    const genreContainer = document.getElementById(`inputs-Genre-${context}`);
    const genreRows = genreContainer ? genreContainer.querySelectorAll('.genre-row') : [];
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
    
    if (totalGenreInput === 0 && genreData.length > 0) totalGenreInput = 1;
    
    genreData.forEach(g => {
        tagInputs.push({
            id: g.id,
            percent: g.inputVal / totalGenreInput,
            category: "Genre"
        });
    });

    const container = document.getElementById(`selectors-container-${context}`);
    container.querySelectorAll('.tag-selector').forEach(sel => {
        if (sel.dataset.category === "Genre") return; 
        if (sel.value) {
            tagInputs.push({
                id: sel.value,
                percent: 1.0, 
                category: sel.dataset.category
            });
        }
    });

    return tagInputs;
}

// ---------------------------------------------
// ADVERTISER / ANALYSIS LOGIC
// ---------------------------------------------
function analyzeMovie(scriptOverride = null) {
    // scriptOverride is used when transferring from Generator
    let tagInputs;
    
    if(scriptOverride) {
        tagInputs = scriptOverride;
    } else {
        tagInputs = collectTagInputs('advertisers');
    }

    if(tagInputs.length === 0) {
        alert("Please select at least one tag.");
        return;
    }

    const inputCom = parseFloat(document.getElementById('comScoreInput').value) || 0;
    const inputArt = parseFloat(document.getElementById('artScoreInput').value) || 0;

    let tagAffinity = { "YM": 0, "YF": 0, "TM": 0, "TF": 0, "AM": 0, "AF": 0 };
    tagInputs.forEach(item => {
        const tagData = GAME_DATA.tags[item.id];
        if(!tagData) return;
        const multiplier = item.percent;
        for(let demo in tagAffinity) {
            if(tagData.weights[demo]) {
                tagAffinity[demo] += (tagData.weights[demo] * multiplier);
            }
        }
    });

    let minVal = Number.MAX_VALUE;
    for (let demo in tagAffinity) {
        if (tagAffinity[demo] < minVal) minVal = tagAffinity[demo];
    }
    if (minVal < 1.0) {
        const liftAmount = 1.0 - minVal;
        for (let demo in tagAffinity) {
            tagAffinity[demo] += liftAmount;
        }
    }

    let totalSum = 0;
    for (let demo in tagAffinity) totalSum += tagAffinity[demo];
    const RELEASE_MAGIC_NUMBER = 3.0;
    let baselineScores = {};
    for(let demo in tagAffinity) {
        if (totalSum === 0) {
            baselineScores[demo] = 0; 
        } else {
            let normalized = (tagAffinity[demo] / totalSum) * RELEASE_MAGIC_NUMBER;
            baselineScores[demo] = Math.min(1.0, Math.max(0, normalized));
        }
    }

    const normalizedArt = inputArt / 10.0;
    const normalizedCom = inputCom / 10.0;
    let demoGrades = [];
    
    for(let demo in GAME_DATA.demographics) {
        const d = GAME_DATA.demographics[demo];
        const dropRate = baselineScores[demo]; 

        const skew = normalizedArt - normalizedCom;
        let satArt, satBase, satCom;
        if (skew > 0) { 
            satArt = 1.0;
            satBase = 1.0 - skew;
            satCom = 1.0 - skew;
        } else {
            satCom = 1.0;
            satBase = 1.0 - Math.abs(skew);
            satArt = 1.0 - Math.abs(skew);
        }

        const totalW = d.baseW + d.artW + d.comW;
        const satisfaction = ( (satBase * d.baseW) + (satArt * d.artW) + (satCom * d.comW) ) / totalW;
        const qw = GAME_DATA.constants.KINOMARK.scoreWeights;
        const quality = (dropRate * qw[0]) + (normalizedCom * qw[1]) + (normalizedArt * qw[2]);
        const aw = GAME_DATA.constants.KINOMARK.audienceWeight;
        let finalScore = (satisfaction * aw) + (quality * (1 - aw));
        
        if (dropRate <= 0.1) finalScore = 0;

        demoGrades.push({
            id: demo,
            name: d.name,
            score: dropRate, 
            utility: finalScore 
        });
    }

    const THRESHOLD_GOOD = 0.67;
    const THRESHOLD_BAD = 0.33; 

    const targetAudiences = demoGrades.filter(d => d.score > THRESHOLD_BAD);
    const highInterestIds = demoGrades.filter(d => d.score >= THRESHOLD_GOOD).map(d => d.id);
    const moderateInterestIds = demoGrades.filter(d => d.score > THRESHOLD_BAD && d.score < THRESHOLD_GOOD).map(d => d.id);

    document.getElementById('results-advertisers').classList.remove('hidden');
    const audienceContainer = document.getElementById('targetAudienceDisplay');
    audienceContainer.innerHTML = '';
    
    if (targetAudiences.length > 0) {
        targetAudiences.sort((a, b) => b.score - a.score);
        targetAudiences.forEach(d => {
            const chip = document.createElement('div');
            let tierClass = "pill-moderate";
            if(d.score >= THRESHOLD_GOOD) {
                tierClass = "pill-best";
            }
            chip.className = `audience-pill ${tierClass}`;
            chip.innerHTML = `${d.name}`;
            audienceContainer.appendChild(chip);
        });
    } else {
        audienceContainer.innerHTML = `
            <div style="color: #666; font-style: italic; font-size: 0.95rem;">
                No audience fits the criteria.
            </div>
        `;
    }

    const validTargetIds = targetAudiences.map(t => t.id);
    let movieLean = 0; 
    let leanText = "Balanced";
    if (inputArt > inputCom + 0.1) { movieLean = 1; leanText = "Artistic"; } 
    else if (inputCom > inputArt + 0.1) { movieLean = 2; leanText = "Commercial"; }

    let validAgents = [];
    if (validTargetIds.length > 0) {
        validAgents = GAME_DATA.adAgents.filter(agent => {
            return agent.targets.some(t => validTargetIds.includes(t));
        }).map(agent => {
            let score = 0;
            validTargetIds.forEach(targetId => {
                if (agent.targets.includes(targetId)) {
                    score += 5; 
                }
            });
            if(agent.type !== 0 && agent.type !== movieLean) score -= 10;
            score += agent.level;
            return { ...agent, score };
        });
        validAgents = validAgents.filter(a => a.score > 0);
        validAgents.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            if (b.level !== a.level) return b.level - a.level;
            return a.name.localeCompare(b.name);
        });
    }

    const agentContainer = document.getElementById('adAgentDisplay');
    const leanDisplay = document.getElementById('movieLeanDisplay');
    leanDisplay.innerHTML = `<span style="color: ${movieLean === 1 ? '#a0a0ff' : (movieLean === 2 ? '#d4af37' : '#fff')}">${leanText}</span>`;

    if (validTargetIds.length === 0) {
        agentContainer.innerHTML = `<div style="color:#666; font-style:italic; padding:10px 0;">Identify a target audience first.</div>`;
    } else if (validAgents.length === 0) {
        agentContainer.innerHTML = `<div style="color:#d4af37; padding:10px 0;">No specific advertisers found.</div>`;
    } else {
        const agentHtml = validAgents.slice(0, 4).map(a => {
            let typeLabel = a.type === 0 ? "Univ." : (a.type === 1 ? "Art" : "Com");
            return `
            <div class="advertiser-row">
                <span class="advertiser-name">${a.name}</span>
                <span class="advertiser-type">${typeLabel}</span>
            </div>`;
        }).join('');
        agentContainer.innerHTML = agentHtml;
    }

    // Holiday Logic
    const holidayContainer = document.getElementById('holidayDisplay');
    holidayContainer.innerHTML = '';

    if (validTargetIds.length === 0) {
        holidayContainer.innerHTML = `<div style="color:#666; font-style:italic;">Identify target audience first.</div>`;
    } else {
        let primaryTargets = highInterestIds;
        if (primaryTargets.length === 0) {
            primaryTargets = moderateInterestIds;
        }

        const rankedHolidays = GAME_DATA.holidays.map(h => {
            let totalScore = 0;
            let parts = [];

            primaryTargets.forEach(id => {
                const bonus = h.bonuses[id] || 0;
                if (bonus > 0) {
                    totalScore += bonus;
                    parts.push({
                        val: bonus,
                        text: `${bonus}% Bonus Towards ${GAME_DATA.demographics[id].name}`
                    });
                }
            });

            parts.sort((a, b) => b.val - a.val);
            const contextText = parts.length > 0 ? parts.map(p => p.text).join(', ') : "No significant bonus.";

            return {
                name: h.name,
                totalScore: totalScore,
                contextText: contextText
            };
        });

        const viableHolidays = rankedHolidays.filter(h => h.totalScore > 0).sort((a, b) => b.totalScore - a.totalScore);

        if (viableHolidays.length === 0) {
            holidayContainer.innerHTML = `<div class="holiday-row-empty"><span>No beneficial holidays found for your primary audience.</span></div>`;
        } else {
            const best = viableHolidays[0];
            const bestHeader = document.createElement('div');
            bestHeader.className = 'holiday-section-label';
            bestHeader.innerText = "Best Option";
            holidayContainer.appendChild(bestHeader);

            const bestRow = document.createElement('div');
            bestRow.className = 'holiday-row best';
            bestRow.innerHTML = `
                <div class="hol-left">
                    <span class="hol-name">${best.name}</span>
                    <span class="hol-target">${best.contextText}</span>
                </div>
            `;
            holidayContainer.appendChild(bestRow);

            const alternatives = viableHolidays.slice(1, 4);
            if(alternatives.length > 0) {
                const altHeader = document.createElement('div');
                altHeader.className = 'holiday-section-label';
                altHeader.innerText = "Alternatives";
                altHeader.style.marginTop = "20px";
                holidayContainer.appendChild(altHeader);

                alternatives.forEach(alt => {
                    const row = document.createElement('div');
                    row.className = 'holiday-row';
                    row.innerHTML = `
                        <div class="hol-left">
                            <span class="hol-name">${alt.name}</span>
                            <span class="hol-target">${alt.contextText}</span>
                        </div>
                    `;
                    holidayContainer.appendChild(row);
                });
            }
        }
    }

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
                <span class="camp-value">${preDuration} wks</span>
            </div>
            
            <div class="campaign-block release">
                <span class="camp-title">Release</span>
                <span class="camp-value">${releaseDuration} wks</span>
            </div>

            <div class="campaign-block post" style="opacity: ${postDuration > 0 ? 1 : 0.3}">
                <span class="camp-title">Post-Release</span>
                <span class="camp-value">${postDuration} wks</span>
            </div>
        </div>

        <div class="total-duration-footer">
            Total Duration: <strong style="color:#fff;">${totalWeeks} Weeks</strong>
        </div>
    `;
    
    if(!scriptOverride) {
        document.getElementById('results-advertisers').scrollIntoView({ behavior: 'smooth' });
    }
}

// ---------------------------------------------
// SYNERGY CALCULATOR LOGIC
// ---------------------------------------------
function calculateSynergy() {
    const selectedTags = collectTagInputs('synergy');
    if (selectedTags.length === 0) {
        alert("Please select at least one tag.");
        return;
    }
    const matrixResult = calculateMatrixScore(selectedTags);
    const bonuses = calculateTotalBonuses(selectedTags);
    renderSynergyResults(matrixResult, bonuses);
}

function calculateMatrixScore(tags) {
    let totalScore = 0;
    let spoilers = [];
    let rawSum = 0;
    let pairCount = 0;
    
    for (let i = 0; i < tags.length; i++) {
        for (let j = i + 1; j < tags.length; j++) {
            let tA = tags[i];
            let tB = tags[j];
            let rawVal = 3.0;
            if (GAME_DATA.compatibility[tA.id] && GAME_DATA.compatibility[tA.id][tB.id]) {
                rawVal = parseFloat(GAME_DATA.compatibility[tA.id][tB.id]);
            } else if (GAME_DATA.compatibility[tB.id] && GAME_DATA.compatibility[tB.id][tA.id]) {
                rawVal = parseFloat(GAME_DATA.compatibility[tB.id][tA.id]);
            }
            rawSum += rawVal;
            pairCount++;
        }
    }
    let rawAverage = pairCount > 0 ? (rawSum / pairCount) : 3.0; 
    
    tags.forEach(tagA => {
        let rowSum = 0;
        let rowWeight = 0;
        let worstVal = 6.0; 
        let worstPartner = "";
        
        tags.forEach(tagB => {
            if (tagA.id === tagB.id) return;
            let rawVal = 3.0;
            if (GAME_DATA.compatibility[tagA.id] && GAME_DATA.compatibility[tagA.id][tagB.id]) {
                rawVal = parseFloat(GAME_DATA.compatibility[tagA.id][tagB.id]);
            } else if (GAME_DATA.compatibility[tagB.id] && GAME_DATA.compatibility[tagB.id][tagA.id]) {
                rawVal = parseFloat(GAME_DATA.compatibility[tagB.id][tagA.id]);
            }
            
            let score = (rawVal - 3.0) / 2.0;
            let weight = 1.0;
            
            if (score < 0) {
                if (tagB.category === "Genre") {
                    score *= 20.0 * tagB.percent;
                    weight = 20.0 * tagB.percent;
                } else if (tagB.category === "Setting") {
                    score *= 5.0;
                    weight = 5.0;
                } else {
                    score *= 3.0;
                    weight = 3.0;
                }
            } else {
                if (tagB.category === "Genre") {
                    score *= tagB.percent;
                    weight = tagB.percent;
                }
            }
            rowSum += score;
            rowWeight += weight;
            if (rawVal < worstVal) {
                worstVal = rawVal;
                worstPartner = tagB.id;
            }
        });
        
        let rowAverage = 0;
        if (rowWeight > 0) rowAverage = rowSum / rowWeight;
        let transformedWorst = (worstVal - 3.0) / 2.0;
        let finalRowScore = rowAverage;
        
        if (worstVal <= 1.0) {
            let partnerName = worstPartner && GAME_DATA.tags[worstPartner] ? GAME_DATA.tags[worstPartner].name : "another selected tag";
            spoilers.push(`${GAME_DATA.tags[tagA.id].name} conflicts with ${partnerName}`);
            finalRowScore = -1.0; 
        } else if (transformedWorst < rowAverage) {
             finalRowScore = transformedWorst;
        }
        totalScore += finalRowScore * tagA.percent;
    });
    
    if (totalScore >= 0) totalScore *= 0.9;
    else totalScore *= 1.25;
    
    return { totalScore, spoilers, rawAverage };
}

function calculateTotalBonuses(tags) {
    let totalArt = 0;
    let totalCom = 0;
    const genrePair = calculateGenrePairScore(tags);
    if (genrePair) {
        totalArt += genrePair.art;
        totalCom += genrePair.com;
    } else {
        const genres = tags.filter(t => t.category === "Genre").sort((a, b) => b.percent - a.percent);
        if (genres.length > 0) {
            const topGenre = GAME_DATA.tags[genres[0].id];
            if (topGenre) {
                totalArt += topGenre.art;
                totalCom += topGenre.com;
            }
        }
    }
    tags.forEach(tag => {
        if (tag.category !== "Genre") {
            const data = GAME_DATA.tags[tag.id];
            if (data) {
                totalArt += data.art;
                totalCom += data.com;
            }
        }
    });
    return { art: totalArt, com: totalCom };
}

function calculateGenrePairScore(tags) {
    const genres = tags.filter(t => t.category === "Genre").sort((a, b) => b.percent - a.percent);
    if (genres.length < 2) return null;
    const g1 = genres[0];
    const g2 = genres[1];
    if ((g1.percent + g2.percent < 0.7) || (g2.percent < 0.35)) {
        return null;
    }
    let pairData = null;
    if (GAME_DATA.genrePairs[g1.id] && GAME_DATA.genrePairs[g1.id][g2.id]) {
        pairData = GAME_DATA.genrePairs[g1.id][g2.id];
    } else if (GAME_DATA.genrePairs[g2.id] && GAME_DATA.genrePairs[g2.id][g1.id]) {
        pairData = GAME_DATA.genrePairs[g2.id][g1.id];
    }
    if (!pairData) return null;
    return {
        com: parseFloat(pairData.Item1),
        art: parseFloat(pairData.Item2),
        names: `${GAME_DATA.tags[g1.id].name} + ${GAME_DATA.tags[g2.id].name}`
    };
}

function formatScore(num) {
    if (Math.abs(num) < 0.005) return "0";
    return (num > 0 ? "+" : "") + num.toFixed(2);
}

function formatSimpleScore(num) {
    if (Math.abs(num) < 0.005) return "0";
    return (num > 0 ? "+" : "") + parseFloat(num.toFixed(2));
}

function renderSynergyResults(matrix, bonuses) {
    document.getElementById('results-synergy').classList.remove('hidden');
    const avgEl = document.getElementById('synergyAverageDisplay');
    avgEl.innerHTML = `${matrix.rawAverage.toFixed(1)} <span class="sub-value">/ 5.0</span>`;
    
    if (matrix.rawAverage >= 3.5) avgEl.style.color = 'var(--success)';
    else if (matrix.rawAverage < 2.5) avgEl.style.color = 'var(--danger)';
    else avgEl.style.color = '#fff';

    const baseScoreEl = document.getElementById('synergyTotalDisplay');
    baseScoreEl.innerText = formatScore(matrix.totalScore);
    baseScoreEl.style.color = matrix.totalScore >= 0 ? 'var(--success)' : 'var(--danger)';

    const breakdownBase = document.getElementById('breakdownBaseScore');
    breakdownBase.innerText = formatScore(matrix.totalScore);
    breakdownBase.style.color = matrix.totalScore >= 0 ? 'var(--success)' : 'var(--danger)';

    const breakdownCom = document.getElementById('breakdownComBonus');
    const breakdownArt = document.getElementById('breakdownArtBonus');
    breakdownCom.innerText = formatSimpleScore(bonuses.com);
    breakdownCom.style.color = bonuses.com > 0 ? 'var(--success)' : (bonuses.com < 0 ? 'var(--danger)' : '#fff');
    breakdownArt.innerText = formatSimpleScore(bonuses.art);
    breakdownArt.style.color = bonuses.art > 0 ? '#a0a0ff' : (bonuses.art < 0 ? 'var(--danger)' : '#fff');

    const MAX_GAME_SCORE = 9.9; 
    const totalComRaw = matrix.totalScore + bonuses.com;
    const totalArtRaw = matrix.totalScore + bonuses.art;
    let displayCom = Math.max(0, totalComRaw * MAX_GAME_SCORE);
    let displayArt = Math.max(0, totalArtRaw * MAX_GAME_SCORE);

    const totalComEl = document.getElementById('totalComScore');
    const totalArtEl = document.getElementById('totalArtScore');
    function formatFinalRating(val) {
        if (val > MAX_GAME_SCORE) return `${MAX_GAME_SCORE}`;
        return val.toFixed(1);
    }
    totalComEl.innerHTML = formatFinalRating(displayCom);
    totalComEl.style.color = displayCom > 0 ? 'var(--accent)' : 'var(--danger)'; 
    totalArtEl.innerHTML = formatFinalRating(displayArt);
    totalArtEl.style.color = displayArt > 0 ? '#a0a0ff' : 'var(--danger)'; 

    const spoilerEl = document.getElementById('spoilerDisplay');
    if (matrix.spoilers.length > 0) {
        let uniqueSpoilers = [...new Set(matrix.spoilers)];
        spoilerEl.innerHTML = uniqueSpoilers.map(s => 
            `<div style="color:var(--danger); padding: 4px 0; border-bottom:1px solid #444;">${s}</div>`
        ).join('');
    } else {
        spoilerEl.innerHTML = `<div style="color: #888; font-style: italic;">No severe conflicts found.</div>`;
    }
    document.getElementById('results-synergy').scrollIntoView({ behavior: 'smooth' });
}

// ---------------------------------------------
// SCRIPT GENERATOR LOGIC
// ---------------------------------------------

function resetGenerator() {
    initializeSelectors('generator');
    document.getElementById('genTargetScore').value = 4.5;
    document.getElementById('genTargetDisplay').innerText = "4.5";
    updateSliderTrack(document.getElementById('genTargetScore'));
    document.getElementById('genCountGenre').value = 1;
    document.getElementById('genCountTheme').value = 1;
    document.getElementById('genCountSupport').value = 1;
    document.getElementById('generated-results-container').classList.add('hidden');
    generatedScripts = [];
    renderGeneratedScripts();
}

function runGenerator() {
    const targetScore = parseFloat(document.getElementById('genTargetScore').value);
    const countGenre = parseInt(document.getElementById('genCountGenre').value) || 1;
    const countTheme = parseInt(document.getElementById('genCountTheme').value) || 1;
    const countSupport = parseInt(document.getElementById('genCountSupport').value) || 1;
    
    // Get Locked Tags
    const lockedInputs = collectTagInputs('generator');
    const lockedIds = lockedInputs.map(t => t.id);

    generatedScripts = [];
    const NUM_SCRIPTS = 5;

    for (let i = 0; i < NUM_SCRIPTS; i++) {
        // Try to generate a script
        const script = generateSingleScript(targetScore, lockedIds, countGenre, countTheme, countSupport);
        if (script) {
            generatedScripts.push(script);
        }
    }

    renderGeneratedScripts();
    document.getElementById('generated-results-container').classList.remove('hidden');
    document.getElementById('generated-results-container').scrollIntoView({ behavior: 'smooth' });
}

function generateSingleScript(targetScore, lockedIds, nGenre, nTheme, nSupport) {
    // 1. Define required structure
    const structure = [
        { cat: "Genre", count: Math.min(3, Math.max(1, nGenre)) },
        { cat: "Setting", count: 1 },
        { cat: "Protagonist", count: 1 },
        { cat: "Antagonist", count: 1 },
        { cat: "Supporting Character", count: Math.min(3, Math.max(0, nSupport)) },
        { cat: "Theme & Event", count: Math.min(3, Math.max(0, nTheme)) },
        { cat: "Finale", count: 1 }
    ];

    let currentTags = [];

    // 2. Apply Locks
    structure.forEach(slot => {
        const lockedInCat = lockedIds.filter(lid => GAME_DATA.tags[lid].category === slot.cat);
        // Add locked items up to the count
        for (let i = 0; i < Math.min(slot.count, lockedInCat.length); i++) {
            currentTags.push({ id: lockedInCat[i], category: slot.cat, percent: 1.0, locked: true });
        }
    });

    // 3. Random Fill remaining slots
    const allTags = Object.values(GAME_DATA.tags);
    structure.forEach(slot => {
        const currentCount = currentTags.filter(t => t.category === slot.cat).length;
        const needed = slot.count - currentCount;

        if (needed > 0) {
            const candidates = allTags.filter(t => t.category === slot.cat && !currentTags.some(ct => ct.id === t.id));
            // Shuffle candidates
            for (let i = candidates.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
            }
            
            for (let k = 0; k < needed; k++) {
                if (candidates[k]) {
                    currentTags.push({ id: candidates[k].id, category: slot.cat, percent: 1.0, locked: false });
                }
            }
        }
    });

    // 4. Normalize Genre Percents (Simple Equal Split for generation)
    normalizeGeneratorGenres(currentTags);

    // 5. Optimization (Hill Climbing / Simulated Annealing Lite)
    let bestTags = JSON.parse(JSON.stringify(currentTags));
    let currentScoreObj = calculateMatrixScore(currentTags);
    let bestDiff = Math.abs(currentScoreObj.rawAverage - targetScore);
    
    const ITERATIONS = 100;
    
    for (let i = 0; i < ITERATIONS; i++) {
        // Pick a non-locked tag to swap
        const mutableTags = currentTags.filter(t => !t.locked);
        if (mutableTags.length === 0) break; 
        
        const tagToSwap = mutableTags[Math.floor(Math.random() * mutableTags.length)];
        
        // Find replacements
        const replacements = allTags.filter(t => 
            t.category === tagToSwap.category && 
            !currentTags.some(ct => ct.id === t.id)
        );
        
        if (replacements.length === 0) continue;
        
        const replacement = replacements[Math.floor(Math.random() * replacements.length)];
        
        // Perform Swap
        const originalId = tagToSwap.id;
        tagToSwap.id = replacement.id;
        
        // Calculate new score
        const newScoreObj = calculateMatrixScore(currentTags);
        const newDiff = Math.abs(newScoreObj.rawAverage - targetScore);
        
        // Acceptance criteria: If better, keep. If strictly worse, revert.
        // We want to get CLOSE to targetScore.
        if (newDiff < bestDiff) {
            bestDiff = newDiff;
            bestTags = JSON.parse(JSON.stringify(currentTags)); // Save snapshot
        } else {
            // Revert
            tagToSwap.id = originalId;
        }
        
        // Early exit if very close
        if (bestDiff < 0.05) break;
    }

    // Recalculate final stats for the best set
    const finalMatrix = calculateMatrixScore(bestTags);
    const finalBonuses = calculateTotalBonuses(bestTags);
    
    // Calc Max Potential
    const MAX_GAME_SCORE = 9.9;
    const totalComRaw = finalMatrix.totalScore + finalBonuses.com;
    const totalArtRaw = finalMatrix.totalScore + finalBonuses.art;
    const maxCom = Math.min(MAX_GAME_SCORE, Math.max(0, totalComRaw * MAX_GAME_SCORE)).toFixed(1);
    const maxArt = Math.min(MAX_GAME_SCORE, Math.max(0, totalArtRaw * MAX_GAME_SCORE)).toFixed(1);

    return {
        id: Date.now() + Math.random(),
        tags: bestTags,
        avgComp: finalMatrix.rawAverage.toFixed(1),
        maxCom: maxCom,
        maxArt: maxArt,
        spoilers: finalMatrix.spoilers
    };
}

function normalizeGeneratorGenres(tags) {
    const genres = tags.filter(t => t.category === "Genre");
    const count = genres.length;
    if (count > 0) {
        const pct = 1.0 / count;
        genres.forEach(g => g.percent = pct);
    }
}

function renderGeneratedScripts() {
    const container = document.getElementById('generated-list');
    container.innerHTML = '';
    
    generatedScripts.forEach(script => {
        container.appendChild(createScriptCard(script, false));
    });
}

function renderSavedScripts() {
    const container = document.getElementById('saved-list');
    container.innerHTML = '';
    
    if (savedScripts.length === 0) {
        container.innerHTML = `<div style="text-align:center; color:#666; font-style:italic; padding:20px;">No saved scripts yet.</div>`;
    } else {
        savedScripts.forEach(script => {
            container.appendChild(createScriptCard(script, true));
        });
    }
    
    const wrapper = document.getElementById('saved-scripts-container');
    if (savedScripts.length > 0) wrapper.classList.remove('hidden');
    else wrapper.classList.add('hidden');
}

function createScriptCard(script, isSaved) {
    const card = document.createElement('div');
    card.className = 'script-item';
    
    // Color coding for Avg Comp
    const avgVal = parseFloat(script.avgComp);
    let colorClass = "med";
    if (avgVal >= 3.5) colorClass = "high";
    else if (avgVal < 2.5) colorClass = "low";

    const tagHtml = script.tags.map(t => {
        const name = GAME_DATA.tags[t.id].name;
        let classes = "tag-chip";
        if (t.category === "Genre") classes += " genre";
        if (t.category === "Theme & Event") classes += " theme";
        return `<span class="${classes}">${name}</span>`;
    }).join('');

    // Actions
    const saveIcon = isSaved ? '★' : '☆';
    const saveClass = isSaved ? 'save-active' : '';
    
    card.innerHTML = `
        <div class="script-header" onclick="toggleScriptView(this)">
            <div class="script-summary">
                <div class="s-score-box">
                    <span class="s-label">Avg Comp</span>
                    <span class="s-value ${colorClass}">${script.avgComp}</span>
                </div>
                <div class="s-score-box max-pot">
                    <span class="s-label">Max Potential</span>
                    <span class="s-value" style="font-size: 1rem; color:#ccc;">
                        <span style="color:var(--accent);">${script.maxCom}</span> / 
                        <span style="color:#a0a0ff;">${script.maxArt}</span>
                    </span>
                </div>
            </div>
            <div class="script-actions">
                <button class="icon-btn ${saveClass}" onclick="handleSaveClick(event, '${script.id}', ${isSaved})" title="${isSaved ? 'Unpin' : 'Pin Script'}">${saveIcon}</button>
                <button class="icon-btn" onclick="handleTransferClick(event, '${script.id}', ${isSaved})" title="Check Advertisers">➔</button>
            </div>
        </div>
        <div class="script-body">
            <div style="font-size:0.8rem; color:#888; text-transform:uppercase; margin-bottom:5px;">Composition</div>
            <div class="tag-list">
                ${tagHtml}
            </div>
        </div>
    `;
    return card;
}

function toggleScriptView(header) {
    const body = header.nextElementSibling;
    body.classList.toggle('expanded');
}

function handleSaveClick(e, id, isCurrentlySaved) {
    e.stopPropagation();
    if (isCurrentlySaved) {
        // Unsave
        savedScripts = savedScripts.filter(s => s.id != id);
    } else {
        // Save
        const script = generatedScripts.find(s => s.id == id);
        if (script) {
            // Clone to avoid ref issues
            const clone = JSON.parse(JSON.stringify(script));
            clone.id = "saved_" + (++savedScriptIdCounter); // new ID for saved list
            savedScripts.push(clone);
        }
    }
    renderGeneratedScripts(); // Re-render gen list to update stars if we wanted, but logic separates them. 
    // Actually, if we unsave from saved list, just update saved list.
    renderSavedScripts();
}

function handleTransferClick(e, id, isSaved) {
    e.stopPropagation();
    const list = isSaved ? savedScripts : generatedScripts;
    const script = list.find(s => s.id == id);
    if (!script) return;

    // Switch tab
    switchTab('advertisers');
    
    // Clear current advertisers selection
    initializeSelectors('advertisers');
    
    // Populate inputs (UI only)
    script.tags.forEach(tag => {
        const container = document.getElementById(`inputs-${tag.category.replace(/\s/g, '-')}-advertisers`);
        if(!container) return;
        
        // Find empty
        let selects = container.querySelectorAll('select');
        let placed = false;
        for(let sel of selects) {
            if(sel.value === "") {
                sel.value = tag.id;
                placed = true;
                break;
            }
        }
        if(!placed) {
            addDropdown(tag.category, tag.id, 'advertisers');
        }
    });

    // Handle genres percentages specifically for the UI inputs
    const genres = script.tags.filter(t => t.category === "Genre");
    if (genres.length > 0) {
        updateGenreControls('advertisers');
        const genreRows = document.querySelectorAll('#inputs-Genre-advertisers .genre-row');
        genres.forEach((g, idx) => {
             if(genreRows[idx]) {
                const percentVal = Math.round(g.percent * 100);
                genreRows[idx].querySelector('.percent-input').value = percentVal;
                genreRows[idx].querySelector('.percent-slider').value = percentVal;
                updatePercentSliderTrack(genreRows[idx].querySelector('.percent-slider'));
             }
        });
    }

    // Run analysis directly
    analyzeMovie(script.tags);
}

// ---------------------------------------------
// UI HELPERS (Existing)
// ---------------------------------------------
function resetSelectors(context) {
    initializeSelectors(context);
    document.getElementById(`results-${context}`).classList.add('hidden');
}

function transferTagsToAdvertisers(sourceContext) {
    const inputs = collectTagInputs(sourceContext);
    if (inputs.length === 0) return;
    
    switchTab('advertisers');
    initializeSelectors('advertisers');
    
    inputs.forEach(input => {
        const category = input.category;
        const containerId = `inputs-${category.replace(/\s/g, '-')}-advertisers`;
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const existingSelects = container.querySelectorAll('select');
        let placed = false;
        for (let sel of existingSelects) {
            if (sel.value === "") {
                sel.value = input.id;
                placed = true;
                break;
            }
        }
        if (!placed) {
            addDropdown(category, input.id, 'advertisers');
        }
    });
    
    const genreInputs = inputs.filter(i => i.category === 'Genre');
    if (genreInputs.length > 1) {
        updateGenreControls('advertisers');
        const genreRows = document.querySelectorAll('#inputs-Genre-advertisers .genre-row');
        genreRows.forEach((row, index) => {
            if (genreInputs[index]) {
                const percentVal = Math.round(genreInputs[index].percent * 100);
                row.querySelector('.percent-input').value = percentVal;
                row.querySelector('.percent-slider').value = percentVal;
                updatePercentSliderTrack(row.querySelector('.percent-slider'));
            }
        });
    }
    
    analyzeMovie();
}