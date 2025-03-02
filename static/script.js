// API endpoints - update base URL if your backend is on a different domain
const API_BASE_URL = '';  // e.g. 'http://localhost:5000' if different from frontend
const API_START = `/api/start_diagnosis`;
const API_CONTINUE = `/api/continue_diagnosis`;
const API_RESET = `/api/reset_session`;

let session_id = null;

/**
 * Start a new diagnosis session with initial symptoms
 * @param {Array} symptoms - Array of HPO IDs for initial symptoms
 * @param {Number} maxIterations - Maximum number of question iterations
 * @param {Number} symptomsPerIteration - Number of symptoms to ask about each time
 * @returns {Promise} - Promise resolving to the API response data
 */
async function startDiagnosis(symptoms, maxIterations = 4, symptomsPerIteration = 5) {
  
  fetch(`http://127.0.0.1:5000${API_START}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        symptoms: symptoms,
        max_iterations: maxIterations,
        symptoms_per_iteration: symptomsPerIteration
      })
    }).then(response => {
      return response.json().next_symptoms;
    })
}

/**
 * Continue an existing diagnosis session with symptom responses
 * @param {String} sessionId - Session ID from previous API response
 * @param {Object} responses - Object mapping symptom IDs to boolean values
 * @returns {Promise} - Promise resolving to the API response data
 */
async function continueDiagnosis(sessionId, responses) {
  try {
    const response = await fetch(`http://127.0.0.1:5000${API_CONTINUE}`, {
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

// Get the modal
var modal = document.getElementById("diagnosisModal");

// Get the buttons that open the modal
var btn = document.getElementById("openModal");
var heroBtn = document.getElementById("heroStartDiagnosis");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the buttons, open the modal 
btn.onclick = function() {
  modal.style.display = "block";
}

heroBtn.onclick = function() {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

function addBotMessage(message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'bot-message';
  messageDiv.innerHTML = `<p>${message}</p>`;
  chatMessages.appendChild(messageDiv);
  
  // Scroll to the bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Auto-scroll partners
const partnersScroll = document.querySelector('.partners-scroll');
let scrollPosition = 0;
const scrollSpeed = 1;
const scrollStep = 1;
const scrollInterval = 30;
const partnerItems = document.querySelectorAll('.partner');
const partnerWidth = 230; // Approx width of partner + gap

function autoScroll() {
  scrollPosition += scrollStep;
  
  if (scrollPosition >= partnerWidth * (partnerItems.length / 2)) {
    scrollPosition = 0;
  }
  
  partnersScroll.style.transform = `translateX(-${scrollPosition}px)`;
  setTimeout(autoScroll, scrollInterval);
}

// Start the auto-scroll after a delay
//setTimeout(autoScroll, 2000);

// FAQ functionality
const faqQuestions = document.querySelectorAll('.faq-question');

faqQuestions.forEach(question => {
  question.addEventListener('click', () => {
    // Toggle active class on the question
    question.classList.toggle('active');
    
    // Toggle show class on the answer
    const answer = question.nextElementSibling;
    if (question.classList.contains('active')) {
      answer.classList.add('show');
    } else {
      answer.classList.remove('show');
    }
  });
});

// Chatbot functionality
document.getElementById('submitSymptoms').addEventListener('click', async function() {
  symptoms = document.getElementById("inputSymptoms").value.split(",");

  phenotype = [...symptoms]

  const response = await fetch(`http://127.0.0.1:5000${API_START}`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                              symptoms: symptoms,
                              max_iterations: 4,
                              symptoms_per_iteration: 5
                            })});

  const responseData = await response.json();
  const nextSymptoms = responseData.next_symptoms || [];
  
  // console.log(nextSymptoms.join(','));

  // HP:0002167,HP:0002169,HP:0002353

  collectedSymptoms = nextSymptoms;
  session_id = responseData.session_id;
  // console.log(responseData);
  
  console.log(collectedSymptoms);
  initiateChatbot("Enter a comma-separated list, with no spaces, corresponding to whether or not you have each symptom displayed, in the order they appear in a lowercase y corresponds to a yes, and a lowercase y corresponds to a no. \n" + collectedSymptoms.join(', '));
});

// Head-to-toe assessment chatbot
function initiateChatbot(message) {
  // Clear the modal content and prepare for chatbot
  const modalContent = document.querySelector('.modal-content');
  //<p>Welcome to the Symptom SAVVY chatbot. I'll guide you through a head-to-toe assessment to help identify potential rare conditions. Please answer each question with as much detail as possible.</p>
  modalContent.innerHTML = `
    <span class="close">&times;</span>
    <h3>Symptom Assessment</h3>
    <div class="chatbot-container">
      <div class="chat-messages" id="chatMessages">
        <div class="bot-message">
          <p>${message}</p>
        </div>
      </div>
      <div class="chat-input">
        <input type="text" id="userInput" placeholder="Type your response here...">
        <button id="sendResponse">Send</button>
      </div>
    </div>
  `;

  // Reinitialize close button functionality
  const span = document.getElementsByClassName("close")[0];
  span.onclick = function() {
    modal.style.display = "none";
  }

  // Initialize chatbot
  const chatMessages = document.getElementById('chatMessages');
  const userInput = document.getElementById('userInput');
  const sendButton = document.getElementById('sendResponse');
  
  // Assessment questions in order from head to toe
  const assessmentQuestions = [
    { 
      area: "Head", 
      question: "Do you experience any headaches, migraines, or head pain?",
      followUp: "Please describe the location, frequency, severity, and any triggers or associated symptoms of your headaches."
    },
    { 
      area: "Eyes", 
      question: "Have you noticed any changes in your vision, like blurring, double vision, or vision loss?",
      followUp: "Can you describe when these vision changes occur and if they're accompanied by other symptoms like pain or sensitivity to light?"
    },
    { 
      area: "Ears", 
      question: "Do you have any hearing difficulties, ringing in the ears, or ear pain?",
      followUp: "When did these symptoms start, and does anything seem to make them better or worse?"
    },
    { 
      area: "Nose & Sinuses", 
      question: "Do you experience frequent congestion, sinus pressure, or changes in your sense of smell?",
      followUp: "How long have you had these symptoms, and have you noticed any pattern to when they occur?"
    },
    { 
      area: "Mouth & Throat", 
      question: "Do you have any persistent sore throat, difficulty swallowing, or oral lesions?",
      followUp: "Please describe the symptoms in detail, including when they started and any changes over time."
    },
    { 
      area: "Neck", 
      question: "Do you have neck pain, stiffness, or swelling?",
      followUp: "Does the pain radiate to other areas? What makes it better or worse?"
    },
    { 
      area: "Chest", 
      question: "Do you experience chest pain, pressure, or discomfort?",
      followUp: "Can you describe the sensation, location, and any factors that trigger or relieve it?"
    },
    { 
      area: "Respiratory", 
      question: "Do you have shortness of breath, wheezing, or persistent cough?",
      followUp: "When do these symptoms occur? Are they related to activity or certain environments?"
    },
    { 
      area: "Heart", 
      question: "Have you noticed palpitations, irregular heartbeat, or rapid heart rate?",
      followUp: "How often do these occur, and what seems to trigger them?"
    },
    { 
      area: "Abdomen", 
      question: "Do you have any abdominal pain, bloating, or digestive issues?",
      followUp: "Which part of your abdomen is affected? Is it related to eating or particular foods?"
    },
    { 
      area: "Urinary", 
      question: "Do you have any changes in urination frequency, pain, or color?",
      followUp: "When did you first notice these changes, and have they been persistent or intermittent?"
    },
    { 
      area: "Musculoskeletal", 
      question: "Do you experience joint pain, muscle weakness, or limited mobility?",
      followUp: "Which joints or muscles are affected? Is there any swelling, redness, or warmth in the affected areas?"
    },
    { 
      area: "Skin", 
      question: "Have you noticed any rashes, unusual marks, or changes in your skin?",
      followUp: "Where on your body are these changes? How would you describe the appearance, and have they changed over time?"
    },
    { 
      area: "Neurological", 
      question: "Do you experience dizziness, balance problems, tremors, or numbness/tingling?",
      followUp: "Which parts of your body are affected, and under what circumstances do these symptoms occur?"
    },
    { 
      area: "Sleep", 
      question: "Do you have trouble falling asleep, staying asleep, or experience excessive daytime sleepiness?",
      followUp: "How long have you had these sleep issues, and how are they affecting your daily life?"
    },
    { 
      area: "Energy", 
      question: "Do you experience unusual fatigue or low energy levels?",
      followUp: "When did this start, and how does it impact your ability to perform daily activities?"
    },
    { 
      area: "Final", 
      question: "Are there any other symptoms or health concerns you'd like to mention that we haven't covered?",
      followUp: "Please share any additional details you think might be relevant to your health assessment."
    }
  ];
  
  let currentQuestionIndex = 0;
  
  // Handle user input
  sendButton.addEventListener('click', processUserResponse);
  userInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      processUserResponse();
    }
  });

  function suggest(data) {
    fetch(`http://127.0.0.1:5000/suggest?query=${data}`)
      .then(response => response.json())
      .then(data => {
        // Access the suggestions array
        const suggestions = data.suggestions;
        
        // console.log(suggestions);
        return suggestions;
      });
  }
  
  async function processUserResponse() {
    const userResponse = userInput.value.trim();

    if (userResponse === '') return;
    
    // Add user's message to chat
    addUserMessage(userResponse);
    
    // Process response
    // const currentQuestion = assessmentQuestions[currentQuestionIndex];
    
    // If user responded with yes/positive, ask follow-up
    new_phenotype = {}

    userResponses = userResponse.split(',');
    // console.log(collectedSymptoms);
    // console.log(userResponses);

    for (let i = 0; i < collectedSymptoms.length; i++) {
      // console.log(i);
      if (userResponses[i] == 'y') {
        // console.log("Success");
        new_phenotype[collectedSymptoms[i]] = true;
      }
      else {
        new_phenotype[collectedSymptoms[i]] = false;
      }
    }

    // console.log(new_phenotype);

    const response = await fetch(`http://127.0.0.1:5000${API_CONTINUE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        responses: new_phenotype,
        session_id: session_id
    })});

    //HP:0002205,HP:0002240,HP:0002360

    const responseData = await response.json();

    collectedSymptoms = responseData.next_symptoms;
    session_id = responseData.session_id;
    
    // Scroll to the bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    userInput.value = '';

    // console.log(responseData.possible_diseases);
    // console.log(responseData.done)

    if (responseData.done) {
      addBotMessage("Here are possible diseases: " + responseData.possible_diseases.join(", "));
    }
    else {
      addBotMessage(collectedSymptoms.join(', '));
    }
    
    // Wait for details before moving to next question
    sendButton.removeEventListener('click', processUserResponse);
    userInput.removeEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        processUserResponse();
      }
    });
      
    // Set up new listeners for detail response
    const detailsHandler = async function() {
      const userResponse = userInput.value.trim();

      if (userResponse === '') return;
      
      // Add user's message to chat
      addUserMessage(userResponse);
      
      // Process response
      // const currentQuestion = assessmentQuestions[currentQuestionIndex];
      
      // If user responded with yes/positive, ask follow-up
      new_phenotype = {}

      userResponses = userResponse.split(',');
      // console.log(userResponses);
      // console.log(collectedSymptoms);

      for (let i = 0; i < collectedSymptoms.length; i++) {
        if (userResponses[i] == 'y') {
          //console.log(i)
          new_phenotype[collectedSymptoms[i]] = true;
        }
        else {
          new_phenotype[collectedSymptoms[i]] = false;
        }
      }

      userInput.value = '';

      //console.log(new_phenotype);

      const response = await fetch(`http://127.0.0.1:5000${API_CONTINUE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          responses: new_phenotype,
          session_id: session_id
      })});
  
      const responseData = await response.json();
      collectedSymptoms = responseData.next_symptoms;
      session_id = responseData.session_id;

      //console.log(collectedSymptoms);
  
      //console.log(responseData.possible_diseases);
      //console.log(responseData.done)

      if (responseData.done) {
        addBotMessage("Here are possible diseases: " + responseData.possible_diseases.join(", "));
      }
      else {
        addBotMessage(collectedSymptoms.join(', '));
      }

      // Ask for more details
      // addBotMessage(currentQuestion.followUp);
      
      // Wait for details before moving to next question
      sendButton.removeEventListener('click', processUserResponse);
      userInput.removeEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          processUserResponse();
        }
      });
    };
      
      const detailsKeyHandler = function(e) {
        if (e.key === 'Enter') {
          detailsHandler();
        }
      };
      
      sendButton.addEventListener('click', detailsHandler);
      userInput.addEventListener('keypress', detailsKeyHandler);
    // } else {
    //   // No symptoms in this area
    //   collectedSymptoms.push({
    //     area: currentQuestion.area,
    //     reported: false,
    //     details: 'None reported'
    //   });
      
    //   // Move to next question without follow-up
    //   moveToNextQuestion();
    // }
  }
  
  function moveToNextQuestion() {
    currentQuestionIndex++;
    
    // Check if we've reached the end
    if (currentQuestionIndex >= assessmentQuestions.length) {
      finishAssessment();
      return;
    }
    
    // Add next question
    const nextQuestion = assessmentQuestions[currentQuestionIndex];
    addBotMessage(nextQuestion.area + ": " + nextQuestion.question);
  }
  
  function finishAssessment() {
    // Display completion message
    addBotMessage("Thank you for completing the symptom assessment. Based on your responses, we've identified the following potential areas of concern:");
    
    // Filter to only show areas with reported symptoms
    const reportedSymptoms = collectedSymptoms.filter(symptom => symptom.reported);
    
    if (reportedSymptoms.length === 0) {
      addBotMessage("You didn't report any specific symptoms. This could be good news, but sometimes rare conditions have subtle signs. We recommend discussing with a healthcare provider if you have ongoing health concerns.");
    } else {
      // Create a summary of reported symptoms
      let summaryHTML = '<div class="symptom-summary">';
      reportedSymptoms.forEach(symptom => {
        summaryHTML += `<div class="symptom-item">
          <strong>${symptom.area}</strong>: ${symptom.details}
        </div>`;
      });
      summaryHTML += '</div>';
      
      addBotMessage(summaryHTML);
      addBotMessage("Our AI is analyzing your symptom pattern to identify potential rare conditions. A detailed report will be sent to you shortly. Would you like to connect with specialists experienced in these symptom patterns?");
      
      // Add final buttons
      const finalButtons = document.createElement('div');
      finalButtons.className = 'action-buttons';
      finalButtons.innerHTML = `
        <button class="action-btn primary-btn">Connect with Specialists</button>
        <button class="action-btn secondary-btn">Download Report</button>
      `;
      chatMessages.appendChild(finalButtons);
      
      // Scroll to the bottom
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
      // Add click handlers for the final buttons
      document.querySelector('.primary-btn').addEventListener('click', function() {
        addBotMessage("Great! We're identifying specialists in your area who have experience with your symptom pattern. We'll be in touch within 24-48 hours to coordinate.");
      });
      
      document.querySelector('.secondary-btn').addEventListener('click', function() {
        addBotMessage("Your preliminary symptom report is being generated. You'll receive an email with the full analysis shortly.");
      });
    }
  }
  
  function addUserMessage(message) {
    //console.log("Adding user message:", message, typeof message);

    const messageDiv = document.createElement('div');
    messageDiv.className = 'user-message';
    messageDiv.innerHTML = `<p>${message}</p>`;
    chatMessages.appendChild(messageDiv);
    
    // Scroll to the bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  function isPositiveResponse(response) {
    const positivePatterns = [
      /\by\b/i,
      /\byes\b/i, 
      /\byeah\b/i, 
      /\byep\b/i, 
      /\bsure\b/i, 
      /\bdefinitely\b/i, 
      /\bsometimes\b/i, 
      /\boccasionally\b/i, 
      /\boften\b/i,
      /\bfrequently\b/i,
      /\bperiodically\b/i,
      /\bi do\b/i,
      /\bi have\b/i,
      /\buh-huh\b/i,
      /\bagree\b/i,
      /\bcorrect\b/i,
      /\baffirmative\b/i
    ];
    
    return positivePatterns.some(pattern => pattern.test(response));
  }
}

// Enhanced UI animations
document.addEventListener('DOMContentLoaded', function() {
  // Add scroll reveal effect for sections
  const sections = document.querySelectorAll('section');
  
  function revealSection() {
    sections.forEach(section => {
      const sectionTop = section.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      
      if (sectionTop < windowHeight * 0.85) {
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
      }
    });
  }
  
  // Apply initial styles for animation
  sections.forEach(section => {
    if (!section.classList.contains('hero')) {
      section.style.opacity = '0';
      section.style.transform = 'translateY(20px)';
      section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    }
  });
  
  // Check on load and scroll
  revealSection();
  window.addEventListener('scroll', revealSection);
});


let map;

function initializeMap() {
  map = new google.maps.Map(document.getElementById("map"), {
      zoom: 9,
      center: { lat: 42.3555, lng: -71.0565 }, // Default to Boston
      zoomControl: true, // Enables the default zoom buttons
      mapTypeControl: true, // Enables map type switching
      streetViewControl: true, // Enables Street View
      fullscreenControl: true // Enables fullscreen mode
  });
}

document.addEventListener("DOMContentLoaded", initializeMap);


document.getElementById("findDoctorsButton").addEventListener("click", function () {
  const disease = document.getElementById("diseaseInput").value;
  const location = document.getElementById("locationInput").value;

  if (!disease || !location) {
      alert("❌ Please enter both a disease and a location.");
      return;
  }

  fetch("/get_doctors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disease: disease, location: location })
  })
  .then(response => {
      //("Server response status:", response.status);
      return response.text();  // Read raw response
  })
  .then(text => {
      try {
          const jsonData = JSON.parse(text);
          console.log("Parsed JSON response:", jsonData);
          updateMap(jsonData);
      } catch (error) {
          console.error("❌ JSON Parsing Error:", text);
          alert("Invalid server response. Check API logs.");
      }
  })
  .catch(error => {
      console.error("❌ Error fetching doctors:", error);
      alert("Failed to retrieve doctor information. Check console for details.");
  });
});


function updateMap(doctors) {
    if (!doctors || doctors.length === 0) {
        alert("No specialists found for the given disease.");
        return;
    }

    // Clear existing markers
    const bounds = new google.maps.LatLngBounds();

    doctors.forEach(doctor => {
        const position = { lat: doctor.lat, lng: doctor.lng };
        const marker = new google.maps.Marker({
            map,
            position,
            title: doctor.name
        });

        const infoWindow = new google.maps.InfoWindow({
            content: `<strong>${doctor.name}</strong><br>${doctor.address}<br>Rating: ${doctor.rating}<br>
                      <a href="${doctor.link}" target="_blank">View on Google Maps</a>`
        });

        marker.addListener("click", () => {
            infoWindow.open(map, marker);
        });

        bounds.extend(position);
    });

    map.fitBounds(bounds);
}

window.onload = initializeMap;


document.getElementById("searchScholarButton").addEventListener("click", function () {
  const diseaseName = document.getElementById("diseaseSearchInput").value.trim();

  if (!diseaseName) {
      alert("❌ Please enter a disease name.");
      return;
  }

  // Encode the disease name to be URL-safe
  const searchQuery = encodeURIComponent(diseaseName);
  const scholarURL = `https://scholar.google.com/scholar?q=${searchQuery}`;

  // Redirect user to Google Scholar search results
  window.open(scholarURL, "_blank"); // Opens in a new tab
});
