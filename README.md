# Harvard Rare Disease Hackathon 2025  
## SymptomSavvy — Accelerating Rare Disease Diagnosis

SymptomSavvy is an AI-powered web application created for **Problem Statement A** at the Harvard Rare Disease Hackathon 2025. Our platform streamlines early diagnostic workflows for rare diseases by:

- Analyzing patient-reported symptoms  
- Matching clinical patterns against rare disease databases  
- Surfacing relevant medical literature for verification and next steps  

We aim to reduce diagnostic delays and empower both patients and clinicians with actionable insights.

---

## Features

- Symptom pattern recognition with intelligent similarity scoring
- Ranked differential diagnosis suggestions
- Direct access to medical research sources
- Clean and intuitive web interface
- Lightweight deployment for prototyping use

---

## Tech Stack

- **Backend:** Python, Flask  
- **Frontend:** HTML, CSS, JavaScript  
- **Data Sources:** HPO-based rare disease mappings

---

## Requirements

- Python 3.x  
- pip (Python package manager)  
- Virtual environment (recommended)

---

## Installation & Local Development

```bash
git clone https://github.com/flashyash/savvy
cd savvy

# Set up virtual environment
python -m venv venv
source venv/bin/activate    # macOS/Linux
venv\Scripts\activate       # Windows

# Install dependencies
pip install -r requirements.txt

# Launch development server
python app.py
