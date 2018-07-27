'use strict';

import { Logger } from './logger';
import { ExtensionContext } from 'vscode';
import { Container } from './container';

export function activate(context: ExtensionContext) {
    const start = process.hrtime();

    Container.initialize(context);

    const duration = process.hrtime(start);
    Logger.log(`CodeReview activated in ${(duration[0] * 1000) + Math.floor(duration[1] / 1000000)} ms`);
}

// this method is called when your extension is deactivated
export function deactivate() {
}