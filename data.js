// data.js

const GAME_DATA = {
    
    constants: {
        POPULATION: 30000000, // 30 Million Total Population
        AD_EFFICIENCY: {
            1: 0.15, // Level 1 (Quality 0) = 15% Reach
            2: 0.30, // Level 2 (Quality 1) = 30% Reach
            3: 0.50  // Level 3 (Quality 2) = 50% Reach
        }
    },

    demographics: {
        "YM": { name: "Young Male", weight: 0.30 },
        "YF": { name: "Young Female", weight: 0.30 },
        "TM": { name: "Teen Male", weight: 0.15 },
        "TF": { name: "Teen Female", weight: 0.15 },
        "AM": { name: "Adult Male", weight: 0.05 },
        "AF": { name: "Adult Female", weight: 0.05 }
    },

    // Agent Types: 0 = Universal, 1 = Artistic, 2 = Commercial
    // Levels: 1, 2, 3 (Determines Efficiency)
    adAgents: [
        { name: "NBG", targets: ["AM", "AF"], type: 0, level: 3 },
        { name: "Ross&Ross Bros.", targets: ["AM", "AF"], type: 0, level: 2 },
        { name: "Vien Pascal", targets: ["TM", "TF", "AM", "AF"], type: 1, level: 2 },
        { name: "Spark", targets: ["YM", "YF", "AM", "AF"], type: 2, level: 3 },
        { name: "Nate Sparrow Press", targets: ["YM", "YF", "AM", "AF"], type: 0, level: 3 },
        { name: "Velvet Gloss", targets: ["TF", "YF", "AF"], type: 2, level: 3 },
        { name: "Pierre Zola Company", targets: ["TM", "YM", "AM"], type: 0, level: 2 }, 
        { name: "Spice Mice", targets: ["TM", "TF", "YM", "YF"], type: 2, level: 2 }
    ],

    holidays: [
        { name: "Valentine's Day", target: "YF", bonus: "30%" },
        { name: "Halloween", target: ["TM", "TF", "YM"], bonus: "18-22%" },
        { name: "Thanksgiving", target: ["AM", "AF"], bonus: "22%" },
        { name: "Independence Day", target: "AM", bonus: "18%" },
        { name: "Christmas", target: "ALL", bonus: "10-15%" },
        { name: "Memorial Day", target: ["YM", "AM"], bonus: "16-18%" }
    ],

    categories: [
        "Genre", 
        "Setting", 
        "Protagonist", 
        "Antagonist", 
        "Supporting Character", 
        "Theme & Event", 
        "Finale"
    ],

    tags: {} 
};