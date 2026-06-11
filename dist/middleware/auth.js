"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.authorize = exports.authenticate = void 0;
const jwt_1 = require("../config/jwt");
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            res.status(401).json({ success: false, message: 'Access token missing or malformed' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const payload = (0, jwt_1.verifyAccessToken)(token);
        req.user = payload;
        next();
    }
    catch (error) {
        const msg = error instanceof Error && error.name === 'TokenExpiredError'
            ? 'Access token expired'
            : 'Invalid access token';
        res.status(401).json({ success: false, message: msg });
    }
};
exports.authenticate = authenticate;
const authorize = (...permissions) => (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
    }
    const hasAll = permissions.every((p) => req.user.permissions.includes(p));
    if (!hasAll) {
        res.status(403).json({
            success: false,
            message: `Insufficient permissions. Required: ${permissions.join(', ')}`,
        });
        return;
    }
    next();
};
exports.authorize = authorize;
const authorizeRoles = (...roles) => (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
    }
    if (!roles.includes(req.user.role)) {
        res.status(403).json({
            success: false,
            message: `Role '${req.user.role}' is not authorized for this action`,
        });
        return;
    }
    next();
};
exports.authorizeRoles = authorizeRoles;
//# sourceMappingURL=auth.js.map