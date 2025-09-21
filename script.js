
        // A simple in-memory state to track if a user is logged in
        let isLoggedIn = false;
        let userDetails = null;

        // Function to update the UI based on login status
        function updateUI() {
            const ctaButton = document.querySelector('.cta');
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            
            if (isLoggedIn) {
                ctaButton.textContent = `Hi, ${userDetails.name}`;
                ctaButton.style.background = 'transparent';
                ctaButton.style.color = 'var(--accent)';
                // Lock the name and email fields on the contact form
                nameInput.value = userDetails.name;
                emailInput.value = userDetails.email;
                nameInput.setAttribute('readonly', true);
                emailInput.setAttribute('readonly', true);
            } else {
                ctaButton.textContent = 'Login / Signup';
                ctaButton.style.background = 'linear-gradient(90deg,var(--accent),#3fd1b7)';
                ctaButton.style.color = '#022';
                // Unlock the name and email fields
                nameInput.value = '';
                emailInput.value = '';
                nameInput.removeAttribute('readonly');
                emailInput.removeAttribute('readonly');
            }
        }

        // Mobile menu toggle
        document.getElementById('burger').addEventListener('click', () => {
            const nav = document.getElementById('navLinks');
            nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
            nav.style.flexDirection = 'column';
            nav.style.position = 'absolute';
            nav.style.right = '1.25rem';
            nav.style.top = '64px';
            nav.style.background = 'linear-gradient(180deg, rgba(7,10,16,0.95), rgba(7,10,16,0.9))';
            nav.style.padding = '0.8rem';
            nav.style.borderRadius = '10px';
            nav.style.boxShadow = '0 20px 40px rgba(2,6,12,0.6)';
        });

        // --- Modal and Authentication Logic ---
        const authModal = document.getElementById('authModal');
        const authForm = document.getElementById('authForm');
        const modalTitle = document.getElementById('modalTitle');
        const nameField = document.getElementById('nameField');
        const toggleAuthLink = document.getElementById('toggleAuth');
        const authStatus = document.getElementById('authStatus');

        let isSignupMode = false;

        // Open modal function
        function openModal() {
            authModal.style.display = 'block';
            authStatus.textContent = '';
            authForm.reset();
            isSignupMode = false;
            modalTitle.textContent = 'Login';
            nameField.style.display = 'none';
            toggleAuthLink.textContent = "Don't have an account? Signup here";
        }

        // Close modal function
        function closeModal() {
            authModal.style.display = 'none';
        }

        // Toggle between Login and Signup modes
        toggleAuthLink.addEventListener('click', (e) => {
            e.preventDefault();
            isSignupMode = !isSignupMode;
            modalTitle.textContent = isSignupMode ? 'Signup' : 'Login';
            nameField.style.display = isSignupMode ? 'block' : 'none';
            toggleAuthLink.textContent = isSignupMode ? 'Already have an account? Login here' : "Don't have an account? Signup here";
            authStatus.textContent = '';
            authForm.reset();
        });

        // Handle Login / Signup button click
        document.querySelector('.cta').addEventListener('click', () => {
            if (isLoggedIn) {
                // Optional: Implement logout logic here
                alert('You are already logged in.');
            } else {
                openModal();
            }
        });

        // Handle form submission in the modal
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Clear previous errors and status messages
            ['modalName', 'modalEmail', 'modalPassword'].forEach(id => {
                const errorDiv = document.getElementById(`err-${id}`);
                if(errorDiv) errorDiv.textContent = '';
            });
            authStatus.textContent = 'Processing...';

            let url = isSignupMode ? 'http://localhost:3000/api/signup' : 'http://localhost:3000/api/login';
            const name = document.getElementById('modalName').value.trim();
            const email = document.getElementById('modalEmail').value.trim();
            const password = document.getElementById('modalPassword').value.trim();

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, email, password }),
                });

                const result = await response.json();
                authStatus.textContent = result.message;

                if (response.ok) {
                    if (!isSignupMode) { // Login was successful
                        isLoggedIn = true;
                        userDetails = result.user; // Save user info
                        updateUI(); // Update the UI to show logged-in state
                        setTimeout(closeModal, 1000); // Close modal after a short delay
                    }
                } else {
                    authStatus.textContent = `Error: ${result.error}`;
                }
            } catch (error) {
                console.error('Authentication Error:', error);
                authStatus.textContent = 'Network error. Please try again.';
            }
        });

        // --- Contact Form Submission ---
        const contactForm = document.getElementById('contactForm');
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Clear all errors from the contact form
            ['name', 'email', 'subject', 'message'].forEach(f=>document.getElementById('err-'+f).textContent='');

            // Use the new pickup API if the user is logged in
            if (isLoggedIn) {
                const subject = document.getElementById('subject').value.trim();
                const message = document.getElementById('message').value.trim();
                const contactStatus = document.getElementById('formStatus');

                if (subject.length < 4) { document.getElementById('err-subject').textContent = 'Subject thoda lamba rakhein'; return; }
                if (message.length < 8) { document.getElementById('err-message').textContent = 'Message kam se kam 8 characters hona chahiye'; return; }

                contactStatus.textContent = 'Scheduling pickup...';
                try {
                    const response = await fetch('http://localhost:3000/api/pickup', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ userId: userDetails.id, subject, message }), // Send userId from logged-in state
                    });

                    const result = await response.json();
                    if (response.ok) {
                        contactStatus.textContent = result.message;
                        contactForm.reset();
                    } else {
                        contactStatus.textContent = `Error: ${result.error}`;
                    }
                } catch (error) {
                    contactStatus.textContent = 'Network error. Could not schedule pickup.';
                }
                
            } else {
                // Fallback to contact form for non-logged-in users
                const name = document.getElementById('name').value.trim();
                const email = document.getElementById('email').value.trim();
                const subject = document.getElementById('subject').value.trim();
                const message = document.getElementById('message').value.trim();
                const contactStatus = document.getElementById('formStatus');
                
                // Basic validation
                let ok = true;
                if (name.length < 2) { document.getElementById('err-name').textContent = 'Naam 2 characters se kam nahi hona chahiye'; ok = false }
                if (!/^\S+@\S+\.\S+$/.test(email)) { document.getElementById('err-email').textContent = 'Valid email daalein'; ok = false }
                if (subject.length < 4) { document.getElementById('err-subject').textContent = 'Subject thoda lamba rakhein'; ok = false }
                if (message.length < 8) { document.getElementById('err-message').textContent = 'Message kam se kam 8 characters hona chahiye'; ok = false }
                if (!ok) return;

                contactStatus.textContent = 'Sending...';
                try {
                    const response = await fetch('http://localhost:3000/api/contact', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ name, email, subject, message }),
                    });
                    const result = await response.json();
                    if (response.ok) {
                        contactStatus.textContent = result.message;
                        contactForm.reset();
                    } else {
                        contactStatus.textContent = `Error: ${result.error}`;
                    }
                } catch (error) {
                    contactStatus.textContent = 'Network error. Please try again.';
                }
            }
        });

        // Handle navigation and year on page load
        function setActive() {
            const links = document.querySelectorAll('.nav-links a');
            links.forEach(a => a.classList.remove('active'));
            const hash = location.hash || '#home';
            const target = document.querySelector('.nav-links a[href="' + hash + '"]');
            if (target) target.classList.add('active');
            const el = document.querySelector(hash);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        window.addEventListener('hashchange', setActive);
        window.addEventListener('load', () => {
            setActive();
            document.getElementById('year').textContent = (new Date()).getFullYear();
        });

        // Navbar login/logout toggle
document.addEventListener("DOMContentLoaded", ()=>{
  const ctaBtn = document.querySelector(".cta");

  if(localStorage.getItem("token")) {
    ctaBtn.textContent = "Logout";
    ctaBtn.onclick = ()=>{
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      alert("Logged out successfully!");
      location.reload();
    }
  } else {
    ctaBtn.textContent = "Login / Signup";
    ctaBtn.onclick = ()=>{
      window.location.href = "login.html";
    }
  }
});



       
    