const engine = require('./server/services/analyticsEngine');
require('dotenv').config({ path: './.env' }); // Load env for DB

async function test() {
  try {
    const adminData = await engine.getAdminAnalytics();
    console.log('Admin Data:', JSON.stringify(adminData, null, 2));
    
    // Student data for studentId = 2
    const studentData = await engine.getStudentAnalytics(2);
    console.log('Student Data:', JSON.stringify(studentData, null, 2));
  } catch (err) {
    console.error('ERROR:', err);
  }
  process.exit(0);
}
test();
