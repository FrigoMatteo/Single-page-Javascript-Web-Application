const QRCode = require("qrcode");
const secret = 'LXBSMDTMSP2I5XFXIYRGFVWSFI'; // base32 string to store in DB
QRCode.toDataURL(`otpauth://totp/Forum?secret=${secret}&issuer=Forum`, (err, url) => {
 console.log("Paste in browser URL bar:");
 console.log(url);
});