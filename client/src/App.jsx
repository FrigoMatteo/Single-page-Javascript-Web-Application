import { useState, useEffect} from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Navbar , Container, Image, Button, Badge} from 'react-bootstrap';
import { Routes, Route, Outlet, Link , BrowserRouter, useNavigate} from 'react-router';
import {Posts} from '../src/components/posts'
import {LoginComponent,LoginTotpComponent} from './components/authentication'
import {logoutSession,getSessionAPI} from './API-user'
import {CreatePostLayout} from './components/createPost'

function Header(props) {
  const navigate=useNavigate()

  return(
    <>
  <Navbar className="justify-content-between p-3" style={{ backgroundColor: '#27901b', color: '#155724'}}>
      <Container fluid>
        <a className="navbar-brand text-white" style={{cursor: 'pointer'}} onClick={()=>{navigate('/')}}>Forum</a>
    
      <div>

      { !props.user ? 
      <Link to='/login'>
          <Button className='mx-2' variant='warning'>
            <i className="bi bi-person-circle"></i> Login 
          </Button>
      </Link>
      :
      (
      <>
      <a className="navbar-brand text-white">{"Welcome "+props.user.name}</a>
      {
        props.user.canDoTotp ?
        props.user.isTotp ?
        <Badge pill bg="danger" style={{ fontSize: '1.1rem' ,padding: '0.6em 0.7em' }}>
          Administrator mode
        </Badge>
        : 
        <Badge bg="light" text="dark" style={{ fontSize: '1.1rem', padding: '0.6em 0.7em' }}>
          User mode
        </Badge>

      : null
      }

      <Button className='mx-2' variant='warning' onClick={()=>{props.logout()}}>Logout</Button>
      </>
      )
    }
    </div>
    </Container>
  </Navbar>
  </>
  );
}

function WrongPage(props){
  const navigate=useNavigate()

  return(
    <div className="flex flex-col items-center justify-center min-h-screen text-center" style={{marginTop:'50px'}}>
      <div>
        <h2>What are you looking for?</h2>
         <Button variant="primary" type="button" onClick={() => navigate('/')}> Go back home </Button>
      </div>
      <Image src="/big_brothers_meme.png" roundedCircle className="w-25"/>

    </div>
  );
}


function App() {
  const [user,setUser]=useState(undefined)

  // State used when we logout to clear comments (since you became anonymous, you cannot read the comments of other users)
  const [logoutAction,setLogoutAction]=useState(false)

  async function logout(){
    await logoutSession()
    setLogoutAction(true)
    setUser(undefined)
  }

  return (
    <>
    <BrowserRouter>
      <Routes>

      <Route path="/" element={<Layout user={user} setUser={setUser} logout={logout}/>}>
        <Route index element={<Posts user={user} logoutAction={logoutAction} setLogoutAction={setLogoutAction}/>}/>
        <Route path="login" element={<LoginComponent setUser={setUser}/>}/>
        <Route path="login-totp" element={<LoginTotpComponent setUser={setUser}/>}/>
        <Route path="add" element={<CreatePostLayout/>}/>
        <Route path="*" element={<WrongPage />} />
      </Route>
      
      </Routes>
    </BrowserRouter>
    </>
  )
}

function Layout(props){

  useEffect(()=>{
    // Used to set any possible account previously logged in

    const getSes=async ()=>{
      const user=await getSessionAPI()
      if (user?.error){
        props.setUser(undefined)
      }else{
        props.setUser(user)
      }
    }

    getSes()
  },[])

  return (

    <>
    <Header user={props.user} logout={props.logout}/>
    <Outlet />
    </>

  )

}


export default App
