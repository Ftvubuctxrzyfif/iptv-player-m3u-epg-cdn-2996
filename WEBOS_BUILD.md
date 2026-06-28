# IPTV Player - LG webOS TV App

## Build Instructions

### Prerequisites
- Node.js (v18 or higher)
- LG webOS TV SDK
- LG webOS TV CLI (npm install -g @webosose/ares-cli)
- A connected LG webOS TV (or webOS TV simulator)

### Build Process

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Create Icon Files:**
   Convert `icon-80.svg` to PNG format:
   - `icon-80.png` (80x80 pixels)
   - `icon-130.png` (130x130 pixels)
   
   You can use online SVG to PNG converters or tools like ImageMagick:
   ```bash
   convert icon-80.svg -resize 80x80 icon-80.png
   convert icon-80.svg -resize 130x130 icon-130.png
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
   Make sure your TV is in developer mode and connected to the same network.
   ```bash
   npm run webos:install
   ```

6. **Launch on TV:**
   ```bash
   npm run webos:launch
   ```

### Remote Control Navigation

The app is optimized for TV remote control:
- **Arrow Keys**: Navigate between buttons and menu items
- **Enter/OK**: Select focused item
- **Back**: Return to previous screen or close dialogs
- **Escape**: Alternative back button

### TV-Specific Features

- **Large Touch Targets**: All buttons are sized for easy selection
- **Visual Focus Indicators**: Clear focus states with blue rings
- **HLS.js Streaming**: Optimized for webOS TV native HLS support
- **Responsive Design**: Works on various TV screen sizes
- **No Touch Required**: Fully functional with remote control only

### Troubleshooting

**App won't install:**
- Enable Developer Mode on your TV
- Connect TV to same network as your computer
- Check if TV's IP is `localhost` (use `ares-setup-device` to configure)

**Streaming issues:**
- Check your internet connection
- Verify the stream URL is accessible
- Some streams may not support webOS TV

**Navigation issues:**
- Make sure the app has focus
- Use arrow keys to navigate
- Press Enter to select focused items

### Testing on Simulator

If you don't have a webOS TV, you can test using the webOS TV simulator:

1. Install webOS TV SDK
2. Open webOS TV Simulator
3. Use `ares-setup-device` to configure the simulator
4. Follow steps 3-6 from build process

### Performance Tips

- Use wired network connection for best streaming quality
- Close other apps running on the TV
- Keep stream URLs reliable and well-maintained
- Test different quality settings if available