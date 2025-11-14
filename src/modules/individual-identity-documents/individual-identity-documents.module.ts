import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndividualIdentityDocumentEntity } from './individual-identity-document.entity';
import { IndividualIdentityDocumentRepository } from './individual-identity-document.repository';

@Module({
  imports: [TypeOrmModule.forFeature([IndividualIdentityDocumentEntity])],
  providers: [IndividualIdentityDocumentRepository],
  exports: [IndividualIdentityDocumentRepository]
})
export class IndividualIdentityDocumentsModule {}