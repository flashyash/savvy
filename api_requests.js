// API endpoints - update base URL if your backend is on a different domain
const API_BASE_URL = '';  // e.g. 'http://localhost:5000' if different from frontend
const API_START = `/api/start_diagnosis`;
const API_CONTINUE = `/api/continue_diagnosis`;
const API_RESET = `/api/reset_session`;

/**
 * Start a new diagnosis session with initial symptoms
 * @param {Array} symptoms - Array of HPO IDs for initial symptoms
 * @param {Number} maxIterations - Maximum number of question iterations
 * @param {Number} symptomsPerIteration - Number of symptoms to ask about each time
 * @returns {Promise} - Promise resolving to the API response data
 */
async function startDiagnosis(symptoms, maxIterations = 4, symptomsPerIteration = 5) {
  try {
    const response = await fetch(API_START, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        symptoms: symptoms,
        max_iterations: maxIterations,
        symptoms_per_iteration: symptomsPerIteration
      })
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error starting diagnosis:', error);
    throw error;
  }
}

/**
 * Continue an existing diagnosis session with symptom responses
 * @param {String} sessionId - Session ID from previous API response
 * @param {Object} responses - Object mapping symptom IDs to boolean values
 * @returns {Promise} - Promise resolving to the API response data
 */
async function continueDiagnosis(sessionId, responses) {
  try {
    const response = await fetch(API_CONTINUE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        session_id: sessionId,
        responses: responses
      })
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error continuing diagnosis:', error);
    throw error;
  }
}

/**
 * Reset a diagnosis session or create a new one
 * @param {String} sessionId - Optional session ID to reset (or null for new session)
 * @returns {Promise} - Promise resolving to the API response data
 */
async function resetSession(sessionId = null) {
  try {
    const response = await fetch(API_RESET, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        session_id: sessionId
      })
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error resetting session:', error);
    throw error;
  }
}

/**
 * Process API response from either start or continue diagnosis
 * @param {Object} data - Response data from the API
 * @returns {Object} - Processed data with simplified structure
 */
function processApiResponse(data) {
  // Extract key information from the response
  const processedData = {
    sessionId: data.session_id,
    currentSymptoms: data.current_symptoms || [],
    nextSymptoms: data.next_symptoms || [],
    possibleDiseases: data.possible_diseases || [],
    diseaseCount: data.disease_count || 0,
    diseaseScores: data.disease_scores || {},
    isDone: data.done || false
  };
  
  // Add formatted disease list with scores for display
  processedData.formattedDiseases = processedData.possibleDiseases.map(disease => {
    const score = processedData.diseaseScores[disease];
    const scoreFormatted = score ? `${(score * 100).toFixed(1)}%` : 'N/A';
    
    return {
      name: disease,
      score: score || null,
      scoreFormatted: scoreFormatted
    };
  });
  
  return processedData;
}

// Usage examples:

// 1. Starting a new diagnosis
// const initialSymptoms = ['HP:0000256', 'HP:0002007', 'HP:0000235'];
// startDiagnosis(initialSymptoms)
//   .then(data => {
//     const processed = processApiResponse(data);
//     console.log('Session started:', processed.sessionId);
//     console.log('Next questions:', processed.nextSymptoms);
//   })
//   .catch(err => console.error('Failed to start diagnosis:', err));

// 2. Continuing a diagnosis
// const sessionId = 'previously-obtained-session-id';
// const responses = {
//   'HP:0001234': true,   // Yes, symptom is present
//   'HP:0005678': false,  // No, symptom is not present
// };
// continueDiagnosis(sessionId, responses)
//   .then(data => {
//     const processed = processApiResponse(data);
//     if (processed.isDone) {
//       console.log('Diagnosis complete!');
//       console.log('Possible diseases:', processed.formattedDiseases);
//     } else {
//       console.log('More questions needed:', processed.nextSymptoms);
//     }
//   })
//   .catch(err => console.error('Failed to continue diagnosis:', err));