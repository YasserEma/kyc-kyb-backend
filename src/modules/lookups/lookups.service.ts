import { Injectable } from '@nestjs/common';
import { LookupItemDto } from './dto/lookup-response.dto';
import { NATIONALITIES } from './data/nationalities.data';

@Injectable()
export class LookupsService {
  /**
   * Entity Types (KYC/KYB)
   */
  getEntityTypes(): LookupItemDto[] {
    return [
      { value: 'INDIVIDUAL', label: 'Individual', description: 'Natural person (KYC)' },
      { value: 'ORGANIZATION', label: 'Organization', description: 'Business entity (KYB)' },
    ];
  }

  /**
   * Entity Statuses (Workflow states)
   */
  getStatuses(): LookupItemDto[] {
    return [
      { value: 'PENDING', label: 'Pending', description: 'Awaiting review' },
      { value: 'ACTIVE', label: 'Active', description: 'Verified and active' },
      { value: 'INACTIVE', label: 'Inactive', description: 'Temporarily disabled' },
      { value: 'BLOCKED', label: 'Blocked', description: 'Access denied due to risk' },
      { value: 'ARCHIVED', label: 'Archived', description: 'Historical record' },
    ];
  }

  /**
   * Nationalities (ISO 3166-1 Alpha-2 Country Codes)
   */
  getNationalities(): LookupItemDto[] {
    return NATIONALITIES;
  }

  /**
   * Gender Options
   */
  getGenders(): LookupItemDto[] {
    return [
      { value: 'MALE', label: 'Male' },
      { value: 'FEMALE', label: 'Female' },
      { value: 'OTHER', label: 'Other' },
      { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
    ];
  }

  /**
   * Risk Levels
   */
  getRiskLevels(): LookupItemDto[] {
    return [
      { value: 'LOW', label: 'Low', description: 'Minimal risk indicators' },
      { value: 'MEDIUM', label: 'Medium', description: 'Some risk factors present' },
      { value: 'HIGH', label: 'High', description: 'Significant risk indicators' },
      { value: 'CRITICAL', label: 'Critical', description: 'Severe risk - immediate action required' },
    ];
  }

  /**
   * Screening Statuses
   */
  getScreeningStatuses(): LookupItemDto[] {
    return [
      { value: 'CLEAR', label: 'Clear', description: 'No matches found' },
      { value: 'MATCH', label: 'Match', description: 'Potential match found' },
      { value: 'PENDING_REVIEW', label: 'Pending Review', description: 'Awaiting manual review' },
      { value: 'APPROVED', label: 'Approved', description: 'Reviewed and approved' },
      { value: 'REJECTED', label: 'Rejected', description: 'Reviewed and rejected' },
    ];
  }

  /**
   * Organization Types
   */
  getOrganizationTypes(): LookupItemDto[] {
    return [
      { value: 'CORPORATION', label: 'Corporation', description: 'Limited liability company' },
      { value: 'LLC', label: 'LLC', description: 'Limited Liability Company' },
      { value: 'PARTNERSHIP', label: 'Partnership', description: 'Business partnership' },
      { value: 'SOLE_PROPRIETORSHIP', label: 'Sole Proprietorship', description: 'Individual-owned business' },
      { value: 'NGO', label: 'NGO', description: 'Non-Governmental Organization' },
      { value: 'TRUST', label: 'Trust', description: 'Legal trust arrangement' },
      { value: 'FOUNDATION', label: 'Foundation', description: 'Charitable foundation' },
      { value: 'GOVERNMENT', label: 'Government', description: 'Government entity' },
      { value: 'OTHER', label: 'Other', description: 'Other organization type' },
    ];
  }

  /**
   * Document Types
   */
  getDocumentTypes(): LookupItemDto[] {
    return [
      { value: 'PASSPORT', label: 'Passport', description: 'International passport' },
      { value: 'NATIONAL_ID', label: 'National ID', description: 'National identity card' },
      { value: 'DRIVERS_LICENSE', label: 'Drivers License', description: 'Government-issued driving license' },
      { value: 'UTILITY_BILL', label: 'Utility Bill', description: 'Proof of address document' },
      { value: 'BANK_STATEMENT', label: 'Bank Statement', description: 'Financial statement' },
      { value: 'ARTICLES_OF_INCORPORATION', label: 'Articles of Incorporation', description: 'Company registration document' },
      { value: 'TAX_CERTIFICATE', label: 'Tax Certificate', description: 'Tax registration certificate' },
      { value: 'COMMERCIAL_LICENSE', label: 'Commercial License', description: 'Business operating license' },
      { value: 'PROOF_OF_ADDRESS', label: 'Proof of Address', description: 'Address verification document' },
      { value: 'OTHER', label: 'Other', description: 'Other document type' },
    ];
  }

  /**
   * Relationship Types (Individual-to-Individual)
   */
  getIndividualRelationshipTypes(): LookupItemDto[] {
    return [
      { value: 'SPOUSE', label: 'Spouse', description: 'Married partner' },
      { value: 'CHILD', label: 'Child', description: 'Son or daughter' },
      { value: 'PARENT', label: 'Parent', description: 'Mother or father' },
      { value: 'SIBLING', label: 'Sibling', description: 'Brother or sister' },
      { value: 'RELATIVE', label: 'Relative', description: 'Other family member' },
      { value: 'BUSINESS_PARTNER', label: 'Business Partner', description: 'Joint business interest' },
      { value: 'ASSOCIATE', label: 'Associate', description: 'Known associate' },
      { value: 'GUARDIAN', label: 'Guardian', description: 'Legal guardian' },
      { value: 'BENEFICIARY', label: 'Beneficiary', description: 'Named beneficiary' },
    ];
  }

  /**
   * Organization Relationship Types
   */
  getOrganizationRelationshipTypes(): LookupItemDto[] {
    return [
      { value: 'PARENT', label: 'Parent Company', description: 'Parent organization' },
      { value: 'SUBSIDIARY', label: 'Subsidiary', description: 'Owned subsidiary' },
      { value: 'AFFILIATE', label: 'Affiliate', description: 'Affiliated organization' },
      { value: 'JOINT_VENTURE', label: 'Joint Venture', description: 'Joint venture partner' },
      { value: 'BRANCH', label: 'Branch', description: 'Regional branch office' },
      { value: 'SISTER_COMPANY', label: 'Sister Company', description: 'Related company' },
      { value: 'PARTNER', label: 'Partner', description: 'Business partner' },
    ];
  }

  /**
   * Organization Association Types (Individual-to-Organization)
   */
  getAssociationTypes(): LookupItemDto[] {
    return [
      { value: 'UBO', label: 'Ultimate Beneficial Owner', description: 'Owns 25%+ of the organization' },
      { value: 'SHAREHOLDER', label: 'Shareholder', description: 'Holds shares in the organization' },
      { value: 'BENEFICIAL_OWNER', label: 'Beneficial Owner', description: 'Benefits from ownership' },
      { value: 'DIRECTOR', label: 'Director', description: 'Board director' },
      { value: 'CEO', label: 'CEO', description: 'Chief Executive Officer' },
      { value: 'CFO', label: 'CFO', description: 'Chief Financial Officer' },
      { value: 'COO', label: 'COO', description: 'Chief Operating Officer' },
      { value: 'MANAGER', label: 'Manager', description: 'Management position' },
      { value: 'BOARD_MEMBER', label: 'Board Member', description: 'Member of the board' },
      { value: 'SECRETARY', label: 'Secretary', description: 'Company secretary' },
      { value: 'TRUSTEE', label: 'Trustee', description: 'Trust trustee' },
      { value: 'SETTLOR', label: 'Settlor', description: 'Trust settlor' },
    ];
  }
}
