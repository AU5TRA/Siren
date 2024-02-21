import React, { Fragment, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker'; // Import DatePicker component
import 'react-datepicker/dist/react-datepicker.css';

function AddUser() {
  let navigate = useNavigate();
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [nid_number, setNid] = useState(null);
  const [birth_registration_number, setBirthReg] = useState(null);
  const [phone_number, setPhone] = useState(null);
  const [email, setEmail] = useState(null);
  const [date_of_birth, setDob] = useState(null);
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('Male');
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [userID, setUserID] = useState('not available');

  const onSubmitForm = async (e) => {
    e.preventDefault();
    try {
      const body = { first_name, last_name, nid_number, birth_registration_number, phone_number, email, date_of_birth: date_of_birth && new Date(date_of_birth.getFullYear(), date_of_birth.getMonth(), date_of_birth.getDate() + 1), password, gender };
      const response = await fetch("http://localhost:3001/users/", {    // fetch get req kore post set kore over write
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      //window.location = "/";
      const data = await response.json();
      const userIDfromRes = data.userID;
      console.log(data);
      setUserID(userIDfromRes);

      // if (response.status === 400) {
      //   setMessage(`User with this contact information already exists! User ID ${userIDfromRes}`);
      // }
      // else if (response.status === 300) {
      //   setMessage('Both Email and Phone number can not be empty')
      // }
      // else {
      //   setMessage(`Account is created successfully! Your user ID id ${userIDfromRes}`)
      // }
      if (response.status === 201) {
        setMessage(`Account is created successfully! Your user ID id ${data.userID}`);
      } else if(response.status === 400) {
        console.log(data.error);
        setMessage(data.error);
      }
      setShowMessage(true);
      // console.log(response);
      // console.log("ok");

    } catch (err) {
      console.error(err.message);
    }
  };

  const goHome = () => {
    try {
      navigate('/users/login');
    } catch (err) {
      console.error(err.message);
    }
  }
  const closeMessage = () => {
    setShowMessage(false);
    if (message === `Account is created successfully! Your user ID id ${userID}`) {
      window.location = "/";
    }
  };


  return (
    <Fragment>
      <div className='top-spacing mb-3'>
        <form action="" onSubmit={onSubmitForm}>
          <div className="form-row">
            <div className='col-md-6 mb-2 '>
              <input type="text" className='form-control' placeholder='First name' value={first_name} onChange={e => setFirstName(e.target.value)} />
            </div>
            <div className='col-md-6 mb-2 '>
              <input type="text" className='form-control' placeholder='Last name' value={last_name} onChange={e => setLastName(e.target.value)} />
            </div>
            <div className='col-md-6 mb-2'>
              <input type="text" className='form-control' placeholder='NID number' value={nid_number} onChange={e => setNid(e.target.value)} />
            </div>
            <div className='col-md-6 mb-2'>
              <input type="text" className='form-control' placeholder='Birth registration number' value={birth_registration_number} onChange={e => setBirthReg(e.target.value)} />
            </div>
            <div className='col-md-6 mb-2'>
              <input type="text" className='form-control' placeholder='Phone number' value={phone_number} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className='col-md-6 mb-2 '>
              <input type="text" className='form-control' placeholder='E-mail' value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className='col-md-6 mb-2 '>
              {/* <input type="text" className='form-control' placeholder='Date of birth' value={date_of_birth} onChange={e => setDob(e.target.value)} /> */}
              {/* <DatePicker selected={date_of_birth} onChange={(e) => setDob(e.target.value)} /> */}

              <DatePicker className='form-control' placeholderText='Date of birth'
                showIcon
                selected={date_of_birth}
                onChange={(date) => setDob(date)}
                dateFormat='dd/MM/yyyy'
              />
            </div>
            <div className='col-md-6 mb-2'>
              <input type="password" className='form-control' placeholder='Password' value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div className='col-md-6 mb-2'>
              <h5>Gender:</h5>
              <select className='custom-select my-10 mr-sm-12 ' value={gender} onChange={e => setGender(e.target.value)}>
                <option value='1'>Male</option>
                <option value='2'>Female</option>
                <option value='3'>Other</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <button className="btn btn-primary btn-block">Register</button>
          </div>
        </form>

        <button className='btn btn-success float-right mt-3' onClick={() => goHome()}>Back</button>
      </div>
      {showMessage && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Message</h5>
                <button type="button" className="close" onClick={closeMessage}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p>{message}</p>
                <button type="button" className="btn btn-primary" onClick={closeMessage}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );

}

export default AddUser;