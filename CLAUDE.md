# Claude AI Assistant Instructions

## Project Overview

This repository contains a Chrome browser extension called "ESPN Calendar Link" that enhances ESPN sports schedule pages by adding "Add to Calendar" functionality.

## Core Functionality

### What This Extension Does
1. **Content Injection**: Injects "Add to Calendar" buttons into ESPN sports schedule pages
2. **Data Extraction**: Parses game/event information from the ESPN page DOM including:
   - Team names or event title
   - Date and time
   - Venue/location
   - Sport type
   - Additional event details
3. **URL Generation**: Constructs Google Calendar event URLs using the format:
   ```
   https://calendar.google.com/calendar/render?action=TEMPLATE&text=EVENT_TITLE&dates=START_TIME/END_TIME&details=DESCRIPTION&location=LOCATION
   ```
4. **Calendar Integration**: Opens Google Calendar in a new tab with the event pre-populated

## Technical Architecture

### Chrome Extension Components
- **manifest.json**: Extension configuration and permissions
  - Required permissions: `activeTab`, content script access to `*.espn.com/*`
  - Manifest V3 (use service workers, not background pages)
- **content.js**: Content script that runs on ESPN pages
  - DOM manipulation to add buttons
  - Event parsing and extraction logic
- **background.js** (optional): Service worker for background tasks
- **popup/**: Extension popup UI (optional)
- **utils/**: Helper functions for URL building and date formatting

### Key Technologies
- Vanilla JavaScript (or specify if using a framework)
- Chrome Extension APIs (Manifest V3)
- DOM manipulation and MutationObserver for dynamic content
- Google Calendar URL scheme

## Development Guidelines

### When Working on This Project

1. **ESPN Page Compatibility**
   - Test across different sport types (NFL, NBA, MLB, NHL, soccer, etc.)
   - ESPN uses React/dynamic loading - use MutationObserver to detect content changes
   - Handle both desktop and mobile ESPN layouts
   - Be mindful of ESPN's page structure changes

2. **Date/Time Handling**
   - ESPN displays times in user's local timezone
   - Google Calendar URLs require ISO 8601 format: `YYYYMMDDTHHmmssZ`
   - Handle timezone conversions correctly
   - Default event duration to 3 hours for most sports if end time not available

3. **URL Construction**
   - URL-encode all parameters
   - Google Calendar URL format: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=...&dates=...&details=...&location=...`
   - Required parameters: `action=TEMPLATE`, `text`, `dates`
   - Optional but recommended: `details`, `location`, `ctz` (timezone)

4. **Error Handling**
   - Gracefully handle missing or malformed data
   - Don't break ESPN's page functionality
   - Log errors to console for debugging
   - Provide user feedback if calendar link can't be generated

5. **Performance**
   - Minimize DOM queries
   - Use event delegation where possible
   - Don't block ESPN's page load
   - Clean up event listeners and observers when appropriate

### Code Style
- Use modern JavaScript (ES6+)
- Clear variable and function names
- Comment complex logic, especially date/time parsing
- Follow Chrome Extension best practices for Manifest V3

### Testing Checklist
- [ ] Extension loads without errors
- [ ] Buttons appear on schedule pages
- [ ] Click button opens Google Calendar
- [ ] Event details are correctly populated
- [ ] Date and time are accurate
- [ ] Works across different sports
- [ ] Handles edge cases (TBD times, postponed games, etc.)
- [ ] No conflicts with ESPN's existing functionality

## External Documentation

### Important Resources
- **Google Calendar URL Scheme**: https://github.com/InteractionDesignFoundation/add-event-to-calendar-docs/blob/main/services/google.md
- **Chrome Extensions Documentation**: https://developer.chrome.com/docs/extensions/
- **Chrome Manifest V3**: https://developer.chrome.com/docs/extensions/mv3/intro/
- **ESPN DOM structure**: Inspect live pages (structure may change frequently)

### Sleeper API Documentation
- If incorporating additional sports data, consult: https://docs.sleeper.com/

## Common Tasks

### Adding a New Feature
1. Plan the feature and discuss approach if complex
2. Update manifest.json if new permissions needed
3. Implement in appropriate file (content.js, background.js, etc.)
4. Test on multiple ESPN pages and sports
5. Update README.md with new functionality
6. Consider backwards compatibility

### Debugging Issues
1. Check browser console for JavaScript errors
2. Inspect the ESPN page DOM structure
3. Verify manifest.json permissions
4. Test URL generation manually
5. Check Chrome extension service worker console

### Updating for ESPN Changes
1. Identify what changed in ESPN's layout/structure
2. Update selectors and parsing logic
3. Test across multiple sports/pages
4. Document the change for future reference

## Known Considerations

- ESPN frequently updates their website structure
- Different sports may have different page layouts
- Some events may not have complete information (TBD times, etc.)
- ESPN uses single-page application patterns (React/SPA)
- User timezone detection is crucial for accurate calendar events

## Best Practices

- Keep the extension lightweight and fast
- Don't interfere with ESPN's core functionality
- Respect user privacy - no data collection
- Handle errors gracefully
- Provide clear user feedback
- Keep code maintainable and well-documented
