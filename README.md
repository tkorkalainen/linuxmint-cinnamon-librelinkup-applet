# LibreLinkUp glucose level applet for Linux Mint Cinnamon

A Linux Mint Cinnamon applet that fetches your glucose level from **LibreLinkUp** and displays it on a panel.

![sreenshot](https://raw.githubusercontent.com/tkorkalainen/linuxmint-cinnamon-librelinkup-applet/refs/heads/master/docs/screenshot.png)

## Features
- Fetches near real-time glucose data from your LibreLinkUp account.
- Displays the data in a panel applet.
- Configurable update intervals.
- Customizable levels and colors for low, normal, high and very high glucose.
- Trend arrow.

## Installation

1. Navigate to `~/.local/share/cinnamon/applets`:
```bash
cd ~/.local/share/cinnamon/applets
```

2. Create new directory `librelinkup@tkorkalainen`:
```bash
mkdir librelinkup@tkorkalainen
cd librelinkup@tkorkalainen
```

3. Clone the repository:
```bash
git clone https://github.com/your-username/librelinkup-widget.git .
```

4. Restart Cinnamon:
- Press Windows/Super + L to start Melange.
- Select Actions --> Restart Cinnamon

5. Configure applet:
- Start Applets application and configure LibreLinkUp applet. 

## Disclaimer

This applet is not a medical device. Use it for informational purposes only and consult a healthcare professional for medical advice.
