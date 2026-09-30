const bcrypt = require('bcrypt');
const hash = '$2b$10$wE8F5h25u.hCjP.i0d6/2.Bw2a8D.e6Ww3X0C0W.3r50/s3b7kO/6';
const password = 'password123';

bcrypt.compare(password, hash).then(res => {
  console.log('Match:', res);
});
