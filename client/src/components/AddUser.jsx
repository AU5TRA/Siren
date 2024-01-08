import React, {useState, Fragment} from 'react';

import './style.css';

const AddUser = () => {
    const[description, setDescription]= useState("hello");
    const onSubmitForm = async(e)=>{
        e.preventDefault();
        try{
            const body= {description};
            const response= fetch()
        }catch(err){
            console.error(err.message);
        }

    }
    return (
        <Fragment>
        <div className='top-spacing mb-3'>
            <form action="">
                <div className="form-row">
                    <div className='col-md-6 mb-2 '>
                        <input type="text" className='form-control' placeholder='Name'/>
                    </div>
                    <div className='col-md-6 mb-2'>
                        <input type="text" className='form-control' placeholder='Email'/>
                    </div>
                    <div className='col-md-6 mb-2'>
                        <input type="text" className='form-control' placeholder='NID'/>
                    </div>
                    <div className='col-md-6 mb-2'>
                        <select className='custom-select my-10 mr-sm-12'>
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