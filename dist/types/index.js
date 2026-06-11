"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_PERMISSIONS = exports.Permission = exports.Role = void 0;
var Role;
(function (Role) {
    Role["SUPER_ADMIN"] = "super_admin";
    Role["ADMIN"] = "admin";
    Role["MANAGER"] = "manager";
    Role["CASHIER"] = "cashier";
})(Role || (exports.Role = Role = {}));
var Permission;
(function (Permission) {
    Permission["CREATE_USER"] = "create_user";
    Permission["READ_USER"] = "read_user";
    Permission["UPDATE_USER"] = "update_user";
    Permission["DELETE_USER"] = "delete_user";
    Permission["CREATE_PRODUCT"] = "create_product";
    Permission["READ_PRODUCT"] = "read_product";
    Permission["UPDATE_PRODUCT"] = "update_product";
    Permission["DELETE_PRODUCT"] = "delete_product";
    Permission["CREATE_ORDER"] = "create_order";
    Permission["READ_ORDER"] = "read_order";
    Permission["UPDATE_ORDER"] = "update_order";
    Permission["DELETE_ORDER"] = "delete_order";
    Permission["CREATE_CATEGORY"] = "create_category";
    Permission["READ_CATEGORY"] = "read_category";
    Permission["UPDATE_CATEGORY"] = "update_category";
    Permission["DELETE_CATEGORY"] = "delete_category";
    Permission["VIEW_REPORTS"] = "view_reports";
    Permission["UPLOAD_CSV"] = "upload_csv";
})(Permission || (exports.Permission = Permission = {}));
exports.ROLE_PERMISSIONS = {
    [Role.SUPER_ADMIN]: Object.values(Permission),
    [Role.ADMIN]: [
        Permission.CREATE_USER, Permission.READ_USER, Permission.UPDATE_USER,
        Permission.CREATE_PRODUCT, Permission.READ_PRODUCT, Permission.UPDATE_PRODUCT, Permission.DELETE_PRODUCT,
        Permission.CREATE_ORDER, Permission.READ_ORDER, Permission.UPDATE_ORDER, Permission.DELETE_ORDER,
        Permission.CREATE_CATEGORY, Permission.READ_CATEGORY, Permission.UPDATE_CATEGORY, Permission.DELETE_CATEGORY,
        Permission.VIEW_REPORTS, Permission.UPLOAD_CSV,
    ],
    [Role.MANAGER]: [
        Permission.READ_USER,
        Permission.CREATE_PRODUCT, Permission.READ_PRODUCT, Permission.UPDATE_PRODUCT,
        Permission.CREATE_ORDER, Permission.READ_ORDER, Permission.UPDATE_ORDER,
        Permission.CREATE_CATEGORY, Permission.READ_CATEGORY, Permission.UPDATE_CATEGORY,
        Permission.VIEW_REPORTS, Permission.UPLOAD_CSV,
    ],
    [Role.CASHIER]: [
        Permission.READ_PRODUCT,
        Permission.CREATE_ORDER, Permission.READ_ORDER,
        Permission.READ_CATEGORY,
    ],
};
//# sourceMappingURL=index.js.map