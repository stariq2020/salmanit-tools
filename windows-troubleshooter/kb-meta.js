/* Metadata layered over the flows: quick cards, hierarchy, SEO landing-page content. */
(function (root) {
  'use strict';
  var KB = root.WT_KB;

  var parents = { 'slow-startup': 'slow-computer' };
  KB.flows.forEach(function (f) { if (parents[f.id]) f.parent = parents[f.id]; });

  /* The 12 quick-access cards on the home screen. */
  KB.quickCards = [
    { label: 'My PC is running slowly', flow: 'slow-computer', icon: 'gauge' },
    { label: 'Wi-Fi connected but no internet', flow: 'wifi-no-internet', icon: 'wifi' },
    { label: 'Windows won\'t start', flow: 'wont-boot', icon: 'power' },
    { label: 'Printer not working', flow: 'printer-offline', icon: 'printer' },
    { label: 'No sound from speakers', flow: 'no-sound', icon: 'volume' },
    { label: 'Blue screen error', flow: 'blue-screen', icon: 'alert' },
    { label: 'Outlook not working', flow: 'outlook-not-opening', icon: 'mail' },
    { label: 'Windows update failing', flow: 'windows-update-failure', icon: 'refresh' },
    { label: 'Laptop battery draining quickly', flow: 'battery-drain', icon: 'battery' },
    { label: 'USB device not recognised', flow: 'usb-not-recognised', icon: 'usb' },
    { label: 'Computer keeps freezing', flow: 'freezing', icon: 'snow' },
    { label: 'Bluetooth not connecting', flow: 'bluetooth-not-connecting', icon: 'bluetooth' }
  ];

  /* Indexable issue pages. Each has distinct copy; the troubleshooting steps themselves come from the flow. */
  KB.seoPages = [
    {
      flow: 'slow-computer', slug: 'windows-troubleshooter-slow-computer.html',
      title: 'Slow Computer Fix for Windows 10 & 11 | Salman IT Tools',
      h1: 'Why Is My Windows PC So Slow?',
      desc: 'A slow Windows laptop or PC usually has one of a handful of causes. Work out which one with simple questions, then follow safe step-by-step fixes. Free, no sign-up.',
      intro: 'A PC that has become slow is rarely "just old". Most of the time one specific thing is holding it back: too many programs starting with Windows, a nearly full drive, a browser using all the memory, or a background update. The quickest fix depends on when the slowness happens, so the guide below asks that first.',
      whenTitle: 'What usually makes a Windows PC slow',
      when: [
        ['Too many start-up programs', 'Chat apps, game launchers and updaters add themselves to start-up. They slow down the first minutes after you sign in.'],
        ['A nearly full drive', 'Windows needs free space to work and update. Below roughly 15% free, everything gets slower.'],
        ['Browser tabs and extensions', 'A browser with dozens of tabs can use several gigabytes of memory on its own.'],
        ['Background work', 'After an update, Windows Search, Windows Update and security scans can use the processor for up to an hour.'],
        ['Not enough memory (RAM)', 'Windows 11 is comfortable with 8 GB for light use and 16 GB for heavier multitasking. Less means a lot of slow "swapping" to disk.']
      ],
      faq: [
        ['Will a restart really help?', 'Often, yes. A proper Restart (not Shut down) clears memory and reloads drivers. Fast Startup can keep part of the previous session alive after a shutdown, so only Restart gives a clean start.'],
        ['Is it safe to disable start-up programs?', 'Yes. Disabling a start-up item does not uninstall it, and you can re-enable it in Task Manager. Leave security software and anything you do not recognise alone.'],
        ['How much free disk space should I keep?', 'Aim for 15-20% free on the C: drive, and at least 20 GB when installing big Windows updates.'],
        ['Should I use a "PC cleaner" or speed-up program?', 'Generally no. Most do little that Windows\' own tools do not, and some are unwanted software themselves. The built-in Storage settings and Task Manager are enough.']
      ],
      related: ['slow-startup', 'high-cpu', 'high-memory', 'disk-space-low', 'freezing']
    },
    {
      flow: 'wifi-no-internet', slug: 'windows-troubleshooter-wifi-connected-no-internet.html',
      title: 'Wi-Fi Connected but No Internet? Fix It | Salman IT Tools',
      h1: 'Wi-Fi Connected but No Internet',
      desc: 'Windows says you are connected to Wi-Fi but nothing loads. Find out whether it is the PC, the router or your provider, then follow safe fixes. Free, no sign-up.',
      intro: 'When Windows shows "Connected" but websites will not open, the fault could be in three different places: your PC, your router, or your internet provider. The fastest way to find out is a single question: do other devices on the same Wi-Fi work? The guide asks that first and then only shows fixes that make sense for the answer.',
      whenTitle: 'Where the fault usually is',
      when: [
        ['Nothing works on any device', 'The router, the modem, or the provider. Restarting the router and checking for an outage comes first.'],
        ['Only this PC is affected', 'A stuck Wi-Fi adapter, stale saved network, VPN or proxy on the PC. Forgetting the network and reconnecting often clears it.'],
        ['Only some websites fail', 'Usually DNS (the system that turns website names into addresses). Clearing the DNS cache or testing with ping can confirm it.'],
        ['Internet drops then returns', 'Weak signal, interference, or an adapter power-saving setting.']
      ],
      faq: [
        ['What does the 169.254 address mean?', 'If ipconfig /all shows an IPv4 address starting 169.254, the PC could not get an address from the router. Restart the router and reconnect; the problem is between the PC and router.'],
        ['What does "Network reset" do?', 'It removes all saved Wi-Fi networks and VPN adapters and reinstalls network adapters. It can fix deep faults, but you will need your Wi-Fi password again, so it is a last step.'],
        ['Should I change my DNS settings?', 'Only as a test. Public DNS can show whether your router\'s DNS is the problem. Change it back to automatic if it does not help, and do not change DNS on a work PC.'],
        ['When should I call my provider?', 'When every device is offline, the router\'s internet light is red or off, and a restart of the router does not help.']
      ],
      related: ['wifi-not-appearing', 'dns-issues', 'ethernet-not-working', 'vpn-problems']
    },
    {
      flow: 'windows-update-failure', slug: 'windows-troubleshooter-windows-update-error.html',
      title: 'Windows Update Error? Step-by-Step Fix | Salman IT Tools',
      h1: 'Windows Update Failing or Showing an Error Code',
      desc: 'Windows updates failing with 0x80070005, 0x800f0922 or another error code? Understand the code and follow safe steps in the right order. Free, no sign-up.',
      intro: 'Windows Update failures look alarming, but the cause is usually one of a few things: not enough free space, a damaged update cache, a VPN or proxy in the way, or a driver that does not like the update. The error code narrows it down, so the guide takes it into account. Order matters: simple and reversible steps come first and the technical repairs last.',
      whenTitle: 'What common update error codes point to',
      when: [
        ['0x80070005 (access denied)', 'Windows or an app was not allowed to change something. Security software or permissions are typical causes.'],
        ['0x800f0922', 'An installation could not complete. Documented causes include an active VPN, low space on a system partition, or a damaged component store.'],
        ['0x80073712', 'A file in the Windows component store is missing or damaged. Repair with DISM and sfc.'],
        ['0x8024402C', 'Windows could not resolve the update server name: check internet, DNS, proxy or VPN.'],
        ['0xC1900101', 'A feature update was rolled back, often because of a driver or security software.']
      ],
      faq: [
        ['Is it safe to run sfc and DISM?', 'Yes. They repair Windows system files and do not touch your documents. They need administrator rights and can take 30 minutes or more.'],
        ['What does resetting Windows Update components do?', 'It renames the SoftwareDistribution folder so Windows rebuilds it. The old folder is kept, so the step is reversible. It is an advanced step, not for work PCs without IT approval.'],
        ['Should I download updates from other websites?', 'No. Use Windows Update, or Microsoft\'s own Update Catalog if you know exactly which KB you need. Never run updates from emails or pop-ups.'],
        ['Will I lose files if an update fails?', 'Normally no, but have a backup before big feature updates. Never switch the PC off while the update is actively writing to disk.']
      ],
      related: ['stuck-updating', 'disk-space-low', 'blue-screen', 'wont-boot']
    },
    {
      flow: 'outlook-not-opening', slug: 'windows-troubleshooter-outlook-not-opening.html',
      title: 'Outlook Not Opening or Crashing? Fix It | Salman IT Tools',
      h1: 'Outlook Won\'t Open, Hangs or Closes Straight Away',
      desc: 'Outlook stuck on Loading profile, crashing on start or not opening at all? Work through safe fixes in the right order: Safe Mode, add-ins, repair and new profile. Free.',
      intro: 'When classic Outlook will not open, the usual suspects are a faulty add-in, a stuck background process, a damaged profile or a damaged Office installation. The right order is to start Outlook in Safe Mode first, because it takes seconds and tells you whether an add-in is responsible. Only then move on to repairs. Your email stays on the server throughout.',
      whenTitle: 'What each symptom suggests',
      when: [
        ['Closes immediately', 'Often an add-in that crashes on start. Safe Mode (outlook.exe /safe) will normally reveal it.'],
        ['Stuck on "Loading profile"', 'A large data file, a stuck process or a damaged profile. Ending OUTLOOK.EXE in Task Manager and restarting helps first.'],
        ['"Cannot start Microsoft Outlook"', 'A damaged profile or Office files. Repair Office and, if needed, create a new profile.'],
        ['New Outlook for Windows', 'Different app: reset it from Settings > Apps, and check you can read mail at outlook.office.com.']
      ],
      faq: [
        ['Will I lose emails if I make a new profile?', 'Mail stored on your Microsoft 365 or Exchange mailbox stays on the server and re-downloads. Take care with local PST files, which exist only on this PC: do not delete them.'],
        ['What is Safe Mode in Outlook?', 'It starts Outlook without add-ins and custom settings. It changes nothing permanently, and closing and reopening Outlook normally returns to normal.'],
        ['Which Outlook am I using?', 'Classic Outlook has a ribbon with File, Home and Send/Receive. The new Outlook for Windows has a simpler look and a New Outlook toggle in some versions.'],
        ['Can I still read my mail meanwhile?', 'Yes: sign in at outlook.office.com in a browser. That also confirms whether your account itself is fine.']
      ],
      related: ['outlook-credentials', 'onedrive-sync', 'teams-mic-not-working']
    }
  ];

  KB.popular = ['slow-computer', 'wifi-no-internet', 'windows-update-failure', 'outlook-not-opening', 'blue-screen', 'printer-offline'];
})(typeof window !== 'undefined' ? window : globalThis);
