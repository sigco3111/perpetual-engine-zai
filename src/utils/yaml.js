import { parse, stringify } from 'yaml';
import { readFile, writeFile } from 'node:fs/promises';
export async function readYaml(filePath) {
    const content = await readFile(filePath, 'utf-8');
    return parse(content);
}
export async function writeYaml(filePath, data) {
    const content = stringify(data, { indent: 2 });
    await writeFile(filePath, content, 'utf-8');
}
//# sourceMappingURL=yaml.js.map