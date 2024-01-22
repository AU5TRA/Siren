import React, { Fragment, useState } from 'react'
import { useHistory } from 'react-router-dom'


const Login = (props) => {
    // const [credentials, setCredentials] = useState({email: "", password: ""}) 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    let history = useHistory();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const body = { email, password }
            const response = await fetch("http://localhost:3001/users/login", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            const json = await response.json()
            console.log(json);
            if (json.success) {
                localStorage.setItem('token', json.authtoken);
                history.push("/");

            }
            else {
                alert("Invalid credentials");
            }
        }
        catch (err) {
            console.log(err.message);
        }
    }



    return <Fragment>
        <div>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email address</label>
                    <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} id="email" name="email" aria-describedby="emailHelp" />
                    <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} name="password" id="password" />
                </div>

                <button type="submit" className="btn btn-primary">Submit</button>
            </form>
        </div>
    </Fragment>
}

export default Login

