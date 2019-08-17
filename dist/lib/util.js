"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function escapeRegExp(strIn) {
    return strIn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
exports.escapeRegExp = escapeRegExp;
