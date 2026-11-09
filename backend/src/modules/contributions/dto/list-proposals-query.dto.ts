import { IsIn, IsOptional } from 'class-validator';

export class ListProposalsQueryDto {
  @IsOptional()
  @IsIn(['en', 'es'])
  locale?: 'en' | 'es';
}
