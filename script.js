// script.js
document.addEventListener("DOMContentLoaded", () => {
  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  const menuIcon = document.getElementById("menu-icon");
  const closeIcon = document.getElementById("close-icon");

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      const isExpanded = mobileMenuBtn.getAttribute("aria-expanded") === "true";
      mobileMenuBtn.setAttribute("aria-expanded", !isExpanded);
      
      if (!isExpanded) {
        mobileMenu.style.transform = "translateX(0)";
        mobileMenu.style.opacity = "1";
        mobileMenu.style.pointerEvents = "auto";
        menuIcon.style.display = "none";
        closeIcon.style.display = "block";
      } else {
        mobileMenu.style.transform = "translateX(-100%)";
        mobileMenu.style.opacity = "0";
        mobileMenu.style.pointerEvents = "none";
        menuIcon.style.display = "block";
        closeIcon.style.display = "none";
      }
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      const isExpanded = mobileMenuBtn.getAttribute("aria-expanded") === "true";
      if (isExpanded && !mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        mobileMenuBtn.click();
      }
    });
  }

  // Active Link Highlighting
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const linkPath = new URL(link.href).pathname;
    
    // Simple path matching
    if (currentPath === linkPath || (currentPath.endsWith('/') && linkPath.endsWith('index.html'))) {
      link.classList.add('active');
      link.style.color = '#F2601E'; // Tailwind text-ember-bright
    }
  });

  // Logo Canvas implementation (replaces background white with transparent and tints to amber)
  const canvases = document.querySelectorAll('.aaravam-logo-canvas');
  canvases.forEach(canvas => {
    const src = canvas.getAttribute('data-src');
    const targetWidth = parseInt(canvas.getAttribute('data-width') || '800', 10);
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => {
      const scale = Math.min(1, targetWidth / img.width);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imageData.data;

      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        const brightness = (r + g + b) / 3;

        if (brightness > 140) {
          d[i + 3] = 0; // Transparent
        } else {
          const t = 1 - brightness / 140; 
          d[i]     = Math.round(r + (201 - r) * t);
          d[i + 1] = Math.round(g + (162 - g) * t);
          d[i + 2] = Math.round(b + (39  - b) * t);
          d[i + 3] = Math.round(255 * t * 1.1);
        }
      }

      ctx.putImageData(imageData, 0, 0);
      canvas.style.opacity = '1';
    };
  });

  // Render Leaderboard if on index.html
  const leaderboardContainer = document.getElementById('leaderboard-container');
  if (leaderboardContainer && window.AaravamData) {
    (async () => {
      leaderboardContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #7A6E58; font-family: \'Cinzel\', serif; font-size: 14px;">Loading leaderboard...</div>';
      const leaderboard = await window.AaravamData.getLeaderboard();
      
      // Check if points are 0
      const totalPoints = leaderboard.reduce((acc, t) => acc + t.points, 0);
      
      if (totalPoints === 0) {
        leaderboardContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #7A6E58; font-family: \'Cinzel\', serif; font-size: 14px;">Results have not been published yet.</div>';
      } else {
        let html = '';
        
        // Calculate ranks using dense ranking (1, 1, 2, 2, 3)
        let currentRank = 1;
        let prevPoints = -1;

        leaderboard.forEach((team, index) => {
          if (prevPoints !== -1 && team.points < prevPoints) {
            currentRank++;
          }
          prevPoints = team.points;

          if (currentRank === 1) {
            // 1st Place Card
            html += `
              <div style="margin-bottom: 16px; padding: 24px 28px; background: linear-gradient(135deg, #1F160D 0%, #161009 100%); border: 1px solid rgba(245,158,11,0.35); border-radius: 4px; position: relative; overflow: hidden; box-shadow: 0 0 40px rgba(245,158,11,0.12), 0 4px 24px rgba(0,0,0,0.6);">
                <div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, #F0C040, transparent);"></div>
                <div style="display: flex; align-items: center; gap: 20px;">
                  <div style="width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #F59E0B, #D97706); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(245,158,11,0.5); flex-shrink: 0;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0A0704" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
                  </div>
                  <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                      <span style="padding: 2px 8px; font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; color: #C9A227; background: rgba(201,162,39,0.1); border: 1px solid rgba(201,162,39,0.3); border-radius: 9999px;">1st Place</span>
                    </div>
                    <p style="font-family: 'Cinzel', serif; font-size: 28px; font-weight: 700; color: #F5EFE0; letter-spacing: 0.05em; margin: 0; text-shadow: 0 0 20px rgba(201,162,39,0.5); text-transform: uppercase;">${team.name}</p>
                  </div>
                  <div style="text-align: right; flex-shrink: 0;">
                    <p style="font-family: 'Cinzel', serif; font-size: 48px; font-weight: 900; color: #FDE68A; margin: 0; text-shadow: 0 0 20px rgba(201,162,39,0.7);">${team.points}</p>
                    <p style="font-family: 'Inter', sans-serif; font-size: 11px; color: #7A6E58; text-transform: uppercase; letter-spacing: 0.2em; margin: 0;">Points</p>
                  </div>
                </div>
              </div>
            `;
          } else {
            // Ranks 2+
            let colorConfig = { border: 'rgba(148,163,184,0.3)', bg: 'linear-gradient(135deg,#94A3B8,#64748B)', text: '#CBD5E1' };
            if (currentRank === 2) colorConfig = { border: 'rgba(148,163,184,0.3)', bg: 'linear-gradient(135deg,#94A3B8,#64748B)', text: '#CBD5E1' }; // Silver
            else if (currentRank === 3) colorConfig = { border: 'rgba(180,83,9,0.3)', bg: 'linear-gradient(135deg,#B45309,#92400E)', text: '#FCA5A5' }; // Bronze
            else colorConfig = { border: 'rgba(201,162,39,0.1)', bg: 'transparent', text: '#B8A98A' };

            html += `
              <div style="display: flex; align-items: center; gap: 16px; padding: 14px 20px; background: rgba(31,22,13,0.6); border: 1px solid ${colorConfig.border}; border-radius: 4px; margin-bottom: 10px; transition: border-color 0.2s ease;">
                <div style="width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0; background: ${colorConfig.bg}; display: flex; align-items: center; justify-content: center; ${currentRank > 3 ? 'border: 1px solid rgba(201,162,39,0.3);' : ''}">
                  <span style="font-family: 'Cinzel', serif; font-size: 10px; font-weight: 700; color: ${currentRank > 3 ? '#B8A98A' : 'white'};">${currentRank}</span>
                </div>
                <p style="flex: 1; font-family: 'Cinzel', serif; font-size: 18px; font-weight: 600; color: ${colorConfig.text}; letter-spacing: 0.05em; margin: 0; text-transform: uppercase;">${team.name}</p>
                <div style="text-align: right;">
                  <span style="font-family: 'Cinzel', serif; font-size: 24px; font-weight: 700; color: ${colorConfig.text};">${team.points}</span>
                  <span style="font-family: 'Inter', sans-serif; font-size: 11px; color: #7A6E58; margin-left: 4px;">pts</span>
                </div>
              </div>
            `;
          }
        });
        
        leaderboardContainer.innerHTML = html;
      }
    })();
  }

  // Render Scorecard if on scorecard.html
  const scorecardContainer = document.getElementById('scorecard-container');
  if (scorecardContainer && window.AaravamData) {
    (async () => {
      scorecardContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #7A6E58; font-family: \'Cinzel\', serif; font-size: 14px;">Loading scorecard...</div>';
      const data = await window.AaravamData.getData();
      
      if (data.events.length === 0) {
        scorecardContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #7A6E58; font-family: \'Cinzel\', serif; font-size: 14px;">No events have been recorded yet.</div>';
      } else {
        let html = '';
        
        const renderTable = (title, category) => {
          const events = data.events.filter(e => e.category === category);
          if (events.length === 0) return '';
          
          let tableHtml = `
            <div style="margin-bottom: 48px;">
              <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
                <div style="flex: 1; height: 1px; background: rgba(201,162,39,0.1);"></div>
                <span style="display: inline-flex; align-items: center; padding: 4px 14px; font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; color: #F2601E; background: rgba(199,57,26,0.1); border: 1px solid rgba(199,57,26,0.3); border-radius: 9999px;">${title}</span>
                <div style="flex: 1; height: 1px; background: rgba(201,162,39,0.1);"></div>
              </div>
              
              <div style="overflow-x: auto; border-radius: 4px; border: 1px solid rgba(201,162,39,0.12);">
                <table style="width: 100%; min-width: 640px; border-collapse: collapse;">
                  <thead style="background: rgba(31,22,13,0.9);">
                    <tr>
                      <th style="padding: 12px 16px; font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; color: #7A6E58; border-bottom: 1px solid rgba(201,162,39,0.2); text-align: left;">Event</th>
                      ${window.AaravamData.TEAMS.map(t => `<th style="padding: 12px 16px; font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: #7A6E58; border-bottom: 1px solid rgba(201,162,39,0.2); text-align: center;">${t.name}</th>`).join('')}
                    </tr>
                  </thead>
                  <tbody>
          `;
          
          // Rows for each event
          const totals = {};
          window.AaravamData.TEAMS.forEach(t => totals[t.id] = 0);
          
          events.forEach((ev, i) => {
            const bg = i % 2 === 0 ? 'rgba(31,22,13,0.5)' : 'rgba(22,16,9,0.4)';
            tableHtml += `<tr style="background: ${bg};">
              <td style="padding: 14px 16px; font-family: 'Inter', sans-serif; font-size: 13px; color: #B8A98A; border-bottom: 1px solid rgba(255,255,255,0.04); text-align: left;">
                <p style="font-weight: 600; color: #F5EFE0; margin: 0 0 2px; font-size: 13px;">${ev.name}</p>
              </td>
            `;
            
            window.AaravamData.TEAMS.forEach(t => {
              const pts = ev.points && ev.points[t.id] ? ev.points[t.id] : 0;
              totals[t.id] += pts;
              const displayPts = pts > 0 ? pts : '<span style="color: #7A6E58;">—</span>';
              const colorStyle = pts > 10 ? 'color: #FDE68A; text-shadow: 0 0 12px rgba(201,162,39,0.6);' : 'color: #B8A98A;';
              tableHtml += `
                <td style="padding: 14px 16px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.04);">
                  <span style="font-family: 'Cinzel', serif; font-weight: 600; font-size: 15px; ${colorStyle}">${displayPts}</span>
                </td>
              `;
            });
            tableHtml += `</tr>`;
          });
          
          // Total Row
          tableHtml += `
                    <tr style="background: rgba(22,16,9,0.95); border-top: 1px solid rgba(201,162,39,0.2);">
                      <td style="padding: 14px 16px; font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #C9A227; text-align: left; border-bottom: none;">Total</td>
                      ${window.AaravamData.TEAMS.map(t => `<td style="padding: 14px 16px; text-align: center; border-bottom: none;"><span style="font-family: 'Cinzel', serif; font-weight: 700; font-size: 17px; color: #C9A227; text-shadow: 0 0 10px rgba(201,162,39,0.5);">${totals[t.id]}</span></td>`).join('')}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          `;
          return tableHtml;
        };
        
        html += renderTable('On Stage Events', 'on_stage');
        html += renderTable('Off Stage Events', 'off_stage');
        
        scorecardContainer.innerHTML = html;
      }
    })();
  }

  // Render Winners if on winners.html
  const winnersContainer = document.getElementById('winners-container');
  if (winnersContainer && window.AaravamData) {
    (async () => {
      winnersContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #7A6E58; font-family: \'Cinzel\', serif; font-size: 14px;">Loading winners...</div>';
      const data = await window.AaravamData.getData();
      
      if (data.events.length === 0) {
        winnersContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #7A6E58; font-family: \'Cinzel\', serif; font-size: 14px;">No events have been recorded yet.</div>';
      } else {
        let html = '';
        
        const renderCategory = (title, category) => {
          const events = data.events.filter(e => e.category === category);
          if (events.length === 0) return '';
          
          let categoryHtml = `
            <div style="margin-bottom: 56px;">
              <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 32px;">
                <div style="flex: 1; height: 1px; background: rgba(201,162,39,0.1);"></div>
                <span style="padding: 4px 14px; font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; color: #F2601E; background: rgba(199,57,26,0.1); border: 1px solid rgba(199,57,26,0.3); border-radius: 9999px;">${title}</span>
                <div style="flex: 1; height: 1px; background: rgba(201,162,39,0.1);"></div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
          `;
          
          events.forEach(ev => {
            categoryHtml += `
              <div style="padding: 16px 20px; border-radius: 4px; background: rgba(31,22,13,0.6); border: 1px solid rgba(201,162,39,0.1); display: flex; flex-wrap: wrap; align-items: center; gap: 16px; transition: border-color 0.2s;">
                <div style="flex: 1 1 200px; min-width: 180px;">
                  <p style="font-family: 'Cinzel', serif; font-size: 13px; color: #F5EFE0; margin: 0 0 4px;">${ev.name}</p>
                </div>
            `;
            
            if (!ev.points || Object.keys(ev.points).length === 0) {
              categoryHtml += `<span style="font-family: 'Inter', sans-serif; font-size: 12px; color: #7A6E58; font-style: italic;">Winners not announced</span>`;
            } else {
              // Calculate ranks
              const teamPoints = Object.keys(ev.points).map(teamId => ({
                id: teamId,
                name: window.AaravamData.TEAMS.find(t => t.id === teamId)?.name || teamId,
                points: ev.points[teamId]
              })).filter(t => t.points > 0);
              
              teamPoints.sort((a, b) => b.points - a.points);
              
              if (teamPoints.length === 0) {
                categoryHtml += `<span style="font-family: 'Inter', sans-serif; font-size: 12px; color: #7A6E58; font-style: italic;">Winners not announced</span>`;
              } else {
                categoryHtml += `<div style="display: flex; flex-wrap: wrap; gap: 8px;">`;
                
                let currentRank = 1;
                let prevPoints = -1;
                
                teamPoints.forEach(team => {
                  if (prevPoints !== -1 && team.points < prevPoints) {
                    currentRank++;
                  }
                  prevPoints = team.points;
                  
                  if (currentRank <= 3) {
                    let styleConfig = { bg: 'rgba(180,83,9,0.1)', border: 'rgba(180,83,9,0.25)', text: '#FDBA74', label: '3rd' };
                    if (currentRank === 1) styleConfig = { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', text: '#FDE68A', label: '1st' };
                    if (currentRank === 2) styleConfig = { bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.25)', text: '#CBD5E1', label: '2nd' };
                    
                    categoryHtml += `
                      <div style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 4px; background: ${styleConfig.bg}; border: 1px solid ${styleConfig.border};">
                        <span style="font-family: 'Cinzel', serif; font-size: 10px; font-weight: 700; color: ${styleConfig.text}; letter-spacing: 0.2em; text-transform: uppercase;">${styleConfig.label}</span>
                        <span style="font-family: 'Inter', sans-serif; font-size: 13px; color: #B8A98A; text-transform: uppercase;">${team.name}</span>
                      </div>
                    `;
                  }
                });
                
                categoryHtml += `</div>`;
              }
            }
            
            categoryHtml += `</div>`;
          });
          
          categoryHtml += `</div></div>`;
          return categoryHtml;
        };
        
        html += renderCategory('On Stage', 'on_stage');
        html += renderCategory('Off Stage', 'off_stage');
        
        winnersContainer.innerHTML = html;
      }
    })();
  }
});
