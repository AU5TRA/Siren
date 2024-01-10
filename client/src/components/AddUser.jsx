import React, { useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';

import './style.css';

const AddUser = () => {
    let navigate = useNavigate();
    const [username, setName] = useState("");
    const [email, setEmail] = useState("");
    const [nid, setNid] = useState("");
    const [phone, setPhone] = useState("");
    const [gender, setGender] = useState("M");

    const clearForm = () => {
        setName("");
        setEmail("");
        setNid("");
        setPhone("");
        setGender("1");
    };
    const goHome = () => {
        try {
            navigate('/');
        } catch (err) {
            console.error(err.message);
        }
    }

    const onSubmitForm = async (e) => {
        e.preventDefault();

        if (!username.trim() || !email.trim() || !nid.trim() || !phone.trim() || !gender.trim()) {
            console.error("All fields are required");
            return; 
        }
        try {
            
            const body = { username, email, nid, gender, phone };
            const response = await fetch("http://localhost:3001/users/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            console.log(response);
            if (response.ok) {
                clearForm();
            }
        } catch (err) {
            console.error(err.message);
        }

    }
    return (
        <Fragment>
            <div className='top-spacing mb-3'>
                <form action="" onSubmit={onSubmitForm}>
                    <div className="form-row">
                        <div className='col-md-6 mb-2 '>
                            <input type="text" className='form-control' placeholder='Name' value={username} onChange={e => setName(e.target.value)} />
                        </div>
                        <div className='col-md-6 mb-2'>
                            <input type="text" className='form-control' placeholder='Email' value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                        <div className='col-md-6 mb-2'>
                            <input type="text" className='form-control' placeholder='NID' value={nid} onChange={e => setNid(e.target.value)} />
                        </div>
                        <div className='col-md-6 mb-2'>
                            <input type="text" className='form-control' placeholder='Phone number' value={phone} onChange={e => setPhone(e.target.value)} />
                        </div>
                        <div className='col-md-6 mb-2'>
                            <h5>Gender:</h5>
                            <select className='custom-select my-10 mr-sm-12 ' value={gender} onChange={e => setGender(e.target.value)}>
                                <option value='M'>Male</option>
                                <option value='F'>Female</option>
                                <option value='O'>Other</option>
                            </select>
                        </div>
                        <div className='col-md-6 mb-2'>
                        <button className="btn btn-primary">Register</button></div>

                    </div>

                </form>

                <button className='btn btn-success ' onClick={ ()=> goHome()}>back</button>

            </div>
        </Fragment>
    )

}

export default AddUser