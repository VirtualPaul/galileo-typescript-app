import fetch from 'node-fetch';

const ROOT_URL = "https://api.demo.rungalileo.io";
// const GALILEO_API_KEY = "AWlPDvYX5f0gmujB1kGaeUE0zHBXhsI1IYOSsoYKcQA";
const GALILEO_API_KEY = "HbbvRELCmbzRfRYuLMrwoDEvCrE0QKOuum-ECD6McEs"

async function login(): Promise<any> {
    const loginURL = `${ROOT_URL}/login/api_key`;

    const response = await fetch(loginURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ api_key: GALILEO_API_KEY }),
    });

    if (response.ok) {
        const loginResponse = await response.json();
        console.log('Login Response:', loginResponse);
        return loginResponse;
    } else {
        console.error('POST request failed. Response Code:', response.status);
        const errorResponse = await response.text();
        console.error('Error Response:', errorResponse);
        return null;
    }
}

async function createProject(): Promise<any> {
    const projectsURL = `${ROOT_URL}/projects`;
    const response = await fetch(projectsURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Galileo-Api-Key': GALILEO_API_KEY,
        },
        body: JSON.stringify({
            name: `project__${generateUUID()}`,
            is_private: false,
            type: 'prompt_evaluation',
        }),
    });

    if (response.ok) {
        const createProjectResponse = await response.json();
        console.log('Project Created:', createProjectResponse);
        return createProjectResponse;
    } else {
        console.error('POST request failed. Response Code:', response.status);
        const errorResponse = await response.text();
        console.error('Error Response:', errorResponse);
        return null;
    }
}

async function createRun(projectId: string, runName: string): Promise<any> {
    const createRunURL = `${ROOT_URL}/projects/${projectId}/runs`;

    const response = await fetch(createRunURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Galileo-Api-Key': GALILEO_API_KEY,
        },
        body: JSON.stringify({
            name: runName,
            task_type: 'prompt_chain',
        }),
    });

    if (response.ok) {
        const createRunResponse = await response.json();
        console.log('Run Created:', createRunResponse);
        return createRunResponse;
    } else {
        console.error('POST request failed. Response Code:', response.status);
        const errorResponse = await response.text();
        console.error('Error Response:', errorResponse);
        return null;
    }
}

function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

interface Node {
  node_id: string;
  node_type: string;
  node_name: string;
  node_input: string;
  node_output: string;
  chain_root_id: string;
  step: number;
  has_children: boolean;
  creation_timestamp: number;
  latency: number;
  query_input_tokens: number;
  query_output_tokens: number;
  query_total_tokens: number;
}

interface PromptScorersConfiguration {
  latency: boolean;
  cost: boolean;
  pii: boolean;
  input_pii: boolean;
  bleu: boolean;
  rouge: boolean;
  protect_status: boolean;
  context_relevance: boolean;
  toxicity: boolean;
  input_toxicity: boolean;
  tone: boolean;
  input_tone: boolean;
  sexist: boolean;
  input_sexist: boolean;
  prompt_injection: boolean;
  adherence_nli: boolean;
  chunk_attribution_utilization_nli: boolean;
  completeness_nli: boolean;
  uncertainty: boolean;
  factuality: boolean;
  groundedness: boolean;
  prompt_perplexity: boolean;
  chunk_attribution_utilization_gpt: boolean;
  completeness_gpt: boolean;
}

interface CustomLogRequest {
  rows: Node[];
  prompt_scorers_configuration: PromptScorersConfiguration;
}

async function customLog(projectId: string, runId: string): Promise<void> {
  const customLogURL = `${ROOT_URL}/projects/${projectId}/runs/${runId}/chains/ingest`;

  const node: Node = {
    node_id: "6c735b85-62be-4d63-928c-c5ea45690a25",
    node_type: "llm",
    node_name: "LLM",
    node_input: "Tell me a joke about bears!",
    node_output: "Here is one: Why did the bear go to the doctor? Because it had a grizzly cough!",
    chain_root_id: "6c735b85-62be-4d63-928c-c5ea45690a25",
    step: 0,
    has_children: false,
    creation_timestamp: 0,
    latency: 0,
    query_input_tokens: 0,
    query_output_tokens: 0,
    query_total_tokens: 0
  };

  const promptScorersConfiguration: PromptScorersConfiguration = {
    latency: false,
    cost: false,
    pii: false,
    input_pii: false,
    bleu: false,
    rouge: false,
    protect_status: false,
    context_relevance: false,
    toxicity: false,
    input_toxicity: false,
    tone: false,
    input_tone: false,
    sexist: false,
    input_sexist: false,
    prompt_injection: false,
    adherence_nli: false,
    chunk_attribution_utilization_nli: false,
    completeness_nli: false,
    uncertainty: false,
    factuality: true,
    groundedness: true,
    prompt_perplexity: false,
    chunk_attribution_utilization_gpt: false,
    completeness_gpt: false
  };

  const requestBody: CustomLogRequest = {
    rows: [node],
    prompt_scorers_configuration: promptScorersConfiguration
  };

  try {
    const response = await fetch(customLogURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Galileo-Api-Key': GALILEO_API_KEY
      },
      body: JSON.stringify(requestBody)
    });

    if (response.ok) {
      console.log('Custom log request was successful');
      console.log(response)
    } else {
      console.error(`POST request failed. Response Code: ${response.status}`);
      const errorResponse = await response.text();
      console.error('Error Response:', errorResponse);
    }
  } catch (error) {
    console.error('Error occurred during the custom log request:', error);
  }
}

async function main() {
    console.log('Creating Project');
    const createProjectResponse = await createProject();
    if (createProjectResponse) {
        console.log('Project Created:', createProjectResponse.name);

        const runName = generateUUID(); // Replace with your random name generator
        console.log('Creating Run');
        const runResponse = await createRun(createProjectResponse.id, runName);

        if (runResponse) {
            console.log('Run Created:', runResponse.name);
            console.log('Logging data to Galileo');
            customLog(createProjectResponse.id, runResponse.id).catch(console.error);
        }
    }
}

main().catch(console.error);
