import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

export const SOURCE_DIR = path.join(root, 'packages', 'lecharge-ui');

export const FILES = ['tokens.css', 'components.css', 'print.css', 'sprite.svg', 'COMPONENTS.md'];

export const TARGET_DIRS = [
  path.join(root, 'plugins', 'lecharge-proposals', 'skills', 'proposal-generator', 'assets'),
  path.join(root, 'plugins', 'lecharge-landing', 'skills', 'landing-editor', 'assets'),
];
