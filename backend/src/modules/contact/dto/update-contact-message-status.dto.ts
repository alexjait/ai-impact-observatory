import { IsIn } from 'class-validator';

export class UpdateContactMessageStatusDto {
  @IsIn(['new', 'read', 'archived'])
  status!: 'new' | 'read' | 'archived';
}
