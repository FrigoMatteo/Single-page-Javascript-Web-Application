'use strict';

const express = require('express');
const app = new express();
app.use(express.json());
const morgan = require('morgan');
app.use(morgan('dev'));
const dayjs=require('dayjs')

const cors = require('cors');
const dao = require('./dao.js');
const daoUser = require('./dao-user.js');
const {check,validationResult}=require('express-validator');
const passport = require('passport');
const { initAuthentication,isLoggedIn, commentLogin } = require("./authentication.js");

const { userInfo, filterAnonymous,sortByDate,findAuthorComment, findAuthorPost} = require('./helper_function.js');

const corsOptions={
    origin:'http://localhost:5173',
    credentials:true,
}

// Init
app.use(cors(corsOptions))
const port = 3001;

// We initialize all attributes needed for the authentication mechanism
initAuthentication(app, daoUser);

// Get session user
// ( For professor: All users have password = pwd)
app.get('/api/session/current', (req, res) => {  
  if(req.isAuthenticated()) {
    res.status(200).json(userInfo(req));
  }else
    res.status(401).json({error: 'Unauthenticated user!'});;
});

// Login
app.post('/api/session/login', 
  [
    check("username").notEmpty().isString().withMessage("Missing username"),
    check("password").notEmpty().isString().withMessage("Missing password")
  ]
  ,function (req,resp,next){

    passport.authenticate('local',(err,user,info)=>{
        if (err){
            console.log("info:",info);
            console.log("error:",err);
            return next(err);
        }
        else{
            if (!user){
                return resp.status(401).json(info)
            }
            
            req.login(user, (err) =>{
                if (err) return resp.status(500).json(err);

                console.log("Enter user Login:",user)
                return resp.json(userInfo(req))
            });
        }
            
    })(req,resp,next);

});

app.post('/api/session/login-totp', isLoggedIn ,

  passport.authenticate('totp'),
  function(req, res) {
    req.session.method = 'totp';
    res.json(userInfo(req));
  }

);

// Logout
app.delete('/api/session/logout', (req,resp)=>{
    req.logout( ()=> { resp.status(200);resp.end(); } );
});


// Get all Posts in the DB
app.get('/api/posts', (req,resp)=>{

    const data=dao.getPosts()

    data.then((x)=>{

        const fixDataPost=async(x)=>{
          const first=await findAuthorPost(x)

          if (first?.error){
            resp.json({error:"Error in get Post"})
          }

          const res=await sortByDate(first) 
          resp.json(res)
        }
        fixDataPost(x)

    }).catch((x)=>{
        resp.status(500).json({error:x})
    })

});

// Get comments of a specific Post ID
app.get('/api/:idPost/comments/', commentLogin,(req,resp)=>{

    const idPost=req.params.idPost;
    // The "false" value is used for the post. 
    // In case of doubts give a look at app.get('/api/posts'')
    const data=dao.getCommentPost(idPost)
    data.then((x)=>{

        const fixDataComments=async(x)=>{
          let begin=[]

          // The condition depends who is asking for the comments:
          // First condition is satified if it's an anonymous account, else not.
          if (req.author==-1){
            begin=filterAnonymous(x)
            begin=await findAuthorComment(begin)
          }else{
            begin=await findAuthorComment(x)
          }

          
          let res=sortByDate(begin) 
          resp.json(res)
        }

        fixDataComments(x)

    }).catch((x)=>{
        resp.status(500).json({error:x})
    })

});

// Get interesting flags from the comments
app.get('/api/:idPost/comments/interesting', isLoggedIn,(req,resp)=>{

  const idPost=req.params.idPost;
  const data=dao.getCommentInteresting(idPost,req.user.id)

  data.then((x)=>{
    resp.json(x)
  }).catch((x)=>{
      resp.status(500).json({error:x})
  })

});


// Create association comment-interest
app.post('/api/commentInteresting/add',
  isLoggedIn,
  [
    check("commentId").notEmpty().isInt().withMessage("CommentId not valid"),
    check("postId").notEmpty().isInt().withMessage("Post id not valid")
  ],
  
  (req,resp)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return resp.status(400).json({ errors: errors.array() });
    }

    const body=req.body
    const commentInteresting={
      postId:body.postId,
      userId:req.user.id,
      commentId:body.commentId
    }

    const data=dao.setCommentInteresting(commentInteresting)
    data.then((x)=>{
        resp.json({success:x})
    }).catch((x)=>{
        resp.status(500).json({error:x})
    })

});

// Delete association comment-interest
app.delete('/api/commentInteresting/remove/',
  isLoggedIn,
  [
    check("commentId").notEmpty().isInt().withMessage("CommentId not valid"),
    check("postId").notEmpty().isInt().withMessage("Post id not valid")
  ]
  ,(req,resp)=>{

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return resp.status(400).json({ errors: errors.array() });
    }

    const body=req.body
    const commentInteresting={
      postId:body.postId,
      userId:req.user.id,
      commentId:body.commentId
    }

    const data=dao.removeCommentInteresting(commentInteresting)
    data.then((x)=>{
        resp.json({success:x})
    }).catch((x)=>{
        resp.status(500).json({error:x})
    })


});

// Delete comment and associated "commentInteresting" row/rows
app.delete('/api/comment/remove',
  isLoggedIn,
  [
    check("idPost").notEmpty().isInt().withMessage("idPost not valid"),
    check("commentId").notEmpty().isInt().withMessage("CommentId not valid")
  ]
  ,(req,resp)=>{

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return resp.status(400).json({ errors: errors.array() });
    }

    // This handles if it's the administrator logged with TOTP who want to edit/delete something
    let admin=false
    if (req.session.method=='totp'){
      admin=true
    }

    const body=req.body
    const comment={
      postId:body.idPost,
      idAuthor:req.user.id,
      id:body.commentId,
      admin:admin
    }

    const data=dao.removeComment(comment)
    data.then((x)=>{
        resp.json({success:x})
    }).catch((x)=>{
        resp.status(500).json({error:x})
    })
});

// Delete post and associated "commentInteresting" and "comment"
app.delete('/api/post/remove',
  isLoggedIn,
  [
    check("postId").notEmpty().isInt().withMessage("PostId is not valid")
  ]
  ,(req,resp)=>{

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return resp.status(400).json({ errors: errors.array() });
    }

    // This handles if it's the administrator logged with TOTP who want to edit/delete something
    let admin=false
    if (req.session.method=='totp'){
      admin=true
    }

    const body=req.body
    const post={
      idAuthor:req.user.id,
      id:body.postId,
      admin:admin
    }

    const data=dao.removePost(post)
    data.then((x)=>{
        resp.json({success:x})
    }).catch((x)=>{
        resp.status(500).json({error:x})
    })
});


// Create comment
// JSON input:{
//  idPost: id
//  content: text
// }
app.post('/api/comment/add',
  commentLogin,
  [
    check("idPost").notEmpty().isInt().withMessage("idPost not valid"),
    check("content").notEmpty().isString().withMessage("Content not valid")
  ],
  
  (req,resp)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return resp.status(400).json({ errors: errors.array() });
    }

    let anonymous=false

    if (req.author==-1){
      anonymous=true
    }

    const body=req.body
    const author=req.author
    const now=dayjs().format('YYYY-MM-DD HH:mm:ss')
    const comment={
      text:body["content"],
      timestamp:now,
      idAuthor:author,
      postId:body["idPost"]
    }

    const data=dao.setComment(comment,anonymous)
    data.then((x)=>{
        resp.json({success:x})
    }).catch((x)=>{
        resp.status(500).json({error:x})
    })

});


// Create Post:
// JSON:{
//  text:text,
//  maxComment:maxComment,
//  title:title
//}
app.post('/api/post/add',
  isLoggedIn,
  [
    check("maxComment").isInt().withMessage("Max Comment not valid"),
    check("text").notEmpty().isString().withMessage("Content not valid"),
    check("title").notEmpty().isString().withMessage("Title not valid")
  ],
  
  (req,resp)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return resp.status(400).json({ errors: errors.array() });
    }

    const body=req.body
    const now=dayjs().format('YYYY-MM-DD HH:mm:ss')
    const post={
      text:body["text"],
      timestamp:now,
      idAuthor:req.user.id,
      title:body["title"],
      maxComments:body["maxComment"],
    }

    const data=dao.setPost(post)
    data.then((x)=>{
        resp.json({success:x})
    }).catch((x)=>{
        resp.status(500).json({error:x})
    })

});


// Modify comment of user inside a Post
app.put('/api/comment/edit',
  isLoggedIn,
  [
    check("commentId").isInt().withMessage("Id not valid"),
    check("text").notEmpty().isString().withMessage("Content not valid"),
  ],
  
  (req,resp)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return resp.status(400).json({ errors: errors.array() });
    }

    // This handles if it's the administrator logged with TOTP who want to edit/delete something
    let admin=false
    if (req.session.method=='totp'){
      admin=true
    }

    const body=req.body
    const comment={
      id:body["commentId"],
      text:body["text"],
      idAuthor:req.user.id,
      admin:admin
    }

    const data=dao.editComment(comment)
    data.then((x)=>{
        resp.json({success:x})
    }).catch((x)=>{
        resp.status(500).json({error:x})
    })

});


// activate the server
app.listen(port, (err) => {
  if (err)
    console.log(err);
  else 
    console.log(`Server listening at http://localhost:${port}`);
}); 
