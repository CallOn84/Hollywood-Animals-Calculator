# Hollywood Animal Calculator
A companion tool for the game that helps players analyse story elements, evaluate audience appeal, calculate content scores, and identify the most compatible advertisers for their in-game films.

![Screenshot 2025-04-20 212905](https://github.com/user-attachments/assets/3162500c-2e41-4fb9-87e8-d226e3f6d8e1)
![Screenshot 2025-04-20 212952](https://github.com/user-attachments/assets/2f460ccb-3288-4ece-a80a-b60545e00221)

## Overview
The Hollywood Animal Calculator is a utility for players to make data-driven decisions when creating movies by analysing story element compatibility, target audience profiles, commercial viability, and artistic merit, then recommends the most suitable advertisers for your productions.

This GUI provides data-driven insights to optimise your in-game movie production strategy in Hollywood Animal through several integrated analytical tools:

### Story Element Compatibility Analysis
Select multiple story elements (protagonist types, settings, genres, themes, etc.) to:
- Calculate compatibility scores between elements (1-5 scale)
- Identify the most compatible combinations for stronger films
- Highlight potential storytelling conflicts to avoid
- View detailed compatibility matrices

### Audience Targeting
Analyse how different story elements appeal to various demographic groups in the game:
- Teen Male/Female (TM/TF)
- Young Male/Female (YM/YF)
- Adult Male/Female (AM/AF)

### Content Performance Metrics
Calculate key performance indicators that will affect your film's success:
- Commercial Score: Predicts box office performance and monetisation potential
- Artistic Score: Estimates critical reception and award potential
- Target Audience Profile: Identifies which demographics will be most receptive to your film

### Advertiser Compatibility
Match your films with the most appropriate in-game advertisers based on:
- Audience alignment with advertiser targets
- Content themes and tonal fit
- Commercial quality thresholds

# Requirements
- Python 3.6 or higher
- Tkinter

## Installation
1. Clone this repository:
```
git clone https://github.com/yourusername/hollywood-animal-calculator.git
cd hollywood-animal-calculator
```
2. Ensure Python 3.6+ is installed:
```
python --version
```
If not installed, download from python.org
3. Verify Tkinter is installed (usually included with Python):
```
python -c "import tkinter; tkinter._test()"
```
If missing, install Tkinter:
- Windows: Typically included with Python installation
- macOS: `brew install python-tk` (with Homebrew)
- Ubuntu/Debian: `sudo apt-get install python3-tk`
- Fedora/RHEL: `sudo dnf install python3-tkinter`

# Running the Application
The application comes with sample data files extracted from the game:
- `TagsAudienceWeights.json`: Story element data with audience weights
- `TagCompatibilityData.json`: Compatibility scores between elements
- `AudienceGroups.json`: Audience demographic data

Run the application by typing `python gui.py` in a terminal.
