import {
  IsString, IsOptional, IsNumber, IsEnum, IsArray,
  IsBoolean, MaxLength, Min, IsInt,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ArtworkCategory, ArtworkType, ArtworkStatus } from '@prisma/client';

export class CreateArtworkDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiProperty({ enum: ArtworkCategory })
  @IsEnum(ArtworkCategory)
  category: ArtworkCategory;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  technique?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  materials?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  style?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  width?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  height?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  depth?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  weight?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ default: 'RUB' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ enum: ArtworkType })
  @IsEnum(ArtworkType)
  type: ArtworkType;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  hasCertificate?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  videoUrl?: string;
}

export class UpdateArtworkDto extends CreateArtworkDto {}

export class ArtworkQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  style?: string;

  @IsOptional()
  @IsString()
  artistId?: string;

  @IsOptional()
  @IsString()
  artistSlug?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceMax?: number;

  @IsOptional()
  @IsString()
  sortBy?: 'date' | 'price_asc' | 'price_desc' | 'popular';

  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  available?: boolean;
}

export class UpdateArtworkStatusDto {
  @IsEnum(ArtworkStatus)
  status: ArtworkStatus;
}
