import React, { useState, useEffect, Fragment } from 'react';
import { useParams } from 'react-router-dom';


const ShowUser = () => {
  const modalRef = React.createRef();

  const { id } = useParams();
  const [userData, setUserData] = useState([]);

  const [address, setAddress] = useState('');
  const [post_code, setPostcode] = useState('');
  const [phone_number, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [new_password, setNewPassword] = useState('');
  const [date_of_birth, setDOB] = useState('');
  const [birth_registration_number, setBirthReg] = useState('');
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://localhost:3001/users/${id}`);
        const rec = await response.json();
        console.log(rec.data.result);
        setUserData(rec.data.result);
        //setUser(rec.data.result);
        console.log("hello");

        setAddress(rec.data.result.address || '');
        setPostcode(rec.data.result.post_code || '');
        setPhone(rec.data.result.phone_number || '');
        setEmail(rec.data.result.email || '');
        setDOB(rec.data.result.date_of_birth || '');
        setBirthReg(rec.data.result.birth_registration_number || '');

        // console.log(userData);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchUserData();
  }, [id]);



  const UpdateInformation = async (e) => {
    console.log("here");
    console.log(userData.user_id)
    e.preventDefault();
    try {
      if (!password) {
        console.log("enter password");
        return;
      }
      console.log("pass ok")
      console.log(userData.user_id)
      const body = { address, post_code, phone_number, email, password, date_of_birth, birth_registration_number, new_password }
      const res = await fetch(`http://localhost:3001/users/${userData.user_id}/update`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
      window.location = `/users/${userData.user_id}`;
      console.log("updated")
      console.log(res)
    } catch (err) {
      console.error(err.message);
    }
  }

  const formatDateOfBirth = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const resetInfo = () => {
    setAddress(userData.address);
    setPostcode(userData.post_code);
    setPhone(userData.phone_number);
    setEmail(userData.email);
    setPassword('');
    setDOB(userData.date_of_birth);
    setBirthReg(userData.birth_registration_number);
  }

  return (<Fragment>
    <div>
      {userData ? (
        <div className="user-container">
          <h4>User Information</h4>
          <div className="user-details">
            <p>User ID: {userData.user_id}</p>
            <p>First Name: {userData.first_name}</p>
            <p>Last Name: {userData.last_name}</p>
            <p>Date of Birth: {formatDateOfBirth(userData.date_of_birth)}</p>
            <h4>Contact Information</h4>
            <p>Email: {userData.email}</p>
            <p>Phone Number: {userData.phone_number}</p>
            <h4>Address</h4>
            <p>Details: {userData.address}</p>
            <p>Postcode: {userData.post_code}</p>
          </div>

        </div>


      ) : (
        <p>Loading...</p>
      )}
    </div>
    <button type="button" className="btn btn-warning" onClick={() => modalRef.current.style.display = 'block'}>
      Edit
    </button>



    <div className="modal" ref={modalRef}>

      <div className="modal-dialog">
        <div className="modal-content">

          <div className="modal-header">
            <h4 className="modal-title">Update your information</h4>
            <button type="button" className="close" data-dismiss="modal" onClick={() => modalRef.current.style.display = 'none'}>&times;</button>
          </div>

          <div className="modal-body">
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
              placeholder='Birth registration number'
              value={birth_registration_number || ''}
              onChange={e => setBirthReg(e.target.value)}
            />

            <h2>Change password</h2>
            <input
              type="password"
              className="form-control mb-2"
<<<<<<< HEAD
              placeholder="Enter password to confirm"
=======
              placeholder="Old password"
>>>>>>> 762fdb7d089df30373bdf56f9fc2bab557d09f81
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <input
              type="password"
              className="form-control mb-2"
              placeholder="New password"
              value={new_password || ''}
              onChange={e => setNewPassword(e.target.value)}
            />

            {/*<input type="text" className='form-control' placeholder='First name' value={first_name} onChange={e => setFirstName(e.target.value)} /> */}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-warning" data-dismiss="modal" onClick={UpdateInformation}>Confirm</button>
            <button type="button" className="btn btn-danger" data-dismiss="modal" onClick={resetInfo}>Reset</button>
          </div>

        </div>
      </div>
    </div>
  </Fragment>
  );
};

export default ShowUser;
