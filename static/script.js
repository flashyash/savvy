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



let map;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 37.7749, lng: -122.4194 }, // Default center (San Francisco)
        zoom: 10,
    });
}

document.getElementById("findDoctorBtn").addEventListener("click", function () {
    let location = document.getElementById("locationInput").value;
    if (!location) {
        alert("Please enter a location!");
        return;
    }

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: location }, (results, status) => {
        if (status === "OK") {
            const userLocation = results[0].geometry.location;
            map.setCenter(userLocation);
            findDoctorsNearby(userLocation);
        } else {
            alert("Location not found!");
        }
    });
});

function findDoctorsNearby(userLocation) {
    const placesService = new google.maps.places.PlacesService(map);
    const request = {
        location: userLocation,
        radius: 5000, // 5km search radius
        type: ["doctor"], // Google Places API type
        keyword: "genetic disease specialist",
    };

    placesService.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            document.getElementById("doctor-results").innerHTML = "";
            results.forEach((place) => {
                const marker = new google.maps.Marker({
                    position: place.geometry.location,
                    map: map,
                    title: place.name,
                });

                document.getElementById("doctor-results").innerHTML += `
                    <div class="doctor-card">
                        <h3>${place.name}</h3>
                        <p>${place.vicinity}</p>
                        <a href="https://www.google.com/search?q=${place.name}" target="_blank">View on Google</a>
                    </div>
                `;
            });
        } else {
            document.getElementById("doctor-results").innerHTML = "<p>No doctors found nearby.</p>";
        }
    });
}



document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("findDoctors").addEventListener("click", async function () {
      let location = document.getElementById("locationInput").value;
      let symptoms = ["HP:0000256", "HP:0002007", "HP:000235"]; // Replace with real data

      let response = await fetch("/get_disease_and_doctors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symptoms: symptoms, location: location }),
      });

      let data = await response.json();
      console.log(data);
      alert("Diseases: " + data.diseases.join(", ") + "\nLocation: " + data.location);
  });
});

