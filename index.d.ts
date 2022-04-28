import type {
    Plugin,
    ProcessOptions,
    Processor
} from 'postcss';

export interface Options {
    readonly sort?: boolean;
}

export interface Packer {
    (options?: Options): Plugin;

    pack(
        css: string,
        opts?: Options & ProcessOptions
    ): ReturnType<Processor['process']>;

    readonly postcss: true;
}

declare const mqpacker: Packer;

export default mqpacker;
