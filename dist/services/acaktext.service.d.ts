/// <reference types="node" />
import { Buffer } from 'node:buffer';
import { IOpsiAcak } from '../index';
interface IHash {
    iv: string;
    value: string | Buffer;
    mac?: any;
}
export declare class AcaktextService {
    private readonly _options;
    private _algorithm;
    private _sha;
    private _knownSecretKey;
    constructor(_options: IOpsiAcak);
    private calculateMac;
    getJsonPayload(payload: string): IHash;
    private isValidPayload;
    private isValidMac;
    private hashHmac;
    hash(payload: IHash): string;
    private hashSerialize;
    private hashDeserialize;
    encode(data: any): string;
    decode(payload: string): any;
    encodeJSON(obj: any): string | undefined;
    decodeJSON<T = any>(hashedObj: string): T | undefined;
}
export {};
