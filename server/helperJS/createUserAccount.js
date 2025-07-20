const crypto = require('crypto');

pwd='pwd'
salt="5989fc489aeba0f798e4245eae04dc5b"
crypto.scrypt(pwd, salt, 32, (err, hashedPassword) => {
    if (err) reject(err);

    console.log(hashedPassword.toString('hex'));
});