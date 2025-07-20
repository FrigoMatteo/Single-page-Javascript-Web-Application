'use strict';

const sqlite = require('sqlite3');
const db = new sqlite.Database("forum.db");
// This way we implement the foreign key association and delete on cascade
db.run("PRAGMA foreign_keys = ON", (err) => {
    if (err) {
        console.error("Foreign key error:", err.message);
    } else {
        console.log("Foreign key activated");
    }
});

exports.setComment = (comment,anonymous) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run("BEGIN TRANSACTION");

            // Check if we can push a comment and we don't reach the imposed limit by the post
            const searchSql="select * from posts where id=?"
            db.all(searchSql,[comment.postId],(err,rows)=>{
                if (err){
                    return db.run("ROLLBACK", () => reject("Database error"));
                }

                // Limit condition
                if (rows[0].commentsNumber+1>rows[0].maxComments){
                    return db.run("ROLLBACK", () => reject("Maximum comment limit"));
                }


                // Insert comment:
                const sqlIns="INSERT INTO comments (text,timestamp,idAuthor,postId) VALUES (?, ?, ?, ?)";

                db.run(sqlIns,[comment.text, comment.timestamp, comment.idAuthor, comment.postId],function (err){

                        if (err) {
                            return db.run("ROLLBACK", () => reject("Error in inserting the comment"));
                        }

                        let sql;
                        if (!anonymous){
                            sql="UPDATE posts set commentsNumber = commentsNumber + 1 where id=?"
                        }else{
                            sql="UPDATE posts set commentsNumber = commentsNumber + 1, commentsAnonymous = commentsAnonymous + 1 where id=?"
                        }

                        db.run(sql,[comment.postId],function (err){
                            
                            if (err){
                                return db.run("ROLLBACK", () => reject("Error updating the post"));;
                            }
                            if(this.changes ===0){
                                // In case it didn't change anything, so post.comment number didn't change
                                return db.run("ROLLBACK", () => reject("Error updating the post"));
                            }

                            db.run("COMMIT", (err) => {
                                if (err) {
                                    return reject("Unable to commit");
                                }
                                return resolve("Inserted comment");
                            });
                        })
            
                });        
            })
        });
    });
};


exports.setPost=(post)=>{

    const sql="INSERT INTO posts (title,idAuthor,text,maxComments,timestamp) VALUES (?, ?, ?, ?,?)";
    return new Promise((resolve,reject) =>{
        db.run(sql,[post.title, post.idAuthor, post.text, post.maxComments, post.timestamp],(err)=>{
            if (err){
                return reject("Database error");
            }
            return resolve("Post inserted");
        })
    });
}


exports.editComment=(comment)=>{

    let sql="UPDATE comments set text=? where id=?";
    let params = [comment.text,comment.id];
    // If it's not the admin (enter condition), we don't want that other user change something not their.
    // Else it's the admin so he/she can change users data
    if (!comment.admin){
        sql=sql+"AND idAuthor==?";
        params.push(comment.idAuthor)
    }

    return new Promise((resolve,reject) =>{
        db.run(sql,params,function (err){
            if (err){
                return reject("Database error");
            }

            if(this.changes ===0){
                // In case it didn't change anything, or they tried to change a comment not their (with wronng idAuthor)
                return resolve("No comment edited");
            }

            return resolve("Comment edited");
        })
    });
}


exports.getCommentInteresting=(postId,userId)=>{
    const sql="select * from commentInteresting where postId=?";

    return new Promise((resolve,reject)=>{

        db.all(sql,[postId],(err,rows)=>{
            if (err){
                return reject("Database error");
            }
        
            // We create an array like this: 
            // (interest tells if the user who sent this request has put the interest flag)
            // [
            // CommentId1: {counter:x1, interest:y1},
            // CommentId2: {counter:x2, interest:y2}, ...
            // ]
            let comments={}
            for (let r of rows){
                let interest=0;
                if(r.userId==userId){
                    interest=1;
                }

                if (comments[r.commentId]){
                    comments[r.commentId].counter+=1;
                    if (interest){
                        comments[r.commentId].interest=interest;
                    }

                }else{
                    
                    comments[r.commentId]={
                        counter:1,
                        interest:interest
                    };
                }
            }

            return resolve(comments)
        });
    });

}


exports.getCommentPost=(idPost)=>{
    const sql="select * from comments where postId=?";

    return new Promise((resolve,reject)=>{

        db.all(sql,[idPost],(err,rows)=>{
            let results=[]
            if (err){
                return reject("Database error");
            }

            for (let r of rows){
                results.push(r)
            }

            return resolve(results)
        });
    });

}

exports.getPosts=()=>{
  
    const sql="select * from posts";

    return new Promise((resolve,reject)=>{

        db.all(sql,[],(err,rows)=>{
            let results=[]
            if (err){
                return reject("Database error");
            }

            for (let r of rows){
                results.push(r)
            }

            return resolve(results)
        });
    });

}


exports.removeCommentInteresting=(commentInteresting)=>{

    const sql="delete from commentInteresting where postId==? AND commentId==? AND userId==?";

    return new Promise((resolve,reject)=>{
        db.run(sql,[commentInteresting.postId,commentInteresting.commentId,commentInteresting.userId],(err)=>{
            if (err){
                return reject("Database error");
            }
            return resolve("Deleted comment-interesting");
        });
    });

}


exports.removeComment=(comment)=>{

    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run("BEGIN TRANSACTION");

            /* Check if the comment we are going to remove is made by an anonymous user */
            /* We will need the "anonymousValue" value later */
            const searchComment="select * from comments where id==? AND postId=?"
            let anonymousValue=false
            db.all(searchComment,[comment.id,comment.postId],(err,rows)=>{
                if (err){
                    return db.run("ROLLBACK", () => reject("Database error"));
                }

                if (rows[0].idAuthor==-1){
                    // We want to remove an anonymous comment
                    anonymousValue=true;
                }


                // Delete command. This will remove in cascade also interesting comment, through "ON CASCADE" on the foreign key
                let sqlIns="delete from comments where id==? AND postId=?"
                let params = [comment.id,comment.postId];
                // If it's the admin we don't control the idAuthor to req.user.id
                if (!comment.admin){
                    sqlIns=sqlIns+"AND idAuthor==?";
                    params.push(comment.idAuthor)
                }

                db.run(sqlIns,params,function (err){

                        if (err) {
                            return db.run("ROLLBACK", () => reject("Error removing data"));
                        }

                        /* If it's anonymous comment. Let's also remove one value from commentsAnonymous*/
                        let sql;
                        if (anonymousValue){
                            sql="UPDATE posts set commentsNumber = commentsNumber - 1, commentsAnonymous = commentsAnonymous - 1 where id=?"
                        }else{
                            sql="UPDATE posts set commentsNumber = commentsNumber - 1 where id=?"

                        }

                        db.run(sql,[comment.postId],function (err){
                            // Change from arrow function, so we can use the "this.change" attribute
                            if (err){
                                return db.run("ROLLBACK", () => reject("Error in adding one integer to post"));
                            }
                            if(this.changes ===0){
                                // In case it didn't change anything, so post.comment number didn't change
                                return db.run("ROLLBACK", () => reject("Error in adding one integer to post"));
                            }

                            db.run("COMMIT", (err) => {
                                if (err) {
                                    return reject("Unable to commit");
                                }
                                return resolve("Removed comment");
                            });
                        })
                });
            }); 
        });
    });
}

exports.removePost=(post)=>{

    // Delete command. This will remove in cascade also interesting comment and comment, through "ON CASCADE" on the foreign key
    let sql="delete from posts where id==?";
    let params = [post.id];
    // If it's not the admin (enter condition), we don't want that other user change something not their.
    // Else it's the admin so he/she can change users data
    if (!post.admin){
        sql=sql+"AND idAuthor==?";
        params.push(post.idAuthor)
    }


    return new Promise((resolve,reject)=>{
        db.run(sql,params,(err)=>{
            if (err){
                return reject("Database error");
            }
            return resolve("Deleted post");
        });
    });
}


exports.setCommentInteresting=(commentInteresting)=>{
    const sql="INSERT INTO commentInteresting (postId,commentId,userId) VALUES (?, ?, ?)";
    return new Promise((resolve,reject) =>{
        db.run(sql,[commentInteresting.postId,commentInteresting.commentId,commentInteresting.userId],(err)=>{
            if (err){
                return reject("Database error");
            }
            return resolve("Comment-Interesting inserted");
        })
    });
}