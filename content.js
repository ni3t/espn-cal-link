/**
 * ESPN Calendar Link - Content Script
 * Injects "Add to Calendar" buttons on ESPN schedule pages
 */

// Track which games already have buttons to avoid duplicates
const processedGames = new Set();

/**
 * Check if we're on a KenPom page
 * @returns {boolean} True if on KenPom
 */
function isKenPomPage() {
  return window.location.hostname.includes('kenpom.com');
}

/**
 * Main initialization function
 */
function init() {
  console.log('ESPN Calendar Link: Initializing...');

  // Initial injection
  injectCalendarButtons();

  // Watch for dynamic content changes (ESPN uses React/SPA patterns)
  observePageChanges();

  console.log('ESPN Calendar Link: Initialized successfully');
}

/**
 * Find and inject calendar buttons for all games on the page
 */
function injectCalendarButtons() {
  if (isKenPomPage()) {
    injectCalendarButtonsKenPom();
  } else {
    injectCalendarButtonsESPN();
  }
}

/**
 * Inject calendar buttons for ESPN pages
 */
function injectCalendarButtonsESPN() {
  // Find all date sections
  const dateSections = findDateSections();

  dateSections.forEach(section => {
    const dateStr = extractDateFromSection(section);
    if (!dateStr) return;

    // Find all game rows within this date section
    const gameRows = findGameRows(section);

    gameRows.forEach(gameRow => {
      injectButtonForGame(gameRow, dateStr);
    });
  });
}

/**
 * Inject calendar buttons for KenPom pages
 */
function injectCalendarButtonsKenPom() {
  // Extract date from URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const dateParam = urlParams.get('d');

  if (!dateParam) {
    console.warn('ESPN Calendar Link: No date parameter found in KenPom URL');
    return;
  }

  // Convert date from YYYY-MM-DD to a format we can use
  const dateStr = formatKenPomDate(dateParam);

  // Find the fanmatch table
  const table = document.getElementById('fanmatch-table');
  if (!table) {
    console.warn('ESPN Calendar Link: KenPom fanmatch table not found');
    return;
  }

  // Find all game rows (skip header rows)
  const gameRows = Array.from(table.querySelectorAll('tr')).filter(row => {
    // Skip rows without team links
    return row.querySelectorAll('a[href*="team.php"]').length >= 2;
  });

  console.log('ESPN Calendar Link: Found', gameRows.length, 'KenPom game rows');

  gameRows.forEach(gameRow => {
    injectButtonForGameKenPom(gameRow, dateStr);
  });
}

/**
 * Format KenPom date from YYYY-MM-DD to readable format
 * @param {string} dateParam - Date in YYYY-MM-DD format
 * @returns {string} Formatted date string
 */
function formatKenPomDate(dateParam) {
  const date = new Date(dateParam + 'T12:00:00'); // Add time to avoid timezone issues
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Find all date sections on the page
 * @returns {Array<HTMLElement>} Array of date section elements
 */
function findDateSections() {
  // NOTE: These selectors may need adjustment based on ESPN's actual HTML structure
  // Inspect the page with DevTools to get exact selectors

  // Try multiple selector strategies
  const strategies = [
    // Strategy 1: Look for tables with date headers
    () => {
      const sections = [];
      const tables = document.querySelectorAll('table');
      tables.forEach(table => {
        // Look for date header before each table
        let prevElement = table.previousElementSibling;
        while (prevElement && prevElement.tagName !== 'TABLE') {
          const text = prevElement.textContent || '';
          if (text.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i)) {
            sections.push({ header: prevElement, container: table });
            break;
          }
          prevElement = prevElement.previousElementSibling;
        }
      });
      return sections;
    },
    // Strategy 2: Look for common ESPN container classes (update with actual classes)
    () => {
      return Array.from(document.querySelectorAll('[class*="schedule"], [class*="Schedule"]'))
        .filter(el => el.querySelector('table'));
    },
    // Strategy 3: Find any element containing day of week followed by date
    () => {
      const allElements = document.querySelectorAll('div, section, header, h2, h3');
      return Array.from(allElements).filter(el => {
        const text = el.textContent || '';
        return text.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+\w+\s+\d+/i);
      });
    }
  ];

  // Try each strategy until we find sections
  for (const strategy of strategies) {
    const sections = strategy();
    if (sections.length > 0) {
      console.log('ESPN Calendar Link: Found date sections using strategy', strategies.indexOf(strategy) + 1);
      return sections.map(s => s.container || s);
    }
  }

  console.warn('ESPN Calendar Link: No date sections found');
  return [];
}

/**
 * Extract date string from a date section
 * @param {HTMLElement} section - Date section element
 * @returns {string|null} Date string
 */
function extractDateFromSection(section) {
  // Look for date text in current element or nearby elements
  const searchElements = [
    section,
    section.previousElementSibling,
    section.querySelector('[class*="date"], [class*="Date"]'),
    section.closest('[class*="date"]')
  ].filter(Boolean);

  for (const element of searchElements) {
    const text = element.textContent || '';
    const match = text.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+(\w+\s+\d+(?:,\s*\d{4})?)/i);
    if (match) {
      return match[0];
    }
  }

  return null;
}

/**
 * Find all game rows within a section
 * @param {HTMLElement} section - Date section element
 * @returns {Array<HTMLElement>} Array of game row elements
 */
function findGameRows(section) {
  // Look for rows containing game links (gameId in URL)
  const gameLinks = section.querySelectorAll('a[href*="/gameId/"], a[href*="/game/_/gameId/"]');

  // Get unique parent rows (usually <tr> elements)
  const rows = new Set();
  gameLinks.forEach(link => {
    let row = link.closest('tr');
    if (!row) {
      // If not in a table row, try to find the game container
      row = link.closest('[class*="game"], [class*="Game"], [class*="event"], [class*="Event"]');
    }
    if (row) {
      rows.add(row);
    }
  });

  return Array.from(rows);
}

/**
 * Inject calendar button for a specific game
 * @param {HTMLElement} gameRow - Game row element
 * @param {string} dateStr - Date string for this game
 */
function injectButtonForGame(gameRow, dateStr) {
  // Generate unique ID for this game
  const gameId = extractGameId(gameRow);
  if (!gameId) {
    console.warn('ESPN Calendar Link: Could not extract game ID', gameRow);
    return;
  }

  // Skip if already processed
  if (processedGames.has(gameId)) {
    return;
  }

  // Extract game data
  const gameData = extractGameData(gameRow, dateStr);
  if (!gameData) {
    console.warn('ESPN Calendar Link: Could not extract game data', gameRow);
    return;
  }

  // Find time element to inject button next to
  const timeElement = findTimeElement(gameRow);
  if (!timeElement) {
    console.warn('ESPN Calendar Link: Could not find time element', gameRow);
    return;
  }

  // Create and inject button
  const button = createCalendarButton(gameData);
  insertButtonNextToTime(button, timeElement);

  // Mark as processed
  processedGames.add(gameId);
}

/**
 * Extract game ID from row
 * @param {HTMLElement} gameRow - Game row element
 * @returns {string|null} Game ID
 */
function extractGameId(gameRow) {
  const link = gameRow.querySelector('a[href*="/gameId/"]');
  if (link) {
    const match = link.href.match(/gameId\/(\d+)/);
    return match ? match[1] : null;
  }
  return null;
}

/**
 * Extract team name from a team link element
 * Tries multiple methods to handle different ESPN structures
 * @param {HTMLElement} teamLink - Team link element
 * @returns {string} Team name
 */
function extractTeamName(teamLink) {
  // Method 1: Try innerText (visible text only, excludes hidden elements)
  let name = teamLink.innerText?.trim();
  if (name && name.length > 0 && name.length < 50) {
    // Filter out common non-name text
    name = name.replace(/^\d+\s+/, ''); // Remove rankings like "1 Duke"
    name = name.replace(/\(\d+-\d+\)/, '').trim(); // Remove records like "(5-2)"
    if (name) return name;
  }

  // Method 2: Try textContent
  name = teamLink.textContent?.trim();
  if (name && name.length > 0 && name.length < 50) {
    name = name.replace(/^\d+\s+/, '');
    name = name.replace(/\(\d+-\d+\)/, '').trim();
    if (name) return name;
  }

  // Method 3: Look for specific child elements with team name
  const spanElements = teamLink.querySelectorAll('span, div');
  for (const span of spanElements) {
    const text = span.innerText?.trim() || span.textContent?.trim();
    if (text && text.length > 2 && text.length < 50 && !text.match(/^\d+$/)) {
      return text.replace(/^\d+\s+/, '').replace(/\(\d+-\d+\)/, '').trim();
    }
  }

  // Method 4: Try title or aria-label attributes
  const title = teamLink.getAttribute('title') || teamLink.getAttribute('aria-label');
  if (title) {
    return title.trim();
  }

  // Method 5: Look for abbreviation with title attribute
  const abbr = teamLink.querySelector('abbr[title]');
  if (abbr) {
    return abbr.getAttribute('title').trim();
  }

  return '';
}

/**
 * Extract all game data from a row
 * @param {HTMLElement} gameRow - Game row element
 * @param {string} dateStr - Date string
 * @returns {Object|null} Game data object
 */
function extractGameData(gameRow, dateStr) {
  try {
    console.log('ESPN Calendar Link: Extracting game data for row:', gameRow);
    console.log('ESPN Calendar Link: Date string:', dateStr);

    // Extract time
    const timeElement = findTimeElement(gameRow);
    console.log('ESPN Calendar Link: Found time element:', timeElement);

    const timeStr = timeElement ? timeElement.textContent.trim() : null;
    console.log('ESPN Calendar Link: Time string:', timeStr);

    if (!timeStr || timeStr === 'TBD' || timeStr.match(/final|postponed/i)) {
      console.log('ESPN Calendar Link: Skipping - invalid time:', timeStr);
      return null; // Skip games without valid times
    }

    // Extract team names
    const allTeamLinks = gameRow.querySelectorAll('a[href*="/team/"]');
    console.log('ESPN Calendar Link: Found all team links:', allTeamLinks.length, allTeamLinks);

    // Filter out logo-only links (they contain only <img> tags, no text)
    const teamNameLinks = Array.from(allTeamLinks).filter(link => {
      // Check if link has text content (not just an image)
      const hasText = link.textContent.trim().length > 0;
      const hasOnlyImage = link.querySelector('img') && !hasText;
      return !hasOnlyImage;
    });

    console.log('ESPN Calendar Link: Filtered to name links:', teamNameLinks.length, teamNameLinks);

    if (teamNameLinks.length < 2) {
      console.warn('ESPN Calendar Link: Could not find both team name links - only found', teamNameLinks.length, gameRow);
      console.log('ESPN Calendar Link: Row HTML:', gameRow.innerHTML);
      return null;
    }

    // Debug logging
    console.log('ESPN Calendar Link: Team name link 0 HTML:', teamNameLinks[0].outerHTML);
    console.log('ESPN Calendar Link: Team name link 1 HTML:', teamNameLinks[1].outerHTML);

    // Try multiple methods to extract team names
    const awayTeam = extractTeamName(teamNameLinks[0]);
    const homeTeam = extractTeamName(teamNameLinks[1]);

    console.log('ESPN Calendar Link: Extracted teams:', awayTeam, '@', homeTeam);

    if (!awayTeam || !homeTeam) {
      console.warn('ESPN Calendar Link: Failed to extract team names', awayTeam, homeTeam);
      return null;
    }

    // Extract TV network
    const tvElement = findTVElement(gameRow);
    const tvNetwork = tvElement ? tvElement.textContent.trim() : '';

    console.log('ESPN Calendar Link: TV element found:', tvElement);
    console.log('ESPN Calendar Link: TV network:', tvNetwork);

    // Extract location (if available)
    const locationElement = gameRow.querySelector('[class*="location"], [class*="Location"]');
    const location = locationElement ? locationElement.textContent.trim() : '';

    // Parse date and time
    const startTime = parseESPNDateTime(dateStr, timeStr);
    if (!startTime) {
      return null;
    }

    // Calculate end time based on sport
    const sport = detectSport();
    const duration = getEventDuration(sport);
    const endTime = calculateEndTime(startTime, duration);

    // Format event data
    const title = formatEventTitle(awayTeam, homeTeam, tvNetwork);
    const description = ''; // Empty description

    console.log('ESPN Calendar Link: Final event data:', { title, description, startTime, endTime });

    return {
      title,
      startTime,
      endTime,
      description,
      location
    };
  } catch (error) {
    console.error('ESPN Calendar Link: Error extracting game data', error);
    console.error('ESPN Calendar Link: Stack trace:', error.stack);
    console.error('ESPN Calendar Link: Failed on row:', gameRow);
    return null;
  }
}

/**
 * Inject calendar button for a specific KenPom game
 * @param {HTMLElement} gameRow - Game row element
 * @param {string} dateStr - Date string for this game
 */
function injectButtonForGameKenPom(gameRow, dateStr) {
  // Generate unique ID for this game
  const gameId = extractGameIdKenPom(gameRow);
  if (!gameId) {
    console.warn('ESPN Calendar Link: Could not extract KenPom game ID', gameRow);
    return;
  }

  // Skip if already processed
  if (processedGames.has(gameId)) {
    return;
  }

  // Extract game data
  const gameData = extractGameDataKenPom(gameRow, dateStr);
  if (!gameData) {
    console.warn('ESPN Calendar Link: Could not extract KenPom game data', gameRow);
    return;
  }

  // Find time element to inject button next to
  const timeElement = findTimeElementKenPom(gameRow);
  if (!timeElement) {
    console.warn('ESPN Calendar Link: Could not find KenPom time element', gameRow);
    return;
  }

  // Create and inject button
  const button = createCalendarButton(gameData);
  insertButtonNextToTime(button, timeElement);

  // Mark as processed
  processedGames.add(gameId);
}

/**
 * Extract game ID from KenPom row
 * @param {HTMLElement} gameRow - Game row element
 * @returns {string|null} Game ID
 */
function extractGameIdKenPom(gameRow) {
  const link = gameRow.querySelector('a[href*="gameprep.php"]');
  if (link) {
    const match = link.href.match(/gameprep\.php\?g=(\d+)/);
    return match ? 'kenpom-' + match[1] : null;
  }
  return null;
}

/**
 * Extract all game data from a KenPom row
 * @param {HTMLElement} gameRow - Game row element
 * @param {string} dateStr - Date string
 * @returns {Object|null} Game data object
 */
function extractGameDataKenPom(gameRow, dateStr) {
  try {
    console.log('ESPN Calendar Link: Extracting KenPom game data for row:', gameRow);
    console.log('ESPN Calendar Link: Date string:', dateStr);

    // Extract time
    const timeElement = findTimeElementKenPom(gameRow);
    const timeStr = timeElement ? timeElement.textContent.trim() : null;
    console.log('ESPN Calendar Link: KenPom time string:', timeStr);

    if (!timeStr || timeStr === 'TBD') {
      console.log('ESPN Calendar Link: Skipping KenPom - invalid time:', timeStr);
      return null;
    }

    // Extract team names - KenPom has links like: <a href="team.php?team=Florida">Florida</a>
    const teamLinks = gameRow.querySelectorAll('a[href*="team.php"]');
    console.log('ESPN Calendar Link: Found KenPom team links:', teamLinks.length);

    if (teamLinks.length < 2) {
      console.warn('ESPN Calendar Link: Could not find both KenPom team links', gameRow);
      return null;
    }

    // Get the row text to determine home/away (look for "vs" or "at")
    const rowText = gameRow.textContent;
    const isHomeGame = rowText.includes(' vs ');
    const isAwayGame = rowText.includes(' at ');

    let awayTeam, homeTeam;

    if (isHomeGame) {
      // Format: "Team1 vs Team2" means Team1 is home
      homeTeam = teamLinks[0].textContent.trim();
      awayTeam = teamLinks[1].textContent.trim();
    } else if (isAwayGame) {
      // Format: "Team1 at Team2" means Team2 is home
      awayTeam = teamLinks[0].textContent.trim();
      homeTeam = teamLinks[1].textContent.trim();
    } else {
      // Default: first team is away, second is home
      awayTeam = teamLinks[0].textContent.trim();
      homeTeam = teamLinks[1].textContent.trim();
    }

    console.log('ESPN Calendar Link: KenPom teams:', awayTeam, '@', homeTeam);

    if (!awayTeam || !homeTeam) {
      console.warn('ESPN Calendar Link: Failed to extract KenPom team names');
      return null;
    }

    // Extract TV network from seed-gray-block span
    let tvNetwork = '';
    const tvBlock = gameRow.querySelector('span.seed-gray-block');
    if (tvBlock) {
      // Check if there's a link inside with TV network
      const tvLink = tvBlock.querySelector('a');
      if (tvLink) {
        tvNetwork = tvLink.textContent.trim();
      } else {
        tvNetwork = tvBlock.textContent.trim();
      }
    }
    console.log('ESPN Calendar Link: KenPom TV network:', tvNetwork);

    // Parse date and time
    const startTime = parseESPNDateTime(dateStr, timeStr);
    if (!startTime) {
      return null;
    }

    // Calculate end time - KenPom is basketball, so 2 hours
    const duration = 2;
    const endTime = calculateEndTime(startTime, duration);

    // Format event data
    const title = formatEventTitle(awayTeam, homeTeam, tvNetwork);
    const description = '';

    console.log('ESPN Calendar Link: Final KenPom event data:', { title, description, startTime, endTime });

    return {
      title,
      startTime,
      endTime,
      description,
      location: ''
    };
  } catch (error) {
    console.error('ESPN Calendar Link: Error extracting KenPom game data', error);
    console.error('ESPN Calendar Link: Stack trace:', error.stack);
    return null;
  }
}

/**
 * Find time element in KenPom game row
 * @param {HTMLElement} gameRow - Game row element
 * @returns {HTMLElement|null} Time element
 */
function findTimeElementKenPom(gameRow) {
  // Look for gameprep.php link which contains the time
  const timeLink = gameRow.querySelector('a[href*="gameprep.php"]');
  if (timeLink) {
    return timeLink;
  }
  return null;
}

/**
 * Find time element in game row
 * @param {HTMLElement} gameRow - Game row element
 * @returns {HTMLElement|null} Time element
 */
function findTimeElement(gameRow) {
  // Look for time element - usually a link or span containing time
  const timeLink = gameRow.querySelector('a[href*="/gameId/"]');
  if (timeLink && timeLink.textContent.match(/\d+:\d+/)) {
    return timeLink;
  }

  // Try to find any element with time pattern
  const allElements = gameRow.querySelectorAll('span, div, td, a');
  for (const el of allElements) {
    const text = el.textContent.trim();
    if (text.match(/^\d+:\d+\s*(AM|PM|ET|CT|MT|PT)?$/i)) {
      return el;
    }
  }

  return null;
}

/**
 * Find TV network element in game row
 * @param {HTMLElement} gameRow - Game row element
 * @returns {HTMLElement|null} TV element
 */
function findTVElement(gameRow) {
  // Strategy 1: Look for broadcast column with network-name class
  const networkNameElements = gameRow.querySelectorAll('.network-name');
  if (networkNameElements.length > 0) {
    // Collect all network names
    const networks = Array.from(networkNameElements).map(el => el.textContent.trim());
    console.log('ESPN Calendar Link: Found networks via .network-name:', networks);

    // Create a fake element to return with combined text
    const combined = document.createElement('span');
    combined.textContent = networks.join('/');
    return combined;
  }

  // Strategy 2: Look for ESPN logo images with alt text
  const broadcastCol = gameRow.querySelector('.broadcast__col, td.broadcast__col');
  if (broadcastCol) {
    const img = broadcastCol.querySelector('img[alt]');
    if (img && img.alt) {
      console.log('ESPN Calendar Link: Found network via image alt:', img.alt);
      const fakeEl = document.createElement('span');
      fakeEl.textContent = img.alt;
      return fakeEl;
    }
  }

  // Strategy 3: Look for network-container
  const networkContainer = gameRow.querySelector('.network-container');
  if (networkContainer) {
    const text = networkContainer.textContent.trim();
    if (text) {
      console.log('ESPN Calendar Link: Found network via container:', text);
      const fakeEl = document.createElement('span');
      fakeEl.textContent = text;
      return fakeEl;
    }
  }

  console.log('ESPN Calendar Link: No TV element found in row');
  return null;
}

/**
 * Create calendar button element
 * @param {Object} gameData - Game data object
 * @returns {HTMLElement} Button element
 */
function createCalendarButton(gameData) {
  const button = document.createElement('button');
  button.className = 'espn-cal-link-button';
  button.textContent = '📅 Add to Calendar';
  button.title = 'Add this game to Google Calendar';

  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const calendarURL = buildGoogleCalendarURL(gameData);

    // Open in a smaller popup window
    const windowWidth = 800;
    const windowHeight = 700;
    const left = (screen.width - windowWidth) / 2;
    const top = (screen.height - windowHeight) / 2;

    const windowFeatures = `width=${windowWidth},height=${windowHeight},left=${left},top=${top},scrollbars=yes,resizable=yes`;

    window.open(calendarURL, 'googleCalendarPopup', windowFeatures);
  });

  return button;
}

/**
 * Insert button next to time element
 * @param {HTMLElement} button - Button element
 * @param {HTMLElement} timeElement - Time element
 */
function insertButtonNextToTime(button, timeElement) {
  // If time is in a table cell, insert in the same cell
  const cell = timeElement.closest('td');
  if (cell) {
    // Create a wrapper to keep time and button together
    const wrapper = document.createElement('div');
    wrapper.className = 'espn-cal-link-time-wrapper';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.gap = '8px';

    // Move time element content to wrapper
    const timeText = timeElement.cloneNode(true);
    wrapper.appendChild(timeText);
    wrapper.appendChild(button);

    // Replace time element with wrapper
    timeElement.replaceWith(wrapper);
  } else {
    // Insert after time element
    timeElement.after(button);
  }
}

/**
 * Observe page changes for dynamically loaded content
 */
function observePageChanges() {
  const observer = new MutationObserver((mutations) => {
    // Debounce to avoid excessive processing
    clearTimeout(observePageChanges.timeout);
    observePageChanges.timeout = setTimeout(() => {
      injectCalendarButtons();
    }, 500);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
