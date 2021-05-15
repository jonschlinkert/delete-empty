/**
 * Let's try to avoid accidentally deleting empty system folders.
 * This is not comprehensive. Pull requests are encouraged to add additional
 * patterns, or suggest a better way of doing this.
 */

export const win32 = {
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
    'WinSxS'
  ]),
  paths: new Set([
    'Windows/System32'
  ])
};

export const darwin = {
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

export const linux = {
  paths: new Set([
    '/bin',
    '/boot',
    '/dev',
    '/etc',
    '/home',
    '/lib',
    '/lost+found',
    '/media',
    '/mnt',
    '/opt',
    '/proc',
    '/root',
    '/run',
    '/sbin',
    '/srv',
    '/sys',
    '/tmp',
    '/usr',
    '/var'
  ])
};

export default {
  win32,
  darwin,
  linux: darwin
};
