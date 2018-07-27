'use strict';
import { ExtensionContext, OutputChannel } from 'vscode';

export enum OutputLevel {
    Silent = 'silent',
    Errors = 'errors',
    Verbose = 'verbose',
    Debug = 'debug'
}

const extensionOutputChannelName = 'CodeReview';
const ConsolePrefix = `[${extensionOutputChannelName}]`;

const isDebuggingRegex = /^--inspect(-brk)?=?/;

export class Logger {

    static level: OutputLevel = OutputLevel.Verbose;
    static output: OutputChannel | undefined;

    static configure(context: ExtensionContext) { }

    static log(message?: any, ...params: any[]): void {
        if (this.level !== OutputLevel.Verbose && this.level !== OutputLevel.Debug) return;

        if (Logger.isDebugging) {
            console.log(this.timestamp, ConsolePrefix, message, ...params);
        }

        if (this.output !== undefined) {
            this.output.appendLine((Logger.isDebugging ? [this.timestamp, message, ...params] : [message, ...params]).join(' '));
        }
    }

    static error(ex: Error, classOrMethod?: string, ...params: any[]): void {
        if (this.level === OutputLevel.Silent) return;

        if (Logger.isDebugging) {
            console.error(this.timestamp, ConsolePrefix, classOrMethod, ...params, ex);
        }

        if (this.output !== undefined) {
            this.output.appendLine((Logger.isDebugging ? [this.timestamp, classOrMethod, ...params, ex] : [classOrMethod, ...params, ex]).join(' '));
        }
    }

    static warn(message?: any, ...params: any[]): void {
        if (this.level === OutputLevel.Silent) return;

        if (Logger.isDebugging) {
            console.warn(this.timestamp, ConsolePrefix, message, ...params);
        }

        if (this.output !== undefined) {
            this.output.appendLine((Logger.isDebugging ? [this.timestamp, message, ...params] : [message, ...params]).join(' '));
        }
    }

    private static get timestamp(): string {
        const now = new Date();
        return `[${now.toISOString().replace(/T/, ' ').replace(/\..+/, '')}:${('00' + now.getUTCMilliseconds()).slice(-3)}]`;
    }

    private static _isDebugging: boolean | undefined;
    static get isDebugging() {
        if (this._isDebugging === undefined) {
            try {
                const args = process.execArgv;

                this._isDebugging = args
                    ? args.some(arg => isDebuggingRegex.test(arg))
                    : false;
            } catch { }
        }

        return this._isDebugging;
    }
}
