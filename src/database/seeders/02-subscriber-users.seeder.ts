import { DataSource } from 'typeorm';

const roles = ['ADMIN', 'ANALYST', 'REVIEWER', 'AUDITOR', 'COMPLIANCE_OFFICER', 'RISK_MANAGER', 'OPERATIONS_MANAGER'];

// Predefined user IDs for consistent referencing
const userIdMappings: { [key: string]: string[] } = {
  '550e8400-e29b-41d4-a716-446655440001': [ // bank_one subscriber
    '550e8400-e29b-41d4-a716-446655440001', // ADMIN user
    '550e8400-e29b-41d4-a716-446655440011', // ANALYST user
    '550e8400-e29b-41d4-a716-446655440012', // REVIEWER user
    '550e8400-e29b-41d4-a716-446655440013', // AUDITOR user
    '550e8400-e29b-41d4-a716-446655440014', // COMPLIANCE_OFFICER user
    '550e8400-e29b-41d4-a716-446655440015', // RISK_MANAGER user
    '550e8400-e29b-41d4-a716-446655440016', // OPERATIONS_MANAGER user
  ],
  '550e8400-e29b-41d4-a716-446655440002': [ // supermarket_one subscriber
    '550e8400-e29b-41d4-a716-446655440002', // ADMIN user
    '550e8400-e29b-41d4-a716-446655440021', // ANALYST user
    '550e8400-e29b-41d4-a716-446655440022', // REVIEWER user
    '550e8400-e29b-41d4-a716-446655440023', // AUDITOR user
    '550e8400-e29b-41d4-a716-446655440024', // COMPLIANCE_OFFICER user
    '550e8400-e29b-41d4-a716-446655440025', // RISK_MANAGER user
    '550e8400-e29b-41d4-a716-446655440026', // OPERATIONS_MANAGER user
  ],
  '550e8400-e29b-41d4-a716-446655440003': [ // credit_union_eu subscriber
    '550e8400-e29b-41d4-a716-446655440031', // ADMIN user
    '550e8400-e29b-41d4-a716-446655440032', // ANALYST user
    '550e8400-e29b-41d4-a716-446655440033', // REVIEWER user
    '550e8400-e29b-41d4-a716-446655440034', // AUDITOR user
    '550e8400-e29b-41d4-a716-446655440035', // COMPLIANCE_OFFICER user
    '550e8400-e29b-41d4-a716-446655440036', // RISK_MANAGER user
    '550e8400-e29b-41d4-a716-446655440037', // OPERATIONS_MANAGER user
  ],
  '550e8400-e29b-41d4-a716-446655440004': [ // fintech_startup subscriber
    '550e8400-e29b-41d4-a716-446655440041', // ADMIN user
    '550e8400-e29b-41d4-a716-446655440042', // ANALYST user
    '550e8400-e29b-41d4-a716-446655440043', // REVIEWER user
    '550e8400-e29b-41d4-a716-446655440044', // AUDITOR user
    '550e8400-e29b-41d4-a716-446655440045', // COMPLIANCE_OFFICER user
    '550e8400-e29b-41d4-a716-446655440046', // RISK_MANAGER user
    '550e8400-e29b-41d4-a716-446655440047', // OPERATIONS_MANAGER user
  ],
  '550e8400-e29b-41d4-a716-446655440005': [ // insurance_corp subscriber
    '550e8400-e29b-41d4-a716-446655440051', // ADMIN user
    '550e8400-e29b-41d4-a716-446655440052', // ANALYST user
    '550e8400-e29b-41d4-a716-446655440053', // REVIEWER user
    '550e8400-e29b-41d4-a716-446655440054', // AUDITOR user
    '550e8400-e29b-41d4-a716-446655440055', // COMPLIANCE_OFFICER user
    '550e8400-e29b-41d4-a716-446655440056', // RISK_MANAGER user
    '550e8400-e29b-41d4-a716-446655440057', // OPERATIONS_MANAGER user
  ],
  '550e8400-e29b-41d4-a716-446655440006': [ // crypto_exchange subscriber
    '550e8400-e29b-41d4-a716-446655440061', // ADMIN user
    '550e8400-e29b-41d4-a716-446655440062', // ANALYST user
    '550e8400-e29b-41d4-a716-446655440063', // REVIEWER user
    '550e8400-e29b-41d4-a716-446655440064', // AUDITOR user
    '550e8400-e29b-41d4-a716-446655440065', // COMPLIANCE_OFFICER user
    '550e8400-e29b-41d4-a716-446655440066', // RISK_MANAGER user
    '550e8400-e29b-41d4-a716-446655440067', // OPERATIONS_MANAGER user
  ],
  '550e8400-e29b-41d4-a716-446655440007': [ // money_service_business subscriber
    '550e8400-e29b-41d4-a716-446655440071', // ADMIN user
    '550e8400-e29b-41d4-a716-446655440072', // ANALYST user
    '550e8400-e29b-41d4-a716-446655440073', // REVIEWER user
    '550e8400-e29b-41d4-a716-446655440074', // AUDITOR user
    '550e8400-e29b-41d4-a716-446655440075', // COMPLIANCE_OFFICER user
    '550e8400-e29b-41d4-a716-446655440076', // RISK_MANAGER user
    '550e8400-e29b-41d4-a716-446655440077', // OPERATIONS_MANAGER user
  ],
  '550e8400-e29b-41d4-a716-446655440008': [ // investment_firm subscriber
    '550e8400-e29b-41d4-a716-446655440081', // ADMIN user
    '550e8400-e29b-41d4-a716-446655440082', // ANALYST user
    '550e8400-e29b-41d4-a716-446655440083', // REVIEWER user
    '550e8400-e29b-41d4-a716-446655440084', // AUDITOR user
    '550e8400-e29b-41d4-a716-446655440085', // COMPLIANCE_OFFICER user
    '550e8400-e29b-41d4-a716-446655440086', // RISK_MANAGER user
    '550e8400-e29b-41d4-a716-446655440087', // OPERATIONS_MANAGER user
  ]
};

export async function seedSubscriberUsers(dataSource: DataSource) {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  try {
    const subs: Array<{ id: string; username: string }> = await queryRunner.query(
      `SELECT id, username FROM subscribers`
    );

    for (const sub of subs) {
      const userIds = userIdMappings[sub.id];
      if (!userIds) continue;

      for (let i = 0; i < roles.length; i++) {
        const role = roles[i];
        const email = `user${i + 1}@${sub.username}.test`;
        await queryRunner.query(
          `
          INSERT INTO subscriber_users (
            id, subscriber_id, first_name, last_name, email, role, password_hash, is_active
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
          ON CONFLICT (subscriber_id, email) DO NOTHING
          `,
          [
            userIds[i],
            sub.id,
            'User',
            `${i + 1}`,
            email,
            role,
            'hashed-password',
          ],
        );
      }
    }
  } finally {
    await queryRunner.release();
  }
}