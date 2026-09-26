import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class UploadsService {
  private uploadDir: string;
  private publicUrl: string;

  constructor(private config: ConfigService) {
    this.uploadDir = config.get('UPLOAD_DIR', '/app/uploads');
    this.publicUrl = config.get('PUBLIC_URL', 'https://mikheyeva.art/uploads');
  }

  async onModuleInit() {
    await fs.mkdir(this.uploadDir, { recursive: true });
    await fs.mkdir(path.join(this.uploadDir, 'artworks'), { recursive: true });
    await fs.mkdir(path.join(this.uploadDir, 'avatars'), { recursive: true });
    await fs.mkdir(path.join(this.uploadDir, 'covers'), { recursive: true });
    await fs.mkdir(path.join(this.uploadDir, 'banners'), { recursive: true });
  }

  async uploadImage(file: Express.Multer.File, folder: string): Promise<string> {
    if (!file) throw new BadRequestException('File is required');

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Allowed: JPEG, PNG, WebP, GIF');
    }

    if (file.size > 20 * 1024 * 1024) {
      throw new BadRequestException('File too large. Max 20MB');
    }

    const dir = path.join(this.uploadDir, folder);
    await fs.mkdir(dir, { recursive: true });

    const filename = `${uuidv4()}.webp`;
    const filepath = path.join(dir, filename);

    let buffer: Buffer;
    try {
      buffer = await sharp(file.buffer)
        .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
    } catch {
      buffer = file.buffer;
    }

    await fs.writeFile(filepath, buffer);
    return `${this.publicUrl}/${folder}/${filename}`;
  }

  async uploadImageThumb(file: Express.Multer.File, folder: string): Promise<string> {
    const dir = path.join(this.uploadDir, folder, 'thumbs');
    await fs.mkdir(dir, { recursive: true });

    const filename = `${uuidv4()}-thumb.webp`;
    const filepath = path.join(dir, filename);

    let buffer: Buffer;
    try {
      buffer = await sharp(file.buffer)
        .resize(400, 400, { fit: 'cover' })
        .webp({ quality: 75 })
        .toBuffer();
    } catch {
      buffer = file.buffer;
    }

    await fs.writeFile(filepath, buffer);
    return `${this.publicUrl}/${folder}/thumbs/${filename}`;
  }

  async deleteFile(url: string): Promise<void> {
    try {
      const relativePath = url.replace(this.publicUrl, '');
      const filepath = path.join(this.uploadDir, relativePath);
      await fs.unlink(filepath).catch(() => {});
    } catch {}
  }
}
