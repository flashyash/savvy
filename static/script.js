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
setTimeout(autoScroll, 2000);

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
document.getElementById('submitSymptoms').addEventListener('click', function() {
  initiateChatbot();
});

// Head-to-toe assessment chatbot
function initiateChatbot() {
  // Clear the modal content and prepare for chatbot
  const modalContent = document.querySelector('.modal-content');
  modalContent.innerHTML = `
    <span class="close">&times;</span>
    <h3>Symptom Assessment</h3>
    <div class="chatbot-container">
      <div class="chat-messages" id="chatMessages">
        <div class="bot-message">
          <p>Welcome to the Symptom SAVVY chatbot. I'll guide you through a head-to-toe assessment to help identify potential rare conditions. Please answer each question with as much detail as possible.</p>
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
  let collectedSymptoms = [];
  
  // Add first question
  addBotMessage(assessmentQuestions[0].area + ": " + assessmentQuestions[0].question);
  
  // Handle user input
  sendButton.addEventListener('click', processUserResponse);
  userInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      processUserResponse();
    }
  });
  
  function processUserResponse() {
    const userResponse = userInput.value.trim();
    if (userResponse === '') return;
    
    // Add user's message to chat
    addUserMessage(userResponse);
    userInput.value = '';
    
    // Process response
    const currentQuestion = assessmentQuestions[currentQuestionIndex];
    
    // If user responded with yes/positive, ask follow-up
    if (isPositiveResponse(userResponse)) {
      collectedSymptoms.push({
        area: currentQuestion.area,
        reported: true,
        details: 'Awaiting details'
      });
      
      // Ask for more details
      addBotMessage(currentQuestion.followUp);
      
      // Wait for details before moving to next question
      sendButton.removeEventListener('click', processUserResponse);
      userInput.removeEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          processUserResponse();
        }
      });
      
      // Set up new listeners for detail response
      const detailsHandler = function() {
        const detailsResponse = userInput.value.trim();
        if (detailsResponse === '') return;
        
        // Add user's details to chat
        addUserMessage(detailsResponse);
        userInput.value = '';
        
        // Save details
        collectedSymptoms[collectedSymptoms.length - 1].details = detailsResponse;
        
        // Move to next question or finish
        moveToNextQuestion();
        
        // Reset listeners
        sendButton.removeEventListener('click', detailsHandler);
        userInput.removeEventListener('keypress', detailsKeyHandler);
        
        // Restore original handlers
        sendButton.addEventListener('click', processUserResponse);
        userInput.addEventListener('keypress', function(e) {
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
    } else {
      // No symptoms in this area
      collectedSymptoms.push({
        area: currentQuestion.area,
        reported: false,
        details: 'None reported'
      });
      
      // Move to next question without follow-up
      moveToNextQuestion();
    }
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
    const messageDiv = document.createElement('div');
    messageDiv.className = 'user-message';
    messageDiv.innerHTML = `<p>${message}</p>`;
    chatMessages.appendChild(messageDiv);
    
    // Scroll to the bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  function addBotMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'bot-message';
    messageDiv.innerHTML = `<p>${message}</p>`;
    chatMessages.appendChild(messageDiv);
    
    // Scroll to the bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  function isPositiveResponse(response) {
    const positivePatterns = [
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