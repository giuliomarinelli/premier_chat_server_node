import { Injectable } from '@nestjs/common';
import * as zlib from 'zlib';
import { promisify } from 'util';
import { CompressionException } from 'src/exception_handling/compression-exception';

@Injectable()
export class CompressionManagementService {

    private gzip = promisify(zlib.gzip) as (buffer: zlib.InputType, options?: zlib.ZlibOptions) => Promise<Buffer>;
    private gunzip = promisify(zlib.gunzip) as (buffer: zlib.InputType, options?: zlib.ZlibOptions) => Promise<Buffer>;

    public async compressData(data: string): Promise<Buffer> {
        try {
            return await this.gzip(data);
        } catch (e) {
            throw new CompressionException(`Compression failed: ${e.message}`);
        }
    }

    public async decompressData(buffer: Buffer): Promise<string> {
        try {
            const decompressedBuffer = await this.gunzip(buffer);
            return decompressedBuffer.toString();
        } catch (e) {
            throw new CompressionException(`Decompression failed: ${e.message}`);
        }
    }
}
