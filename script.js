const MULTI_SELECT_CATEGORIES = ["Genre", "Supporting Character", "Theme & Event"];
let searchIndex = [];
// CHANGED: Default is now synergy
let currentTab = 'synergy'; 

window.onload = async function() {
    try {
        await loadExternalData();
        // Initialize selectors for BOTH tabs
        initializeSelectors('advertisers');
        initializeSelectors('synergy');
        
        buildSearchIndex();
        setupSearchListeners();
        setupScoreSync(); 
        
        console.log("Initialization Complete.");
    } catch (error) {
        console.error("Failed to load data:", error);
    }
};

function switchTab(tabName) {
    currentTab = tabName;
    
    // Update Buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    const btns = document.querySelectorAll('.tab-btn');
    
    // CHANGED: Logic flipped because HTML order flipped
    // Index 0 is now Synergy, Index 1 is Advertisers
    if(tabName === 'synergy') btns[0].classList.add('active');
    else btns[1].classList.add('active');

    // Update Content
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

function updatePercentSliderTrack(slider) {
    const value = slider.value; // min is 0, max is 100
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

        addDropdown(category, null, context);
    });
}

function addDropdown(category, selectedId = null, context = currentTab) {
    const containerId = `inputs-${category.replace(/\s/g, '-')}-${context}`;
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
    if (category === 'Genre') row.classList.add('genre-row'); 

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

    if (category === 'Genre') {
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
            if (category === 'Genre') updateGenreControls(context);
        };
        row.appendChild(removeBtn);
    }

    container.appendChild(row);

    if (category === 'Genre') {
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
// ADVERTISER CALCULATOR LOGIC
// ---------------------------------------------
function analyzeMovie() {
    const tagInputs = collectTagInputs('advertisers');

    if(tagInputs.length === 0) {
        alert("Please select at least one tag.");
        return;
    }

    const inputCom = parseFloat(document.getElementById('comScoreInput').value) || 0;
    const inputArt = parseFloat(document.getElementById('artScoreInput').value) || 0;

    let scores = { "YM": 0, "YF": 0, "TM": 0, "TF": 0, "AM": 0, "AF": 0 };

    tagInputs.forEach(item => {
        const tagData = GAME_DATA.tags[item.id];
        if(!tagData) return;

        const multiplier = item.percent;

        for(let demo in scores) {
            if(tagData.weights[demo]) {
                scores[demo] += (tagData.weights[demo] * multiplier);
            }
        }
    });

    let weightedScores = {};
    for(let demo in scores) {
        weightedScores[demo] = scores[demo] * GAME_DATA.demographics[demo].weight;
    }
    let winner = Object.keys(weightedScores).reduce((a, b) => weightedScores[a] > weightedScores[b] ? a : b);
    let winnerName = GAME_DATA.demographics[winner].name;
    
    let movieLean = 0; 
    let leanText = "Balanced";
    
    if (inputArt > inputCom + 0.1) {
        movieLean = 1;
        leanText = "Artistic";
    } else if (inputCom > inputArt + 0.1) {
        movieLean = 2;
        leanText = "Commercial";
    }

    let validAgents = GAME_DATA.adAgents.filter(agent => {
        if (!agent.targets.includes(winner)) return false;
        return agent.type === 0 || agent.type === movieLean;
    });

    validAgents.sort((a, b) => b.level - a.level);

    document.getElementById('results-advertisers').classList.remove('hidden');
    
    document.getElementById('targetAudienceDisplay').innerHTML = `
        <span style="color: #ffd700;">${winnerName}</span>
        <span style="font-size: 0.5em; color: #888; vertical-align: middle;">(${winner})</span>
    `;

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
    
    document.getElementById('movieLeanDisplay').innerHTML = `
        <span style="color: ${movieLean === 1 ? '#a0a0ff' : (movieLean === 2 ? '#d4af37' : '#fff')}">${leanText}</span>
    `;

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
    
    document.getElementById('results-advertisers').scrollIntoView({ behavior: 'smooth' });
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
    const genreResult = calculateGenrePairScore(selectedTags);

    renderSynergyResults(matrixResult, genreResult);
}

function calculateMatrixScore(tags) {
    let totalScore = 0;
    let spoilers = [];

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

    return { totalScore, spoilers };
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

function renderSynergyResults(matrix, genre) {
    document.getElementById('results-synergy').classList.remove('hidden');

    const scoreEl = document.getElementById('synergyTotalDisplay');
    scoreEl.innerText = matrix.totalScore.toFixed(2);
    scoreEl.style.color = matrix.totalScore >= 0 ? 'var(--success)' : 'var(--danger)';

    const genreEl = document.getElementById('genreBonusDisplay');
    if (genre) {
        let comSign = genre.com > 0 ? "+" : "";
        let artSign = genre.art > 0 ? "+" : "";
        genreEl.innerHTML = `<span style="font-size:0.8em; color:#aaa;">${genre.names}</span><br>
                             <span class="text-success">Com: ${comSign}${genre.com}</span> | <span style="color:#a0a0ff">Art: ${artSign}${genre.art}</span>`;
    } else {
        genreEl.innerText = "None applied";
    }

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
    document.getElementById(`results-${context}`).classList.add('hidden');
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