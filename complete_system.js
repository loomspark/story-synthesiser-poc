/**
 * Complete Story Synthesiser - Integrated System
 * 
 * Generates:
 * 1. User demographics (Faker)
 * 2. User background story (Ollama)
 * 3. Travel experience story (Ollama)
 * 4. Final concatenated JSON
 * 
 * With human-in-the-loop checkpoints
 */

const { faker } = require('@faker-js/faker');
const fs = require('fs');
const readline = require('readline');
const { v4: uuidv4 } = require('uuid');

// Ollama integration
const OLLAMA_URL = 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = 'llama3.2'; // Free model

// Configuration
const config = require('./config');

// Readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/**
 * Ask question and wait for answer
 */
function ask(question) {
    return new Promise(resolve => rl.question(question, resolve));
}

/**
 * Call Ollama API
 */
async function callOllama(prompt, temperature = 0.8) {
    try {
        const response = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: temperature,
                    top_p: 0.9,
                    num_predict: 400
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama error: ${response.status}`);
        }

        const data = await response.json();
        return data.response.trim();
    } catch (error) {
        console.error('❌ Ollama error:', error.message);
        throw error;
    }
}

/**
 * Generate user demographics with Faker
 */
function generateUserDemographics(nationality) {
    const locale = config.LOCALE_MAP[nationality] || 'en';
    
    const birthDate = faker.date.birthdate({ min: 18, max: 35, mode: 'age' });
    const age = 2025 - birthDate.getFullYear();
    
    return {
        name: faker.person.fullName(),
        gender: faker.helpers.arrayElement(config.GENDERS),
        age: age,
        DOB: birthDate.toISOString().split('T')[0],
        nationality: nationality,
        origin_city: faker.location.city(),
        origin_address: `${faker.location.city()}, ${nationality}`,
        occupation: faker.person.jobTitle(),
        education: faker.helpers.arrayElement(['High School', 'Bachelor\'s', 'Master\'s', 'PhD'])
    };
}
/**
 * Generate user background story using Ollama
 */
async function generateUserBackground(demographics) {
    const prompt = `Write a brief 2-3 sentence background about this person. Make it realistic and natural.

Person:
- Name: ${demographics.name}
- Age: ${demographics.age}
- From: ${demographics.origin_city}, ${demographics.nationality}
- Occupation: ${demographics.occupation}
- Education: ${demographics.education}

Write ONLY the background story, nothing else. Make it authentic and specific to their country and occupation.`;

    const background = await callOllama(prompt, 0.8);
    return background;
}

/**
 * Generate travel experience story using Ollama
 */
async function generateTravelStory(demographics, background, experience) {
    const prompt = `You are a storyteller creating authentic travel exchange experiences.

Write a first-person story (200-350 words) about this person's travel experience.

Person Background:
- Name: ${demographics.name}
- Age: ${demographics.age}
- From: ${demographics.origin_city}, ${demographics.nationality}
- Occupation: ${demographics.occupation}
- Background: ${background}

Experience:
- Type: ${experience.experience_type}
- Destination: ${experience.destination_country}

Requirements:
- Write in first person ("I")
- Include specific details (places, moments, emotions)
- Show cultural exchange impact
- Make it believable and natural
- Length: 200-350 words
- ${experience.is_challenging ? 'Focus on challenges and growth through difficulties' : 'Focus on positive cultural discovery'}

Write ONLY the story, no title, no introduction. Start directly with the story.`;

    const story = await callOllama(prompt, 0.9);
    
    return {
        body_text: story,
        is_negative: experience.is_challenging
    };
}

/**
 * Generate experience details
 */
function generateExperience(homeNationality) {
    const validDestinations = config.DESTINATIONS.filter(d => d !== homeNationality);
    const destination = faker.helpers.arrayElement(validDestinations);
    const experienceType = faker.helpers.arrayElement(config.EXPERIENCE_TYPES);
    const isChallenging = Math.random() < 0.2; // 20% challenging stories
    
    return {
        destination_country: destination,
        experience_type: experienceType,
        is_challenging: isChallenging
    };
}

/**
 * Generate story title using Ollama
 */
async function generateStoryTitle(demographics, experience, storyText) {
    const prompt = `Create a short, engaging title (under 60 characters) for this travel story.

Person: ${demographics.name} from ${demographics.nationality}
Experience: ${experience.experience_type} in ${experience.destination_country}
Story preview: ${storyText.substring(0, 150)}...

Write ONLY the title, nothing else. Make it specific and compelling.`;

    const title = await callOllama(prompt, 0.7);
    return title.replace(/["']/g, '').trim(); // Clean up quotes
}

/**
 * CHECKPOINT 1: Review User
 */
async function checkpointUser(demographics, background, iteration) {
    console.log('\n' + '='.repeat(70));
    console.log(`CHECKPOINT 1: Review User #${iteration}`);
    console.log('='.repeat(70));
    console.log(`\n👤 Demographics:`);
    console.log(`   Name: ${demographics.name}`);
    console.log(`   Age: ${demographics.age} (${demographics.gender})`);
    console.log(`   From: ${demographics.origin_city}, ${demographics.nationality}`);
    console.log(`   Occupation: ${demographics.occupation}`);
    console.log(`   Education: ${demographics.education}`);
    console.log(`\n📝 Background Story:`);
    console.log(`   ${background}`);
    
    if (!config.checkpoints.reviewEveryUser) return true;
    
    const answer = await ask('\n✅ Accept this user? (y/n/regenerate): ');
    return answer.toLowerCase() !== 'n';
}

/**
 * CHECKPOINT 2: Review Experience
 */
async function checkpointExperience(experience, iteration) {
    console.log('\n' + '='.repeat(70));
    console.log(`CHECKPOINT 2: Review Experience #${iteration}`);
    console.log('='.repeat(70));
    console.log(`\n🎒 Experience Details:`);
    console.log(`   Type: ${experience.experience_type}`);
    console.log(`   Destination: ${experience.destination_country}`);
    console.log(`   Tone: ${experience.is_challenging ? '⚠️  Challenging/Growth' : '😊 Positive/Discovery'}`);
    
    if (!config.checkpoints.reviewEveryExperience) return true;
    
    const answer = await ask('\n✅ Accept this experience? (y/n): ');
    return answer.toLowerCase() !== 'n';
}

/**
 * CHECKPOINT 3: Review Story
 */
async function checkpointStory(title, story, iteration) {
    console.log('\n' + '='.repeat(70));
    console.log(`CHECKPOINT 3: Review Story #${iteration}`);
    console.log('='.repeat(70));
    console.log(`\n📖 Title: ${title}`);
    console.log(`📝 Length: ${story.body_text.length} characters`);
    console.log(`😊 Sentiment: ${story.is_negative ? 'Challenging' : 'Positive'}`);
    console.log(`\n📄 Story Preview (first 300 chars):`);
    console.log(`   ${story.body_text.substring(0, 300)}...`);
    
    if (!config.checkpoints.reviewEveryStory) return true;
    
    const answer = await ask('\n✅ Accept this story? (y/n/regenerate): ');
    return answer.toLowerCase() !== 'n';
}

/**
 * CHECKPOINT 4: Continue
 */
async function checkpointContinue(iteration, total, results) {
    console.log('\n' + '='.repeat(70));
    console.log(`CHECKPOINT 4: Progress Review`);
    console.log('='.repeat(70));
    console.log(`\n📊 Progress:`);
    console.log(`   Completed: ${results.length}/${total}`);
    console.log(`   Success rate: ${Math.round(results.length / iteration * 100)}%`);
    console.log(`   Average time per story: ~2-3 minutes`);
    console.log(`   Estimated remaining: ~${(total - iteration) * 2.5} minutes`);
    
    const answer = await ask('\n▶️  Continue? (y/n/pause/stats): ');
    
    if (answer.toLowerCase() === 'n') return false;
    if (answer.toLowerCase() === 'pause') {
        console.log('⏸️  Paused. Press Enter to continue...');
        await ask('');
    }
    if (answer.toLowerCase() === 'stats') {
        showStats(results);
        await ask('\nPress Enter to continue...');
    }
    
    return true;
}

/**
 * Show statistics
 */
function showStats(results) {
    const positive = results.filter(r => !r.story.is_negative).length;
    const negative = results.filter(r => r.story.is_negative).length;
    const avgLength = Math.round(
        results.reduce((sum, r) => sum + r.story.body_text.length, 0) / results.length
    );
    
    console.log('\n📊 Current Statistics:');
    console.log(`   Total stories: ${results.length}`);
    console.log(`   Positive: ${positive} (${Math.round(positive/results.length*100)}%)`);
    console.log(`   Challenging: ${negative} (${Math.round(negative/results.length*100)}%)`);
    console.log(`   Avg length: ${avgLength} characters`);
}

/**
 * Concatenate everything into final schema
 */
function concatenate(demographics, background, experience, story, title) {
    return {
        user: {
            user_id: uuidv4(),
            name: demographics.name,
            gender: demographics.gender,
            age: demographics.age,
            DOB: demographics.DOB,
            origin_address: demographics.origin_address,
            nationality: demographics.nationality,
            occupation: demographics.occupation,
            education: demographics.education,
            background: background
        },
        experience: {
            experience_id: uuidv4(),
            destination_country: experience.destination_country,
            experience_type: experience.experience_type
        },
        story: {
            story_id: uuidv4(),
            title: title,
            body_text: story.body_text,
            is_negative: story.is_negative
        }
    };
}

/**
 * Save results
 */
function saveResults(results) {
    fs.writeFileSync(config.output.filename, JSON.stringify(results, null, 2));
}

/**
 * Main loop
 */
async function main() {
    console.log('\n' + '='.repeat(70));
    console.log('STORY SYNTHESISER - COMPLETE INTEGRATED SYSTEM');
    console.log('='.repeat(70));
    console.log(`\n⚙️  Configuration:`);
    console.log(`   Total stories: ${config.totalIterations}`);
    console.log(`   Ollama model: ${OLLAMA_MODEL}`);
    console.log(`   Review every user: ${config.checkpoints.reviewEveryUser}`);
    console.log(`   Review every story: ${config.checkpoints.reviewEveryStory}`);
    console.log(`   Progress check: Every ${config.checkpoints.continueCheckInterval} stories`);
    console.log(`   Output: ${config.output.filename}`);
    
    // Check Ollama connection
    console.log(`\n🔌 Testing Ollama connection...`);
    try {
        await callOllama('test', 0.5);
        console.log(`   ✅ Ollama connected`);
    } catch (error) {
        console.log(`   ❌ Cannot connect to Ollama`);
        console.log(`   Make sure Ollama is running: ollama serve`);
        console.log(`   And model is pulled: ollama pull ${OLLAMA_MODEL}`);
        rl.close();
        return;
    }
    
    const start = await ask('\n▶️  Start generation? (y/n): ');
    if (start.toLowerCase() !== 'y') {
        console.log('❌ Cancelled');
        rl.close();
        return;
    }
    
    const results = [];
    let iteration = 0;
    
    while (iteration < config.totalIterations) {
        iteration++;
        
        console.log('\n' + '─'.repeat(70));
        console.log(`📍 ITERATION ${iteration}/${config.totalIterations}`);
        console.log('─'.repeat(70));
        
        try {
            // Step 1: Generate demographics
            console.log('\n🎲 Generating user demographics...');
            const nationality = faker.helpers.arrayElement(config.NATIONALITIES);
            const demographics = generateUserDemographics(nationality);
            console.log(`   ✅ Generated: ${demographics.name}`);
            
            // Step 2: Generate background (Ollama)
            console.log('\n🤖 Generating user background with Ollama...');
            const background = await generateUserBackground(demographics);
            console.log(`   ✅ Generated background`);
            
            // CHECKPOINT 1: Review user
            const userAccepted = await checkpointUser(demographics, background, iteration);
            if (!userAccepted) {
                console.log('❌ User rejected, regenerating...');
                iteration--;
                continue;
            }
            
            // Step 3: Generate experience
            console.log('\n🎒 Generating experience details...');
            const experience = generateExperience(nationality);
            console.log(`   ✅ ${experience.experience_type} in ${experience.destination_country}`);
            
            // CHECKPOINT 2: Review experience
            const expAccepted = await checkpointExperience(experience, iteration);
            if (!expAccepted) {
                console.log('❌ Experience rejected, regenerating...');
                iteration--;
                continue;
            }
            
            // Step 4: Generate travel story (Ollama)
            console.log('\n🤖 Generating travel story with Ollama...');
            console.log('   (This may take 30-60 seconds...)');
            const story = await generateTravelStory(demographics, background, experience);
            console.log(`   ✅ Generated story (${story.body_text.length} chars)`);
            
            // Step 5: Generate title (Ollama)
            console.log('\n🤖 Generating story title with Ollama...');
            const title = await generateStoryTitle(demographics, experience, story.body_text);
            console.log(`   ✅ Generated title: "${title}"`);
            
            // CHECKPOINT 3: Review story
            const storyAccepted = await checkpointStory(title, story, iteration);
            if (!storyAccepted) {
                console.log('❌ Story rejected, regenerating...');
                iteration--;
                continue;
            }
            
            // Step 6: Concatenate
            console.log('\n🔗 Concatenating final record...');
            const record = concatenate(demographics, background, experience, story, title);
            results.push(record);
            
            // Step 7: Save
            saveResults(results);
            console.log(`💾 Saved progress (${results.length} stories)`);
            
            // CHECKPOINT 4: Continue check
            if (iteration % config.checkpoints.continueCheckInterval === 0 && 
                iteration < config.totalIterations) {
                const shouldContinue = await checkpointContinue(iteration, config.totalIterations, results);
                if (!shouldContinue) break;
            }
            
        } catch (error) {
            console.error(`\n❌ Error in iteration ${iteration}:`, error.message);
            const retry = await ask('Retry this iteration? (y/n): ');
            if (retry.toLowerCase() === 'y') {
                iteration--;
            }
        }
    }
    
    // Final summary
    console.log('\n' + '='.repeat(70));
    console.log('✅ GENERATION COMPLETE');
    console.log('='.repeat(70));
    showStats(results);
    console.log(`\n📁 Output: ${config.output.filename}`);
    console.log(`\n🎉 Done! Generated ${results.length} complete stories.`);
    
    rl.close();
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
    console.log('\n\n⏹️  Generation stopped by user');
    rl.close();
    process.exit(0);
});

// Run
main().catch(error => {
    console.error('❌ Fatal error:', error);
    rl.close();
    process.exit(1);
});
