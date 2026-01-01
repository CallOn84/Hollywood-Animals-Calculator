// data.js

const GAME_DATA = {
    
    constants: {
        POPULATION: 30000000, 
        KINOMARK: {
            audienceWeight: 0.4, 
            scoreWeights: [0.25, 0.5, 0.25], 
            thresholds: [0.16, 0.23, 0.30, 0.37, 0.44, 0.51, 0.58, 0.65, 0.72, 0.79, 0.86, 0.93] 
        },
        // Constants for the Movie Distribution Calculator
        DISTRIBUTION: {
            multipliers: {
                WEEK_ONE: 2,
                WEEK_TWO: 1,
                BASE: 1000
            },
            weeklyCalculation: {
                NUMBER_OF_WEEKS: 8,
                WEEKLY_REDUCTION_RATE: 0.8,
                REDUCTION_START_INDEX: 2
            },
            rounding: {
                ROUND_UP_UNTIL_INDEX: 4
            },
            defaults: {
                AVAILABLE_SCREENINGS: 3200
            }
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
            bonuses: { "TM": 7, "TF": 15, "YM": 12, "YF": 30, "AM": 15, "AF": 0 }
        },
        { 
            name: "Halloween", 
            bonuses: { "TM": 22, "TF": 22, "YM": 18, "YF": 18, "AM": 15, "AF": 15 }
        },
        { 
            name: "Thanksgiving", 
            bonuses: { "TM": 7, "TF": 7, "YM": 15, "YF": 15, "AM": 22, "AF": 22 }
        },
        { 
            name: "Independence Day", 
            bonuses: { "TM": 9, "TF": 0, "YM": 13, "YF": 5, "AM": 18, "AF": 7 }
        },
        { 
            name: "Christmas", 
            bonuses: { "TM": 15, "TF": 15, "YM": 15, "YF": 15, "AM": 10, "AF": 10 }
        },
        { 
            name: "Memorial Day", 
            bonuses: { "TM": 9, "TF": 0, "YM": 16, "YF": 5, "AM": 18, "AF": 7 }
        }
    ],

    categories: [
        "Genre", "Setting", "Protagonist", "Antagonist", "Supporting Character", "Theme & Event", "Finale"
    ],

    starterWhitelist: [
        // Genre
        "ACTION", "COMEDY", "DRAMA", "ROMANCE", "ADVENTURE", "DETECTIVE", "HISTORICAL", "THRILLER",
        
        // Setting
        "FANTASY_KINGDOM", "MODERN_AMERICAN_CITY", "TROPICAL_ISLAND",

        // Protagonist
        "PROTAGONIST_CLUMSY_OAF", "PROTAGONIST_COP", "PROTAGONIST_COWBOY", "PROTAGONIST_DARING_ADVENTURER",
        "PROTAGONIST_DETECTIVE", "PROTAGONIST_HOPELESS_ROMANTIC", "PROTAGONIST_KNIGHT", "PROTAGONIST_WORKING_MAN",

        // Antagonist
        "ANTAGONIST_BANDIT", "ANTAGONIST_CRIMINAL_MASTERMIND", "ANTAGONIST_EVIL_MONSTER", 
        "ANTAGONIST_EVIL_WITCH", "ANTAGONIST_MURDERER", "ANTAGONIST_SERIAL_KILLER", "ANTAGONIST_TRIBAL_CHIEF",

        // Supporting Character
        "SUPPORTINGCHARACTER_ANGRY_BOSS", "SUPPORTINGCHARACTER_DAMSEL_IN_DISTRESS", "SUPPORTINGCHARACTER_FEMME_FATALE",
        "SUPPORTINGCHARACTER_LOVE_INTEREST", "SUPPORTINGCHARACTER_MENTOR", "SUPPORTINGCHARACTER_RIVAL",
        "SUPPORTINGCHARACTER_SIDEKICK", "SUPPORTINGCHARACTER_STRICT_PARENT",

        // Theme & Event
        "EVENTS_ANCIENT_PUZZLE", "THEME_AVENGING_LOVED_ONES", "EVENTS_BANK_ROBBERY", "EVENTS_JOUSTING_TOURNAMENT",
        "THEME_LOVE_TRIANGLE", "EVENTS_PRISON_BREAK", "THEME_SEARCH_KILLER", "EVENTS_SHOOTOUT",
        "THEME_SLAPSTICK_MAYHEM", "THEME_STRUGGLE_FOR_BETTER_LIFE", "THEME_TREASURE_HUNT", 
        "THEME_UNREQUITED_LOVE", "THEME_WINNING_THE_BELOVED",

        // Finale
        "FINALE_ANTAGONIST_GETS_KILLED", "FINALE_ANTAGONIST_GETS_PUNISHED", "FINALE_ANTAGONIST_REPENTS",
        "FINALE_PROTAGONIST_DIES_HEROICALLY", "FINALE_PROTAGONIST_FINDS_TREASURE", 
        "FINALE_PROTAGONIST_GETS_CHANCE_FOR_BETTER_LIFE", "FINALE_PROTAGONIST_OVERCAME_SELFDOUBT",
        "FINALE_PROTAGONIST_RESCUES_HOSTAGE", "FINALE_SWEETHEARTS_STAY_TOGETHER"
    ],

    tags: {},
    compatibility: {},
    genrePairs: {}
};