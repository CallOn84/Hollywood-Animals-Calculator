const GAME_DATA = {

    demographics: {
        "TM": { 
            name: "Teen Male", 
            baseWeight: 0.150, artWeight: 0.050, comWeight: 0.200, 
            baseDefault: 0.100 
        },
        "TF": { 
            name: "Teen Female", 
            baseWeight: 0.150, artWeight: 0.050, comWeight: 0.200, 
            baseDefault: 0.100 
        },
        "YM": { 
            name: "Young Male", 
            baseWeight: 0.300, artWeight: 0.400, comWeight: 0.250, 
            baseDefault: 0.100 
        },
        "YF": { 
            name: "Young Female", 
            baseWeight: 0.300, artWeight: 0.300, comWeight: 0.250, 
            baseDefault: 0.100 
        },
        "AM": { 
            name: "Adult Male", 
            baseWeight: 0.050, artWeight: 0.100, comWeight: 0.100, 
            baseDefault: 0.100 
        },
        "AF": { 
            name: "Adult Female", 
            baseWeight: 0.050, artWeight: 0.100, comWeight: 0.100, 
            baseDefault: 0.100 
        }
    },

    adAgents: [
        { name: "NBG", targets: ["AM", "AF"], type: 0, budgetFactor: 1.0 },
        { name: "Ross&Ross Bros.", targets: ["AM", "AF"], type: 0, budgetFactor: 1.0 },
        { name: "Vien Pascal", targets: ["YM", "YF", "AM", "AF"], type: 1, budgetFactor: 1.5 },
        { name: "Spark", targets: ["YM", "YF", "AM", "AF"], type: 2, budgetFactor: 2.5 },
        { name: "Nate Sparrow Press", targets: ["YM", "YF", "AM", "AF"], type: 0, budgetFactor: 1.0 },
        { name: "Velvet Gloss", targets: ["TF", "YF", "AF"], type: 2, budgetFactor: 2.5 },
        { name: "Pierre Zola Company", targets: ["TM", "TF", "YM", "YF", "AM", "AF"], type: 1, budgetFactor: 1.5 },
        { name: "Spice Mice", targets: ["TM", "TF", "YM", "YF"], type: 2, budgetFactor: 2.0 }
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