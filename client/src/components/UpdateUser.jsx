import React, { Fragment, useState } from 'react'

const UpdateUser = ({ user }) => {
    const [address, setAddress] = useState(user.address);
    const [post_code, setPostcode] = useState(user.post_code);
    const [phone_number, setPhone] = useState(user.phone_number);
    const [email, setEmail] = useState(user.email);
    const [password, setPassword] = useState(user.password);
    const [date_of_birth, setDOB] = useState(user.date_of_birth);
    const [birth_registration_number, setBirthReg] = useState(user.birth_registration_number);

    const UpdateInformation = async (e) => {
        e.preventDefault();
        try {
            const body = { address, post_code, phone_number, email, password, date_of_birth, birth_registration_number }
            const res = await fetch(`http://localhost:3001/users/${user.user_id}/update`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body)
                });
            window.location = "/";
            //console.log("updated")
            // console.log(res)
        } catch (err) {
            console.error(err.message);
        }
    }

    const resetInfo = () => {
        setAddress(user.address);
        setPostcode(user.post_code);
        setPhone(user.phone_number);
        setEmail(user.email);
        setPassword(user.password);
        setDOB(user.date_of_birth);
        setBirthReg(user.birth_registration_number);
    }


    return <Fragment>

        <button type="button" class="btn btn-warning" data-toggle="modal" data-target={`#id${user.user_id}`}>
            Edit
        </button>


        <div class="modal" id={`id${user.user_id}`}>
            <div class="modal-dialog">
                <div class="modal-content">

                    <div class="modal-header">
                        <h4 class="modal-title">Update your information</h4>
                        <button type="button" class="close" data-dismiss="modal" onClick={() => { resetInfo() }}>&times;</button>
                    </div>

                    <div class="modal-body">
                        <input
                            type="text"
                            className="form-control mb-2"
                            placeholder='Address'
                            value={address || ''}
                            onChange={e => setAddress(e.target.value)}
                        />
                        <input
                            type="text"
                            className="form-control mb-2"
                            placeholder='Postcode'
                            value={post_code || ''}
                            onChange={e => setPostcode(e.target.value)}
                        />

                        <input
                            type="text"
                            className="form-control mb-2"
                            placeholder='Phone number'
                            value={phone_number || ''}
                            onChange={e => setPhone(e.target.value)}
                        />

                        <input
                            type="text"
                            className="form-control mb-2"
                            placeholder='Email'
                            value={email || ''}
                            onChange={e => setEmail(e.target.value)}
                        />
                        <input
                            type="text"
                            className="form-control mb-2"
                            placeholder='Date of birth'
                            value={date_of_birth}
                            onChange={e => setDOB(e.target.value)}
                        />
                        <input
                            type="text"
                            className="form-control mb-2"
                            placeholder='Birth registration number'
                            value={birth_registration_number || ''}
                            onChange={e => setBirthReg(e.target.value)}
                        />
                        <input
                            type="text"
                            className="form-control mb-2"
                            placeholder='Password'
                            value={password || ''}
                            onChange={e => setPassword(e.target.value)}
                        />

                        {/*<input type="text" className='form-control' placeholder='First name' value={first_name} onChange={e => setFirstName(e.target.value)} /> */}
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn btn-warning" data-dismiss="modal" onClick={e => UpdateInformation(e)}>Confirm</button>
                        <button type="button" class="btn btn-danger" data-dismiss="modal" onClick={() => { resetInfo() }}>Close</button>
                    </div>

                </div>
            </div>
        </div>
    </Fragment>
}

export default UpdateUser;