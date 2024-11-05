import fs from 'fs';
import path from 'path';

const copyContract = (src: string, dst: string) => {
  fs.writeFileSync(dst, fs.readFileSync(src));
};

const copyABI = (src: string, dst: string) => {
  const { abi } = JSON.parse(fs.readFileSync(src, { encoding: 'utf-8' }));
  fs.writeFileSync(dst, JSON.stringify(abi, null, 2));
};

const copyTypeScript = (src: string, dst: string) => {
  const { abi } = JSON.parse(fs.readFileSync(src, { encoding: 'utf-8' }));
  fs.writeFileSync(dst, `export default ${JSON.stringify(abi, null, 2)} as const;`);
};

copyContract('contracts/ISignable.sol', 'ISignable.sol');
copyContract('contracts/Signable.sol', 'Signable.sol');
copyABI('artifacts/contracts/ISignable.sol/ISignable.json', 'ISignable.json');
copyABI('artifacts/contracts/Signable.sol/Signable.json', 'Signable.json');
copyTypeScript('artifacts/contracts/ISignable.sol/ISignable.json', 'ISignable.ts');
copyTypeScript('artifacts/contracts/Signable.sol/Signable.json', 'Signable.ts');


