// data.js

const GAME_DATA = {
    
    demographics: {
        "YM": { name: "Young Male", weight: 0.30 },
        "YF": { name: "Young Female", weight: 0.30 },
        "TM": { name: "Teen Male", weight: 0.15 },
        "TF": { name: "Teen Female", weight: 0.15 },
        "AM": { name: "Adult Male", weight: 0.05 },
        "AF": { name: "Adult Female", weight: 0.05 }
    },

    adAgents: [
        { name: "NBG", targets: ["AM", "AF"], type: 0 },
        { name: "Ross&Ross Bros.", targets: ["AM", "AF"], type: 0 },
        { name: "Vien Pascal", targets: ["YM", "YF", "AM", "AF"], type: 1 },
        { name: "Spark", targets: ["YM", "YF", "AM", "AF"], type: 2 },
        { name: "Nate Sparrow Press", targets: ["YM", "YF", "AM", "AF"], type: 0 },
        { name: "Velvet Gloss", targets: ["TF", "YF", "AF"], type: 2 },
        { name: "Pierre Zola Company", targets: ["TM", "TF", "YM", "YF", "AM", "AF"], type: 1 },
        { name: "Spice Mice", targets: ["TM", "TF", "YM", "YF"], type: 2 }
    ],

    holidays: [
        { name: "Valentine's Day (Feb 14)", target: "YF", bonus: "30%" },
        { name: "Halloween (Oct 31)", target: ["TM", "TF", "YM"], bonus: "18-22%" },
        { name: "Thanksgiving (Late Nov)", target: ["AM", "AF"], bonus: "22%" },
        { name: "Independence Day (July 4)", target: "AM", bonus: "18%" },
        { name: "Christmas (Dec 25)", target: "ALL", bonus: "10-15%" },
        { name: "Memorial Day (May)", target: ["YM", "AM"], bonus: "16-18%" }
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