'use strict';

const braces = require('braces');

exports.win32 = [
  '\\$GetCurrent',
  '\\$Recycle.Bin',
  'desktop.ini',
  'Documents and Settings',
  'found.00{0..100}',
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
  'Windows{0..20}Upgrade',
  'Windows/System32',
  'WinSxS'
].reduce((acc, dir) => acc.concat(braces.expand(dir)), []);

exports.darwin = [
  '.smbdelete*',
  '.TemporaryItems',
  'bootmgr',
  'BOOTNXT',
  'Google',
  'Seagate',
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
].reduce((acc, dir) => acc.concat(braces.expand(dir)), []);

exports.linux = exports.darwin;
