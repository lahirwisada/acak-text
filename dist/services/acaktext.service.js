"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcaktextService = void 0;
var common_1 = require("@nestjs/common");
var lodash_1 = require("lodash");
var node_crypto_1 = require("node:crypto");
var node_buffer_1 = require("node:buffer");
var AcaktextService = (function () {
    function AcaktextService(_options) {
        var _a, _b;
        this._options = _options;
        this._algorithm = 'aes-256-ctr';
        this._sha = 'sha256';
        if (!((_a = this._options) === null || _a === void 0 ? void 0 : _a.secretKey) || ((_b = this._options) === null || _b === void 0 ? void 0 : _b.secretKey.length) !== 32) {
            throw new common_1.BadRequestException('INVALID_HASHING_SECRET_KEY', 'Secret key is required and should be 32 characters');
        }
        if ((0, lodash_1.isString)(this._options.algorithm)) {
            this._algorithm = this._options.algorithm;
        }
        if ((0, lodash_1.isString)(this._options.sha)) {
            this._sha = this._options.sha;
        }
        this._knownSecretKey = this._options.secretKey;
    }
    AcaktextService.prototype.calculateMac = function (payload, key) {
        var hashedData = this.hash(payload);
        return this.hashHmac(hashedData, key);
    };
    AcaktextService.prototype.getJsonPayload = function (payload) {
        if ((0, lodash_1.isNil)(payload)) {
            throw new common_1.BadRequestException('INVALID_PAYLOAD', 'Payload MUST NOT be empty');
        }
        if (!(0, lodash_1.isString)(payload)) {
            throw new common_1.BadRequestException('INVALID_PAYLOAD', 'Payload MUST be string');
        }
        var _payload;
        try {
            _payload = JSON.parse(node_buffer_1.Buffer.from(payload, 'base64').toString('utf8'));
        }
        catch (e) {
            throw new common_1.BadRequestException('FAIL_PARSE_PAYLOAD', 'Payload cannot be parsed');
        }
        if (!this.isValidPayload(_payload)) {
            throw new common_1.BadRequestException('INVALID_PAYLOAD', 'Payload invalid');
        }
        if (!this.isValidMac(_payload)) {
            throw new common_1.BadRequestException('INVALID_MAC', 'Mac invalid');
        }
        return _payload;
    };
    AcaktextService.prototype.isValidPayload = function (payload) {
        return payload.hasOwnProperty("iv") && payload.hasOwnProperty("value") && payload.hasOwnProperty("mac");
    };
    AcaktextService.prototype.isValidMac = function (payload) {
        var bytes = (0, node_crypto_1.randomBytes)(16);
        var calculatedMac = this.calculateMac(payload, bytes);
        var originalMac = this.hashHmac(payload.mac, bytes);
        return calculatedMac === originalMac;
    };
    AcaktextService.prototype.hashHmac = function (data, randomByte) {
        var hmac = (0, node_crypto_1.createHmac)(this._sha, randomByte);
        hmac.update(data);
        return hmac.digest("hex");
    };
    AcaktextService.prototype.hash = function (payload) {
        return this.hashHmac(payload.iv + payload.value, this._knownSecretKey);
    };
    AcaktextService.prototype.hashSerialize = function (data) {
        var str = String(data);
        return 's:' + str.length + ':"' + str + ';"';
    };
    AcaktextService.prototype.hashDeserialize = function (data) {
        var strData = String(data);
        return strData.substring(strData.lastIndexOf(":") + 1, strData.lastIndexOf(";")).replace(/"/g, '');
    };
    AcaktextService.prototype.encode = function (data) {
        var serializedValue = this.hashSerialize(data);
        try {
            var _iv = (0, node_crypto_1.randomBytes)(16);
            var base64_iv = _iv.toString('base64');
            var cipher = (0, node_crypto_1.createCipheriv)(this._algorithm, this._knownSecretKey, _iv);
            var encrypted = cipher.update(serializedValue, 'utf8', 'base64');
            encrypted += cipher.final('base64');
            var _mac = this.hash({ iv: base64_iv, value: encrypted });
            var payloadObject = {
                iv: base64_iv,
                value: encrypted,
                mac: _mac
            };
            var _payload = JSON.stringify(payloadObject);
            var base64_payload = node_buffer_1.Buffer.from(_payload).toString('base64');
            return base64_payload;
        }
        catch (e) {
            throw new common_1.BadRequestException('ENCODE_FAILED', 'connot encode data');
        }
    };
    AcaktextService.prototype.decode = function (payload) {
        var _payload = this.getJsonPayload(payload);
        var _iv = node_buffer_1.Buffer.from(_payload.iv, 'base64');
        var decipher = (0, node_crypto_1.createDecipheriv)(this._algorithm, this._knownSecretKey, _iv);
        var decrypted = decipher.update(String(_payload.value), 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return this.hashDeserialize(decrypted);
    };
    AcaktextService.prototype.encodeJSON = function (obj) {
        try {
            return this.encode(JSON.stringify(obj));
        }
        catch (_a) {
            return undefined;
        }
    };
    AcaktextService.prototype.decodeJSON = function (hashedObj) {
        try {
            var decodedText = this.decode(hashedObj);
            return decodedText ? JSON.parse(decodedText) : undefined;
        }
        catch (_a) {
            return undefined;
        }
    };
    AcaktextService = __decorate([
        (0, common_1.Injectable)(),
        __metadata("design:paramtypes", [Object])
    ], AcaktextService);
    return AcaktextService;
}());
exports.AcaktextService = AcaktextService;
//# sourceMappingURL=acaktext.service.js.map