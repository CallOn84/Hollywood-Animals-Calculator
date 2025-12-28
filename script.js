// script.js

const MULTI_SELECT_CATEGORIES = ["Genre", "Supporting Character", "Theme and Event"];

let searchIndex = [];

window.onload = function() {
    initializeSelectors();
    buildSearchIndex();
    setupSearchListener();
};

function formatTagName(rawName) {
    return rawName; 
}

function initializeSelectors() {
    const container = document.getElementById('selectors-container');
    container.innerHTML = '';

    GAME_DATA.categories.forEach(category => {
        const hasTags = Object.values(GAME_DATA.tags).some(t => 
            t.category && t.category.toLowerCase() === category.toLowerCase()
        );

        if (!hasTags) return;

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
            addBtn.title = "Add another " + category;
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

function addDropdown(category, selectedValue = null) {
    const containerId = `inputs-${category.replace(/\s/g, '-')}`;
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!MULTI_SELECT_CATEGORIES.includes(category) && container.children.length > 0) {
        const select = container.querySelector('select');
        if (selectedValue) select.value = selectedValue;
        return;
    }

    const tagsInCategory = Object.keys(GAME_DATA.tags).filter(tagKey => {
        return GAME_DATA.tags[tagKey].category && 
               GAME_DATA.tags[tagKey].category.toLowerCase() === category.toLowerCase();
    }).sort();

    const row = document.createElement('div');
    row.className = 'select-row';

    const select = document.createElement('select');
    select.className = 'tag-selector';
    select.dataset.category = category;

    const defOpt = document.createElement('option');
    defOpt.value = "";
    defOpt.innerText = selectedValue ? "-- Select --" : `-- Select ${category} --`;
    select.appendChild(defOpt);

    tagsInCategory.forEach(tagKey => {
        const opt = document.createElement('option');
        opt.value = tagKey;
        opt.innerText = formatTagName(tagKey);
        select.appendChild(opt);
    });

    if (selectedValue) {
        select.value = selectedValue;
    }

    row.appendChild(select);

    if (MULTI_SELECT_CATEGORIES.includes(category)) {
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '×';
        removeBtn.title = 'Remove';
        removeBtn.onclick = () => row.remove();
        row.appendChild(removeBtn);
    }

    container.appendChild(row);
}

function buildSearchIndex() {
    searchIndex = Object.keys(GAME_DATA.tags).map(key => {
        return {
            id: key,
            name: formatTagName(key),
            category: GAME_DATA.tags[key].category
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
        if (MULTI_SELECT_CATEGORIES.includes(category)) {
            addDropdown(category, tagObj.id);
        } else {
            if (selects.length > 0) selects[0].value = tagObj.id;
        }
    }
    
    const group = document.getElementById(`group-${category.replace(/\s/g, '-')}`);
    group.style.borderColor = '#d4af37';
    setTimeout(() => group.style.borderColor = 'transparent', 500);
}

function analyzeMovie() {
    const selectedTags = [];
    
    document.querySelectorAll('.tag-selector').forEach(sel => {
        if(sel.value) selectedTags.push(sel.value);
    });

    if(selectedTags.length === 0) {
        alert("Please select at least one tag.");
        return;
    }

    let scores = { "YM": 0, "YF": 0, "TM": 0, "TF": 0, "AM": 0, "AF": 0 };
    let artTotal = 0;
    let comTotal = 0;

    selectedTags.forEach(tagId => {
        const tagData = GAME_DATA.tags[tagId];
        if(!tagData) return;

        for(let demo in scores) {
            if(tagData.weights[demo]) {
                scores[demo] += parseFloat(tagData.weights[demo]);
            }
        }
        artTotal += parseFloat(tagData.art || 0);
        comTotal += parseFloat(tagData.com || 0);
    });

    let weightedScores = {};
    for(let demo in scores) {
        weightedScores[demo] = scores[demo] * GAME_DATA.demographics[demo].weight;
    }

    let winner = Object.keys(weightedScores).reduce((a, b) => weightedScores[a] > weightedScores[b] ? a : b);
    
    let movieLean = 0; 
    let leanText = "Balanced";
    
    if (artTotal > comTotal + 0.1) {
        movieLean = 1;
        leanText = "Artistic";
    } else if (comTotal > artTotal + 0.1) {
        movieLean = 2;
        leanText = "Commercial";
    }

    let validAgents = GAME_DATA.adAgents.filter(agent => {
        return agent.targets.includes(winner) && (agent.type === movieLean || agent.type === 0);
    });

    if(validAgents.length === 0) {
        validAgents = GAME_DATA.adAgents.filter(agent => {
            return agent.targets.includes(winner) && agent.type === 0;
        });
    }

    let bestHoliday = GAME_DATA.holidays.find(h => {
        if(Array.isArray(h.target)) return h.target.includes(winner);
        return h.target === winner;
    });
    
    if(!bestHoliday) bestHoliday = { name: "Christmas or Any Generic Window", bonus: "Standard" };

    document.getElementById('results').classList.remove('hidden');
    
    document.getElementById('targetAudienceDisplay').innerHTML = `
        <span style="font-size: 1.8em; color: #ffd700; font-weight: 800;">${GAME_DATA.demographics[winner].name}</span>
        <span style="color: #888; margin-left: 10px;">(${winner})</span><br>
        <div style="margin-top: 5px; color: #fff;">Weighted Score: <strong>${weightedScores[winner].toFixed(2)}</strong></div>
    `;

    document.getElementById('movieLeanDisplay').innerText = leanText;

    let agentHtml = validAgents.map(a => 
        `<div style="padding: 5px 0; border-bottom: 1px solid #333;">${a.name}</div>`
    ).join('');
    if(!agentHtml) agentHtml = "Nate Sparrow Press (Fallback)";
    document.getElementById('adAgentDisplay').innerHTML = agentHtml;

    document.getElementById('holidayDisplay').innerHTML = `
        <div style="font-size: 1.2em; font-weight: bold; color: #fff;">${bestHoliday.name}</div>
        <div style="color: #d4af37;">Bonus: ${bestHoliday.bonus}</div>
    `;
    
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}