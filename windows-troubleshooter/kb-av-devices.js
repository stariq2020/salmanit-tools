/* Troubleshooting flows: Audio & video (4 flows) and Devices (5 flows) */
(function (root) {
  'use strict';
  var KB = root.WT_KB, V = KB.V, F = KB.flows;
  var MS_AUDIO = { label: 'Fix sound or audio problems in Windows (Microsoft)', url: 'https://support.microsoft.com/windows/fix-sound-or-audio-problems-in-windows-73025246-b61c-40fb-671a-2535c7cd56c8' };

  /* ---------------- AUDIO & VIDEO ---------------- */
  F.push({
    id: 'no-sound', title: 'No sound from speakers', cat: 'av',
    blurb: 'Nothing comes out of the speakers or headphones.',
    symptoms: ['Red X on the volume icon', 'Video plays but silent', '"No audio output device is installed"', 'Sound works in some apps only'],
    keywords: ['no sound', 'no audio', 'sound not working', 'audio not working', 'speakers not working', 'speaker not working', 'cant hear anything', 'cannot hear', 'no sound from speakers', 'sound stopped working', 'no sound from laptop', 'headphones not working', 'volume not working', 'no audio output device', 'red x on volume', 'sound is gone', 'muted', 'sound missing', 'no sound on youtube', 'no sound in teams', 'audio stopped'],
    versions: ['10', '11'], difficulty: 'Easy', time: '10–25 min', risk: 'Low', admin: false,
    prereq: 'Speakers or headphones connected and powered (if they need power).',
    expected: 'Sound plays through the right device.',
    ms: MS_AUDIO,
    questions: [
      { id: 'device', text: 'What are you using for sound?', options: [
        { v: 'builtin', label: 'Built-in laptop or monitor speakers', m: ['laptop speakers', 'built in', 'built-in', 'internal speakers'] },
        { v: 'wired', label: 'Wired speakers or headphones', m: ['wired', 'headphones', 'jack', 'earphones', '3.5mm'] },
        { v: 'usb-bt', label: 'USB or Bluetooth speakers/headset', m: ['bluetooth', 'usb', 'headset', 'airpods', 'wireless'] }] },
      { id: 'scope', text: 'Is it silent everywhere or only in one app?', options: [
        { v: 'all', label: 'Everywhere', m: ['everything', 'no sound at all', 'all apps'] },
        { v: 'one', label: 'Only one app or website', m: ['only in', 'just in', 'one app', 'youtube only', 'teams only', 'only one'] }] }],
    branches: [
      { when: { scope: 'one' }, causes: ['The app\'s own volume is low or muted', 'The app uses a different output device'], steps: ['snd-mixer', 'snd-default', 'sh-restart'] },
      { when: { device: 'usb-bt' }, causes: ['Windows is sending sound to a different device', 'The Bluetooth or USB device is not the default output'], steps: ['snd-basic', 'snd-default', 'snd-troubleshooter', 'sh-restart', 'sh-driver'] },
      { causes: ['Muted or wrong output selected', 'A driver or service problem'], steps: ['snd-basic', 'snd-default', 'snd-troubleshooter', 'sh-restart', 'sh-driver', 'sh-updates'] }
    ],
    escalation: 'If the PC shows no audio device at all after a driver reinstall, or the speakers do not work on another PC, the hardware may be faulty. A technician can test the audio chip or speakers.',
    steps: {
      'snd-basic': { title: 'Check volume, mute and cables', why: 'The most common cause is simply muted sound, a turned-down volume or a loose plug.', i: ['Press the volume-up key on your keyboard and look at the on-screen volume.', 'Click the speaker icon near the clock and make sure the main volume slider is up and the speaker is not crossed out.', 'Check that wired speakers are plugged into the green (output) socket and that powered speakers are switched on.', 'Play something to test. Try headphones in the same socket to see whether the socket works.'], time: '3 min', diff: 'Easy', result: 'Sound returns.', fail: 'If the volume is fine, continue.' },
      'snd-mixer': { title: 'Check volume for the specific app', why: 'Windows keeps a separate volume for each app. One can be muted while others are not.', i: V(['Right-click the speaker icon near the clock and choose **Open Volume mixer**.', 'Check the volume bar for the app. Raise it if low and unmute if needed.', 'Inside the app itself (for example YouTube or a meeting app), check its own volume and mute buttons.'], ['Right-click the speaker icon near the clock and choose **Open Volume Mixer**.', 'Check the volume bar for the app. Raise it if low and unmute if needed.', 'Inside the app itself, check its own volume and mute buttons.']), time: '3 min', diff: 'Easy', result: 'The app plays sound.', fail: 'If it is silent in this app only, continue.' },
      'snd-default': { title: 'Choose the correct output device', why: 'Windows may be sending sound to a monitor, a Bluetooth device you disconnected, or a virtual device.', i: V(['Click the speaker icon near the clock, then the arrow ">" next to the volume slider (or open **Settings** > **System** > **Sound**).', 'Under **Output**, choose the device you actually want (for example **Speakers** or your headphones).', 'Play some sound and check the volume meter bounces.'], ['Right-click the speaker icon near the clock and choose **Open Sound settings**.', 'Under **Output**, choose the device you actually want from the drop-down.', 'Play some sound and check the volume meter bounces.']), time: '5 min', diff: 'Easy', result: 'Sound plays through the chosen device.', fail: 'If the device is not listed, continue to the troubleshooter and drivers.' },
      'snd-troubleshooter': { title: 'Run the audio troubleshooter', why: 'Windows can check for disabled devices, wrong formats and stopped audio services.', i: V(['Open **Settings** > **System** > **Sound**.', 'Scroll to **Advanced** and select **Troubleshoot common sound problems** (or **Settings** > **System** > **Troubleshoot** > **Other troubleshooters** > **Audio** > **Run**).', 'Choose the device that has no sound and follow the prompts.'], ['Open **Settings** > **Update & Security** > **Troubleshoot** > **Additional troubleshooters**.', 'Select **Playing Audio** > **Run the troubleshooter**.', 'Choose the device that has no sound and follow the prompts.']), time: '5 min', diff: 'Easy', result: 'The troubleshooter fixes a setting.', fail: 'If it finds nothing, continue.' }
    }
  });

  F.push({
    id: 'mic-not-working', title: 'Microphone not working', cat: 'av',
    blurb: 'People cannot hear you, or the microphone does not show any level.',
    symptoms: ['No input level when speaking', 'Others cannot hear you in meetings', '"We can\'t access your microphone"', 'No microphone device listed'],
    keywords: ['microphone not working', 'mic not working', 'mic not picking up', 'cant hear me', 'cannot hear me', 'people cant hear me', 'no mic', 'microphone not detected', 'microphone muted', 'mic muted', 'mic not detected', 'microphone not recognised', 'my mic doesnt work', 'microphone stopped working', 'no microphone input', 'microphone too quiet', 'headset mic not working', 'microphone privacy', 'microphone blocked', 'recording not working'],
    versions: ['10', '11'], difficulty: 'Easy', time: '10–20 min', risk: 'Low', admin: false,
    prereq: 'The microphone or headset is plugged in or paired.',
    expected: 'The microphone level moves when you speak.',
    ms: { label: 'Fix microphone problems (Microsoft)', url: 'https://support.microsoft.com/windows/fix-microphone-problems-5f230348-106d-bfa4-1db5-336f35576011' },
    questions: [
      { id: 'which', text: 'Which microphone are you using?', options: [
        { v: 'builtin', label: 'Built-in laptop microphone', m: ['built in', 'built-in', 'laptop mic', 'laptop microphone'] },
        { v: 'headset', label: 'Wired or USB headset/microphone', m: ['headset', 'usb mic', 'wired', 'jack'] },
        { v: 'bt', label: 'Bluetooth headset/earbuds', m: ['bluetooth', 'airpods', 'earbuds', 'wireless'] }] },
      { id: 'where', text: 'Where does it fail?', options: [
        { v: 'all', label: 'In every app and the Windows settings test', m: ['every app', 'all apps', 'nowhere'] },
        { v: 'app', label: 'Only in one app (Teams, Zoom, browser…)', m: ['only in teams', 'only in zoom', 'only in chrome', 'in meetings', 'on calls', 'teams', 'zoom'] }] }],
    branches: [
      { when: { where: 'app' }, causes: ['The app is using the wrong microphone', 'The app is blocked from using the microphone', 'The microphone is muted in the app'], steps: ['mic-privacy', 'mic-app', 'sh-restart'] },
      { when: { which: 'bt' }, causes: ['Bluetooth headsets switch to low-quality call mode', 'The headset is not selected as the input device'], steps: ['mic-basic', 'mic-input', 'mic-privacy', 'sh-restart', 'sh-driver'] },
      { causes: ['Microphone muted or blocked by privacy settings', 'Wrong input device selected', 'A driver issue'], steps: ['mic-basic', 'mic-privacy', 'mic-input', 'mic-troubleshooter', 'sh-restart', 'sh-driver'] }
    ],
    escalation: 'If no microphone appears in Windows, or the same headset also fails on another PC, the hardware may be faulty. On work devices, privacy settings may be controlled by IT.',
    steps: {
      'mic-basic': { title: 'Check the physical mute and connection', why: 'Many laptops and headsets have a mute key or switch that silences the microphone completely.', i: ['Look for a microphone mute key on your keyboard (a microphone with a line through it) and a mute switch on the headset or cable. Make sure they are off.', 'Unplug and replug the headset, or turn Bluetooth headphones off and on.', 'Try a different USB port.'], time: '3 min', diff: 'Easy', result: 'The mute light goes off and the mic works.', fail: 'If the mic is not muted, continue.' },
      'mic-privacy': { title: 'Allow apps to use the microphone', why: 'Windows privacy settings can block the microphone from apps without any obvious error.', i: V(['Open **Settings** > **Privacy & security** > **Microphone**.', 'Make sure **Microphone access** is on.', 'Make sure **Let apps access your microphone** is on, and that the app you use (such as Teams) is switched on in the list.', 'Check **Let desktop apps access your microphone** too.'], ['Open **Settings** > **Privacy** > **Microphone**.', 'Make sure **Microphone access for this device** is on.', 'Make sure **Allow apps to access your microphone** is on, and that the app you use (such as Teams) is switched on in the list.', 'Check **Allow desktop apps to access your microphone** too.']), time: '5 min', diff: 'Easy', result: 'The app can use the microphone.', warn: 'On work PCs, these may be locked by policy; ask IT.', fail: 'If these were already on, continue.' },
      'mic-input': { title: 'Choose the right input and test it', why: 'Windows may be listening to a different microphone than the one you use, such as an unplugged webcam.', i: V(['Open **Settings** > **System** > **Sound**.', 'Under **Input**, choose your microphone.', 'Speak and watch the **Input volume** bar and the **Test your microphone** bar. It should move.', 'Raise the input volume if it is very low.'], ['Open **Settings** > **System** > **Sound**.', 'Under **Input**, choose your microphone from the drop-down.', 'Speak and watch the **Test your microphone** bar. It should move.', 'Select **Device properties** and raise the volume if it is very low.']), time: '5 min', diff: 'Easy', result: 'The test bar moves when you speak.', fail: 'If it does not move, continue.' },
      'mic-app': { title: 'Choose the microphone inside the app', why: 'Meeting and recording apps have their own microphone choice that overrides Windows.', i: ['Open the app\'s **Settings** and find **Audio** or **Devices**.', 'Select your microphone from the list and use the test option if there is one.', 'Check that you are not muted in the app (microphone icon without a slash).', 'Leave and rejoin the meeting.'], time: '5 min', diff: 'Easy', result: 'Others can hear you.', fail: 'If it fails only in this app, restart the app, then reinstall it from the vendor.' },
      'mic-troubleshooter': { title: 'Run the recording troubleshooter', why: 'Windows can find disabled microphones or stopped audio services.', i: V(['Open **Settings** > **System** > **Troubleshoot** > **Other troubleshooters**.', 'Next to **Recording Audio**, select **Run** and follow the prompts.'], ['Open **Settings** > **Update & Security** > **Troubleshoot** > **Additional troubleshooters**.', 'Select **Recording Audio** > **Run the troubleshooter** and follow the prompts.']), time: '5 min', diff: 'Easy', result: 'A setting is corrected.', fail: 'If nothing is found, continue.' }
    }
  });

  F.push({
    id: 'webcam-not-detected', title: 'Webcam not detected', cat: 'av',
    blurb: 'Apps say no camera found, or the camera shows a black picture.',
    symptoms: ['"We can\'t find your camera"', 'Error 0xA00F4244', 'Black or blank picture', 'No camera in Device Manager'],
    keywords: ['webcam not working', 'camera not working', 'webcam not detected', 'camera not detected', 'no camera found', 'we cant find your camera', 'camera black screen', 'webcam black', 'laptop camera not working', 'camera not showing', 'cant find camera', 'camera error', '0xa00f4244', 'camera blocked', 'camera disabled', 'integrated camera', 'camera app not working', 'video not working in teams', 'webcam missing'],
    versions: ['10', '11'], difficulty: 'Easy', time: '10–20 min', risk: 'Low', admin: false,
    prereq: 'If it is an external webcam, have it plugged in.',
    expected: 'The Camera app shows your picture.',
    ms: { label: 'Camera problems in Windows (Microsoft)', url: 'https://support.microsoft.com/en-us/windows/hardware/camera/camera-doesn-t-work-in-windows' },
    questions: [
      { id: 'type', text: 'Which camera is it?', options: [
        { v: 'built', label: 'Built-in laptop camera', m: ['built in', 'built-in', 'laptop camera', 'integrated'] },
        { v: 'usb', label: 'External USB webcam', m: ['usb', 'external', 'logitech', 'plugged in'] }] },
      { id: 'cam-app', text: 'Does the Windows Camera app show the picture?', help: 'Search for "Camera" in Start and open it.', options: [
        { v: 'works', label: 'Yes, it works there but not in another app', m: ['works in camera app'] },
        { v: 'fails', label: 'No, it fails there too', m: [] },
        { v: 'unsure', label: 'I haven\'t tried', m: [] }] }],
    branches: [
      { when: { 'cam-app': 'works' }, causes: ['The other app is not allowed to use the camera or is using a different one'], steps: ['cam-privacy', 'cam-appsel'] },
      { when: { type: 'usb' }, causes: ['The USB port, cable or driver', 'Another app already using the camera'], steps: ['cam-close-apps', 'sh-other-test', 'cam-privacy', 'sh-driver', 'cam-device-manager'] },
      { causes: ['Camera disabled by key, privacy setting or driver', 'Another app already using the camera'], steps: ['cam-close-apps', 'cam-key', 'cam-privacy', 'cam-device-manager', 'sh-driver', 'sh-restart'] }
    ],
    escalation: 'If the camera does not appear in Device Manager at all (including under "Show hidden devices"), or the same external webcam fails on another PC, the hardware or cable is probably faulty. On work PCs, camera access may be restricted by IT policy.',
    steps: {
      'cam-close-apps': { title: 'Close other apps using the camera', why: 'Only one app can use the camera at a time. A hidden meeting app can block the others.', i: ['Close Teams, Zoom, Skype, browsers with video tabs and any camera apps.', 'Press {{Ctrl + Shift + Esc}} and end any leftover tasks for those apps (carefully).', 'Open the Windows **Camera** app and test.'], time: '5 min', diff: 'Easy', result: 'The Camera app shows a picture.', fail: 'If not, continue.' },
      'cam-key': { title: 'Check for a camera shutter or function key', why: 'Many laptops have a physical shutter or a keyboard shortcut that turns the camera off.', i: ['Look above the screen for a small slider covering the lens and slide it open.', 'Look at the function key row for a camera key (a camera with a slash) and press it, with {{Fn}} if needed.', 'Test in the Camera app.'], time: '3 min', diff: 'Easy', result: 'The camera is enabled.', fail: 'If there is no switch or key, continue.' },
      'cam-privacy': { title: 'Allow apps to use the camera', why: 'Windows can block camera access system-wide or per app.', i: V(['Open **Settings** > **Privacy & security** > **Camera**.', 'Switch **Camera access** on.', 'Switch **Let apps access your camera** on and make sure the specific app is on in the list.', 'Also check **Let desktop apps access your camera**.'], ['Open **Settings** > **Privacy** > **Camera**.', 'Switch **Camera access for this device** on.', 'Switch **Allow apps to access your camera** on and make sure the specific app is on.', 'Also check **Allow desktop apps to access your camera**.']), time: '5 min', diff: 'Easy', result: 'The app can open the camera.', warn: 'Work PCs may lock these settings; ask IT.', fail: 'If they were already on, continue.' },
      'cam-appsel': { title: 'Select the camera inside the app', why: 'Apps like Teams and Zoom let you pick a camera. They may have picked a virtual or unplugged one.', i: ['Open the app\'s **Settings** > **Devices** (or **Video**).', 'Select your actual camera from the list.', 'Check the preview.'], time: '3 min', diff: 'Easy', result: 'The preview shows you.', fail: 'If the camera is not listed, continue to drivers.' },
      'cam-device-manager': { title: 'Check Device Manager for the camera', why: 'If Windows does not list the camera, apps cannot use it.', i: ['Right-click **Start** and choose **Device Manager**.', 'Look for **Cameras** or **Imaging devices**.', 'If the camera is listed with a down-arrow, right-click and choose **Enable device**.', 'If nothing is listed, select **View** > **Show hidden devices**. Also check under **Other devices** for an unknown device.'], time: '5 min', diff: 'Moderate', result: 'The camera is listed and enabled.', fail: 'If there is no camera anywhere, escalate.' }
    }
  });

  F.push({
    id: 'external-monitor', title: 'External monitor not working', cat: 'av',
    blurb: 'A second screen, TV or projector shows no picture or is not detected.',
    symptoms: ['"No signal" on the monitor', 'Windows does not detect the display', 'Monitor flickers or shows the wrong resolution', 'Works with a different cable'],
    keywords: ['external monitor', 'second monitor', 'monitor not working', 'monitor not detected', 'second screen', 'external display', 'no signal', 'hdmi not working', 'displayport not working', 'second monitor not detected', 'monitor not showing', 'dual monitor not working', 'projector not working', 'tv not detected', 'extend display', 'usb-c monitor', 'dock monitor not working', 'monitor black', 'monitor flickering', 'hdmi no signal', 'second display', 'monitor wrong resolution'],
    versions: ['10', '11'], difficulty: 'Easy', time: '10–25 min', risk: 'Low', admin: false,
    prereq: 'The monitor is powered on and set to the correct input (HDMI, DisplayPort, USB-C).',
    expected: 'The monitor shows the desktop.',
    ms: { label: 'Troubleshoot external monitor connections (Microsoft)', url: 'https://support.microsoft.com/en-us/windows/hardware/display-graphics/troubleshoot-external-monitor-connections-in-windows' },
    questions: [
      { id: 'conn', text: 'How is it connected?', options: [
        { v: 'hdmi', label: 'HDMI or DisplayPort', m: ['hdmi', 'displayport', 'display port', 'dp'] },
        { v: 'usbc', label: 'USB-C or a docking station', m: ['usb-c', 'usb c', 'dock', 'docking'] },
        { v: 'vga', label: 'VGA or DVI (older)', m: ['vga', 'dvi'] }] },
      { id: 'detect', text: 'Does Windows list the monitor in display settings?', help: 'Right-click the desktop, choose Display settings (Windows 11) or Display settings (Windows 10) and look for Display 2.', options: [
        { v: 'yes', label: 'Yes, but the screen is blank or wrong', m: [] },
        { v: 'no', label: 'No, it is not detected', m: ['not detected', 'not recognised', 'not recognized', 'not found'] },
        { v: 'unsure', label: 'I haven\'t checked', m: [] }] }],
    branches: [
      { when: { detect: 'yes' }, causes: ['Wrong display mode or resolution', 'Refresh rate not supported'], steps: ['mon-input', 'mon-project', 'mon-resolution', 'sh-driver'] },
      { when: { conn: 'usbc' }, causes: ['The dock or USB-C port does not carry video', 'Dock firmware or driver'], steps: ['mon-power', 'mon-input', 'mon-detect', 'sh-driver', 'sh-restart'] },
      { causes: ['A loose or faulty cable or port', 'Wrong monitor input selected', 'Display not detected by Windows'], steps: ['mon-input', 'mon-cable', 'mon-project', 'mon-detect', 'sh-driver', 'sh-restart'] }
    ],
    escalation: 'If the monitor works on another PC and the same cable works there, but not on this PC, the port or graphics hardware may be faulty. A technician can test. For USB-C docks, check the manufacturer\'s firmware and driver support.',
    steps: {
      'mon-input': { title: 'Check the monitor power and input', why: 'A monitor on the wrong input says "No signal" even if everything else is correct.', i: ['Make sure the monitor is powered on (its light is on).', 'Use the monitor\'s own buttons to open the menu and choose the matching **Input** (HDMI 1, HDMI 2, DisplayPort and so on).', 'Check the PC is connected to the port you selected.'], time: '3 min', diff: 'Easy', result: 'The monitor shows a picture.', fail: 'If "No signal" remains, continue.' },
      'mon-cable': { title: 'Check the cable and port', why: 'Cables fail more often than monitors.', i: ['Unplug the cable at both ends and plug it back in firmly.', 'Use a different cable or port on the monitor or PC.', 'Do not use adapters from unknown sources; a cheap adapter is a common failure point.', 'Try the monitor with another PC if available.'], time: '10 min', diff: 'Easy', result: 'A picture appears.', warn: 'Turn off the PC before connecting or disconnecting VGA or DVI cables; do not bend pins.', fail: 'If it fails with a known-good cable, continue.' },
      'mon-project': { title: 'Choose how Windows uses the second screen', why: 'Windows may be set to "PC screen only".', i: ['Press {{Windows key + P}}.', 'Choose **Extend** or **Duplicate**.', 'Wait a few seconds for the monitor to respond.'], time: '2 min', diff: 'Easy', result: 'The second screen shows the desktop.', fail: 'If nothing happens, continue.' },
      'mon-detect': { title: 'Ask Windows to detect the display', why: 'Windows sometimes needs to be told to look for a newly attached monitor.', i: V(['Open **Settings** > **System** > **Display**.', 'Scroll down and open **Multiple displays**.', 'Select **Detect** if it appears.', 'Check Display 2 appears in the picture at the top.'], ['Open **Settings** > **System** > **Display**.', 'Scroll to **Multiple displays**.', 'Select **Detect**.', 'Check Display 2 appears at the top.']), time: '3 min', diff: 'Easy', result: 'The monitor appears in the list.', fail: 'If it is not detected, continue.' },
      'mon-resolution': { title: 'Adjust resolution and refresh rate', why: 'An unsupported resolution or refresh rate can show a blank or flickering screen.', i: V(['Open **Settings** > **System** > **Display**.', 'Select the second display and choose a **Display resolution** marked **(Recommended)**.', 'Under **Advanced display**, choose a **refresh rate** of 60 Hz and test.'], ['Open **Settings** > **System** > **Display**.', 'Select the second display and choose the resolution marked **(Recommended)**.', 'Under **Advanced display settings** > **Display adapter properties** > **Monitor**, choose 60 Hertz and test.']), time: '5 min', diff: 'Easy', result: 'The picture is stable and sharp.', warn: 'If the screen goes blank, wait 15 seconds; Windows reverts the change automatically.', fail: 'If flicker continues, try another cable and update the graphics driver.' },
      'mon-power': { title: 'Power-cycle the dock', why: 'Docks hold state; unplugging them from power clears many faults.', i: ['Unplug the dock\'s power adapter and USB-C cable from the PC.', 'Wait 30 seconds.', 'Reconnect the power, then the USB-C cable, and wait for the monitor to wake.'], time: '5 min', diff: 'Easy', result: 'The monitor wakes through the dock.', fail: 'If it still fails, continue.' }
    }
  });

  /* ---------------- DEVICES ---------------- */
  F.push({
    id: 'printer-offline', title: 'Printer offline or not printing', cat: 'devices',
    blurb: 'The printer says Offline, jobs stay in the queue, or nothing comes out.',
    symptoms: ['Printer shows "Offline"', 'Print jobs stuck in the queue', 'Printer not found', '"Printer needs user intervention"'],
    keywords: ['printer offline', 'printer not working', 'printer not printing', 'cant print', 'cannot print', 'print job stuck', 'printer is offline', 'printer not found', 'printer not responding', 'print queue stuck', 'printer error', 'printer wont print', 'printer not connecting', 'printer paused', 'wifi printer not working', 'printer disconnected', 'printing problem', 'printer says offline', 'documents wont print', 'printer spooler'],
    versions: ['10', '11'], difficulty: 'Easy', time: '10–30 min', risk: 'Low', admin: false,
    prereq: 'The printer has paper and ink/toner and shows no error on its own screen.',
    expected: 'A test page prints.',
    ms: { label: 'Fix printer connection and printing problems (Microsoft)', url: 'https://support.microsoft.com/en-us/windows/hardware/printer/fix-printer-connection-and-printing-problems-in-windows' },
    questions: [
      { id: 'conn', text: 'How does the printer connect to the PC?', options: [
        { v: 'wifi', label: 'Wi-Fi or network', m: ['wifi', 'wi-fi', 'wireless', 'network printer', 'on the network'] },
        { v: 'usb', label: 'USB cable', m: ['usb', 'cable'] },
        { v: 'shared', label: 'A shared or office printer', m: ['shared', 'office printer', 'print server', 'work printer'] }] },
      { id: 'queue', text: 'Are old print jobs stuck in the queue?', options: [
        { v: 'yes', label: 'Yes', m: ['stuck', 'queue', 'job stuck', 'pending'] },
        { v: 'no', label: 'No / I\'m not sure', m: [] }] }],
    branches: [
      { when: { queue: 'yes' }, causes: ['A stuck print job blocking the queue', 'The print service needs restarting'], steps: ['prn-basics', 'prn-queue', 'prn-spooler', 'prn-default'] },
      { when: { conn: 'wifi' }, causes: ['The printer lost its Wi-Fi connection', 'Windows lists it as offline', 'The printer\'s address changed'], steps: ['prn-basics', 'prn-online', 'prn-readd', 'prn-troubleshooter', 'prn-spooler'] },
      { when: { conn: 'shared' }, causes: ['The print server or share is unavailable', 'Permissions or a network change'], steps: ['prn-basics', 'prn-online', 'prn-troubleshooter', 'prn-escalate'] },
      { causes: ['A cable or port fault', 'Windows lists it as offline', 'A driver or print service problem'], steps: ['prn-basics', 'prn-online', 'sh-other-test', 'prn-readd', 'prn-spooler', 'sh-driver'] }
    ],
    escalation: 'If a test page from the printer\'s own control panel does not print, the printer needs attention from its manufacturer. For shared office printers, contact the person who manages them; do not try to change print server settings yourself.',
    steps: {
      'prn-basics': { title: 'Check the printer itself', why: 'Most "offline" issues are the printer being off, asleep, out of paper or showing an error on its own panel.', i: ['Check the printer is on and its screen shows Ready (no error, paper jam or low ink message).', 'Check paper and ink or toner.', 'Switch the printer off, wait 30 seconds, switch it on again.', 'For Wi-Fi printers, check the Wi-Fi light is steady, not flashing.'], time: '5 min', diff: 'Easy', result: 'The printer shows Ready.', fail: 'If it shows an error, follow the maker\'s guidance for that error.' },
      'prn-online': { title: 'Make sure the printer is not set to "Use printer offline"', why: 'Windows can mark a printer offline when it cannot reach it once. It sometimes stays that way after the printer is back.', i: V(['Open **Settings** > **Bluetooth & devices** > **Printers & scanners**.', 'Select your printer, then **Open print queue**.', 'In the queue window, open **Printer** in the menu and make sure **Use Printer Offline** and **Pause Printing** are not ticked.', 'Set it as default under **Set as default** if you use it most.'], ['Open **Settings** > **Devices** > **Printers & scanners**.', 'Select your printer, then **Open queue**.', 'In the queue window, open **Printer** in the menu and make sure **Use Printer Offline** and **Pause Printing** are not ticked.', 'Select **Manage** > **Set as default** if you use it most.']), time: '5 min', diff: 'Easy', result: 'The status changes from Offline to Ready.', fail: 'If the offline status returns, continue.' },
      'prn-queue': { title: 'Clear stuck print jobs', why: 'One stuck job can block everything behind it.', i: ['Open the printer\'s queue as in the previous step.', 'Select **Printer** > **Cancel All Documents**.', 'If jobs will not cancel, continue to restart the print service.'], time: '3 min', diff: 'Easy', result: 'The queue is empty.', warn: 'Pending documents are cancelled and must be printed again.', fail: 'If they will not clear, restart the print service.' },
      'prn-spooler': { title: 'Restart the print service', why: 'The Print Spooler is the Windows service that manages printing. Restarting it clears many faults.', i: ['Press {{Windows key + R}}, type `services.msc` and press Enter.', 'Find **Print Spooler** in the list, right-click it and choose **Restart**.', 'Try printing a test page.'], cmd: ['spooler-restart'], admin: true, time: '5 min', diff: 'Moderate', result: 'Printing resumes.', warn: 'Needs administrator rights on some PCs. Pending print jobs may be lost.', fail: 'If the service will not start, continue.' },
      'prn-default': { title: 'Print a test page', why: 'A test page proves whether the PC can reach the printer.', i: V(['Open **Settings** > **Bluetooth & devices** > **Printers & scanners** > your printer.', 'Select **Printer properties** > **Print test page**.'], ['Open **Settings** > **Devices** > **Printers & scanners** > your printer > **Manage**.', 'Select **Printer properties** > **Print Test Page**.']), time: '3 min', diff: 'Easy', result: 'A test page prints.', fail: 'If it fails, continue.' },
      'prn-readd': { title: 'Remove and re-add the printer', why: 'A fresh setup replaces damaged settings and picks up the printer\'s current address.', i: V(['Open **Settings** > **Bluetooth & devices** > **Printers & scanners**.', 'Select your printer and choose **Remove**.', 'Select **Add device**, wait for the printer to appear, and add it.', 'Print a test page.'], ['Open **Settings** > **Devices** > **Printers & scanners**.', 'Select your printer and choose **Remove device**.', 'Select **Add a printer or scanner**, wait for it to appear, and add it.', 'Print a test page.']), time: '10 min', diff: 'Moderate', result: 'The printer reappears as Ready.', warn: 'For shared or work printers, you may need IT to give you the printer address; do not guess.', fail: 'If it does not appear, make sure the printer is on the same network.' },
      'prn-troubleshooter': { title: 'Run the printer troubleshooter', why: 'Windows can detect stopped services and wrong port settings.', i: V(['Open **Settings** > **System** > **Troubleshoot** > **Other troubleshooters**.', 'Next to **Printer**, select **Run** and follow the prompts.'], ['Open **Settings** > **Update & Security** > **Troubleshoot** > **Additional troubleshooters**.', 'Select **Printer** > **Run the troubleshooter** and follow the prompts.']), time: '5 min', diff: 'Easy', result: 'A fix is applied.', fail: 'If nothing is found, continue.' },
      'prn-escalate': { title: 'Contact whoever manages the printer', why: 'Shared and office printers depend on a print server or network settings you cannot change.', i: ['Note the printer\'s name exactly as Windows shows it.', 'Note any message in the print queue.', 'Contact your IT team or the office manager and say when it last worked.'], time: '5 min', diff: 'Easy', result: 'You have the information needed for support.', fail: 'Escalate with the summary.' }
    }
  });

  F.push({
    id: 'usb-not-recognised', title: 'USB device not recognised', cat: 'devices',
    blurb: 'Windows says a USB device is not recognised or malfunctioned.',
    symptoms: ['"USB device not recognized"', 'Device appears then disappears', 'A flash drive is not shown in File Explorer', 'Device Manager shows Unknown USB Device'],
    keywords: ['usb not recognised', 'usb not recognized', 'usb device not recognised', 'usb device not recognized', 'usb not working', 'usb not detected', 'flash drive not showing', 'usb stick not showing', 'external drive not showing', 'external hard drive not detected', 'usb malfunctioned', 'unknown usb device', 'usb port not working', 'pen drive not detected', 'usb keeps disconnecting', 'usb device descriptor request failed', 'usb drive not appearing', 'cant see usb', 'usb error', 'usb device malfunctioned'],
    versions: ['10', '11'], difficulty: 'Easy', time: '10–25 min', risk: 'Low', admin: false,
    prereq: 'The device and a different USB port or cable, if possible.',
    expected: 'The device is recognised and works.',
    ms: { label: 'Fix USB-C problems in Windows (Microsoft)', url: 'https://support.microsoft.com/en-us/windows/hardware/usb/fix-usb-c-problems-in-windows' },
    questions: [
      { id: 'kind', text: 'What kind of device is it?', options: [
        { v: 'storage', label: 'A drive or memory stick', m: ['flash drive', 'usb stick', 'external drive', 'hard drive', 'pen drive', 'memory stick', 'hard disk'] },
        { v: 'other', label: 'A keyboard, mouse, printer, phone or other accessory', m: ['keyboard', 'mouse', 'printer', 'phone', 'headset', 'camera'] }] },
      { id: 'others', text: 'Does it work on another PC or in another port?', options: [
        { v: 'works', label: 'Yes, it works elsewhere', m: ['works on another', 'works elsewhere', 'works on my other'] },
        { v: 'fails', label: 'No, it fails everywhere', m: ['fails everywhere', 'doesnt work anywhere', 'does not work anywhere'] },
        { v: 'unsure', label: 'I haven\'t tried', m: [] }] }],
    branches: [
      { when: { others: 'fails' }, causes: ['The device or its cable is faulty'], steps: ['sh-other-test', 'usb-data-warning'] },
      { when: { kind: 'storage', others: 'works' }, causes: ['A driver or power-management setting on this PC', 'A drive letter conflict or hidden drive'], steps: ['usb-restart-unplug', 'usb-disk-mgmt', 'usb-power', 'sh-driver', 'usb-data-warning'] },
      { when: { kind: 'storage' }, causes: ['A damaged file system', 'A faulty drive', 'A drive that needs a drive letter'], steps: ['sh-other-test', 'usb-disk-mgmt', 'sh-driver', 'usb-data-warning'] },
      { causes: ['A power-saving setting', 'A driver issue', 'A faulty cable or port'], steps: ['usb-restart-unplug', 'sh-other-test', 'usb-power', 'sh-driver', 'sh-restart'] }
    ],
    escalation: 'If the device fails in multiple ports and on another PC, the device is faulty. If it is a storage device with important data, do not format it when Windows offers; ask a technician about data recovery.',
    steps: {
      'usb-restart-unplug': { title: 'Unplug, wait, plug back in', why: 'USB devices can get stuck in a bad state. Disconnecting power to them often resets them.', i: ['Unplug the device and wait 15 seconds.', 'Plug it directly into a port on the PC, not a hub or keyboard port.', 'Restart the PC with the device unplugged, then plug it in again once Windows is running.'], time: '5 min', diff: 'Easy', result: 'Windows makes the "connected" sound and the device appears.', fail: 'If not, continue.' },
      'usb-disk-mgmt': { title: 'Look for the drive in Disk Management', why: 'A drive can be connected but have no drive letter, so File Explorer does not show it.', i: ['Right-click **Start** and choose **Disk Management**.', 'Look in the lower part of the window for a removable or extra disk.', 'If a drive is listed but has no letter, right-click its partition and choose **Change Drive Letter and Paths**, then **Add** a letter.', 'If Windows offers to **Initialize** or **Format** the disk, do **not** accept if the drive holds data you need.'], time: '10 min', diff: 'Moderate', result: 'The drive appears in File Explorer.', warn: 'Do not format, delete volume or initialize a disk that contains files you want. Those actions erase data.', fail: 'If the disk is not listed at all, continue.', safety: 'data-failing-drive' },
      'usb-power': { title: 'Stop Windows turning the USB port off to save power', why: 'USB power-saving ("selective suspend") can make devices disappear or stop responding.', i: ['Right-click **Start** and choose **Power Options** (or open **Control Panel** > **Power Options**).', 'Select **Change plan settings** > **Change advanced power settings** for the plan in use.', 'Expand **USB settings** > **USB selective suspend setting** and set it to **Disabled**.', 'Select **OK** and restart.', 'In Device Manager, under **Universal Serial Bus controllers**, double-click each **USB Root Hub** > **Power Management** and untick **Allow the computer to turn off this device to save power**.'], time: '10 min', diff: 'Moderate', result: 'The device stays connected.', warn: 'Laptop battery life may drop slightly. You can restore the setting at any time.', fail: 'If nothing changes, continue.' },
      'usb-data-warning': { title: 'Protect your data before further attempts', why: 'If the drive is failing, repeated attempts can reduce the chance of getting files back.', i: ['If the device holds important files, stop trying new things.', 'Do not format it or run any repair tool.', 'Ask a technician or a data-recovery service; the sooner the better.', 'If it is a phone or camera, try a different cable and the device\'s own file-transfer mode.'], time: '5 min', diff: 'Easy', result: 'Your data is protected.', fail: 'Escalate.', safety: 'data-failing-drive' }
    }
  });

  F.push({
    id: 'bluetooth-not-connecting', title: 'Bluetooth not connecting', cat: 'devices',
    blurb: 'A Bluetooth device will not pair, or no Bluetooth option appears.',
    symptoms: ['No Bluetooth toggle', 'Device appears but will not pair', '"Couldn\'t connect"', 'Connected but no sound or input'],
    keywords: ['bluetooth not working', 'bluetooth not connecting', 'bluetooth wont connect', 'bluetooth not pairing', 'cant pair bluetooth', 'bluetooth missing', 'no bluetooth', 'bluetooth option gone', 'bluetooth disappeared', 'bluetooth headphones not connecting', 'bluetooth speaker not connecting', 'bluetooth mouse not working', 'airpods not connecting', 'bluetooth keeps disconnecting', 'bluetooth toggle missing', 'couldnt connect bluetooth', 'bluetooth device not found', 'bluetooth not showing', 'bluetooth pairing failed', 'wireless headphones wont connect'],
    versions: ['10', '11'], difficulty: 'Easy', time: '10–25 min', risk: 'Low', admin: false,
    prereq: 'The Bluetooth device is charged and in pairing mode.',
    expected: 'The device pairs and works.',
    ms: { label: 'Fix Bluetooth problems in Windows (Microsoft)', url: 'https://support.microsoft.com/en-us/windows/hardware/bluetooth/fix-bluetooth-problems-in-windows' },
    questions: [
      { id: 'toggle', text: 'Is there a Bluetooth switch in Windows?', help: 'Look in Quick Settings by the clock or in Settings.', options: [
        { v: 'missing', label: 'No Bluetooth option at all', m: ['bluetooth missing', 'no bluetooth', 'bluetooth option gone', 'toggle missing', 'bluetooth disappeared'] },
        { v: 'present', label: 'Yes, Bluetooth is there', m: [] }] },
      { id: 'fail', text: 'What happens with the device?', options: [
        { v: 'notfound', label: 'Windows does not find it', m: ['not found', 'doesnt show', 'not showing', 'not appearing'] },
        { v: 'pairfail', label: 'It finds it but pairing or connecting fails', m: ['pairing failed', 'wont pair', 'cant pair', 'couldnt connect', 'cannot connect', 'wont connect'] },
        { v: 'nosound', label: 'It connects but there is no sound or no input', m: ['connected but no sound', 'connected but not working'] }] }],
    branches: [
      { when: { toggle: 'missing' }, causes: ['Bluetooth is turned off by Airplane mode or a key', 'The Bluetooth driver or radio is disabled'], steps: ['bt-airplane', 'bt-service', 'sh-driver', 'sh-restart'] },
      { when: { fail: 'pairfail' }, causes: ['An old pairing is damaged', 'The device is still connected to another phone or PC'], steps: ['bt-remove', 'bt-pairmode', 'bt-service', 'sh-restart', 'sh-driver'] },
      { when: { fail: 'nosound' }, causes: ['Windows is using another audio output or input device'], steps: ['bt-output', 'bt-remove', 'sh-driver'] },
      { causes: ['The device is not in pairing mode', 'Bluetooth is disabled', 'Interference or distance'], steps: ['bt-pairmode', 'bt-airplane', 'bt-remove', 'bt-service', 'sh-restart', 'sh-driver'] }
    ],
    escalation: 'If no Bluetooth adapter appears in Device Manager, the radio may be faulty or turned off in firmware. A USB Bluetooth adapter is a cheap fix. On work PCs, Bluetooth may be disabled by policy.',
    steps: {
      'bt-airplane': { title: 'Switch Bluetooth on and Airplane mode off', why: 'Airplane mode or a function key may have turned Bluetooth off.', i: V(['Open **Quick Settings** by selecting the network and volume icons by the clock.', 'Make sure **Airplane mode** is off and **Bluetooth** is on.', 'Open **Settings** > **Bluetooth & devices** and check the switch at the top.'], ['Select the Action Center icon by the clock.', 'Make sure **Airplane mode** is off and **Bluetooth** is on.', 'Open **Settings** > **Devices** > **Bluetooth & other devices** and check the switch at the top.']), time: '3 min', diff: 'Easy', result: 'Bluetooth is on and devices are listed.', fail: 'If the switch is missing, continue.' },
      'bt-pairmode': { title: 'Put the device into pairing mode and bring it close', why: 'Most Bluetooth devices only appear for pairing when they are in a special mode, and may be connected elsewhere.', i: ['Charge the device.', 'Turn off Bluetooth on phones or other PCs it was last connected to.', 'Hold the device\'s pairing button until a light flashes (check its manual).', 'Keep it within one metre of the PC.', 'In Settings, choose **Add device** > **Bluetooth** and select it.'], time: '5 min', diff: 'Easy', result: 'Windows finds the device.', warn: 'Do not enter any PIN that you did not expect to see.', fail: 'If not found, continue.' },
      'bt-remove': { title: 'Remove the device and pair again', why: 'An old pairing can become damaged, so Windows cannot connect even though it shows the device.', i: V(['Open **Settings** > **Bluetooth & devices** > **Devices**.', 'Select the three dots beside the device and choose **Remove device**.', 'Turn the device off and on, put it in pairing mode, and add it again.'], ['Open **Settings** > **Devices** > **Bluetooth & other devices**.', 'Select the device and choose **Remove device**.', 'Turn the device off and on, put it in pairing mode, and add it again.']), time: '5 min', diff: 'Easy', result: 'The device pairs freshly.', fail: 'If pairing still fails, continue.' },
      'bt-service': { title: 'Check the Bluetooth support service', why: 'Windows runs a Bluetooth service in the background. If it stopped, pairing fails.', i: ['Press {{Windows key + R}}, type `services.msc` and press Enter.', 'Find **Bluetooth Support Service**.', 'If its status is blank, right-click it and choose **Start**. Set **Startup type** to **Manual** or **Automatic** by double-clicking it.', 'Restart the PC.'], time: '5 min', diff: 'Moderate', result: 'The service shows Running.', warn: 'Work PCs may not allow changes; ask IT.', fail: 'If it will not start, continue.' },
      'bt-output': { title: 'Choose the Bluetooth device for sound or microphone', why: 'A connected headset is not always selected automatically.', i: V(['Open **Settings** > **System** > **Sound**.', 'Under **Output**, choose the Bluetooth device. Under **Input**, choose its microphone if you want to use it.', 'Play audio to test.'], ['Open **Settings** > **System** > **Sound**.', 'Under **Output**, choose the Bluetooth device from the list. Under **Input**, choose its microphone if you want to use it.', 'Play audio to test.']), time: '5 min', diff: 'Easy', result: 'Sound plays through the Bluetooth device.', fail: 'If the device is not listed, remove and pair again.' }
    }
  });

  F.push({
    id: 'keyboard-not-responding', title: 'Keyboard not responding', cat: 'devices',
    blurb: 'Keys do nothing, or only some keys work.',
    symptoms: ['No typing at all', 'Some keys work, some do not', 'Wrong characters appear', 'Keyboard works at the login screen but not after'],
    keywords: ['keyboard not working', 'keyboard not responding', 'keyboard stopped working', 'keys not working', 'key not working', 'cant type', 'cannot type', 'keyboard wont type', 'laptop keyboard not working', 'keyboard not typing', 'wrong characters', 'keyboard typing wrong letters', 'some keys not working', 'wireless keyboard not working', 'keyboard dead', 'keyboard is not detected', 'keyboard locked', 'keyboard typing numbers', 'keyboard stuck'],
    versions: ['10', '11'], difficulty: 'Easy', time: '10–25 min', risk: 'Low', admin: false,
    prereq: 'A mouse, or the ability to use the on-screen keyboard.',
    expected: 'The keyboard types correctly.',
    ms: { label: 'Mouse and keyboard problems in Windows (Microsoft)', url: 'https://support.microsoft.com/en-us/windows/hardware/input-devices/mouse-and-keyboard-problems-in-windows' },
    questions: [
      { id: 'kind', text: 'Which keyboard?', options: [
        { v: 'laptop', label: 'Laptop\'s built-in keyboard', m: ['laptop keyboard', 'built in'] },
        { v: 'wired', label: 'Wired USB keyboard', m: ['wired', 'usb keyboard'] },
        { v: 'wireless', label: 'Wireless or Bluetooth keyboard', m: ['wireless', 'bluetooth', 'batteries'] }] },
      { id: 'scope', text: 'What is not working?', options: [
        { v: 'all', label: 'No keys at all', m: ['no keys', 'nothing types', 'cant type', 'completely'] },
        { v: 'some', label: 'Only some keys, or wrong characters', m: ['some keys', 'only some', 'wrong characters', 'wrong letters', 'typing numbers'] }] }],
    branches: [
      { when: { scope: 'some' }, causes: ['The wrong keyboard layout or language is active', 'Sticky keys, num lock or a function-lock setting', 'Dirt under a key'], steps: ['kb-layout', 'kb-filter-sticky', 'kb-clean'] },
      { when: { kind: 'wireless' }, causes: ['Flat batteries', 'The receiver or Bluetooth pairing was lost'], steps: ['kb-battery', 'sh-other-test', 'bt-remove', 'sh-restart'] },
      { when: { kind: 'laptop' }, causes: ['A software or driver fault', 'A liquid spill or hardware fault'], steps: ['sh-restart', 'kb-onscreen', 'sh-driver', 'kb-filter-sticky', 'kb-hardware'] },
      { causes: ['A loose connection', 'A faulty port or keyboard', 'A driver issue'], steps: ['sh-restart', 'sh-other-test', 'sh-driver', 'kb-onscreen'] }
    ],
    escalation: 'If a laptop keyboard fails in Windows and in the BIOS setup screen, it is a hardware fault, often from a spill. If liquid was spilled, power off immediately and see a technician. External keyboards are cheap to replace.',
    steps: {
      'kb-battery': { title: 'Replace batteries and re-seat the receiver', why: 'Wireless keyboards fail first from flat batteries or a USB receiver that is not detected.', i: ['Replace the batteries with fresh ones.', 'Switch the keyboard off and on.', 'Plug the USB receiver directly into the PC, not a hub or extension.'], time: '5 min', diff: 'Easy', result: 'Typing returns.', fail: 'If not, continue.' },
      'kb-onscreen': { title: 'Use the on-screen keyboard to keep working', why: 'It does not fix the fault but lets you carry on typing, for example to sign in.', i: V(['Open **Settings** > **Accessibility** > **Keyboard** and switch **On-screen keyboard** on.', 'Or press {{Windows key + Ctrl + O}}.'], ['Press {{Windows key + Ctrl + O}}.', 'Or open **Settings** > **Ease of Access** > **Keyboard** and switch **Use the On-Screen Keyboard** on.']), time: '3 min', diff: 'Easy', result: 'You can type by clicking letters.', fail: 'This is a workaround while you troubleshoot.' },
      'kb-layout': { title: 'Check the keyboard layout and language', why: 'The wrong layout makes symbols and punctuation appear in the wrong places (for example @ and " swapped).', i: V(['Look near the clock for a language code such as ENG or ENG UK / US.', 'Press {{Windows key + Space}} to switch between layouts, and choose the one that matches your keyboard.', 'To remove one you do not use: **Settings** > **Time & language** > **Language & region**.'], ['Look near the clock for a language code such as ENG.', 'Press {{Windows key + Space}} to switch between layouts, and choose the one that matches your keyboard.', 'To remove one: **Settings** > **Time & Language** > **Language**.']), time: '5 min', diff: 'Easy', result: 'Symbols type correctly.', fail: 'If the layout is right, continue.' },
      'kb-filter-sticky': { title: 'Switch off Sticky Keys and Filter Keys', why: 'These accessibility features change how keys behave. Pressing Shift five times or holding it can turn them on accidentally.', i: V(['Open **Settings** > **Accessibility** > **Keyboard**.', 'Switch **Sticky keys**, **Filter keys** and **Toggle keys** off.', 'Check that **Num Lock** and **Fn Lock** are set as you expect.'], ['Open **Settings** > **Ease of Access** > **Keyboard**.', 'Switch **Sticky Keys**, **Filter Keys** and **Toggle Keys** off.', 'Check that **Num Lock** and **Fn Lock** are set as you expect.']), time: '5 min', diff: 'Easy', result: 'Keys behave normally.', fail: 'If unchanged, continue.' },
      'kb-clean': { title: 'Clean under the keys', why: 'Crumbs and dust can jam keys.', i: ['Switch the keyboard off and unplug it (or shut a laptop down).', 'Turn it upside down and shake gently.', 'Use compressed air between the keys.', 'Do not remove keys on a laptop unless you know how; they can break.'], time: '10 min', diff: 'Easy', result: 'Stuck keys free up.', warn: 'Do not use liquids. Do not use a vacuum cleaner or heat.', fail: 'If the key is still dead, the keyboard may need replacing.' },
      'kb-hardware': { title: 'Check for physical damage or liquid', why: 'A laptop keyboard that stops suddenly after a knock or spill needs hardware repair.', i: ['Check whether any liquid has been spilled recently.', 'If yes, shut the laptop down, unplug it, and do not use it. See the safety message.', 'If not, try an external USB keyboard: if it works, the laptop keyboard is faulty and can be replaced by a technician.'], time: '5 min', diff: 'Easy', result: 'You know whether the keyboard is faulty.', warn: 'If there was a liquid spill, power off immediately.', fail: 'Escalate to a technician.', safety: 'liquid-spill' }
    }
  });

  F.push({
    id: 'mouse-touchpad', title: 'Mouse or touchpad not working', cat: 'devices',
    blurb: 'The pointer does not move, jumps around, or clicks fail.',
    symptoms: ['Pointer frozen', 'Pointer jumps or is jittery', 'Touchpad does not respond', 'Wireless mouse disconnects'],
    keywords: ['mouse not working', 'mouse not responding', 'cursor not moving', 'cursor frozen', 'pointer frozen', 'mouse stopped working', 'touchpad not working', 'trackpad not working', 'touchpad disabled', 'touchpad not responding', 'mouse jumping', 'mouse lagging', 'cursor jumping', 'mouse keeps freezing', 'wireless mouse not working', 'mouse disconnecting', 'cant click', 'right click not working', 'scroll not working', 'touchpad gestures not working', 'mouse jittery', 'cursor disappeared'],
    versions: ['10', '11'], difficulty: 'Easy', time: '10–25 min', risk: 'Low', admin: false,
    prereq: 'Use the keyboard ({{Tab}}, {{Enter}}, {{Windows key}}) if the pointer does not move.',
    expected: 'The pointer moves and clicks normally.',
    ms: { label: 'Mouse and keyboard problems in Windows (Microsoft)', url: 'https://support.microsoft.com/en-us/windows/hardware/input-devices/mouse-and-keyboard-problems-in-windows' },
    questions: [
      { id: 'which', text: 'Which pointing device?', options: [
        { v: 'touchpad', label: 'Laptop touchpad', m: ['touchpad', 'trackpad', 'track pad'] },
        { v: 'wired', label: 'Wired USB mouse', m: ['wired', 'usb mouse'] },
        { v: 'wireless', label: 'Wireless or Bluetooth mouse', m: ['wireless', 'bluetooth', 'batteries'] }] }],
    branches: [
      { when: { which: 'touchpad' }, causes: ['The touchpad was switched off by a key or setting', 'A driver issue', 'An external mouse disabled it'], steps: ['mouse-touchpad-on', 'mouse-key', 'sh-restart', 'sh-driver', 'mouse-surface'] },
      { when: { which: 'wireless' }, causes: ['Flat batteries', 'The receiver or pairing was lost', 'Interference'], steps: ['mouse-battery', 'sh-other-test', 'bt-remove', 'mouse-surface', 'sh-restart'] },
      { causes: ['A loose cable or port', 'A dirty sensor or surface', 'A driver issue'], steps: ['sh-other-test', 'mouse-surface', 'sh-restart', 'sh-driver'] }
    ],
    escalation: 'If both the touchpad and an external mouse fail, and the keyboard works, a driver or system problem is likely. If the mouse works on another PC but not this one, ask a technician to check the USB ports or system files.',
    steps: {
      'mouse-battery': { title: 'Replace batteries and re-seat the receiver', why: 'Low batteries and loose receivers cause lag and cut-outs.', i: ['Fit fresh batteries.', 'Switch the mouse off and on.', 'Plug the receiver into a port on the PC itself, close to the mouse.', 'Move other wireless devices away.'], time: '5 min', diff: 'Easy', result: 'The pointer moves smoothly.', fail: 'If not, continue.' },
      'mouse-touchpad-on': { title: 'Switch the touchpad back on', why: 'Touchpads can be turned off in settings, and many laptops turn them off when a mouse is attached.', i: V(['Open **Settings** > **Bluetooth & devices** > **Touchpad** (use {{Windows key}}, type the word and press {{Enter}} if the pointer does not work).', 'Switch **Touchpad** on.', 'Tick or untick **Leave touchpad on when a mouse is connected** as you prefer.'], ['Open **Settings** > **Devices** > **Touchpad** (use {{Windows key}}, type the word and press {{Enter}} if the pointer does not work).', 'Switch **Touchpad** on.', 'Tick **Leave touchpad on when a mouse is connected** if you want it active with a mouse.']), time: '5 min', diff: 'Easy', result: 'The touchpad responds.', fail: 'If the Touchpad setting is missing, continue.' },
      'mouse-key': { title: 'Try the touchpad function key', why: 'Many laptops have a key that disables the touchpad.', i: ['Look at the top row of the keyboard for a key showing a touchpad with a line through it.', 'Press it, holding {{Fn}} if required.', 'Try again, and check whether a small light by the touchpad changes.'], time: '2 min', diff: 'Easy', result: 'The touchpad switches on.', fail: 'If no key exists or it does not help, continue.' },
      'mouse-surface': { title: 'Clean the sensor and surface', why: 'Dust, a shiny desk or a dirty touchpad cause jumpy movement.', i: ['Wipe the touchpad with a slightly damp lint-free cloth and dry it. Make sure your hands are clean and dry.', 'Turn the mouse over and clean the sensor with a dry cotton bud.', 'Use a mouse mat or matte surface.'], time: '5 min', diff: 'Easy', result: 'Smoother movement.', warn: 'Do not spray liquids on a laptop. Switch it off before cleaning.', fail: 'If jitter continues, update drivers.' }
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
