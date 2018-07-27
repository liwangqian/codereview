'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./logger");
const container_1 = require("./container");
function activate(context) {
    const start = process.hrtime();
    container_1.Container.initialize(context);
    const duration = process.hrtime(start);
    logger_1.Logger.log(`CodeReview activated in ${(duration[0] * 1000) + Math.floor(duration[1] / 1000000)} ms`);
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map