import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces'
import { AcaktextService } from './services/acaktext.service';

const OPSI_MODUL_PENGACAK: symbol = Symbol('OPSI_MODUL_PENGACAK')

export interface IOpsiAcak {
    secretKey: any
    algorithm?: string
    sha?: string
    encodedSecretKey?: boolean
    enabled?: boolean
}

export type OpsiModulAcakAsync = Pick<ModuleMetadata, 'imports'> & {
    useFactory: (...args: any[]) => Promise<IOpsiAcak> | IOpsiAcak
    inject?: any[]
    global?: boolean
  }

@Module({})
export class AcaktextModule {
    public static forRoot(
        options: IOpsiAcak & { global?: boolean }
    ): DynamicModule {
        const { enabled = true } = options

        return {
            module: AcaktextModule,
            providers: enabled
                ? [
                    {
                        provide: AcaktextService,
                        useValue: new AcaktextService({ ...options, enabled }),
                    },
                ]
                : [],
            exports: [AcaktextService],
            global: options.global || false,
        }
    }

    public static forRootAsync(
        options: OpsiModulAcakAsync
    ): DynamicModule {
        const modulPengacakProvider: Provider = {
            provide: OPSI_MODUL_PENGACAK,
            useFactory: options.useFactory,
            inject: options.inject || [],
        }

        const pengacakTextProvider: Provider = {
            provide: AcaktextService,
            useFactory: (options: IOpsiAcak) => {
                const { enabled = true } = options

                return enabled ? new AcaktextService({
                    ...options,
                    enabled
                }) : undefined
            },
            inject: [OPSI_MODUL_PENGACAK],
        }

        return {
            module: AcaktextModule,
            imports: [...(options.imports || [])],
            providers: [modulPengacakProvider, pengacakTextProvider],
            exports: [AcaktextService],
            global: options.global || false,
          }
    }
}
