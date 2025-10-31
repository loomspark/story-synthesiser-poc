/**
 * Configuration for Complete Story Synthesiser
 */

module.exports = {
    // How many stories to generate
    totalIterations: 30,
    
    // Human checkpoints
    checkpoints: {
        reviewEveryUser: false,      // Review each user before continuing
        reviewEveryExperience: false, // Review each experience before story gen
        reviewEveryStory: false,     // Review each story before saving
        continueCheckInterval: 5,    // Ask to continue every N stories
        specificCheckpoints: [10, 20] // Force review at these numbers
    },
    
    // Output settings
    output: {
        filename: 'generated_stories.json',
        saveIncremental: true
    },
    
    // Data arrays
    NATIONALITIES: [
        'UK', 'US', 'France', 'Germany', 'Spain',
        'Japan', 'Brazil', 'India', 'China', 'Canada',
        'Australia', 'Italy', 'Netherlands', 'Mexico'
    ],
    
    EXPERIENCE_TYPES: [
        'Volunteering',
        'Study Abroad',
        'Backpacking',
        'Cultural Exchange',
        'Work & Travel',
        'Au Pair',
        'Teaching English',
        'Gap Year',
        'Internship'
    ],
    
    DESTINATIONS: [
        'France', 'US', 'UK', 'Spain', 'Japan',
        'Australia', 'Brazil', 'Thailand', 'Germany',
        'Italy', 'Canada', 'China', 'India', 'Mexico',
        'Netherlands', 'South Africa', 'New Zealand',
        'Argentina', 'Kenya', 'Indonesia'
    ],
    
    GENDERS: ['Male', 'Female', 'Non-binary'],
    
    // Locale mapping for Faker
    LOCALE_MAP: {
        'UK': 'en_GB',
        'US': 'en_US',
        'France': 'fr',
        'Germany': 'de',
        'Spain': 'es',
        'Japan': 'ja',
        'Brazil': 'pt_BR',
        'India': 'en_IN',
        'China': 'zh_CN',
        'Canada': 'en_CA',
        'Australia': 'en_AU',
        'Italy': 'it',
        'Netherlands': 'nl',
        'Mexico': 'es_MX'
    }
};
