import React, { useState, useEffect, Fragment } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useData } from './AppContext';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import ErrorModal from './ErrorModal';
import './showuserpg.css';


const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};



const ShowUser = () => {
  // const modalRef = React.createRef();
  const navigate = useNavigate();
  // const location = useLocation();
  const { loginState, userId } = useData();
  const { id } = useParams();
  const [userData, setUserData] = useState([]);

  const [address, setAddress] = useState('');
  const [post_code, setPostcode] = useState(null);
  const [phone_number, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [new_password, setNewPassword] = useState('');
  const [date_of_birth, setDOB] = useState('');
  const [birth_registration_number, setBirthReg] = useState('');
  const [modalIsOpen, setIsOpen] = useState(false);
  const [errMessage, setErrMessage] = useState('');
  const [errorModalIsOpen, setErrorModalIsOpen] = useState(false);

  const [deletePassword, setDeletePassword] = useState('');
  const [delModal, setDelModal] = useState(false);

  const {
    setUserId,
    token,
    setToken,
    name,
    setName,
    setLoginState } = useData();



  useEffect(() => {

    if (!loginState || userId === null || userId.toString() !== id) {

      // navigate(`/`);
      // // console.log(userId+"......"+id);
      // return
      // ;
      <Fragment>
        <div><Link to={`/`}></Link></div>
      </Fragment>
    }
    const fetchUserData = async () => {
      try {
        if (id == "") {
          return;
        }

        const response = await fetch(`http://localhost:3001/users/${id}`);
        const rec = await response.json();
        console.log(rec.data.result);
        setUserData(rec.data.result);
        // setUser(rec.data.result);
        // console.log("hello");

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
    // fetchTicketHistory();


  }, [id]);



  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  const closeErrorModal = () => {
    setErrorModalIsOpen(false);
  };

  function showTicket() {
    navigate(`/users/${id}/tickets`);
  }

  const UpdateInformation = async (e) => {
    // console.log("here");
    // console.log(userData.user_id)
    e.preventDefault();
    try {
      if (!password) {
        console.log("enter password");
        setErrMessage("Please enter your password to confirm the changes.");
        setErrorModalIsOpen(true);
        return;
      }
      console.log("pass ok")
      // console.log(userData.user_id)
      const body = { address, post_code, phone_number, email, password, date_of_birth, birth_registration_number, new_password }
      const res = await fetch(`http://localhost:3001/users/${userData.user_id}/update`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
      console.log("--------------------------");
      console.log("res : " + res.status);
      console.log("res err : " + res.error);

      if (res.status === 200) {
        console.log("updated")
        // closeModal();
        window.location = `/users/${userData.user_id}`;
      }
      else if (res.status === 400) {
        // console.log("in else if");
        const errorMessage = await res.json();
        console.log(errorMessage.error);
        setErrMessage(errorMessage.error);
        setErrorModalIsOpen(true);
      }

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
  const logOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('name');
    setName('');
    setUserId('');
    setLoginState(false);
    window.location = '/';

  }


  const handleDeleteConfirmation = async () => {
    try {
      if (!deletePassword) {
        console.log("enter password");
        setErrMessage("Please enter your password to delete the account.");
        setErrorModalIsOpen(true);
        return;
      }

      const body = { password: deletePassword };
      const response = await fetch(`http://localhost:3001/users/${userData.user_id}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
      });
      if (response.status === 200) {
        window.location = '/'; 
      } else {
        const errorMessage = await response.json();
        console.log(errorMessage.error);
        setErrMessage(errorMessage.error); 
        setErrorModalIsOpen(true);
      }
    } catch (error) {
      console.error(error.message);
    }
  };




  return (
    <Fragment>
      <div className="container mt-5">
        {userData ? (
          <div className={`card`}>
            <div className="card-header" >
              <div className="row">
                <div className="col-md-6" >
                  <h2>User Dashboard</h2>
                </div>
                {/* <div className="col-md-6">
                  <h2>Ticket History</h2>
                </div> */}
              </div>
            </div>
            <div className="card-body" >
              <div className="row">
                <div className={"col-md-6"} >
                  <div className={"user-information"}>
                    <p><strong>First Name:</strong> {userData.first_name}</p>
                    <p><strong>Last Name:</strong> {userData.last_name}</p>
                    <p><strong>Date of Birth:</strong> {formatDateOfBirth(userData.date_of_birth)}</p>
                    <h4>Contact Information</h4>
                    <p><strong>Email:</strong> {userData.email}</p>
                    <p><strong>Phone Number:</strong> {userData.phone_number}</p>
                    <h4>Address</h4>
                    <p><strong>Details:</strong> {userData.address}</p>
                    <p><strong>Postcode:</strong> {userData.post_code}</p>
                  </div>
                </div>

              </div>
            </div>
            <div className="card-footer">
              <button onClick={openModal} className="btn btn-warning">
                Edit
              </button>
              <span style={{ padding: '20px' }}></span>
              <button onClick={showTicket} className="btn btn-warning">
                Ticket History
              </button>
              <button onClick={logOut} className='btn btn-danger' style={{ float: 'right' }}>Log Out</button>

              <button onClick={() => setDelModal(true)} className='btn btn-danger' style={{ float: 'right' }}>Delete</button>

            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Edit User Modal"
      >
        <div className="modal-header">
          <h2>Update your information</h2>
          <button onClick={closeModal} className="close">
            &times;
          </button>
        </div>
        <form onSubmit={UpdateInformation}>
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

            <input
              type="password"
              className="form-control mb-2"
              placeholder="Enter new password"
              value={new_password || ''}
              onChange={e => setNewPassword(e.target.value)}
            />

            <h2>Confirm password</h2>
            <input
              type="password"
              className="form-control mb-2"
              placeholder="Enter password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />


          </div>

          <div className="modal-footer">
            <button type="submit" className="btn btn-warning">
              Confirm
            </button>
            <button type="button" onClick={resetInfo} className="btn btn-danger">
              Reset
            </button>
          </div>
        </form>
        <ErrorModal
          isOpen={errorModalIsOpen}
          errorMessage={errMessage}
          closeModal={closeErrorModal}
        />
      </Modal>

      <Modal
        isOpen={delModal}
        onRequestClose={() => setDelModal(false)}
        style={customStyles}
        contentLabel="Delete User Modal"
      >
        <div className="modal-header">
          <h2>Delete Account</h2>
          <button onClick={() => setDelModal(false)} className="close">
            &times;
          </button>
        </div>
        <div className="modal-body">
          <p>Are you sure you want to delete your account?</p>
          <input
            type="password"
            className="form-control mb-2"
            placeholder="Enter your password to confirm deletion"
            value={deletePassword}
            onChange={e => setDeletePassword(e.target.value)}
          />
        </div>
        <div className="modal-footer">
          <button onClick={handleDeleteConfirmation} className="btn btn-danger">
            Confirm Delete
          </button>
          <button onClick={() => setDelModal(false)} className="btn btn-secondary">
            Cancel
          </button>
        </div>
        <ErrorModal
          isOpen={errorModalIsOpen}
          errorMessage={errMessage}
          closeModal={closeErrorModal}
          
        />
      </Modal>

    </Fragment>
  );
};

export default ShowUser;
