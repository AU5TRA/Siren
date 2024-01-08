import React, {useState, Fragment} from 'react';

import './style.css';

const AddUser = () => {
   
    const [username, setName] = useState("");
    const [email, setEmail] = useState("");
    const [nid, setNid] = useState("");
    const [phone, setPhone] = useState("");
    const [gender, setGender] = useState("1");
    const onSubmitForm = async(e)=>{
        e.preventDefault();
        try{
            const body = { username, email, nid, gender, phone };
            const response= await fetch("http://localhost:3001/users/", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(body)
            });
            console.log(response);
        }catch(err){
            console.error(err.message);
        }

    }
    return (
        <Fragment>
        <div className='top-spacing mb-3'>
            <form action="" onSubmit={onSubmitForm}>
                <div className="form-row">
                    <div className='col-md-6 mb-2 '>
                        <input type="text" className='form-control' placeholder='Name' value={username} onChange={e=> setName(e.target.value)}/>
                    </div>
                    <div className='col-md-6 mb-2'>
                        <input type="text" className='form-control' placeholder='Email' value={email} onChange={e=> setEmail(e.target.value)}/>
                    </div>
                    <div className='col-md-6 mb-2'>
                        <input type="text" className='form-control' placeholder='NID' value={nid} onChange={e=> setNid(e.target.value)}/>
                    </div>
                    <div className='col-md-6 mb-2'>
                        <input type="text" className='form-control' placeholder='Phone number' value={phone} onChange={e=> setPhone(e.target.value)}/>
                    </div>
                    <div className='col-md-6 mb-2'>
                        <h5>Gender:</h5>
                        <select className='custom-select my-10 mr-sm-12 ' value={gender} onChange={e=> setGender(e.target.value)}>
                            <option value='1'>Male</option>
                            <option value='2'>Female</option>
                            <option value='3'>Other</option>
                        </select>
                    </div>
                    <button className="btn btn-primary">Register User</button>
                </div>

            </form>


        </div>
        </Fragment>
        )
    
}

export default AddUser