# Sports Calendar Link

A Chrome browser extension that adds an "Add to Calendar" button to sports schedule pages, making it easy to add games and events directly to your Google Calendar.

## Supported Sites

- **ESPN** - All sports schedule pages (NFL, NBA, MLB, College Basketball, etc.)
- **KenPom** - College basketball fanmatch pages

## Features

- Seamlessly integrates with ESPN and KenPom schedule pages
- One-click "Add to Calendar" button for any game or event
- Automatically generates Google Calendar event links with:
  - Event title in "Away @ Home (TV Network)" format
  - Date and time
  - Sport-specific event durations
  - TV/streaming network information
- Opens Google Calendar in a popup window with the event pre-populated and ready to save

## Installation

### From Chrome Web Store
_Coming soon_

### Manual Installation (Development)
1. Clone this repository:
   ```bash
   git clone https://github.com/ni3t/espn-cal-link.git
   cd espn-cal-link
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" using the toggle in the top right corner

4. Click "Load unpacked" and select the extension directory

5. The Sports Calendar Link extension should now appear in your extensions list

## Usage

1. Navigate to any supported sports schedule page:
   - **ESPN**: Any sports schedule (e.g., `espn.com/nba/schedule`)
   - **KenPom**: Fanmatch page (e.g., `kenpom.com/fanmatch.php?d=2025-11-03`)
2. Look for the "📅 Add to Calendar" button next to scheduled games
3. Click the button to open Google Calendar with the event details pre-populated
4. Review the event details and click "Save" in Google Calendar to add it to your calendar

## How It Works

The extension:
1. Detects when you're viewing a supported schedule page (ESPN or KenPom)
2. Injects "Add to Calendar" buttons next to game time listings
3. Extracts game information (teams, date, time, TV network) from the page
4. Determines home/away teams and formats title as "Away @ Home (TV Network)"
5. Constructs a Google Calendar URL using the [Google Calendar URL scheme](https://github.com/InteractionDesignFoundation/add-event-to-calendar-docs/blob/main/services/google.md)
6. Opens the URL in a popup window when you click the button

## Development

### Prerequisites
- Google Chrome or Chromium-based browser
- Basic knowledge of JavaScript, HTML, and CSS
- Familiarity with Chrome Extension APIs

### Project Structure
```
espn-cal-link/
├── manifest.json       # Extension configuration
├── content.js          # Content script for ESPN pages
├── background.js       # Background service worker
├── popup/              # Extension popup UI
├── icons/              # Extension icons
└── utils/              # Helper functions
```

### Building and Testing
1. Make your changes to the extension files
2. Reload the extension in `chrome://extensions/` by clicking the refresh icon
3. Navigate to an ESPN schedule page and test your changes
4. Check the browser console for any errors or debugging output

### Debugging
- Use Chrome DevTools to inspect the ESPN page and debug content scripts
- Check the extension's background page console: `chrome://extensions/` → Details → "Inspect views: background page"

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Privacy

This extension:
- Only runs on ESPN.com and KenPom.com domains
- Does not collect or transmit any personal data
- Does not require any special permissions beyond basic content script access
- All processing happens locally in your browser

## License

MIT License - see LICENSE file for details

## Acknowledgments

- ESPN for providing comprehensive sports schedules
- KenPom for college basketball analytics and schedules
- Google Calendar for the calendar URL scheme
- Chrome Extensions documentation and community

## Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check existing issues for similar problems
- Include your browser version and steps to reproduce any bugs
