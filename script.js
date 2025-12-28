const MULTI_SELECT_CATEGORIES = ["Genre", "Supporting Character", "Theme & Event"];
let searchIndex = [];

const ALL_AUDIENCE = 30000000; 
const ADS_BUDGET_BASE = 50000; 
const ADS_EFFICIENCY_TIERS = [0.15, 0.30, 0.50]; 
const ADS_CAMPAIGN_EFFICIENCY_GRAPHIC = [0.25, 0.45, 0.60, 0.70, 0.80, 0.90, 0.95, 1.00, 1.00, 0.95, 0.90, 0.85, 0.75, 0.60, 0.30, 0.10];
const ADS_CAMPAIGN_DROP_GRAPHIC = [0.95, 0.85, 0.70, 0.20];
const MAX_PHYSICAL_CAPACITY = 2400000; 

window.onload = async function() {
    try {
        await loadExternalData();
        initializeSelectors();
        buildSearchIndex();
        setupSearchListener();
        setupControlsListeners(); 
    } catch (error) {
        console.error("Failed to load data:", error);
    }
};

async function loadExternalData() {
    const [tagRes, weightRes] = await Promise.all([
        fetch('data/TagData.json'),
        fetch('data/TagsAudienceWeights.json')
    ]);

    if (!tagRes.ok || !weightRes.ok) throw new Error("File not found");

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
            base: (parseFloat(data.artValue || 0) + parseFloat(data.commercialValue || 0)) / 2, 
            weights: parseWeights(weightDataRaw[tagId].weights)
        };
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
    return name.replace(/_/g, ' ').toLowerCase()
               .split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
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

    if (MULTI_SELECT_CATEGORIES.includes(category)) {
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '×';
        removeBtn.onclick = () => row.remove();
        row.appendChild(removeBtn);
    }
    container.appendChild(row);
}

function buildSearchIndex() {
    searchIndex = Object.values(GAME_DATA.tags).map(tag => ({
        id: tag.id, name: tag.name, category: tag.category
    }));
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
        if (e.target !== input && e.target !== resultsBox) resultsBox.classList.add('hidden');
    });
}

function setupControlsListeners() {
    const radios = document.querySelectorAll('input[name="ticketPrice"]');
    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (!document.getElementById('results').classList.contains('hidden')) {
                analyzeMovie();
            }
        });
    });

    const inputs = ['artInput', 'comInput'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.addEventListener('input', () => {
                if (parseFloat(el.value) > 10) el.value = 10;
                if (!document.getElementById('results').classList.contains('hidden')) {
                    analyzeMovie();
                }
            });
        }
    });
}

function selectTagFromSearch(tagObj) {
    const category = tagObj.category;
    const containerId = `inputs-${category.replace(/\s/g, '-')}`;
    const container = document.getElementById(containerId);
    if (!container) return;

    const selects = container.querySelectorAll('select');
    let filled = false;
    for (let select of selects) {
        if (select.value === "") {
            select.value = tagObj.id;
            filled = true;
            break;
        }
    }
    if (!filled) {
        if (MULTI_SELECT_CATEGORIES.includes(category)) addDropdown(category, tagObj.id);
        else if (selects.length > 0) selects[0].value = tagObj.id;
    }
    const group = document.getElementById(`group-${category.replace(/\s/g, '-')}`);
    if (group) {
        group.style.borderColor = '#d4af37';
        setTimeout(() => group.style.borderColor = '', 500);
        group.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function analyzeMovie() {
    const selectedTags = [];
    document.querySelectorAll('.tag-selector').forEach(sel => {
        if(sel.value) selectedTags.push(sel.value);
    });

    if(selectedTags.length === 0) {
        if(event && event.type === 'click') alert("Please select at least one tag.");
        return;
    }

    let demoScores = { "YM": 0, "YF": 0, "TM": 0, "TF": 0, "AM": 0, "AF": 0 };

    selectedTags.forEach(tagId => {
        const tagData = GAME_DATA.tags[tagId];
        if(!tagData) return;
        for(let demo in demoScores) {
            if(tagData.weights[demo]) {
                demoScores[demo] += tagData.weights[demo];
            }
        }
    });

    let weightedScores = {};
    for(let demoKey in demoScores) {
        weightedScores[demoKey] = demoScores[demoKey] * GAME_DATA.demographics[demoKey].baseWeight;
    }
    let winner = Object.keys(weightedScores).reduce((a, b) => weightedScores[a] > weightedScores[b] ? a : b);

    const artScore = parseFloat(document.getElementById('artInput').value) || 0;
    const comScore = parseFloat(document.getElementById('comInput').value) || 0;
    const ticketPrice = parseFloat(document.querySelector('input[name="ticketPrice"]:checked').value);

    let movieLean = 0; 
    let leanText = "Balanced";
    if (artScore > comScore + 0.5) {
        movieLean = 1; 
        leanText = "Artistic";
    } else if (comScore > artScore + 0.5) {
        movieLean = 2; 
        leanText = "Commercial";
    }

    let validAgents = GAME_DATA.adAgents.filter(agent => {
        return agent.targets.includes(winner);
    });
    if(validAgents.length === 0) validAgents = GAME_DATA.adAgents;

    let bestAgent = null;
    let bestResult = { weeks: 0, netProfit: -Infinity };

    validAgents.forEach(agent => {
        const result = estimateAdDuration(artScore, comScore, ticketPrice, movieLean, agent);
        
        if (result.netProfit > bestResult.netProfit) {
            bestResult = result;
            bestAgent = agent;
        }
    });

    if (!bestAgent || bestResult.netProfit === -Infinity) {
        bestAgent = validAgents[0];
        const fallbackCost = ADS_BUDGET_BASE * bestAgent.budgetFactor;
        bestResult = { weeks: 0, netProfit: 0, weeklyCost: fallbackCost };
    }

    displayResults(winner, weightedScores, leanText, movieLean, bestResult, bestAgent);
}

function estimateAdDuration(artScore, comScore, ticketPrice, movieLean, agent) {
    let optimalWeeks = 0;
    let cumulativeProfit = 0;
    const maxWeeks = 16; 

    const maxScore = Math.max(artScore, comScore);
    let occupancyPercent = maxScore / 10; 
    let totalBaseAudience = MAX_PHYSICAL_CAPACITY * occupancyPercent;

    const weeklyAdCost = ADS_BUDGET_BASE * agent.budgetFactor;
    const agentEfficiencyBase = ADS_EFFICIENCY_TIERS[agent.type];

    let decayRate = 0.90;
    if (movieLean === 1) decayRate = 0.95;
    if (movieLean === 2) decayRate = 0.85;

    for (let week = 0; week < maxWeeks; week++) {
        const organicDecayMultiplier = Math.pow(decayRate, week);
        const organicAudience = totalBaseAudience * organicDecayMultiplier;

        let graphicValue = 0;
        if (week < ADS_CAMPAIGN_EFFICIENCY_GRAPHIC.length) {
            graphicValue = ADS_CAMPAIGN_EFFICIENCY_GRAPHIC[week];
        }
        const adBoostFactor = agentEfficiencyBase * graphicValue;

        const revenueNoAd = organicAudience * ticketPrice;
        const audienceWithAd = organicAudience * (1 + adBoostFactor);
        const revenueWithAd = audienceWithAd * ticketPrice;

        const marginalGain = revenueWithAd - revenueNoAd;
        const netWeekProfit = marginalGain - weeklyAdCost;

        if (marginalGain > weeklyAdCost) {
            optimalWeeks = week + 1;
            cumulativeProfit += netWeekProfit;
        } else {
            break; 
        }
    }

    return {
        weeks: optimalWeeks,
        ticketPrice: ticketPrice,
        decay: decayRate,
        weeklyCost: weeklyAdCost,
        netProfit: cumulativeProfit
    };
}

function displayResults(winner, weightedScores, leanText, movieLean, adResult, bestAgent) {
    document.getElementById('results').classList.remove('hidden');

    document.getElementById('targetAudienceDisplay').innerHTML = `
        <span style="font-size: 1.8em; color: #ffd700; font-weight: 800;">${GAME_DATA.demographics[winner].name}</span>
        <span style="color: #888; margin-left: 10px;">(${winner})</span><br>
        <div style="margin-top: 5px; color: #fff;">Weighted Score: <strong>${weightedScores[winner].toFixed(2)}</strong></div>
    `;

    document.getElementById('movieLeanDisplay').innerText = leanText;
    document.getElementById('adAgentDisplay').innerHTML = `
        <div style="font-size: 1.1em; font-weight: bold; color: white;">${bestAgent.name}</div>
        <div style="font-size: 0.85em; color: #888;">Tier ${bestAgent.type} • Targets: ${bestAgent.targets.join(', ')}</div>
    `;

    let bestHoliday = GAME_DATA.holidays.find(h => {
        if(Array.isArray(h.target)) return h.target.includes(winner);
        return h.target === winner;
    });
    if(!bestHoliday) bestHoliday = { name: "Christmas or Generic Window", bonus: "Standard" };
    
    document.getElementById('holidayDisplay').innerHTML = `
        <div style="font-size: 1.2em; font-weight: bold; color: #fff;">${bestHoliday.name}</div>
        <div style="color: #d4af37;">Bonus: ${bestHoliday.bonus}</div>
    `;

    const durationBox = document.getElementById('adDurationDisplay');
    
    if (adResult.weeks > 0) {
        durationBox.innerHTML = `
            <div class="duration-layout">
                <div class="duration-main">
                    <span class="big-number">${adResult.weeks}</span>
                    <span class="big-unit">Weeks</span>
                </div>
                <div class="duration-details">
                    <div class="detail-block">
                        <span class="detail-label">Ticket Strategy</span>
                        <span class="detail-val">$${adResult.ticketPrice.toFixed(2)}</span>
                    </div>
                    <div class="detail-block">
                        <span class="detail-label">Weekly Ad Cost</span>
                        <span class="detail-val">$${adResult.weeklyCost.toLocaleString()}</span>
                    </div>
                    <div class="detail-block">
                        <span class="detail-label">Est. Net Profit</span>
                        <span class="detail-val profit-val">+$${adResult.netProfit.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                    </div>
                </div>
            </div>
        `;
    } else {
        const displayCost = adResult.weeklyCost ? adResult.weeklyCost.toLocaleString() : "Unknown";
        
        durationBox.innerHTML = `
            <div class="warning-box">
                <span class="warning-icon">⚠️</span>
                <span class="warning-title">Do Not Advertise</span>
                <div style="font-size: 0.9em; color: #aaa; margin-top:5px;">
                    Projected revenue gain is lower than the advertising cost.<br>
                    (Lowest cost option: $${displayCost})
                </div>
            </div>
        `;
    }

    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}