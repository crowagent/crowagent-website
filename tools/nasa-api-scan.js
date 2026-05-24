const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = 'https://gujtuecjzfiqsdnzgyvo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1anR1ZWNqemZpcXNkbnpneXZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MzY2ODcsImV4cCI6MjA4OTExMjY4N30.7khYTXNLVsKGhgJ4MKS-utATs0vkwbkNM9VHCHGN7bw';

const TEST_USER = {
  email: 'crowagent.platform@gmail.com',
  pass: 'CrowV2-Smoke-2026'
};

const REPORT_PATH = 'C:\\Users\\bhave\\Crowagent Repo\\audit\\NASA-API-DEEP-SCAN.md';

async function performDeepAPIScan() {
  console.log('🚀 NASA Mission: Production API Deep Scan starting...');
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: TEST_USER.email,
    password: TEST_USER.pass,
  });

  if (authError) {
    console.error('❌ Auth Engine Failure:', authError.message);
    return;
  }

  console.log('✅ Auth Success. Scanning Engine Data...');

  const report = {
    timestamp: new Date().toISOString(),
    scans: []
  };

  const scanTable = async (name, table, select = '*') => {
    console.log(`📡 Scanning [${name}] table...`);
    const { data, error } = await supabase.from(table).select(select).limit(5);
    report.scans.push({
      name,
      table,
      success: !error,
      count: data ? data.length : 0,
      error: error ? error.message : null,
      data: data || []
    });
  };

  // ENGINE TABLES TO SCAN
  await scanTable('Portfolio (Core)', 'properties');
  await scanTable('Contracts (Mark)', 'opportunities');
  await scanTable('Assessments (Cyber)', 'assessments');
  await scanTable('Invoices (Cash)', 'invoices');
  await scanTable('Team (Admin)', 'team_members');

  // GENERATE NASA REPORT
  let md = `# NASA-GRADE API DEEP SCAN REPORT\n**Date:** ${new Date().toISOString()}\n\n## 📡 DATA ENGINE INTEGRITY\n\n| Product | Table | Status | Count | Details |\n|---|---|---|---|---|\n`;
  
  report.scans.forEach(s => {
    const status = s.success ? '✅ OK' : '❌ ERROR';
    md += `| ${s.name} | ${s.table} | ${status} | ${s.count} | ${s.error || 'Clean fetch'} |\n`;
  });

  fs.writeFileSync(REPORT_PATH, md);
  console.log(`\n✅ NASA API Scan Complete. Ledger: ${REPORT_PATH}`);
}

performDeepAPIScan().catch(console.error);
