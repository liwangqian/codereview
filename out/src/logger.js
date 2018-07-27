'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
var OutputLevel;
(function (OutputLevel) {
    OutputLevel["Silent"] = "silent";
    OutputLevel["Errors"] = "errors";
    OutputLevel["Verbose"] = "verbose";
    OutputLevel["Debug"] = "debug";
})(OutputLevel = exports.OutputLevel || (exports.OutputLevel = {}));
const extensionOutputChannelName = 'CodeReview';
const ConsolePrefix = `[${extensionOutputChannelName}]`;
const isDebuggingRegex = /^--inspect(-brk)?=?/;
class Logger {
    static configure(context) { }
    static onConfigurationChanged(e) {
        this.output = this.output || vscode_1.window.createOutputChannel(extensionOutputChannelName);
    }
    static log(message, ...params) {
        if (this.level !== OutputLevel.Verbose && this.level !== OutputLevel.Debug)
            return;
        if (Logger.isDebugging) {
            console.log(this.timestamp, ConsolePrefix, message, ...params);
        }
        if (this.output !== undefined) {
            this.output.appendLine((Logger.isDebugging ? [this.timestamp, message, ...params] : [message, ...params]).join(' '));
        }
    }
    static error(ex, classOrMethod, ...params) {
        if (this.level === OutputLevel.Silent)
            return;
        if (Logger.isDebugging) {
            console.error(this.timestamp, ConsolePrefix, classOrMethod, ...params, ex);
        }
        if (this.output !== undefined) {
            this.output.appendLine((Logger.isDebugging ? [this.timestamp, classOrMethod, ...params, ex] : [classOrMethod, ...params, ex]).join(' '));
        }
    }
    static warn(message, ...params) {
        if (this.level === OutputLevel.Silent)
            return;
        if (Logger.isDebugging) {
            console.warn(this.timestamp, ConsolePrefix, message, ...params);
        }
        if (this.output !== undefined) {
            this.output.appendLine((Logger.isDebugging ? [this.timestamp, message, ...params] : [message, ...params]).join(' '));
        }
    }
    static get timestamp() {
        const now = new Date();
        return `[${now.toISOString().replace(/T/, ' ').replace(/\..+/, '')}:${('00' + now.getUTCMilliseconds()).slice(-3)}]`;
    }
    static get isDebugging() {
        if (this._isDebugging === undefined) {
            try {
                const args = process.execArgv;
                this._isDebugging = args
                    ? args.some(arg => isDebuggingRegex.test(arg))
                    : false;
            }
            catch (_a) { }
        }
        return this._isDebugging;
    }
}
Logger.level = OutputLevel.Verbose;
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map