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

// Handle symptom submission (mock functionality)
document.getElementById('submitSymptoms').addEventListener('click', function() {
  const symptomsText = document.querySelector('.symptoms-input').value;
  if (symptomsText.trim() !== '') {
    alert('Thank you for submitting your symptoms. Our system is analyzing your information, and we will contact you shortly with results.');
    modal.style.display = "none";
    document.querySelector('.symptoms-input').value = '';
  } else {
    alert('Please enter at least one symptom to proceed.');
  }
});

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