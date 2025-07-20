'use strict';
const dayjs = require('dayjs');
const daoUser = require('./dao-user.js');

// Used for both comments and posts sorting
function sortByDate(data){

  if (!data || data.length==0){
    return data;
  }

  let result=[data[0]];
  for (let i=1;i<data.length;i++){
    let inserted=false;

    for (let j=0;j<result.length;j++){
      const pTime=dayjs(data[i].timestamp)
      const rTime=dayjs(result[j].timestamp)
      if (pTime.diff(rTime)>=0){
        result.splice(j,0,data[i])
        inserted = true;
        break;
      }
    }
    if (!inserted) {
      result.push(data[i]);
    }
    
  }
  return result

}

function filterAnonymous(comments){

  let result=[]
  for (let c of comments){
    if (c.idAuthor==-1){
      
      result.push(c)
    }
  }
  return result

}

const findAuthorPost= async (posts)=> {

  // I needed to use Promise.all for concurrency problems.
  // Else it won't be consistent in the values, making changes to title, text, id etc.
  const result=await Promise.all(
    posts.map(async (p) => {
      try {
        const user=await daoUser.getUserById(p.idAuthor);
        return {
          author:user.name,
          idAuthor:p.idAuthor,
          id:p.id,
          commentsNumber:p.commentsNumber,
          commentsAnonymous:p.commentsAnonymous,
          maxComments:p.maxComments,
          text:p.text,
          timestamp:p.timestamp,
          title: p.title
        };
      } catch (x) {
        return {error:x};
      }
    })
  );

  return result;

}

const findAuthorComment=async(comments)=>{

  const result=await Promise.all(
    comments.map(async (c) => {
      try {
        let name=''
        
        if (c.idAuthor==-1){
          name="Anonymous"
        }else{
          const user=await daoUser.getUserById(c.idAuthor);
          name=user.name
        }

        return {
          author:name,
          idAuthor:c.idAuthor,
          id:c.id,
          text:c.text,
          timestamp:c.timestamp,
        };

      } catch (x) {
        return {error:x};
      }
    })
  );

  return result
}


function userInfo(req) {
  const user=req.user;
	return {id: user.id, username: user.username, name: user.name, canDoTotp: user.admin==1 ? true: false, isTotp: req.session.method === 'totp' ? true : false};
}


module.exports = {userInfo, sortByDate,findAuthorPost,findAuthorComment,filterAnonymous };