/* Troubleshooting flows: Performance (6 flows) */
(function (root) {
  'use strict';
  var KB = root.WT_KB, V = KB.V, F = KB.flows;
  var MS_PERF = { label: 'Tips to improve PC performance (Microsoft)', url: 'https://support.microsoft.com/windows/tips-to-improve-pc-performance-in-windows-b3b3ef5b-5953-fb6a-2528-4bbed82fba96' };
  var RECENT = { id: 'recent', text: 'Did this problem start recently?', options: [
    { v: 'today', label: 'Today', m: ['today', 'this morning', 'just now', 'suddenly'] },
    { v: 'week', label: 'Within the last week', m: ['this week', 'few days', 'since yesterday', 'yesterday', 'after update', 'since update', 'recently'] },
    { v: 'months', label: 'It\'s been happening for months', m: ['for months', 'for ages', 'always been', 'getting slower', 'gradually'] },
    { v: 'unsure', label: 'I\'m not sure', m: [] }] };

  F.push({
    id: 'slow-computer', title: 'My PC is running slowly', cat: 'performance',
    blurb: 'Slow to start, slow to open programs, or slow to browse.',
    symptoms: ['Takes a long time to start', 'Programs are slow to open', 'Web pages are slow to load', 'Everything lags, including typing and mouse movement'],
    keywords: ['slow', 'slowly', 'very slow', 'sluggish', 'laggy', 'lag', 'lagging', 'takes forever', 'taking ages', 'takes ages', 'slow computer', 'slow laptop', 'slow pc', 'running slow', 'speed up', 'slowed down', 'slow down', 'crawling', 'performance', 'not responding quickly', 'so slow', 'really slow'],
    versions: ['10', '11'], difficulty: 'Easy', time: '20–45 min', risk: 'Low', admin: false,
    prereq: 'Be able to sign in to Windows. Save your work first.',
    expected: 'The PC feels noticeably faster, or you know what is holding it back.',
    ms: MS_PERF,
    questions: [
      { id: 'when', text: 'When does it feel slow?', options: [
        { v: 'startup', label: 'When starting Windows', m: ['start up', 'startup', 'starting up', 'boot', 'turn on', 'switch on', 'turning on', 'when i start', 'to start', 'login'] },
        { v: 'apps', label: 'When opening applications', m: ['open app', 'opening app', 'opening program', 'open program', 'opening files', 'applications', 'programs', 'excel', 'word', 'outlook'] },
        { v: 'browsing', label: 'When browsing the internet', m: ['browsing', 'browser', 'chrome', 'edge', 'firefox', 'web page', 'websites', 'internet'] },
        { v: 'always', label: 'All the time', m: ['all the time', 'always', 'everything', 'constantly'] },
        { v: 'unsure', label: 'I\'m not sure', m: [] }] },
      RECENT],
    branches: [
      { when: { when: 'startup' }, causes: ['Too many programs starting with Windows', 'A pending update or restart', 'A nearly full or ageing drive', 'Fast Startup keeping a stale session'], steps: ['sh-restart', 'startup-apps', 'sh-updates', 'free-space', 'sh-malware', 'sh-sfc'] },
      { when: { when: 'browsing' }, causes: ['Too many browser tabs or extensions', 'A slow network connection rather than a slow PC', 'Unwanted software hijacking the browser', 'Low memory'], steps: ['browser-tidy', 'speed-check', 'sh-taskmgr', 'sh-malware', 'sh-restart'] },
      { when: { when: 'apps' }, causes: ['Low available memory', 'A drive that is nearly full', 'Background apps competing for resources', 'Out-of-date software'], steps: ['sh-taskmgr', 'free-space', 'startup-apps', 'sh-updates', 'sh-malware', 'sh-sfc'] },
      { causes: ['Background programs using processor, memory or disk', 'Low free disk space', 'Pending updates', 'Unwanted software', 'Ageing hardware'], steps: ['sh-restart', 'sh-taskmgr', 'startup-apps', 'free-space', 'sh-updates', 'sh-malware', 'sh-sfc'] }
    ],
    escalation: 'If the PC is still slow after these steps, it may need more memory (RAM), an SSD upgrade, or the hardware may be ageing. A technician can check drive health and memory. Mention what you tried from this summary.',
    steps: {
      'startup-apps': {
        title: 'Stop unnecessary programs starting with Windows',
        why: 'Many programs add themselves to start-up and slow down the first few minutes after you sign in. Switching off ones you do not need reduces start-up work without uninstalling anything.',
        i: V(['Press {{Ctrl + Shift + Esc}} to open Task Manager (select **More details** if it looks small).', 'Open **Startup apps** from the left-hand menu.', 'Sort by **Startup impact** so High items are first.', 'Right-click programs you do not need straight away (for example chat apps, game launchers, update helpers) and choose **Disable**.', 'Leave anything you do not recognise, security software and hardware utilities alone.', 'Restart the PC.'],
             ['Press {{Ctrl + Shift + Esc}} to open Task Manager (select **More details** if it looks small).', 'Open the **Startup** tab.', 'Sort by **Startup impact** so High items are first.', 'Right-click programs you do not need straight away and choose **Disable**.', 'Leave anything you do not recognise, security software and hardware utilities alone.', 'Restart the PC.']),
        time: '10 min', diff: 'Easy', result: 'Windows reaches a usable desktop sooner after the next restart.',
        warn: 'Disabling does not uninstall anything and is reversible: just right-click and choose Enable. On a work PC, leave management and security tools enabled.',
        fail: 'If nothing high-impact is listed, continue to the next step.'
      },
      'free-space': {
        title: 'Check free disk space and clear junk',
        why: 'Windows needs free space to work with. When the main drive is nearly full, everything slows down and updates can fail. Storage settings can remove temporary files safely.',
        i: V(['Open **Settings** > **System** > **Storage**.', 'Check how much of the C: drive is used. Aim to keep at least 15–20% free.', 'Select **Temporary files**, tick **Temporary files** and **Recycle Bin** only (read each entry before ticking), then select **Remove files**.', 'Turn on **Storage Sense** so Windows tidies automatically.', 'Uninstall programs you no longer use from **Settings** > **Apps** > **Installed apps**.'],
             ['Open **Settings** > **System** > **Storage**.', 'Check how much of the C: drive is used. Aim to keep at least 15–20% free.', 'Select **Temporary files**, tick **Temporary files** and **Recycle Bin** only (read each entry before ticking), then select **Remove files**.', 'Turn on **Storage sense** so Windows tidies automatically.', 'Uninstall programs you no longer use from **Settings** > **Apps** > **Apps & features**.']),
        time: '10–20 min', diff: 'Easy', result: 'More free space on the C: drive.',
        warn: 'Do not tick **Downloads** unless you have checked that folder for anything you want to keep.',
        fail: 'If most space is taken by your own files, move photos and videos to an external drive or cloud storage.'
      },
      'browser-tidy': {
        title: 'Tidy up your browser',
        why: 'A browser with many tabs and extensions can use several gigabytes of memory by itself, so the whole PC feels slow even when the internet is fine.',
        i: ['Close tabs you are not using. Keep only the few you need.', 'Open the browser\'s extensions page (in Edge: type `edge://extensions`; in Chrome: `chrome://extensions`) and switch off extensions you do not recognise or use.', 'Open the browser\'s own task manager ({{Shift + Esc}} in Chrome and Edge) to see which tab or extension is heaviest and end it.', 'Restart the browser.', 'Try a private/InPrivate window. If it is fast there, an extension is the likely cause.'],
        time: '10 min', diff: 'Easy', result: 'Pages load faster and the browser uses less memory.',
        warn: 'Remove extensions you do not trust. Do not install "speed booster" extensions.',
        fail: 'If a private window is just as slow, the problem is probably the network or the PC itself.'
      },
      'speed-check': {
        title: 'Check whether the internet itself is slow',
        why: 'If every device in the house is slow online, the problem is your connection, not this PC. Comparing devices tells you where to look.',
        i: ['On a phone or other device on the same Wi-Fi, load a few websites. Are they slow too?', 'If yes, restart your router (switch it off at the wall for 30 seconds, then back on) and wait five minutes.', 'If only this PC is slow, move closer to the router or try a cable if you have one.', 'Try a speed test site such as speed.cloudflare.com on this PC and on a second device and compare.'],
        time: '10 min', diff: 'Easy', result: 'You know whether the PC or the connection is the slow part.',
        fail: 'If other devices are fine but this PC is slow, continue with the next step. If everything is slow, contact your internet provider.'
      }
    }
  });

  F.push({
    id: 'slow-startup', title: 'Slow startup', cat: 'performance',
    blurb: 'Takes minutes to reach a usable desktop after switching on.',
    symptoms: ['Long wait at the logo or spinning dots', 'Desktop appears but is unusable for minutes', 'Slow after sign-in'],
    keywords: ['slow startup', 'slow to start', 'slow boot', 'takes ages to start', 'takes forever to start', 'long time to start', 'takes long to boot', 'boot time', 'start up slow', 'slow to boot', 'slow login', 'slow sign in', 'slow after login', 'slow after sign in', 'long time to log in', 'slow when turning on'],
    versions: ['10', '11'], difficulty: 'Easy', time: '20–40 min', risk: 'Low', admin: false,
    prereq: 'Be able to reach the desktop eventually.',
    expected: 'The PC reaches a usable desktop faster.',
    ms: MS_PERF,
    questions: [
      { id: 'where', text: 'Where does the wait happen?', options: [
        { v: 'before-signin', label: 'Before the sign-in screen (logo or spinning dots)', m: ['logo', 'spinning dots', 'before login', 'before sign in', 'black screen at start'] },
        { v: 'after-signin', label: 'After I sign in (desktop is slow to appear or respond)', m: ['after login', 'after sign in', 'after i log in', 'after logging in', 'desktop'] },
        { v: 'unsure', label: 'I\'m not sure', m: [] }] },
      { id: 'drive', text: 'What kind of drive does the PC have?', help: 'SSDs are usually in newer PCs. Older PCs often have a hard disk drive (HDD). If unsure, choose "I\'m not sure".', options: [
        { v: 'ssd', label: 'SSD (solid-state)', m: ['ssd', 'solid state'] },
        { v: 'hdd', label: 'Hard disk drive (HDD)', m: ['hdd', 'hard disk', 'hard drive', 'spinning'] },
        { v: 'unsure', label: 'I\'m not sure', m: [] }] }],
    branches: [
      { when: { where: 'before-signin' }, causes: ['Pending updates finishing during start', 'A failing or very full drive', 'Stale Fast Startup session'], steps: ['sh-restart', 'sh-updates', 'fast-startup', 'free-space-startup', 'chkdsk-scan', 'sh-sfc'] },
      { when: { drive: 'hdd' }, causes: ['Too many start-up programs on a slower hard disk drive', 'Drive nearing the end of its life', 'Low memory'], steps: ['sh-restart', 'startup-apps-s', 'free-space-startup', 'sh-updates', 'chkdsk-scan', 'sh-malware'] },
      { causes: ['Too many programs starting with Windows', 'Pending updates', 'Unwanted software'], steps: ['sh-restart', 'startup-apps-s', 'sh-updates', 'sh-malware', 'free-space-startup', 'sh-sfc'] }
    ],
    escalation: 'If start-up is still very slow, the drive may be ageing or too small. Replacing a hard disk drive with an SSD is the single biggest speed-up for older PCs, but ask a technician. Share this summary.',
    steps: {
      'startup-apps-s': { title: 'Disable heavy start-up programs', why: 'Every program that launches with Windows competes for the drive and processor during start-up.', i: V(['Press {{Ctrl + Shift + Esc}} and select **More details** if needed.', 'Open **Startup apps** and sort by **Startup impact**.', 'Right-click High-impact items you do not need immediately and choose **Disable**.', 'Restart the PC and time how long it takes to become usable.'], ['Press {{Ctrl + Shift + Esc}} and select **More details** if needed.', 'Open the **Startup** tab and sort by **Startup impact**.', 'Right-click High-impact items you do not need immediately and choose **Disable**.', 'Restart the PC and time how long it takes to become usable.']), time: '10 min', diff: 'Easy', result: 'A shorter wait after the next restart.', warn: 'Reversible: right-click and choose Enable. Leave security and manufacturer tools you do not recognise.', fail: 'If nothing high-impact is listed, continue.' },
      'fast-startup': { title: 'Check Fast Startup', why: 'Fast Startup saves part of Windows to disk when you shut down. On some PCs this causes stale sessions, slow starts or odd behaviour. A Restart always bypasses it, and you can also turn it off.', i: ['Open **Control Panel** (search for it in Start) > **Hardware and Sound** > **Power Options**.', 'Select **Choose what the power buttons do**.', 'Select **Change settings that are currently unavailable** (administrator permission may be requested).', 'Untick **Turn on fast startup (recommended)** and select **Save changes**.', 'Shut down fully, switch on and compare the start-up time.'], time: '10 min', diff: 'Easy', result: 'Possibly a cleaner, more reliable start.', warn: 'Shutdowns may become slightly slower. You can switch it back on at any time. Work PCs may have this managed by IT.', fail: 'If start-up is no better, switch Fast Startup back on and continue.' },
      'free-space-startup': { title: 'Free up space on the main drive', why: 'A nearly full drive makes start-up and updates slower.', i: V(['Open **Settings** > **System** > **Storage**.', 'Check the C: drive. Under 15% free is worth fixing.', 'Select **Temporary files**, review the list, then **Remove files**.', 'Uninstall programs you no longer use in **Settings** > **Apps** > **Installed apps**.'], ['Open **Settings** > **System** > **Storage**.', 'Check the C: drive. Under 15% free is worth fixing.', 'Select **Temporary files**, review the list, then **Remove files**.', 'Uninstall programs you no longer use in **Settings** > **Apps** > **Apps & features**.']), time: '10–20 min', diff: 'Easy', result: 'More free space.', warn: 'Do not delete files you are unsure about.', fail: 'If your own files fill the drive, move some to an external drive or cloud storage.' },
      'chkdsk-scan': { title: 'Scan the drive for errors', why: 'File-system errors and early drive failure can make start-up slow. This scan only reports; it does not change anything.', i: ['Select **Start**, type **cmd**, right-click **Command Prompt** and choose **Run as administrator**.', 'Type `chkdsk C: /scan` and press Enter.', 'Wait for the result. It may take several minutes.', 'If it reports errors, back up your important files before doing anything else, then ask a technician.'], cmd: ['chkdsk-scan'], admin: true, time: '15 min', diff: 'Moderate', result: 'The scan reports no problems, or lists problems to pass to IT.', warn: 'Do not add repair options (/f or /r) unless a technician advises it and your files are backed up.', fail: 'If the scan cannot run, continue.' }
    }
  });

  F.push({
    id: 'high-cpu', title: 'High CPU usage', cat: 'performance',
    blurb: 'The fan is loud and Task Manager shows the processor near 100%.',
    symptoms: ['CPU stays near 100%', 'Fan runs loudly all the time', 'PC is hot and slow', 'A process such as System or Antimalware Service Executable is busy'],
    keywords: ['high cpu', 'cpu 100', '100% cpu', 'cpu usage', 'cpu at 100', 'processor 100', 'processor usage', 'cpu high', 'cpu maxed', 'cpu spike', 'cpu is high', 'high processor', 'task manager cpu', 'antimalware service executable', 'system interrupts', 'wmi provider host', 'service host', 'fan noisy and slow', 'fan always running'],
    versions: ['10', '11'], difficulty: 'Easy', time: '20–40 min', risk: 'Low', admin: false,
    prereq: 'Be able to open Task Manager.',
    expected: 'CPU usage returns to normal when the PC is idle.',
    ms: MS_PERF,
    questions: [
      { id: 'idle', text: 'Is the CPU busy even when you are not using the PC?', options: [
        { v: 'idle', label: 'Yes, even when nothing is open', m: ['idle', 'nothing open', 'doing nothing', 'when not using'] },
        { v: 'apps', label: 'Only when I use a specific program', m: ['when i open', 'specific program', 'when using', 'only when'] },
        { v: 'unsure', label: 'I\'m not sure', m: [] }] },
      RECENT],
    branches: [
      { when: { idle: 'idle' }, causes: ['A background scan or update using the processor', 'Unwanted software or a miner', 'A misbehaving service or driver', 'Overheating making the CPU slow itself down'], steps: ['sh-taskmgr', 'cpu-wait-updates', 'sh-malware', 'sh-restart', 'sh-driver', 'sh-sfc'] },
      { causes: ['One program using more than it should', 'Too many browser tabs or extensions', 'Out-of-date program or driver'], steps: ['sh-taskmgr', 'cpu-app-update', 'sh-restart', 'sh-malware', 'sh-updates'] }
    ],
    escalation: 'If CPU stays near 100% with nothing running and a scan is clean, a technician should check the process name, drivers and cooling. Note the busiest process shown in Task Manager.',
    steps: {
      'cpu-wait-updates': { title: 'Let scans and updates finish', why: 'After an update or a restart, Windows Search, Windows Update and Windows Security can run heavy background work for 15–60 minutes. This is normal and ends by itself.', i: ['Leave the PC on and plugged in (laptops) for up to an hour without using it.', 'Check **Settings** > **Windows Update** (Windows 10: **Update & Security**) for pending updates and install them.', 'Check Task Manager again afterwards. Usage should settle.'], time: '30–60 min', diff: 'Easy', result: 'CPU usage settles once background work finishes.', warn: 'Do not switch the PC off while updates are installing.', fail: 'If the CPU is still pinned after an hour of idling, continue.' },
      'cpu-app-update': { title: 'Update or reinstall the program that is busy', why: 'Bugs in older versions of a program can keep the processor busy. The developer often fixes them in an update.', i: ['Note the name of the heaviest program in Task Manager.', 'Open that program\'s own **Help** or **About** menu and check for updates.', 'If no update helps, close it, and try opening only that program to see whether it still uses heavy CPU.', 'As a last step, uninstall and reinstall it from the vendor\'s own website. Back up its data first.'], time: '15–20 min', diff: 'Moderate', result: 'The program uses less CPU after updating.', warn: 'Back up your data in the program before reinstalling.', fail: 'If the same program stays heavy, report the problem to its vendor.' }
    }
  });

  F.push({
    id: 'high-memory', title: 'High memory usage', cat: 'performance',
    blurb: 'Windows says memory is nearly full, or apps close or become unresponsive.',
    symptoms: ['Memory at 90% or more in Task Manager', 'Out of memory warnings', 'Apps freeze when several are open'],
    keywords: ['high memory', 'memory usage', 'ram usage', 'ram full', 'memory full', 'out of memory', 'low memory', 'not enough memory', 'running out of memory', 'memory leak', 'ram 90', 'ram high', 'your computer is low on memory', 'high ram', 'memory at 100', 'chrome using too much memory'],
    versions: ['10', '11'], difficulty: 'Easy', time: '15–30 min', risk: 'Low', admin: false,
    prereq: 'Be able to open Task Manager.',
    expected: 'Memory use drops to a level that leaves headroom.',
    ms: MS_PERF,
    questions: [
      { id: 'trigger', text: 'What do you usually have open when it happens?', options: [
        { v: 'browser', label: 'Lots of browser tabs', m: ['tabs', 'chrome', 'edge', 'browser'] },
        { v: 'bigapp', label: 'A large program (video, design, games, virtual machines)', m: ['video', 'photoshop', 'game', 'gaming', 'virtual machine', 'premiere', 'editing'] },
        { v: 'nothing', label: 'Hardly anything, yet memory is still high', m: ['nothing open', 'hardly anything', 'doing nothing'] },
        { v: 'unsure', label: 'I\'m not sure', m: [] }] }],
    branches: [
      { when: { trigger: 'browser' }, causes: ['Browser tabs and extensions using large amounts of memory'], steps: ['mem-browser', 'sh-taskmgr', 'sh-restart', 'mem-upgrade-info'] },
      { when: { trigger: 'bigapp' }, causes: ['The program\'s needs are close to or above the PC\'s installed memory'], steps: ['sh-taskmgr', 'sh-restart', 'mem-virtual', 'mem-upgrade-info'] },
      { causes: ['A background program using memory it does not release', 'Too many start-up programs', 'Unwanted software'], steps: ['sh-taskmgr', 'sh-restart', 'mem-startup', 'sh-malware', 'mem-virtual', 'mem-upgrade-info'] }
    ],
    escalation: 'If memory is regularly full even with a few normal apps, the PC probably has too little RAM for the way you use it. A technician can check whether it can be upgraded (many thin laptops have soldered memory).',
    steps: {
      'mem-browser': { title: 'Reduce browser memory use', why: 'Each tab and extension is a separate process. Dozens of tabs can use several gigabytes.', i: ['Close tabs you are not using, or bookmark them for later.', 'In Edge or Chrome, open **Settings**, find **Performance** and switch on **Memory Saver** (Chrome) or **Sleeping tabs** (Edge).', 'Press {{Shift + Esc}} in the browser to see the heaviest tabs and end them.', 'Disable extensions you do not need.'], time: '10 min', diff: 'Easy', result: 'Lower memory use in Task Manager.', warn: 'Tabs you close may lose unsaved form content.', fail: 'If memory remains high with the browser closed, continue.' },
      'mem-startup': { title: 'Stop unneeded programs starting with Windows', why: 'Programs that launch at sign-in sit in memory all day.', i: V(['Press {{Ctrl + Shift + Esc}} then **Startup apps**.', 'Right-click programs you do not need from the start and choose **Disable**.', 'Restart the PC.'], ['Press {{Ctrl + Shift + Esc}} then the **Startup** tab.', 'Right-click programs you do not need from the start and choose **Disable**.', 'Restart the PC.']), time: '10 min', diff: 'Easy', result: 'More free memory after restart.', warn: 'Leave security software and anything you do not recognise enabled.', fail: 'If nothing changes, continue.' },
      'mem-virtual': { title: 'Make sure Windows can manage the page file', why: 'When physical memory runs out, Windows uses part of the drive as extra memory (the page file). Leaving it on automatic lets Windows size it. This step only checks it has not been disabled.', i: ['Press {{Windows key + R}}, type `sysdm.cpl` and press Enter.', 'Open the **Advanced** tab, under **Performance** select **Settings**, then the **Advanced** tab, then **Change** under Virtual memory.', 'Make sure **Automatically manage paging file size for all drives** is ticked.', 'Select **OK** and restart if asked.'], time: '5 min', diff: 'Moderate', result: 'Windows manages virtual memory automatically.', warn: 'Do not set a custom size unless a technician advises it. Work PCs may restrict this.', fail: 'If it was already automatic, continue.' },
      'mem-upgrade-info': { title: 'Decide whether more memory is needed', why: 'If the PC regularly runs close to full with your normal apps, adding RAM is often the most effective fix, but not every PC allows it.', i: ['Press {{Ctrl + Shift + Esc}} and open **Performance** > **Memory**.', 'Note the total memory and what percentage is used while you work normally.', 'As a rough guide, 8 GB is a minimum for everyday use on Windows 11 and 16 GB is more comfortable for heavy multitasking.', 'Search your laptop or PC model with "RAM upgrade" to see whether memory is upgradeable, or ask a technician.'], time: '10 min', diff: 'Easy', result: 'You know whether a memory upgrade would help.', fail: 'This step gives information only; continue if you need further help.' }
    }
  });

  F.push({
    id: 'freezing', title: 'PC keeps freezing', cat: 'performance',
    blurb: 'The screen locks up, the mouse stops, or programs stop responding.',
    symptoms: ['Whole screen freezes', 'Mouse stops moving', 'Apps show "Not responding"', 'Needs the power button held down to recover'],
    keywords: ['freezing', 'freezes', 'frozen', 'keeps freezing', 'computer froze', 'pc froze', 'hangs', 'hanging', 'locks up', 'locked up', 'not responding', 'stuck', 'stops responding', 'unresponsive', 'screen freezes', 'mouse frozen', 'keeps hanging', 'freeze randomly', 'randomly freezes'],
    versions: ['10', '11'], difficulty: 'Moderate', time: '30–60 min', risk: 'Low', admin: false,
    prereq: 'The PC works for at least a few minutes between freezes.',
    expected: 'You find the trigger, or the freezes stop.',
    ms: MS_PERF,
    questions: [
      { id: 'scope', text: 'What freezes?', options: [
        { v: 'one-app', label: 'Just one program', m: ['one program', 'one app', 'only chrome', 'only excel', 'only word', 'a program', 'an app'] },
        { v: 'whole', label: 'The whole PC (mouse and keyboard stop)', m: ['whole pc', 'whole computer', 'everything freezes', 'mouse stops', 'screen freezes', 'whole screen', 'entire'] },
        { v: 'unsure', label: 'I\'m not sure', m: [] }] },
      { id: 'sound', text: 'Do you hear fan noise or feel heat when it freezes?', options: [
        { v: 'hot', label: 'Yes, it is hot or the fan is loud', m: ['hot', 'overheat', 'loud fan', 'fan'] },
        { v: 'normal', label: 'No, it feels normal', m: [] },
        { v: 'unsure', label: 'I\'m not sure', m: [] }] }],
    branches: [
      { when: { scope: 'one-app' }, causes: ['A faulty add-in, file or version of that program', 'Insufficient memory when that program runs'], steps: ['freeze-app', 'sh-taskmgr', 'sh-updates', 'sh-restart'] },
      { when: { sound: 'hot' }, causes: ['Overheating forcing the PC to stop or slow', 'Blocked vents or fan'], steps: ['freeze-heat', 'sh-restart', 'sh-driver', 'sh-updates', 'chkdsk-freeze'] },
      { causes: ['A driver fault', 'Failing drive or memory', 'Damaged system files', 'Unwanted software'], steps: ['sh-restart', 'sh-updates', 'sh-driver', 'sh-malware', 'sh-sfc', 'chkdsk-freeze', 'freeze-events'] }
    ],
    escalation: 'Whole-PC freezes that continue after updates and drivers can mean failing memory, a failing drive or overheating. Back up your files and ask a technician to test the hardware. Include when the freezes happen.',
    steps: {
      'freeze-app': { title: 'Isolate the program that freezes', why: 'If only one program freezes, the problem is usually in that program, its add-ins, or the specific file you open.', i: ['Close the program using **End task** in Task Manager ({{Ctrl + Shift + Esc}}) if needed.', 'Reopen it and check for its own updates in **Help** or **About**.', 'Start it with add-ins switched off if it supports that (for classic Outlook see the Advanced command below).', 'Try a different file in the program. If only one file freezes, that file is the problem.'], adv: ['Classic Outlook: Run dialog > `outlook.exe /safe`.'], cmd: ['outlook-safe'], time: '15 min', diff: 'Moderate', result: 'The program opens and stays responsive.', warn: 'Unsaved work in the frozen program may be lost when you end the task.', fail: 'If it still freezes, report the issue to the program\'s vendor.' },
      'freeze-heat': { title: 'Check temperature and airflow', why: 'Dust or blocked vents make a PC run hot, and it may freeze or slow down to protect itself.', i: ['Switch the PC off. Make sure vents on the sides and underneath are not covered by a bed, sofa or lap.', 'Place a laptop on a hard, flat surface or a stand.', 'If you are comfortable, gently use compressed air on the vents with the PC switched off and unplugged. Do not open the case if the PC is under warranty.', 'Switch on and use it. If freezes stop, heat was the cause.'], time: '15 min', diff: 'Easy', result: 'Lower temperatures and fewer freezes.', warn: 'If you smell burning or see smoke, unplug and stop; see the overheating guide. Do not use a vacuum cleaner on electronics.', fail: 'If the PC is still hot with clean vents, a technician should check the fan and thermal paste.' },
      'chkdsk-freeze': { title: 'Scan the drive for errors', why: 'A struggling drive can make everything stall while Windows waits for data.', i: ['Select **Start**, type **cmd**, right-click **Command Prompt** and choose **Run as administrator**.', 'Type `chkdsk C: /scan` and press Enter.', 'If it reports problems, copy your important files elsewhere first.'], cmd: ['chkdsk-scan'], admin: true, time: '15 min', diff: 'Moderate', result: 'No problems found, or problems listed for a technician.', warn: 'Do not run repair options without a backup. Needs administrator rights.', fail: 'If it cannot run, continue.' },
      'freeze-events': { title: 'Find out what Windows recorded', why: 'Windows keeps a log of errors. The entry just before a freeze or restart can name the faulty driver or device, which is useful for IT support.', i: ['Right-click **Start** and choose **Event Viewer**.', 'Open **Windows Logs** > **System**.', 'Look for **Critical** or **Error** entries around the time of the last freeze. Entries called **Kernel-Power** with ID 41 mean the PC lost power or was force-restarted.', 'Write down the Source and Event ID of the entries around the time of the freeze and add them to your notes for IT.'], time: '10 min', diff: 'Moderate', result: 'You have the names of any error sources to give to support.', warn: 'Event Viewer contains many harmless warnings. Do not worry about every red icon.', fail: 'If nothing relevant appears, escalate with a description of when the freezes occur.' }
    }
  });

  F.push({
    id: 'disk-space-low', title: 'Disk space running low', cat: 'performance',
    blurb: 'Windows says the drive is almost full or you cannot save or update.',
    symptoms: ['"Low disk space" warning', 'Red bar on the C: drive', 'Updates fail for lack of space', 'Cannot save files'],
    keywords: ['low disk space', 'disk full', 'drive full', 'hard drive full', 'storage full', 'no space', 'not enough space', 'out of space', 'running out of space', 'c drive full', 'c: full', 'disk space', 'storage almost full', 'free up space', 'free up storage', 'drive is red', 'ssd full', 'not enough storage'],
    versions: ['10', '11'], difficulty: 'Easy', time: '20–40 min', risk: 'Low', admin: false,
    prereq: 'Be able to sign in. Do not delete anything you are unsure about.',
    expected: 'More free space on the C: drive.',
    ms: { label: 'Free up drive space in Windows (Microsoft)', url: 'https://support.microsoft.com/windows/free-up-drive-space-in-windows-85529ccb-c365-490d-b548-831022bc9b32' },
    questions: [
      { id: 'what', text: 'Do you know what is filling the drive?', options: [
        { v: 'photos', label: 'Photos, videos or downloads', m: ['photos', 'videos', 'downloads', 'pictures', 'movies'] },
        { v: 'apps', label: 'Programs and games', m: ['games', 'programs', 'apps', 'software'] },
        { v: 'unsure', label: 'I\'m not sure', m: [] }] }],
    branches: [
      { when: { what: 'photos' }, causes: ['Large personal files on the system drive'], steps: ['space-review', 'space-cloud', 'space-temp', 'space-apps'] },
      { when: { what: 'apps' }, causes: ['Installed programs and games'], steps: ['space-review', 'space-apps', 'space-temp', 'space-cloud'] },
      { causes: ['Temporary files and old updates', 'Large files you have forgotten about', 'Large programs'], steps: ['space-review', 'space-temp', 'space-large', 'space-apps', 'space-cloud'] }
    ],
    escalation: 'If the drive is still nearly full after the steps, the drive may simply be too small for your needs. A technician can advise on an upgrade or external storage. If the full space cannot be explained, ask IT to check for a large log or a stuck backup.',
    steps: {
      'space-review': { title: 'See what is using the space', why: 'Windows can break down storage by category so you can target the biggest items rather than guessing.', i: V(['Open **Settings** > **System** > **Storage**.', 'Wait for the categories to load, then select the biggest ones such as **Apps & features**, **Temporary files** or **Documents**.', 'Note which category is largest.'], ['Open **Settings** > **System** > **Storage**.', 'Wait for the categories to load, then select the biggest ones such as **Apps & features**, **Temporary files** or **Documents**.', 'Note which category is largest.']), time: '5 min', diff: 'Easy', result: 'You know where the space is going.', fail: 'If the categories do not load, restart and try again.' },
      'space-temp': { title: 'Clear temporary files', why: 'Windows keeps temporary files, thumbnails and update leftovers that can safely be removed.', i: V(['In **Settings** > **System** > **Storage**, select **Temporary files**.', 'Read each item. Tick **Temporary files**, **Thumbnails**, **Delivery Optimization Files** and **Recycle Bin**.', 'Leave **Downloads** unticked unless you have checked it.', 'Select **Remove files**.', 'Switch on **Storage Sense** on the Storage page.'], ['In **Settings** > **System** > **Storage**, select **Temporary files**.', 'Read each item. Tick **Temporary files**, **Thumbnails**, **Delivery Optimization Files** and **Recycle Bin**.', 'Leave **Downloads** unticked unless you have checked it.', 'Select **Remove files**.', 'Switch on **Storage sense** on the Storage page.']), time: '10 min', diff: 'Easy', result: 'Several gigabytes freed.', warn: 'The Recycle Bin is permanently emptied. Check it first.', fail: 'If little is freed, continue to the next step.' },
      'space-apps': { title: 'Remove programs you no longer use', why: 'Large programs and games can take tens of gigabytes. Removing ones you do not use is safe; you can reinstall them later.', i: V(['Open **Settings** > **Apps** > **Installed apps**.', 'Sort by **Size** using the sort menu.', 'Select the three dots beside programs you no longer need and choose **Uninstall**.'], ['Open **Settings** > **Apps** > **Apps & features**.', 'Sort by **Size**.', 'Select programs you no longer need and choose **Uninstall**.']), time: '15 min', diff: 'Easy', result: 'Space is freed and the program list is shorter.', warn: 'Do not uninstall anything you do not recognise, especially drivers and manufacturer tools. Ask IT on a work PC.', fail: 'If nothing is safe to remove, move to the next step.' },
      'space-large': { title: 'Find the largest files and folders', why: 'A handful of very large files (old installers, video recordings, virtual-machine disks, game captures) often account for most of the used space. Sorting by size finds them quickly.', i: ['Open **File Explorer** and go to **This PC** > **Local Disk (C:)** > **Users** > your name.', 'Open **Downloads** and **Videos**, right-click an empty area, choose **Sort by** > **Size** and then **Descending** (use the Details view).', 'Look for old installers (.exe, .msi), disc images (.iso) and large video files you have already watched or backed up.', 'Right-click items you are sure you no longer need and choose **Delete**, then empty the Recycle Bin once you have double-checked it.'], time: '15 min', diff: 'Easy', result: 'A few large files removed frees several gigabytes.', warn: 'Only delete files you recognise. Do not delete anything in the Windows, Program Files or ProgramData folders.', fail: 'If everything large is something you need, move it to an external drive or cloud storage.' },
      'space-cloud': { title: 'Move large personal files off the C: drive', why: 'Photos, videos and downloads are the most common space hogs. Moving them to OneDrive, other cloud storage, or an external drive frees space while keeping them safe.', i: ['Open **File Explorer** and look in **Downloads**, **Videos** and **Pictures**.', 'Right-click the folder and choose **Properties** to see its size.', 'Copy large items you want to keep to an external drive or your cloud storage.', 'Check the copies open correctly, then delete the originals from the C: drive.'], time: '20+ min', diff: 'Easy', result: 'Significant space freed with your files still safe.', warn: 'Only delete the originals after confirming the copies open correctly. Deleted files go to the Recycle Bin, which counts against space until emptied.', fail: 'If you cannot move enough, consider an external drive or ask a technician about larger storage.' }
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
