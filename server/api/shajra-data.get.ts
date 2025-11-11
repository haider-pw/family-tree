import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';

export default defineEventHandler(async () => {
  const filePath = resolve(process.cwd(), 'server/api/shajra-data.json');
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
});
