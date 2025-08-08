

import { ToolCosts } from './types';

export const INITIAL_CREDITS = 20;

export const TOOL_COSTS: ToolCosts = {
  'DARKBERT': 10,
  'ARTIST': 2,
  'STORYBERT': 5,
  'CARBERT': 3,
  'ANNIBERT': 3,
  'BARTHOLOMEW': 4,
  'LABERT': 8,
  'LIVEBERT': 5,
  'ROBERTA': 5,
  'ROBERTO': 2,
  'FITBERT': 4,
  'DOCUBERT': 2,
  'TRAVELBERT': 6,
  'FINANCEBERT': 15,
  'QUESTBERT': 4,
  'DREAMBERT': 3,
  'CONTRACTBERT': 10,
  'GITBERT': 5,
  'LAUNCHBERT': 7,
  'ARTISANBERT': 4,
  'NEWSBERT': 6,
};


export const FINE_TUNING_STEPS = [
  { progress: 0, message: "Ready to begin." },
  { progress: 10, message: "Initializing fine-tuning environment..." },
  { progress: 25, message: "Uploading and validating dataset..." },
  { progress: 40, message: "Starting training job (Job ID: dk-bt-4x8k)..." },
  { progress: 60, message: "Epoch 1/3 complete. Loss: 0.87" },
  { progress: 80, message: "Epoch 2/3 complete. Loss: 0.62" },
  { progress: 95, message: "Epoch 3/3 complete. Loss: 0.45" },
  { progress: 100, message: "Fine-tuning successful! Model 'darkbert-v1-finetuned' is ready." },
];

export const STYLE_TUNING_STEPS = [
  { progress: 0, message: "Ready to write." },
  { progress: 10, message: "Brewing coffee and sharpening pencils..." },
  { progress: 25, message: "Analyzing literary tropes..." },
  { progress: 40, message: "Calibrating authorial voice (Voice ID: sb-cr-8y2c)..." },
  { progress: 60, message: "Considering plot twists..." },
  { progress: 80, message: "Outlining character arcs..." },
  { progress: 95, message: "Structuring narrative flow..." },
  { progress: 100, message: "Calibration complete! The muse is ready to collaborate." },
];

export const ENGINE_CALIBRATION_STEPS = [
  { progress: 0, message: "Ready to tune." },
  { progress: 10, message: "Connecting OBD-II diagnostics..." },
  { progress: 25, message: "Analyzing engine parameters..." },
  { progress: 40, message: "Adjusting fuel-to-air ratio..." },
  { progress: 60, message: "Optimizing ignition timing..." },
  { progress: 80, message: "Recalibrating ECU... (Map: Street/Performance)" },
  { progress: 95, message: "Running final system check..." },
  { progress: 100, message: "Calibration complete! Engine is purring." },
];

export const PLAN_REFINING_STEPS = [
  { progress: 0, message: "Ready to plan." },
  { progress: 10, message: "Reviewing event details..." },
  { progress: 25, message: "Brainstorming creative ideas..." },
  { progress: 40, message: "Scouting suitable gifts and activities..." },
  { progress: 60, message: "Considering personal touches..." },
  { progress: 80, message: "Drafting heartfelt messages..." },
  { progress: 95, message: "Organizing the final plan..." },
  { progress: 100, message: "Refinement complete! The perfect plan is ready." },
];

export const ARCHIVE_INDEXING_STEPS = [
  { progress: 0, message: "Ready for research." },
  { progress: 10, message: "Accessing historical archives..." },
  { progress: 25, message: "Cross-referencing primary sources..." },
  { progress: 40, message: "Analyzing academic journals (JSTOR, et al.)..." },
  { progress: 60, message: "Compiling biographical data..." },
  { progress: 80, message: "Verifying timeline accuracy..." },
  { progress: 95, message: "Synthesizing research notes..." },
  { progress: 100, message: "Indexing complete! The library is open for inquiry." },
];

export const LEGAL_RESEARCH_STEPS = [
  { progress: 0, message: "Ready to analyze." },
  { progress: 10, message: "Accessing legal databases (Westlaw, LexisNexis)..." },
  { progress: 25, message: "Reviewing relevant statutes and regulations..." },
  { progress: 40, message: "Analyzing case law and precedents..." },
  { progress: 60, message: "Identifying controlling vs. persuasive authority..." },
  { progress: 80, message: "Cross-referencing legal arguments..." },
  { progress: 95, message: "Synthesizing legal memorandum..." },
  { progress: 100, message: "Research complete. LaBERT is ready for your questions." },
];

export const PRE_PRODUCTION_STEPS = [
  { progress: 0, message: "Ready for pre-production." },
  { progress: 10, message: "Booking crew and vendors..." },
  { progress: 25, message: "Creating stage plot and input list..." },
  { progress: 40, message: "Running power calculations..." },
  { progress: 60, message: "Advancing show with artists/presenters..." },
  { progress: 80, message: "Finalizing run-of-show schedule..." },
  { progress: 95, message: "Double-checking equipment checklist..." },
  { progress: 100, message: "Pre-production complete. Ready for show time." },
];

export const OPTIMIZATION_ANALYSIS_STEPS = [
  { progress: 0, message: "Ready to optimize." },
  { progress: 10, message: "Parsing resume structure..." },
  { progress: 25, message: "Identifying action verbs and key accomplishments..." },
  { progress: 40, message: "Cross-referencing keywords from target industries..." },
  { progress: 60, message: "Analyzing for ATS (Applicant Tracking System) compatibility..." },
  { progress: 80, message: "Checking for clarity and conciseness..." },
  { progress: 95, message: "Formatting suggestions for readability..." },
  { progress: 100, message: "Optimization analysis complete. Ready for interview prep." },
];

export const MISE_EN_PLACE_STEPS = [
  { progress: 0, message: "Ready to cook." },
  { progress: 10, message: "Washing hands and putting on apron..." },
  { progress: 25, message: "Reading the recipe..." },
  { progress: 40, message: "Chopping vegetables (mise en place)..." },
  { progress: 60, message: "Measuring spices and dry ingredients..." },
  { progress: 80, message: "Preheating the oven to 375°F..." },
  { progress: 95, message: "Arranging tools and pans..." },
  { progress: 100, message: "Mise en place complete. Let's start cooking!" },
];

export const TRAINING_ADAPTATION_STEPS = [
  { progress: 0, message: "Ready to train." },
  { progress: 10, message: "Analyzing fitness goals..." },
  { progress: 25, message: "Assessing physiological metrics..." },
  { progress: 40, message: "Designing progressive overload plan..." },
  { progress: 60, message: "Optimizing macronutrient recommendations..." },
  { progress: 80, message: "Structuring rest and recovery periods..." },
  { progress: 95, message: "Finalizing workout schedule..." },
  { progress: 100, message: "Training plan adapted! FitBERT is ready to coach." },
];

export const DOCUMENT_INDEXING_STEPS = [
  { progress: 0, message: "Ready to index." },
  { progress: 10, message: "Parsing document structure..." },
  { progress: 25, message: "Identifying key entities and concepts..." },
  { progress: 40, message: "Building semantic index..." },
  { progress: 60, message: "Cross-referencing information..." },
  { progress: 80, message: "Optimizing for fast retrieval..." },
  { progress: 95, message: "Finalizing index..." },
  { progress: 100, message: "Document indexed. Ready for questions." },
];

export const TRIP_BOOKING_STEPS = [
  { progress: 0, message: "Ready to book." },
  { progress: 10, message: "Comparing flight options..." },
  { progress: 25, message: "Searching for best hotel deals..." },
  { progress: 40, message: "Cross-referencing reviews and ratings..." },
  { progress: 60, message: "Reserving recommended activities..." },
  { progress: 80, message: "Confirming bookings with vendors..." },
  { progress: 95, message: "Compiling your final travel documents..." },
  { progress: 100, message: "Booking complete! Your adventure awaits." },
];

export const BACKEND_PROVISIONING_STEPS = [
  { progress: 0, message: "Ready to provision." },
  { progress: 10, message: "Allocating server resources..." },
  { progress: 25, message: "Setting up secure environment variables..." },
  { progress: 40, message: "Generating API keys and secrets..." },
  { progress: 60, message: "Provisioning Node.js backend..." },
  { progress: 80, message: "Generating React frontend components..." },
  { progress: 95, message: "Compiling integration documentation..." },
  { progress: 100, message: "Provisioning complete! Your payment gateway code is ready." },
];

export const WORLD_BUILDING_STEPS = [
  { progress: 0, message: "Ready to build." },
  { progress: 10, message: "Laying down ley lines..." },
  { progress: 25, message: "Fleshing out NPC backstories..." },
  { progress: 40, message: "Placing monster spawns..." },
  { progress: 60, message: "Hiding treasure chests and secrets..." },
  { progress: 80, message: "Writing flavorful item descriptions..." },
  { progress: 95, message: "Drawing the world map..." },
  { progress: 100, message: "World-building complete! The adventure is ready." },
];

export const SUBCONSCIOUS_ANALYSIS_STEPS = [
  { progress: 0, message: "Ready to analyze." },
  { progress: 10, message: "Accessing oneiric archives..." },
  { progress: 25, message: "Decoding symbolic language..." },
  { progress: 40, message: "Mapping emotional undercurrents..." },
  { progress: 60, message: "Cross-referencing archetypal patterns..." },
  { progress: 80, message: "Synthesizing narrative threads..." },
  { progress: 95, message: "Filtering conscious residue..." },
  { progress: 100, message: "Subconscious analysis complete. The interpretation is ready." },
];

export const CONTRACT_ANALYSIS_STEPS = [
  { progress: 0, message: "Ready to analyze." },
  { progress: 10, message: "Parsing document structure..." },
  { progress: 25, message: "Identifying parties and definitions..." },
  { progress: 40, message: "Extracting key clauses (Liability, Termination, etc.)..." },
  { progress: 60, message: "Analyzing party obligations and responsibilities..." },
  { progress: 80, message: "Scanning for potential risks and ambiguities..." },
  { progress: 95, message: "Compiling final analysis report..." },
  { progress: 100, message: "Analysis complete! Ready for your questions." },
];

export const ASSET_GENERATION_STEPS = [
  { progress: 0, message: "Ready to generate." },
  { progress: 10, message: "Analyzing repository details..." },
  { progress: 25, message: "Fetching appropriate badges..." },
  { progress: 40, message: "Structuring README sections..." },
  { progress: 60, message: "Writing installation and usage guides..." },
  { progress: 80, message: "Formatting code blocks..." },
  { progress: 95, message: "Adding license information..." },
  { progress: 100, message: "README generation complete!" },
];

export const MESSAGE_CRAFTING_STEPS = [
  { progress: 0, message: "Ready to launch." },
  { progress: 10, message: "Analyzing product brief..." },
  { progress: 25, message: "Defining key value propositions..." },
  { progress: 40, message: "Drafting email announcement..." },
  { progress: 60, message: "Crafting social media posts..." },
  { progress: 80, message: "Writing press release..." },
  { progress: 95, message: "Final review and polish..." },
  { progress: 100, message: "Launch kit is ready!" },
];

export const ART_GENERATION_STEPS = [
  { progress: 0, message: "Ready to create." },
  { progress: 10, message: "Preparing the digital canvas..." },
  { progress: 25, message: "Mixing the color palette..." },
  { progress: 40, message: "Applying initial brush strokes..." },
  { progress: 60, message: "Rendering textures and lighting..." },
  { progress: 80, message: "Adding fine details..." },
  { progress: 95, message: "Applying finishing touches..." },
  { progress: 100, message: "Masterpiece complete! The artwork is ready." },
];