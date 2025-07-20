// Logout fetch
const logoutSession=async ()=>{

    const response=await fetch('http://localhost:3001/api/session/logout',{
        method: "DELETE",
        credentials: 'include',
    });
    const Logout=await response

    console.log("Logout", Logout)
    return Logout;

}

// Get user Sessions:
const getSessionAPI=async ()=>{

    const response=await fetch('http://localhost:3001/api/session/current',{
        method: "GET",
        credentials: 'include',
    });
    const user=await response.json()

    console.log("Credentials session", user)
    return user;

}


// Login Fetch:
const loginPhase=async (credentials)=>{
    const response=await fetch('http://localhost:3001/api/session/login',{
        method: "POST",
        credentials: 'include',
        headers: {
        "Content-type": "application/json",
        },
        body: JSON.stringify(credentials),
    });
    const login=await response.json()

    console.log("Login", login)
    return login;

}


// Login TOTP:
const loginTOTPPhase=async (credentials)=>{
    const response=await fetch('http://localhost:3001/api/session/login-totp',{
        method: "POST",
        credentials: 'include',
        headers: {
        "Content-type": "application/json",
        },
        body: JSON.stringify({
            code:credentials.totp
        }),
    });

    if (!response.ok){
        const err=await response.text();
        return {error:err}
    }
    const login=await response.json()
    console.log("Login:", login)

    return login;

}


export {loginPhase,logoutSession,getSessionAPI,loginTOTPPhase}