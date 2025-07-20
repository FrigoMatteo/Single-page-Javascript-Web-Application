import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState} from 'react'
import {sendComment} from '../API'
import { InputGroup , Row, Form, Button } from 'react-bootstrap';

function InsertComment(props){

    const [comment, setComment]=useState('')

    function handleSubmit(event){
        event.preventDefault();

        if (comment == ''){
            props.setErrorMessage("Comment cannot be empty")
            return;
        }

        const sendC=async()=>{
            const resp=await sendComment(props.p.id,comment)
            if (resp?.error){
                props.setErrorMessage("Maximum comment limit reached")
            }else{
                props.setCommentDirty(true)
                props.setDirty(true)
                setComment('')
            }
        }
        sendC()
    }

    return(
    <Form onSubmit={handleSubmit}>
        <InputGroup>
            <Button type="submit" className="bg-light text-dark border"> Insert Comment </Button>
            <Form.Control as="textarea" placeholder="Comments.." aria-label="With textarea" value={comment} onChange={ev => setComment(ev.target.value)}/>
        </InputGroup>
    </Form>
 
    );
}


function CommentUsers(props){

    const [edit,setEdit] =useState(false)
    const [editText,setEditText]=useState('')
    const [removeCo,setRemoveCo]=useState(false) // Used if we miss click remove Comment


    const handleRemove = () => {
        if (!removeCo) {
            setRemoveCo(true);

            // Miss click prevention. It waits three seconds.
            // If it press again, then it will eliminate the comment
            const timer = setTimeout(() => {
                setRemoveCo(false);
            }, 3000);

        } else {
            props.handleRemoveComment(props.comment.id)
            setRemoveCo(false);
        }
    };


    return(
        <>
        <Row className="pt-2 pb-2 d-flex justify-content-center" style={{backgroundColor: removeCo ? '#ff8e8e' : null ,marginTop:'20px', marginBottom:'20px'}}>
            <div>
                <i className="bi bi-person-circle" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}> {props.comment.author} </i>
                <span className='fw-lighter text-body-secondary'> 
                    {props.comment.timestamp }
                </span>
                <span> 

                    { props.loadInterest ? 

                    <>
                    {" "}
                    {props.comment.interest ? 
                    <i className="bi bi-bookmark-fill" onClick={()=>props.removeInterestComment(props.comment.id)}></i> 
                    : <i className="bi bi-bookmark" onClick={()=>props.addInterestComment(props.comment.id)}></i>}
                    {props.comment.counter} 
                    </>
                    
                    : null}
                    {removeCo ? <span style={{ fontWeight: 'bold' }}> Are you sure? Press again the button or wait</span> : null}

                </span>
            </div>
            <div style={{ whiteSpace: 'pre-line' }}>
                <div className="d-flex justify-content-between align-items-center">
                    
                    {edit ?
                    <>
                    <Form>
                        <InputGroup>
                            <Form.Control as="textarea" aria-label="With textarea" value={editText} onChange={ev => setEditText(ev.target.value)}  rows={1} cols={60}/>
                            <Button variant="secondary" onClick={()=>{setEdit(false); props.handleSubmitEdit(props.comment.id, editText)}}>Edit</Button>
                        </InputGroup>
                    </Form>
                    </>
                    : 
                    <div style={{maxWidth: '600px'}}>
                        {props.comment.text}
                    </div>
                    }

                    { props.user && ( props.user.id==props.comment.idAuthor || props.user.isTotp)? 
                    <div>
                        {edit ? 
                        <Button onClick={() => {setEdit(false); setEditText('')}} className="bi bi-x-square-fill btn btn-warning btn-sm me-2" /> 
                        
                        : <Button onClick={() => {setEdit(true); setEditText(props.comment.text)}} className="bi bi-pencil-square btn btn-warning btn-sm me-2" />
                        }

                        <Button onClick={() => {handleRemove()}} className="bi bi-trash btn btn-danger btn-sm"/>
                    </div>
                    : null
                    }
                </div>
            </div>
        </Row>
        </>
    )
}


export {CommentUsers,InsertComment}