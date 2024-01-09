import React, { useEffect, useState } from 'react';

const UserList = () => {
    const [users, setUsers] = useState([]);

    const getUser = async () => {
        try {
            const response = await fetch('http://localhost:3001/users');
            const jsonData = await response.json();
            if (jsonData && jsonData.data && Array.isArray(jsonData.data.passengers))
                setUsers(jsonData.data.passengers);
        } catch (err) {
            console.error(err.message);
        }
    };

    useEffect(() => {
        getUser();
    }, []);

    return (
        <div className='list-group'>
            <table className="table table-hover table-dark">
                <thead>
                    <tr className='bg-primary'>
                        <th scope="col">Name</th>
                        <th scope="col">Email</th>
                        <th scope="col">NID</th>
                        <th scope="col">Gender</th>
                        <th scope="col">Edit</th>
                        <th scope="col">Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <tr key={index}>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>{user.nid}</td>
                            <td>{user.gender}</td>
                            <td><button className="btn btn-warning">Update</button></td>
                            <td><button className="btn btn-danger">Delete</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserList;
