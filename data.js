// data.js

const GAME_DATA = {
    
    constants: {
        POPULATION: 30000000, 
        KINOMARK: {
            audienceWeight: 0.4, 
            scoreWeights: [0.25, 0.5, 0.25], 
            thresholds: [0.16, 0.23, 0.30, 0.37, 0.44, 0.51, 0.58, 0.65, 0.72, 0.79, 0.86, 0.93] 
        }
    },

    demographics: {
        "YM": { 
            name: "Young Men",
            baseW: 0.300, artW: 0.400, comW: 0.250,
            baseD: 0.100, artD: 0.050, comD: 0.050
        },
        "YF": { 
            name: "Young Women",
            baseW: 0.300, artW: 0.300, comW: 0.250,
            baseD: 0.100, artD: 0.050, comD: 0.050
        },
        "TM": { 
            name: "Boys",
            baseW: 0.150, artW: 0.050, comW: 0.200,
            baseD: 0.100, artD: 0.050, comD: 0.050
        },
        "TF": { 
            name: "Girls",
            baseW: 0.150, artW: 0.050, comW: 0.200,
            baseD: 0.100, artD: 0.050, comD: 0.050
        },
        "AM": { 
            name: "Men",
            baseW: 0.050, artW: 0.100, comW: 0.100,
            baseD: 0.100, artD: 0.050, comD: 0.050
        },
        "AF": { 
            name: "Women",
            baseW: 0.050, artW: 0.100, comW: 0.100,
            baseD: 0.100, artD: 0.050, comD: 0.050
        }
    },

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
        {
            name: "Valentine's Day",
            bonuses: { "YF": 0.30, "AM": 0.15, "TF": 0.15, "YM": 0.12, "TM": 0.07 }
        },
        {
            name: "Halloween",
            bonuses: { "TM": 0.22, "TF": 0.22, "YM": 0.18, "YF": 0.18, "AM": 0.15, "AF": 0.15 }
        },
        {
            name: "Thanksgiving",
            bonuses: { "AM": 0.22, "AF": 0.22, "YM": 0.15, "YF": 0.15, "TM": 0.07, "TF": 0.07 }
        },
        {
            name: "Independence Day",
            bonuses: { "AM": 0.18, "YM": 0.13, "TM": 0.09, "AF": 0.07, "YF": 0.05 }
        },
        {
            name: "Christmas",
            bonuses: { "TM": 0.15, "TF": 0.15, "YM": 0.15, "YF": 0.15, "AM": 0.10, "AF": 0.10 }
        },
        {
            name: "Memorial Day",
            bonuses: { "AM": 0.18, "YM": 0.16, "TM": 0.09, "AF": 0.07, "YF": 0.05 }
        }
    ],

    categories: [
        "Genre", "Setting", "Protagonist", "Antagonist", "Supporting Character", "Theme & Event", "Finale"
    ],

    tags: {},
    compatibility: {},
    genrePairs: {}
};