import ollama from 'ollama';

const AI_MODEL = 'gemma3:270m';

/* EXAMPLE STORY:

{
  "user": {
    "user_id": "001",
    "name": "Emily Carter",
    "gender": "Female",
    "DOB": "1994-07-15",
    "origin_address": "Asheville, North Carolina, USA",
    "nationality": "American",
    "user_description": "Emily is warm, reflective, and outdoorsy, with a calm southern tone to how she speaks. In writing, she’s thoughtful and descriptive, often blending emotion with sensory detail to paint vivid scenes of her experiences."
  },
  "experience": {
    "experience_id": "EXP-4592",
    "destination_country": "Nepal",
    "experience_type": "Volunteering"
  },
  "story": {
    "story_id": "ST-9821",
    "title": "",
    "body_text": "",
    "is_negative": false
  }
} 

EXAMPLE PROMPT:

My name is Emily Carter - [user_description]. I am a [getAge(givenDOB)] [gender]. 
I am a [nationality] living in [origin_address].
I went to [destination] on [destination_date**] for [experience_type] in [destination_country].
Write a realistic story that is [is_negative? "negative" : "positive"] about my time there.
*/

const DEFAULT_USER = {
  "user": {
    "user_id": "001",
    "name": "Emily Carter",
    "gender": "Female",
    "DOB": "1994-07-15",
    "origin_address": "Asheville, North Carolina, USA",
    "nationality": "American",
    "user_description": "Emily is warm, reflective, and outdoorsy, with a calm southern tone to how she speaks. In writing, she’s thoughtful and descriptive, often blending emotion with sensory detail to paint vivid scenes of her experiences."
  },
  "experience": {
    "experience_id": "EXP-4592",
    "destination_country": "Nepal",
    "experience_type": "Volunteering"
  },
  "story": {
    "story_id": "ST-9821",
    "title": "",
    "body_text": "",
    "is_negative": false
  }
};

export async function generateStory( info )
{

    const prompt = getPrompt( info );

    console.log(`PROMPT USED: \n ${prompt}`); 

    const storyObject = await getStory ( prompt ); 
    
    return storyObject; 
}

const DEFAULT_STORY_LENGTH = "short"; 


function getPrompt( info )
{
    const { name, gender, DOB, origin_address, nationality, user_description } = info.user;  
    const { destination_country, experience_type } = info.experience; 
    const { is_negative } = info.story; 

    const age = getAgeFromDOB(DOB);

    return `
    My name is ${name}. I am a ${age} year old ${gender}  - this is my description: ${user_description}. I am a ${nationality} living in ${origin_address}. My destination was ${destination_country}. I went to ${destination_country} for ${experience_type}. Provide a bespoke, realistic story that is ${ is_negative? "negative" : "positive" } and ${DEFAULT_STORY_LENGTH} about my time there.
    `
}

const systemPrompt = "You are a helpful assistant that writes short, realistic first-person travel stories based on user-provided background. The user will describe themselves and a country they visited. Your job is to write a biographical-style account of their time in that destination country. Your output must follow these rules: Write in the first person, as if you are the user. The story must be autobiographical. Keep the tone casual, warm, and reflective — like someone telling a personal story to a friend. Focus on one or two memorable experiences from the trip. Include details about the people met, cultural exchange, and how the experience changed the user’s perspective. Do not write like a novel. Avoid dramatic language or poetic flourishes. Use simple, clear sentences. Prioritize realism over literary style. The story should be positive and grounded in the user’s reason for visiting (e.g., volunteering), but it’s okay if the story gets sidetracked by unexpected moments. The story must clearly take place in the destination country. Keep the story between 200 and 400 words. The output must be a valid JSON string with two keys: { title, body_text }."

async function getStory( prompt )
{
    let systemSetup = [ { role: 'system', content: systemPrompt } ]

    let response = await ollama.chat(
    {
        model: AI_MODEL,
        messages: [...systemSetup, { role: 'user', content: prompt } ]  
    });

    return getJSON( response.message.content );
}



// TEST

const result = await generateStory( DEFAULT_USER ) ; 

console.log(`Story Title: ${result.title}`);
console.log(`Story Body Text: ${result.body_text}`); 


// Helper Methods

function getAgeFromDOB(dobString) {
  const dob = new Date(dobString);
  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  const dayDiff = today.getDate() - dob.getDate();

  // Adjust age if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age.toString();
}

function trimResponseString( responseString )
{
    let lines = responseString.split('\n'); // split by line breaks

    lines.splice(lines.length - 1, 1); // Remove last line (quotes)
    lines.splice(0, 1); // Remove first line (quotes)

    return lines.join('\n');
}

function getJSON( jsonTextResponse ) 
{
    const trimmedResponse = trimResponseString( jsonTextResponse );

    try {
        const jsonObject = JSON.parse(trimmedResponse);
        jsonObject['success'] = true; 
        return jsonObject;
    }
    catch (err) {

        // (Likely) failed to get correct JSON format
        console.log(err.message); 
        return { "title" : "Default Title", "body_text" : "Default Story", "success" : false }; 
    }
}

/* KNOWN ISSUES:

- Sometimes the origin_address is intepreted as a destination country. Adjustments have been made
to be more formal about distinguishing the destination country in the code but further redundancies
might be necessary. For instance sometimes the given story is framed by the return - "I returned to
[orgin_address] changed", which may confuse the AI model.

*/
