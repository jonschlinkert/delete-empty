'use strict';

exports.win32 = {
  names: new Set([
    '\\$GetCurrent',
    '\\$Recycle.Bin',
    'desktop.ini',
    'Documents and Settings',
    'found.00[0-9]',
    'hiberfil.sys',
    'Page File.sys',
    'pagefile.sys',
    'PerfLogs',
    'Program Files \\(x86\\)',
    'Program Files',
    'ProgramData',
    'Recovery',
    'swapfile.sys',
    'System Volume Information',
    'System32',
    'Users',
    'Windows',
    'Windows[0-9]+Upgrade',
    'Windows/System32',
    'WinSxS'
  ]),
  paths: new Set()
};

exports.darwin = {
  names: new Set([
    '.smbdelete*',
    '.TemporaryItems',
    'bootmgr',
    'BOOTNXT',
    'Google',
    'Seagate'
  ]),
  paths: new Set([
    '/.file',
    '/.vol',
    '/.VolumeIcon.icns',
    '/Applications',
    '/bin',
    '/cores',
    '/etc',
    '/home',
    '/Library',
    '/opt',
    '/private',
    '/sbin',
    '/System',
    '/tmp',
    '/Users',
    '/Users/*',
    '/Users/*/{Applications,Creative Cloud Files,Desktop,Documents,Downloads,Library,Movies,Music,Pictures,Public,.Trash}',
    '/usr',
    '/var',
    '/Volumes'
  ])
};
