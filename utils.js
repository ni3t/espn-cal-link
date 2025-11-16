/**
 * Utility functions for ESPN Calendar Link extension
 */

/**
 * Sport duration mapping (in hours)
 */
const SPORT_DURATIONS = {
  'football': 3.5,        // NFL, College Football
  'nfl': 3.5,
  'college-football': 3.5,
  'basketball': 2,        // NBA, College Basketball
  'nba': 2,
  'mens-college-basketball': 2,
  'womens-college-basketball': 2,
  'wnba': 2,
  'baseball': 3,          // MLB, College Baseball
  'mlb': 3,
  'college-baseball': 3,
  'hockey': 2.5,          // NHL, College Hockey
  'nhl': 2.5,
  'college-hockey': 2.5,
  'soccer': 2,            // MLS, International
  'mls': 2,
  'golf': 4,
  'tennis': 3,
  'racing': 3,
  'default': 3
};

/**
 * Sport emoji mapping
 */
const SPORT_EMOJIS = {
  'football': '🏈',
  'nfl': '🏈',
  'college-football': '🏈',
  'basketball': '🏀',
  'nba': '🏀',
  'mens-college-basketball': '🏀',
  'womens-college-basketball': '🏀',
  'wnba': '🏀',
  'baseball': '⚾',
  'mlb': '⚾',
  'college-baseball': '⚾',
  'hockey': '🏒',
  'nhl': '🏒',
  'college-hockey': '🏒',
  'soccer': '⚽',
  'mls': '⚽',
  'golf': '⛳',
  'tennis': '🎾',
  'racing': '🏁',
  'default': '🏆'
};

/**
 * Detect sport from current URL
 * @returns {string} Sport identifier
 */
function detectSport() {
  const url = window.location.href;
  const pathParts = url.split('/').filter(part => part.length > 0);

  // Find sport in URL path (e.g., /nfl/schedule or /mens-college-basketball/schedule)
  for (const part of pathParts) {
    if (SPORT_DURATIONS.hasOwnProperty(part)) {
      return part;
    }
  }

  return 'default';
}

/**
 * Get event duration based on sport
 * @param {string} sport - Sport identifier
 * @returns {number} Duration in hours
 */
function getEventDuration(sport) {
  return SPORT_DURATIONS[sport] || SPORT_DURATIONS['default'];
}

/**
 * Get emoji for a sport
 * @param {string} sport - Sport identifier
 * @returns {string} Emoji character
 */
function getSportEmoji(sport) {
  return SPORT_EMOJIS[sport] || SPORT_EMOJIS['default'];
}

/**
 * Parse ESPN date and time into a Date object
 * @param {string} dateStr - Date string (e.g., "Monday, November 3, 2025")
 * @param {string} timeStr - Time string (e.g., "6:30 PM" or "7:00 PM ET")
 * @returns {Date|null} Date object or null if parsing fails
 */
function parseESPNDateTime(dateStr, timeStr) {
  try {
    // Remove day of week and clean up date
    const cleanDate = dateStr.replace(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s*/, '');

    // Clean up time string - remove timezone abbreviations and extra whitespace
    const cleanTime = timeStr.replace(/\s*(ET|CT|MT|PT|EST|CST|MST|PST)\s*$/i, '').trim();

    // Combine date and time
    const dateTimeStr = `${cleanDate} ${cleanTime}`;

    // Parse into Date object
    const date = new Date(dateTimeStr);

    // Validate the date
    if (isNaN(date.getTime())) {
      console.error('Invalid date parsed:', dateTimeStr);
      return null;
    }

    return date;
  } catch (error) {
    console.error('Error parsing date/time:', error, dateStr, timeStr);
    return null;
  }
}

/**
 * Convert Date object to ISO 8601 format for Google Calendar
 * @param {Date} date - Date object
 * @returns {string} ISO 8601 formatted string (YYYYMMDDTHHmmss)
 */
function toGoogleCalendarFormat(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

/**
 * Calculate end time based on start time and duration
 * @param {Date} startDate - Start date
 * @param {number} durationHours - Duration in hours
 * @returns {Date} End date
 */
function calculateEndTime(startDate, durationHours) {
  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + durationHours);
  return endDate;
}

/**
 * Build Google Calendar URL
 * @param {Object} eventData - Event data object
 * @param {string} eventData.title - Event title
 * @param {Date} eventData.startTime - Start time
 * @param {Date} eventData.endTime - End time
 * @param {string} eventData.description - Event description (optional)
 * @param {string} eventData.location - Event location (optional)
 * @returns {string} Google Calendar URL
 */
function buildGoogleCalendarURL(eventData) {
  const { title, startTime, endTime, description, location } = eventData;

  const startStr = toGoogleCalendarFormat(startTime);
  const endStr = toGoogleCalendarFormat(endTime);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startStr}/${endStr}`
  });

  if (description) {
    params.append('details', description);
  }

  if (location) {
    params.append('location', location);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Format event title
 * @param {string} awayTeam - Away team name
 * @param {string} homeTeam - Home team name
 * @param {string} tvNetwork - TV network or streaming service (optional)
 * @param {string} sport - Sport identifier (optional)
 * @returns {string} Formatted title
 */
function formatEventTitle(awayTeam, homeTeam, tvNetwork, sport) {
  // Get sport emoji
  const emoji = sport ? getSportEmoji(sport) : '';
  const prefix = emoji ? `${emoji} ` : '';

  if (!tvNetwork || tvNetwork === '--') {
    return `${prefix}${awayTeam} @ ${homeTeam}`;
  }
  return `${prefix}${awayTeam} @ ${homeTeam} (${tvNetwork})`;
}

/**
 * Format event description with TV network info
 * @param {string} awayTeam - Away team name
 * @param {string} homeTeam - Home team name
 * @param {string} tvNetwork - TV network or streaming service
 * @returns {string} Formatted description
 */
function formatEventDescription(awayTeam, homeTeam, tvNetwork) {
  if (!tvNetwork || tvNetwork === '--') {
    return `${awayTeam} @ ${homeTeam}`;
  }
  return `${awayTeam} @ ${homeTeam} (${tvNetwork})`;
}

/**
 * Extract game data from a game row element
 * @param {HTMLElement} gameRow - The game row element
 * @param {string} dateStr - The date string from the date header
 * @returns {Object|null} Game data object or null if extraction fails
 */
function extractGameData(gameRow, dateStr) {
  try {
    // This will be implemented in content.js based on actual DOM structure
    // Placeholder for now
    return null;
  } catch (error) {
    console.error('Error extracting game data:', error);
    return null;
  }
}
