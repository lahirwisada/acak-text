"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcaktextModule = void 0;
var common_1 = require("@nestjs/common");
var acaktext_service_1 = require("./services/acaktext.service");
var OPSI_MODUL_PENGACAK = Symbol('OPSI_MODUL_PENGACAK');
var AcaktextModule = (function () {
    function AcaktextModule() {
    }
    AcaktextModule_1 = AcaktextModule;
    AcaktextModule.forRoot = function (options) {
        var _a = options.enabled, enabled = _a === void 0 ? true : _a;
        return {
            module: AcaktextModule_1,
            providers: enabled
                ? [
                    {
                        provide: acaktext_service_1.AcaktextService,
                        useValue: new acaktext_service_1.AcaktextService(__assign(__assign({}, options), { enabled: enabled })),
                    },
                ]
                : [],
            exports: [acaktext_service_1.AcaktextService],
            global: options.global || false,
        };
    };
    AcaktextModule.forRootAsync = function (options) {
        var modulPengacakProvider = {
            provide: OPSI_MODUL_PENGACAK,
            useFactory: options.useFactory,
            inject: options.inject || [],
        };
        var pengacakTextProvider = {
            provide: acaktext_service_1.AcaktextService,
            useFactory: function (options) {
                var _a = options.enabled, enabled = _a === void 0 ? true : _a;
                return enabled ? new acaktext_service_1.AcaktextService(__assign(__assign({}, options), { enabled: enabled })) : undefined;
            },
            inject: [OPSI_MODUL_PENGACAK],
        };
        return {
            module: AcaktextModule_1,
            imports: __spreadArray([], (options.imports || []), true),
            providers: [modulPengacakProvider, pengacakTextProvider],
            exports: [acaktext_service_1.AcaktextService],
            global: options.global || false,
        };
    };
    var AcaktextModule_1;
    AcaktextModule = AcaktextModule_1 = __decorate([
        (0, common_1.Module)({})
    ], AcaktextModule);
    return AcaktextModule;
}());
exports.AcaktextModule = AcaktextModule;
//# sourceMappingURL=acaktext.module.js.map