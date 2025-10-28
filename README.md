Hack Day Quickstart: The Story Synthesiser
==========================================

Welcome!
--------

Welcome to the team! Our mission today is to build a proof-of-concept for the "Story Synthesiser." This is a crucial first step in the "Million Stories" initiative.

### Key Contacts

-   **Project Sponsor:** Rob Scott (Available for 9am, 1pm, and 4:30pm check-ins, and via DM in between)

-   **Tech Lead:** James Patterson (Your first point of contact for all questions, technical decisions, and blockers)

### The Full Brief

This file is just a quickstart. The complete background, vision, and long-term plan is in the main project summary document. **Please read this first!**

-   **Link:** [Link to "Story Synthesiser Project Summary" Google Doc](https://docs.google.com/document/d/1agnpyRNVPFN-QcOToBnM3jOArYQuqndXMJr4NMdfR10/edit?usp=sharing)

### Today's Mission: The Story Synthesiser (Part 1)

Our *only* goal today is to build **Part 1** of the plan. We are **not** working on Part 2 (The Editorial Workflow).

(Copied from the project brief for quick reference):

-   **Objective:** Build a tool (e.g., a script, a simple web app) that generates a large volume of realistic, synthetic stories.

-   **Key Workflow & Features:**

    1.  Create a "seed list" of parameters (e.g., destinations, demographics, trip types).

    2.  Create a "user" (e.g., `User 1: Bruce Wayne, Male, DOB: March 30 1989, from Wayne County Pennsylvania, USA`).

    3.  Generate an `Experience` for that user (destination country, type).

    4.  Generate a `Story` based on those details.

    5.  Repeat this N times.

-   **Output:** The tool will output all the generated stories as a single structured data file (e.g., JSON) for download.

### Expected Output: Core Data Model

The final JSON file should be an array of objects that follow this model. Sticking to this model is critical for the next stages.

```
[
  {
    "user": {
      "user_id": "string",
      "name": "string",
      "gender": "string",
      "DOB": "string (e.g., 1989-03-30)",
      "origin_address": "string (e.g., Wayne County, Pennsylvania, USA)",
      "nationality": "string"
    },
    "experience": {
      "experience_id": "string",
      "destination_country": "string",
      "experience_type": "string (e.g., 'Volunteering', 'Study Abroad', 'Backpacking')"
    },
    "story": {
      "story_id": "string",
      "title": "string",
      "body_text": "string (The full story)",
      "is_negative": "boolean"
    }
  }
]

```

### Suggested Tech Stack

To hit the balance between speed and reusability, here is a *suggested* starting point.

**This is not a requirement.** Feel free to use this, or propose an alternative to James in the 9am kickoff.

-   **Repository:** You are all invited to this one! Please clone it and work from here.

-   **LLM:** Using a local model is fast and free.

    -   **Tool:** [Ollama](https://ollama.com/ "null")

    -   **Model:** `llama3` (a great, fast, general-purpose model)

-   **Application:** A script is the fastest PoC.

    -   **Language:** Python (using `requests` or `ollama` libraries) or Node.js (using `node-fetch` or `ollama` library).

-   **Collaboration:**

    1.  `git pull`

    2.  Create a new branch for your feature (e.g., `feature/user-generator`)

    3.  `git push`

    4.  Open a Pull Request to merge into the `main` branch.
