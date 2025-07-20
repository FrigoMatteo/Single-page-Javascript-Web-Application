'use strict';

const sqlite = require('sqlite3');
const crypto = require('crypto');
const db = new sqlite.Database("forum.db");

exports.getUser=(username, password)=>{
  
    const sql="select * from users where email=?";

    return new Promise((resolve,reject)=>{
        db.all(sql,[username],(err,rows)=>{
            
            if (err){
                return reject(err);
            }

            if(rows.length==0){
                return reject("Username and password incorrect");
            }
           
            const salt=rows[0].salt
            crypto.scrypt(password, salt, 32, (err, hashedPassword) => {
                if (err) reject(err);

                // We create an array buffer, taking input hex of password
                const passwordHex = Buffer.from(rows[0].password,'hex');

                if(!crypto.timingSafeEqual(passwordHex, hashedPassword))
                    return reject("Username and password incorrect");
                else{
                    return resolve(rows[0])
                }
            });

        });
    });

}

exports.getUserById=(id)=>{

    const sql="select * from users where id=?"

     return new Promise((resolve,reject)=>{

        db.all(sql,[id],(err,rows)=>{
            if (err) return reject(err);
            if (!rows) return reject("No users found");
            
            return resolve(rows[0])

        });
    });

}