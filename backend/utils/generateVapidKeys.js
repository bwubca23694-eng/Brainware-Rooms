// Run once: node utils/generateVapidKeys.js
// Copy output to your .env file
const webpush = require('web-push');
const keys = webpush.generateVAPIDKeys();
console.log('\n✅ VAPID Keys Generated — Add these to your .env:\n');
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:${process.env.GMAIL_USER || 'admin@bwurooms.com'}`);
console.log('\n⚠️  Also add VAPID_PUBLIC_KEY to frontend/.env as:');
console.log(`REACT_APP_VAPID_PUBLIC_KEY=${keys.publicKey}\n`);
