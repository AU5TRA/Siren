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
          <p>Name: {userData.username}</p>
          <p>gender: {userData.gender}</p>
          <h3>Contact Information:</h3>
          <p>NID: {userData.nid}</p>
          <p>Email: {userData.email}</p>
          <p>Phone Number: {userData.phone}</p>
          
        </div>
      </div>
      
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ShowUser;