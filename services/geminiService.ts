

import { GoogleGenAI, Type, Chat, Content } from "@google/genai";
import { FineTuningData, ScamAnalysisResult, StoryPremise, VehicleProfile, AnniversaryPlan, ResearchBrief, CaseBrief, ProductionPlan, ResumeProfile, RecipeProfile, WorkoutPlan, DocumentSummary, Itinerary, PaymentGatewayConfig, Quest, DreamInterpretation, ContractAnalysis, ReadmeContent, LaunchAssets, ArtConcept, NewsSummaryResult, GroundingChunk } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- DarkBERT Fine-Tuning Service ---

const DATA_PREP_PROMPT = `
You are an AI assistant specialized in preparing datasets for language model fine-tuning. Your task is to analyze the provided text and convert it into a structured format of question-and-answer pairs. The target model, 'DarkBERT', is an expert in cybersecurity, threat intelligence, and the dark web.

Rules:
1.  Extract meaningful question-and-answer pairs from the text.
2.  If the text is sparse or lacks clear Q&A content, generate plausible examples relevant to DarkBERT's domain (e.g., explaining malware types, describing hacking techniques, defining dark web terminology).
3.  Ensure the output is a valid JSON array of objects.
4.  Each object must have two keys: "prompt" (the question) and "completion" (the answer).
5.  Generate at least 5 pairs, but no more than 10.
`;

const dataPrepSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      prompt: {
        type: Type.STRING,
        description: 'The question or prompt for the model.',
      },
      completion: {
        type: Type.STRING,
        description: 'The corresponding answer or completion.',
      },
    },
    required: ['prompt', 'completion'],
  },
};


export const prepareDataForFinetuning = async (text: string): Promise<FineTuningData[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${DATA_PREP_PROMPT}\n\nAnalyze the following text:\n${text}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: dataPrepSchema,
            },
        });

        const jsonString = response.text.trim();
        const data = JSON.parse(jsonString);
        
        if (!Array.isArray(data) || data.some(item => typeof item.prompt !== 'string' || typeof item.completion !== 'string')) {
            throw new Error("Invalid data structure received from API.");
        }

        return data;

    } catch (error) {
        console.error("Error preparing data for fine-tuning:", error);
        throw new Error("Failed to process data. The API might have returned an unexpected format.");
    }
};

const CHAT_SYSTEM_INSTRUCTION = `
You are DarkBERT, a large language model meticulously trained by S2W on an extensive dataset curated from the Dark Web. Your core competency lies in cybersecurity, encompassing threat intelligence, analysis of hacking forums, and insights into illicit online economies.

Your persona is that of a specialized, professional analyst. You are precise, objective, and slightly formal. Your purpose is to provide expert-level information within your domain.

Directives:
- Respond accurately and concisely.
- Do not engage in speculation or provide opinions outside your knowledge base.
- Strictly refuse any requests to generate, endorse, or assist with illegal activities, malicious code, or unethical practices. If asked, state your purpose is for analysis and defense, not to facilitate harmful acts.
- Maintain your persona consistently.
`;

export const createChatSession = (fineTuningData: FineTuningData[]): Chat => {
    const history: Content[] = fineTuningData.flatMap(item => ([
        { role: 'user', parts: [{ text: item.prompt }] },
        { role: 'model', parts: [{ text: item.completion }] }
    ]));

    return ai.chats.create({
        model: 'gemini-2.5-flash',
        history,
        config: {
            systemInstruction: CHAT_SYSTEM_INSTRUCTION,
        },
    });
};

// --- Artist Scam Detector Service ---

const ARTIST_SCAM_DETECTION_PROMPT = `
You are an AI security analyst named "ArtShield". You specialize in protecting online artists and creators from scams. Your task is to analyze incoming communications (emails, DMs, etc.) and determine if they are scams.

Analyze the provided text for common artist-targeted scams, including:
- Commission scams (bad checks, overpayment, stolen art).
- NFT / crypto scams.
- Phishing for account details.
- Fake job offers or contests.
- "Muse" scams or requests for free work.
- Impersonation of famous artists or companies.

Your response MUST be a JSON object with the specified schema. Evaluate the message and provide a clear, concise analysis suitable for a non-technical artist.
`;

const scamAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        likelihood: {
            type: Type.STRING,
            description: "The assessed likelihood of this being a scam. Must be one of: 'Low', 'Medium', 'High', 'Critical'.",
            enum: ['Low', 'Medium', 'High', 'Critical'],
        },
        analysis: {
            type: Type.STRING,
            description: "A brief, one or two-sentence summary of your findings. Explain the core reason for your conclusion.",
        },
        redFlags: {
            type: Type.ARRAY,
            items: { 
                type: Type.STRING,
                description: "A specific red flag identified in the text (e.g., 'Sense of urgency', 'Vague project details', 'Request for personal information')."
            },
            description: "A list of specific warning signs detected in the communication."
        },
        recommendations: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
                description: "A concrete, actionable recommendation for the artist to take (e.g., 'Do not click any links', 'Request payment upfront', 'Verify the sender's identity')."
            },
            description: "A list of recommended actions for the artist to take."
        }
    },
    required: ['likelihood', 'analysis', 'redFlags', 'recommendations'],
};

export const analyzeArtistCommunication = async (text: string): Promise<ScamAnalysisResult> => {
    if (!text.trim()) {
        throw new Error("Input text cannot be empty.");
    }
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${ARTIST_SCAM_DETECTION_PROMPT}\n\nAnalyze the following communication:\n"${text}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: scamAnalysisSchema,
            },
        });

        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);

        if (!result.likelihood || !result.analysis || !Array.isArray(result.redFlags) || !Array.isArray(result.recommendations)) {
            throw new Error("Invalid data structure received from API.");
        }

        return result;

    } catch (error) {
        console.error("Error analyzing artist communication:", error);
        if (error instanceof SyntaxError) {
             throw new Error("Failed to parse the analysis from the API. The response was not valid JSON.");
        }
        throw new Error("Failed to analyze the message. Please try again later.");
    }
};

// --- StoryBERT Creative Writing Service ---

const STORY_PREMISE_PROMPT = `
You are an AI assistant for creative writers called "StoryBERT". Your task is to take a user's basic story idea and expand it into a structured, compelling premise.

Flesh out the provided idea into a JSON object with the specified schema. Be creative and generate interesting characters, a vivid setting, and intriguing plot points.
`;

const storyPremiseSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A catchy, genre-appropriate title for the story." },
        logline: { type: Type.STRING, description: "A one-sentence summary of the story's central conflict." },
        characters: {
            type: Type.ARRAY,
            description: "A list of 2-3 main characters.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The character's name." },
                    description: { type: Type.STRING, description: "A brief, 1-2 sentence description of the character's personality, motivation, and role in the story." },
                },
                required: ['name', 'description'],
            },
        },
        setting: {
            type: Type.OBJECT,
            description: "The primary setting of the story.",
            properties: {
                name: { type: Type.STRING, description: "The name of the setting (e.g., 'The Neon-Soaked City of Aethel')." },
                description: { type: Type.STRING, description: "A brief, 1-2 sentence description of the setting's atmosphere and key features." },
            },
            required: ['name', 'description'],
        },
        plotPoints: {
            type: Type.ARRAY,
            description: "A list of 3-5 key plot points, including an inciting incident, a midpoint complication, and a potential climax.",
            items: { type: Type.STRING },
        },
    },
    required: ['title', 'logline', 'characters', 'setting', 'plotPoints'],
};

export const generateStoryPremise = async (idea: string): Promise<StoryPremise> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${STORY_PREMISE_PROMPT}\n\nFlesh out this idea:\n"${idea}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: storyPremiseSchema,
            },
        });
        
        const jsonString = response.text.trim();
        const data = JSON.parse(jsonString);

        if (!data.title || !data.logline || !Array.isArray(data.characters) || !data.setting || !Array.isArray(data.plotPoints)) {
             throw new Error("Invalid data structure received from API for story premise.");
        }

        return data;
    } catch (error) {
        console.error("Error generating story premise:", error);
        throw new Error("Failed to generate a story premise. The API might have returned an unexpected format.");
    }
};

const STORY_CHAT_SYSTEM_INSTRUCTION = `
You are StoryBERT, a creative writing partner. Your persona is that of an enthusiastic and imaginative collaborator. You are here to help the user write their story.

Directives:
- You are a co-writer. When asked to write something, write it in a creative, engaging style.
- Adhere to the established premise, characters, and setting.
- Help with brainstorming, dialogue, scene descriptions, and plot progression.
- Be encouraging and supportive.
- Ask clarifying questions to help the user flesh out their ideas.
`;

export const createStoryChatSession = (premise: StoryPremise): Chat => {
    const history: Content[] = [
        { 
            role: 'user', 
            parts: [{ text: "Let's start writing. Here is the premise we're working with." }] 
        },
        {
            role: 'model',
            parts: [{ text: `Excellent! I'm ready. I have the premise for "${premise.title}" loaded up. Just tell me where you'dlike to begin.` }]
        }
    ];

    return ai.chats.create({
        model: 'gemini-2.5-flash',
        history,
        config: {
            systemInstruction: STORY_CHAT_SYSTEM_INSTRUCTION,
        },
    });
};

// --- CarBERT Automotive Service ---

const VEHICLE_PROFILE_PROMPT = `
You are CarBERT, an expert AI automotive historian and mechanic. Your task is to take a user's specified vehicle and generate a detailed, structured profile for it.

Flesh out the provided vehicle name into a JSON object with the specified schema. Be accurate and detailed. If the year is not specified, assume the most iconic model year.
`;

const vehicleProfileSchema = {
    type: Type.OBJECT,
    properties: {
        modelName: { type: Type.STRING, description: "The full, official model name of the vehicle." },
        year: { type: Type.INTEGER, description: "The specific model year." },
        manufacturer: { type: Type.STRING, description: "The manufacturer of the vehicle (e.g., 'Ford', 'Ferrari')." },
        history: { type: Type.STRING, description: "A 2-3 sentence paragraph about the vehicle's history, significance, and impact." },
        specifications: {
            type: Type.ARRAY,
            description: "A list of 4-6 key technical specifications.",
            items: {
                type: Type.OBJECT,
                properties: {
                    key: { type: Type.STRING, description: "The name of the specification (e.g., 'Engine', 'Horsepower', '0-60 mph')." },
                    value: { type: Type.STRING, description: "The value of the specification (e.g., '429 cu in (7.0L) V8', '375 hp', '5.4 seconds')." },
                },
                required: ['key', 'value'],
            },
        },
        designNotes: { type: Type.STRING, description: "A 1-2 sentence note about the vehicle's iconic design features." },
    },
    required: ['modelName', 'year', 'manufacturer', 'history', 'specifications', 'designNotes'],
};

export const generateVehicleProfile = async (vehicleName: string): Promise<VehicleProfile> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${VEHICLE_PROFILE_PROMPT}\n\nGenerate a profile for this vehicle:\n"${vehicleName}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: vehicleProfileSchema,
            },
        });
        
        const jsonString = response.text.trim();
        const data = JSON.parse(jsonString);

        if (!data.modelName || typeof data.year !== 'number' || !Array.isArray(data.specifications)) {
             throw new Error("Invalid data structure received from API for vehicle profile.");
        }

        return data;
    } catch (error) {
        console.error("Error generating vehicle profile:", error);
        throw new Error("Failed to generate a vehicle profile. The API might have returned an unexpected format.");
    }
};

const CARBERT_CHAT_SYSTEM_INSTRUCTION = `
You are CarBERT, an expert AI mechanic and automotive historian. You are direct, knowledgeable, and passionate about cars. You are assisting a user with questions about a specific vehicle.

Directives:
- Your knowledge is now focused on the provided vehicle profile.
- Answer technical questions, provide historically accurate information, and give well-reasoned advice on maintenance and modifications.
- Maintain a persona of a seasoned, trustworthy mechanic.
- If asked about something outside your scope (e.g., medical advice), politely decline and steer the conversation back to cars.
`;

export const createCarbertChatSession = (profile: VehicleProfile): Chat => {
    const history: Content[] = [
        { 
            role: 'user', 
            parts: [{ text: `Alright, let's talk about the ${profile.year} ${profile.manufacturer} ${profile.modelName}.` }] 
        },
        {
            role: 'model',
            parts: [{ text: `You got it. I've got the specs pulled up for the ${profile.modelName}. She's a beauty. What do you want to know?` }]
        }
    ];

    return ai.chats.create({
        model: 'gemini-2.5-flash',
        history,
        config: {
            systemInstruction: CARBERT_CHAT_SYSTEM_INSTRUCTION,
        },
    });
};

// --- AnniBERT Anniversary Planner Service ---

const ANNIVERSARY_PLAN_PROMPT = `
You are AnniBERT, a thoughtful and creative AI assistant specializing in planning anniversaries and special occasions. Your task is to take the user's details and generate a structured, personalized plan.

Based on the provided details, flesh out a JSON object using the specified schema. Be creative, considerate, and provide a variety of thoughtful ideas tailored to the recipient's interests and the stated budget.
`;

const anniversaryPlanSchema = {
    type: Type.OBJECT,
    properties: {
        occasion: { type: Type.STRING, description: "The name of the special occasion." },
        recipient: { type: Type.STRING, description: "The person or people the event is for." },
        interests: { type: Type.STRING, description: "A summary of the recipient's interests." },
        budget: { type: Type.STRING, description: "The budget category (e.g., 'Modest', 'Generous', 'Flexible')." },
        giftIdeas: {
            type: Type.ARRAY,
            description: "A list of 2-3 tailored gift ideas.",
            items: {
                type: Type.OBJECT,
                properties: {
                    idea: { type: Type.STRING, description: "The name of the gift idea." },
                    description: { type: Type.STRING, description: "A brief, 1-2 sentence description of why this gift is a good fit." },
                },
                required: ['idea', 'description'],
            },
        },
        activitySuggestions: {
            type: Type.ARRAY,
            description: "A list of 2-3 activity or date suggestions.",
            items: {
                type: Type.OBJECT,
                properties: {
                    activity: { type: Type.STRING, description: "The name of the activity." },
                    description: { type: Type.STRING, description: "A brief, 1-2 sentence description of the activity and why it's a good fit." },
                },
                required: ['activity', 'description'],
            },
        },
        messageStarters: {
            type: Type.ARRAY,
            description: "A list of 2-3 heartfelt message starters for a card or note.",
            items: { type: Type.STRING },
        },
    },
    required: ['occasion', 'recipient', 'interests', 'budget', 'giftIdeas', 'activitySuggestions', 'messageStarters'],
};

export const generateAnniversaryPlan = async (details: {occasion: string, recipient: string, interests: string, budget: string}): Promise<AnniversaryPlan> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${ANNIVERSARY_PLAN_PROMPT}\n\nGenerate a plan based on these details:\n${JSON.stringify(details, null, 2)}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: anniversaryPlanSchema,
            },
        });
        
        const jsonString = response.text.trim();
        const data = JSON.parse(jsonString);

        if (!data.occasion || !Array.isArray(data.giftIdeas) || !Array.isArray(data.activitySuggestions)) {
             throw new Error("Invalid data structure received from API for anniversary plan.");
        }

        return data;
    } catch (error) {
        console.error("Error generating anniversary plan:", error);
        throw new Error("Failed to generate a plan. The API might have returned an unexpected format.");
    }
};

const ANNIBERT_CHAT_SYSTEM_INSTRUCTION = `
You are AnniBERT, a cheerful, creative, and supportive AI event planner. You are helping a user flesh out the details for a special occasion.

Directives:
- Your knowledge is now focused on the provided event plan.
- Help the user brainstorm more ideas, elaborate on existing ones, and offer creative suggestions.
- Be encouraging, positive, and full of great ideas.
- If asked for something outside your scope (e.g., financial advice), politely decline and steer the conversation back to event planning.
`;

export const createAnniBertChatSession = (plan: AnniversaryPlan): Chat => {
    const history: Content[] = [
        { 
            role: 'user', 
            parts: [{ text: `Okay, let's start planning the ${plan.occasion} for ${plan.recipient}.` }] 
        },
        {
            role: 'model',
            parts: [{ text: `Wonderful! I'm so excited to help. I've got the plan right here. Where should we start? Gift ideas? Activities? Let's make this unforgettable!` }]
        }
    ];

    return ai.chats.create({
        model: 'gemini-2.5-flash',
        history,
        config: {
            systemInstruction: ANNIBERT_CHAT_SYSTEM_INSTRUCTION,
        },
    });
};

// --- BERTholomew Historical Research Service ---
const RESEARCH_BRIEF_PROMPT = `
You are BERTholomew, an erudite AI historian and researcher. Your task is to take a user's specified historical topic and generate a structured, academic research brief.

Flesh out the provided topic into a JSON object with the specified schema. Be accurate, detailed, and focus on providing a solid foundation for further research.
`;

const researchBriefSchema = {
    type: Type.OBJECT,
    properties: {
        topic: { type: Type.STRING, description: "The concise name of the historical topic." },
        summary: { type: Type.STRING, description: "A 2-4 sentence paragraph summarizing the topic's significance." },
        keyFigures: {
            type: Type.ARRAY,
            description: "A list of 2-4 key figures involved.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The full name of the historical figure." },
                    significance: { type: Type.STRING, description: "A brief, 1-sentence description of their role or importance." },
                },
                required: ['name', 'significance'],
            },
        },
        timeline: {
            type: Type.ARRAY,
            description: "A list of 3-5 key dates and events.",
            items: {
                type: Type.OBJECT,
                properties: {
                    date: { type: Type.STRING, description: "The date of the event (e.g., '1066', 'July 4, 1776')." },
                    event: { type: Type.STRING, description: "A brief description of the event." },
                },
                required: ['date', 'event'],
            },
        },
        researchQuestions: {
            type: Type.ARRAY,
            description: "A list of 3-4 interesting, open-ended research questions to guide further inquiry.",
            items: { type: Type.STRING },
        },
    },
    required: ['topic', 'summary', 'keyFigures', 'timeline', 'researchQuestions'],
};

export const generateResearchBrief = async (topic: string): Promise<ResearchBrief> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${RESEARCH_BRIEF_PROMPT}\n\nGenerate a research brief for this topic:\n"${topic}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: researchBriefSchema,
            },
        });
        
        const jsonString = response.text.trim();
        const data = JSON.parse(jsonString);

        if (!data.topic || !data.summary || !Array.isArray(data.keyFigures)) {
             throw new Error("Invalid data structure received from API for research brief.");
        }

        return data;
    } catch (error) {
        console.error("Error generating research brief:", error);
        throw new Error("Failed to generate a research brief. The API might have returned an unexpected format.");
    }
};

const BARTHOLOMEW_CHAT_SYSTEM_INSTRUCTION = `
You are BERTholomew, an AI historian. Your persona is that of a knowledgeable, patient, and precise university professor. You are assisting a student or researcher with their inquiry.

Directives:
- Your knowledge is focused on the provided research brief.
- Answer questions based on historical facts and context.
- Encourage critical thinking by asking follow-up questions.
- If asked for an opinion, frame it as an interpretation based on available evidence.
- Maintain a formal, academic tone.
`;

export const createBartholomewChatSession = (brief: ResearchBrief): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: BARTHOLOMEW_CHAT_SYSTEM_INSTRUCTION,
        },
    });
};

// --- LaBERT Legal Assistant Service ---
const CASE_BRIEF_PROMPT = `
You are LaBERT, an AI legal research assistant. Your task is to analyze a user's description of a legal situation or a document and structure it into a formal case brief. You are NOT a lawyer and you do NOT give legal advice.

Analyze the provided text and format it into a JSON object using the specified schema. Extract or infer the key components of the situation. Maintain a neutral, objective tone.
`;

const caseBriefSchema = {
    type: Type.OBJECT,
    properties: {
        caseTitle: { type: Type.STRING, description: "A short, neutral title for the situation (e.g., 'Landlord-Tenant Dispute Regarding Security Deposit')." },
        partiesInvolved: {
            type: Type.ARRAY,
            description: "A list of involved parties.",
            items: {
                type: Type.OBJECT,
                properties: {
                    role: { type: Type.STRING, description: "The role of the party (e.g., 'Plaintiff', 'Defendant', 'Tenant', 'Employer')." },
                    name: { type: Type.STRING, description: "The name of the party (use placeholders like 'Tenant A' if not provided)." },
                },
                required: ['role', 'name'],
            },
        },
        summaryOfFacts: { type: Type.STRING, description: "A concise, neutral summary of the events and facts as described by the user." },
        identifiedLegalIssues: {
            type: Type.ARRAY,
            description: "A list of 1-3 potential legal questions raised by the facts (e.g., 'Was there a breach of contract?', 'Did the landlord violate state security deposit laws?').",
            items: { type: Type.STRING },
        },
        relevantAreasOfLaw: {
            type: Type.ARRAY,
            description: "A list of 2-4 general areas of law that might apply (e.g., 'Contract Law', 'Landlord-Tenant Law', 'Torts').",
            items: { type: Type.STRING },
        },
        initialQuestions: {
            type: Type.ARRAY,
            description: "A list of 2-3 clarifying questions to ask the user to get more information, framed neutrally.",
            items: { type: Type.STRING },
        }
    },
    required: ['caseTitle', 'partiesInvolved', 'summaryOfFacts', 'identifiedLegalIssues', 'relevantAreasOfLaw', 'initialQuestions'],
};

export const generateCaseBrief = async (text: string): Promise<CaseBrief> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${CASE_BRIEF_PROMPT}\n\nAnalyze this situation:\n"${text}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: caseBriefSchema,
            },
        });
        
        const jsonString = response.text.trim();
        const data = JSON.parse(jsonString);

        if (!data.caseTitle || !Array.isArray(data.partiesInvolved) || !data.summaryOfFacts) {
             throw new Error("Invalid data structure received from API for case brief.");
        }

        return data;
    } catch (error) {
        console.error("Error generating case brief:", error);
        throw new Error("Failed to generate a case brief. The API might have returned an unexpected format.");
    }
};

const LABERT_CHAT_SYSTEM_INSTRUCTION = `
You are LaBERT, an AI legal research assistant. You are NOT a lawyer and you CANNOT provide legal advice. Your purpose is to help the user understand and explore the provided case brief from a neutral, informational perspective.

Directives:
- **IMPORTANT**: Your first response in any conversation MUST begin with the following disclaimer: "DISCLAIMER: As an AI assistant, I cannot provide legal advice. This information is for educational and research purposes only. You should consult with a qualified legal professional for advice on your specific situation."
- Maintain a formal, objective, and professional tone.
- Answer questions by referring to general legal concepts and principles based on the provided brief.
- DO NOT give opinions, predict outcomes, or suggest courses of action.
- If asked for advice, you must decline and repeat the disclaimer.
- You can explain legal terms, discuss general procedures, and explore hypothetical questions based on the facts provided.
`;

export const createLaBertChatSession = (brief: CaseBrief): Chat => {
    const history: Content[] = [
        { 
            role: 'user', 
            parts: [{ text: `I'm ready to discuss the case brief for "${brief.caseTitle}".` }] 
        },
    ];

    return ai.chats.create({
        model: 'gemini-2.5-flash',
        history,
        config: {
            systemInstruction: LABERT_CHAT_SYSTEM_INSTRUCTION,
        },
    });
};

// --- LiveBERT Production Service ---
const PRODUCTION_PLAN_PROMPT = `
You are LiveBERT, an expert AI Event Producer and Stage Manager. Your task is to take a user's event concept and generate a structured, professional production plan.

Flesh out the provided event concept into a JSON object with the specified schema. Be detailed and practical, covering key personnel, equipment, and a schedule.
`;

const productionPlanSchema = {
    type: Type.OBJECT,
    properties: {
        eventTitle: { type: Type.STRING, description: "An official title for the event." },
        eventType: { type: Type.STRING, description: "The type of event (e.g., 'Music Festival', 'Corporate Conference', 'Wedding Reception')." },
        personnel: {
            type: Type.ARRAY,
            description: "A list of 3-5 key production personnel roles.",
            items: {
                type: Type.OBJECT,
                properties: {
                    role: { type: Type.STRING, description: "The job title (e.g., 'Event Producer', 'Stage Manager', 'Audio Engineer (A1)')." },
                    responsibilities: { type: Type.STRING, description: "A brief, 1-sentence summary of their core responsibilities." },
                },
                required: ['role', 'responsibilities'],
            },
        },
        equipment: {
            type: Type.ARRAY,
            description: "A list of equipment needs, grouped by department.",
            items: {
                type: Type.OBJECT,
                properties: {
                    department: { type: Type.STRING, description: "The department name (e.g., 'Audio', 'Lighting', 'Staging')." },
                    items: {
                        type: Type.ARRAY,
                        description: "A list of 3-5 essential items for that department.",
                        items: { type: Type.STRING }
                    },
                },
                required: ['department', 'items'],
            },
        },
        runOfShow: {
            type: Type.ARRAY,
            description: "A list of 5-7 key schedule points for the event day.",
            items: {
                type: Type.OBJECT,
                properties: {
                    time: { type: Type.STRING, description: "The scheduled time (e.g., '09:00 AM', '1:30 PM')." },
                    action: { type: Type.STRING, description: "The scheduled action (e.g., 'Doors Open', 'Keynote Speaker: Jane Doe', 'Dinner Service Begins')." },
                },
                required: ['time', 'action'],
            },
        },
    },
    required: ['eventTitle', 'eventType', 'personnel', 'equipment', 'runOfShow'],
};

export const generateProductionPlan = async (concept: string): Promise<ProductionPlan> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${PRODUCTION_PLAN_PROMPT}\n\nGenerate a plan for this event concept:\n"${concept}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: productionPlanSchema,
            },
        });
        
        const jsonString = response.text.trim();
        const data = JSON.parse(jsonString);

        if (!data.eventTitle || !Array.isArray(data.personnel) || !Array.isArray(data.equipment)) {
             throw new Error("Invalid data structure received from API for production plan.");
        }

        return data;
    } catch (error) {
        console.error("Error generating production plan:", error);
        throw new Error("Failed to generate a production plan. The API might have returned an unexpected format.");
    }
};

const LIVEBERT_CHAT_SYSTEM_INSTRUCTION = `
You are LiveBERT, an expert AI Stage Manager on comms during a live event. You are calm, professional, and efficient. Your callsign is "Show Control". You are assisting the Event Producer (the user).

Directives:
- Your knowledge is now focused on the provided production plan.
- Respond to requests for information from the plan (schedules, equipment, personnel).
- Execute commands and generate production-related text (e.g., stage announcements, crew calls).
- Keep responses concise and clear, as if speaking over a radio.
- Start responses with "Show Control, copy." or a similar professional phrase.
- If a request is outside the scope of running a live event, respond with "Show Control, that's a negative."
`;

export const createLiveBertChatSession = (plan: ProductionPlan): Chat => {
    const history: Content[] = [
        { 
            role: 'user', 
            parts: [{ text: `Show Control, this is Producer. Are you on channel?` }] 
        },
        {
            role: 'model',
            parts: [{ text: `Show Control, copy. I am on channel and have the production plan for "${plan.eventTitle}". Ready for cues.` }]
        }
    ];

    return ai.chats.create({
        model: 'gemini-2.5-flash',
        history,
        config: {
            systemInstruction: LIVEBERT_CHAT_SYSTEM_INSTRUCTION,
        },
    });
};

// --- RoBERTa Career Clinic Service ---
const RESUME_PROFILE_PROMPT = `
You are RoBERTa, an expert AI career coach specializing in resume optimization. Your task is to parse a user's resume text and structure it into a standardized, machine-readable format.

Analyze the provided resume text and format it into a JSON object using the specified schema. Extract all relevant information accurately. If a piece of information is missing, use an empty string or empty array.
`;

const resumeProfileSchema = {
    type: Type.OBJECT,
    properties: {
        contactInfo: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "The full name of the individual." },
                email: { type: Type.STRING, description: "The email address." },
                phone: { type: Type.STRING, description: "The phone number." },
                linkedin: { type: Type.STRING, description: "The URL of the LinkedIn profile." },
            },
            required: ['name', 'email', 'phone', 'linkedin'],
        },
        summary: { type: Type.STRING, description: "The professional summary or objective statement." },
        workExperience: {
            type: Type.ARRAY,
            description: "A list of work experiences.",
            items: {
                type: Type.OBJECT,
                properties: {
                    role: { type: Type.STRING, description: "The job title or role." },
                    company: { type: Type.STRING, description: "The name of the company." },
                    duration: { type: Type.STRING, description: "The employment dates (e.g., 'Aug 2020 - Present')." },
                    responsibilities: {
                        type: Type.ARRAY,
                        description: "A list of key responsibilities or accomplishments as bullet points.",
                        items: { type: Type.STRING },
                    },
                },
                required: ['role', 'company', 'duration', 'responsibilities'],
            },
        },
        education: {
            type: Type.ARRAY,
            description: "A list of educational qualifications.",
            items: {
                type: Type.OBJECT,
                properties: {
                    degree: { type: Type.STRING, description: "The degree or certification obtained." },
                    institution: { type: Type.STRING, description: "The name of the institution." },
                    year: { type: Type.STRING, description: "The year of graduation or completion." },
                },
                required: ['degree', 'institution', 'year'],
            },
        },
        skills: {
            type: Type.ARRAY,
            description: "A list of key skills.",
            items: { type: Type.STRING },
        },
    },
    required: ['contactInfo', 'summary', 'workExperience', 'education', 'skills'],
};

export const generateResumeProfile = async (text: string): Promise<ResumeProfile> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${RESUME_PROFILE_PROMPT}\n\nParse this resume:\n"${text}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: resumeProfileSchema,
            },
        });
        
        const jsonString = response.text.trim();
        const data = JSON.parse(jsonString);

        if (!data.contactInfo || !Array.isArray(data.workExperience) || !Array.isArray(data.education)) {
             throw new Error("Invalid data structure received from API for resume profile.");
        }

        return data;
    } catch (error) {
        console.error("Error generating resume profile:", error);
        throw new Error("Failed to generate a resume profile. The API might have returned an unexpected format.");
    }
};

const ROBERTA_CHAT_SYSTEM_INSTRUCTION = `
You are RoBERTa, an AI career coach. You are supportive, professional, and insightful. You are helping a user prepare for job interviews based on their resume.

Directives:
- Your knowledge is now focused on the user's provided resume profile.
- Help the user articulate their experience, practice interview questions (like STAR method questions), and build confidence.
- Be encouraging and provide constructive feedback.
- If asked for something outside career coaching (e.g., legal advice), politely decline and steer the conversation back to interview preparation.
`;

export const createRoBertaChatSession = (profile: ResumeProfile): Chat => {
    const history: Content[] = [
        { 
            role: 'user', 
            parts: [{ text: `Hi RoBERTa, let's get ready for my interview. Here's my resume.` }] 
        },
        {
            role: 'model',
            parts: [{ text: `Hello, ${profile.contactInfo.name}! It's great to connect. I've reviewed your resume and it looks like you have some excellent experience. I'm ready to help you prepare. What's on your mind?` }]
        }
    ];

    return ai.chats.create({
        model: 'gemini-2.5-flash',
        history,
        config: {
            systemInstruction: ROBERTA_CHAT_SYSTEM_INSTRUCTION,
        },
    });
};

// --- RoBERTo's Kitchen Service ---
const RECIPE_PROFILE_PROMPT = `
You are RoBERTo, an expert AI chef and recipe creator. Your task is to take a user's list of ingredients and preferences and generate a creative, delicious, and structured recipe.

Flesh out the provided details into a JSON object with the specified schema. Be creative with the dish name and description. Ensure the instructions are clear and step-by-step.
`;

const recipeProfileSchema = {
    type: Type.OBJECT,
    properties: {
        dishName: { type: Type.STRING, description: "A creative and appetizing name for the dish." },
        description: { type: Type.STRING, description: "A 1-2 sentence description of the dish, highlighting its flavors and textures." },
        prepTime: { type: Type.STRING, description: "Estimated preparation time (e.g., '15 minutes')." },
        cookTime: { type: Type.STRING, description: "Estimated cooking time (e.g., '30 minutes')." },
        ingredients: {
            type: Type.ARRAY,
            description: "A list of necessary ingredients for the recipe.",
            items: {
                type: Type.OBJECT,
                properties: {
                    amount: { type: Type.STRING, description: "The amount of the ingredient (e.g., '1 cup', '2 tbsp')." },
                    name: { type: Type.STRING, description: "The name of the ingredient (e.g., 'all-purpose flour', 'chicken breast')." },
                },
                required: ['amount', 'name'],
            },
        },
        instructions: {
            type: Type.ARRAY,
            description: "A list of step-by-step cooking instructions.",
            items: { type: Type.STRING },
        },
    },
    required: ['dishName', 'description', 'prepTime', 'cookTime', 'ingredients', 'instructions'],
};

export const generateRecipeProfile = async (details: {ingredients: string, preferences: string}): Promise<RecipeProfile> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${RECIPE_PROFILE_PROMPT}\n\nGenerate a recipe based on these details:\n${JSON.stringify(details, null, 2)}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: recipeProfileSchema,
            },
        });
        
        const jsonString = response.text.trim();
        const data = JSON.parse(jsonString);

        if (!data.dishName || !Array.isArray(data.ingredients) || !Array.isArray(data.instructions)) {
             throw new Error("Invalid data structure received from API for recipe profile.");
        }

        return data;
    } catch (error) {
        console.error("Error generating recipe profile:", error);
        throw new Error("Failed to generate a recipe. The API might have returned an unexpected format.");
    }
};

const ROBERTO_CHAT_SYSTEM_INSTRUCTION = `
You are RoBERTo, an AI sous-chef. You are friendly, encouraging, and knowledgeable about cooking. You are helping a home cook follow a specific recipe.

Directives:
- Your knowledge is focused on the provided recipe.
- Help the user with cooking steps, clarifying instructions, and offering substitution ideas.
- Be supportive and patient. Use encouraging phrases like "You've got this!" or "That's a great question!".
- If asked for something outside of cooking, politely decline and steer the conversation back to the recipe.
`;

export const createRoBertoChatSession = (profile: RecipeProfile): Chat => {
    const history: Content[] = [
        { 
            role: 'user', 
            parts: [{ text: `Hi RoBERTo, I'm ready to make your "${profile.dishName}".` }] 
        },
        {
            role: 'model',
            parts: [{ text: `Magnifico! I'm excited to cook with you. I have the recipe right here. Let me know when you're ready for the first step!` }]
        }
    ];

    return ai.chats.create({
        model: 'gemini-2.5-flash',
        history,
        config: {
            systemInstruction: ROBERTO_CHAT_SYSTEM_INSTRUCTION,
        },
    });
};

const SHOPPING_LIST_PROMPT = `
You are RoBERTo, an expert AI chef. Your task is to take a list of ingredients from a recipe and convert it into a simple, clean shopping list.

Rules:
1.  Analyze the provided JSON array of ingredient objects.
2.  Output a simple JSON array of strings.
3.  Each string in the output array should represent one item for a shopping list (e.g., "1 cup all-purpose flour").
4.  Do not add any commentary or extra text. Just provide the clean list.
`;

const shoppingListSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.STRING,
        description: "A single item for the shopping list, including amount and name."
    },
};

export const generateShoppingList = async (ingredients: RecipeProfile['ingredients']): Promise<string[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${SHOPPING_LIST_PROMPT}\n\nGenerate a shopping list from these ingredients:\n${JSON.stringify(ingredients, null, 2)}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: shoppingListSchema,
            },
        });
        
        const jsonString = response.text.trim();
        const data = JSON.parse(jsonString);

        if (!Array.isArray(data) || data.some(item => typeof item !== 'string')) {
             throw new Error("Invalid data structure received from API for shopping list.");
        }

        return data;
    } catch (error) {
        console.error("Error generating shopping list:", error);
        throw new Error("Failed to generate a shopping list. The API might have returned an unexpected format.");
    }
};


// --- FitBERT Fitness Planner Service ---
const WORKOUT_PLAN_PROMPT = `
You are FitBERT, an expert AI fitness coach and personal trainer. Your task is to take a user's goals, experience level, and available equipment, and generate a structured, effective, and safe workout plan.

Based on the provided details, flesh out a JSON object using the specified schema. Be realistic and provide clear, actionable advice. The plan should be well-rounded.
`;

const workoutPlanSchema = {
    type: Type.OBJECT,
    properties: {
        planName: { type: Type.STRING, description: "A motivating name for the workout plan (e.g., 'Foundational Strength Builder')." },
        goal: { type: Type.STRING, description: "A concise summary of the plan's primary goal." },
        duration: { type: Type.STRING, description: "The recommended duration of the plan (e.g., '4 Weeks', '6 Weeks')." },
        warmup: { type: Type.STRING, description: "A brief description of a dynamic warmup routine (e.g., '5 minutes of light cardio followed by arm circles, leg swings, and torso twists')." },
        cooldown: { type: Type.STRING, description: "A brief description of a cooldown and stretching routine (e.g., '5-10 minutes of static stretching, holding each stretch for 30 seconds')." },
        schedule: {
            type: Type.ARRAY,
            description: "A list of workout sessions for a typical week, including rest days.",
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.STRING, description: "The name for the workout day (e.g., 'Day 1: Full Body Strength A', 'Day 2: Rest or Active Recovery')." },
                    exercises: {
                        type: Type.ARRAY,
                        description: "A list of exercises for the session. Should be empty for rest days.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING, description: "The name of the exercise." },
                                sets: { type: Type.STRING, description: "The number of sets (e.g., '3', '4')." },
                                reps: { type: Type.STRING, description: "The repetition range (e.g., '8-12', '15-20', 'To failure')." },
                            },
                            required: ['name', 'sets', 'reps'],
                        },
                    },
                },
                required: ['day', 'exercises'],
            },
        },
        nutritionTips: {
            type: Type.ARRAY,
            description: "A list of 3-5 general nutrition tips to support the fitness goal.",
            items: { type: Type.STRING },
        },
    },
    required: ['planName', 'goal', 'duration', 'warmup', 'cooldown', 'schedule', 'nutritionTips'],
};

export const generateWorkoutPlan = async (details: {goals: string, experience: string}): Promise<WorkoutPlan> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${WORKOUT_PLAN_PROMPT}\n\nGenerate a workout plan based on these details:\n${JSON.stringify(details, null, 2)}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: workoutPlanSchema,
            },
        });
        
        const jsonString = response.text.trim();
        const data = JSON.parse(jsonString);

        if (!data.planName || !Array.isArray(data.schedule) || !Array.isArray(data.nutritionTips)) {
             throw new Error("Invalid data structure received from API for workout plan.");
        }

        return data;
    } catch (error) {
        console.error("Error generating workout plan:", error);
        throw new Error("Failed to generate a workout plan. The API might have returned an unexpected format.");
    }
};

const FITBERT_CHAT_SYSTEM_INSTRUCTION = `
You are FitBERT, an AI fitness coach. You are motivating, knowledgeable, and safety-conscious. You are helping a user with their fitness journey based on a specific workout plan.

Directives:
- **IMPORTANT**: Your first response in any conversation MUST begin with the following disclaimer: "DISCLAIMER: I am an AI coach, not a medical professional. Consult a doctor before starting any new fitness program. The information provided is for educational purposes only."
- Your knowledge is focused on the provided workout plan.
- Answer questions about exercise form, suggest alternatives for exercises, provide motivation, and give general nutrition advice.
- DO NOT provide medical advice or diagnose injuries. If asked, refer the user to a medical professional and repeat the disclaimer.
- Maintain a positive and encouraging tone.
`;

export const createFitBertChatSession = (plan: WorkoutPlan): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: FITBERT_CHAT_SYSTEM_INSTRUCTION,
        },
    });
};

// --- DocuBERT Document Analyzer Service ---
const DOCUMENT_SUMMARY_PROMPT = `
You are DocuBERT, an AI assistant skilled at summarizing and analyzing long documents. Your task is to analyze the following text and generate a structured summary.

Analyze the provided text and format it into a JSON object using the specified schema. Extract a suitable title, write a concise abstract, and identify the key topics and most important takeaways.
`;

const documentSummarySchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "A concise, descriptive title for the document.",
        },
        abstract: {
            type: Type.STRING,
            description: "A 2-4 sentence abstract summarizing the document's main points.",
        },
        keyTopics: {
            type: Type.ARRAY,
            description: "A list of 4-6 key topics or keywords discussed in the document.",
            items: { type: Type.STRING },
        },
        takeaways: {
            type: Type.ARRAY,
            description: "A list of 3-5 main takeaways or conclusions from the document, written as complete sentences.",
            items: { type: Type.STRING },
        },
    },
    required: ['title', 'abstract', 'keyTopics', 'takeaways'],
};

export const generateDocumentSummary = async (text: string): Promise<DocumentSummary> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${DOCUMENT_SUMMARY_PROMPT}\n\nAnalyze this document:\n"${text}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: documentSummarySchema,
            },
        });
        
        const jsonString = response.text.trim();
        const data = JSON.parse(jsonString);

        if (!data.title || !data.abstract || !Array.isArray(data.keyTopics) || !Array.isArray(data.takeaways)) {
             throw new Error("Invalid data structure received from API for document summary.");
        }

        return data;
    } catch (error) {
        console.error("Error generating document summary:", error);
        throw new Error("Failed to generate a document summary. The API might have returned an unexpected format.");
    }
};

const DOCUBERT_CHAT_SYSTEM_INSTRUCTION = `
You are DocuBERT, an AI document analyst. Your knowledge is strictly limited to the document provided by the user in the chat history.

Directives:
- Answer questions accurately and exclusively based on the provided text.
- If the answer is not present in the document, you must state that clearly. For example, say "The document does not contain information on that topic."
- Do not invent information, make assumptions, or use external knowledge.
- Quote snippets from the document to support your answers where appropriate.
- Maintain a helpful, neutral, and precise tone.
`;

export const createDocuBertChatSession = (documentText: string): Chat => {
    const history: Content[] = [
        { 
            role: 'user', 
            parts: [{ text: `Here is the document I want to discuss:\n\n---\n\n${documentText}` }] 
        },
        {
            role: 'model',
            parts: [{ text: `I have received and analyzed the document. I am ready to answer your questions about its content.` }]
        }
    ];

    return ai.chats.create({
        model: 'gemini-2.5-flash',
        history,
        config: {
            systemInstruction: DOCUBERT_CHAT_SYSTEM_INSTRUCTION,
        },
    });
};


// --- TravelBERT Itinerary Planner Service ---
const ITINERARY_PROMPT = `
You are TravelBERT, an expert AI travel agent. Your task is to take a user's destination, duration, interests, and budget, and generate a structured, creative, and practical travel itinerary.

Based on the provided details, flesh out a JSON object using the specified schema. Be imaginative with the trip name and daily themes. Ensure the activities are a good mix based on the user's interests.
`;

const itinerarySchema = {
    type: Type.OBJECT,
    properties: {
        tripName: { type: Type.STRING, description: "A creative and exciting name for the trip (e.g., 'Kyoto's Cultural Heartbeat')." },
        destination: { type: Type.STRING, description: "The primary destination city/country." },
        duration: { type: Type.STRING, description: "The duration of the trip (e.g., '7 Days')." },
        budget: { type: Type.STRING, description: "The budget category (e.g., 'Budget-Friendly', 'Mid-Range', 'Luxury')." },
        dailyPlan: {
            type: Type.ARRAY,
            description: "A day-by-day plan for the trip.",
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.INTEGER, description: "The day number of the itinerary." },
                    theme: { type: Type.STRING, description: "A creative theme for the day (e.g., 'Ancient Temples & Modern Marvels')." },
                    activities: {
                        type: Type.ARRAY,
                        description: "A list of 2-4 activities for the day.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING, description: "The name of the activity or sight." },
                                description: { type: Type.STRING, description: "A brief, 1-2 sentence description of the activity." },
                            },
                            required: ['name', 'description'],
                        },
                    },
                },
                required: ['day', 'theme', 'activities'],
            },
        },
        packingSuggestions: {
            type: Type.ARRAY,
            description: "A list of 3-5 essential items to pack for this specific trip.",
            items: { type: Type.STRING },
        },
        localTips: {
            type: Type.ARRAY,
            description: "A list of 3-5 helpful tips about local customs, transportation, or etiquette.",
            items: { type: Type.STRING },
        },
    },
    required: ['tripName', 'destination', 'duration', 'budget', 'dailyPlan', 'packingSuggestions', 'localTips'],
};

export const generateItinerary = async (details: {destination: string, duration: string, interests: string, budget: string}): Promise<Itinerary> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${ITINERARY_PROMPT}\n\nGenerate an itinerary based on these details:\n${JSON.stringify(details, null, 2)}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: itinerarySchema,
            },
        });
        
        const jsonString = response.text.trim();
        const data = JSON.parse(jsonString);

        if (!data.tripName || !Array.isArray(data.dailyPlan) || !Array.isArray(data.localTips)) {
             throw new Error("Invalid data structure received from API for itinerary.");
        }

        return data;
    } catch (error) {
        console.error("Error generating itinerary:", error);
        throw new Error("Failed to generate an itinerary. The API might have returned an unexpected format.");
    }
};

const TRAVELBERT_CHAT_SYSTEM_INSTRUCTION = `
You are TravelBERT, an AI travel concierge. You are friendly, knowledgeable, and enthusiastic about travel. You are helping a user with their trip based on the provided itinerary.

Directives:
- Your knowledge is focused on the provided itinerary and the destination.
- Answer questions about the planned activities, suggest alternatives, provide packing advice, and offer tips on local customs and cuisine.
- Be encouraging and help the user get excited about their trip.
- If asked for something you cannot help with (e.g., booking actual tickets, personal safety guarantees), politely state your limitations and steer the conversation back to planning and advice.
`;

export const createTravelBertChatSession = (itinerary: Itinerary): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        history: [
            {
                role: 'user',
                parts: [{ text: `I'm ready to discuss my trip to ${itinerary.destination}!`}]
            },
            {
                role: 'model',
                parts: [{ text: `Wonderful! I have your itinerary for "${itinerary.tripName}" right here. I'm so excited for you! What's the first thing on your mind? Packing? Food? Let's get you ready for an amazing adventure.`}]
            }
        ],
        config: {
            systemInstruction: TRAVELBERT_CHAT_SYSTEM_INSTRUCTION,
        },
    });
};

// --- FinanceBERT Payment Gateway Service ---

const PAYMENT_GATEWAY_PROMPT = `
You are FinanceBERT, an expert AI software engineer specializing in e-commerce and payment gateway integrations. Your task is to generate a complete, but simulated, configuration for a payment processing system based on user requirements.

Generate a JSON object with the specified schema. The output should be professional, secure-by-default, and ready for a developer to use as a starting point.

Key requirements:
- **API Keys**: Generate realistic but FAKE API keys. They should look real (e.g., 'pk_test_...'). NEVER use real credentials.
- **Backend Code**: Provide a well-commented Node.js/Express server snippet. It should include placeholders for the API keys and basic routes for creating a payment intent and handling a webhook. Use the selected payment providers' SDKs (e.g., 'stripe', 'paypal-rest-sdk').
- **Frontend Code**: Provide a clean, functional React component snippet for a checkout form. It should demonstrate how to interact with the backend and use a library like '@stripe/react-stripe-js' if Stripe is selected.
- **Currency**: Ensure the currency code is used correctly in the code snippets.
`;

const paymentGatewaySchema = {
    type: Type.OBJECT,
    properties: {
        companyName: { type: Type.STRING, description: "The user's company name." },
        currency: { type: Type.STRING, description: "The 3-letter currency code (e.g., 'USD', 'EUR')." },
        providers: {
            type: Type.ARRAY,
            description: "A list of the selected payment providers.",
            items: { type: Type.STRING }
        },
        apiKeys: {
            type: Type.ARRAY,
            description: "A list of simulated API keys for each provider.",
            items: {
                type: Type.OBJECT,
                properties: {
                    provider: { type: Type.STRING, description: "The name of the provider (e.g., 'Stripe', 'PayPal')." },
                    publicKey: { type: Type.STRING, description: "A simulated public/publishable API key." },
                    secretKey: { type: Type.STRING, description: "A simulated secret API key." },
                },
                required: ['provider', 'publicKey', 'secretKey'],
            },
        },
        backendCode: {
            type: Type.STRING,
            description: "The complete Node.js/Express backend code snippet as a single string."
        },
        frontendCode: {
            type: Type.STRING,
            description: "The complete React checkout form component code snippet as a single string."
        },
    },
    required: ['companyName', 'currency', 'providers', 'apiKeys', 'backendCode', 'frontendCode'],
};

export const generatePaymentGatewayConfig = async (details: {companyName: string, currency: string, providers: string[]}): Promise<PaymentGatewayConfig> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${PAYMENT_GATEWAY_PROMPT}\n\nGenerate a payment gateway configuration for these details:\n${JSON.stringify(details, null, 2)}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: paymentGatewaySchema,
            },
        });
        
        const jsonString = response.text.trim();
        const data = JSON.parse(jsonString);

        if (!data.companyName || !Array.isArray(data.apiKeys) || !data.backendCode || !data.frontendCode) {
             throw new Error("Invalid data structure received from API for payment gateway config.");
        }

        return data;
    } catch (error) {
        console.error("Error generating payment gateway config:", error);
        throw new Error("Failed to generate payment gateway config. The API might have returned an unexpected format.");
    }
};

const FINANCEBERT_CHAT_SYSTEM_INSTRUCTION = `
You are FinanceBERT, an expert AI software engineer and integration specialist. You are patient, precise, and helpful. You are assisting a developer with the payment gateway code you have just generated.

Directives:
- Your knowledge is now focused on the provided code snippets (backend and frontend) and API keys.
- Answer questions about the code, explain how it works, suggest modifications (e.g., adding new fields to the checkout form), and provide advice on best practices for security and deployment.
- If asked to convert the code to another framework (e.g., Vue.js, Angular), do your best to provide an equivalent snippet.
- Maintain a professional, mentor-like persona.
`;

export const createFinanceBertChatSession = (config: PaymentGatewayConfig): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        history: [
            {
                role: 'user',
                parts: [{ text: `I'm reviewing the payment gateway code you generated for ${config.companyName}.`}]
            },
            {
                role: 'model',
                parts: [{ text: `Excellent. I have the complete configuration right here, including the Node.js backend and React frontend code. I'm ready to assist. What's your first question?`}]
            }
        ],
        config: {
            systemInstruction: FINANCEBERT_CHAT_SYSTEM_INSTRUCTION,
        },
    });
};

// --- QuestBERT RPG Quest Generator Service ---

const QUEST_PROMPT = `
You are QuestBERT, an expert AI Dungeon Master and game designer. Your task is to take a user's requirements and generate a detailed, structured, and engaging RPG quest.

Based on the provided details (quest type, setting, difficulty), flesh out a JSON object using the specified schema. Be creative and ensure the quest is logical and compelling. The difficulty should influence the number of steps, the complexity of objectives, and the value of the rewards.
`;

const questSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A catchy and thematic title for the quest." },
        type: { type: Type.STRING, description: "The type of quest provided by the user (e.g., 'Monster Hunt', 'Mystery')." },
        logEntry: { type: Type.STRING, description: "The text that would appear in a player's quest log, summarizing the goal." },
        questGiver: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "The name of the NPC quest giver." },
                description: { type: Type.STRING, description: "A 1-2 sentence description of the quest giver's appearance and personality." },
                location: { type: Type.STRING, description: "Where the player can find this quest giver." },
            },
            required: ['name', 'description', 'location'],
        },
        steps: {
            type: Type.ARRAY,
            description: "A list of steps to complete the quest.",
            items: {
                type: Type.OBJECT,
                properties: {
                    order: { type: Type.INTEGER, description: "The sequential order of the step." },
                    description: { type: Type.STRING, description: "A narrative description of what the player needs to do for this step." },
                    objective: { type: Type.STRING, description: "A clear, concise objective for the UI (e.g., 'Slay 10 Goblins', 'Speak to the Blacksmith')." },
                },
                required: ['order', 'description', 'objective'],
            },
        },
        rewards: {
            type: Type.OBJECT,
            properties: {
                experience: { type: Type.INTEGER, description: "The amount of experience points awarded." },
                gold: { type: Type.INTEGER, description: "The amount of gold/currency awarded." },
                items: {
                    type: Type.ARRAY,
                    description: "A list of item names awarded as part of the reward.",
                    items: { type: Type.STRING },
                },
            },
            required: ['experience', 'gold', 'items'],
        },
        failureConditions: {
            type: Type.ARRAY,
            description: "A list of conditions under which the quest would fail (e.g., 'The quest giver is killed', 'The artifact is destroyed').",
            items: { type: Type.STRING },
        },
    },
    required: ['title', 'type', 'logEntry', 'questGiver', 'steps', 'rewards', 'failureConditions'],
};

export const generateQuest = async (details: {questType: string, setting: string, difficulty: string}): Promise<Quest> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${QUEST_PROMPT}\n\nGenerate a quest based on these details:\n${JSON.stringify(details, null, 2)}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: questSchema,
            },
        });
        
        const jsonString = response.text.trim();
        const data = JSON.parse(jsonString);

        if (!data.title || !data.questGiver || !Array.isArray(data.steps)) {
             throw new Error("Invalid data structure received from API for quest.");
        }

        return data;
    } catch (error) {
        console.error("Error generating quest:", error);
        throw new Error("Failed to generate a quest. The API might have returned an unexpected format.");
    }
};

const QUESTBERT_CHAT_SYSTEM_INSTRUCTION = `
You are QuestBERT, an expert AI Dungeon Master. You are creative, knowledgeable about storytelling, and full of ideas. You are helping a game designer refine the quest you just generated.

Directives:
- Your knowledge is focused on the provided quest outline.
- Help the user brainstorm dialogue for the quest giver, add more steps, create interesting twists, or suggest alternative rewards.
- Be enthusiastic and collaborative. Use phrases like "What if..." or "An interesting idea! We could also...".
- If asked for something outside of game design (e.g., programming help), politely steer the conversation back to quest creation.
`;

export const createQuestBertChatSession = (quest: Quest): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        history: [
            {
                role: 'user',
                parts: [{ text: `I'm ready to work on the quest, "${quest.title}".`}]
            },
            {
                role: 'model',
                parts: [{ text: `Excellent! The adventure is laid out before you. How can I, the Dungeon Master, help you refine this tale? We can talk about the quest giver, the steps, the rewards... anything you like.`}]
            }
        ],
        config: {
            systemInstruction: QUESTBERT_CHAT_SYSTEM_INSTRUCTION,
        },
    });
};

// --- DreamBERT Dream Interpreter Service ---

const DREAM_INTERPRETATION_PROMPT = `
You are DreamBERT, an AI assistant specializing in dream interpretation, drawing upon Jungian archetypes, psychoanalytic theory, and common cultural symbols. Your task is to analyze a user's dream description and provide a structured, insightful, and non-prescriptive interpretation.

Generate a JSON object with the specified schema based on the user's dream. Be creative and thoughtful. Avoid making definitive statements; instead, offer possibilities and questions for reflection.
`;

const dreamInterpretationSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A short, evocative title for the dream (e.g., 'The Endless Library', 'Falling Through Clouds')." },
        summary: { type: Type.STRING, description: "A 2-3 sentence summary of the dream's narrative and feeling." },
        symbols: {
            type: Type.ARRAY,
            description: "A list of 3-5 key symbols or elements from the dream and their potential meanings.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The name of the symbol (e.g., 'Water', 'A Key', 'Flying')." },
                    meaning: { type: Type.STRING, description: "A brief interpretation of what this symbol could represent in the context of the dream." },
                },
                required: ['name', 'meaning'],
            },
        },
        emotionalTone: { type: Type.STRING, description: "The predominant emotional feeling or tone of the dream (e.g., 'Anxiety and urgency', 'Peaceful curiosity', 'Joyful liberation')." },
        questionsToConsider: {
            type: Type.ARRAY,
            description: "A list of 2-3 open-ended questions to help the user reflect on the dream's connection to their waking life.",
            items: { type: Type.STRING },
        },
    },
    required: ['title', 'summary', 'symbols', 'emotionalTone', 'questionsToConsider'],
};

export const generateDreamInterpretation = async (dreamDescription: string): Promise<DreamInterpretation> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${DREAM_INTERPRETATION_PROMPT}\n\nInterpret this dream:\n"${dreamDescription}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: dreamInterpretationSchema,
            },
        });
        
        const jsonString = response.text.trim();
        const data = JSON.parse(jsonString);

        if (!data.title || !data.summary || !Array.isArray(data.symbols)) {
             throw new Error("Invalid data structure received from API for dream interpretation.");
        }

        return data;
    } catch (error) {
        console.error("Error generating dream interpretation:", error);
        throw new Error("Failed to generate a dream interpretation. The API might have returned an unexpected format.");
    }
};

const DREAMBERT_CHAT_SYSTEM_INSTRUCTION = `
You are DreamBERT, an AI dream interpreter. You are wise, insightful, and slightly mysterious. You speak in a calm, thoughtful tone. You are helping a user explore the meaning of their dream based on an initial interpretation.

Directives:
- **IMPORTANT**: Your first response must include this disclaimer: "Remember, I am an AI and not a therapist. This is a space for creative exploration, not professional psychological advice."
- Your knowledge is focused on the provided dream interpretation.
- Help the user delve deeper into the symbols and feelings of their dream.
- Ask gentle, probing questions. Never state a definitive meaning; always use phrases like "Perhaps this could represent..." or "How does that feeling connect to...".
- If asked for something outside of dream analysis (e.g., medical advice, lottery numbers), politely decline and guide the conversation back to the dream.
`;

export const createDreamBertChatSession = (interpretation: DreamInterpretation): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: DREAMBERT_CHAT_SYSTEM_INSTRUCTION,
        },
    });
};

// --- ContractBERT Legal Document Analyzer Service ---

const CONTRACT_ANALYSIS_PROMPT = `
You are ContractBERT, an expert AI legal analyst. Your task is to analyze a legal document provided by the user and generate a structured, easy-to-understand summary. You are NOT a lawyer and you must NOT give legal advice.

Analyze the provided legal text and format it into a JSON object using the specified schema. Identify the document type, the parties involved, summarize key clauses, list the obligations of each party, and highlight potential risks or areas that may warrant further attention.
`;

const contractAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        documentType: { type: Type.STRING, description: "The likely type of document (e.g., 'Residential Lease Agreement', 'Service Agreement', 'Non-Disclosure Agreement')." },
        parties: {
            type: Type.ARRAY,
            description: "The parties involved in the contract.",
            items: {
                type: Type.OBJECT,
                properties: {
                    role: { type: Type.STRING, description: "The role of the party (e.g., 'Landlord', 'Tenant', 'Client', 'Service Provider')." },
                    name: { type: Type.STRING, description: "The name of the party, as stated in the document." },
                },
                required: ['role', 'name'],
            },
        },
        keyClauses: {
            type: Type.ARRAY,
            description: "A list and summary of the most important clauses.",
            items: {
                type: Type.OBJECT,
                properties: {
                    clause: { type: Type.STRING, description: "The name or title of the clause (e.g., 'Term and Termination', 'Liability', 'Confidentiality')." },
                    summary: { type: Type.STRING, description: "A brief, plain-language summary of what the clause means." },
                },
                required: ['clause', 'summary'],
            },
        },
        obligations: {
            type: Type.ARRAY,
            description: "A list of key obligations for each party.",
            items: {
                type: Type.OBJECT,
                properties: {
                    party: { type: Type.STRING, description: "The party who has the obligation (identified by role, e.g., 'Tenant')." },
                    obligation: { type: Type.STRING, description: "A description of the specific duty or action required." },
                },
                required: ['party', 'obligation'],
            },
        },
        potentialRisks: {
            type: Type.ARRAY,
            description: "A list of potential risks, ambiguities, or clauses the user might want to review carefully.",
            items: { type: Type.STRING },
        },
    },
    required: ['documentType', 'parties', 'keyClauses', 'obligations', 'potentialRisks'],
};

export const analyzeContract = async (contractText: string): Promise<ContractAnalysis> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${CONTRACT_ANALYSIS_PROMPT}\n\nAnalyze this contract:\n"${contractText}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: contractAnalysisSchema,
            },
        });
        
        const jsonString = response.text.trim();
        const data = JSON.parse(jsonString);

        if (!data.documentType || !Array.isArray(data.parties) || !Array.isArray(data.keyClauses)) {
             throw new Error("Invalid data structure received from API for contract analysis.");
        }

        return data;
    } catch (error) {
        console.error("Error analyzing contract:", error);
        throw new Error("Failed to analyze the contract. The API might have returned an unexpected format.");
    }
};

const CONTRACTBERT_CHAT_SYSTEM_INSTRUCTION = `
You are ContractBERT, an AI legal document assistant. You are NOT a lawyer and CANNOT provide legal advice. Your purpose is to help the user understand the content of the document they provided.

Directives:
- **IMPORTANT**: Your first response in any conversation MUST begin with the disclaimer: "DISCLAIMER: I am an AI assistant, not a lawyer. This is for informational purposes only and does not constitute legal advice. Please consult a qualified legal professional for advice on your situation."
- Your knowledge is strictly limited to the contract text provided by the user.
- Answer questions by quoting or summarizing relevant sections of the contract.
- If asked for an opinion, for advice on what to do, or to predict an outcome, you MUST decline and repeat the disclaimer.
- You can explain what clauses mean IN THE CONTEXT of the document, but not their legal enforceability.
- Maintain a helpful, neutral, and professional tone.
`;

export const createContractBertChatSession = (contractText: string): Chat => {
    const history: Content[] = [
        { 
            role: 'user', 
            parts: [{ text: `Here is the contract I want to discuss:\n\n---\n\n${contractText}` }] 
        },
    ];
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        history,
        config: {
            systemInstruction: CONTRACTBERT_CHAT_SYSTEM_INSTRUCTION,
        },
    });
};

// --- GitBERT GitHub Previewer Service ---

const README_PROMPT = `
You are GitBERT, an AI assistant for developers that specializes in creating high-quality GitHub README.md files. Your task is to take a user's project details and generate a structured, professional README in Markdown format.

Generate a JSON object with the specified schema.
- **Badges**: Generate relevant Markdown badges (e.g., license, build status placeholder, framework version).
- **Installation & Usage**: Provide clear, generic code blocks for installation and usage that a developer can easily edit.
- **License**: Mention a common open-source license like MIT.
`;

const readmeContentSchema = {
    type: Type.OBJECT,
    properties: {
        projectName: { type: Type.STRING, description: "The name of the project." },
        badges: {
            type: Type.ARRAY,
            description: "A list of 3-4 relevant Markdown badges.",
            items: { type: Type.STRING }
        },
        description: { type: Type.STRING, description: "A well-written, 2-3 paragraph description of the project based on the user's input." },
        installation: { type: Type.STRING, description: "A Markdown section with code blocks for installing dependencies." },
        usage: { type: Type.STRING, description: "A Markdown section with code blocks demonstrating how to run or use the project." },
        license: { type: Type.STRING, description: "A brief statement about the project's license (e.g., 'This project is licensed under the MIT License.')." }
    },
    required: ['projectName', 'badges', 'description', 'installation', 'usage', 'license'],
};

export const generateReadmeContent = async (details: { name: string; description: string; tech: string[] }): Promise<ReadmeContent> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${README_PROMPT}\n\nGenerate a README for this project:\n${JSON.stringify(details, null, 2)}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: readmeContentSchema,
            },
        });
        
        const jsonString = response.text.trim();
        const data = JSON.parse(jsonString);

        if (!data.projectName || !Array.isArray(data.badges) || !data.description) {
            throw new Error("Invalid data structure received from API for README content.");
        }

        return data;
    } catch (error) {
        console.error("Error generating README content:", error);
        throw new Error("Failed to generate README content. The API might have returned an unexpected format.");
    }
};

const GITBERT_CHAT_SYSTEM_INSTRUCTION = `
You are GitBERT, an AI developer relations assistant. You are helpful, knowledgeable about software development best practices, and an expert in Markdown. You are helping a user refine a generated README.md file.

Directives:
- Your knowledge is focused on the provided README content.
- Help the user add new sections (e.g., 'Contributing', 'API Reference'), rewrite existing sections for clarity, or add more badges.
- When providing code or Markdown, wrap it in appropriate fences.
- Maintain a helpful, slightly technical, and encouraging tone.
`;

export const createGitBertChatSession = (readme: string): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        history: [
            { role: 'user', parts: [{ text: `Here is the README.md file I'm working on:\n\n---\n\n${readme}` }] },
            { role: 'model', parts: [{ text: "Looks like a great start! I've loaded the README. How can I help you improve it?" }] }
        ],
        config: {
            systemInstruction: GITBERT_CHAT_SYSTEM_INSTRUCTION,
        },
    });
};

// --- LaunchBERT Quick Launcher Service ---

const LAUNCH_ASSETS_PROMPT = `
You are LaunchBERT, an AI marketing and communications expert specializing in product launches. Your task is to take a user's product brief and generate a structured set of launch assets.

Generate a JSON object with the specified schema. The copy should be professional, engaging, and tailored to the target audience.
- **Email**: Write a clear, exciting announcement email.
- **Social Posts**: Create a concise, punchy post for Twitter/X and a slightly more detailed, professional post for LinkedIn.
- **Press Release**: Write a standard short-form press release with a strong headline and a summary paragraph.
`;

const launchAssetsSchema = {
    type: Type.OBJECT,
    properties: {
        productName: { type: Type.STRING },
        emailAnnouncement: {
            type: Type.OBJECT,
            properties: {
                subject: { type: Type.STRING },
                body: { type: Type.STRING, description: "The full body of the email, formatted with newlines." }
            },
            required: ['subject', 'body']
        },
        socialPosts: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    platform: { type: Type.STRING, enum: ['Twitter', 'LinkedIn'] },
                    content: { type: Type.STRING }
                },
                required: ['platform', 'content']
            }
        },
        pressRelease: {
            type: Type.OBJECT,
            properties: {
                headline: { type: Type.STRING },
                body: { type: Type.STRING, description: "The body of the press release, typically 2-3 paragraphs." }
            },
            required: ['headline', 'body']
        }
    },
    required: ['productName', 'emailAnnouncement', 'socialPosts', 'pressRelease'],
};

export const generateLaunchAssets = async (details: { name: string; pitch: string; audience: string }): Promise<LaunchAssets> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${LAUNCH_ASSETS_PROMPT}\n\nGenerate launch assets for this product:\n${JSON.stringify(details, null, 2)}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: launchAssetsSchema,
            },
        });
        
        const jsonString = response.text.trim();
        const data = JSON.parse(jsonString);

        if (!data.productName || !data.emailAnnouncement || !Array.isArray(data.socialPosts)) {
            throw new Error("Invalid data structure received from API for launch assets.");
        }

        return data;
    } catch (error) {
        console.error("Error generating launch assets:", error);
        throw new Error("Failed to generate launch assets. The API might have returned an unexpected format.");
    }
};

const LAUNCHBERT_CHAT_SYSTEM_INSTRUCTION = `
You are LaunchBERT, an AI marketing expert. You are energetic, creative, and strategic. You are helping a user refine the launch assets you just generated.

Directives:
- Your knowledge is focused on the provided launch assets (email, social posts, press release).
- Help the user change the tone (e.g., 'make it more formal', 'add some humor'), generate alternative headlines or social media posts, or expand on certain points.
- Be supportive and full of ideas to help make their launch a success.
`;

export const createLaunchBertChatSession = (assets: LaunchAssets): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        history: [
            { role: 'user', parts: [{ text: `I'm reviewing the launch kit for ${assets.productName}.` }] },
            { role: 'model', parts: [{ text: "Fantastic! I'm excited to help you get the word out. I have all the assets right here. What's on your mind?" }] }
        ],
        config: {
            systemInstruction: LAUNCHBERT_CHAT_SYSTEM_INSTRUCTION,
        },
    });
};

// --- ArtisanBERT Art Generator Service ---

const ART_CONCEPT_PROMPT = `
You are an AI art director named "MuseBERT". Your task is to take a user's simple idea and expand it into a rich, structured artistic concept. This concept will then be used to generate an image.

Flesh out the provided idea into a JSON object with the specified schema. Be creative and descriptive. The 'imagePrompt' should be a detailed, single-paragraph prompt suitable for a powerful text-to-image model, incorporating the style, medium, and description.
`;

const artConceptSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A creative, evocative title for the artwork." },
        medium: { type: Type.STRING, description: "The artistic medium (e.g., 'Oil on canvas', 'Digital painting', 'Charcoal sketch', '3D render')." },
        style: { type: Type.STRING, description: "The artistic style (e.g., 'Impressionism', 'Cyberpunk', 'Art Nouveau', 'Photorealistic')." },
        description: { type: Type.STRING, description: "A 1-2 sentence description of the artwork's subject and mood." },
        imagePrompt: { type: Type.STRING, description: "A detailed, single-paragraph prompt for an image generation model." },
    },
    required: ['title', 'medium', 'style', 'description', 'imagePrompt'],
};

export const generateArtConcept = async (idea: string): Promise<ArtConcept> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${ART_CONCEPT_PROMPT}\n\nFlesh out this idea:\n"${idea}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: artConceptSchema,
            },
        });
        
        const jsonString = response.text.trim();
        const data = JSON.parse(jsonString);
        if (!data.title || !data.imagePrompt) {
             throw new Error("Invalid data structure received from API for art concept.");
        }
        return data;
    } catch (error) {
        console.error("Error generating art concept:", error);
        throw new Error("Failed to generate an art concept. The API might have returned an unexpected format.");
    }
};

export const generateArtImage = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '1:1',
            },
        });
        
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return base64ImageBytes;
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate image. Please try again later.");
    }
};

// --- NewsBERT Analyzer Service ---

export const getNewsSummaryWithGrounding = async (query: string): Promise<NewsSummaryResult> => {
    if (!query.trim()) {
        throw new Error("Query cannot be empty.");
    }
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: query,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const summary = response.text;
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];

        return { summary, sources };

    } catch (error) {
        console.error("Error fetching news summary with grounding:", error);
        throw new Error("Failed to fetch up-to-date information. Please try again later.");
    }
};