import { useState, useEffect} from 'react'
import {loginPhase,loginTOTPPhase} from '../API-user';
import {  useNavigate} from 'react-router';
import { Form, Row , Container, Col, Button, Alert} from 'react-bootstrap';


function LoginComponent(props){

    const navigate=useNavigate()
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');


    function handleSubmit(event){

        event.preventDefault();
        const credentials={username,password};

        if (username=='' || password==''){
            setErrorMessage('Missing Password or email')
            return ;
        }
        const log=async ()=>{
            const login= await loginPhase(credentials)

            if (login?.error){
                setErrorMessage(login.error)
            }else{
                props.setUser(login)
                if (login.canDoTotp){
                    navigate('/login-totp')
                }else{
                    navigate('/')
                }
                
            }

        }
        log()

    }

    return(
        <>
        <Container style={{marginTop:'150px'}}>
          <Row>
              <Col xs={3}></Col>
              <Col xs={6}>
                  <h2>Login</h2>
                  <Form onSubmit={handleSubmit}>
                      {errorMessage ? <Alert variant='danger' dismissible onClick={()=>setErrorMessage('')}>{errorMessage}</Alert> : ''}
                      <Form.Group controlId='email'>
                          <Form.Label>Email</Form.Label>
                          <Form.Control type='email' value={username} onChange={ev => setUsername(ev.target.value)} />
                      </Form.Group>
                      <Form.Group controlId='password'>
                          <Form.Label>Password</Form.Label>
                          <Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)} />
                      </Form.Group>
                      <Button className='my-2' type='submit'>Login</Button>
                      <Button className='my-2 mx-2' variant='danger' onClick={()=>navigate('/')}>Cancel</Button>
                  </Form>
              </Col>
              <Col xs={3}></Col>
          </Row>
      </Container>
        </>
    );
}


function LoginTotpComponent(props){

    const navigate=useNavigate()
    const [totp, setTotp] = useState('');
    const [errorMessage, setErrorMessage] = useState('');


    function handleSubmit(event){

        event.preventDefault();
        const credentials={totp};

        if (totp==''){
            setErrorMessage('Missing TOTP')
            return ;
        }
        const log=async ()=>{
            const login= await loginTOTPPhase(credentials)

            if (login?.error){
                setErrorMessage(login.error)
            }else{
                props.setUser(login)
                navigate('/')
            }

        }
        log()

    }

    return(
        <>
        <Container style={{marginTop:'200px'}}>
          <Row>
              <Col xs={3}></Col>
              <Col xs={6}>
                  <h2>TOTP access</h2>
                  <Form onSubmit={handleSubmit}>
                      {errorMessage ? <Alert variant='danger' dismissible onClick={()=>setErrorMessage('')}>{errorMessage}</Alert> : ''}
                      <Form.Group controlId='totp'>
                          <Form.Control inputMode='numeric' pattern='[0-9]*' maxLength={6} value={totp} onChange={ev => setTotp(ev.target.value.replace(/\D/g, ''))} />
                      </Form.Group>
                      <Button className='my-2' type='submit'>Login</Button>
                      <Button className='my-2 mx-2' variant='danger' onClick={()=>navigate('/')}> Act as a user</Button>
                  </Form>
              </Col>
              <Col xs={3}></Col>
          </Row>
      </Container>
        </>
    );
}


export {LoginComponent,LoginTotpComponent};

