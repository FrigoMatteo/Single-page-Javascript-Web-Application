import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState, useEffect} from 'react'
import {removePost, editComment,removeComment, getPosts,getComments, getInterestComments,sendCommentInteresting,removeCommentInteresting} from '../API'
import { Col, Row,  Container, Button, Alert} from 'react-bootstrap';
import {useNavigate } from 'react-router-dom';
import {CommentUsers,InsertComment} from './comments';

function SetPostVisual(props){

    const [showcomment,setShowComment]=useState(false) // Used when pressing the comment show button
    const [commentList,setCommentList]=useState([]) 
    const [commentDirty, setCommentDirty]=useState(false) // Used if we add a comment
    const [loadInterest,setLoadInterest]=useState(false) // Used to show the flag interest next to the comments
    const [removePost,setRemovePost]=useState(false) // Used if we miss click remove Post
    const [errorMessage, setErrorMessage] = useState('');
    const p=props.p

    function handleSubmitEdit(commentId,text){
        const update=async()=>{
            const res=await editComment(commentId,text)

            if (res?.error){
                setErrorMessage("Error submiting the edit. Contact the administrator")
            }else{
                setCommentDirty(true)
            }
        }

        update()

    }

    const handleRemovePost = () => {
        if (!removePost) {
            setRemovePost(true);

            // Miss click prevention. It waits three seconds.
            // If it press again, then it will eliminate the post
            const timer = setTimeout(() => {
                setRemovePost(false);
            }, 3000); 

        } else {
            props.handleRemove(p.id)
            setRemovePost(false);
        }
    };


    function handleRemoveComment(commentId){

        const update=async()=>{
            const res=await removeComment(commentId,p.id)

            if (res?.error){
                setErrorMessage("Error removing the comment. Contact the administrator")
            }else{
                setCommentDirty(true)
                props.setDirty(true)
            }
        }

        update()

    }

    function setCounterComment(comments,interestList){
        let result=[]
        for (let c of comments){

            const inter=interestList[c.id]

            if (inter!=undefined){
                c['counter']=inter.counter
                c['interest']=inter.interest
            }else{
                c['counter']=0
                c['interest']=0
            }

            result.push(c)
        }
        return result
    }

    // Only purpose of this function is to update the singular comment.
    const addInterestComment= async(commentId)=>{
        
        const update=async()=>{
            const res=await sendCommentInteresting(p.id,commentId)
            if (res?.error){
                setErrorMessage("Error adding interest to comment. Contact the administrator")
            }else{
                setCommentDirty(true)
            }
            
        }
        update()
    }

    const removeInterestComment=async(commentId)=>{

        const update=async()=>{
            const res=await removeCommentInteresting(p.id,commentId)
            if (res?.error){
                setErrorMessage("Error removing interest to comment. Contact the administrator")
            }else{
                setCommentDirty(true)
            }
        }
        update()
    }


    /*                  !!!! USE EFFECTS:    !!!!                */

    useEffect(()=>{
        if (showcomment || commentDirty){
            const setCommentsGet=async()=>{

                const cs=await getComments(p.id)
                if (cs?.error){

                    setCommentList([]) 
                    setErrorMessage("Error retrieving all comments. Contact the administrator")
                }else{
                    
                    // We get the interest flags for each message
                    const res=await getInterestComments(p.id)
                    if (res?.error){
                        setLoadInterest(false)
                        setCommentList(cs)
                    }else{
                        // Useful to see if there are comments where we put the interest flag and how many there are
                        const result=setCounterComment(cs,res)
                        setCommentList(result)
                        setLoadInterest(true)
                    }
                }
            }

            setCommentsGet()
            setCommentDirty(false)
            
        }

    },[showcomment, commentDirty])

    useEffect(()=>{

        if(props.logoutAction){
            props.setLogoutAction(false)
            setShowComment(false)
            setCommentList([]) 
        }

    },[props.logoutAction])



    /*                  !!!! RETURN:    !!!!                */

    return(

        <>
        <Row className='d-flex justify-content-center' style={{ 'marginTop':'20px'}}>
            <Col md={3}>
            <div className="border rounded p-3 shadow-sm" style={{ backgroundColor: removePost ? '#ff8e8e' : null, 'marginRight':'60px'}}>
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">{p.title}</h5>
                    { props.user && (props.user.id==p.idAuthor || props.user.isTotp) ? 
                    <Button onClick={() => handleRemovePost()} className="bi bi-trash btn btn-danger btn-sm"/>
                    : null
                    }
                </div>
                <div>
                    <i className="bi bi-person-circle"></i> {p.author}
                </div>
                <div>
                    <i className="bi bi-send-check"></i> Posted the {p.timestamp}
                </div>
                <div style={{cursor: 'pointer', fontWeight: 'bold' }} onClick={()=>{setShowComment(comment => !comment)}}>
                    <i className="bi bi-chat-dots"></i>
                    <span> {showcomment ? 'Hide' : 'Show'} comments</span>
                </div>
                <div>
                    <i className="bi bi-people"></i>
                    <span> Max comments {p.commentsNumber}/{p.maxComments}</span>
                </div>
                <div>
                    <i className="bi bi-person-x"></i>
                    <span> Anonymous comments {p.commentsAnonymous}</span>
                </div>
                {removePost ? <h6 style={{marginTop:'10px'}}> Are you sure? Press again the button or wait</h6> : null}
            </div>
            </Col>
            <Col
            md={4}
            style={{
                backgroundColor: '#d4edda',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 0 15px 5px #d4edda'
            }}
            >

            <div style={{ whiteSpace: 'pre-line' }}>{p.text}</div>
            </Col>
        </Row>
        {showcomment ? 
        
        <Row className="pt-2 pb-2 d-flex justify-content-center" style={{marginTop:'20px'}}>
            <Col md={5} className="border rounded" style={{
                backgroundColor: '#f3f3f3',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 0 15px 5px #f3f3f3'}}>
                    {errorMessage ? <Alert variant='danger' dismissible onClick={()=>setErrorMessage('')}>{errorMessage}</Alert> : ''}
                    <InsertComment p={p} setErrorMessage={setErrorMessage} setDirty={props.setDirty} setCommentDirty={setCommentDirty}/> 
                    {commentList.map(e=><CommentUsers handleRemoveComment={handleRemoveComment} handleSubmitEdit={handleSubmitEdit} user={props.user} removeInterestComment={removeInterestComment} addInterestComment={addInterestComment} loadInterest={loadInterest} comment={e} key={e.id}/>)}

            </Col>
        </Row>
        
        : null }

        <div className="w-100" style={{ height: '5px', backgroundColor: '#d4edda', marginTop:'30px'}}></div>
        </>

    );
}

function Posts(props){

    const [posts,setPosts]=useState([])
    const [dirty,setDirty]=useState(true)
    const [errorMessage, setErrorMessage] = useState('');
    const navigate=useNavigate()

    useEffect(()=>{
        if (dirty){
            const setPostsGet=async()=>{

                const p=await getPosts()
                if (p?.error){
                    setPosts([]) 
                    setErrorMessage("Error retrieving posts. Contact administrator")
                }else{
                    setPosts(p)
                }

            }
            setPostsGet()
            setDirty(false)
        }
    },[dirty])

    function handleRemove(postId){

        const update=async()=>{
            const res=await removePost(postId)
            if (res?.error){
                setErrorMessage("Error retrieving posts. Contact administrator")
            }else{
                setDirty(true)
            }
        }
        update()
    }


    return (
        <>
        <Container fluid>
            {errorMessage ? <Alert variant='danger' dismissible onClick={()=>setErrorMessage('')}>{errorMessage}</Alert> : ''}
            {props.user ? 

            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                <Button onClick={()=> navigate('/add')} variant="outline-primary" type="button" style={{marginTop:'20px'}} className="btn btn-outline-primary rounded-pill fs-5 border-2"> + Crea </Button> 
            </div>

            : null
            }
            <Row>
                {posts.map(e=><SetPostVisual handleRemove={handleRemove} setDirty={setDirty} logoutAction={props.logoutAction} setLogoutAction={props.setLogoutAction} user={props.user} p={e} key={e.id}/>)}
            </Row>
        </Container>
        </>
    );
}

export {Posts}