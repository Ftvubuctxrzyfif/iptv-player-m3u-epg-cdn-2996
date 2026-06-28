# IPTV Player - LG webOS TV Application

## Overview
This is an LG webOS TV application for streaming IPTV channels. It's been converted from an Android app to run natively on LG webOS TVs.

## Features
- **Live TV Streaming**: HLS and direct stream support optimized for webOS TV
- **Stalker Portal Integration**: Connect to your existing IPTV portals
- **TV Remote Navigation**: Full support for LG TV remote control
- **Large UI Elements**: Optimized for TV screen viewing (10ft interface)
- **WebOS Native**: Built specifically for webOS TV platform

## Build Instructions

### Prerequisites
- Node.js (v18 or higher)
- LG webOS TV SDK
- LG webOS TV CLI tools
- LG webOS TV (or webOS TV simulator)

### Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Create Icon Files:**
   Convert the SVG icon to PNG format:
   ```bash
   # You'll need to convert icon-80.svg to PNG files
   # icon-80.png (80x80 pixels)
   # icon-130.png (130x130 pixels)
   ```

3. **Build the Application:**
   ```bash
   npm run build
   ```

4. **Package for webOS TV:**
   ```bash
   npm run webos:build
   ```
   This creates an `.ipk` file in the project directory.

5. **Install on TV:**
   - Enable Developer Mode on your LG webOS TV
   - Connect TV to same network as your development machine
   - Install the package:
   ```bash
   npm run webos:install
   ```

6. **Launch on TV:**
   ```bash
   npm run webos:launch
   ```

## TV Remote Control Navigation

The app is optimized for TV remote control:

- **Arrow Keys**: Navigate between buttons and menu items  
- **Enter/OK**: Select focused item
- **Back**: Return to previous screen or close dialogs
- **Escape**: Alternative back button

## TV-Specific Optimizations

- **Large Touch Targets**: All buttons sized for easy selection with remote
- **Visual Focus Indicators**: Clear focus states with blue rings
- **HLS.js Streaming**: Optimized for webOS TV native HLS support
- **Responsive Design**: Works on various TV screen sizes
- **No Touch Required**: Fully functional with remote control only

## Project Structure

```
/app/
├── appinfo.json          # webOS TV app manifest
├── package.json          # Dependencies and build scripts
├── WEBOS_BUILD.md        # Detailed build instructions
├── public/               # Static assets and icons
├── src/
│   ├── components/       # React components
│   │   ├── VideoPlayer.tsx    # TV-optimized video player
│   │   ├── IptvChannelList.tsx
│   │   └── PortalConfig.tsx
│   ├── pages/            # Main application pages
│   ├── hooks/            # Custom React hooks
│   │   └── use-tv-navigation.ts  # TV remote control handler
│   └── lib/              # Utilities and shared code
```

## Technical Details

### Video Streaming
- HLS.js for adaptive streaming
- Native webOS TV media support
- Optimized buffering for TV streaming
- Error handling and recovery

### TV Navigation System
- Custom hook for remote control handling
- Focus management system
- Visual feedback for navigation
- Support for all webOS TV remote buttons

### UI Components
- React with TypeScript
- Tailwind CSS for styling
- shadcn/ui component library
- TV-optimized sizing and spacing

## Troubleshooting

### Build Issues
- Ensure all dependencies are installed
- Check Node.js version compatibility
- Verify webOS TV CLI tools are installed

### Streaming Issues
- Check internet connection
- Verify stream URL accessibility
- Some streams may not support webOS TV

### Navigation Issues
- Make sure app has focus
- Use arrow keys to navigate
- Press Enter to select focused items

### Testing on Simulator
1. Install webOS TV SDK
2. Open webOS TV Simulator  
3. Use `ares-setup-device` to configure
4. Follow build steps 3-6 above

## Performance Tips

- Use wired network connection for best streaming quality
- Close other apps running on the TV
- Keep stream URLs reliable and well-maintained
- Test different quality settings if available

## Credits

- Converted from Android Capacitor app to webOS TV
- Original IPTV Player application
- Built with React, TypeScript, and webOS TV SDK

## License

This is a private project. Contact the owner for licensing information.