import fs from 'fs'

export interface Config {
    data_folder: string
    port: number
}

export function getDefaultConfig(): Config {
    return {
        data_folder: './data',
        port: 5000
    };
}

export function loadConfigSync(): Config {
    if (fs.existsSync('./config.json')) {
        console.log("Loading config.");
        return JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
    } else {
        console.warn("Config file doesn't exist. Generating...");
        const conf = getDefaultConfig();
        const json = JSON.stringify(conf);
        fs.writeFileSync('./config.json', json);

        return conf;
    }
}