import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const ShowUser = () => {
    const { id } = useParams();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://localhost:3001/users/${id}`);
        const rec = await response.json();
        console.log(rec.data.result);
        setUserData(rec.data.result); 
        // console.log(userData);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchUserData();
  }, [id]);

  return (
    <div>
      {userData ? (
        <div className="user-container">
        <h2>User Information</h2>
        <div className="user-details">
          <p>User ID: {userData.user_id}</p>
          <p>First Name: {userData.first_name}</p>
          <p>Last Name: {userData.last_name}</p>
          <p>Date of Birth: {userData.date_of_birth}</p>
          <h3>Contact Information</h3>
          <p>Email: {userData.email}</p>
          <p>Phone Number: {userData.phone_number}</p>
          <h3>Address</h3>
          <p>Details: {userData.address}</p>
          <p>Postcode: {userData.postcode}</p>
        </div>
      </div>
      
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ShowUser;
