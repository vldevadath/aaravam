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
  const winnersListContainer = document.getElementById("winners-list");
  const addWinnerBtn = document.getElementById("add-winner-btn");
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
    
    // Populate winners list
    winnersListContainer.innerHTML = '';
    
    if (ev.winners && ev.winners.length > 0) {
      ev.winners.forEach(w => addWinnerRow(w));
    } else {
      addWinnerRow(); // Add one empty row by default
    }

    scoreModal.style.display = "flex";
  }
  
  function addWinnerRow(winnerData = null) {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.gap = "8px";
    row.style.alignItems = "center";
    
    const place = winnerData ? winnerData.place : '1';
    const name = winnerData ? winnerData.name : '';
    const teamId = winnerData ? winnerData.teamId : TEAMS[0].id;
    const points = winnerData ? winnerData.points : '';
    
    let teamOptions = TEAMS.map(t => `<option value="${t.id}" ${t.id === teamId ? 'selected' : ''}>${t.name}</option>`).join('');
    
    row.innerHTML = `
      <select class="winner-place" style="width: 70px; flex-shrink: 0; padding: 8px;">
        <option value="1" ${place === '1' ? 'selected' : ''}>1st</option>
        <option value="2" ${place === '2' ? 'selected' : ''}>2nd</option>
        <option value="3" ${place === '3' ? 'selected' : ''}>3rd</option>
      </select>
      <input type="text" class="winner-name" value="${name}" placeholder="Student Name" required style="flex: 1; min-width: 120px; margin: 0; padding: 8px;">
      <select class="winner-team" style="width: 100px; flex-shrink: 0; padding: 8px;">
        ${teamOptions}
      </select>
      <input type="number" class="winner-points" value="${points}" placeholder="Pts" required min="1" style="width: 60px; flex-shrink: 0; margin: 0; padding: 8px; text-align: center;">
      <button type="button" class="remove-winner-btn" style="background: none; border: none; color: #F2601E; cursor: pointer; font-size: 16px; padding: 4px;">&times;</button>
    `;
    
    row.querySelector('.remove-winner-btn').addEventListener('click', () => {
      row.remove();
    });
    
    winnersListContainer.appendChild(row);
  }
  
  addWinnerBtn.addEventListener("click", () => addWinnerRow());

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

  // Save Scores and Winners
  scoreForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentEditingEventId) return;

    const winners = [];
    const pointsObj = {};
    
    const rows = winnersListContainer.querySelectorAll("div");
    rows.forEach(row => {
      const place = row.querySelector('.winner-place').value;
      const name = row.querySelector('.winner-name').value.trim();
      const teamId = row.querySelector('.winner-team').value;
      const pts = parseInt(row.querySelector('.winner-points').value, 10);
      
      if (name && !isNaN(pts) && pts > 0) {
        winners.push({ place, name, teamId, points: pts });
        pointsObj[teamId] = (pointsObj[teamId] || 0) + pts;
      }
    });

    const btn = e.target.querySelector('button[type="submit"]');
    btn.textContent = 'Saving...';
    btn.disabled = true;
    
    // updateEventPoints in data.js now needs to send { points, winners }
    // We will pass the combined object.
    await updateEventPoints(currentEditingEventId, { points: pointsObj, winners });
    
    scoreModal.style.display = "none";
    currentEditingEventId = null;
    
    btn.textContent = 'Save Winners';
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
