import React from 'react';
import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBInput,
}
from 'mdb-react-ui-kit';
import axios from 'axios';
import { useState } from 'react';
import Navbar from './Navbar';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
export default function RegistrationForm() {
    const [data,setData]=useState({
        firstname:"",
        lastname:"",
        email:"",
        phone:"",
        password:"",
        username:"",
    })
    const navigate = useNavigate();

    const handleChange = (e) => {
        const {name,value} = e.target
        setData({
            ...data,
            [name]:value
        })
    }

    const handleSubmit = async (e) => {
        const {firstname,lastname,email,phone,password,username} = data
        if (!firstname || !lastname || !email || !phone || !password || !username) {
            toast.error("Please fill all the fields")
            return
        }
        if (password.length < 8) {
            toast.error("Password must be at least 8 characters")
            return
        }
        if (username.length < 6) {
            toast.error("Username must be at least 6 characters")
            return
        }
        data['full_name'] = `${firstname} ${lastname}`
        data['phone_number'] = phone
        await axios.post("http://127.0.0.1:8000/auth/register/",data)
        .then ((response)=>{
            toast.success("Account created successfully");
            navigate("/login");
            console.log(response);
        })
        .catch((e)=>{
            Object.keys(e.response.data).forEach((key)=>{
                toast.error(`An account with this ${key} already exists`)
            })
        })
    }

    return (
    <>
        <Navbar/>
        <ToastContainer />
        <MDBContainer fluid style={{width:"80%"}}>

            <MDBRow className='justify-content-center align-items-center m-5'>
            <MDBCard className='text-center'>
                <MDBCardBody className='px-4'>
                <h3 className="fw-bold mb-4 pb-2 pb-md-0 mb-md-5">Sign Up</h3>
                <MDBRow style={{justifyContent:'center'}}>
                    <MDBCol md='6'>
                        <MDBInput wrapperClass='mb-4'onChange={handleChange} required={true} value={data.username} name='username' label='Username' size='lg' id='form6' type='text'/>
                    </MDBCol>
                </MDBRow>
                <MDBRow>
                    <MDBCol md='6'>
                    <MDBInput wrapperClass='mb-4'onChange={handleChange} required={true} value={data.firstname} name='firstname' label='First Name' size='lg' id='form1' type='text'/>
                    </MDBCol>
                    <MDBCol md='6'>
                    <MDBInput wrapperClass='mb-4'onChange={handleChange} required={true} value={data.lastname} name='lastname' label='Last Name' size='lg' id='form2' type='text'/>
                    </MDBCol>
                </MDBRow>

                <MDBRow>
                    <MDBCol md='6'>
                    <MDBInput wrapperClass='mb-4'onChange={handleChange} required={true} value={data.phone} name='phone' label='Phone Number' size='lg' id='form5' type='rel'/>
                    </MDBCol>
                    <MDBCol md='6'>
                    <MDBInput wrapperClass='mb-4'onChange={handleChange} required={true} value={data.email} name='email' label='Email' size='lg' id='form4' type='email'/>
                    </MDBCol>
                </MDBRow>
                <MDBRow style={{justifyContent:'center'}}>
                    <MDBCol md='6'>
                        <MDBInput wrapperClass='mb-4'onChange={handleChange} required={true} value={data.password} name='password' label='Password' size='lg' id='form5' type='password'/>
                    </MDBCol>
                </MDBRow>
                <p className="mb-4">Already have an account? <span onClick={() => navigate("/login")} style={{ cursor: 'pointer', color: 'blue' }}>Login Instead</span></p>
                <MDBBtn className='mb-4 text-center' size='lg' onClick={(e)=>handleSubmit(e)}>Submit</MDBBtn>
                </MDBCardBody>
            </MDBCard>
            </MDBRow>
        </MDBContainer>
    </>
    );
}

