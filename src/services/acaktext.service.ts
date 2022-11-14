import { BadRequestException, Injectable } from '@nestjs/common'
import {isNil, isString as osString} from 'lodash'
// import crypto, { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'crypto'
import crypto, { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'node:crypto';
import { Buffer } from 'node:buffer';
// import {createCipheriv, createDecipheriv, createHmac, randomBytes } from '@types/node/crypto'
import { IOpsiAcak } from '../index'

interface IHash {
    iv: string
    value: string | Buffer
    mac?: any
}

@Injectable()
export class AcaktextService {
    private _algorithm: any = 'aes-256-ctr'
    private _sha: any = 'sha256'
    private _knownSecretKey: any

  public constructor(private readonly _options: IOpsiAcak) {
    
    if (!this._options?.secretKey || this._options?.secretKey.length !== 32) {
        throw new BadRequestException(
          'INVALID_HASHING_SECRET_KEY',
          'Secret key is required and should be 32 characters'
        )
    }

    if(osString(this._options.algorithm)){
      this._algorithm = this._options.algorithm;
    }

    if(osString(this._options.sha)){
      this._sha = this._options.sha;
    }

    this._knownSecretKey = this._options.secretKey;
  }

  private calculateMac(payload: IHash, key: any): string{
    let hashedData: string = this.hash(payload);
    return this.hashHmac(hashedData, key);
  }

  public getJsonPayload(payload: string): IHash{
    if(isNil(payload)){
      throw new BadRequestException(
        'INVALID_PAYLOAD',
        'Payload MUST NOT be empty'
      )
    }

    if(!osString(payload)){
      throw new BadRequestException(
        'INVALID_PAYLOAD',
        'Payload MUST be string'
      )
    }

    let _payload:IHash

    try{
      _payload = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    }catch(e){
      throw new BadRequestException(
        'FAIL_PARSE_PAYLOAD',
        'Payload cannot be parsed'
      )
    }

    if(!this.isValidPayload(_payload)){
      throw new BadRequestException(
        'INVALID_PAYLOAD',
        'Payload invalid'
      )
    }

    if(!this.isValidMac(_payload)){
      throw new BadRequestException(
        'INVALID_MAC',
        'Mac invalid'
      )
    }

    return _payload;

  }

//   private hasOwnProperty<T, K extends PropertyKey>(
//     obj: T,
//     prop: K
// ): obj is T & Record<K, unknown> {
//     return Object.prototype.hasOwnProperty.call(obj, prop);
// }

  private isValidPayload(payload: IHash): boolean{
    return payload.hasOwnProperty("iv") && payload.hasOwnProperty("value") && payload.hasOwnProperty("mac");
  }

  private isValidMac(payload: IHash): boolean{
    let bytes: Buffer = randomBytes(16);
    let calculatedMac: string = this.calculateMac(payload, bytes);

    let originalMac = this.hashHmac(payload.mac, bytes)
    return calculatedMac === originalMac;
  }

  private hashHmac(data: string, randomByte: Buffer): string{
    let hmac: crypto.Hmac = createHmac(this._sha, randomByte);
    hmac.update(data);
    return hmac.digest("hex");
  }

  public hash(payload: IHash): string{
    return this.hashHmac(payload.iv+payload.value, this._knownSecretKey);
  }

  private hashSerialize(data: any): string{
    let str = String(data);
    return 's:'+str.length+':"'+str+';"';
  }

  private hashDeserialize(data: any): string{
    let strData = String(data);
    return strData.substring(strData.lastIndexOf(":")+1, strData.lastIndexOf(";")).replace(/"/g,'');
  }

  public encode(data: any): string{
    let serializedValue = this.hashSerialize(data);

    try{
      let _iv: Buffer = randomBytes(16)
      let base64_iv: string = _iv.toString('base64');
      let cipher: crypto.Cipher = createCipheriv(this._algorithm, this._knownSecretKey, _iv);
      let encrypted: string = cipher.update(serializedValue, 'utf8', 'base64');
      encrypted+=cipher.final('base64');

      let _mac: string = this.hash({iv: base64_iv, value: encrypted});

      let payloadObject: IHash = {
        iv: base64_iv,
        value: encrypted,
        mac: _mac
      }

      let _payload: string = JSON.stringify(payloadObject);
      let base64_payload = Buffer.from(_payload).toString('base64');
      return base64_payload;

    }catch(e){
      throw new BadRequestException(
        'ENCODE_FAILED',
        'connot encode data'
      )
    }
  }

  public decode(payload: string): any{

    let _payload: IHash = this.getJsonPayload(payload);
    let _iv: Buffer = Buffer.from(_payload.iv, 'base64')
    
    let decipher: crypto.DecipherGCM = createDecipheriv(this._algorithm, this._knownSecretKey,_iv);
    let decrypted: string = decipher.update(String(_payload.value), 'base64', 'utf8');
    decrypted+=decipher.final('utf8');

    return this.hashDeserialize(decrypted);
  }

  public encodeJSON(obj: any): string | undefined {
    try {
      return this.encode(JSON.stringify(obj))
    } catch {
      return undefined
    }
  }

  public decodeJSON<T = any>(hashedObj: string): T | undefined {
    try {
      const decodedText = this.decode(hashedObj)

      return decodedText ? JSON.parse(decodedText) : undefined
    } catch {
      return undefined
    }
  }
}
