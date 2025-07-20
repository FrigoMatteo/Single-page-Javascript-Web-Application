import { useState, useEffect} from 'react'
import {sendPost} from '../API';
import {  useNavigate} from 'react-router';
import { Form, Row , Container, Col, Button, Alert} from 'react-bootstrap';


function CreatePostLayout(props){
    const [errorMessage, setErrorMessage] = useState('');
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [maxcomments, setMaxcomments] = useState(0);
    const navigate=useNavigate();

    function handleSubmit(event){
        event.preventDefault();

        if (text=='' || title==''){
            setErrorMessage('Missing title or text')
            return
        }

        if(maxcomments==''){
            setMaxcomments(0)
        }

        const sendP=async()=>{

            const res=await sendPost(title,text,maxcomments)
            if (res?.error){
                setErrorMessage(res.error)
            }else{
                navigate('/')
            }
        }

        sendP()
    }

    return (
        <>
        <Container style={{marginTop:'100px'}}>
            <Row>
                <Col xs={2}></Col>
                <Col xs={8} className='d-flex justify-content-center'>
                <div className="w-100">
                    <Row><h2 className='d-flex justify-content-center'>Create a Post!</h2></Row>
                    <Form onSubmit={handleSubmit}>
                        {errorMessage ? <Alert variant='danger' dismissible onClick={()=>setErrorMessage('')}>{errorMessage}</Alert> : ''}
                        <Row>
                            <Col xs={8}>
                            <Form.Group controlId='title'>
                                <Form.Label>Title</Form.Label>
                                <Form.Control placeholder="Title" value={title} onChange={ev => setTitle(ev.target.value)}/>
                            </Form.Group>
                            </Col>
                            <Col xs={4}>
                            <Form.Group controlId='maxComments'>
                                <Form.Label>Max Anonymous comments</Form.Label>
                                <Form.Control type="number" value={maxcomments} onChange={ev => setMaxcomments(ev.target.value)} placeholder="1, 2, 3..." step="1"/>
                            </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Form.Group className="mb-3" controlId="text">
                                <Form.Label>Example textarea</Form.Label>
                                <Form.Control as="textarea" value={text} onChange={ev => setText(ev.target.value)} placeholder="Write your text here.." rows={8} />
                            </Form.Group>
                        </Row>
                        <Button className='my-2' type='submit'>Create</Button>
                        <Button className='my-2 mx-2' variant='danger' onClick={()=>navigate('/')}>Cancel</Button>
                    </Form>
                </div>
                    
                </Col>
                <Col xs={2}></Col>
            </Row>

      </Container>
        </>
    );
}

export {CreatePostLayout};