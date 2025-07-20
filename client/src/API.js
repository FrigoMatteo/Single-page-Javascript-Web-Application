
// Get all post initial setup fetch:
const getPosts=async ()=>{

    const response=await fetch('http://localhost:3001/api/posts',{
        method: "GET"
    });
    const posts=await response.json()

    console.log("Posts retrieved", posts)
    return posts;

}

// Get all comments related to a Post
const getComments=async (idPost)=>{

    const response=await fetch('http://localhost:3001/api/'+idPost+'/comments',{
        method: "GET",
        credentials:'include'
    });
    const comments=await response.json()

    console.log("Comments retrieved", comments)
    return comments;
}

// Get all interesting flag related to the comments of a specific Post
const getInterestComments=async (idPost)=>{

    const response=await fetch('http://localhost:3001/api/'+idPost+'/comments/interesting',{
        method: "GET",
        credentials:'include'
    });
    const comments=await response.json()

    console.log("Interest comments:", comments)
    return comments;

}

const sendPost=async (title, text, maxComment)=>{
    const response=await fetch('http://localhost:3001/api/post/add', {
            method: "POST",
            credentials:'include',
            headers: {
            "Content-type": "application/json",
            },
            body: JSON.stringify({
                title:title,
                text:text,
                maxComment:maxComment
            })
            }
    )

    const res=await response.json()

    console.log("Post inserted:", res)
    return res;

}



const sendCommentInteresting=async (postId, commentId)=>{
    const response=await fetch('http://localhost:3001/api/commentInteresting/add', {
            method: "POST",
            credentials:'include',
            headers: {
            "Content-type": "application/json",
            },
            body: JSON.stringify({
                postId: postId,
                commentId: commentId,
            })
            }
    )

    const res=await response.json()

    console.log("Comment-interesting sent:", res)
    return res;

}


const removeCommentInteresting=async (postId, commentId)=>{

    const response=await fetch('http://localhost:3001/api/commentInteresting/remove/',{
        method: "DELETE",
        credentials: 'include',
        headers: {
            "Content-type": "application/json",
        },
        body: JSON.stringify({
            postId: postId,
            commentId: commentId,
        })
    });
    const res=await response.json()

    console.log("Deleted comment-interesting:", res)
    return res;

}


const sendComment=async (idPost, text)=>{
    const response=await fetch('http://localhost:3001/api/comment/add', {
            method: "POST",
            credentials:'include',
            headers: {
            "Content-type": "application/json",
            },
            body: JSON.stringify({
                idPost: idPost,
                content: text,
            })
            }
    )

    const res=await response.json()

    console.log("Comments sent:", res)
    return res;

}


const editComment=async (commentId, text)=>{
    const response=await fetch('http://localhost:3001/api/comment/edit', {
            method: "PUT",
            credentials:'include',
            headers: {
            "Content-type": "application/json",
            },
            body: JSON.stringify({
                commentId: commentId,
                text: text,
            })
            }
    )

    const res=await response.json()

    console.log("Comment edited:", res)
    return res;

}

const removeComment=async (commentId,idPost)=>{

    const response=await fetch('http://localhost:3001/api/comment/remove',{
        method: "DELETE",
        credentials: 'include',
        headers: {
            "Content-type": "application/json",
        },
        body: JSON.stringify({
            idPost:idPost,
            commentId: commentId
        })
    });
    const res=await response.json()

    console.log("Deleted comment:", res)
    return res;
}

const removePost=async (postId)=>{

    const response=await fetch('http://localhost:3001/api/post/remove',{
        method: "DELETE",
        credentials: 'include',
        headers: {
            "Content-type": "application/json",
        },
        body: JSON.stringify({
            postId: postId
        })
    });
    const res=await response.json()

    console.log("Deleted post:", res)
    return res;
}


export {removePost,removeComment,editComment, getPosts,getComments,sendComment,getInterestComments,sendCommentInteresting,removeCommentInteresting,sendPost}