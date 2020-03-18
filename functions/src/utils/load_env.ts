import * as functions from 'firebase-functions';
import * as path from 'path';
import * as fs from 'fs';
import {
    parseDataObject
} from '../utils/helpers';

const storeGlobally = (env: {
    [s: string]: any
}, parentKey: string = '') => {
    Object.keys(env).forEach((key) => {
        const current = env[key];
        const prefix = `${parentKey ? parentKey.toUpperCase() + '_' : ''}${key.toUpperCase()}`
        if (current instanceof Object) {
            storeGlobally(current, prefix);
        } else {
            process.env[prefix] = String(current);
        }
    });
}

export const loadEnv = () => {
    let config: any;
    const envDir = path.join(__dirname, '../..', 'env.json');

    if (fs.existsSync(envDir)) {
        config = require(envDir);
    } else {
        config = functions.config();
    }

    config = parseDataObject(config);
    storeGlobally(config);
}
