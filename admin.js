// admin.js
// Handles UI logic for admin.html

document.addEventListener("DOMContentLoaded", () => {
  const { TEAMS, getData, addEvent, updateEventName, updateEventPoints, deleteEvent } = window.AaravamData;

  // Login Overlay Logic
  const loginOverlay = document.getElementById("login-overlay");
  const dashboardContent = document.getElementById("dashboard-content");
  const loginForm = document.getElementById("login-form");
  const loginError = document.getElementById("login-error");
  const passwordInput = document.getElementById("password-input");

  // Check if already logged in
  if (sessionStorage.getItem('adminToken') === 'aaravam@admin2526') {
    loginOverlay.style.display = 'none';
    dashboardContent.classList.add('visible');
    renderEvents(); // Only load data if authenticated
  }

  // Handle Login Submit
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const pass = passwordInput.value;
    
    if (pass === 'aaravam@admin2526') {
      sessionStorage.setItem('adminToken', pass);
      loginOverlay.style.opacity = '0';
      setTimeout(() => {
        loginOverlay.style.display = 'none';
        dashboardContent.classList.add('visible');
        renderEvents();
      }, 500);
    } else {
      loginError.style.display = 'block';
      passwordInput.value = '';
    }
  });


  // Dashboard Logic
  const eventsListEl = document.getElementById("events-list");
  const addEventForm = document.getElementById("add-event-form");
  
  const scoreModal = document.getElementById("score-modal");
  const closeModalBtn = document.getElementById("close-modal");
  const scoreForm = document.getElementById("score-form");
  const modalEventName = document.getElementById("modal-event-name");
  const teamInputsContainer = document.getElementById("team-inputs");
  const deleteEventBtn = document.getElementById("delete-event-btn");
  
  // Edit Name Elements
  const editNameBtn = document.getElementById("edit-name-btn");
  const editNameForm = document.getElementById("edit-name-form");
  const editNameInput = document.getElementById("edit-name-input");
  const cancelEditNameBtn = document.getElementById("cancel-edit-name");

  let currentEditingEventId = null;

  // Render events list
  async function renderEvents() {
    eventsListEl.innerHTML = '<p style="padding: 16px; color: #7A6E58; font-size: 13px;">Loading events...</p>';
    const data = await getData();
    eventsListEl.innerHTML = '';

    if (data.events.length === 0) {
      eventsListEl.innerHTML = '<p style="padding: 16px; color: #7A6E58; font-size: 13px;">No events added yet.</p>';
      return;
    }

    data.events.forEach(ev => {
      const el = document.createElement("div");
      el.className = "event-item";
      
      const categoryLabel = ev.category === 'on_stage' ? 'On Stage' : 'Off Stage';
      
      el.innerHTML = `
        <div>
          <h4 style="font-family: 'Cinzel', serif; font-size: 15px; color: #F5EFE0; margin: 0;">${ev.name}</h4>
          <span style="font-size: 11px; color: #7A6E58; text-transform: uppercase;">${categoryLabel}</span>
        </div>
        <span style="color: #C9A227; font-size: 12px; font-weight: 600;">Edit &rarr;</span>
      `;
      
      el.addEventListener("click", () => openModal(ev));
      eventsListEl.appendChild(el);
    });
  }

  // Handle Add Event
  addEventForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("event-name").value.trim();
    const cat = document.getElementById("event-category").value;
    
    if (name) {
      const btn = e.target.querySelector('button');
      btn.textContent = 'Adding...';
      btn.disabled = true;
      await addEvent(name, cat);
      document.getElementById("event-name").value = '';
      btn.textContent = 'Add Event';
      btn.disabled = false;
      await renderEvents();
    }
  });

  // Open Modal to edit scores and names
  function openModal(ev) {
    currentEditingEventId = ev.id;
    modalEventName.textContent = ev.name;
    
    // Reset Edit Name State
    modalEventName.style.display = 'block';
    editNameBtn.style.display = 'inline-block';
    editNameForm.style.display = 'none';
    
    // Generate inputs for each team
    teamInputsContainer.innerHTML = '';
    TEAMS.forEach(team => {
      const currentPoints = ev.points && ev.points[team.id] !== undefined ? ev.points[team.id] : '';
      
      const wrap = document.createElement("div");
      wrap.style.display = "flex";
      wrap.style.alignItems = "center";
      wrap.style.justifyContent = "space-between";
      
      wrap.innerHTML = `
        <label style="font-family: 'Cinzel', serif; color: #F5EFE0; font-size: 14px; text-transform: uppercase;">${team.name}</label>
        <input type="number" min="0" data-team-id="${team.id}" value="${currentPoints}" style="width: 100px; text-align: right;" placeholder="0">
      `;
      teamInputsContainer.appendChild(wrap);
    });

    scoreModal.style.display = "flex";
  }

  // Close Modal
  closeModalBtn.addEventListener("click", () => {
    scoreModal.style.display = "none";
    currentEditingEventId = null;
  });
  
  // Edit Name Button Logic
  editNameBtn.addEventListener("click", (e) => {
    e.preventDefault();
    editNameInput.value = modalEventName.textContent;
    modalEventName.style.display = 'none';
    editNameBtn.style.display = 'none';
    editNameForm.style.display = 'flex';
    editNameInput.focus();
  });
  
  // Cancel Edit Name
  cancelEditNameBtn.addEventListener("click", (e) => {
    e.preventDefault();
    modalEventName.style.display = 'block';
    editNameBtn.style.display = 'inline-block';
    editNameForm.style.display = 'none';
  });
  
  // Save New Name
  editNameForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentEditingEventId) return;
    
    const newName = editNameInput.value.trim();
    if (newName && newName !== modalEventName.textContent) {
      const btn = e.target.querySelector('button[type="submit"]');
      btn.textContent = '...';
      btn.disabled = true;
      
      await updateEventName(currentEditingEventId, newName);
      modalEventName.textContent = newName;
      
      btn.textContent = 'Save';
      btn.disabled = false;
      await renderEvents(); // Refresh list in background
    }
    
    // Switch back to normal view
    modalEventName.style.display = 'block';
    editNameBtn.style.display = 'inline-block';
    editNameForm.style.display = 'none';
  });

  // Save Scores
  scoreForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentEditingEventId) return;

    const pointsObj = {};
    const inputs = teamInputsContainer.querySelectorAll("input");
    inputs.forEach(input => {
      const val = parseInt(input.value, 10);
      if (!isNaN(val) && val > 0) {
        pointsObj[input.getAttribute("data-team-id")] = val;
      }
    });

    const btn = e.target.querySelector('button[type="submit"]');
    btn.textContent = 'Saving...';
    btn.disabled = true;
    
    await updateEventPoints(currentEditingEventId, pointsObj);
    scoreModal.style.display = "none";
    currentEditingEventId = null;
    
    btn.textContent = 'Save Scores';
    btn.disabled = false;
    
    await renderEvents();
  });

  // Delete Event
  deleteEventBtn.addEventListener("click", async () => {
    if (confirm("Are you sure you want to delete this event? This cannot be undone.")) {
      deleteEventBtn.textContent = 'Deleting...';
      deleteEventBtn.disabled = true;
      await deleteEvent(currentEditingEventId);
      scoreModal.style.display = "none";
      currentEditingEventId = null;
      deleteEventBtn.textContent = 'Delete Event';
      deleteEventBtn.disabled = false;
      await renderEvents();
    }
  });
});
