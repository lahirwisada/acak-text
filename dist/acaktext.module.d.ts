import { DynamicModule } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
export interface IOpsiAcak {
    secretKey: any;
    algorithm?: string;
    sha?: string;
    encodedSecretKey?: boolean;
    enabled?: boolean;
}
export declare type OpsiModulAcakAsync = Pick<ModuleMetadata, 'imports'> & {
    useFactory: (...args: any[]) => Promise<IOpsiAcak> | IOpsiAcak;
    inject?: any[];
    global?: boolean;
};
export declare class AcaktextModule {
    static forRoot(options: IOpsiAcak & {
        global?: boolean;
    }): DynamicModule;
    static forRootAsync(options: OpsiModulAcakAsync): DynamicModule;
}
