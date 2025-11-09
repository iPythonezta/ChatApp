import React, {useEffect, useState} from "react";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBIcon,
  MDBBtn,
  MDBTypography,
  MDBInput,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalTitle,
  MDBModalFooter,
  MDBModalHeader,
  MDBModalBody,
} from "mdb-react-ui-kit";
import Navbar from "./Navbar";
import api from '../api';
import {toast, ToastContainer} from 'react-toastify';
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
export default function Home() {

  const [createGroupModal, setCreateGroupModal] = useState(false);
  const [joinGroupModal, setJoinGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupId, setGroupId] = useState("");
  const [groups, setGroups] = useState([]);

  const fetchGroups = async () => {
    await api
      .get("/api/groups/")
      .then((response) => {
        setGroups(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  useEffect(() => {
    fetchGroups();
  },[])

  const toggleCreateGroupModal = () => setCreateGroupModal(!createGroupModal);
  const toggleJoinGroupModal = () => setJoinGroupModal(!joinGroupModal);
  const navigate = useNavigate();

  const handleCreateGroup = () => {
    // Implement your logic for creating a group with the 'groupName'
    console.log(`Create group with name: ${groupName}`);
    api.post('/api/create_group/', {name: groupName})
    .then((response) => {
      console.log(response.data);
      fetchGroups();
      toast.success('Room created successfully');
      setGroupName('');
    })
    .catch((e)=>{
      toast.error("Something went wrong!")
    })
    // Close the modal

    toggleCreateGroupModal();
  };

  const handleJoinGroup = () => {
    // Implement your logic for joining a group with the 'groupId'
    console.log(`Join group with ID: ${groupId}`);
    api.post('/api/request-join/', {id: groupId})
    .then((response) => {
      // navigate(`/chatting/${groupId}/`)
      toast.success('Successfully Requested Membership!')
    })
    .catch((e)=>{
      console.log(e)
      toast.error('An error occured!')
      toast.error(e.response.data.detail)
    })
    toggleJoinGroupModal();
  };


  return (
    <>
    <Navbar />
    <ToastContainer />
    <MDBContainer fluid className="py-5" style={{ backgroundColor: "#eee", height:'100vh' }}>
      <MDBRow style={{height:'90vh'}}>
        <MDBCol md="6" lg="5" xl="4" className="mb-4 mb-md-0">
          <MDBCard>
            <MDBCardBody>
              <h2 className="font-weight-bold mb-3 text-center text-center">
               Groups
              </h2>
              <div className="d-flex justify-content-around mb-4">
                  <MDBBtn color="primary" onClick={toggleCreateGroupModal}>
                    Create Group
                  </MDBBtn>
                  <MDBBtn color="success" onClick={toggleJoinGroupModal}>
                    Join Group
                  </MDBBtn>
              </div>
              <MDBTypography listUnStyled className="mb-0">
                <li
                  className="p-2 border-bottom"
                >
                  {groups.map((group) => (
                    <div>
                        <Link to={`/chatting/${group.id}`} className="d-flex justify-content-center mb-4 text-center " style={{background:'#eee'}} key={group.id}>
                            <p className="fw-bold m-3 text-center align-self-center">{group.name}</p>
                      </Link>

                    </div>
                  ))
                }
                  
                </li>
              </MDBTypography>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
        <MDBCol>
            <MDBCard style={{minHeight: '100%'}}>
                <MDBCardBody style={{display:'flex',flexDirection:'column', alignContent:'center', alignItems:'center', justifyContent:'center'}}>
                    <img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwlhU1QHa8wFE4vXE00enNePl28qtJCAz0Qg&usqp=CAU"
                        alt=""
                        className="rounded-circle"
                        width="150"
                        style={{marginBottom:'20px'}}
                      />
                    <p className="text-center align-self-center">
                        Chat anywhere with anyone easily with Echat!
                    </p>
                </MDBCardBody>
            </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
    <MDBModal open={createGroupModal} setOpen={setCreateGroupModal}>
        <MDBModalDialog>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>Create Group</MDBModalTitle>
            </MDBModalHeader>
            <MDBModalBody>
              <MDBInput
                label="Group Name"
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </MDBModalBody>
            <MDBModalFooter>
              <MDBBtn color="secondary" onClick={toggleCreateGroupModal}>
                Close
              </MDBBtn>
              <MDBBtn color="primary" onClick={handleCreateGroup}>
                Create
              </MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>

      {/* Join Group Modal */}
      <MDBModal open={joinGroupModal} setOpen={setJoinGroupModal}>
        <MDBModalDialog>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>Join Group</MDBModalTitle>
            </MDBModalHeader>
            <MDBModalBody>
              <MDBInput
                label="Group ID"
                type="text"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
              />
            </MDBModalBody>
            <MDBModalFooter>
              <MDBBtn color="secondary" onClick={toggleJoinGroupModal}>
                Close
              </MDBBtn>
              <MDBBtn color="success" onClick={handleJoinGroup}>
                Join
              </MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </>
  );
}