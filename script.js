const MULTI_SELECT_CATEGORIES = ["Genre", "Supporting Character", "Theme & Event"];
let searchIndex = [];
let currentTab = 'synergy'; 

window.onload = async function() {
    try {
        await loadExternalData();
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
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const btns = document.querySelectorAll('.tab-btn');
    if(tabName === 'synergy') btns[0].classList.add('active');
    else btns[1].classList.add('active');
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
// ADVERTISER CALCULATOR LOGIC (Final Fix)
// ---------------------------------------------
function analyzeMovie() {
    const tagInputs = collectTagInputs('advertisers');

    if(tagInputs.length === 0) {
        alert("Please select at least one tag.");
        return;
    }

    const inputCom = parseFloat(document.getElementById('comScoreInput').value) || 0;
    const inputArt = parseFloat(document.getElementById('artScoreInput').value) || 0;

    // 1. Calculate Tag Affinity
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

    // 2. Normalize Baseline 
    // This represents the "Script Quality" before production
    let baselineScores = {};
    for(let demo in tagAffinity) {
        // Simple normalization for calculation purposes
        baselineScores[demo] = Math.min(1.0, Math.max(0, tagAffinity[demo] / 1.5)); 
    }

    const normalizedArt = inputArt / 10.0;
    const normalizedCom = inputCom / 10.0;

    // 3. Calculate Kinomark/Grades for Each Demographic
    let demoGrades = [];
    
    for(let demo in GAME_DATA.demographics) {
        const d = GAME_DATA.demographics[demo];
        const baseline = baselineScores[demo];

        // -- PART A: SATISFACTION (Drop Rate Logic) --
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

        // -- PART B: QUALITY --
        const qw = GAME_DATA.constants.KINOMARK.scoreWeights;
        const quality = (baseline * qw[0]) + (normalizedCom * qw[1]) + (normalizedArt * qw[2]);

        // -- PART C: FINAL SCORE --
        const aw = GAME_DATA.constants.KINOMARK.audienceWeight;
        let finalScore = (satisfaction * aw) + (quality * (1 - aw));

        // -- PART D: OVERRIDE FOR TAG MISMATCH --
        // Critical Fix: If Tag Affinity is low/negative (meaning they hate the content),
        // we force the grade to F, regardless of Quality score.
        if (tagAffinity[demo] <= 0.05) {
            finalScore = 0;
        }

        // -- PART E: DETERMINE GRADE INDEX --
        const thresholds = GAME_DATA.constants.KINOMARK.thresholds;
        let gradeIndex = 0;
        for (let i = 0; i < thresholds.length; i++) {
            if (finalScore >= thresholds[i]) {
                gradeIndex = i + 1; // 0-based index to 1-12 scale
            }
        }

        demoGrades.push({
            id: demo,
            name: d.name,
            score: finalScore,
            gradeIndex: gradeIndex,
            rawAffinity: tagAffinity[demo] 
        });
    }

    // Sort by Score Descending
    demoGrades.sort((a, b) => b.score - a.score);

    // 4. Filter for "Target Audience" (Only Mostly Enjoy / Grade B+)
    // Grade Indices: 0-3 (Red), 4-7 (Yellow), 8-12 (Green)
    const MOSTLY_ENJOY_THRESHOLD = 8; 
    
    const targetAudiences = demoGrades.filter(d => d.gradeIndex >= MOSTLY_ENJOY_THRESHOLD);

    // 5. UI Rendering
    document.getElementById('results-advertisers').classList.remove('hidden');
    const audienceContainer = document.getElementById('targetAudienceDisplay');
    audienceContainer.innerHTML = '';
    
    const getBadge = (idx) => {
        if(idx >= 12) return { l: 'S', c: 'grade-s' };
        if(idx >= 10) return { l: 'A', c: 'grade-a' };
        if(idx >= 8)  return { l: 'B', c: 'grade-b' };
        if(idx >= 6)  return { l: 'C', c: 'grade-c' };
        if(idx >= 4)  return { l: 'D', c: 'grade-d' };
        if(idx >= 2)  return { l: 'E', c: 'grade-e' };
        return { l: 'F', c: 'grade-f' };
    };

    if (targetAudiences.length > 0) {
        targetAudiences.forEach(d => {
            const badge = getBadge(d.gradeIndex);
            const row = document.createElement('div');
            row.className = 'audience-row';
            row.innerHTML = `
                <div class="aud-name">${d.name} <small>(${d.id})</small></div>
                <div class="aud-grade-box">
                    <div class="grade-bar-bg"><div class="grade-bar-fill ${badge.c}" style="width: ${Math.min(100, (d.score * 100))}%"></div></div>
                    <div class="grade-badge ${badge.c}">${badge.l}</div>
                </div>
            `;
            audienceContainer.appendChild(row);
        });
    } else {
        audienceContainer.innerHTML = `
            <div style="color: #aaa; font-style: italic; padding: 10px;">
                No audience fits the "Mostly Enjoy" criteria.<br>
                <small>Try changing tags or improving scores.</small>
            </div>
        `;
    }

    // 6. Advertisers Logic
    // Logic: Prioritize agents targeting the valid "Target Audiences".
    // If none exist, fallback to the top scorer (even if score is bad) just to show something.
    let targetsToConsider = [];
    if (targetAudiences.length > 0) {
        targetsToConsider = targetAudiences.map(t => t.id);
    } else {
        targetsToConsider = [demoGrades[0].id];
    }

    let movieLean = 0; 
    let leanText = "Balanced";
    if (inputArt > inputCom + 0.1) { movieLean = 1; leanText = "Artistic"; } 
    else if (inputCom > inputArt + 0.1) { movieLean = 2; leanText = "Commercial"; }

    let validAgents = GAME_DATA.adAgents.map(agent => {
        let score = 0;
        
        // Bonus for hitting targeted audiences
        targetsToConsider.forEach(targetId => {
            if (agent.targets.includes(targetId)) {
                score += 5; 
            }
        });

        // Penalty for wrong specialization
        if(agent.type !== 0 && agent.type !== movieLean) score -= 10;
        
        // Tie-breaker: Level
        score += agent.level;

        return { ...agent, score };
    }).filter(a => a.score > 0);

    validAgents.sort((a, b) => b.score - a.score);

    let agentHtml = "";
    if (validAgents.length === 0) {
        agentHtml = `<div style="color:red; padding:10px; font-size: 0.9em;">No effective advertisers found.</div>`;
    } else {
        agentHtml = validAgents.slice(0, 4).map(a => {
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

    // 7. Holiday Logic
    const primaryHolidayTarget = targetsToConsider[0];
    
    let bestHoliday = GAME_DATA.holidays.find(h => {
        if(Array.isArray(h.target)) return h.target.includes(primaryHolidayTarget);
        return h.target === primaryHolidayTarget || h.target === "ALL";
    });
    
    if(!bestHoliday) bestHoliday = { name: "None", bonus: "0%" };
    let bonusText = bestHoliday.name === "None" ? "No specific holiday synergy." : `${bestHoliday.bonus} Bonus Towards ${GAME_DATA.demographics[primaryHolidayTarget].name}`;

    document.getElementById('holidayDisplay').innerHTML = `
        <div style="color: #fff;">${bestHoliday.name}</div>
        <div class="holiday-bonus">${bonusText}</div>
    `;

    // 8. Campaign Duration Logic
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
    // Ensures a plus sign for positive numbers (except strictly 0 if you prefer)
    // Here we will use + for positive, - for negative, 0 for 0.
    if (Math.abs(num) < 0.005) return "0";
    return (num > 0 ? "+" : "") + num.toFixed(2);
}

function formatSimpleScore(num) {
    if (Math.abs(num) < 0.005) return "0";
    return (num > 0 ? "+" : "") + parseFloat(num);
}

function renderSynergyResults(matrix, genre) {
    document.getElementById('results-synergy').classList.remove('hidden');

    // --- 1. Top Section (Summary Row) ---
    // Average Compatibility
    const avgEl = document.getElementById('synergyAverageDisplay');
    avgEl.innerHTML = `${matrix.rawAverage.toFixed(1)} <span class="sub-value">/ 5.0</span>`;
    
    // Color coding for Average
    if (matrix.rawAverage >= 3.5) avgEl.style.color = 'var(--success)';
    else if (matrix.rawAverage < 2.5) avgEl.style.color = 'var(--danger)';
    else avgEl.style.color = '#fff';

    // Base Compatibility Score (Right side of top bar)
    const baseScoreEl = document.getElementById('synergyTotalDisplay');
    baseScoreEl.innerText = formatScore(matrix.totalScore);
    baseScoreEl.style.color = matrix.totalScore >= 0 ? 'var(--success)' : 'var(--danger)';

    // --- 2. Bottom Section (Breakdown) ---
    // Left Side Inputs
    const breakdownBase = document.getElementById('breakdownBaseScore');
    breakdownBase.innerText = formatScore(matrix.totalScore);
    breakdownBase.style.color = matrix.totalScore >= 0 ? 'var(--success)' : 'var(--danger)';

    const breakdownCom = document.getElementById('breakdownComBonus');
    const breakdownArt = document.getElementById('breakdownArtBonus');
    
    let genreComVal = 0;
    let genreArtVal = 0;

    if (genre) {
        genreComVal = genre.com;
        genreArtVal = genre.art;
        
        breakdownCom.innerText = formatSimpleScore(genreComVal);
        breakdownCom.style.color = genreComVal > 0 ? 'var(--success)' : (genreComVal < 0 ? 'var(--danger)' : '#fff');
        
        breakdownArt.innerText = formatSimpleScore(genreArtVal);
        breakdownArt.style.color = genreArtVal > 0 ? '#a0a0ff' : (genreArtVal < 0 ? 'var(--danger)' : '#fff');
    } else {
        breakdownCom.innerText = "0";
        breakdownCom.style.color = "#888";
        
        breakdownArt.innerText = "0";
        breakdownArt.style.color = "#888";
    }

    // Right Side Totals (Calculation)
    const totalCom = matrix.totalScore + genreComVal;
    const totalArt = matrix.totalScore + genreArtVal;

    const totalComEl = document.getElementById('totalComScore');
    totalComEl.innerText = formatScore(totalCom);
    totalComEl.style.color = 'var(--accent)'; // Gold for Commercial Total

    const totalArtEl = document.getElementById('totalArtScore');
    totalArtEl.innerText = formatScore(totalArt);
    totalArtEl.style.color = '#a0a0ff'; // Blue for Art Total

    // --- 3. Spoilers ---
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