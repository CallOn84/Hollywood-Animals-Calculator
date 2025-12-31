const MULTI_SELECT_CATEGORIES = ["Genre", "Supporting Character", "Theme & Event"];
let searchIndex = [];
let currentTab = 'synergy'; 
let generatedScriptsCache = []; // Stores the current batch of 5 scripts
let pinnedScripts = []; // Stores saved scripts

// --- LOCALIZATION VARIABLES ---
let localizationMap = {}; // Stores ID -> "Clean Name"
let currentLanguage = 'English';

window.onload = async function() {
    try {
        await changeLanguage('English', false); 
        await loadExternalData();
        initializeSelectors('advertisers');
        initializeSelectors('synergy');
        
        // Init generator tab selectors (Locked and Excluded)
        initializeSelectors('generator'); 
        initializeSelectors('excluded');

        buildSearchIndex();
        setupSearchListeners();
        setupScoreSync(); 
        setupGeneratorControls(); 
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
                const savedExcluded = collectTagInputs('excluded');
                
                initializeSelectors('synergy');
                initializeSelectors('advertisers');
                initializeSelectors('generator');
                initializeSelectors('excluded');
                
                restoreSelection('synergy', savedSynergy);
                restoreSelection('advertisers', savedAdvertisers);
                restoreSelection('generator', savedGenerator);
                restoreSelection('excluded', savedExcluded);
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
        const selects = container.querySelectorAll('select');
        let placed = false;
        for(let sel of selects) {
            if(sel.value === "") {
                sel.value = input.id;
                placed = true;
                break;
            }
        }
        if(!placed && MULTI_SELECT_CATEGORIES.includes(category)) {
            addDropdown(category, input.id, context);
            placed = true;
        }
    });
    if(savedInputs.some(i => i.category === 'Genre')) {
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
    
    // Simple index mapping or selector matching
    const btns = document.querySelectorAll('.tab-btn');
    if(tabName === 'generator') btns[0].classList.add('active');
    else if(tabName === 'synergy') btns[1].classList.add('active');
    else btns[2].classList.add('active');
    
    document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
}

function setupScoreSync() {
    // Existing Advertiser Tab Sync
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

function setupGeneratorControls() {
    // Generator Tab Sliders + Inputs
    const genCompSlider = document.getElementById('genCompSlider');
    const genCompInput = document.getElementById('genCompInput');
    
    genCompSlider.addEventListener('input', (e) => {
        genCompInput.value = parseFloat(e.target.value).toFixed(1);
        updateSliderTrack(genCompSlider, '#4cd964');
    });
    genCompInput.addEventListener('input', (e) => {
        let val = parseFloat(e.target.value);
        if (val > 5) val = 5;
        if (val < 1) val = 1;
        if (!isNaN(val)) {
            genCompSlider.value = val;
            updateSliderTrack(genCompSlider, '#4cd964');
        }
    });
    updateSliderTrack(genCompSlider, '#4cd964');

    const genScoreSlider = document.getElementById('genScoreSlider');
    const genScoreInput = document.getElementById('genScoreInput');
    const requiredTagsDisplay = document.getElementById('genTagsRequiredDisplay');

    function updateScoreDisplay(val) {
        // Update Help Text for Tag Count
        let requiredTags = 0;
        if(val <= 6) requiredTags = 4;
        else if(val === 7) requiredTags = 6;
        else if(val === 8) requiredTags = 8;
        else if(val === 9) requiredTags = 9;
        else if(val === 10) requiredTags = 10;
        
        requiredTagsDisplay.innerText = `Requires ~${requiredTags} Story Elements (excluding Genre).`;
        updateSliderTrack(genScoreSlider, '#d4af37');
    }

    genScoreSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        genScoreInput.value = val;
        updateScoreDisplay(val);
    });
    genScoreInput.addEventListener('input', (e) => {
        let val = parseInt(e.target.value);
        if(val > 10) val = 10;
        if(val < 6) val = 6;
        if(!isNaN(val)) {
            genScoreSlider.value = val;
            updateScoreDisplay(val);
        }
    });
    updateSliderTrack(genScoreSlider, '#d4af37');
}

function updateSliderTrack(slider, colorOverride = null) {
    const value = (slider.value - slider.min) / (slider.max - slider.min) * 100;
    const isArt = slider.classList.contains('art-slider');
    // Default logic
    let color = isArt ? '#a0a0ff' : '#d4af37'; 
    if (colorOverride) color = colorOverride;
    
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
        
        // Excluded list is always multi-select for all categories
        if (context === 'excluded' || MULTI_SELECT_CATEGORIES.includes(category)) {
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
        addDropdown(category, null, context);
    });
}

function addDropdown(category, selectedId = null, context = currentTab) {
    const containerId = `inputs-${category.replace(/\s/g, '-')}-${context}`;
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Logic for Single-select categories in 'synergy' or 'generator' (locked) context
    if (context !== 'excluded' && !MULTI_SELECT_CATEGORIES.includes(category) && container.children.length > 0) {
        const select = container.querySelector('select');
        if (selectedId) select.value = selectedId;
        return;
    }
    
    const tags = Object.values(GAME_DATA.tags).filter(t => t.category === category)
                 .sort((a, b) => a.name.localeCompare(b.name));
    const row = document.createElement('div');
    row.className = 'select-row';
    if (category === 'Genre' && context !== 'excluded') row.classList.add('genre-row'); 
    
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
    
    // Add percent slider only for Genre in Synergy/Advertisers (not Excluded or simple Lock)
    if (category === 'Genre' && context !== 'excluded') {
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
    
    if (context === 'excluded' || MULTI_SELECT_CATEGORIES.includes(category)) {
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '×';
        removeBtn.onclick = () => {
            row.remove();
            if (category === 'Genre' && context !== 'excluded') updateGenreControls(context);
        };
        row.appendChild(removeBtn);
    }
    container.appendChild(row);
    if (category === 'Genre' && context !== 'excluded') {
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
    const selects = container.querySelectorAll('select.tag-selector');
    let filled = false;
    for (let select of selects) {
        if (select.value === "") {
            select.value = tagObj.id;
            filled = true;
            break;
        }
    }
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
    const genreContainer = document.getElementById(`inputs-Genre-${context}`);
    const genreRows = genreContainer ? genreContainer.querySelectorAll('.genre-row') : [];
    let totalGenreInput = 0;
    const genreData = [];
    genreRows.forEach(row => {
        const select = row.querySelector('select');
        const input = row.querySelector('.percent-input');
        if (select.value) {
            let val = parseFloat(input ? input.value : 100);
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

/* =========================================================================
   SCRIPT GENERATOR LOGIC
   ========================================================================= */

function generateScripts() {
    const targetComp = parseFloat(document.getElementById('genCompInput').value);
    const targetScoreInput = parseInt(document.getElementById('genScoreInput').value);
    
    // Map Movie Score to Required Non-Genre Tag Count
    let targetCount = 4; // Default for 6
    if (targetScoreInput === 7) targetCount = 6;
    else if (targetScoreInput === 8) targetCount = 8;
    else if (targetScoreInput === 9) targetCount = 9;
    else if (targetScoreInput >= 10) targetCount = 10;

    // Get Fixed Tags
    const fixedTags = collectTagInputs('generator');
    const excludedTags = collectTagInputs('excluded');
    
    // Validate
    const nonGenreFixed = fixedTags.filter(t => t.category !== "Genre");
    if (nonGenreFixed.length > targetCount) {
        alert(`You have locked ${nonGenreFixed.length} elements, but the target Movie Score only allows for ${targetCount}. Increase the target Movie Score or remove locked elements.`);
        return;
    }

    const generatedBatch = [];
    
    // Generate 5 Output Slots
    for(let i=0; i<5; i++) {
        // --- MULTI-ATTEMPT RESTART STRATEGY ---
        let bestCandidate = null;
        
        // Try up to 50 times to find a script that meets criteria
        const MAX_ATTEMPTS = 50;
        
        for(let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            const candidate = runGenerationAlgorithm(targetComp, targetCount, fixedTags, excludedTags);
            
            // Logic to determine "better":
            // 1. Prefer higher compatibility
            if (!bestCandidate || candidate.stats.avgComp > bestCandidate.stats.avgComp) {
                bestCandidate = candidate;
            }
            
            // Acceptance Criteria to stop early:
            // If we met the Target Compatibility AND we avoided conflicts (Movie Score > 0)
            if (bestCandidate.stats.avgComp >= targetComp && parseFloat(bestCandidate.stats.movieScore) > 0) {
                break; // Found a good one, lock it in for this slot
            }
        }
        
        generatedBatch.push(bestCandidate);
    }
    
    // Sort by Movie Score (Descending), then Average Compatibility (Descending)
    generatedBatch.sort((a, b) => {
        const scoreA = parseFloat(a.stats.movieScore);
        const scoreB = parseFloat(b.stats.movieScore);
        
        if (scoreA !== scoreB) {
            return scoreB - scoreA;
        }
        return b.stats.avgComp - a.stats.avgComp;
    });

    generatedScriptsCache = generatedBatch;
    renderGeneratedScripts(generatedBatch);
}

function runGenerationAlgorithm(targetComp, targetCount, fixedTags, excludedTags) {
    const excludedIds = new Set(excludedTags.map(t => t.id));
    
    // 1. Setup Initial Candidate
    let currentTags = [...fixedTags];
    const categoriesPresent = new Set(currentTags.map(t => t.category));
    
    // A. Handle Genres (Ensure at least 1, maybe 2)
    const fixedGenres = currentTags.filter(t => t.category === "Genre");
    const fixedGenreCount = fixedGenres.length;

    if (fixedGenreCount === 0) {
        // No genre locked: Pick 1 or 2
        const genre1 = getRandomTagByCategory("Genre", currentTags, excludedIds);
        
        if (genre1) {
            // Check for Multi-Genre chance (30%)
            // FIX: Only pick a second genre if it is compatible according to GenrePairs
            let partnerId = null;
            
            if (Math.random() < 0.3) {
                 const partners = getCompatibleGenres(genre1.id, excludedIds);
                 if (partners.length > 0) {
                     partnerId = partners[Math.floor(Math.random() * partners.length)];
                 }
            }
            
            if (partnerId) {
                // Apply 50/50 split for dual genre
                genre1.percent = 0.5;
                currentTags.push(genre1);
                currentTags.push({ id: partnerId, percent: 0.5, category: "Genre" });
            } else {
                // Single genre
                genre1.percent = 1.0;
                currentTags.push(genre1);
            }
        }
    } else {
        // If 1 or more genres are locked, we respect the user's locks and don't add random genres
        // to avoid breaking their specific build intent.
    }

    // B. Fill Mandatory Categories
    const mandatorycats = ["Setting", "Protagonist", "Antagonist", "Finale"];
    mandatorycats.forEach(cat => {
        if(!categoriesPresent.has(cat) && getNonGenreCount(currentTags) < targetCount) {
            const randomTag = getRandomTagByCategory(cat, currentTags, excludedIds);
            if(randomTag) currentTags.push(randomTag);
        }
    });

    // C. Fill remaining slots
    const fillerCats = ["Supporting Character", "Theme & Event"];
    while(getNonGenreCount(currentTags) < targetCount) {
        const randCat = fillerCats[Math.floor(Math.random() * fillerCats.length)];
        const randomTag = getRandomTagByCategory(randCat, currentTags, excludedIds);
        if(randomTag) currentTags.push(randomTag);
        else break; 
    }
    
    // 2. Optimization Loop (Simple Randomized Hill Climbing)
    let bestSet = [...currentTags];
    let bestStats = calculateMatrixScore(bestSet);
    
    const iterations = 200; 
    for(let i=0; i<iterations; i++) {
        let candidate = [...bestSet];
        const fixedIds = new Set(fixedTags.map(t => t.id));
        const mutableIndices = candidate.map((t, idx) => ({t, idx}))
                                        .filter(item => !fixedIds.has(item.t.id) && item.t.category !== 'Genre')
                                        .map(item => item.idx);
        
        if(mutableIndices.length === 0) break; 
        
        const swapIdx = mutableIndices[Math.floor(Math.random() * mutableIndices.length)];
        const tagToSwap = candidate[swapIdx];
        
        const newTag = getRandomTagByCategory(tagToSwap.category, candidate, excludedIds); 
        
        if(newTag) {
            candidate[swapIdx] = newTag;
            const newStats = calculateMatrixScore(candidate);
            
            if(newStats.rawAverage > bestStats.rawAverage) {
                bestSet = candidate;
                bestStats = newStats;
            }
        }
    }
    
    // 3. Calculate Final Stats
    // Calculate Tag Cap (based on element count)
    const ngCount = getNonGenreCount(bestSet);
    let tagCap = 6;
    let maxScriptQual = 5;

    if(ngCount >= 10) { tagCap = 10; maxScriptQual = 10; }
    else if(ngCount >= 9) { tagCap = 9; maxScriptQual = 8; }
    else if(ngCount >= 7) { tagCap = 8; maxScriptQual = 7; } // 7-8 tags
    else if(ngCount >= 5) { tagCap = 7; maxScriptQual = 6; } // 5-6 tags
    // else <5: tagCap 6, script 5
    
    // Calculate Max Potential Score from Synergy & Bonuses
    const bonuses = calculateTotalBonuses(bestSet);
    const MAX_GAME_SCORE = 9.9;
    const rawCom = (bestStats.totalScore + bonuses.com) * MAX_GAME_SCORE;
    const rawArt = (bestStats.totalScore + bonuses.art) * MAX_GAME_SCORE;
    const maxPotential = Math.max(0, Math.max(rawCom, rawArt));
    
    // Final Display Movie Score is the lower of the Tag Cap and Max Potential
    const finalMovieScore = Math.min(tagCap, maxPotential);

    return {
        tags: bestSet,
        stats: {
            avgComp: bestStats.rawAverage,
            synergySum: bestStats.totalScore,
            maxScriptQuality: maxScriptQual,
            movieScore: finalMovieScore.toFixed(1) // Return formatted string
        },
        uniqueId: Date.now() + Math.random().toString()
    };
}

function getCompatibleGenres(sourceId, excludedIds) {
    let valid = [];
    
    // 1. Check direct mappings (Source -> Target)
    if (GAME_DATA.genrePairs[sourceId]) {
        valid.push(...Object.keys(GAME_DATA.genrePairs[sourceId]));
    }
    
    // 2. Check reverse mappings (Target -> Source)
    // We iterate the keys to find if sourceId appears as a target for any other genre
    for (const gKey in GAME_DATA.genrePairs) {
        if (GAME_DATA.genrePairs[gKey] && GAME_DATA.genrePairs[gKey][sourceId]) {
            valid.push(gKey);
        }
    }
    
    // 3. Deduplicate and filter excluded
    const unique = new Set(valid);
    return [...unique].filter(id => !excludedIds.has(id));
}

function getNonGenreCount(tags) {
    return tags.filter(t => t.category !== "Genre").length;
}

function getRandomTagByCategory(category, currentTags, excludedIds) {
    const existingIds = new Set(currentTags.map(t => t.id));
    const allTags = Object.values(GAME_DATA.tags).filter(t => t.category === category);
    
    // Filter out Used AND Excluded
    const available = allTags.filter(t => !existingIds.has(t.id) && !excludedIds.has(t.id));
    
    if(available.length === 0) return null;
    const picked = available[Math.floor(Math.random() * available.length)];
    
    return {
        id: picked.id,
        percent: 1.0, 
        category: category
    };
}

function renderGeneratedScripts(scripts) {
    const container = document.getElementById('generatorResultsList');
    container.innerHTML = '';
    document.getElementById('results-generator').classList.remove('hidden');

    scripts.forEach((script, index) => {
        const card = createScriptCardHTML(script, false); 
        container.appendChild(card);
    });
}

function createScriptCardHTML(scriptObj, isPinned) {
    const div = document.createElement('div');
    div.className = 'gen-card';
    div.dataset.id = scriptObj.uniqueId;
    
    // Determine badge colors
    const compClass = scriptObj.stats.avgComp >= 4.0 ? 'val-high' : (scriptObj.stats.avgComp >= 3.0 ? 'val-mid' : 'val-low');
    
    // Tag Chips
    let tagsHtml = '';
    const fixedInputs = collectTagInputs('generator');
    const fixedIds = new Set(fixedInputs.map(t => t.id));
    
    // Define Sort Order
    const categoryOrder = [
        "Genre", 
        "Setting", 
        "Protagonist", 
        "Antagonist", 
        "Supporting Character", 
        "Theme & Event", 
        "Finale"
    ];

    // Sort tags based on category order
    const sortedTags = [...scriptObj.tags].sort((a, b) => {
        let idxA = categoryOrder.indexOf(a.category);
        let idxB = categoryOrder.indexOf(b.category);
        
        // Safety: If category not found, put at end
        if (idxA === -1) idxA = 99;
        if (idxB === -1) idxB = 99;
        
        return idxA - idxB;
    });

    sortedTags.forEach(t => {
        const tagName = GAME_DATA.tags[t.id].name;
        const isFixed = fixedIds.has(t.id);
        tagsHtml += `<span class="gen-tag-chip ${isFixed ? 'tag-fixed' : ''}">${tagName} <small>${t.category}</small></span>`;
    });

    const pinClass = isPinned ? 'pinned' : '';
    const pinTitle = isPinned ? 'Unpin' : 'Pin to Save';

    div.innerHTML = `
        <div class="gen-header" onclick="toggleScriptCard(this)">
            <div class="gen-info-row">
                <div class="gen-badge-group">
                    <span class="gen-badge-label">Avg Comp</span>
                    <span class="gen-badge-val ${compClass}">${scriptObj.stats.avgComp.toFixed(1)}</span>
                </div>
                <div class="gen-badge-group">
                    <span class="gen-badge-label">Movie Score</span>
                    <span class="gen-badge-val val-mid">${scriptObj.stats.movieScore}</span>
                </div>
                <div class="gen-badge-group">
                    <span class="gen-badge-label">Script Qual</span>
                    <span class="gen-badge-val val-mid">${scriptObj.stats.maxScriptQuality}</span>
                </div>
            </div>
            <button class="pin-btn ${pinClass}" title="${pinTitle}" onclick="togglePin('${scriptObj.uniqueId}', event)">
                ${isPinned ? '★' : '☆'}
            </button>
        </div>
        <div class="gen-details hidden">
            <div class="gen-tags-grid">
                ${tagsHtml}
            </div>
            <div class="gen-actions">
                <span style="font-size:0.8rem; color:#666;">ID: ${scriptObj.uniqueId.substring(scriptObj.uniqueId.length-6)}</span>
                <button class="transfer-link-btn" onclick="transferScriptToAdvertisers('${scriptObj.uniqueId}')">
                    Use in Advertisers &rarr;
                </button>
            </div>
        </div>
    `;
    return div;
}

function toggleScriptCard(headerEl) {
    const details = headerEl.nextElementSibling;
    details.classList.toggle('hidden');
}

function togglePin(uniqueId, event) {
    event.stopPropagation(); 
    
    const existingIndex = pinnedScripts.findIndex(s => s.uniqueId === uniqueId);
    if(existingIndex > -1) {
        pinnedScripts.splice(existingIndex, 1);
    } else {
        const script = generatedScriptsCache.find(s => s.uniqueId === uniqueId);
        if(script) pinnedScripts.push(script);
    }
    renderPinnedScripts();
    renderGeneratedScripts(generatedScriptsCache);
}

function renderPinnedScripts() {
    const container = document.getElementById('pinnedResultsList');
    const wrapper = document.getElementById('pinned-scripts-container');
    container.innerHTML = '';
    
    if(pinnedScripts.length === 0) {
        wrapper.classList.add('hidden');
        return;
    }
    
    wrapper.classList.remove('hidden');
    pinnedScripts.forEach(script => {
        const card = createScriptCardHTML(script, true);
        container.appendChild(card);
    });
}

function transferScriptToAdvertisers(uniqueId) {
    let script = pinnedScripts.find(s => s.uniqueId === uniqueId);
    if(!script) script = generatedScriptsCache.find(s => s.uniqueId === uniqueId);
    
    if(!script) return;
    
    switchTab('advertisers');
    initializeSelectors('advertisers'); 
    
    script.tags.forEach(t => {
        const category = t.category;
        const containerId = `inputs-${category.replace(/\s/g, '-')}-advertisers`;
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const existingSelects = container.querySelectorAll('select');
        let placed = false;
        for (let sel of existingSelects) {
            if (sel.value === "") {
                sel.value = t.id;
                placed = true;
                break;
            }
        }
        if (!placed) {
            addDropdown(category, t.id, 'advertisers');
        }
    });
    
    const genres = script.tags.filter(t => t.category === "Genre");
    if(genres.length > 1) {
        updateGenreControls('advertisers');
    }
    
    analyzeMovie();
}


// --- EXISTING CALCULATOR LOGIC BELOW ---

function analyzeMovie() {
    const tagInputs = collectTagInputs('advertisers');
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

    // --- REVISED HOLIDAY LOGIC (Detailed Breakdown) ---
    const holidayContainer = document.getElementById('holidayDisplay');
    holidayContainer.innerHTML = '';

    if (validTargetIds.length === 0) {
        holidayContainer.innerHTML = `<div style="color:#666; font-style:italic;">Identify target audience first.</div>`;
    } else {
        // Determine Priority Targets (High if exist, else Moderate)
        let primaryTargets = highInterestIds;
        if (primaryTargets.length === 0) {
            primaryTargets = moderateInterestIds;
        }

        const rankedHolidays = GAME_DATA.holidays.map(h => {
            let totalScore = 0;
            let parts = [];

            // Iterate over the ACTIVE target list to build text
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

            // Sort parts by bonus value descending for display
            parts.sort((a, b) => b.val - a.val);
            const contextText = parts.length > 0 ? parts.map(p => p.text).join(', ') : "No significant bonus.";

            return {
                name: h.name,
                totalScore: totalScore,
                contextText: contextText
            };
        });

        // Filter and Sort by Total Score
        const viableHolidays = rankedHolidays.filter(h => h.totalScore > 0).sort((a, b) => b.totalScore - a.totalScore);

        if (viableHolidays.length === 0) {
            holidayContainer.innerHTML = `<div class="holiday-row-empty"><span>No beneficial holidays found for your primary audience.</span></div>`;
        } else {
            // Render Best Option
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

            // Render Alternatives
            const alternatives = viableHolidays.slice(1, 4); // Take next 3
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

    // --- RENDER DISTRIBUTION CALCULATOR ---
    renderDistributionCalculator(inputCom);

    document.getElementById('results-advertisers').scrollIntoView({ behavior: 'smooth' });
}

// ---------------------------------------------
// DISTRIBUTION CALCULATOR LOGIC
// ---------------------------------------------

function renderDistributionCalculator(commercialScore) {
    const parent = document.getElementById('results-advertisers');
    let distWrapper = document.getElementById('dist-wrapper');
    
    // Check if user already typed something, otherwise default to 10
    let currentOwned = 10;
    if (distWrapper) {
        const input = document.getElementById('ownedScreeningsInput');
        if (input && input.value) {
            currentOwned = parseInt(input.value);
        }
    }

    // Create wrapper if not exists
    if (!distWrapper) {
        distWrapper = document.createElement('div');
        distWrapper.id = 'dist-wrapper';
        distWrapper.className = 'card result-card';
        // REMOVED manual margin-top; handled by CSS gap in container
        
        // Header
        const header = document.createElement('h3');
        header.innerText = 'Distribution Calculator';
        distWrapper.appendChild(header);

        // Input Area
        const inputRow = document.createElement('div');
        inputRow.className = 'dist-input-row';
        inputRow.innerHTML = `
            <div class="dist-input-group">
                <label for="ownedScreeningsInput">Owned Theatres (Screenings)</label>
                <input type="number" id="ownedScreeningsInput" class="screenings-input" value="${currentOwned}" min="0" step="1">
            </div>
            <p class="subtitle" style="margin:0; align-self:center;">Enter your owned screenings to see independent booking requirements.</p>
        `;
        distWrapper.appendChild(inputRow);

        // Grid Area
        const grid = document.createElement('div');
        grid.id = 'dist-results-grid';
        grid.className = 'dist-grid';
        distWrapper.appendChild(grid);

        parent.appendChild(distWrapper);

        // Attach listener
        const inputEl = document.getElementById('ownedScreeningsInput');
        inputEl.addEventListener('input', () => {
             const val = parseInt(inputEl.value) || 0;
             updateDistributionUI(commercialScore, val);
        });
    } else {
        // Update stored value if wrapper existed but was re-rendered (though we handle persistence above)
        // Just ensures the listener has the NEW commercial score in scope
        const inputEl = document.getElementById('ownedScreeningsInput');
        
        // Remove old listener to avoid stacking (by cloning)
        const newEl = inputEl.cloneNode(true);
        inputEl.parentNode.replaceChild(newEl, inputEl);
        
        newEl.addEventListener('input', () => {
             const val = parseInt(newEl.value) || 0;
             updateDistributionUI(commercialScore, val);
        });
        
        // Restore focus if needed or just update val
        newEl.value = currentOwned;
    }

    updateDistributionUI(commercialScore, currentOwned);
}

function updateDistributionUI(score, owned) {
    const results = calculateWeeklyDistribution(score, owned);
    const grid = document.getElementById('dist-results-grid');
    grid.innerHTML = '';

    results.forEach((val, index) => {
        const weekNum = index + 1;
        const box = document.createElement('div');
        box.className = 'week-box';
        
        // Visual indicator for high demand
        const isHigh = val > 5000;
        
        box.innerHTML = `
            <span class="week-label">Week ${weekNum}</span>
            <span class="week-val ${val > 0 ? 'active' : ''}">${val.toLocaleString()}</span>
        `;
        grid.appendChild(box);
    });
}

/**
 * Weekly Results Logic based on Kotlin source:
 * Week 1: (Score * 2 * 1000) - Screenings
 * Week 2: (Score * 1 * 1000) - Screenings
 * Week 3..8: Week 2 Result * 0.8 (recursive decay)
 * Rounding: Week 1-4 (Ceil), Week 5-8 (Floor)
 */
function calculateWeeklyDistribution(commercialScore, availableScreenings) {
    const BASE = 1000;
    const W1_MULT = 2;
    const W2_MULT = 1;
    const DECAY = 0.8;

    // Week 1
    const rawW1 = (commercialScore * W1_MULT * BASE) - availableScreenings;
    const w1 = Math.max(0.0, rawW1);

    // Week 2
    const rawW2 = (commercialScore * W2_MULT * BASE) - availableScreenings;
    const w2 = Math.max(0.0, rawW2);

    let results = [w1, w2];
    let currentDecayBase = w2;

    // Weeks 3 to 8 (Indices 2 to 7)
    // Kotlin logic: Takes Week 2 result and applies consecutive weekly reductions.
    // Note: It does NOT subtract screenings again for weeks 3-8, it decays the overflow.
    for (let i = 2; i < 8; i++) {
        currentDecayBase *= DECAY;
        results.push(currentDecayBase);
    }

    // Apply Rounding Rules
    // Indices 0..3 (Weeks 1-4) -> Ceil
    // Indices 4..7 (Weeks 5-8) -> Floor
    return results.map((val, index) => {
        if (index < 4) {
            return Math.ceil(val);
        } else {
            return Math.floor(val);
        }
    });
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
        if (val > MAX_GAME_SCORE) {
            return `${MAX_GAME_SCORE}`;
        }
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

function resetSelectors(context) {
    initializeSelectors(context);
    // Hide appropriate results
    if (context === 'generator' || context === 'excluded') {
        document.getElementById(`results-generator`).classList.add('hidden');
    } else {
        document.getElementById(`results-${context}`).classList.add('hidden');
    }
}

function transferTagsToAdvertisers() {
    const inputs = collectTagInputs('synergy');
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