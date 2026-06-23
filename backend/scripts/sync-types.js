const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectId = process.env.SUPABASE_PROJECT_ID;

if (!projectId) {
  console.error('No Supabase project ID was found.');
  process.exit(1);
}

try {
  execSync(
    `npx supabase gen types typescript --project-id "${projectId}" > src/types/supabase.ts`,
    { stdio: 'inherit' },
  );

  const frontendTarget = path.resolve(
    __dirname,
    '../../frontend/src/types/supabase.ts',
  );
  fs.mkdirSync(path.dirname(frontendTarget), { recursive: true });
  fs.copyFileSync('src/types/supabase.ts', frontendTarget);

  console.log(
    'Supabase types have been successfully synchronized to both backend and frontend.',
  );
} catch (error) {
  console.error('Error during synchronization:', error.message);
  process.exit(1);
}
