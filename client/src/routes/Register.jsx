import React, { useState } from 'react';

const Dashboard = ({ setAuth }) => {
  const [inputs, setInputs] = useState({ email: '', password: '', name: '' });
  const { email, password, name } = inputs;
  console.log(inputs);
  const onChange = e => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const onSubmitForm = async e => {
    e.preventDefault();
    const body = { email, password, name };
    try {
      const response = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const parseRes = await response.json();

      if (parseRes.token) {
        setAuth(true);
        localStorage.setItem('token', parseRes.token);
      } else {
        console.log(parseRes);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <h1 className="text-center">Register</h1>
      <form onSubmit={onSubmitForm}>
        <input
          type="text"
          name="email"
          placeholder="Email address"
          required
          className="form-control my-3"
          value={email}
          onChange={onChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          className="form-control my-3"
          onChange={onChange}
          value={password}
        />
        <input
          type="text"
          name="name"
          placeholder="name"
          required
          className="form-control my-3"
          value={name}
          onChange={onChange}
        />
        <button className="btn btn-success btn-block">Submit</button>
      </form>
    </>
  );
};

export default Dashboard;