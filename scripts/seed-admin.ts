import 'dotenv/config';
import * as bcrypt from 'bcryptjs';
import dataSource from '../src/database/data-source';
import { User } from '../src/modules/users/entities/user.entity';
import { UserRole } from '../src/modules/users/enums/user-role.enum';

async function run() {
  const mobile = process.env.ADMIN_MOBILE;
  const password = process.env.ADMIN_PASSWORD;
  const email = process.env.ADMIN_EMAIL ?? null;

  if (!mobile || !password) {
    throw new Error('ADMIN_MOBILE and ADMIN_PASSWORD are required');
  }

  await dataSource.initialize();

  const repo = dataSource.getRepository(User);
  const existing = await repo.findOne({
    where: [{ mobile }, ...(email ? [{ email }] : [])],
  });

  if (existing) {
    existing.role = UserRole.ADMIN;
    existing.isActive = true;
    existing.passwordHash = await bcrypt.hash(password, 12);
    await repo.save(existing);
  } else {
    const admin = repo.create({
      mobile,
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: UserRole.ADMIN,
      isActive: true,
    });
    await repo.save(admin);
  }

  await dataSource.destroy();
}

void run().catch(async (error: unknown) => {
  console.error(error);
  if (dataSource.isInitialized) await dataSource.destroy();
  process.exit(1);
});
