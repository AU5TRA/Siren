import React from 'react'

const UserList = () => {
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
                    <tr>
                        <td>Ifti</td>
                        <td>ifti@example.com</td>
                        <td>12324234234</td>
                        <td>F</td>
                        <td> <button className="btn btn-warning">Update</button></td>
                        <td> <button className="btn btn-danger">Delete</button></td>

                    </tr>
                    <tr>
                        <td>Nisa</td>
                        <td>nisa@example.com</td>
                        <td>1872368721</td>
                        <td>F</td>
                        <td> <button className="btn btn-warning">Update</button></td>
                        <td> <button className="btn btn-danger">Delete</button></td>


                    </tr>
                    
                </tbody>
            </table>




        </div>
    )
}

export default UserList