/* What's Wrong With My PC? — knowledge base core
 * Registry + commands library + error-code library + safety messages + shared steps.
 * Content lives in kb-*.js data files; none of this file contains application logic.
 * Loads in the browser (window.WT_KB) and in Node (globalThis.WT_KB) for tests.
 *
 * Markup allowed inside strings (rendered safely, never as HTML):
 *   **bold**   `monospace`   {{Key + Combo}}  (rendered as <kbd>)
 */
(function (root) {
  'use strict';
  var KB = root.WT_KB = root.WT_KB || {};
  KB.flows = KB.flows || [];
  KB.shared = KB.shared || {};
  KB.reviewed = '2026-10-13';

  KB.categories = {
    performance: { label: 'Performance', icon: 'gauge' },
    network: { label: 'Internet & networking', icon: 'wifi' },
    windows: { label: 'Windows & startup', icon: 'monitor' },
    av: { label: 'Audio & video', icon: 'volume' },
    devices: { label: 'Devices', icon: 'usb' },
    m365: { label: 'Microsoft 365', icon: 'mail' },
    hardware: { label: 'Hardware & power', icon: 'battery' }
  };

  /* ---------- Safety stop messages (shown instead of troubleshooting) ---------- */
  KB.safety = {
    'battery-swollen': {
      title: 'Stop using the device and keep it away from heat',
      stop: true,
      text: [
        'A swollen, bulging or hot battery can catch fire. Do not keep charging or using this device.',
        'Unplug the charger, power the device off if you can do so safely, and move it away from flammable items such as beds, sofas and paper.',
        'Do not press on, puncture or try to open the battery or the case.',
        'Contact the manufacturer or a qualified repair technician. Many councils and shops have a safe battery-disposal route.'
      ]
    },
    'smoke-burning': {
      title: 'Power the device off now and unplug it',
      stop: true,
      text: [
        'Smoke, sparks or a burning smell can mean an electrical fault or a failing battery.',
        'If it is safe to do so, unplug the charger and power the device off. If there is visible smoke or flame, leave the area and call your local emergency number.',
        'Do not use the device again until a qualified technician has inspected it.'
      ]
    },
    'liquid-spill': {
      title: 'Power off and do not charge it',
      stop: true,
      text: [
        'Liquid damage can short-circuit components and cause fires while charging.',
        'Unplug everything, power the device off and do not turn it back on or charge it.',
        'Take it to a qualified repair technician as soon as you can. Do not use a hairdryer or oven to dry it.'
      ]
    },
    'bitlocker': {
      title: 'This device may be protected by BitLocker',
      stop: false,
      text: [
        'If Windows asks for a BitLocker recovery key, you need that key to get into your files. It is usually saved in your Microsoft account (account.microsoft.com/devices/recoverykey) or held by your work or school IT team.',
        'Do not reset Windows, reformat the drive or change security settings until you have located the key or spoken to IT support.'
      ]
    },
    'managed-device': {
      title: 'Work or school devices may be managed',
      stop: false,
      text: [
        'If this device belongs to your employer or school, some settings are locked and some of these steps may be blocked or not permitted.',
        'If a step is greyed out or asks for an administrator password, stop and contact your IT administrator instead of trying to work around it.'
      ]
    },
    'data-failing-drive': {
      title: 'Back up your files before anything else',
      stop: false,
      text: [
        'Clicking, grinding or repeated disk errors can mean a failing drive. Further use can make data recovery harder.',
        'Copy anything important to another drive or cloud storage now if you can, then ask a technician to check the drive.'
      ]
    }
  };

  /* ---------- Windows commands library ----------
   * Static strings only. Commands are never built from user input and never executed by the site.
   * placeholder: true means the text contains an <angle-bracket> value the user must replace by hand. */
  KB.commands = {
    'winver': {
      cmd: 'winver', shell: 'Run dialog ({{Windows key + R}})', admin: false,
      what: 'Opens a small window showing your Windows edition and version.',
      when: 'Use this if you are not sure whether you have Windows 10 or Windows 11.',
      prereq: 'None.',
      output: 'A dialog titled "About Windows" showing, for example, Windows 11 and a version number.',
      interpret: 'The big heading tells you whether you are on Windows 10 or Windows 11.',
      caution: 'Read-only. Changes nothing.'
    },
    'ipconfig-all': {
      cmd: 'ipconfig /all', shell: 'Command Prompt', admin: false,
      what: 'Lists every network adapter with its IP address, gateway and DNS servers.',
      when: 'When you need to see whether the PC has received a valid address from your router.',
      prereq: 'Open Command Prompt (search for "cmd" in Start).',
      output: 'A long list of adapters. Look under "Wireless LAN adapter Wi-Fi" or "Ethernet adapter".',
      interpret: 'An IPv4 address starting 169.254 means the PC did not get an address from the router (DHCP failure). A normal home address looks like 192.168.x.x or 10.x.x.x. "Media disconnected" means the adapter has no link.',
      caution: 'Read-only. Do not share the full output publicly; it contains your device and network details.'
    },
    'ipconfig-flushdns': {
      cmd: 'ipconfig /flushdns', shell: 'Command Prompt', admin: false,
      what: 'Clears the PC\'s cache of website name look-ups.',
      when: 'When some websites fail to load, or a site moved and your PC still goes to the old place.',
      prereq: 'Open Command Prompt.',
      output: '"Successfully flushed the DNS Resolver Cache."',
      interpret: 'That message means it worked. It does not by itself fix a broken internet connection.',
      caution: 'Safe and reversible. The cache rebuilds automatically.'
    },
    'ipconfig-renew': {
      cmd: 'ipconfig /release\nipconfig /renew', shell: 'Command Prompt (run as administrator)', admin: true,
      what: 'Gives up the current network address and asks the router for a new one.',
      when: 'When ipconfig /all shows a 169.254.x.x address or the PC lost its address after a router change.',
      prereq: 'Run Command Prompt as administrator. Save your work: you will briefly lose network access.',
      output: 'After /renew, a fresh IPv4 address, subnet mask and default gateway.',
      interpret: 'If you still get 169.254.x.x, the router is not answering. Restart the router, then try another device on the same network.',
      caution: 'You will be disconnected from the network for a few seconds. Do not run this over a remote session you depend on.'
    },
    'ping-public': {
      cmd: 'ping 1.1.1.1', shell: 'Command Prompt', admin: false,
      what: 'Sends four small test messages to a public internet server by number rather than by name.',
      when: 'To tell apart "no internet at all" from "internet works but names do not resolve".',
      prereq: 'Open Command Prompt.',
      output: 'Four lines saying "Reply from 1.1.1.1", or "Request timed out".',
      interpret: 'Replies but websites still fail: probably a DNS problem. Timeouts: the connection to the internet itself is down (router, cable, ISP or Wi-Fi).',
      caution: 'Read-only. Some work networks block ping, so a timeout there is not conclusive.'
    },
    'ping-gateway': {
      cmd: 'ping <your-router-address>', shell: 'Command Prompt', admin: false, placeholder: true,
      what: 'Tests whether your PC can reach your own router.',
      when: 'After ipconfig /all shows a "Default Gateway", to see whether the problem is inside your home or beyond it.',
      prereq: 'Replace <your-router-address> with the Default Gateway number from ipconfig /all (often 192.168.1.1 or similar).',
      output: 'Replies from the router address, or "Request timed out".',
      interpret: 'Replies mean your PC and router talk fine, so look beyond the router (ISP). Timeouts mean the problem is between this PC and the router.',
      caution: 'Read-only. Type the address yourself; do not paste addresses from messages or websites you do not trust.'
    },
    'nslookup': {
      cmd: 'nslookup microsoft.com', shell: 'Command Prompt', admin: false,
      what: 'Asks your DNS server to translate a website name into an address.',
      when: 'When websites will not load but pinging 1.1.1.1 works.',
      prereq: 'Open Command Prompt.',
      output: 'The DNS server used, followed by one or more addresses for the name.',
      interpret: '"DNS request timed out" or "Non-existent domain" for a major site points to a DNS problem on the PC, router or ISP.',
      caution: 'Read-only.'
    },
    'tracert': {
      cmd: 'tracert 1.1.1.1', shell: 'Command Prompt', admin: false,
      what: 'Shows each network hop between your PC and a public server.',
      when: 'To see where a connection stops: at your router, or further out.',
      prereq: 'Open Command Prompt. It can take up to a minute.',
      output: 'A numbered list of hops with response times.',
      interpret: 'If hop 1 (your router) fails, the problem is local. If it fails later, the problem is with the ISP or beyond. Lines of "*" can just mean a device ignores these tests.',
      caution: 'Read-only. Press Ctrl + C to stop it.'
    },
    'netsh-winsock': {
      cmd: 'netsh winsock reset', shell: 'Command Prompt (run as administrator)', admin: true,
      what: 'Resets the Windows networking software layer to its defaults.',
      when: 'Only after simpler network steps have failed and you suspect corrupt network settings, for example after removing VPN or security software.',
      prereq: 'Administrator rights. Save your work; a restart is required afterwards.',
      output: '"Successfully reset the Winsock Catalog. You must restart the computer in order to complete the reset."',
      interpret: 'Restart, then test the connection again.',
      caution: 'May remove network filters installed by VPN or security software, which might need reinstalling. Not appropriate on work devices without IT approval.'
    },
    'wlanreport': {
      cmd: 'netsh wlan show wlanreport', shell: 'Command Prompt (run as administrator)', admin: true,
      what: 'Builds an HTML report of recent Wi-Fi connection history and errors.',
      when: 'For repeated Wi-Fi drops or connection failures, or to give to IT support.',
      prereq: 'Administrator rights.',
      output: 'A message giving the report location, usually C:\\ProgramData\\Microsoft\\Windows\\WlanReport\\wlan-report-latest.html.',
      interpret: 'Open the HTML file in your browser. Red marks show failed sessions and the reason Windows recorded.',
      caution: 'Read-only. The report contains Wi-Fi network names; share it with care.'
    },
    'sfc': {
      cmd: 'sfc /scannow', shell: 'Command Prompt (run as administrator)', admin: true,
      what: 'Checks protected Windows system files and repairs damaged ones from a stored copy.',
      when: 'For unexplained crashes, odd errors, or failed updates, after the simpler steps.',
      prereq: 'Administrator rights. Leave the PC plugged in; it can take 10–30 minutes.',
      output: 'One of: "did not find any integrity violations", "found corrupt files and successfully repaired them", or "found corrupt files but was unable to fix some of them".',
      interpret: 'The third message usually means you should run the DISM repair command next, then run sfc again.',
      caution: 'Do not close the window while it runs. It does not touch your personal files.'
    },
    'dism-check': {
      cmd: 'DISM /Online /Cleanup-Image /CheckHealth', shell: 'Command Prompt (run as administrator)', admin: true,
      what: 'Quickly checks whether Windows has recorded damage in its component store.',
      when: 'As a fast first check before a deeper repair.',
      prereq: 'Administrator rights.',
      output: '"No component store corruption detected" or "The component store is repairable".',
      interpret: 'If repairable, run the RestoreHealth command next.',
      caution: 'Read-only check.'
    },
    'dism-restore': {
      cmd: 'DISM /Online /Cleanup-Image /RestoreHealth', shell: 'Command Prompt (run as administrator)', admin: true,
      what: 'Repairs the Windows component store, downloading clean files from Microsoft if needed.',
      when: 'After sfc reports damage it cannot fix, or Windows Update keeps failing.',
      prereq: 'Administrator rights and a working internet connection. Can take 15–30 minutes and may look stuck near 20% or 62%.',
      output: '"The restore operation completed successfully."',
      interpret: 'After success, run sfc /scannow again and restart. If it fails with an error code, note the code for IT support.',
      caution: 'Be patient and do not interrupt it. Not guaranteed to fix every fault.'
    },
    'chkdsk-scan': {
      cmd: 'chkdsk C: /scan', shell: 'Command Prompt (run as administrator)', admin: true,
      what: 'Scans the C: drive for file-system errors while Windows keeps running. It does not make repairs.',
      when: 'For freezing, slow disk activity, or after unexpected shutdowns.',
      prereq: 'Administrator rights. May take several minutes.',
      output: '"Windows has scanned the file system and found no problems", or a list of problems found.',
      interpret: 'If problems are reported, back up your files first and ask IT or a technician before running any repair option.',
      caution: 'This scan-only form is safe. Do not add /f or /r without a backup and advice.'
    },
    'mdsched': {
      cmd: 'mdsched.exe', shell: 'Run dialog ({{Windows key + R}})', admin: true,
      what: 'Starts the Windows Memory Diagnostic, which tests your RAM when the PC restarts.',
      when: 'For repeated blue screens or random crashes where faulty memory is suspected.',
      prereq: 'Save all work; the PC restarts and the test can take 15–60 minutes.',
      output: 'After the test, Windows starts and a notification shows the result.',
      interpret: 'Any reported error suggests faulty memory; ask a technician to check or replace it.',
      caution: 'The PC will be unusable during the test.'
    },
    'powercfg-battery': {
      cmd: 'powercfg /batteryreport', shell: 'Command Prompt (run as administrator)', admin: true,
      what: 'Creates an HTML report on battery capacity, usage and health.',
      when: 'For fast battery drain or a battery that no longer lasts.',
      prereq: 'Laptop with a battery. Administrator rights recommended.',
      output: 'A message with the file location, typically C:\\Users\\<you>\\battery-report.html.',
      interpret: 'Compare "Design capacity" with "Full charge capacity". If full charge is far below design (for example under 60%), the battery is worn.',
      caution: 'Read-only.'
    },
    'powercfg-energy': {
      cmd: 'powercfg /energy', shell: 'Command Prompt (run as administrator)', admin: true,
      what: 'Observes the PC for about 60 seconds and reports power-efficiency problems.',
      when: 'For battery drain or power-related problems.',
      prereq: 'Administrator rights. Close apps and leave the PC idle while it runs.',
      output: 'A summary of errors and warnings and the path of energy-report.html.',
      interpret: 'Open the report and read the "Errors" section first; they name the device or setting involved.',
      caution: 'Read-only.'
    },
    'spooler-restart': {
      cmd: 'net stop spooler\nnet start spooler', shell: 'Command Prompt (run as administrator)', admin: true,
      what: 'Stops and restarts the Windows print service.',
      when: 'When a print job is stuck or the printer shows Offline although it is on and connected.',
      prereq: 'Administrator rights.',
      output: '"The Print Spooler service was stopped successfully." then "... was started successfully."',
      interpret: 'If printing now works, a stuck job or service was the cause.',
      caution: 'Pending print jobs may be lost; reprint them afterwards.'
    },
    'wu-reset': {
      cmd: 'net stop wuauserv\nnet stop bits\nren C:\\Windows\\SoftwareDistribution SoftwareDistribution.old\nnet start bits\nnet start wuauserv', shell: 'Command Prompt (run as administrator)', admin: true,
      what: 'Stops the update services, renames Windows Update\'s temporary download folder so Windows rebuilds it, then restarts the services.',
      when: 'Only if updates keep failing after the troubleshooter, a restart and the repair commands.',
      prereq: 'Administrator rights. Not for work devices unless IT agrees. Run the lines in order.',
      output: 'Each service reports stopped or started. The rename prints nothing when it works.',
      interpret: 'Go to Windows Update and select Check for updates. Windows rebuilds the folder and the update history list may appear empty; this is expected.',
      caution: 'The old folder is renamed, not deleted, so this is reversible. If "Access is denied" appears, a service did not stop; restart the PC and try again.'
    },
    'outlook-safe': {
      cmd: 'outlook.exe /safe', shell: 'Run dialog ({{Windows key + R}})', admin: false,
      what: 'Starts classic Outlook with add-ins and customisations switched off.',
      when: 'When Outlook will not open or crashes on start-up, to test whether an add-in is responsible.',
      prereq: 'Classic Outlook (Microsoft 365 Apps) installed. Does not apply to the new Outlook for Windows.',
      output: 'Outlook opens, possibly asking which profile to use.',
      interpret: 'If it opens in safe mode, an add-in is the likely cause. Disable add-ins one at a time under File > Options > Add-ins.',
      caution: 'Nothing is deleted. Close Outlook normally and reopen it to return to normal mode.'
    }
  };

  /* ---------- Curated Windows error-code library ----------
   * Only widely documented meanings. "match" tokens are matched against normalised user text.
   * flows: ids of troubleshooting flows that are relevant. */
  KB.errors = [
    { code: '0x80070005', match: ['0x80070005'], name: 'Access denied (E_ACCESSDENIED)', meaning: 'Windows or an app was refused permission to read or change something. Common causes include missing administrator rights, security software blocking the action, or damaged permissions.', flows: ['windows-update-failure', 'outlook-not-opening'] },
    { code: '0x80070057', match: ['0x80070057'], name: 'The parameter is incorrect (E_INVALIDARG)', meaning: 'A generic message meaning a program passed an invalid value to Windows. It appears in many places, including Windows Update, backup and disk tools, so the surrounding context matters.', flows: ['windows-update-failure'] },
    { code: '0x80070002', match: ['0x80070002'], name: 'File not found (ERROR_FILE_NOT_FOUND)', meaning: 'Windows could not find a file it expected. In Windows Update it often points to missing or damaged update files.', flows: ['windows-update-failure'] },
    { code: '0x80004005', match: ['0x80004005'], name: 'Unspecified error (E_FAIL)', meaning: 'A catch-all failure code with no specific cause. Treat it as a symptom: look at what you were doing when it appeared.', flows: ['windows-update-failure', 'outlook-not-opening'] },
    { code: '0x80073712', match: ['0x80073712'], name: 'Component store file missing or damaged', meaning: 'A file Windows Update needs in the Windows component store is missing or damaged (ERROR_SXS_COMPONENT_STORE_CORRUPT). Repairing the store with DISM and sfc usually comes first.', flows: ['windows-update-failure'] },
    { code: '0x800f0922', match: ['0x800f0922'], name: 'Update installation failed (CBS_E_INSTALLERS_FAILED)', meaning: 'A Windows update or feature could not finish installing. Causes documented by Microsoft and support communities include a full System Reserved partition, an active VPN, or a damaged component store.', flows: ['windows-update-failure'] },
    { code: '0x80070643', match: ['0x80070643'], name: 'Fatal error during installation', meaning: 'An installer, often a Windows or .NET update, reported a general installation failure. Retrying after a restart and repairing system files are the usual first steps.', flows: ['windows-update-failure'] },
    { code: '0x80070422', match: ['0x80070422'], name: 'Service is disabled', meaning: 'A Windows service that the task needs (often Windows Update) is disabled or not running. Starting the service, or resetting update components, may help.', flows: ['windows-update-failure'] },
    { code: '0x8024402c', match: ['0x8024402c'], name: 'Update server name could not be resolved', meaning: 'Windows Update could not look up the update server address. Check the internet connection, DNS, proxy and VPN settings.', flows: ['windows-update-failure', 'dns-issues'] },
    { code: '0xc1900101', match: ['0xc1900101'], name: 'Upgrade rolled back (driver-related)', meaning: 'A generic code for a Windows upgrade that was rolled back, frequently linked to incompatible drivers or security software. Disconnecting extra devices and updating drivers are standard first steps.', flows: ['windows-update-failure', 'stuck-updating'] },
    { code: '0x80072ee7', match: ['0x80072ee7'], name: 'Server name or address could not be resolved', meaning: 'The device could not look up an internet name (ERROR_INTERNET_NAME_NOT_RESOLVED). Think DNS or no connection.', flows: ['dns-issues', 'wifi-no-internet'] },
    { code: '0x80072efd', match: ['0x80072efd'], name: 'Connection to the server could not be established', meaning: 'The device could not connect to the server (ERROR_INTERNET_CANNOT_CONNECT). Check the connection, firewall, proxy or VPN.', flows: ['wifi-no-internet', 'vpn-problems'] },
    { code: '0x800705b4', match: ['0x800705b4'], name: 'Operation timed out', meaning: 'Windows waited for something that did not respond in time. Seen with updates and device operations; the underlying cause varies.', flows: ['windows-update-failure'] },
    { code: '0x8007045d', match: ['0x8007045d'], name: 'I/O device error', meaning: 'Windows could not read or write to a drive or device (ERROR_IO_DEVICE). Faulty cables, ports, USB sticks or failing drives are typical causes. Back up data first.', flows: ['usb-not-recognised'] },
    { code: '0xc000021a', match: ['0xc000021a'], name: 'Critical system process ended', meaning: 'A vital Windows process such as Winlogon or CSRSS stopped, which makes Windows halt. Often triggered by damaged system files, a failed update or incompatible software.', flows: ['blue-screen', 'wont-boot'] },
    { code: '0xc000000f', match: ['0xc000000f'], name: 'Boot information could not be read', meaning: 'Windows could not read its boot configuration. This can follow disk, update or cable problems and usually needs the startup repair tools.', flows: ['wont-boot'] },
    { code: '0xc0000225', match: ['0xc0000225'], name: 'Boot device or file not found', meaning: 'Windows could not find a required boot component. Startup Repair is the standard low-risk first step.', flows: ['wont-boot'] },
    { code: 'CRITICAL_PROCESS_DIED', match: ['critical_process_died', '0x000000ef'], name: 'Stop code: CRITICAL_PROCESS_DIED', meaning: 'A process Windows cannot run without ended unexpectedly. Often related to faulty drivers, damaged system files or failing storage.', flows: ['blue-screen'] },
    { code: 'IRQL_NOT_LESS_OR_EQUAL', match: ['irql_not_less_or_equal', '0x0000000a'], name: 'Stop code: IRQL_NOT_LESS_OR_EQUAL', meaning: 'A driver or the system tried to use memory it should not. Usually a faulty or recently updated driver, or sometimes faulty RAM.', flows: ['blue-screen'] },
    { code: 'PAGE_FAULT_IN_NONPAGED_AREA', match: ['page_fault_in_nonpaged_area', '0x00000050'], name: 'Stop code: PAGE_FAULT_IN_NONPAGED_AREA', meaning: 'Windows looked for data in memory where it should have been and it was not there. Drivers, security software or faulty RAM are common causes.', flows: ['blue-screen'] },
    { code: 'SYSTEM_SERVICE_EXCEPTION', match: ['system_service_exception', '0x0000003b'], name: 'Stop code: SYSTEM_SERVICE_EXCEPTION', meaning: 'A system service hit an error, frequently caused by a driver (graphics drivers are a common culprit) or damaged system files.', flows: ['blue-screen'] },
    { code: 'INACCESSIBLE_BOOT_DEVICE', match: ['inaccessible_boot_device', '0x0000007b'], name: 'Stop code: INACCESSIBLE_BOOT_DEVICE', meaning: 'Windows lost access to the drive it starts from. Can follow a failed update, driver or drive problem, or storage-mode changes. Do not change BIOS storage settings without advice.', flows: ['wont-boot', 'blue-screen'] },
    { code: 'KERNEL_SECURITY_CHECK_FAILURE', match: ['kernel_security_check_failure', '0x00000139'], name: 'Stop code: KERNEL_SECURITY_CHECK_FAILURE', meaning: 'Windows detected corrupted data in a protected area. Drivers, damaged system files or faulty memory are typical causes.', flows: ['blue-screen'] },
    { code: 'DPC_WATCHDOG_VIOLATION', match: ['dpc_watchdog_violation', '0x00000133'], name: 'Stop code: DPC_WATCHDOG_VIOLATION', meaning: 'A driver took too long to respond. Often storage-controller or other drivers, or outdated firmware on an SSD.', flows: ['blue-screen'] },
    { code: 'WHEA_UNCORRECTABLE_ERROR', match: ['whea_uncorrectable_error', '0x00000124'], name: 'Stop code: WHEA_UNCORRECTABLE_ERROR', meaning: 'The hardware reported a fatal error. It points toward hardware: overheating, a failing CPU, memory or drive, or unstable overclock settings.', flows: ['blue-screen', 'overheating'] },
    { code: 'MEMORY_MANAGEMENT', match: ['memory_management', '0x0000001a'], name: 'Stop code: MEMORY_MANAGEMENT', meaning: 'A serious memory-handling error. Faulty RAM is a common cause, and so are drivers.', flows: ['blue-screen'] },
    { code: 'VIDEO_TDR_FAILURE', match: ['video_tdr_failure', '0x00000116'], name: 'Stop code: VIDEO_TDR_FAILURE', meaning: 'The graphics driver stopped responding and could not recover. Updating or reinstalling the graphics driver and checking temperatures are common steps.', flows: ['blue-screen', 'overheating'] },
    { code: 'UNEXPECTED_STORE_EXCEPTION', match: ['unexpected_store_exception', '0x00000154'], name: 'Stop code: UNEXPECTED_STORE_EXCEPTION', meaning: 'The storage component had an unexpected error. Drive problems, drivers or security software are typical causes.', flows: ['blue-screen'] },
    { code: 'Device Manager code 43', match: ['code 43'], name: 'Device Manager: Code 43', meaning: 'Windows stopped a device because it reported a problem. Seen with USB devices and graphics cards; driver or hardware issues are typical causes.', flows: ['usb-not-recognised', 'external-monitor'] },
    { code: 'Device Manager code 10', match: ['code 10'], name: 'Device Manager: Code 10', meaning: 'The device cannot start. Updating, reinstalling or rolling back its driver is the usual starting point.', flows: ['usb-not-recognised', 'bluetooth-not-connecting'] },
    { code: 'Device Manager code 28', match: ['code 28'], name: 'Device Manager: Code 28', meaning: 'Drivers for the device are not installed. Installing the driver from Windows Update or the manufacturer normally resolves it.', flows: ['usb-not-recognised', 'webcam-not-detected'] }
  ];

  /* ---------- Shared steps used across several flows ---------- */
  function V(v11, v10) { return { 11: v11, 10: v10 }; }
  KB.V = V;

  KB.shared = {
    'sh-restart': {
      title: 'Restart the PC properly',
      why: 'A restart clears temporary glitches and fully reloads Windows and its drivers. "Shut down" followed by switching on is not the same on most modern PCs: Fast Startup saves part of the previous session, so only Restart gives a genuinely fresh start.',
      i: ['Save your work and close your apps.', 'Select the **Start** button, then the **Power** icon.', 'Choose **Restart** (not Shut down).', 'Wait for Windows to return to the sign-in screen, sign in and test the problem again.'],
      time: '5 min', diff: 'Easy', result: 'Windows restarts and the problem may be gone.',
      warn: 'Unsaved work will be lost. Updates may install during the restart, which can make it take longer.',
      fail: 'If the problem returns straight away, carry on to the next step.'
    },
    'sh-taskmgr': {
      title: 'See what is using your PC\'s resources',
      why: 'Task Manager is Windows\' built-in list of everything running. It shows which program is using the most processor, memory, disk or network, so you can spot a single misbehaving app.',
      i: ['Press {{Ctrl + Shift + Esc}} to open Task Manager. If it shows a small window, select **More details**.', 'Open the **Processes** tab.', 'Select the **CPU**, **Memory** and **Disk** column headings in turn to sort by the heaviest users.', 'If one ordinary app (for example a browser tab or a document editor) is using a large share, close it normally first.', 'Only if it will not close: select it, then **End task**. You may lose unsaved work in that app.'],
      adv: ['Right-click the column headings and add **Power usage** or **Network** if useful.'],
      time: '5 min', diff: 'Easy', result: 'You can identify an app that is using an unusually large share of resources.',
      warn: 'Do not end tasks you do not recognise, especially those named System, Windows or Service Host. Search the name first or ask IT.',
      fail: 'If nothing stands out and usage is high everywhere, move on to the next step.'
    },
    'sh-updates': {
      title: 'Install pending Windows updates',
      why: 'Updates fix known bugs and driver problems. A lot of fault reports are simply fixed by a pending update.',
      i: V(['Select **Start**, then **Settings**.', 'Open **Windows Update**.', 'Select **Check for updates** and install anything offered.', 'Restart if asked, then test again.'],
           ['Select **Start**, then **Settings**.', 'Open **Update & Security**, then **Windows Update**.', 'Select **Check for updates** and install anything offered.', 'Restart if asked, then test again.']),
      time: '15–45 min', diff: 'Easy', result: 'Windows reports "You\'re up to date" and the issue may be fixed.',
      warn: 'Keep a laptop plugged in and do not switch it off during an update.',
      fail: 'If updates fail to install, use the "Windows update installation failure" guide instead.',
      link: { label: 'Windows Update FAQ (Microsoft)', url: 'https://support.microsoft.com/windows/windows-update-faq-8a903416-6f45-0718-f5c7-375e92dddeb2' }
    },
    'sh-malware': {
      title: 'Run a Windows Security scan',
      why: 'Unwanted software can slow a PC, hijack browsers or block connections. Windows Security is built in and free; it needs no extra downloads.',
      i: V(['Select **Start**, type **Windows Security** and open it.', 'Select **Virus & threat protection**.', 'Select **Quick scan** and wait for it to finish.', 'If threats are found, select **Start actions** and follow the prompts.'],
           ['Select **Start**, type **Windows Security** and open it.', 'Select **Virus & threat protection**.', 'Select **Quick scan** and wait for it to finish.', 'If threats are found, select **Start actions** and follow the prompts.']),
      adv: ['For a deeper check choose **Scan options** > **Microsoft Defender Offline scan**. This restarts the PC.'],
      time: '10–20 min', diff: 'Easy', result: 'The scan reports no threats, or finds and removes some.',
      warn: 'Never turn off your antivirus to "see if it helps". If you use other security software, use its own scan instead.',
      fail: 'If Windows Security will not open or reports it is managed by your organisation, contact IT.'
    },
    'sh-sfc': {
      title: 'Check and repair Windows system files',
      why: 'Windows has a built-in tool that compares protected system files with a stored good copy and repairs damaged ones. Damaged system files can cause crashes, odd errors and failed updates.',
      i: ['Select **Start**, type **cmd**, right-click **Command Prompt** and choose **Run as administrator**.', 'Type `sfc /scannow` and press Enter.', 'Wait until it reaches 100% and shows a result. This can take 10–30 minutes.', 'If it reports it could not fix some files, type `DISM /Online /Cleanup-Image /RestoreHealth`, press Enter, wait, then run `sfc /scannow` again.', 'Restart the PC and test again.'],
      cmd: ['sfc', 'dism-restore'], admin: true,
      time: '30–60 min', diff: 'Moderate', result: 'Windows reports it repaired corrupt files or found none.',
      warn: 'Needs administrator rights, which a work PC may not allow. Do not close the window while it runs. Personal files are not touched.',
      fail: 'If errors remain, note the exact message and give it to IT support.'
    },
    'sh-net-troubleshooter': {
      title: 'Run the Windows network troubleshooter',
      why: 'Windows can test your network settings and reset small problems automatically, such as a stuck adapter or wrong settings.',
      i: V(['Select **Start**, then **Settings**.', 'Go to **System** > **Troubleshoot** > **Other troubleshooters**.', 'Next to **Network and Internet**, select **Run**.', 'Follow the prompts and let it finish.'],
           ['Select **Start**, then **Settings**.', 'Go to **Network & Internet** > **Status**.', 'Select **Network troubleshooter** and follow the prompts.']),
      time: '5 min', diff: 'Easy', result: 'The troubleshooter reports a fix it applied, or says it could not identify the problem.',
      warn: 'You may be disconnected for a few seconds while it resets the adapter.',
      fail: 'If it finds nothing, that is fine; continue to the next step.'
    },
    'sh-driver': {
      title: 'Update or roll back the device driver',
      why: 'A driver is the small piece of software that lets Windows talk to a piece of hardware. An outdated, damaged or faulty new driver is one of the most common causes of hardware trouble.',
      i: ['Right-click the **Start** button and choose **Device Manager**.', 'Expand the category for the affected device. A yellow warning triangle marks a device with a problem.', 'Right-click the device and choose **Update driver** > **Search automatically for drivers**.', 'If the problem began right after a driver update, double-click the device, open the **Driver** tab and choose **Roll Back Driver** if it is available.', 'Restart the PC and test again.'],
      adv: ['For graphics, network and chipset drivers, the laptop or PC manufacturer\'s support page often has a newer tested driver than Windows Update. Download only from the manufacturer\'s own site.'],
      time: '10–20 min', diff: 'Moderate', result: 'The device works, or the warning triangle disappears.',
      warn: 'Download drivers only from your PC or device manufacturer. Avoid "driver updater" programs and unfamiliar websites.',
      fail: 'If no better driver is found, continue; the cause may be physical.'
    },
    'sh-other-test': {
      title: 'Test with a different cable, port or device',
      why: 'Swapping one part at a time tells you whether the fault is in the PC or in the accessory. It is the quickest way to separate the two.',
      i: ['Unplug the accessory and plug it into a different port on the PC (use a port directly on the PC, not a hub).', 'Try a different cable if you have one.', 'Try the same accessory on another PC, or a different, known-working accessory on this PC.', 'Note what happens in each case.'],
      time: '10 min', diff: 'Easy', result: 'You know whether the fault follows the accessory or stays with this PC.',
      fail: 'If it fails everywhere, the accessory itself is probably faulty. If it only fails on this PC, carry on with the next step.'
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
