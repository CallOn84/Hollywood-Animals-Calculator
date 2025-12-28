// script.js

window.onload = function() {
    const container = document.getElementById('selectors-container');
    const allTags = GAME_DATA.tags;

    GAME_DATA.categories.forEach(category => {
        
        const tagsInCategory = Object.keys(allTags).filter(tagKey => {
            return allTags[tagKey].category && 
                   allTags[tagKey].category.toLowerCase() === category.toLowerCase();
        });

        if (tagsInCategory.length === 0) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'input-group';

        const label = document.createElement('label');
        label.innerText = category;
        
        const select = document.createElement('select');
        select.className = 'tag-selector';
        select.dataset.category = category;

        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.innerText = "-- Select " + category + " --";
        select.appendChild(defaultOption);

        tagsInCategory.sort((a, b) => a.localeCompare(b));

        tagsInCategory.forEach(tagKey => {
            const opt = document.createElement('option');
            opt.value = tagKey;
            
            opt.innerText = tagKey; 
            
            select.appendChild(opt);
        });

        wrapper.appendChild(label);
        wrapper.appendChild(select);
        container.appendChild(wrapper);
    });
};

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
        <span style="font-size: 1.5em; color: #ffd700;">${GAME_DATA.demographics[winner].name} (${winner})</span><br>
        <small>Weighted Score: ${weightedScores[winner].toFixed(2)}</small>
    `;

    document.getElementById('movieLeanDisplay').innerText = leanText;

    let agentHtml = validAgents.map(a => `• ${a.name}`).join('<br>');
    if(!agentHtml) agentHtml = "No perfect match found. Use Nate Sparrow Press.";
    document.getElementById('adAgentDisplay').innerHTML = agentHtml;

    document.getElementById('holidayDisplay').innerHTML = `
        <strong>${bestHoliday.name}</strong><br>
        Bonus: ${bestHoliday.bonus}
    `;
}
