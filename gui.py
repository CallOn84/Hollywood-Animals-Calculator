import json
import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import os
import re
from typing import Dict, List, Tuple, Any
import colorsys
from datetime import datetime
from calendar import monthcalendar
import operator


class DataManager:
    """Handles loading and managing data from JSON files"""
    
    def __init__(self):
        # Character fix mapping - map Cyrillic characters to Latin equivalents
        self.character_fix_map = {
            'С': 'C',  # Cyrillic 'С' to Latin 'C'
            'с': 'c',  # Lowercase Cyrillic 'с' to Latin 'c'
            'О': 'O',  # Cyrillic 'О' to Latin 'O'
            'о': 'o',  # Lowercase Cyrillic 'о' to Latin 'o'
            'Е': 'E',  # Cyrillic 'Е' to Latin 'E'
            'е': 'e',  # Lowercase Cyrillic 'е' to Latin 'e'
            'А': 'A',  # Cyrillic 'А' to Latin 'A'
            'а': 'a',  # Lowercase Cyrillic 'а' to Latin 'a'
            'Р': 'P',  # Cyrillic 'Р' to Latin 'P'
            'р': 'p',  # Lowercase Cyrillic 'р' to Latin 'p'
            'К': 'K',  # Cyrillic 'К' to Latin 'K'
            'к': 'k',  # Lowercase Cyrillic 'к' to Latin 'k'
            'Н': 'H',  # Cyrillic 'Н' to Latin 'H'
            'н': 'h',  # Lowercase Cyrillic 'н' to Latin 'h'
            'В': 'B',  # Cyrillic 'В' to Latin 'B'
            'в': 'b',  # Lowercase Cyrillic 'в' to Latin 'b'
            'М': 'M',  # Cyrillic 'М' to Latin 'M'
            'м': 'm',  # Lowercase Cyrillic 'м' to Latin 'm'
            'Т': 'T',  # Cyrillic 'Т' to Latin 'T'
            'т': 't',  # Lowercase Cyrillic 'т' to Latin 't'
            'Х': 'X',  # Cyrillic 'Х' to Latin 'X'
            'х': 'x',  # Lowercase Cyrillic 'х' to Latin 'x',
        }
        
        # Define main categories for tag organization and their standardized forms
        # Combined THEME and EVENTS into a single THEME_AND_EVENTS category
        self.main_categories = ["GENRE", "SETTING", "PROTAGONIST", "ANTAGONIST", "SUPPORTING_CHARACTER", "THEME_AND_EVENTS", "FINALE"]
        
        # Mapping between different forms of the same category
        self.category_mapping = {
            "SUPPORTING CHARACTERS": "SUPPORTING_CHARACTER",
            "SUPPORTINGCHARACTER": "SUPPORTING_CHARACTER",
            "SUPPORTING_CHARACTERS": "SUPPORTING_CHARACTER",
            "THEME": "THEME_AND_EVENTS",
            "EVENTS": "THEME_AND_EVENTS"
        }
        
        # Define tag mappings for GENRE and SETTING categories
        self.genre_tags = [
            "DRAMA", "COMEDY", "ACTION", "ROMANCE", "DETECTIVE", 
            "ADVENTURE", "THRILLER", "HISTORICAL", "HORROR", "SCIENCE_FICTION", "SLAPSTICK_COMEDY"
        ]
        
        self.setting_tags = [
            "WILD_WEST", "MODERN_AMERICAN_CITY", "MODERN_AMERICAN_TOWN", 
            "FANTASY_KINGDOM", "TROPICAL_ISLAND", "MODERN_AMERICAN_COUNTRYSIDE", 
            "ARTHURIAN_LEGENDS", "AMERICAN_CIVIL_WAR", "CARIBBEAN", "GREAT_WAR", 
            "MIDDLE_AGES", "SPACE", "UTOPIAN_FUTURISTIC_CITY", "DYSTOPIAN_FUTURISTIC_CITY", 
            "VICTORIAN_ENGLAND", "MODERN_EUROPEAN_CITY", "MODERN_EUROPEAN_TOWN", 
            "WW2_EUROPE", "WW2_PACIFIC", "WW2_AFRICA", "MODERN_EUROPEAN_COUNTRYSIDE", 
            "FREE_STATES_IN_SLAVERY-ERA", "SLAVE_STATES_IN_SLAVERY-ERA", "ANCIENT_GREECE", 
            "ANCIENT_ROME", "ANCIENT_EGYPT", "ANCIENT_CHINA", "FEUDAL_JAPAN", "RENAISSANCE"
        ]
        
        # Initialize data containers
        self.data = {}
        self.compatibility_data = {}
        self.audience_groups = {}
        self.holidays = {}
        
        # Load data
        self.load_json_data()
        self.load_compatibility_data()
        self.load_audience_groups()
        self.load_holiday_data()
    
    def fix_cyrillic_characters(self, text):
        """Replace Cyrillic characters with their Latin equivalents"""
        for cyrillic, latin in self.character_fix_map.items():
            text = text.replace(cyrillic, latin)
        return text
    
    def load_json_data(self):
        """Load JSON data from file or use sample data if file not found."""
        # Try multiple potential file paths
        possible_paths = [
            "TagsAudienceWeights.json",                     # Same directory
            os.path.join(os.path.dirname(__file__), "TagsAudienceWeights.json"),
            os.path.abspath("TagsAudienceWeights.json")     # Absolute path
        ]
        
        data_loaded = False
        for file_path in possible_paths:
            try:
                print(f"Attempting to load from: {file_path}")
                with open(file_path, "r", encoding="utf-8") as f:
                    self.data = json.load(f)
                print(f"Successfully loaded data from {file_path}")
                
                # Fix any Cyrillic characters in tag IDs and display names
                fixed_data = {}
                for tag_id, tag_info in self.data.items():
                    fixed_tag_id = self.fix_cyrillic_characters(tag_id)
                    
                    # Fix display name if present
                    if "displayName" in tag_info:
                        tag_info["displayName"] = self.fix_cyrillic_characters(tag_info["displayName"])
                    
                    fixed_data[fixed_tag_id] = tag_info
                
                self.data = fixed_data
                data_loaded = True
                break
            except (FileNotFoundError, json.JSONDecodeError) as e:
                print(f"Error loading from {file_path}: {e}")
                continue
        
        if not data_loaded:
            messagebox.showwarning(
                "File Not Found", 
                f"TagsAudienceWeights.json not found or invalid.\n"
                f"Tried paths: {', '.join(possible_paths)}\n"
                f"Current working directory: {os.getcwd()}\n"
                f"Please make sure the JSON file exists and is valid."
            )
            # Just create an empty data dictionary - no sample data
            self.data = {}
    
    def load_compatibility_data(self):
        """Load tag compatibility data from file."""
        # Try multiple potential file paths
        possible_paths = [
            "TagCompatibilityData.json",                     # Same directory
            os.path.join(os.path.dirname(__file__), "TagCompatibilityData.json"),
            os.path.abspath("TagCompatibilityData.json")     # Absolute path
        ]
        
        self.compatibility_data = {}
        data_loaded = False
        
        for file_path in possible_paths:
            try:
                print(f"Attempting to load compatibility data from: {file_path}")
                with open(file_path, "r", encoding="utf-8") as f:
                    self.compatibility_data = json.load(f)
                print(f"Successfully loaded compatibility data from {file_path}")
                
                # Fix any Cyrillic characters in tag IDs
                fixed_data = {}
                for tag_id, compat_dict in self.compatibility_data.items():
                    fixed_tag_id = self.fix_cyrillic_characters(tag_id)
                    
                    # Fix compatibility tag IDs
                    fixed_compat_dict = {}
                    for compat_tag_id, score in compat_dict.items():
                        fixed_compat_tag_id = self.fix_cyrillic_characters(compat_tag_id)
                        fixed_compat_dict[fixed_compat_tag_id] = score
                    
                    fixed_data[fixed_tag_id] = fixed_compat_dict
                
                self.compatibility_data = fixed_data
                data_loaded = True
                break
            except (FileNotFoundError, json.JSONDecodeError) as e:
                print(f"Error loading compatibility data from {file_path}: {e}")
                continue
        
        if not data_loaded:
            messagebox.showwarning(
                "File Not Found", 
                f"TagCompatibilityData.json not found or invalid.\n"
                f"Tried paths: {', '.join(possible_paths)}\n"
                f"Current working directory: {os.getcwd()}\n"
                f"Please make sure the JSON file exists and is valid."
            )
            
            # Create a sample compatibility data dictionary from the pasted info
            try:
                with open("paste.txt", "r", encoding="utf-8") as f:
                    content = f.read()
                    # Extract the JSON object from the text file
                    match = re.search(r'(\{.*\})', content, re.DOTALL)
                    if match:
                        sample_json = match.group(1)
                        # Add closing brace if needed
                        if not sample_json.rstrip().endswith('}'):
                            sample_json += '}'
                        
                        try:
                            sample_data = json.loads(sample_json)
                            self.compatibility_data = sample_data
                            print("Using sample compatibility data from paste.txt")
                            data_loaded = True
                        except json.JSONDecodeError as je:
                            print(f"Error parsing JSON from paste.txt: {je}")
                    else:
                        print("No JSON object found in paste.txt")
            except FileNotFoundError:
                print("paste.txt not found")
            
            if not data_loaded:
                # If we still don't have data, create a minimal example
                print("Using minimal example compatibility data")
                self.compatibility_data = {
                    "PROTAGONIST_COWBOY": {
                        "WILD_WEST": "5.0",
                        "MODERN_AMERICAN_CITY": "1.0",
                        "ACTION": "5.0"
                    }
                }

    def load_audience_groups(self):
        """Load audience groups data from file."""
        # Try multiple potential file paths
        possible_paths = [
            "AudienceGroups.json",                    # Same directory
            os.path.join(os.path.dirname(__file__), "AudienceGroups.json"),
            os.path.abspath("AudienceGroups.json")    # Absolute path
        ]
        
        self.audience_groups = {}
        data_loaded = False
        
        for file_path in possible_paths:
            try:
                print(f"Attempting to load audience groups data from: {file_path}")
                with open(file_path, "r", encoding="utf-8") as f:
                    self.audience_groups = json.load(f)
                print(f"Successfully loaded audience groups data from {file_path}")
                data_loaded = True
                break
            except (FileNotFoundError, json.JSONDecodeError) as e:
                print(f"Error loading audience groups data from {file_path}: {e}")
                continue
        
        if not data_loaded:
            print("AudienceGroups.json not found or invalid. Using default audience weights.")
            # Create default audience groups if file not found
            self.audience_groups = {
                "TM": {
                    "baseWeight": "0.15",
                    "artWeight": "0.05",
                    "commercialWeight": "0.2",
                    "baseDefaultAudience": "0.1",
                    "artDefaultAudience": "0.05",
                    "comDefaultAudience": "0.05",
                    "id": "TM"
                },
                "TF": {
                    "baseWeight": "0.15",
                    "artWeight": "0.05",
                    "commercialWeight": "0.2",
                    "baseDefaultAudience": "0.1",
                    "artDefaultAudience": "0.05",
                    "comDefaultAudience": "0.05",
                    "id": "TF"
                },
                "YM": {
                    "baseWeight": "0.3",
                    "artWeight": "0.4",
                    "commercialWeight": "0.25",
                    "baseDefaultAudience": "0.1",
                    "artDefaultAudience": "0.05",
                    "comDefaultAudience": "0.05",
                    "id": "YM"
                },
                "YF": {
                    "baseWeight": "0.3",
                    "artWeight": "0.3",
                    "commercialWeight": "0.25",
                    "baseDefaultAudience": "0.1",
                    "artDefaultAudience": "0.05",
                    "comDefaultAudience": "0.05",
                    "id": "YF"
                },
                "AM": {
                    "baseWeight": "0.05",
                    "artWeight": "0.1",
                    "commercialWeight": "0.1",
                    "baseDefaultAudience": "0.1",
                    "artDefaultAudience": "0.05",
                    "comDefaultAudience": "0.05",
                    "id": "AM"
                },
                "AF": {
                    "baseWeight": "0.05",
                    "artWeight": "0.1",
                    "commercialWeight": "0.1",
                    "baseDefaultAudience": "0.1",
                    "artDefaultAudience": "0.05",
                    "comDefaultAudience": "0.05",
                    "id": "AF"
                }
            }
    
    def load_holiday_data(self):
        """Load holiday data from file."""
        # Try multiple potential file paths
        possible_paths = [
            "Holidays.json",                     # Same directory
            os.path.join(os.path.dirname(__file__), "Holidays.json"),
            os.path.abspath("Holidays.json")     # Absolute path
        ]
        
        self.holidays = {}
        data_loaded = False
        
        for file_path in possible_paths:
            try:
                print(f"Attempting to load holiday data from: {file_path}")
                with open(file_path, "r", encoding="utf-8") as f:
                    self.holidays = json.load(f)
                print(f"Successfully loaded holiday data from {file_path}")
                data_loaded = True
                break
            except (FileNotFoundError, json.JSONDecodeError) as e:
                print(f"Error loading holiday data from {file_path}: {e}")
                continue
        
        if not data_loaded:
            print("Holidays.json not found or invalid. Using sample holiday data.")
            # Create sample holiday data if file not found
            self.holidays = {
                "VALENTINE": {
                    "dateType": 0,
                    "day": 14,
                    "month": 2,
                    "dayOfWeek": 0,
                    "audienceBonuses": {
                        "TM|0": "0.050", "TM|1": "0.050", "TM|2": "0.050",
                        "TF|0": "0.100", "TF|1": "0.100", "TF|2": "0.100",
                        "YM|0": "0.080", "YM|1": "0.080", "YM|2": "0.080",
                        "YF|0": "0.200", "YF|1": "0.200", "YF|2": "0.200",
                        "AM|0": "0.100", "AM|1": "0.100", "AM|2": "0.100"
                    },
                    "id": "VALENTINE"
                },
                "HALLOWEEN": {
                    "dateType": 0,
                    "day": 31,
                    "month": 10,
                    "dayOfWeek": 0,
                    "audienceBonuses": {
                        "TM|0": "0.150", "TM|1": "0.150", "TM|2": "0.150",
                        "TF|0": "0.150", "TF|1": "0.150", "TF|2": "0.150",
                        "YM|0": "0.120", "YM|1": "0.120", "YM|2": "0.120",
                        "YF|0": "0.120", "YF|1": "0.120", "YF|2": "0.120"
                    },
                    "id": "HALLOWEEN"
                }
            }
    
    def extract_category_from_tag_id(self, tag_id):
        """Extract the category from a story elements ID based on prefix or special story elements lists"""
        # Check if tag is in genre or setting lists
        if tag_id in self.genre_tags:
            return "GENRE"
        elif tag_id in self.setting_tags:
            return "SETTING"
            
        # Check for THEME or EVENTS prefixes to map to the combined category
        if tag_id.startswith("THEME_") or tag_id.startswith("EVENTS_"):
            return "THEME_AND_EVENTS"
            
        # Look for any of the main categories at the start of the tag ID
        for category in self.main_categories:
            if tag_id.startswith(category) and tag_id != category:  # Avoid matching the category itself
                return category
                
        # If we can't find a main category, try to extract the first part before an underscore
        if "_" in tag_id:
            category = tag_id.split("_")[0]
            # Check if this is an alternative form of a main category
            if category in self.category_mapping:
                return self.category_mapping[category]
            return category
                
        # Default for unknown categories
        return "OTHER"
    
    def standardize_category(self, category):
        """Convert all variations of categories to a standard form"""
        # Check if this is an alternative form of a main category
        if category in self.category_mapping:
            return self.category_mapping[category]
        return category
    
    def beautify_category_name(self, category):
        """Convert category name to a more readable format with special case handling"""
        # Handle special case for combined Theme and Events category
        if category == "THEME_AND_EVENTS":
            return "Themes & Events"
            
        # Handle special case for Supporting Character(s)
        if category in ["SUPPORTING_CHARACTER", "SUPPORTING_CHARACTERS", "SUPPORTINGCHARACTER"]:
            return "Supporting Characters"
            
        # Special case for main categories - don't modify them
        if category in self.main_categories:
            return category.replace("_", " ").title()  # Replace underscores and capitalize
            
        # Special case for acronyms and abbreviations
        special_cases = {
            "Ww2": "WW2",
            "WwII": "WWII",
            "Wwe": "WWE",
            "Fbi": "FBI",
            "Cia": "CIA",
            "Nada": "NASA",
            "Usa": "USA",
            "Uk": "UK",
            "Ai": "AI",
            "It": "IT",
            "Rpg": "RPG",
            "Fps": "FPS",
            "SciFi": "Sci-Fi",  # Special handling for SciFi
        }
        
        # Check if the category is a special case
        if category in special_cases:
            return special_cases[category]
        
        # Split by underscore if any
        parts = category.split('_')
        
        # For each part, look for camel case or all caps words and separate them
        formatted_parts = []
        for part in parts:
            # Skip empty parts
            if not part:
                continue
                
            # If the part is all uppercase and longer than 2 characters, treat it as a normal word
            if part.isupper() and len(part) > 2:
                # For all uppercase words, just convert to title case without adding spaces
                formatted_parts.append(part.title())
            else:
                # For mixed case like "SciFi" or shorter acronyms
                formatted_parts.append(part.title())
        
        # Join all parts with spaces
        result = ' '.join(formatted_parts)
        
        # Special case handling for common terms that should remain capitalized
        for abbr in special_cases.values():
            # Replace the lowercase or title case version with the proper abbreviation
            pattern = re.compile(re.escape(abbr.lower()), re.IGNORECASE)
            result = pattern.sub(abbr, result)
        
        # Fix specific words like "Sci Fi" to "Sci-Fi"
        result = result.replace("Sci Fi", "Sci-Fi")
        
        return result
    
    def beautify_tag_name(self, tag_id):
        """Convert tag ID to a more readable format with proper capitalization for special cases like WW2"""
        if tag_id in self.data and "displayName" in self.data[tag_id]:
            return self.data[tag_id]["displayName"]
        
        # Special case handling for WW2 and other acronyms that need to be preserved
        special_cases = {
            "WW2_EUROPE": "WW2 Europe",
            "WW2_PACIFIC": "WW2 Pacific",
            "WW2_AFRICA": "WW2 Africa",
            "USA": "USA",
            "UK": "UK",
            "FBI": "FBI",
            "CIA": "CIA",
            "NASA": "NASA"
        }
        
        if tag_id in special_cases:
            return special_cases[tag_id]
                
        # For tags that don't have a specific prefix like GENRE or SETTING tags
        if tag_id in self.genre_tags or tag_id in self.setting_tags:
            # For setting tags, check for special prefixes like WW2
            parts = tag_id.split('_')
            
            # Process each part to handle special cases
            formatted_parts = []
            for part in parts:
                # Special handling for known acronyms and abbreviations
                if part == "WW2":
                    formatted_parts.append("WW2")
                elif part in ["USA", "UK", "FBI", "CIA", "NASA"]:
                    formatted_parts.append(part)
                else:
                    # Standard title case for other words
                    formatted_parts.append(part.title())
            
            # Join with spaces
            return ' '.join(formatted_parts)
        
        # If no display name is provided, try to beautify the tag ID
        parts = tag_id.split('_')
        if len(parts) > 1:
            # Remove category prefix
            parts = parts[1:]
        
        # Process each part to handle special cases
        formatted_parts = []
        for part in parts:
            # Special handling for known acronyms and abbreviations
            if part == "WW2":
                formatted_parts.append("WW2")
            elif part in ["USA", "UK", "FBI", "CIA", "NASA"]:
                formatted_parts.append(part)
            else:
                # Standard title case for other words
                formatted_parts.append(part.title())
        
        # Join with spaces
        return ' '.join(formatted_parts)


class UIHelper:
    """Helper class for common UI components and utilities"""
    
    @staticmethod
    def create_scrollable_frame(parent):
        container = ttk.Frame(parent)
        container.pack(fill="both", expand=True)

        canvas = tk.Canvas(container)
        scrollbar = ttk.Scrollbar(container, orient="vertical", command=canvas.yview)
        canvas.configure(yscrollcommand=scrollbar.set)
        scrollbar.pack(side="right", fill="y")
        canvas.pack(side="left", fill="both", expand=True)

        scrollable_frame = ttk.Frame(canvas)
        scrollable_window = canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")

        def configure_scrollable_frame(event):
            canvas.configure(scrollregion=canvas.bbox("all"))
            canvas.itemconfig(scrollable_window, width=canvas.winfo_width())

        scrollable_frame.bind("<Configure>", configure_scrollable_frame)
        canvas.bind("<Configure>", lambda e: canvas.itemconfig(scrollable_window, width=e.width))

        # Windows wheel
        def _on_mousewheel(event):
            canvas.yview_scroll(int(-1 * (event.delta / 120)), "units")
        canvas.bind("<MouseWheel>", _on_mousewheel)

        # Linux wheel
        canvas.bind("<Button-4>", lambda e: canvas.yview_scroll(-1, "units"))
        canvas.bind("<Button-5>", lambda e: canvas.yview_scroll(1, "units"))

        return scrollable_frame
    
    @staticmethod
    def get_compatibility_color(score):
        """Generate color for a compatibility score between 1.0 and 5.0."""
        # Normalize score between 0 and 1
        normalized = (score - 1.0) / 4.0
        
        if normalized <= 0.5:
            # Red (0, 0, 1) to Yellow (0.16, 1, 1) in HSV
            h = 0.16 * (normalized * 2)
            s = 1.0
            v = 1.0
        else:
            # Yellow (0.16, 1, 1) to Green (0.33, 1, 0.8) in HSV
            h = 0.16 + (0.33 - 0.16) * ((normalized - 0.5) * 2)
            s = 1.0
            v = 1.0 - ((normalized - 0.5) * 0.2)  # Slightly darken as we move to green
        # Convert HSV to RGB
        r, g, b = colorsys.hsv_to_rgb(h, s, v)
        
        # Convert RGB to hex
        return f"#{int(r*255):02x}{int(g*255):02x}{int(b*255):02x}"


class CalculationEngine:
    """Contains the calculation logic for audience weights, compatibility, etc."""
    
    def __init__(self, data_manager):
        self.data_manager = data_manager
        self.audience_labels = {
            "TF": "Teen Female",
            "TM": "Teen Male",
            "YF": "Young Female",
            "YM": "Young Male",
            "AF": "Adult Female",
            "AM": "Adult Male"
        }
        
        # Define advertiser data
        self.advertisers = {
            "NBG": {
                "displayName": "NBG",
                "quality": 2,
                "targetAudience": {
                    "AF": 0,
                    "AM": 0
                }
            },
            "ROSS_AND_ROSS_BROS": {
                "displayName": "Ross & Ross Bros.",
                "quality": 1,
                "targetAudience": {
                    "AF": 0,
                    "AM": 0
                }
            },
            "VIEN_PASCAL": {
                "displayName": "Vien Pascal",
                "quality": 1,
                "targetAudience": {
                    "YM": 1,
                    "YF": 1,
                    "AM": 1,
                    "AF": 1
                }
            },
            "SPARK": {
                "displayName": "Spark",
                "quality": 2,
                "targetAudience": {
                    "YM": 2,
                    "YF": 2,
                    "AM": 2,
                    "AF": 2
                }
            },
            "NATE_SPARROW_PRESS": {
                "displayName": "Nate Sparrow Press",
                "quality": 2,
                "targetAudience": {
                    "YM": 0,
                    "YF": 0,
                    "AM": 0,
                    "AF": 0
                }
            },
            "VELVET_GLOSS": {
                "displayName": "Velvet Gloss",
                "quality": 2,
                "targetAudience": {
                    "TF": 2,
                    "YF": 2,
                    "AF": 2
                }
            },
            "PIERRE_ZOLA_COMPANY": {
                "displayName": "Pierre Zola Company",
                "quality": 1,
                "targetAudience": {
                    "TM": 2,
                    "YM": 2,
                    "AM": 2
                }
            },
            "SPICE_MICE": {
                "displayName": "Spice Mice",
                "quality": 1,
                "targetAudience": {
                    "TM": 2,
                    "TF": 2,
                    "YM": 2,
                    "YF": 2
                }
            }
        }
    
    def validate_mandatory(self, selected_tags):
        """
        Checks whether the mandatory categories are present among the selected tags.
        Returns a list of missing mandatory categories.
        """
        # Update mandatory categories to use combined THEME_AND_EVENTS
        mandatory = {
            'PROTAGONIST': False,
            'GENRE': False,
            'SETTING': False
        }
        
        for tag_id in selected_tags:
            # Extract and standardize category
            raw_category = self.data_manager.extract_category_from_tag_id(tag_id)
            category = self.data_manager.standardize_category(raw_category)
            
            if category in mandatory:
                mandatory[category] = True
        
        missing = [self.data_manager.beautify_category_name(key) for key, present in mandatory.items() if not present]
        return missing
    
    def calculate_advertiser_bonuses(self, audience_weights):
        """Calculate the bonus for each advertiser based on interested audiences (weight >= 2.5)"""
        # First, identify which audiences have significant interest (weight >= 2.5)
        # Changed from > 1 to >= 2.5 to better represent true interest on the 1-5 scale
        interested_audiences = [aud for aud, weight in audience_weights.items() if weight >= 2.5]
        
        # If no audiences have weight >= 2.5, use top audiences instead (up to 2)
        if not interested_audiences and audience_weights:
            # Sort audiences by weight in descending order and take top 2
            sorted_audiences = sorted(audience_weights.items(), key=lambda x: x[1], reverse=True)
            # Only include audiences with at least some interest (weight > 0)
            interested_audiences = [aud for aud, weight in sorted_audiences[:2] if weight > 0]
        
        advertiser_matches = {}
        
        for adv_id, adv_data in self.advertisers.items():
            display_name = adv_data["displayName"]
            quality = adv_data["quality"]
            target_audience = adv_data["targetAudience"]
            
            # Check how many interested audiences this advertiser targets
            targeted_interested_audiences = set(target_audience.keys()).intersection(set(interested_audiences))
            
            # Calculate a match score based on:
            # 1. How many interested audiences they target
            # 2. The base quality of the advertiser
            # 3. The score type (importance) given to each audience
            match_score = 0
            if targeted_interested_audiences:
                # Start with base quality
                match_score = quality
                
                # Add points for each interested audience they target
                for aud in targeted_interested_audiences:
                    score_type = target_audience[aud]
                    audience_weight = audience_weights[aud]
                    match_score += score_type * audience_weight
                    
                advertiser_matches[adv_id] = {
                    "displayName": display_name,
                    "match_score": match_score,
                    "quality": quality,
                    "targetAudience": target_audience,
                    "interested_audiences_targeted": list(targeted_interested_audiences)
                }
            else:
                # If advertiser doesn't target any interested audiences, still give it a minimal score
                # based on its quality, so it can appear in fallback results
                advertiser_matches[adv_id] = {
                    "displayName": display_name,
                    "match_score": quality * 0.5,  # Half the quality as base score
                    "quality": quality,
                    "targetAudience": target_audience,
                    "interested_audiences_targeted": []
                }
        
        # Sort advertisers by match score in descending order
        sorted_advertisers = sorted(
            advertiser_matches.items(), 
            key=lambda x: x[1]["match_score"], 
            reverse=True
        )
        
        return sorted_advertisers, interested_audiences

    def calculate_artistic_and_commercial_scores(self, audience_weights):
        """Calculate artistic and commercial scores based on audience weights and audience group data"""
        artistic_score = 0
        commercial_score = 0
        
        # For each audience group, calculate contribution to artistic and commercial scores
        for audience_id, weight in audience_weights.items():
            if audience_id in self.data_manager.audience_groups:
                group_data = self.data_manager.audience_groups[audience_id]
                
                # Calculate artistic score contribution
                art_weight = float(group_data.get("artWeight", "0"))
                artistic_score += weight * art_weight * 5  # Scale to 1-5 range
                
                # Calculate commercial score contribution
                com_weight = float(group_data.get("commercialWeight", "0"))
                commercial_score += weight * com_weight * 5  # Scale to 1-5 range
        
        # Ensure scores are in 1-5 range
        artistic_score = max(1, min(5, artistic_score))
        commercial_score = max(1, min(5, commercial_score))
        
        return artistic_score, commercial_score
    
    def get_holiday_display_date(self, holiday):
        """Get a user-friendly display date for a holiday."""
        # Convert month number to name
        month_names = [
            "January", "February", "March", "April", "May", "June", 
            "July", "August", "September", "October", "November", "December"
        ]
        month_name = month_names[holiday["month"] - 1]
        
        # For fixed date holidays (dateType=0)
        if holiday["dateType"] == 0:
            return f"{month_name} {holiday['day']}"
        
        # For Nth day of week in month (dateType=1)
        elif holiday["dateType"] == 1:
            day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
            day_name = day_names[holiday["dayOfWeek"]]
            
            # Get which occurrence (1st, 2nd, 3rd, 4th, Last)
            occurrence = holiday["day"]
            if occurrence == 1:
                occurrence_str = "1st"
            elif occurrence == 2:
                occurrence_str = "2nd"
            elif occurrence == 3:
                occurrence_str = "3rd"
            elif occurrence == 4:
                occurrence_str = "4th"
            elif occurrence == 5:
                occurrence_str = "Last"
            else:
                occurrence_str = f"{occurrence}th"
            
            return f"{occurrence_str} {day_name} of {month_name}"
        
        # Unknown date type
        else:
            return f"{month_name} {holiday['day']}"
        
    def calculate_holiday_scores(self, audience_weights):
        """Calculate how well each holiday matches the audience weights."""
        if not self.data_manager.holidays:
            return []
        
        holiday_scores = {}
        
        for holiday_id, holiday_data in self.data_manager.holidays.items():
            # Convert display name from ID
            display_name = holiday_id.replace("_", " ").title()
            
            # Calculate total score for this holiday based on audience matches
            total_score = 0
            match_factors = []
            
            for audience_id, audience_weight in audience_weights.items():
                # Skip if the audience has low weight (less than 2.0)
                if audience_weight < 2.0:
                    continue
                    
                # Check all weight types (base, artistic, commercial)
                for weight_type in ["0", "1", "2"]:
                    bonus_key = f"{audience_id}|{weight_type}"
                    if bonus_key in holiday_data["audienceBonuses"]:
                        bonus = float(holiday_data["audienceBonuses"][bonus_key])
                        
                        # Weight the bonus by the audience weight and add to total
                        weighted_bonus = bonus * audience_weight
                        total_score += weighted_bonus
                        
                        # If this is a significant bonus, add it to match factors
                        if weighted_bonus > 0.08:  # Threshold for significance
                            audience_name = self.audience_labels.get(audience_id, audience_id)
                            # Include both the audience name and the actual weighted score
                            match_factors.append({
                                "audience": audience_name,
                                "bonus": weighted_bonus,
                                "display": f"{audience_name} (+{weighted_bonus:.2f})"
                            })
            
            # Add this holiday to the scores dictionary
            display_date = self.get_holiday_display_date(holiday_data)
            
            # Sort match factors by bonus value in descending order
            sorted_match_factors = sorted(match_factors, key=lambda x: x["bonus"], reverse=True)
            display_match_factors = [factor["display"] for factor in sorted_match_factors]
            
            holiday_scores[holiday_id] = {
                "display_name": display_name,
                "display_date": display_date,
                "total_score": total_score,
                "match_factors": display_match_factors,
                "audience_matches": sorted_match_factors
            }
        
        # Sort holidays by score in descending order
        sorted_holidays = sorted(
            holiday_scores.items(),
            key=lambda x: x[1]["total_score"],
            reverse=True
        )
        
        return sorted_holidays


class AdvertiserTab:
    """Manages the Advertiser Compatibility tab"""
    
    def __init__(self, parent, data_manager, calculation_engine):
        self.parent = parent
        self.data_manager = data_manager
        self.calculation_engine = calculation_engine
        
        # Create frames
        self.left_frame = ttk.Frame(parent, padding="10")
        self.left_frame.grid(row=0, column=0, sticky="nsew")
        
        self.right_frame = ttk.Frame(parent, padding="10")
        self.right_frame.grid(row=0, column=1, sticky="nsew")
        
        # Configure layout
        self.left_frame.columnconfigure(0, weight=1)
        self.left_frame.rowconfigure(2, weight=1)  # Make tags frame expandable
        
        self.right_frame.columnconfigure(0, weight=1)
        
        # Adjust row weights in the right frame to give better distribution
        for i in range(4):
            # Give more weight to the text areas
            if i in [1, 3]:  # These are the scrolledtext widgets
                self.right_frame.rowconfigure(i, weight=5)
            else:
                self.right_frame.rowconfigure(i, weight=1)
        
        # Variables
        self.file_path_var = tk.StringVar(value="TagsAudienceWeights.json")
        self.search_var = tk.StringVar()
        self.tag_vars = {}
        self.tag_checkbuttons = {}
        self.category_tabs = {}
        self.category_frames = {}
        
        # Create widgets
        self.create_widgets()
    
    def create_widgets(self):
        """Create widgets for the Advertiser tab"""
        # Add file path input
        file_frame = ttk.Frame(self.left_frame)
        file_frame.grid(row=0, column=0, sticky="ew", padx=5, pady=5)
        
        ttk.Label(file_frame, text="JSON File Path:").grid(row=0, column=0, sticky="w", padx=5, pady=2)
        
        file_entry = ttk.Entry(file_frame, textvariable=self.file_path_var, width=30)
        file_entry.grid(row=0, column=1, sticky="ew", padx=5, pady=2)
        
        load_button = ttk.Button(file_frame, text="Load File", command=self.load_file)
        load_button.grid(row=0, column=2, sticky="e", padx=5, pady=2)
        
        # Add search bar
        search_frame = ttk.Frame(self.left_frame)
        search_frame.grid(row=1, column=0, sticky="ew", padx=5, pady=5)
        
        ttk.Label(search_frame, text="Search Story Element:").grid(row=0, column=0, sticky="w", padx=5, pady=2)
        
        self.search_var.trace("w", self.filter_tags)
        search_entry = ttk.Entry(search_frame, textvariable=self.search_var, width=30)
        search_entry.grid(row=0, column=1, sticky="ew", padx=5, pady=2)
        
        search_clear_button = ttk.Button(search_frame, text="Clear Search", command=self.clear_search)
        search_clear_button.grid(row=0, column=2, sticky="e", padx=5, pady=2)
        
        # Add clear selections button
        clear_selections_button = ttk.Button(search_frame, text="Clear Selections", command=self.clear_selections)
        clear_selections_button.grid(row=0, column=3, sticky="e", padx=5, pady=2)
        
        # Create notebook for tag categories
        self.tags_frame = ttk.Frame(self.left_frame)
        self.tags_frame.grid(row=2, column=0, sticky="nsew", padx=5, pady=5)
        
        self.category_notebook = ttk.Notebook(self.tags_frame)
        self.category_notebook.pack(fill="both", expand=True)
        
        # Build tag widgets in tabs
        self.build_tag_widgets()
        
        # Add calculate button
        self.calculate_button = ttk.Button(
            self.left_frame, 
            text="Calculate",
            command=self.calculate_weights
        )
        self.calculate_button.grid(row=3, column=0, pady=10)
        
        # Right frame - Advertiser & Audience Results
        ttk.Label(self.right_frame, text="Advertiser & Audience Results", font=("Arial", 12, "bold")).grid(row=0, column=0, pady=5, sticky="w")
        
        # Create a scrollable text area for advertiser results
        adv_frame = ttk.Frame(self.right_frame)
        adv_frame.grid(row=1, column=0, sticky="nsew", pady=5)
        
        self.advertiser_text = scrolledtext.ScrolledText(adv_frame, width=40, height=20, wrap=tk.WORD)
        self.advertiser_text.pack(fill="both", expand=True)
        
        # Bind mousewheel events specifically to the advertiser text widget
        self.advertiser_text.bind("<MouseWheel>", lambda e: self.advertiser_text.yview_scroll(int(-1*(e.delta/120)), "units"))
        
        # Selected tags display
        ttk.Label(self.right_frame, text="Selected Tags:", font=("Arial", 10, "bold")).grid(row=2, column=0, sticky="w", pady=5)
        
        # Create a scrollable text area for selected tags
        tags_result_frame = ttk.Frame(self.right_frame)
        tags_result_frame.grid(row=3, column=0, sticky="nsew", pady=5)
        
        self.selected_tags_text = scrolledtext.ScrolledText(tags_result_frame, width=40, height=20, wrap=tk.WORD)
        self.selected_tags_text.pack(fill="both", expand=True)
        
        # Bind mousewheel events specifically to the selected tags text widget
        self.selected_tags_text.bind("<MouseWheel>", lambda e: self.selected_tags_text.yview_scroll(int(-1*(e.delta/120)), "units"))
    
    def build_tag_widgets(self):
        """Build tag widgets organized in tabs by category with improved layout"""
        # Group tags by category
        categories = {}
        for tag_id, tag_data in self.data_manager.data.items():
            # Extract category from tag ID
            raw_category = self.data_manager.extract_category_from_tag_id(tag_id)
            
            # Standardize category name
            category = self.data_manager.standardize_category(raw_category)
            
            if category not in categories:
                categories[category] = []
            categories[category].append((tag_id, tag_data))
        
        # Sort categories: main categories first, then rest alphabetically
        sorted_categories = []
        
        # Add main categories in specified order
        for cat in self.data_manager.main_categories:
            if cat in categories:
                sorted_categories.append(cat)
        
        # Add remaining categories alphabetically
        remaining_categories = [cat for cat in categories.keys() if cat not in self.data_manager.main_categories]
        sorted_categories.extend(sorted(remaining_categories))
        
        # Create a tab for each category
        for category in sorted_categories:
            if category not in categories:
                continue
                
            tags = categories[category]
            
            # Create a tab for this category with beautified name
            tab = ttk.Frame(self.category_notebook)
            beautified_cat_name = self.data_manager.beautify_category_name(category)
            self.category_notebook.add(tab, text=beautified_cat_name)
            self.category_tabs[category] = tab
            
            # Create a scrollable frame inside the tab
            scrollable_frame = UIHelper.create_scrollable_frame(tab)
            self.category_frames[category] = scrollable_frame
            
            # Sort tags alphabetically by display name
            sorted_tags = sorted(tags, key=lambda x: x[1].get("displayName", x[0]))
            
            # Create a grid layout frame to contain the checkbuttons
            grid_frame = ttk.Frame(scrollable_frame)
            grid_frame.pack(fill="both", expand=True, padx=5, pady=5)
            
            # Configure the grid to have at least two columns
            grid_frame.columnconfigure(0, weight=1)
            grid_frame.columnconfigure(1, weight=1)
            
            # Determine number of items per column
            items_per_column = max(3, (len(sorted_tags) + 1) // 2)
            
            # Create checkbuttons for each tag
            for i, (tag_id, tag_data) in enumerate(sorted_tags):
                display_name = tag_data.get("displayName", self.data_manager.beautify_tag_name(tag_id))
                
                # Calculate row and column
                row = i % items_per_column
                col = i // items_per_column
                
                var = tk.BooleanVar(value=False)
                self.tag_vars[tag_id] = var
                
                cb = ttk.Checkbutton(
                    grid_frame, 
                    text=display_name,
                    variable=var
                )
                cb.grid(row=row, column=col, sticky="w", padx=5, pady=2)
                
                # Store reference to checkbutton for search filtering
                self.tag_checkbuttons[tag_id] = cb
    
    def rebuild_tag_widgets(self):
        """Rebuild tag widgets with current data"""
        # Clear the notebook
        for tab_id in self.category_notebook.tabs():
            self.category_notebook.forget(tab_id)
            
        # Clear dictionaries
        self.category_tabs = {}
        self.category_frames = {}
        self.tag_vars = {}
        self.tag_checkbuttons = {}
        
        # Rebuild
        self.build_tag_widgets()
    
    def load_file(self):
        """Load JSON data from the specified file path."""
        file_path = self.file_path_var.get()
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                new_data = json.load(f)
            
            # Fix any Cyrillic characters in tag IDs and display names
            fixed_data = {}
            for tag_id, tag_info in new_data.items():
                fixed_tag_id = self.data_manager.fix_cyrillic_characters(tag_id)
                
                # Fix display name if present
                if "displayName" in tag_info:
                    tag_info["displayName"] = self.data_manager.fix_cyrillic_characters(tag_info["displayName"])
                
                fixed_data[fixed_tag_id] = tag_info
            
            # Update data
            self.data_manager.data = fixed_data
            messagebox.showinfo("Success", f"Successfully loaded data from {file_path}")
            
            # Rebuild tag widgets
            self.rebuild_tag_widgets()
        except FileNotFoundError:
            messagebox.showerror("Error", f"File not found: {file_path}")
        except json.JSONDecodeError:
            messagebox.showerror("Error", f"Invalid JSON file: {file_path}")
        except Exception as e:
            messagebox.showerror("Error", f"Error loading file: {str(e)}")
    
    def filter_tags(self, *args):
        """Filter tags based on search term"""
        search_term = self.search_var.get().lower()
        
        # Start by showing all tags
        for tag_id, checkbutton in self.tag_checkbuttons.items():
            checkbutton.grid()
        
        if not search_term:
            return
        
        # Count how many tags are shown/hidden in each tab
        visible_tags_per_tab = {cat: 0 for cat in self.category_tabs}
        total_tags_per_tab = {cat: 0 for cat in self.category_tabs}
        
        # Hide checkboxes that don't match the search term
        for tag_id, checkbutton in self.tag_checkbuttons.items():
            tag_data = self.data_manager.data.get(tag_id, {})
            display_name = tag_data.get("displayName", tag_id)
            
            # Extract category from tag ID for search
            category = self.data_manager.extract_category_from_tag_id(tag_id)
            standardized_category = self.data_manager.standardize_category(category)
            beautified_category = self.data_manager.beautify_category_name(category)
            
            # Get the original tag name for the tag
            original_tag_name = self.data_manager.beautify_tag_name(tag_id)
            
            # Increment total tags counter for this category
            if standardized_category in total_tags_per_tab:
                total_tags_per_tab[standardized_category] += 1
            
            # Check if search term matches any of the following:
            # 1. Tag ID
            # 2. Display name
            # 3. Category name (raw, standardized, or beautified)
            # 4. Original tag name extracted from tag ID
            match_found = (
                search_term in tag_id.lower() or
                search_term in display_name.lower() or
                search_term in category.lower() or
                search_term in standardized_category.lower() or
                search_term in beautified_category.lower() or
                search_term in original_tag_name.lower()
            )
            
            if not match_found:
                checkbutton.grid_remove()
            else:
                # Increment visible tags counter for this category
                if standardized_category in visible_tags_per_tab:
                    visible_tags_per_tab[standardized_category] += 1
        
        # Make sure the appropriate tab is visible if it has matching tags
        if search_term:
            # Find the first tab with visible tags
            first_visible_tab = None
            for category, count in visible_tags_per_tab.items():
                if count > 0:
                    first_visible_tab = category
                    break
            
            # Select the first tab with visible tags
            if first_visible_tab and first_visible_tab in self.category_tabs:
                tab_id = self.category_notebook.index(self.category_tabs[first_visible_tab])
                self.category_notebook.select(tab_id)
                
                # Show a status message about search results
                total_visible = sum(visible_tags_per_tab.values())
                total_tags = sum(total_tags_per_tab.values())
                print(f"Search results: {total_visible} matching story elements found out of {total_tags} total story elements")
    
    def clear_search(self):
        """Clear the search field and show all tags"""
        self.search_var.set("")
        
        # Show all checkboxes
        for checkbutton in self.tag_checkbuttons.values():
            checkbutton.grid()
    
    def clear_selections(self, show_message: bool = True):
        """Clear all selected checkboxes across all tabs"""
        # Set all tag variables to False
        for tag_id, var in self.tag_vars.items():
            var.set(False)
        
        # Clear the results and selected tags display
        self.advertiser_text.config(state=tk.NORMAL)
        self.advertiser_text.delete(1.0, tk.END)
        self.advertiser_text.config(state=tk.DISABLED)
        
        self.selected_tags_text.config(state=tk.NORMAL)
        self.selected_tags_text.delete(1.0, tk.END)
        self.selected_tags_text.config(state=tk.DISABLED)

        if show_message:
            # Show a message to confirm selections were cleared
            messagebox.showinfo("Selections Cleared", "All story element selections have been cleared.")
    
    def calculate_weights(self):
        """Calculate audience weights based on selected tags."""
        # Get selected tags
        selected_tags = [tag_id for tag_id, var in self.tag_vars.items() if var.get()]
        
        if not selected_tags:
            messagebox.showwarning("No Story Elements Selected", "Please select at least one story element.")
            return
        
        # Validate mandatory categories
        missing = self.calculation_engine.validate_mandatory(selected_tags)
        
        # Clear result areas
        self.advertiser_text.config(state=tk.NORMAL)
        self.advertiser_text.delete(1.0, tk.END)
        
        self.selected_tags_text.config(state=tk.NORMAL)
        self.selected_tags_text.delete(1.0, tk.END)
        
        # Show warning if mandatory categories are missing
        if missing:
            warning_msg = f"Warning: You have not selected story elements for the following mandatory categories: {', '.join(missing)}\n\n"
            self.advertiser_text.insert(tk.END, warning_msg, "warning")
            self.advertiser_text.tag_configure("warning", foreground="red")
        
        # Gather valid tag weights
        valid_tags = {}
        for tag_id in selected_tags:
            if tag_id in self.data_manager.data:
                valid_tags[tag_id] = self.data_manager.data[tag_id]["weights"]
                display_name = self.data_manager.data[tag_id].get("displayName", self.data_manager.beautify_tag_name(tag_id))
                category = self.data_manager.extract_category_from_tag_id(tag_id)
                beautified_category = self.data_manager.beautify_category_name(category)
                self.selected_tags_text.insert(tk.END, f"{beautified_category}: {display_name}\n")
        
        if not valid_tags:
            self.advertiser_text.insert(tk.END, "No valid story elements selected. Please try again.")
            return
        
        # Define audience categories
        audience_categories = ["TF", "TM", "YF", "YM", "AF", "AM"]
        
        # Calculate overall averages for each audience category
        overall_averages = {aud: 0 for aud in audience_categories}
        tag_count = len(valid_tags)
        
        for weights in valid_tags.values():
            for aud in audience_categories:
                # Convert string weights to float
                weight_value = float(weights.get(aud, "0"))
                overall_averages[aud] += weight_value
        
        for aud in overall_averages:
            overall_averages[aud] /= tag_count
        
        # Sort the overall averages in descending order
        sorted_overall = sorted(overall_averages.items(), key=lambda x: x[1], reverse=True)
        
        # Calculate artistic and commercial scores
        artistic_score, commercial_score = self.calculation_engine.calculate_artistic_and_commercial_scores(overall_averages)
        
        # Calculate advertiser matches based on audience weights
        sorted_advertisers, interested_audiences = self.calculation_engine.calculate_advertiser_bonuses(overall_averages)

        holiday_recommendations = self.calculation_engine.calculate_holiday_scores(overall_averages)
        
        # Display scores and information in a formatted way
        self.advertiser_text.insert(tk.END, "CONTENT EVALUATION SCORES\n", "section_header")
        self.advertiser_text.tag_configure("section_header", font=("Arial", 11, "bold"))
        
        self.advertiser_text.insert(tk.END, f"Commercial Score: ", "label")
        self.advertiser_text.insert(tk.END, f"{commercial_score:.2f}/5.0\n", "score")
        
        self.advertiser_text.insert(tk.END, f"Artistic Score: ", "label")
        self.advertiser_text.insert(tk.END, f"{artistic_score:.2f}/5.0\n\n", "score")
        
        self.advertiser_text.tag_configure("label", font=("Arial", 10, "bold"))
        self.advertiser_text.tag_configure("score", font=("Arial", 10))
        
        # Display interested audiences with their weights
        self.advertiser_text.insert(tk.END, "TARGET AUDIENCES\n", "section_header")
        
        if interested_audiences:
            # Create a list of audience names with their weights for display
            for aud_code in interested_audiences:
                aud_name = self.calculation_engine.audience_labels.get(aud_code, aud_code)
                aud_weight = overall_averages[aud_code]
                self.advertiser_text.insert(tk.END, f"• {aud_name}: ", "audience")
                self.advertiser_text.insert(tk.END, f"{aud_weight:.2f}/5.0\n", "audience_score")
            
            # If using fallback logic (no audiences >= 2.5), mention this
            if all(overall_averages[aud] < 2.5 for aud in interested_audiences):
                self.advertiser_text.insert(tk.END, "\nNote: No audiences showed strong interest (weight ≥ 2.5). Using top audiences instead.\n")
        else:
            self.advertiser_text.insert(tk.END, "No audiences showed any interest (all weights = 0).\n")
        
        self.advertiser_text.tag_configure("audience", font=("Arial", 10, "bold"))
        self.advertiser_text.tag_configure("audience_score", font=("Arial", 10))
        
        # Display advertiser ranking in simplified format
        self.advertiser_text.insert(tk.END, "\nBEST ADVERTISERS\n", "section_header")
        
        # Filter advertisers to only include those with match_score > 13
        filtered_advertisers = [(adv_id, adv_data) for adv_id, adv_data in sorted_advertisers if adv_data["match_score"] > 13]
        
        # If no advertisers have score > 13, use fallback to show the top 3 advertisers regardless of score
        if not filtered_advertisers and sorted_advertisers:
            filtered_advertisers = sorted_advertisers[:3]  # Get top 3 advertisers
            self.advertiser_text.insert(tk.END, "No advertisers met the high quality threshold. Showing top advertisers:\n\n")
        
        if filtered_advertisers:
            for adv_id, adv_data in filtered_advertisers:
                display_name = adv_data["displayName"]
                match_score = adv_data["match_score"]
                # Include score in display for more transparency
                self.advertiser_text.insert(tk.END, f"➤ {display_name} ", "advertiser")
                self.advertiser_text.insert(tk.END, f"(score: {match_score:.1f})\n", "advertiser_score")
        else:
            self.advertiser_text.insert(tk.END, "No suitable advertisers found for the selected tags.\n")

        # Display holiday recommendations in a structured section
        self.advertiser_text.insert(tk.END, "\n" + "="*40 + "\n", "section_divider")
        self.advertiser_text.insert(tk.END, "BEST HOLIDAYS TO RELEASE\n", "section_header")
        self.advertiser_text.insert(tk.END, "="*40 + "\n", "section_divider")

        if holiday_recommendations:
            # Display the top 3 holidays or all if less than 3
            for i, (holiday_id, holiday_data) in enumerate(holiday_recommendations[:3]):
                display_name = holiday_data["display_name"]
                display_date = holiday_data["display_date"]
                score = holiday_data["total_score"] * 10  # Scale up for display
                
                # Determine a star rating (1-5) based on the score
                # Normalize to a 1-5 range assuming max possible score is around 1.0
                star_rating = max(1, min(5, int(score / 2) + 1))
                stars = "★" * star_rating + "☆" * (5 - star_rating)
                
                self.advertiser_text.insert(tk.END, f"{i+1}. {display_name} ({display_date}): ", "holiday")
                self.advertiser_text.insert(tk.END, f"{stars}\n", "holiday_stars")
                
                # List the top match factors (if any)
                if holiday_data["match_factors"]:
                    # Only display match factors for audiences that are actually in the target audience list
                    relevant_matches = []
                    for match in holiday_data["audience_matches"]:
                        # Extract the audience code from the audience name
                        audience_name = match["audience"]
                        audience_code = None
                        
                        # Find the original audience code by matching with audience_labels
                        for code, label in self.calculation_engine.audience_labels.items():
                            if label == audience_name:
                                audience_code = code
                                break
                        
                        # Only include if it's a significant audience in the overall profile
                        if audience_code and audience_code in overall_averages and overall_averages[audience_code] >= 2.5:
                            relevant_matches.append(match["display"])
                    
                    if relevant_matches:
                        # Take top 2 relevant matches
                        match_text = ", ".join(relevant_matches[:2])
                        if len(relevant_matches) > 2:
                            match_text += ", ..."
                        self.advertiser_text.insert(tk.END, f"   Audience matches: {match_text}\n", "holiday_factors")
                    else:
                        # No relevant matches found, show generic message
                        self.advertiser_text.insert(tk.END, f"   General audience appeal\n", "holiday_factors")
                
                # Add a line break between holidays for better readability
                if i < min(2, len(holiday_recommendations) - 1):
                    self.advertiser_text.insert(tk.END, "\n")
        else:
            self.advertiser_text.insert(tk.END, "No holiday recommendations available.\n")
        
        # Add tag configurations for the new text elements
        self.advertiser_text.tag_configure("section_divider", font=("Arial", 10))
        self.advertiser_text.tag_configure("holiday", font=("Arial", 10, "bold"))
        self.advertiser_text.tag_configure("holiday_stars", font=("Arial", 10))
        self.advertiser_text.tag_configure("holiday_factors", font=("Arial", 9, "italic"))

        # Make text areas read-only
        self.advertiser_text.config(state=tk.DISABLED)
        self.selected_tags_text.config(state=tk.DISABLED)

    def select_tags(self, tags):
        """ Select given tags """
        for tag_id, var in self.tag_vars.items():
            if tag_id in tags:
                var.set(True)


class CompatibilityTab:
    """Manages the Story Element Compatibility tab"""
    
    def __init__(self, parent, data_manager):
        self.parent = parent
        self.data_manager = data_manager
        
        # Create frames
        self.left_frame = ttk.Frame(parent, padding="10")
        self.left_frame.grid(row=0, column=0, sticky="nsew")
        
        self.right_frame = ttk.Frame(parent, padding="10")
        self.right_frame.grid(row=0, column=1, sticky="nsew")
        
        # Configure layout
        self.left_frame.columnconfigure(0, weight=1)
        self.left_frame.rowconfigure(2, weight=1)  # Make tags frame expandable
        
        self.right_frame.columnconfigure(0, weight=1)
        self.right_frame.rowconfigure(1, weight=1)
        
        # Variables
        self.compat_file_path_var = tk.StringVar(value="TagCompatibilityData.json")
        self.compat_search_var = tk.StringVar()
        self.compat_tag_vars = {}
        self.compat_tag_checkbuttons = {}
        self.compat_tag_labels = {}
        self.compat_category_tabs = {}
        self.compat_category_frames = {}
        
        # Create widgets
        self.create_widgets()
    
    def create_widgets(self):
        """Create widgets for the Tag Compatibility tab."""
        # Create a notebook for compatibility sub-tabs
        self.compat_notebook = ttk.Notebook(self.left_frame)
        self.compat_notebook.grid(row=2, column=0, sticky="nsew", padx=5, pady=5)
        
        # Create sub-tabs for "Tag Selection"
        self.compat_selection_tab = ttk.Frame(self.compat_notebook)
        self.compat_notebook.add(self.compat_selection_tab, text="Story Element Selection")
        
        # File path for compatibility data
        compat_file_frame = ttk.Frame(self.left_frame)
        compat_file_frame.grid(row=0, column=0, sticky="ew", padx=5, pady=5)
        
        ttk.Label(compat_file_frame, text="Compatibility Data File:").grid(row=0, column=0, sticky="w", padx=5, pady=2)
        
        compat_file_entry = ttk.Entry(compat_file_frame, textvariable=self.compat_file_path_var, width=30)
        compat_file_entry.grid(row=0, column=1, sticky="ew", padx=5, pady=2)
        
        compat_load_button = ttk.Button(compat_file_frame, text="Load Compatibility", command=self.load_compatibility_file)
        compat_load_button.grid(row=0, column=2, sticky="e", padx=5, pady=2)
        
        # Search frame for compatibility
        compat_search_frame = ttk.Frame(self.left_frame)
        compat_search_frame.grid(row=1, column=0, sticky="ew", padx=5, pady=5)
        
        # Configure columns to distribute space better
        compat_search_frame.columnconfigure(1, weight=1)  # Make search entry expandable
        
        # Top row - Search and clear search
        ttk.Label(compat_search_frame, text="Search Story Elements:").grid(row=0, column=0, sticky="w", padx=5, pady=2)
        
        self.compat_search_var.trace("w", self.filter_compatibility_tags)
        compat_search_entry = ttk.Entry(compat_search_frame, textvariable=self.compat_search_var, width=30)
        compat_search_entry.grid(row=0, column=1, sticky="ew", padx=5, pady=2)
        
        compat_search_clear_button = ttk.Button(compat_search_frame, text="Clear Search", command=self.clear_compatibility_search)
        compat_search_clear_button.grid(row=0, column=2, sticky="e", padx=5, pady=2)
        
        # Bottom row - Additional buttons
        # Add clear selections button
        compat_clear_selections_button = ttk.Button(compat_search_frame, text="Clear Selections", command=self.clear_compatibility_selections)
        compat_clear_selections_button.grid(row=1, column=0, sticky="w", padx=5, pady=2)
        
        # Add view matrix button in a more visible location
        view_matrix_button = ttk.Button(
            compat_search_frame, 
            text="View Matrix", 
            command=self.show_tag_compatibility_matrix
        )
        view_matrix_button.grid(row=1, column=1, sticky="w", padx=5, pady=2)
        
        # Create notebook for compatibility tag categories inside Tag Selection tab
        self.compat_tags_frame = ttk.Frame(self.compat_selection_tab)
        self.compat_tags_frame.pack(fill="both", expand=True)
        
        self.compat_category_notebook = ttk.Notebook(self.compat_tags_frame)
        self.compat_category_notebook.pack(fill="both", expand=True)
        
        # Build compatibility tag widgets in tabs
        self.build_compatibility_tag_widgets()

        # Right frame - Compatibility Legend and Selected Tags
        ttk.Label(self.right_frame, text="Compatibility Legend", font=("Arial", 12, "bold")).grid(row=0, column=0, pady=5, sticky="w")
        
        # Create legend frame
        legend_frame = ttk.Frame(self.right_frame)
        legend_frame.grid(row=1, column=0, sticky="ew", pady=5)
        
        # Create compatibility legend with color squares
        self.create_compatibility_legend(legend_frame)
        
        # Add average score display
        score_frame = ttk.Frame(self.right_frame)
        score_frame.grid(row=2, column=0, sticky="ew", pady=5)
        
        ttk.Label(score_frame, text="Average Compatibility Score:", font=("Arial", 10, "bold")).pack(side="left", padx=5)
        
        # Create a frame to show the score with colored background
        self.score_display_frame = ttk.Frame(score_frame, width=60, height=25)
        self.score_display_frame.pack(side="left", padx=5)
        self.score_display_frame.pack_propagate(False)  # Prevent frame from shrinking
        
        # Label inside the frame for the score
        self.score_display_label = tk.Label(
            self.score_display_frame,
            text="N/A",
            background="#cccccc",
            width=5,
            font=("Arial", 10, "bold")
        )
        self.score_display_label.pack(fill="both", expand=True)

        # Button to export selected tags from CompatibilityTab to AdvertiserTab
        self.export_to_advertiser_tab_button = ttk.Button(score_frame, text="Export to AdvertisersTab", command=self.export_to_advertisers_tab)
        self.export_to_advertiser_tab_button.pack(side="left", padx=5)
        
        # Selected tags display
        ttk.Label(self.right_frame, text="Selected Tags:", font=("Arial", 10, "bold")).grid(row=3, column=0, sticky="w", pady=5)
        
        # Create a scrollable text area for selected compatibility tags
        compat_tags_result_frame = ttk.Frame(self.right_frame)
        compat_tags_result_frame.grid(row=4, column=0, sticky="nsew", pady=5)
        
        self.compat_selected_tags_text = scrolledtext.ScrolledText(compat_tags_result_frame, width=40, height=20, wrap=tk.WORD)
        self.compat_selected_tags_text.pack(fill="both", expand=True)
        
        # Bind mousewheel events
        self.compat_selected_tags_text.bind("<MouseWheel>", lambda e: self.compat_selected_tags_text.yview_scroll(int(-1*(e.delta/120)), "units"))
    
    def create_compatibility_legend(self, parent_frame):
        """Create a legend showing compatibility color coding."""
        legend_canvas = tk.Canvas(parent_frame, width=400, height=50)
        legend_canvas.pack(fill="x", padx=10, pady=10)
        
        # Create gradient bar
        width = 350
        for i in range(width):
            # Map position to compatibility score (1.0 to 5.0)
            score = 1.0 + (i / width) * 4.0
            
            # Get color for this score
            color = UIHelper.get_compatibility_color(score)
            
            # Draw a vertical line in this color
            legend_canvas.create_line(20 + i, 10, 20 + i, 30, fill=color)
        
        # Add labels
        legend_canvas.create_text(20, 40, text="1.0 (Poor)", anchor="w")
        legend_canvas.create_text(width // 2 + 20, 40, text="3.0 (Neutral)", anchor="center")
        legend_canvas.create_text(width + 20, 40, text="5.0 (Excellent)", anchor="e")
        
        # Add explanation text
        explanation_text = (
            "Color indicates compatibility between story elements.\n"
            "Green = Excellent fit, Yellow = Neutral, Red = Poor fit.\n"
            "Average score shows compatibility between your selected elements only."
        )
        explanation_label = ttk.Label(parent_frame, text=explanation_text, wraplength=380, justify="left")
        explanation_label.pack(pady=5, padx=10, anchor="w")
    
    def build_compatibility_tag_widgets(self):
        """Build tag widgets for compatibility tab organized by category with improved layout"""
        # Group tags by category
        categories = {}
        
        # Add all tags from both audience data and compatibility data
        all_tags = set(self.data_manager.data.keys()) | set(self.data_manager.compatibility_data.keys())
        
        for tag_id in all_tags:
            # Extract category from tag ID
            raw_category = self.data_manager.extract_category_from_tag_id(tag_id)
            
            # Standardize category name
            category = self.data_manager.standardize_category(raw_category)
            
            if category not in categories:
                categories[category] = []
            
            # Get tag data from either dataset
            tag_data = {}
            if tag_id in self.data_manager.data:
                tag_data = self.data_manager.data[tag_id]
            
            categories[category].append((tag_id, tag_data))
        
        # Sort categories: main categories first, then rest alphabetically
        sorted_categories = []
        
        # Add main categories in specified order
        for cat in self.data_manager.main_categories:
            if cat in categories:
                sorted_categories.append(cat)
        
        # Add remaining categories alphabetically
        remaining_categories = [cat for cat in categories.keys() if cat not in self.data_manager.main_categories]
        sorted_categories.extend(sorted(remaining_categories))
        
        # Create a tab for each category
        for category in sorted_categories:
            if category not in categories:
                continue
                
            tags = categories[category]
            
            # Create a tab for this category with beautified name
            tab = ttk.Frame(self.compat_category_notebook)
            beautified_cat_name = self.data_manager.beautify_category_name(category)
            self.compat_category_notebook.add(tab, text=beautified_cat_name)
            self.compat_category_tabs[category] = tab
            
            # Create a scrollable frame inside the tab
            scrollable_frame = UIHelper.create_scrollable_frame(tab)
            self.compat_category_frames[category] = scrollable_frame
            
            # Sort tags alphabetically by display name
            sorted_tags = sorted(tags, key=lambda x: x[1].get("displayName", x[0]) if x[1] else x[0])
            
            # Create a grid layout frame to contain the checkbuttons
            grid_frame = ttk.Frame(scrollable_frame)
            grid_frame.pack(fill="both", expand=True, padx=5, pady=5)
            
            # Configure the grid to have at least two columns
            grid_frame.columnconfigure(0, weight=1)
            grid_frame.columnconfigure(1, weight=1)
            
            # Determine number of items per column
            items_per_column = max(3, (len(sorted_tags) + 1) // 2)
            
            # Create checkbuttons for each tag
            for i, (tag_id, tag_data) in enumerate(sorted_tags):
                display_name = tag_data.get("displayName", self.data_manager.beautify_tag_name(tag_id)) if tag_data else self.data_manager.beautify_tag_name(tag_id)
                
                # Calculate row and column
                row = i % items_per_column
                col = i // items_per_column
                
                # Create frame for this tag to hold checkbox and color indicator
                tag_frame = ttk.Frame(grid_frame)
                tag_frame.grid(row=row, column=col, sticky="w", padx=5, pady=2)
                
                # Color indicator (initially gray) with support for highlighting
                color_indicator = tk.Canvas(tag_frame, width=10, height=20, background="#cccccc", 
                                        highlightthickness=0, highlightbackground="black")
                color_indicator.grid(row=0, column=0, padx=(0, 5))
                
                var = tk.BooleanVar(value=False)
                self.compat_tag_vars[tag_id] = var
                
                # Add trace to the variable to update colors when checked/unchecked
                var.trace("w", lambda name, index, mode, tag_id=tag_id: self.update_compatibility_colors(tag_id))
                
                cb = ttk.Checkbutton(
                    tag_frame, 
                    text=display_name,
                    variable=var
                )
                cb.grid(row=0, column=1, sticky="w")
                
                # Store references for search filtering
                self.compat_tag_checkbuttons[tag_id] = tag_frame
                self.compat_tag_labels[tag_id] = color_indicator
    
    def rebuild_compatibility_tag_widgets(self):
        """Rebuild compatibility tag widgets with current data"""
        # Clear the notebook
        for tab_id in self.compat_category_notebook.tabs():
            self.compat_category_notebook.forget(tab_id)
            
        # Clear dictionaries
        self.compat_category_tabs = {}
        self.compat_category_frames = {}
        self.compat_tag_vars = {}
        self.compat_tag_checkbuttons = {}
        self.compat_tag_labels = {}
        
        # Rebuild
        self.build_compatibility_tag_widgets()
        
        # Clear selected tags display
        self.compat_selected_tags_text.config(state=tk.NORMAL)
        self.compat_selected_tags_text.delete(1.0, tk.END)
        self.compat_selected_tags_text.insert(tk.END, "No story elements selected.")
        self.compat_selected_tags_text.config(state=tk.DISABLED)
    
    def load_compatibility_file(self):
        """Load compatibility data from the specified file path."""
        file_path = self.compat_file_path_var.get()
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                new_data = json.load(f)
            
            # Fix any Cyrillic characters in tag IDs
            fixed_data = {}
            for tag_id, compat_dict in new_data.items():
                fixed_tag_id = self.data_manager.fix_cyrillic_characters(tag_id)
                
                # Fix compatibility tag IDs
                fixed_compat_dict = {}
                for compat_tag_id, score in compat_dict.items():
                    fixed_compat_tag_id = self.data_manager.fix_cyrillic_characters(compat_tag_id)
                    fixed_compat_dict[fixed_compat_tag_id] = score
                
                fixed_data[fixed_tag_id] = fixed_compat_dict
            
            # Update data
            self.data_manager.compatibility_data = fixed_data
            messagebox.showinfo("Success", f"Successfully loaded compatibility data from {file_path}")
            
            # Rebuild compatibility tag widgets
            self.rebuild_compatibility_tag_widgets()
        except FileNotFoundError:
            messagebox.showerror("Error", f"File not found: {file_path}")
        except json.JSONDecodeError:
            messagebox.showerror("Error", f"Invalid JSON file: {file_path}")
        except Exception as e:
            messagebox.showerror("Error", f"Error loading file: {str(e)}")
    
    def filter_compatibility_tags(self, *args):
        """Filter tags in compatibility tab based on search term"""
        search_term = self.compat_search_var.get().lower()
        
        # Start by showing all tags
        for tag_id, frame in self.compat_tag_checkbuttons.items():
            frame.grid()
        
        if not search_term:
            return
        
        # Count how many tags are shown/hidden in each tab
        visible_tags_per_tab = {cat: 0 for cat in self.compat_category_tabs}
        total_tags_per_tab = {cat: 0 for cat in self.compat_category_tabs}
        
        # Hide checkboxes that don't match the search term
        for tag_id, frame in self.compat_tag_checkbuttons.items():
            tag_data = self.data_manager.data.get(tag_id, {})
            display_name = tag_data.get("displayName", tag_id)
            
            # Extract category from tag ID for search
            category = self.data_manager.extract_category_from_tag_id(tag_id)
            standardized_category = self.data_manager.standardize_category(category)
            beautified_category = self.data_manager.beautify_category_name(category)
            
            # Get the original tag name for the tag
            original_tag_name = self.data_manager.beautify_tag_name(tag_id)
            
            # Increment total tags counter for this category
            if standardized_category in total_tags_per_tab:
                total_tags_per_tab[standardized_category] += 1
            
            # Check if search term matches any of the following:
            # 1. Tag ID
            # 2. Display name
            # 3. Category name (raw, standardized, or beautified)
            # 4. Original tag name extracted from tag ID
            match_found = (
                search_term in tag_id.lower() or
                search_term in display_name.lower() or
                search_term in category.lower() or
                search_term in standardized_category.lower() or
                search_term in beautified_category.lower() or
                search_term in original_tag_name.lower()
            )
            
            if not match_found:
                frame.grid_remove()
            else:
                # Increment visible tags counter for this category
                if standardized_category in visible_tags_per_tab:
                    visible_tags_per_tab[standardized_category] += 1
        
        # Make sure the appropriate tab is visible if it has matching tags
        if search_term:
            # Find the first tab with visible tags
            first_visible_tab = None
            for category, count in visible_tags_per_tab.items():
                if count > 0:
                    first_visible_tab = category
                    break
            
            # Select the first tab with visible tags
            if first_visible_tab and first_visible_tab in self.compat_category_tabs:
                tab_id = self.compat_category_notebook.index(self.compat_category_tabs[first_visible_tab])
                self.compat_category_notebook.select(tab_id)
    
    def clear_compatibility_search(self):
        """Clear the search field in compatibility tab and show all tags"""
        self.compat_search_var.set("")
        
        # Show all checkboxes
        for frame in self.compat_tag_checkbuttons.values():
            frame.grid()
    
    def clear_compatibility_selections(self):
        """Clear all selected checkboxes in compatibility tab"""
        # Set all tag variables to False
        for tag_id, var in self.compat_tag_vars.items():
            var.set(False)
        
        # Reset all colors to gray and remove borders
        for label in self.compat_tag_labels.values():
            label.configure(background="#cccccc", highlightthickness=0)
            
        # Reset score display
        self.score_display_label.configure(text="N/A", background="#cccccc")
                
        # Clear the selected tags display
        self.compat_selected_tags_text.config(state=tk.NORMAL)
        self.compat_selected_tags_text.delete(1.0, tk.END)
        self.compat_selected_tags_text.insert(tk.END, "No story elements selected.")
        self.compat_selected_tags_text.config(state=tk.DISABLED)
        
        # Show a message to confirm selections were cleared
        messagebox.showinfo("Selections Cleared", "All story element selections have been cleared.")

    def update_compatibility_colors(self, changed_tag_id=None):
        """Update color indicators based on current tag selections and calculate average score"""
        # Get currently selected tags
        selected_tags = [tag_id for tag_id, var in self.compat_tag_vars.items() if var.get()]
        
        # If no tags are selected, reset all colors to gray and clear score
        if not selected_tags:
            for tag_id, label in self.compat_tag_labels.items():
                label.configure(background="#cccccc", highlightthickness=0)
            
            # Reset score display
            self.score_display_label.configure(text="N/A", background="#cccccc")
            return
        
        # Update selected tags display
        self.update_compatibility_selected_tags(selected_tags)
        
        # Track compatibility scores between selected elements only
        selected_compatibility_scores = []
        
        # Calculate compatibility scores between selected tags only
        for i, tag1 in enumerate(selected_tags):
            for tag2 in selected_tags[i+1:]:  # Start from i+1 to avoid duplicates
                # Check if there's direct compatibility data
                score = None
                
                # Look up compatibility in both directions
                if tag1 in self.data_manager.compatibility_data and tag2 in self.data_manager.compatibility_data[tag1]:
                    score = float(self.data_manager.compatibility_data[tag1][tag2])
                elif tag2 in self.data_manager.compatibility_data and tag1 in self.data_manager.compatibility_data[tag2]:
                    score = float(self.data_manager.compatibility_data[tag2][tag1])
                
                # Only add valid scores
                if score is not None:
                    selected_compatibility_scores.append(score)
        
        # Track compatibility scores for each unselected tag to identify most compatible ones
        tag_avg_scores = {}
        
        # For each unselected tag, calculate average compatibility with all selected tags
        for tag_id, var in self.compat_tag_vars.items():
            if var.get():
                # Selected tags get a blue highlight
                self.compat_tag_labels[tag_id].configure(background="#4a86e8", highlightthickness=0)
                continue
                
            # Calculate average compatibility score for this tag with all selected tags
            compatibility_scores = []
            
            for selected_tag in selected_tags:
                # Skip if same tag
                if selected_tag == tag_id:
                    continue
                    
                # Check if there's direct compatibility data
                score = None
                
                # Look up compatibility in both directions
                if selected_tag in self.data_manager.compatibility_data and tag_id in self.data_manager.compatibility_data[selected_tag]:
                    score = float(self.data_manager.compatibility_data[selected_tag][tag_id])
                elif tag_id in self.data_manager.compatibility_data and selected_tag in self.data_manager.compatibility_data[tag_id]:
                    score = float(self.data_manager.compatibility_data[tag_id][selected_tag])
                
                # Only add valid scores
                if score is not None:
                    compatibility_scores.append(score)
            
            # Calculate average score if we have any compatibility data
            if compatibility_scores:
                avg_score = sum(compatibility_scores) / len(compatibility_scores)
                color = UIHelper.get_compatibility_color(avg_score)
                self.compat_tag_labels[tag_id].configure(background=color, highlightthickness=0)
                # Store the average score for later use in highlighting most compatible
                tag_avg_scores[tag_id] = avg_score
            else:
                # If no compatibility data, use gray
                self.compat_tag_labels[tag_id].configure(background="#cccccc", highlightthickness=0)
        
        # Highlight the most compatible tags (top 5 or tags with score >= 4.0, whichever is more)
        # Only if we have unselected tags with scores
        if tag_avg_scores:
            # Sort tags by compatibility score in descending order
            sorted_tags = sorted(tag_avg_scores.items(), key=lambda x: x[1], reverse=True)
            
            # Get tags with score >= 4.0
            high_compat_tags = [tag_id for tag_id, score in sorted_tags if score >= 4.0]
            
            # Also get top 5 tags (might overlap with high_compat_tags)
            top_tags = [tag_id for tag_id, _ in sorted_tags[:5]]
            
            # Combine both lists without duplicates
            highlighted_tags = list(set(high_compat_tags + top_tags))
            
            # Add black border to these tags
            for tag_id in highlighted_tags:
                self.compat_tag_labels[tag_id].configure(highlightbackground="black", highlightthickness=2)
        
        # Update the average score display - now only based on selected elements
        if selected_compatibility_scores:
            selected_avg = sum(selected_compatibility_scores) / len(selected_compatibility_scores)
            color = UIHelper.get_compatibility_color(selected_avg)
            self.score_display_label.configure(
                text=f"{selected_avg:.2f}",
                background=color
            )
        else:
            # If only one tag is selected or no compatibility data between selected tags
            if len(selected_tags) == 1:
                # With only one selection, compatibility is N/A
                self.score_display_label.configure(text="N/A", background="#cccccc")
            else:
                # Multiple selections but no data
                self.score_display_label.configure(text="No Data", background="#cccccc")
    
    def update_compatibility_selected_tags(self, selected_tags):
        """Update the selected tags display in the compatibility tab"""
        self.compat_selected_tags_text.config(state=tk.NORMAL)
        self.compat_selected_tags_text.delete(1.0, tk.END)
        
        if not selected_tags:
            self.compat_selected_tags_text.insert(tk.END, "No story elements selected.")
            self.compat_selected_tags_text.config(state=tk.DISABLED)
            return
        
        # Group selected tags by category
        tags_by_category = {}
        for tag_id in selected_tags:
            category = self.data_manager.extract_category_from_tag_id(tag_id)
            beautified_category = self.data_manager.beautify_category_name(category)
            
            if beautified_category not in tags_by_category:
                tags_by_category[beautified_category] = []
            
            display_name = ""
            if tag_id in self.data_manager.data and "displayName" in self.data_manager.data[tag_id]:
                display_name = self.data_manager.data[tag_id]["displayName"]
            else:
                display_name = self.data_manager.beautify_tag_name(tag_id)
                
            tags_by_category[beautified_category].append(display_name)
        
        # Sort categories and display selected tags
        sorted_categories = sorted(tags_by_category.keys())
        for category in sorted_categories:
            self.compat_selected_tags_text.insert(tk.END, f"{category}:\n", "category")
            for tag_name in sorted(tags_by_category[category]):
                self.compat_selected_tags_text.insert(tk.END, f"  • {tag_name}\n")
            self.compat_selected_tags_text.insert(tk.END, "\n")
        
        # Apply formatting
        self.compat_selected_tags_text.tag_configure("category", font=("Arial", 10, "bold"))
        self.compat_selected_tags_text.config(state=tk.DISABLED)
    
    def show_tag_compatibility_matrix(self):
        """Show a matrix of compatibility between all selected tags."""
        selected_tags = [tag_id for tag_id, var in self.compat_tag_vars.items() if var.get()]
        
        if len(selected_tags) < 2:
            messagebox.showinfo("Not Enough Story Elements", "Please select at least two story elements to show compatibility matrix.")
            return
        
        # Create a new toplevel window
        matrix_window = tk.Toplevel(self.parent)
        matrix_window.title("Tag Compatibility Matrix")
        
        # Set a reasonable size
        matrix_window.geometry("800x600")
        
        # Create a frame with scrollbars
        main_frame = ttk.Frame(matrix_window)
        main_frame.pack(fill="both", expand=True, padx=10, pady=10)
        
        # Add header text
        header_text = f"Compatibility Matrix for {len(selected_tags)} Selected Story Elements"
        header_label = ttk.Label(main_frame, text=header_text, font=("Arial", 12, "bold"))
        header_label.pack(pady=10)
        
        # Create a canvas with scrollbars for the matrix
        canvas_frame = ttk.Frame(main_frame)
        canvas_frame.pack(fill="both", expand=True)
        
        h_scrollbar = ttk.Scrollbar(canvas_frame, orient="horizontal")
        v_scrollbar = ttk.Scrollbar(canvas_frame, orient="vertical")
        canvas = tk.Canvas(canvas_frame, xscrollcommand=h_scrollbar.set, yscrollcommand=v_scrollbar.set)
        
        h_scrollbar.config(command=canvas.xview)
        v_scrollbar.config(command=canvas.yview)
        
        h_scrollbar.pack(fill="x", side="bottom")
        v_scrollbar.pack(fill="y", side="right")
        canvas.pack(side="left", fill="both", expand=True)
        
        # Frame inside canvas for the matrix
        matrix_frame = ttk.Frame(canvas)
        canvas.create_window((0, 0), window=matrix_frame, anchor="nw")
        
        # Get display names for selected tags
        display_names = {}
        for tag_id in selected_tags:
            if tag_id in self.data_manager.data and "displayName" in self.data_manager.data[tag_id]:
                display_names[tag_id] = self.data_manager.data[tag_id]["displayName"]
            else:
                display_names[tag_id] = self.data_manager.beautify_tag_name(tag_id)
        
        # Headers for the first column
        ttk.Label(matrix_frame, text="Story Element Name", font=("Arial", 10, "bold")).grid(row=0, column=0, sticky="w", padx=5, pady=5)
        
        # Column headers (tag names)
        for col, tag_id in enumerate(selected_tags, start=1):
            ttk.Label(matrix_frame, text=display_names[tag_id], font=("Arial", 9, "bold")).grid(
                row=0, column=col, sticky="w", padx=5, pady=5
            )
        
        # Build the matrix rows
        for row, row_tag_id in enumerate(selected_tags, start=1):
            # Row header (tag name)
            ttk.Label(matrix_frame, text=display_names[row_tag_id], font=("Arial", 9, "bold")).grid(
                row=row, column=0, sticky="w", padx=5, pady=5
            )
            
            # Compatibility scores
            for col, col_tag_id in enumerate(selected_tags, start=1):
                if row_tag_id == col_tag_id:
                    # Same tag - diagonal
                    score_label = ttk.Label(matrix_frame, text="—", width=5)
                    score_label.grid(row=row, column=col, padx=5, pady=5)
                    continue
                
                # Try to get compatibility score
                score = None
                
                # Look up compatibility in both directions
                if row_tag_id in self.data_manager.compatibility_data and col_tag_id in self.data_manager.compatibility_data[row_tag_id]:
                    score = float(self.data_manager.compatibility_data[row_tag_id][col_tag_id])
                elif col_tag_id in self.data_manager.compatibility_data and row_tag_id in self.data_manager.compatibility_data[col_tag_id]:
                    score = float(self.data_manager.compatibility_data[col_tag_id][row_tag_id])
                
                if score is not None:
                    # Create a colored frame to show the score
                    score_frame = ttk.Frame(matrix_frame, width=50, height=30)
                    score_frame.grid(row=row, column=col, padx=5, pady=5)
                    score_frame.grid_propagate(False)  # Prevent frame from shrinking
                    
                    color = UIHelper.get_compatibility_color(score)
                    score_label = tk.Label(
                        score_frame, 
                        text=f"{score:.1f}", 
                        background=color,
                        width=5
                    )
                    score_label.pack(fill="both", expand=True)
                else:
                    # No compatibility data
                    score_label = ttk.Label(matrix_frame, text="N/A", width=5)
                    score_label.grid(row=row, column=col, padx=5, pady=5)
        
        # Update the scrollregion after the grid is complete
        matrix_frame.update_idletasks()
        canvas.config(scrollregion=canvas.bbox("all"))
        
        # Add button to close the window
        close_button = ttk.Button(main_frame, text="Close", command=matrix_window.destroy)
        close_button.pack(pady=10)

    def export_to_advertisers_tab(self):
        """ Export all the selected tags from CompatibilityTab to AdvertiserTab """
        # Get currently selected tags
        selected_tags = [tag_id for tag_id, var in self.compat_tag_vars.items() if var.get()]

        AdvertiserTab.clear_selections(app.advertiser_tab, False)
        AdvertiserTab.select_tags(app.get_advertiser_tab(), selected_tags)
        # Switch to AdvertiserTab
        app.main_notebook.select(app.main_notebook.index(app.advertiser_tab_frame))


class StoryElementCalculatorApp:
    """Main application class that coordinates all components"""
    
    def __init__(self, root):
        self.root = root
        self.root.title("Hollywood Animal Calculator")
        
        # Make the application start in fullscreen mode
        try:
            # Try the Windows approach first
            self.root.state('zoomed')
        except:
            try:
                # Try the Linux/Unix approach if Windows fails
                self.root.attributes('-zoomed', True)
            except:
                # Fallback to manual fullscreen if both fail
                width = self.root.winfo_screenwidth()
                height = self.root.winfo_screenheight()
                self.root.geometry(f"{width}x{height}+0+0")
        
        # Initialize the data manager
        self.data_manager = DataManager()
        
        # Initialize the calculation engine
        self.calculation_engine = CalculationEngine(self.data_manager)
        
        # Create the main notebook control for tabs
        self.main_notebook = ttk.Notebook(self.root)
        self.main_notebook.pack(fill="both", expand=True)
        
        # Create tab for Best Advertiser
        self.advertiser_tab_frame = ttk.Frame(self.main_notebook)
        self.main_notebook.add(self.advertiser_tab_frame, text="Advertiser Compatibility")
        
        # Create tab for Tag Compatibility
        self.compatibility_tab_frame = ttk.Frame(self.main_notebook)
        self.main_notebook.add(self.compatibility_tab_frame, text="Story Element Compatibility")
        
        # Configure grid weights for resizing
        self.advertiser_tab_frame.columnconfigure(0, weight=3)  # Left frame gets more space
        self.advertiser_tab_frame.columnconfigure(1, weight=2)  # Right frame gets less space
        self.advertiser_tab_frame.rowconfigure(0, weight=1)
        
        self.compatibility_tab_frame.columnconfigure(0, weight=3)  # Left frame gets more space
        self.compatibility_tab_frame.columnconfigure(1, weight=2)  # Right frame gets less space
        self.compatibility_tab_frame.rowconfigure(0, weight=1)
        
        # Initialize the tab controllers
        self.advertiser_tab = AdvertiserTab(self.advertiser_tab_frame, self.data_manager, self.calculation_engine)
        self.compatibility_tab = CompatibilityTab(self.compatibility_tab_frame, self.data_manager)

    def get_advertiser_tab(self):
        return self.advertiser_tab


if __name__ == "__main__":
    root = tk.Tk()
    app = StoryElementCalculatorApp(root)
    root.mainloop()
