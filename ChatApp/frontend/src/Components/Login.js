import React, { useState } from 'react';
import { MDBBtn, MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBInput } from 'mdb-react-ui-kit';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { saveTokens } from '../tokenUtils';

export default function Login() {
    const [data, setData] = useState({
        username: "",
        password: "",
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData({
            ...data,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        const { username, password } = data;
        if (!username || !password) {
            toast.error("Please fill all the fields");
            return;
        }

        try {
            await axios.post("http://127.0.0.1:8000/auth/token/", data)
            .then((response)=>{
                toast.success("Login successful");
                localStorage.setItem('loggedIn', true);
                saveTokens(response.data.access, response.data.refresh);
                // console.log(response);
                navigate("/");
            })
        } catch (error) {
            toast.error("Invalid credentials. Please try again.");
        }
        navigate("/");

    };

    return (
        <>
            <Navbar />
            <ToastContainer />
            <MDBContainer fluid style={{ width: "80%" }}>
                <MDBRow className='justify-content-center align-items-center m-5'>
                    <MDBCard className='text-center'>
                        <MDBCardBody className='px-4'>
                            <h3 className="fw-bold mb-4 pb-2 pb-md-0 mb-md-5">Login</h3>
                            <MDBRow style={{ justifyContent: 'center' }}>
                                <MDBCol md='6'>
                                    <MDBInput wrapperClass='mb-4' onChange={handleChange} required={true} value={data.username} name='username' label='Username' size='lg' type='text' />
                                </MDBCol>
                            </MDBRow>
                            <MDBRow style={{ justifyContent: 'center' }}>
                                <MDBCol md='6'>
                                    <MDBInput wrapperClass='mb-4' onChange={handleChange} required={true} value={data.password} name='password' label='Password' size='lg' type='password' />
                                </MDBCol>
                            </MDBRow>
                            <MDBBtn className='mb-4 text-center' size='lg' onClick={(e) => handleSubmit(e)}>Login</MDBBtn>
                        </MDBCardBody>
                    </MDBCard>
                </MDBRow>
            </MDBContainer>
        </>
    );
}
