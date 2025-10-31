# Architecture Documentation

## System Overview

The Story Synthesiser combines deterministic data generation (Faker.js) with AI-powered narrative generation (Ollama) under human supervision.

## Components

### 1. Main Generation System (`complete_system.js`)

**Responsibilities:**
- Orchestrate story generation pipeline
- Manage human-in-the-loop checkpoints
- Interface with Faker.js and Ollama
- Handle file I/O and state management

**Key Functions:**
- `generateUserDemographics()` - Create user profiles
- `generateUserBackground()` - AI-generated backstories
- `generateTravelStory()` - AI-generated narratives
- `generateStoryTitle()` - AI-generated titles
- `concatenate()` - Combine all data with UUIDs

### 2. Configuration (`config.js`)

Centralized configuration for:
- Story count and checkpoint frequency
- Data arrays (nationalities, experience types, destinations)
- Locale mappings for Faker.js

### 3. Export Utilities

**CLI Export (`export.js`)**: Converts JSON to CSV  
**GUI Export (`export_gui.html`)**: Browser-based interface with drag-and-drop

## Data Flow

```
User Input → Faker.js → Demographics
          ↓
Demographics + Config → Ollama → Background
          ↓
Background + Experience → Ollama → Story
          ↓
Story → Ollama → Title
          ↓
All Components → Concatenate → JSON
          ↓
JSON → Export Utility → CSV
```

See `diagrams/dataflow_diagram.mmd` for detailed visualization.

## Human-in-the-Loop Checkpoints

1. **User Review** - After demographics and background
2. **Experience Review** - After experience details
3. **Story Review** - After story and title
4. **Progress Review** - Every N stories

## External Dependencies

- **Faker.js**: Synthetic demographic data
- **Ollama (llama3.2)**: AI narrative generation
- **uuid**: Unique identifiers
- **fs**: File system operations

## Output Schema

### JSON Structure
```json
{
  "user": {
    "user_id": "uuid",
    "name": "string",
    "age": "number",
    "background": "string (AI-generated)"
  },
  "experience": {
    "experience_id": "uuid",
    "destination_country": "string"
  },
  "story": {
    "story_id": "uuid",
    "title": "string (AI-generated)",
    "body_text": "string (AI-generated)"
  }
}
```

### CSV Structure
Flattened with prefixed columns:
- `user_*` (10 columns)
- `experience_*` (3 columns)
- `story_*` (3 columns)

## Performance

- Per story: ~45-60 seconds
- 30 stories: ~30-40 minutes
- Ollama calls: 3 per iteration (90 total)

## Diagrams

### Sequence Diagram
See `diagrams/sequence_diagram.mmd`

Shows complete interaction flow between user, system, Faker, Ollama, and file system.

### Data Flow Diagram
See `diagrams/dataflow_diagram.mmd`

Shows complete data pipeline from generation to export with all checkpoints.

---

**Version:** 1.0.0
