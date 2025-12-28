// data.js

const GAME_DATA = {
    demographics: {
        "YM": { name: "Young Male", weight: 0.30 },
        "YF": { name: "Young Female", weight: 0.30 },
        "TM": { name: "Teen Male", weight: 0.15 },
        "TF": { name: "Teen Female", weight: 0.15 },
        "AM": { name: "Adult Male", weight: 0.05 },
        "AF": { name: "Adult Male", weight: 0.05 },
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
        "Theme and Event", 
        "Finale"
    ],

    tags: {
        "Action": {
            category: "Genre", art: -0.05, com: 0.30,
            weights: { TF: 3, TM: 5, YF: 2, YM: 5, AF: 1, AM: 4 } 
        },
        "Adventure": {
            category: "Genre", art: -0.05, com: 0.20,
            weights: { TF: 4, TM: 5, YF: 4, YM: 5, AF: 3, AM: 3 } 
        },
        "Comedy": {
            category: "Genre", art: -0.10, com: 0.30,
            weights: { TF: 4, TM: 4, YF: 3, YM: 3, AF: 3, AM: 3 } 
        },
       "Detective": {
            category: "Genre", art: -0.10, com: 0.20,
            weights: { TF: 2, TM: 4, YF: 2, YM: 4, AF: 3, AM: 4 } 
        },
        "Drama": {
            category: "Genre", art: 0.02, com: 0.10,
            weights: { TF: -3, TM: -3, YF: 2, YM: 1, AF: 4, AM: 3 } 
        },
        "Historical": {
            category: "Genre", art: 0.30, com: -0.10,
            weights: { TF: -3, TM: -3, YF: 3, YM: 3, AF: 5, AM: 4 } 
        },
        "Horror": {
            category: "Genre", art: -0.10, com: 0.10,
            weights: { TF: -1, TM: 3, YF: 1, YM: 4, AF: -3, AM: -2 } 
        },
        "Romance": {
            category: "Genre", art: 0.20, com: 0.10,
            weights: { TF: 3, TM: -1, YF: 5, YM: 2, AF: 5, AM: 1 } 
        },
        "Science Fiction": {
            category: "Genre", art: 0.10, com: 0.10,
            weights: { TF: 3, TM: 5, YF: 2, YM: 5, AF: 1, AM: 3 } 
        },
        "Thriller": {
            category: "Genre", art: 0.00, com: 0.10,
            weights: { TF: 1, TM: 1, YF: 3, YM: 4, AF: 4, AM: 4 } 
        },
        "American Civil War": {
            category: "Setting", art: 0.05, com: 0.00,
            weights: { TF: -2, TM: -2, YF: 0, YM: 2, AF: 1, AM: 2 } 
        },
        "Ancient China": {
            category: "Setting", art: 0.20, com: 0.00,
            weights: { TF: -1, TM: -1, YF: 0, YM: 0, AF: 0, AM: 0 } 
        },
        "Ancient Egypt": {
            category: "Setting", art: 0.00, com: 0.05,
            weights: { TF: 0, TM: 1, YF: 0, YM: 1, AF: 1, AM: 1 } 
        },
        "Ancient Egypt": {
            category: "Setting", art: 0.00, com: 0.05,
            weights: { TF: 0, TM: 1, YF: 0, YM: 1, AF: 1, AM: 1 } 
        },
        "Ancient Greece": {
            category: "Setting", art: 0.05, com: 0.00,
            weights: { TF: 0, TM: 1, YF: 0, YM: 0, AF: 1, AM: 1 } 
        },
        "Ancient Rome": {
            category: "Setting", art: 0.05, com: 0.00,
            weights: { TF: 0, TM: 2, YF: 0, YM: 1, AF: 1, AM: 1 } 
        },
        "Arthurian Legends": {
            category: "Setting", art: -0.10, com: 0.20,
            weights: { TF: 3, TM: 4, YF: 2, YM: 3, AF: 1, AM: 2 } 
        },
        "Caribbean": {
            category: "Setting", art: 0.05, com: 0.20,
            weights: { TF: 0, TM: 1, YF: 0, YM: 1, AF: 0, AM: 0 } 
        },
        "Dystopian Futuristic City": {
            category: "Setting", art: 0.05, com: 0.10,
            weights: { TF: -2, TM: 1, YF: -1, YM: 2, AF: -1, AM: 1 } 
        },
        "Fantasy Kingdom": {
            category: "Setting", art: 0.00, com: 0.20,
            weights: { TF: 5, TM: 5, YF: 2, YM: 2, AF: -1, AM: -3 } 
        },
        "Feudal Japan": {
            category: "Setting", art: 0.10, com: 0.00,
            weights: { TF: 0, TM: 2, YF: 0, YM: 1, AF: 0, AM: 0 } 
        },
        "Free States in Slavery Era": {
            category: "Setting", art: 0.05, com: 0.10,
            weights: { TF: -2, TM: -2, YF: 0, YM: 0, AF: 1, AM: 2 } 
        },
        "Great War": {
            category: "Setting", art: 0.10, com: 0.00,
            weights: { TF: -3, TM: -2, YF: -1, YM: -1, AF: 2, AM: 2 } 
        },
        "Middle Ages": {
            category: "Setting", art: 0.10, com: 0.00,
            weights: { TF: 0, TM: 0, YF: 2, YM: 1, AF: 2, AM: 2 } 
        },
        "Modern American City": {
            category: "Setting", art: 0.00, com: 0.20,
            weights: { TF: 0, TM: 0, YF: 0, YM: 0, AF: 0, AM: 0 } 
        },
        "Modern American Countryside": {
            category: "Setting", art: 0.20, com: -0.20,
            weights: { TF: -2, TM: -2, YF: 0, YM: 0, AF: 0, AM: 0 } 
        },
        "Modern American Town": {
            category: "Setting", art: 0.00, com: 0.00,
            weights: { TF: 0, TM: 0, YF: 0, YM: 0, AF: 0, AM: 0 } 
        },
        "Modern European City": {
            category: "Setting", art: 0.20, com: -0.10,
            weights: { TF: 0, TM: 0, YF: 1, YM: 0, AF: 1, AM: 0 } 
        },
        "Modern European Countryside": {
            category: "Setting", art: 0.30, com: -0.30,
            weights: { TF: -1, TM: -1, YF: 1, YM: 0, AF: 1, AM: 0 } 
        },
        "Modern European Town": {
            category: "Setting", art: 0.20, com: -0.20,
            weights: { TF: 0, TM: 0, YF: 1, YM: 0, AF: 1, AM: 0 } 
        },
        "Renaissance": {
            category: "Setting", art: 0.05, com: 0.05,
            weights: { TF: -1, TM: -1, YF: 2, YM: 1, AF: 3, AM: 1 } 
        },
        "Slaves States in Slavery Era": {
            category: "Setting", art: 0.05, com: 0.05,
            weights: { TF: -2, TM: -2, YF: 0, YM: 0, AF: 1, AM: 2 } 
        },
        "Space": {
            category: "Setting", art: 0.05, com: 0.10,
            weights: { TF: 2, TM: 4, YF: 1, YM: 3, AF: -1, AM: 1 } 
        },
        "Tropical Island": {
            category: "Setting", art: 0.00, com: 0.10,
            weights: { TF: 2, TM: 2, YF: 0, YM: 0, AF: 1, AM: 0 } 
        },
        "Utopian Futuristic Society": {
            category: "Setting", art: 0.05, com: 0.05,
            weights: { TF: 1, TM: 2, YF: 1, YM: 3, AF: 0, AM: 1 } 
        },
        "Victorian England": {
            category: "Setting", art: 0.10, com: 0.00,
            weights: { TF: 0, TM: 0, YF: 3, YM: 1, AF: 4, AM: 2 } 
        },
        "Wild West": {
            category: "Setting", art: 0.00, com: 0.20,
            weights: { TF: 2, TM: 5, YF: 1, YM: 4, AF: 1, AM: 4 } 
        },
        "WW2 (Africa)": {
            category: "Setting", art: 0.20, com: 0.00,
            weights: { TF: -1, TM: 0, YF: 1, YM: 1, AF: 1, AM: 1 } 
        },
        "WW2 (Europe)": {
            category: "Setting", art: 0.20, com: 0.10,
            weights: { TF: 0, TM: 0, YF: 0, YM: 1, AF: 2, AM: 3 } 
        },
        "WW2 (Pacific)": {
            category: "Setting", art: 0.20, com: 0.10,
            weights: { TF: -2, TM: -2, YF: 0, YM: 1, AF: 1, AM: 2 } 
        },
        "Accidental Hero": {
            category: "Protagonist", art: 0.20, com: 0.00,
            weights: { TF: 0, TM: 0, YF: 1, YM: 2, AF: 1, AM: 2 } 
        },
        "Ambitious Woman": {
            category: "Protagonist", art: 0.15, com: 0.00,
            weights: { TF: 3, TM: 3, YF: 5, YM: 2, AF: 4, AM: 1 }
        },
        "Attorney": {
            category: "Protagonist", art: 0.05, com: 0.00,
            weights: { TF: -2, TM: -2, YF: -1, YM: -1, AF: 1, AM: 1 } 
        },
        "Bounty Hunter": {
            category: "Protagonist", art: -0.05, com: 0.20,
            weights: { TF: 3, TM: 5, YF: 1, YM: 5, AF: 0, AM: 4 } 
        },
        "Brothers in Arms": {
            category: "Protagonist", art: 0.10, com: 0.20,
            weights: { TF: 1, TM: 2, YF: 1, YM: 3, AF: 1, AM: 3 } 
        },
        "Charismatic Criminal": {
            category: "Protagonist", art: 0.50, com: 0.15,
            weights: { TF: 3, TM: 3, YF: 3, YM: 3, AF: 3, AM: 3 }
        },
        "City Mouse": {
            category: "Protagonist", art: 0.10, com: 0.00,
            weights: { TF: 1, TM: -1, YF: 2, YM: 1, AF: 2, AM: 1 } 
        },
        "Clumsy Oaf": {
            category: "Protagonist", art: 0.00, com: 0.10,
            weights: { TF: 3, TM: 3, YF: 2, YM: 3, AF: 1, AM: 2 } 
        },
        "Conjoined Twin Sheriffs": {
            category: "Protagonist", art: -0.30, com: 0.50,
            weights: { TF: 2, TM: 5, YF: 3, YM: 5, AF: 3, AM: 5 } 
        },
        "Cop": {
            category: "Protagonist", art: 0.00, com: 0.10,
            weights: { TF: 3, TM: 4, YF: 2, YM: 4, AF: 2, AM: 4 } 
        },
        "Cornlimbed Romantic": {
            category: "Protagonist", art: -0.20, com: 0.20,
            weights: { TF: 4, TM: 2, YF: 5, YM: 4, AF: 5, AM: 3 } 
        },
        "Cowboy": {
            category: "Protagonist", art: -0.10, com: 0.20,
            weights: { TF: 3, TM: 5, YF: 2, YM: 5, AF: 1, AM: 4 } 
        },
        "Cynic": {
            category: "Protagonist", art: 0.20, com: 0.10,
            weights: { TF: 1, TM: 1, YF: 3, YM: 3, AF: 1, AM: 1 }
        },
        "Daring Adventurer": {
            category: "Protagonist", art: 0.00, com: 0.10,
            weights: { TF: 4, TM: 4, YF: 3, YM: 4, AF: 2, AM: 3 } 
        },
        "Dejected Idealist": {
            category: "Protagonist", art: 0.25, com: 0.05,
            weights: { TF: 1, TM: 1, YF: 3, YM: 3, AF: 1, AM: 1 }
        },
        "Detective": {
            category: "Protagonist", art: 0.00, com: 0.05,
            weights: { TF: 3, TM: 4, YF: 2, YM: 3, AF: 2, AM: 3 } 
        },
        "Farm Girl": {
            category: "Protagonist", art: 0.10, com: 0.00,
            weights: { TF: 1, TM: -1, YF: 2, YM: 1, AF: 2, AM: 1 } 
        },
        "Girl with a Swearing Vagina with Tourette's": {
            category: "Protagonist", art: -0.70, com: 0.20,
            weights: { TF: 4, TM: 4, YF: 5, YM: 5, AF: 3, AM: 5 } 
        },
        "Hopeless Romantic": {
            category: "Protagonist", art: 0.10, com: 0.05,
            weights: { TF: 2, TM: 1, YF: 2, YM: 3, AF: 2, AM: 2 } 
        },
        "Journalist": {
            category: "Protagonist", art: 0.05, com: 0.00,
            weights: { TF: -2, TM: -2, YF: 0, YM: 1, AF: 1, AM: 1 } 
        },
        "Knight": {
            category: "Protagonist", art: 0.00, com: 0.00,
            weights: { TF: 3, TM: 4, YF: 2, YM: 3, AF: 1, AM: 2 } 
        },
        "Last Survivor": {
            category: "Protagonist", art: -0.20, com: 0.30,
            weights: { TF: 0, TM: 1, YF: 1, YM: 2, AF: 1, AM: 3 }
        },
        "Loveable Rogue": {
            category: "Protagonist", art: 0.00, com: 0.20,
            weights: { TF: 2, TM: 3, YF: 2, YM: 3, AF: 2, AM: 2 } 
        },
        "Lovelace with Poisonous Balls": {
            category: "Protagonist", art: -0.30, com: 0.20,
            weights: { TF: -3, TM: -3, YF: -1, YM: 5, AF: 2, AM: 4 } 
        },
        "Outcast": {
            category: "Protagonist", art: 0.20, com: 0.00,
            weights: { TF: 1, TM: 1, YF: 3, YM: 3, AF: 2, AM: 2 } 
        },
        "Parent in Invisible Clothes": {
            category: "Protagonist", art: -0.10, com: 0.10,
            weights: { TF: -2, TM: -2, YF: 4, YM: 4, AF: 2, AM: 2 } 
        },
        "Pilot": {
            category: "Protagonist", art: 0.00, com: 0.05,
            weights: { TF: 2, TM: 4, YF: 3, YM: 3, AF: 2, AM: 2 } 
        },
        "Pirate": {
            category: "Protagonist", art: 0.00, com: 0.05,
            weights: { TF: 3, TM: 4, YF: 1, YM: 2, AF: 0, AM: 1 } 
        },
        "Retired Legend": {
            category: "Protagonist", art: 0.04, com: 0.08,
            weights: { TF: 2, TM: 2, YF: 3, YM: 3, AF: 4, AM: 4 }
        },
        "Sailor": {
            category: "Protagonist", art: 0.00, com: 0.05,
            weights: { TF: 1, TM: 3, YF: 1, YM: 2, AF: 1, AM: 1 } 
        },
        "Secret Agent": {
            category: "Protagonist", art: 0.00, com: 0.10,
            weights: { TF: 3, TM: 4, YF: 2, YM: 4, AF: 2, AM: 3 } 
        },
        "Sheriff": {
            category: "Protagonist", art: 0.00, com: 0.05,
            weights: { TF: 2, TM: 4, YF: 1, YM: 3, AF: 1, AM: 3 } 
        },
        "Soldier": {
            category: "Protagonist", art: 0.20, com: 0.00,
            weights: { TF: 3, TM: 4, YF: 1, YM: 3, AF: 2, AM: 3 } 
        },
        "Southern Belle": {
            category: "Protagonist", art: 0.00, com: 0.00,
            weights: { TF: -2, TM: -2, YF: 2, YM: 1, AF: 2, AM: 1 } 
        },
        "Spirited Young Lady": {
            category: "Protagonist", art: 0.10, com: 0.00,
            weights: { TF: 2, TM: 1, YF: 4, YM: 2, AF: 3, AM: 2 } 
        },
        "Toxic Vigilante": {
            category: "Protagonist", art: 0.05, com: 0.30,
            weights: { TF: 3, TM: 5, YF: 4, YM: 5, AF: 4, AM: 5 } 
        },
        "Vampire Shit-Sucker": {
            category: "Protagonist", art: -0.80, com: 0.40,
            weights: { TF: 1, TM: 5, YF: 3, YM: 5, AF: 1, AM: 4 } 
        },
        "War Veteran": {
            category: "Protagonist", art: 0.10, com: -0.10,
            weights: { TF: 1, TM: 5, YF: 3, YM: 5, AF: 1, AM: 4 } 
        },
        "War Widow": {
            category: "Protagonist", art: 0.20, com: -0.10,
            weights: { TF: -2, TM: -2, YF: 0, YM: -1, AF: 4, AM: 1 } 
        },
        "Warrior": {
            category: "Protagonist", art: 0.00, com: 0.00,
            weights: { TF: 1, TM: 3, YF: 0, YM: 2, AF: -1, AM: 2 } 
        },
        "Wayward Soul": {
            category: "Protagonist", art: 0.10, com: 0.05,
            weights: { TF: 2, TM: 2, YF: 3, YM: 3, AF: 4, AM: 4 } 
        },
        "White Collar Worker": {
            category: "Protagonist", art: 0.00, com: 0.00,
            weights: { TF: 0, TM: 0, YF: 3, YM: 2, AF: 4, AM: 3 } 
        },
        "Working Man": {
            category: "Protagonist", art: 0.00, com: 0.00,
            weights: { TF: -1, TM: -1, YF: 1, YM: 2, AF: 3, AM: 4 } 
        },
        "Alien": {
            category: "Antagonist", art: -0.10, com: 0.10,
            weights: { TF: 5, TM: 5, YF: 1, YM: 4, AF: 1, AM: 3 } 
        },
        "Ancient Evil": {
            category: "Antagonist", art: 0.00, com: 0.05,
            weights: { TF: 2, TM: 4, YF: 1, YM: 3, AF: 0, AM: 2 } 
        },
        "Bandit": {
            category: "Antagonist", art: 0.00, com: 0.00,
            weights: { TF: 2, TM: 4, YF: 2, YM: 3, AF: 1, AM: 3 } 
        },
        "Barbarian Tribe": {
            category: "Antagonist", art: 0.10, com: 0.00,
            weights: { TF: 1, TM: 1, YF: 0, YM: 1, AF: 0, AM: 1 } 
        },
        "Corrupt Official": {
            category: "Antagonist", art: 0.20, com: 0.00,
            weights: { TF: 0, TM: 0, YF: 4, YM: 4, AF: 5, AM: 5 } 
        },
        "Criminal Gang": {
            category: "Antagonist", art: 0.00, com: 0.10,
            weights: { TF: 1, TM: 3, YF: 1, YM: 3, AF: 0, AM: 2 } 
        },
        "Criminal Mastermind": {
            category: "Antagonist", art: -0.10, com: 0.05,
            weights: { TF: 2, TM: 4, YF: 0, YM: 2, AF: 1, AM: 2 } 
        },
        "Enemy Army": {
            category: "Antagonist", art: 0.05, com: 0.10,
            weights: { TF: 0, TM: 2, YF: 0, YM: 2, AF: 1, AM: 2 } 
        },
        "Enemy from the Past": {
            category: "Antagonist", art: 0.05, com: 0.10,
            weights: { TF: 2, TM: 2, YF: 2, YM: 2, AF: 2, AM: 2 } 
        },
        "Evil Monster": {
            category: "Antagonist", art: -0.10, com: 0.10,
            weights: { TF: 5, TM: 5, YF: 2, YM: 4, AF: 1, AM: 3 } 
        },
        "Evil Sorcerer": {
            category: "Antagonist", art: 0.10, com: 0.05,
            weights: { TF: 4, TM: 4, YF: 1, YM: 3, AF: 0, AM: 0 } 
        },
        "Evil Witch": {
            category: "Antagonist", art: 0.00, com: 0.05,
            weights: { TF: 4, TM: 4, YF: 0, YM: 1, AF: 0, AM: 0 } 
        },
        "Headless Midget Hypnotists": {
            category: "Antagonist", art: -0.30, com: 0.20,
            weights: { TF: 4, TM: 4, YF: 5, YM: 5, AF: 3, AM: 4 } 
        },
        "Heartless Bureaucrat": {
            category: "Antagonist", art: 0.10, com: 0.00,
            weights: { TF: -1, TM: -1, YF: 0, YM: 1, AF: 3, AM: 3 } 
        },
        "Mad Scientist": {
            category: "Antagonist", art: 0.10, com: 0.10,
            weights: { TF: 1, TM: 3, YF: 1, YM: 2, AF: 1, AM: 2 } 
        },
        "Murderer": {
            category: "Antagonist", art: 0.00, com: 0.00,
            weights: { TF: 2, TM: 2, YF: 1, YM: 2, AF: 1, AM: 2 } 
        },
        "Old Friend Enemy": {
            category: "Antagonist", art: 0.05, com: 0.10,
            weights: { TF: 2, TM: 2, YF: 2, YM: 2, AF: 2, AM: 2 } 
        },
        "Patriarch": {
            category: "Antagonist", art: 0.10, com: 0.05,
            weights: { TF: 0, TM: 1, YF: -3, YM: 2, AF: 1, AM: 4 } 
        },
        "Pirate": {
            category: "Antagonist", art: 0.00, com: 0.05,
            weights: { TF: 2, TM: 3, YF: 1, YM: 2, AF: 0, AM: 2 } 
        },
        "Rebels": {
            category: "Antagonist", art: 0.00, com: 0.00,
            weights: { TF: -1, TM: -1, YF: 1, YM: 2, AF: 1, AM: 2 } 
        },
        "Robber with a Hundred Dicks": {
            category: "Antagonist", art: -0.90, com: 0.30,
            weights: { TF: -4, TM: -4, YF: 2, YM: 5, AF: -2, AM: 5 } 
        },
        "Robot": {
            category: "Antagonist", art: 0.00, com: 0.10,
            weights: { TF: 2, TM: 4, YF: 1, YM: 3, AF: 0, AM: 2 } 
        },
        "Robot Rapist": {
            category: "Antagonist", art: -0.70, com: 0.20,
            weights: { TF: -4, TM: -4, YF: -2, YM: 5, AF: -2, AM: 4 } 
        },
        "Rule Enforcer": {
            category: "Antagonist", art: 0.05, com: 0.10,
            weights: { TF: 0, TM: 1, YF: 1, YM: 2, AF: 2, AM: 3 } 
        },
        "Schoolgirl Possessed by a Demon": {
            category: "Antagonist", art: -0.50, com: 0.20,
            weights: { TF: 2, TM: 2, YF: 5, YM: 5, AF: 4, AM: 5 } 
        },
        "Serial Killer": {
            category: "Antagonist", art: 0.00, com: 0.05,
            weights: { TF: 4, TM: 5, YF: 4, YM: 5, AF: 3, AM: 4 } 
        },
        "Toaster Killer": {
            category: "Antagonist", art: -0.20, com: 0.30,
            weights: { TF: 3, TM: 5, YF: 4, YM: 5, AF: 2, AM: 4 } 
        },
        "Tribal Chief": {
            category: "Antagonist", art: 0.00, com: 0.05,
            weights: { TF: 0, TM: 2, YF: 0, YM: 1, AF: 0, AM: 1 } 
        },
        "Tyrant": {
            category: "Antagonist", art: 0.10, com: 0.05,
            weights: { TF: 1, TM: 1, YF: 3, YM: 3, AF: 2, AM: 2 } 
        },
        "Undead": {
            category: "Antagonist", art: -0.30, com: 0.30,
            weights: { TF: 2, TM: 2, YF: 4, YM: 4, AF: 4, AM: 4 } 
        },
        "Vampire": {
            category: "Antagonist", art: 0.00, com: 0.10,
            weights: { TF: 4, TM: 4, YF: 2, YM: 3, AF: 0, AM: 2 } 
        },
        "Vengeful Spirit": {
            category: "Antagonist", art: -0.15, com: 0.20,
            weights: { TF: 1, TM: 1, YF: 2, YM: 2, AF: 3, AM: 3 } 
        },
        "War Criminal": {
            category: "Antagonist", art: 0.10, com: 0.05,
            weights: { TF: 0, TM: 1, YF: 0, YM: 2, AF: 1, AM: 2 } 
        },
        "Women's Book Club of Cannibals": {
            category: "Antagonist", art: -0.30, com: 0.40,
            weights: { TF: 2, TM: 4, YF: 4, YM: 5, AF: 5, AM: 3 } 
        },
        "Angry Boss": {
            category: "Supporting Character", art: 0.10, com: 0.00,
            weights: { TF: -1, TM: -1, YF: 2, YM: 2, AF: 3, AM: 3 } 
        },
        "Annoying Suitor": {
            category: "Supporting Character", art: 0.05, com: 0.05,
            weights: { TF: -1, TM: -3, YF: 2, YM: 1, AF: 3, AM: 1 } 
        },
        "Brother in Arms": {
            category: "Supporting Character", art: 0.05, com: 0.05,
            weights: { TF: -1, TM: 1, YF: 0, YM: 1, AF: 0, AM: 2 } 
        },
        "Butler": {
            category: "Supporting Character", art: 0.01, com: 0.00,
            weights: { TF: -5, TM: -5, YF: -5, YM: -5, AF: -5, AM: -5 } 
        },
        "Concerned Wife": {
            category: "Supporting Character", art: 0.04, com: 0.02,
            weights: { TF: 2, TM: 1, YF: 3, YM: 1, AF: 3, AM: 1 } 
        },
        "Damsel in Distress": {
            category: "Supporting Character", art: 0.00, com: 0.05,
            weights: { TF: 2, TM: 1, YF: 2, YM: 2, AF: 3, AM: 2 } 
        },
        "Femme Fatale": {
            category: "Supporting Character", art: 0.10, com: 0.00,
            weights: { TF: 0, TM: 1, YF: 1, YM: 2, AF: 2, AM: 3 } 
        },
        "First Victim": {
            category: "Supporting Character", art: 0.10, com: 0.10,
            weights: { TF: 1, TM: -1, YF: 2, YM: 0, AF: 3, AM: 0 } 
        },
        "Key Witness": {
            category: "Supporting Character", art: 0.02, com: 0.05,
            weights: { TF: 2, TM: 2, YF: 2, YM: 2, AF: 2, AM: 2 } 
        },
        "Love Interest": {
            category: "Supporting Character", art: 0.05, com: 0.05,
            weights: { TF: 2, TM: 1, YF: 5, YM: 3, AF: 5, AM: 2 } 
        },
        "Mentor": {
            category: "Supporting Character", art: 0.05, com: 0.00,
            weights: { TF: 0, TM: 0, YF: 2, YM: 2, AF: 3, AM: 3 } 
        },
        "Mysterious Guide": {
            category: "Supporting Character", art: -0.20, com: 0.20,
            weights: { TF: -1, TM: 3, YF: 0, YM: 3, AF: 1, AM: 3 } 
        },
        "Parent Figure": {
            category: "Supporting Character", art: 0.05, com: 0.00,
            weights: { TF: -1, TM: -1, YF: 1, YM: 0, AF: 2, AM: 2 } 
        },
        "Patriarch": {
            category: "Supporting Character", art: 0.05, com: 0.00,
            weights: { TF: 0, TM: 1, YF: -3, YM: 2, AF: 1, AM: 4 } 
        },
        "Rival": {
            category: "Supporting Character", art: 0.05, com: 0.05,
            weights: { TF: 2, TM: 3, YF: 2, YM: 3, AF: 2, AM: 2 } 
        },
        "Sheriff (Supporting)": {
            category: "Supporting Character", art: 0.00, com: 0.05,
            weights: { TF: 2, TM: 3, YF: 0, YM: 2, AF: 0, AM: 2 } 
        },
        "Sidekick": {
            category: "Supporting Character", art: 0.00, com: 0.05,
            weights: { TF: 3, TM: 4, YF: 2, YM: 3, AF: 1, AM: 3 } 
        },
        "Stepchild": {
            category: "Supporting Character", art: 0.10, com: 0.00,
            weights: { TF: -1, TM: -1, YF: 1, YM: 1, AF: 2, AM: 2 } 
        },
        "Stepparent": {
            category: "Supporting Character", art: 0.00, com: 0.00,
            weights: { TF: -1, TM: -1, YF: 1, YM: 1, AF: 2, AM: 2 } 
        },
        "Strict Parent": {
            category: "Supporting Character", art: 0.10, com: 0.00,
            weights: { TF: -1, TM: -1, YF: 1, YM: 1, AF: 2, AM: 2 } 
        },
        "Villain's Right Hand": {
            category: "Supporting Character", art: 0.00, com: 0.05,
            weights: { TF: 2, TM: 2, YF: 2, YM: 2, AF: 2, AM: 2 } 
        },
        "Wizard": {
            category: "Supporting Character", art: 0.00, com: 0.05,
            weights: { TF: 4, TM: 4, YF: 1, YM: 2, AF: 0, AM: 0 } 
        },
        "A Curse": {
            category: "Theme and Event", art: 0.00, com: 0.05,
            weights: { TF: 1, TM: 2, YF: 0, YM: 2, AF: 0, AM: 1 } 
        },
        "Abundant Profanity": {
            category: "Theme and Event", art: 0.05, com: 0.12,
            weights: { TF: 3, TM: 3, YF: 3, YM: 3, AF: 3, AM: 3 } 
        },
        "Accidental Murder": {
            category: "Theme and Event", art: 0.10, com: 0.00,
            weights: { TF: 0, TM: 0, YF: 1, YM: 1, AF: 2, AM: 2 } 
        },
        "Ace Combat": {
            category: "Theme and Event", art: 0.00, com: 0.10,
            weights: { TF: 2, TM: 4, YF: 1, YM: 3, AF: 1, AM: 3 } 
        },
        "Amnesia": {
            category: "Theme and Event", art: 0.00, com: 0.05,
            weights: { TF: 2, TM: 2, YF: 2, YM: 2, AF: 3, AM: 3 } 
        },
        "Assassination Attempts": {
            category: "Theme and Event", art: 0.00, com: 0.05,
            weights: { TF: 0, TM: 2, YF: 0, YM: 2, AF: 0, AM: 2 } 
        },
        "Betrayal": {
            category: "Theme and Event", art: 0.05, com: 0.00,
            weights: { TF: 2, TM: 3, YF: 2, YM: 4, AF: 2, AM: 3 } 
        },
        "Avenging Loved Ones": {
            category: "Theme and Event", art: 0.00, com: 0.05,
            weights: { TF: 1, TM: 3, YF: 1, YM: 3, AF: 1, AM: 3 } 
        },
        "Bank Robbery": {
            category: "Theme and Event", art: 0.00, com: 0.05,
            weights: { TF: 1, TM: 3, YF: 1, YM: 3, AF: 0, AM: 2 } 
        },
        "Bar Brawl": {
            category: "Theme and Event", art: 0.00, com: 0.05,
            weights: { TF: -1, TM: 2, YF: -1, YM: 1, AF: -1, AM: 1 } 
        },
        "Big Battle Scenes": {
            category: "Theme and Event", art: 0.00, com: 0.10,
            weights: { TF: 2, TM: 4, YF: 1, YM: 3, AF: 0, AM: 2 } 
        },
        "Breaking in New Employee": {
            category: "Theme and Event", art: -0.10, com: 0.05,
            weights: { TF: 1, TM: 1, YF: 2, YM: 2, AF: 1, AM: 1 } 
        },
        "Captured and Tortured": {
            category: "Theme and Event", art: 0.00, com: 0.05,
            weights: { TF: 1, TM: 2, YF: 1, YM: 3, AF: 1, AM: 3 } 
        },
        "Car Chase": {
            category: "Theme and Event", art: 0.00, com: 0.10,
            weights: { TF: 2, TM: 4, YF: 1, YM: 4, AF: 0, AM: 2 } 
        },
        "Child Abuse": {
            category: "Theme and Event", art: 0.10, com: -0.10,
            weights: { TF: -1, TM: -1, YF: 2, YM: 2, AF: 3, AM: 3 } 
        },
        "Crime of Necessity": {
            category: "Theme and Event", art: 0.00, com: 0.05,
            weights: { TF: 1, TM: 2, YF: 1, YM: 2, AF: 1, AM: 2 } 
        },
        "Cursed Deal": {
            category: "Theme and Event", art: 0.00, com: 0.05,
            weights: { TF: 1, TM: 2, YF: 1, YM: 2, AF: 1, AM: 2 } 
        },
        "Death of a Loved One": {
            category: "Theme and Event", art: 0.10, com: 0.00,
            weights: { TF: 1, TM: 0, YF: 3, YM: 2, AF: 5, AM: 3 } 
        },
        "Depressed": {
            category: "Theme and Event", art: 0.10, com: -0.10,
            weights: { TF: -1, TM: -1, YF: 2, YM: 2, AF: 3, AM: 3 } 
        },
        "Divorce": {
            category: "Theme and Event", art: 0.10, com: -0.10,
            weights: { TF: 1, TM: 1, YF: 3, YM: 2, AF: 4, AM: 2 } 
        },
        "Drug Addiction": {
            category: "Theme and Event", art: 0.10, com: -0.10,
            weights: { TF: -1, TM: -1, YF: 1, YM: 2, AF: 3, AM: 3 } 
        },
        "Evil Transformation": {
            category: "Theme and Event", art: 0.00, com: 0.05,
            weights: { TF: 2, TM: 3, YF: 2, YM: 3, AF: 2, AM: 3 } 
        },
        "Escape Captivity": {
            category: "Theme and Event", art: 0.00, com: 0.10,
            weights: { TF: 2, TM: 3, YF: 2, YM: 3, AF: 1, AM: 2 } 
        },
        "Festive ATM": {
            category: "Theme and Event", art: 0.00, com: 0.10,
            weights: { TF: 2, TM: 2, YF: 3, YM: 3, AF: 2, AM: 2 } 
        },
        "Fighting a Sorcerer": {
            category: "Theme and Event", art: -0.40, com: 0.30,
            weights: { TF: 4, TM: 5, YF: 3, YM: 5, AF: 2, AM: 5 } 
        },
        "Fighting Fascism": {
            category: "Theme and Event", art: -0.20, com: 0.10,
            weights: { TF: 1, TM: 1, YF: 1, YM: 2, AF: 2, AM: 3 } 
        },
        "Fighting Racism": {
            category: "Theme and Event", art: -0.20, com: 0.10,
            weights: { TF: 1, TM: 1, YF: 1, YM: 2, AF: 2, AM: 3 } 
        },
        "Finding Inner Peace": {
            category: "Theme and Event", art: 0.10, com: -0.10,
            weights: { TF: 1, TM: -1, YF: 2, YM: 1, AF: 4, AM: 2 } 
        },
        "Forbidden Love": {
            category: "Theme and Event", art: 0.05, com: 0.00,
            weights: { TF: 1, TM: 0, YF: 4, YM: 2, AF: 4, AM: 1 } 
        },
        "Funny One Liners": {
            category: "Theme and Event", art: 0.05, com: 0.12,
            weights: { TF: 3, TM: 3, YF: 3, YM: 3, AF: 3, AM: 3 } 
        },
        "Getting Pregnant": {
            category: "Theme and Event", art: 0.05, com: -0.05,
            weights: { TF: 1, TM: -3, YF: 2, YM: 0, AF: 4, AM: 0 } 
        },
        "Gore": {
            category: "Theme and Event", art: 0.10, com: -0.10,
            weights: { TF: 0, TM: 1, YF: 0, YM: 2, AF: 0, AM: 2 } 
        },
        "Hunting for a Lost Treasure": {
            category: "Theme and Event", art: 0.00, com: 0.05,
            weights: { TF: 2, TM: 3, YF: 2, YM: 3, AF: 2, AM: 2 } 
        },
        "Jousting Tournament": {
            category: "Theme and Event", art: 0.00, com: 0.05,
            weights: { TF: 2, TM: 3, YF: 1, YM: 3, AF: 1, AM: 2 } 
        },
        "Kidnapping": {
            category: "Theme and Event", art: 0.00, com: 0.05,
            weights: { TF: 1, TM: 2, YF: 1, YM: 3, AF: 1, AM: 3 } 
        },
        "Long Journey": {
            category: "Theme and Event", art: 0.00, com: 0.05,
            weights: { TF: 2, TM: 3, YF: 2, YM: 3, AF: 2, AM: 2 } 
        },
        "Love Triangle": {
            category: "Theme and Event", art: 0.05, com: 0.00,
            weights: { TF: 1, TM: 0, YF: 4, YM: 2, AF: 4, AM: 1 } 
        },
        "Magic Sword": {
            category: "Theme and Event", art: -0.40, com: 0.30,
            weights: { TF: 4, TM: 5, YF: 3, YM: 5, AF: 2, AM: 5 } 
        },
        "Mafia Power Struggle": {
            category: "Theme and Event", art: 0.00, com: 0.05,
            weights: { TF: 1, TM: 3, YF: 1, YM: 3, AF: 1, AM: 3 } 
        },
        "Mob War": {
            category: "Theme and Event", art: 0.00, com: 0.05,
            weights: { TF: 1, TM: 3, YF: 1, YM: 3, AF: 1, AM: 3 } 
        },
        "Murder": {
            category: "Theme and Event", art: 0.10, com: 0.00,
            weights: { TF: 0, TM: 0, YF: 1, YM: 1, AF: 2, AM: 2 } 
        },
        "Multiple Murders": {
            category: "Theme and Event", art: 0.10, com: 0.00,
            weights: { TF: 0, TM: 0, YF: 1, YM: 1, AF: 2, AM: 2 } 
        },
        "Naughty Schoolgirl": {
            category: "Theme and Event", art: -0.30, com: 0.10,
            weights: { TF: -4, TM: -4, YF: 2, YM: 5, AF: -2, AM: 5 } 
        },
        "Outlaw": {
            category: "Theme and Event", art: 0.00, com: 0.05,
            weights: { TF: 1, TM: 3, YF: 1, YM: 3, AF: 0, AM: 2 } 
        },
        "Prison Break": {
            category: "Theme and Event", art: 0.00, com: 0.10,
            weights: { TF: 2, TM: 3, YF: 2, YM: 3, AF: 1, AM: 2 } 
        },
        "Protagonist Passes the Torch": {
            category: "Theme and Event", art: 0.00, com: 0.05,
            weights: { TF: 1, TM: 1, YF: 1, YM: 1, AF: 2, AM: 2 } 
        },
        "Protagonist Roped Back in": {
            category: "Theme and Event", art: 0.01, com: 0.05,
            weights: { TF: 1, TM: 1, YF: 1, YM: 1, AF: 2, AM: 2 } 
        },
        "Protagonists Close One Dies": {
            category: "Theme and Event", art: 0.10, com: 0.00,
            weights: { TF: 1, TM: 0, YF: 3, YM: 2, AF: 5, AM: 3 } 
        },
        "Rape": {
            category: "Theme and Event", art: -0.30, com: 0.10,
            weights: { TF: -4, TM: -4, YF: 2, YM: 5, AF: -2, AM: 5 } 
        },
        "Rescue Mission": {
            category: "Theme and Event", art: 0.00, com: 0.10,
            weights: { TF: 2, TM: 3, YF: 2, YM: 3, AF: 1, AM: 2 } 
        },
        "Revenge": {
            category: "Theme and Event", art: 0.00, com: 0.05,
            weights: { TF: 1, TM: 3, YF: 1, YM: 3, AF: 1, AM: 3 } 
        },
        "Runaway": {
            category: "Theme and Event", art: 0.00, com: 0.05,
            weights: { TF: 2, TM: 2, YF: 2, YM: 2, AF: 2, AM: 2 } 
        },
        "Saving the Beloved": {
            category: "Theme and Event", art: 0.05, com: 0.00,
            weights: { TF: 1, TM: 0, YF: 4, YM: 2, AF: 4, AM: 1 } 
        },
        "Search Killer": {
            category: "Theme and Event", art: 0.10, com: 0.00,
            weights: { TF: 0, TM: 0, YF: 1, YM: 1, AF: 2, AM: 2 } 
        },
        "Shootout": {
            category: "Theme and Event", art: 0.00, com: 0.10,
            weights: { TF: 2, TM: 4, YF: 1, YM: 3, AF: 0, AM: 2 } 
        },
        "Stagecoach Robbery": {
            category: "Theme and Event", art: 0.00, com: 0.05,
            weights: { TF: 1, TM: 3, YF: 1, YM: 3, AF: 0, AM: 2 } 
        },
        "Stockholm Syndrome": {
            category: "Theme and Event", art: 0.00, com: 0.05,
            weights: { TF: 1, TM: 1, YF: 2, YM: 2, AF: 2, AM: 2 } 
        },
        "Struggle for Better Life": {
            category: "Theme and Event", art: 0.10, com: -0.10,
            weights: { TF: 1, TM: 0, YF: 3, YM: 2, AF: 5, AM: 3 } 
        },
        "Tank Combat": {
            category: "Theme and Event", art: 0.00, com: 0.10,
            weights: { TF: 2, TM: 4, YF: 1, YM: 3, AF: 1, AM: 3 } 
        },
        "The Big Heist": {
            category: "Theme and Event", art: 0.00, com: 0.05,
            weights: { TF: 1, TM: 3, YF: 1, YM: 3, AF: 0, AM: 2 } 
        },
        "The Dark Secret": {
            category: "Theme and Event", art: 0.10, com: 0.00,
            weights: { TF: 1, TM: 1, YF: 2, YM: 2, AF: 2, AM: 2 } 
        },
        "The Great Escape": {
            category: "Theme and Event", art: 0.00, com: 0.10,
            weights: { TF: 2, TM: 3, YF: 2, YM: 3, AF: 1, AM: 2 } 
        },
        "The Key Witness": {
            category: "Theme and Event", art: 0.00, com: 0.05,
            weights: { TF: 2, TM: 2, YF: 2, YM: 2, AF: 2, AM: 2 } 
        },
        "The Long Journey": {
            category: "Theme and Event", art: 0.00, com: 0.05,
            weights: { TF: 2, TM: 3, YF: 2, YM: 3, AF: 2, AM: 2 } 
        },
        "The Manhunt": {
            category: "Theme and Event", art: 0.00, com: 0.05,
            weights: { TF: 1, TM: 3, YF: 1, YM: 3, AF: 0, AM: 2 } 
        },
        "The Rescue Mission": {
            category: "Theme and Event", art: 0.00, com: 0.10,
            weights: { TF: 2, TM: 3, YF: 2, YM: 3, AF: 1, AM: 2 } 
        },
        "The Search for a Killer": {
            category: "Theme and Event", art: 0.10, com: 0.00,
            weights: { TF: 0, TM: 0, YF: 1, YM: 1, AF: 2, AM: 2 } 
        },
        "The Treasure Hunt": {
            category: "Theme and Event", art: 0.00, com: 0.05,
            weights: { TF: 2, TM: 3, YF: 2, YM: 3, AF: 2, AM: 2 } 
        },
        "Train Job": {
            category: "Theme and Event", art: 0.00, com: 0.05,
            weights: { TF: 1, TM: 3, YF: 1, YM: 3, AF: 0, AM: 2 } 
        },
        "Treasure Hunt": {
            category: "Theme and Event", art: 0.00, com: 0.05,
            weights: { TF: 2, TM: 3, YF: 2, YM: 3, AF: 2, AM: 2 } 
        },
        "Unrequited Love": {
            category: "Theme and Event", art: 0.05, com: 0.00,
            weights: { TF: 1, TM: 0, YF: 4, YM: 2, AF: 4, AM: 1 } 
        },
        "Unwanted Pregnancy": {
            category: "Theme and Event", art: 0.05, com: -0.05,
            weights: { TF: 1, TM: -3, YF: 2, YM: 0, AF: 4, AM: 0 } 
        },
        "War": {
            category: "Theme and Event", art: 0.00, com: 0.10,
            weights: { TF: 2, TM: 4, YF: 1, YM: 3, AF: 1, AM: 3 } 
        },
        "War on Sorcery": {
            category: "Theme and Event", art: -0.40, com: 0.30,
            weights: { TF: 5, TM: 5, YF: 4, YM: 5, AF: 3, AM: 5 } 
        },
        "War Scenes": {
            category: "Theme and Event", art: 0.00, com: 0.10,
            weights: { TF: 2, TM: 4, YF: 1, YM: 3, AF: 1, AM: 3 } 
        },
        "War with Sorcerers": {
            category: "Theme and Event", art: -0.40, com: 0.30,
            weights: { TF: 5, TM: 5, YF: 4, YM: 5, AF: 3, AM: 5 } 
        },
        "Wedding": {
            category: "Theme and Event", art: 0.00, com: 0.00,
            weights: { TF: 1, TM: -3, YF: 2, YM: 1, AF: 4, AM: 0 } 
        },
        "White Supremacy": {
            category: "Theme and Event", art: 0.00, com: 0.05,
            weights: { TF: 0, TM: 0, YF: 0, YM: 0, AF: 1, AM: 2 } 
        },
        "Winning the Beloved": {
            category: "Theme and Event", art: 0.05, com: 0.00,
            weights: { TF: 0, TM: -2, YF: 2, YM: 2, AF: 4, AM: 2 } 
        },
        "Worldwide Traveling": {
            category: "Theme and Event", art: 0.00, com: 0.10,
            weights: { TF: 2, TM: 3, YF: 2, YM: 2, AF: 2, AM: 1 } 
        },
        "Wrongfully Accused": {
            category: "Theme and Event", art: 0.10, com: 0.05,
            weights: { TF: 0, TM: 1, YF: 2, YM: 2, AF: 3, AM: 3 } 
        },
        "Antagonist Defeated Evil Persists": {
            category: "Finale", art: 0.10, com: 0.20,
            weights: { TF: 0, TM: 1, YF: 0, YM: 2, AF: 1, AM: 3 } 
        },
        "Antagonist Escapes Justice": {
            category: "Finale", art: 0.05, com: 0.05,
            weights: { TF: -4, TM: -4, YF: 1, YM: 1, AF: 2, AM: 2 } 
        },
        "Antagonist Gets Killed": {
            category: "Finale", art: -0.05, com: 0.05,
            weights: { TF: 2, TM: 2, YF: 1, YM: 2, AF: 1, AM: 2 } 
        },
        "Antagonist Gets Punished": {
            category: "Finale", art: 0.00, com: 0.05,
            weights: { TF: 2, TM: 2, YF: 1, YM: 1, AF: 1, AM: 1 } 
        },
        "Antagonist Repents": {
            category: "Finale", art: 0.10, com: 0.00,
            weights: { TF: 2, TM: 2, YF: 1, YM: 1, AF: 2, AM: 2 } 
        },
        "Boy Becomes Man": {
            category: "Finale", art: 0.05, com: 0.00,
            weights: { TF: 1, TM: 1, YF: 2, YM: 2, AF: 2, AM: 2 } 
        },
        "Couple Gets Married": {
            category: "Finale", art: 0.15, com: -0.05,
            weights: { TF: 2, TM: 2, YF: 4, YM: 2, AF: 4, AM: 2 } 
        },
        "Evil Exposed": {
            category: "Finale", art: 0.10, com: 0.05,
            weights: { TF: 0, TM: 0, YF: 1, YM: 1, AF: 2, AM: 2 } 
        },
        "Everyone Learns a Lesson": {
            category: "Finale", art: 0.05, com: 0.00,
            weights: { TF: 1, TM: 1, YF: 2, YM: 2, AF: 2, AM: 2 } 
        },
        "Family Reunion": {
            category: "Finale", art: 0.10, com: 0.00,
            weights: { TF: 2, TM: 2, YF: 3, YM: 2, AF: 4, AM: 3 } 
        },
        "Happy Ending": {
            category: "Finale", art: 0.10, com: -0.05,
            weights: { TF: 2, TM: 2, YF: 3, YM: 2, AF: 4, AM: 3 } 
        },
        "Protagonist Avoids Punishment": {
            category: "Finale", art: 0.00, com: 0.05,
            weights: { TF: 1, TM: 1, YF: 1, YM: 1, AF: 2, AM: 2 } 
        },
        "Protagonist Commits Suicide": {
            category: "Finale", art: 0.20, com: -0.30,
            weights: { TF: -2, TM: -2, YF: 2, YM: 2, AF: 4, AM: 4 } 
        },
        "Protagonist Dies Heroically": {
            category: "Finale", art: 0.10, com: -0.05,
            weights: { TF: 2, TM: 2, YF: 2, YM: 2, AF: 3, AM: 3 } 
        },
        "Protagonist Finds Love": {
            category: "Finale", art: 0.15, com: -0.05,
            weights: { TF: 2, TM: 2, YF: 4, YM: 2, AF: 4, AM: 2 } 
        },
        "Protagonist Finds Treasure": {
            category: "Finale", art: -0.05, com: 0.20,
            weights: { TF: 1, TM: 1, YF: 1, YM: 1, AF: 1, AM: 1 } 
        },
        "Protagonist Gets Chance for Better Life": {
            category: "Finale", art: 0.10, com: 0.00,
            weights: { TF: 1, TM: 1, YF: 2, YM: 2, AF: 3, AM: 3 } 
        },
        "Protagonist Gets Punished for a Crime": {
            category: "Finale", art: 0.10, com: 0.00,
            weights: { TF: 0, TM: 1, YF: 0, YM: 1, AF: 1, AM: 2 } 
        },
        "Protagonist Gets Punished for Crime": {
            category: "Finale", art: 0.05, com: 0.00,
            weights: { TF: 0, TM: 1, YF: 0, YM: 1, AF: 1, AM: 2 } 
        },
        "Protagonist Overcame Self Doubt": {
            category: "Finale", art: 0.10, com: 0.00,
            weights: { TF: 1, TM: 1, YF: 2, YM: 2, AF: 3, AM: 3 } 
        },
        "Protagonist Reformed": {
            category: "Finale", art: 0.10, com: 0.00,
            weights: { TF: 1, TM: 1, YF: 1, YM: 1, AF: 2, AM: 2 } 
        },
        "Protagonist Rescues Hostage": {
            category: "Finale", art: 0.00, com: 0.05,
            weights: { TF: 2, TM: 3, YF: 1, YM: 2, AF: 1, AM: 2 } 
        },
        "Protagonist Restored Faith": {
            category: "Finale", art: 0.10, com: 0.00,
            weights: { TF: 1, TM: 1, YF: 2, YM: 2, AF: 3, AM: 3 } 
        },
        "Protagonist Retires for Good": {
            category: "Finale", art: 0.05, com: 0.00,
            weights: { TF: 1, TM: 1, YF: 2, YM: 2, AF: 3, AM: 3 } 
        },
        "Protagonist Returns Home": {
            category: "Finale", art: 0.05, com: 0.00,
            weights: { TF: 1, TM: 1, YF: 2, YM: 2, AF: 3, AM: 3 } 
        },
        "Protagonist Takes Antagonist with Them": {
            category: "Finale", art: 0.05, com: 0.05,
            weights: { TF: 2, TM: 2, YF: 1, YM: 2, AF: 1, AM: 2 } 
        },
        "Protagonists Dreams Crushed": {
            category: "Finale", art: 0.20, com: -0.30,
            weights: { TF: -2, TM: -2, YF: 2, YM: 2, AF: 4, AM: 4 } 
        },
        "Star-Crossed Lovers": {
            category: "Finale", art: 0.20, com: -0.30,
            weights: { TF: 1, TM: 1, YF: 4, YM: 2, AF: 4, AM: 2 } 
        },
        "Sweethearts Stay Together": {
            category: "Finale", art: 0.10, com: -0.05,
            weights: { TF: 2, TM: 2, YF: 4, YM: 2, AF: 4, AM: 2 } 
        },
        "Treasure Lost Forever": {
            category: "Finale", art: 0.05, com: 0.00,
            weights: { TF: 0, TM: 0, YF: 2, YM: 2, AF: 1, AM: 1 } 
        },
    }
}