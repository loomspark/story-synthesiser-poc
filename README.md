# Story Synthesiser

> AI-powered synthetic travel story generator with human oversight

[![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![Ollama](https://img.shields.io/badge/ollama-llama3.2-blue)](https://ollama.com/)
[![License](https://img.shields.io/badge/license-MIT-orange)](LICENSE)

## Overview

Generates realistic travel exchange stories combining:
- **Faker.js** for demographic data
- **Ollama (llama3.2)** for AI-generated narratives
- **Human-in-the-loop** checkpoints for quality control
- **Export utilities** for JSON and CSV output

## Features

- ✅ Synthetic user demographics (name, age, nationality, occupation)
- ✅ AI-generated user backgrounds (2-3 sentence backstories)
- ✅ AI-generated travel stories (200-350 words)
- ✅ Four checkpoint types for human oversight
- ✅ Incremental saving (never lose progress)
- ✅ Export to CSV or JSON via GUI
- ✅ Configurable story count and review frequency
- ✅ 100% local execution with free models

## Quick Start

### Prerequisites

- Node.js ≥ 16.0.0
- Ollama with llama3.2 model

### Installation

```bash
# 1. Install Ollama
# macOS/Linux:
curl -fsSL https://ollama.com/install.sh | sh
# Windows: Download from https://ollama.com

# 2. Pull model
ollama pull llama3.2

# 3. Clone repository
git clone https://github.com/loomspark/story-synthesiser-poc.git
cd story-synthesiser-poc

# 4. Install dependencies
npm install

# 5. Start Ollama (keep running)
ollama serve

# 6. Run generator
npm start
```

## Usage

### Generate Stories

```bash
npm start
```

The system will:
1. Generate user demographics (Faker)
2. Generate user background (Ollama)
3. Request user review [Checkpoint 1]
4. Generate experience details
5. Request experience review [Checkpoint 2]
6. Generate travel story (Ollama)
7. Generate story title (Ollama)
8. Request story review [Checkpoint 3]
9. Save to `generated_stories.json`
10. Request continuation [Checkpoint 4 - every 5 stories]

### Export Data

**Option 1: GUI (Recommended)**
1. Open `export_gui.html` in browser
2. Select `generated_stories.json`
3. Click "Export CSV" or "Download JSON"

**Option 2: Command Line**
```bash
node export.js
```

## Configuration

Edit `config.js`:

```javascript
module.exports = {
    totalIterations: 30,  // Number of stories
    
    checkpoints: {
        reviewEveryUser: false,       // Review each user
        reviewEveryExperience: false, // Review each experience
        reviewEveryStory: false,      // Review each story
        continueCheckInterval: 5,     // Progress check frequency
        specificCheckpoints: [10, 20] // Mandatory reviews
    },
    
    // Customize nationalities, experience types, destinations...
};
```

### Checkpoint Presets

**Fast Mode** (~60 min for 30 stories)
```javascript
continueCheckInterval: 10
reviewEveryUser: false
reviewEveryStory: false
```

**Balanced Mode** (~75 min for 30 stories)
```javascript
continueCheckInterval: 5
reviewEveryUser: false
reviewEveryStory: false
```

**Quality Mode** (~120 min for 30 stories)
```javascript
continueCheckInterval: 1
reviewEveryUser: true
reviewEveryStory: true
```

## Output Schema

```json
{
  "user": {
    "user_id": "uuid",
    "name": "string",
    "gender": "string",
    "age": "number",
    "DOB": "YYYY-MM-DD",
    "origin_address": "string",
    "nationality": "string",
    "occupation": "string",
    "education": "string",
    "background": "string (AI-generated)"
  },
  "experience": {
    "experience_id": "uuid",
    "destination_country": "string",
    "experience_type": "string"
  },
  "story": {
    "story_id": "uuid",
    "title": "string (AI-generated)",
    "body_text": "string (AI-generated, 200-350 words)",
    "is_negative": "boolean"
  }
}
```

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for:
- System components
- Data flow diagrams
- Sequence diagrams
- Integration points

## Performance

| Metric | Value |
|--------|-------|
| Per story generation | 45-60 seconds |
| 30 stories (no checkpoints) | 30-40 minutes |
| 30 stories (with checkpoints) | 60-90 minutes |
| Ollama model size | 2 GB |
| Average story length | 250-300 characters |

## Project Structure

```
story-synthesiser-poc/
├── package.json              # Dependencies & scripts
├── config.js                 # Configuration
├── complete_system.js        # Main generation script
├── export.js                 # CLI export utility
├── export_gui.html           # GUI export tool
├── README.md                 # This file
├── ARCHITECTURE.md           # Technical documentation
├── diagrams/
│   ├── sequence.mmd          # Mermaid sequence diagram
│   └── dataflow.mmd          # Mermaid data flow diagram
└── generated_stories.json    # Output (created on run)
```

## Troubleshooting

### Ollama Connection Issues

```bash
# Check Ollama is running
ollama list

# Restart Ollama
ollama serve
```

### Model Not Found

```bash
# Pull the model
ollama pull llama3.2

# Verify installation
ollama run llama3.2
```

### Faker Locale Error

Remove line ~104 in `complete_system.js`:
```javascript
// DELETE THIS LINE:
faker.locale = locale;
```

### Stories Too Short/Long

Edit `complete_system.js` line ~145:
```javascript
- Length: 200-350 words  // Change as needed
```

## Development

### Running Tests

```bash
npm test
```

### Quick Test (3 stories)

Edit `config.js`:
```javascript
totalIterations: 3
```

Run:
```bash
npm start
```

## Team Workflow

### Engine Room
- Maintains generation pipeline
- Handles data synthesis
- Manages exports

### Prompt Lab
Extract and refine prompts from `complete_system.js`:
- Line ~110: User background prompt
- Line ~140: Travel story prompt  
- Line ~165: Title generation prompt

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/name`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/name`)
5. Open Pull Request

## License

MIT License - see [LICENSE](LICENSE) file

## Acknowledgments

- [Faker.js](https://fakerjs.dev/) for realistic data generation
- [Ollama](https://ollama.com/) for local LLM inference
- [llama3.2](https://ollama.com/library/llama3.2) for story generation

## Support

For issues or questions:
- Open an issue on GitHub
- Contact: [your-email]

---

**Built with ❤️ for synthetic data generation**
