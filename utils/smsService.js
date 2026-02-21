require('dotenv').config();
const https = require('https');

async function sendAttendanceAlert(parentContact, studentName, className, attendancePercentage, subject = null) {
  const threshold = process.env.ATTENDANCE_THRESHOLD || 75;
  const authKey = process.env.MSG91_AUTH_KEY;
  const senderId = process.env.MSG91_SENDER_ID || 'ATTND';
  const flowId = process.env.MSG91_FLOW_ID;
  const route = process.env.MSG91_ROUTE || '4';

  const fullMessage = `Dear Parent, This is an alert regarding your child ${studentName} (Class ${className}). ${subject ? `His attendance in ${subject}` : 'His attendance'} for the current semester is ${attendancePercentage}%, which is below the required ${threshold}% threshold. Please take necessary action.`;

  if (!authKey) {
    console.log('='.repeat(60));
    console.log('SMS ALERT (MSG91 not configured - would send SMS):');
    console.log(`To: ${parentContact}`);
    console.log(`Message: ${fullMessage}`);
    console.log('='.repeat(60));
    return true;
  }

  let mobile = String(parentContact || '').replace(/\D/g, '');
  if (mobile.length === 10) mobile = '91' + mobile;
  if (mobile.length < 12) {
    console.error('Invalid mobile number:', parentContact);
    return false;
  }

  try {
    if (flowId) {
      return await sendViaFlowAPI(authKey, flowId, senderId, mobile, studentName, className, attendancePercentage, threshold);
    }
    return await sendViaSendsmsAPI(authKey, senderId, route, mobile, fullMessage, parentContact);
  } catch (error) {
    console.error('Error sending SMS:', error.message);
    console.log('SMS ALERT (Failed):', { To: parentContact, Message: fullMessage });
    return false;
  }
}

async function sendViaFlowAPI(authKey, flowId, senderId, mobile, studentName, className, percentage, threshold) {
  const postData = JSON.stringify({
    flow_id: flowId,
    sender: senderId,
    recipients: [{
      mobiles: mobile,
      VAR1: studentName,
      VAR2: className,
      VAR3: String(percentage),
      VAR4: String(threshold)
    }]
  });

  const data = await msg91Request('/api/v5/flow/', authKey, postData);
  if (data.type === 'success') {
    console.log(`SMS sent successfully via Flow. ID: ${data.message}`);
    return true;
  }
  console.error('MSG91 Flow error:', data.message, 'Code:', data.code);
  return false;
}


async function sendViaSendsmsAPI(authKey, senderId, route, mobile, message, parentContact) {
  const postData = JSON.stringify({
    sender: senderId,
    route: String(route),
    country: '91',
    sms: [{ message, to: [mobile] }]
  });

  const data = await msg91Request('/api/v2/sendsms', authKey, postData);
  if (data.type === 'success') {
    console.log(`SMS sent successfully to ${parentContact}. ID: ${data.message}`);
    return true;
  }
  console.error('MSG91 error:', data.message, 'Code:', data.code);
  if (data.code === '211' || (data.message && data.message.toLowerCase().includes('template'))) {
    console.error('Tip: For India DLT, use Flow API - create a flow in MSG91 dashboard and set MSG91_FLOW_ID in .env');
  }
  return false;
}

function msg91Request(path, authKey, postData) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.msg91.com',
      path,
      method: 'POST',
      headers: {
        'authkey': authKey,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : { type: 'error', message: 'Empty response' });
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

module.exports = {
  sendAttendanceAlert
};
