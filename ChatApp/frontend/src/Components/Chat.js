import React, { useEffect, useRef, useState } from "react";
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBIcon, MDBTypography, MDBTextArea, MDBCardHeader, MDBBtn, MDBCardFooter, 
MDBFooter, MDBModal, MDBModalDialog, MDBModalContent, MDBModalHeader, MDBModalTitle, MDBModalBody, MDBModalFooter, MDBCarousel, 
MDBCarouselItem, MDBRipple, MDBSpinner

} from "mdb-react-ui-kit";
import {Carousel} from 'react-bootstrap';
import Navbar from "./Navbar";
import api from "../api";
import './chat.css'
import { toast, ToastContainer } from 'react-toastify'
import { useNavigate } from "react-router-dom";
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import {ReactMic} from 'react-mic';
import { FaMicrophone, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import messageSound from '../assets/message.mp3'

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [members, setMembers] = useState([]);
  const [user, setUser] = useState([]);
  const [empty, setEmpty] = useState(false);
  const [requests, setRequests] = useState([]);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [dropdownMessageId, setDropdownMessageId] = useState(null);
  const [adminUser, setAdminUser] = useState([]);
  const [roomDetails, setRoomDetails] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentImages, setCurrentImages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [isRecordingVisible, setIsRecordingVisible] = useState(false);
  const [audios, setAudios] = useState([]);
  
  const scroller = useRef(null);
  const navigator = useNavigate();
  const sound = new Audio(messageSound);
  
  const fetchMessages = () => {
    api
    .post(`/api/messages/`, { id: window.location.href.split("/").reverse()[0] })
    .then((response) => {
      setMessages(response.data);
      console.log("msg")
      console.log(response.data);
    })
    .catch((error) => {
      setEmpty(true);
    })
  }
  const fetchRequests = async () => {
    try {
      const response = await api.post(`/api/requests/`, { id: window.location.href.split("/").reverse()[0] });
      setRequests(response.data);
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  };
  
  const fetchRoomDetails = async () => {
    await api.get(`/api/room-details/${window.location.href.split("/").reverse()[0]}/`)
    .then((response) => {
        setRoomDetails(response.data);
        console.log(response.data)
      })
      .catch((error) => {
        toast.error(error.response.data?.detail)
      })
  }

  const fetchMembers = async () => {
    await api.post(`/api/members/${window.location.href.split("/").reverse()[0]}/`)
      .then((response) => {
        console.log(response.data)
        setMembers(response.data);
        const adminUsers = [];
        for (let member of response.data) {
          if (member.is_admin === true) {
            adminUsers.push(member.user.username);
          }
        }
        setAdminUser(adminUsers);
        console.log(adminUsers)
      })
      .catch((error) => {
        setEmpty(true);
      })
  }

  
  const userIsAdmin = (username) => {
    return adminUser.includes(username);
  }
  

  // useEffect(() => {
  //   const intervalId = setInterval(fetchRequests, 5000);
    
  //   return () => clearInterval(intervalId);
  // }, []);
  
  const fetchUserDetails = async () => {
    await api.get(`/api/user_details/`)
    .then((response) => {
      setUser(response.data);
      console.log(response.data);
    })
  }
  
  useEffect(() => {
    fetchMessages();
    fetchUserDetails();
    fetchRequests();
    fetchMembers();
    fetchRoomDetails();
  }, [])
  
  useEffect(() => {
    // Initialize WebSocket connection
    
    const chatSocket = new WebSocket(
      `ws://127.0.0.1:8000/ws/chat/${window.location.href.split("/").reverse()[0]}/`
    );
    
    chatSocket.onmessage = function (e) {
      const data = JSON.parse(e.data);
      console.log(data);
      try {
        sound.play();
      }catch (error) {
        console.log(error);
      }

      if (data.type === "delete") {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === data.message_id
        ? { ...msg, message: "This message was deleted!", message_type: "delete",images:[] }
        : msg
      )
    );
    setCarouselOpen(false);  
  } 
  else if (data.type === "member_remove"){
    console.log("member_remove")
    console.log(data)
    console.log(user)
    if (data.deleted_guy === user.username) {
      toast.error("You have been removed from the group");
      setMessages((prevMessages) => [...prevMessages, {message:   `You have been removed from the group by ${data.message.sender.username} . You will be redirected to the home page in 30 seconds`, message_type: "delete", sender: user}]);
      setTimeout(() => {
        navigator("/");
      }, 300);
      fetchMembers();
    }
    else{
      setMessages((prevMessages) => [...prevMessages, data.message]);
      fetchMembers();
    }
  }
  else if (data.type === 'join'){
    setMessages((prevMessages) => [...prevMessages, {message:   `${data.message.sender.username} has joined the group`, message_type: "join", sender: user, sentdate: data.message.sentdate}]);
    fetchMembers();
  }
  
  else if (data.type === 'leave'){
    console.log('leave')
    console.log(data)
    setMessages((prevMessages) => [...prevMessages, {message:   `${data.message.sender.username} has left the group`, message_type: "leave", sender: data.message.sender, sentdate: data.message.sentdate}]);
    fetchMembers();
  }

  else if (data.type === 'join_request' && userIsAdmin(user.username)){
    console.log('join_request')
    console.log(data)
    setRequests((prevRequests) => [...prevRequests, data.request]);
  }

  else if (data.type === 'admin'){
    setMessages((prevMessages) => [...prevMessages, {...data.message, message_type: "admin", sender: data.message.sender, sentdate: data.message.sentdate}]);
    fetchMembers();
  }

  else if (data.type === 'decline') {
    setMessages((prevMessages)=>[...prevMessages, {...data.message, message_type: "decline", sender: data.message.sender, sentdate: data.message.sentdate}]);
  }
  
  else {
    console.log(data)
    setMessages((prevMessages) => [...prevMessages, {...data.message, message_type:'text'}]);
  }
  
  scroller.current.scrollIntoView({
    behavior: "smooth",
  });
};

chatSocket.onclose = function (e) {
  console.error("Chat socket closed unexpectedly");
};

chatSocket.onerror = function (e) {
  console.error(e);
};

// Cleanup WebSocket connection on component unmount
return () => {
  chatSocket.close();
  chatSocket.onerror = function (e) {
    console.error(e);
  };
};
});

const handleSendMessage = () => {
  // Send message to WebSocket server
  if (!messageInput && imageFiles.length == 0 && recordedBlob == null) {
    return;
  }
  const data = {
      message: messageInput,
      sent: true,
      sender: user,
      sentdate: new Date().toLocaleString(),
      room: window.location.href.split("/").reverse()[0],
      images: []
    };
    const chatSocket = new WebSocket(
      `ws://127.0.0.1:8000/ws/chat/${window.location.href.split("/").reverse()[0]}/`
    );

    chatSocket.onopen = async () => {
      if (imageFiles.length > 0) {
        const readFilesPromises = imageFiles.map((file) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              resolve(event.target.result); 
            };
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
          });
        });
  
        try {
          data.images = await Promise.all(readFilesPromises);
          console.log(JSON.stringify(data))
        } catch (error) {
          console.error("Error reading files: ", error);
        }
      } 
      if (recordedBlob) {
        try{const reader = new FileReader();
        reader.readAsDataURL(recordedBlob.blob); 
        reader.onloadend = function() {
          const base64Audio = reader.result.split(',')[1];
          data.voice = base64Audio;
          chatSocket.send(JSON.stringify(data));
        };}
        catch {
          console.log("Error reading audio file");
          chatSocket.send(JSON.stringify(data));
        }
      }
      else{
        chatSocket.send(JSON.stringify(data));
      }
    };
  
    
    setTimeout(() => {
      fetchMessages();
    }, 500);
    
    setMessageInput("");
    setIsRecordingVisible(false);
    setRecordedBlob(null);
    setIsRecording(false);
    setImageFiles([]);
  };
  
  useEffect(() => {
    scroller.current.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);
  
  if (empty) {
    navigator("/");
  }

  const handleAcceptRequest = (id) => {
    api.post(`/api/accept_decline_request/`, { id: id, action: "accept" }).then((response) => {
      toast.success("Request Accepted!");
      setRequests((prevRequests) => prevRequests.filter((request) => request.id !== id));
      // fetchRequests();
      fetchMembers();
    });
  };
  
  const handleDeclineRequest = (id) => {
    api.post(`/api/accept_decline_request/`, { id: id, action: "decline" }).then((response) => {
      toast.success("Request Declined!");
      setRequests((prevRequests) => prevRequests.filter((request) => request.id !== id));
      // fetchRequests();
      fetchMembers();
    });
  };
  
  const handleLeave = async () => {
    await api
    .delete(`http://127.0.0.1:8000/api/leave-group/${window.location.href.split("/").reverse()[0]}/`)
      .then((response) => {
        navigator("/");
      })
      .catch((error) => {
        console.log(error);
        toast.error(error.response.data?.detail);
      });
    };
    
    const handleDeleteMessage = async (id) => {
      setHoveredMessageId(null);
      setDropdownMessageId(null);
      await api.delete(`http://127.0.0.1:8000/api/remove-message/${id}/`).then((response) => {
        toast.success("Message Deleted!");
      });
    };
    
    const handleToggleRemoveGroupModal = () => {
      setShow(true);
    }

    const handleClose = () => {
      setShow(false);
    }
    
    const handleDelete = () => {
      api.delete(`http://127.0.0.1:8000/api/delete-group/${window.location.href.split("/").reverse()[0]}/`).then((response) => {
      setShow(false);
      navigator("/");
    })
    .catch((error) => {
      console.log(error);
      toast.error(error.response.data?.detail);
    });
    
  }
  
  const removeMember = async (username) => {
    const newMembers = members.filter((member) => member.username !== username);
    setMembers(newMembers);
    await api.post(`http://127.0.0.1:8000/api/remove-member/`, {username:username,room_id:window.location.href.split("/").reverse()[0] }).then((response) => {
      toast.success("Member Removed!");
    }).catch((error) => {
      toast.error(error.response.data?.detail);
    })
    fetchMembers();
    setLoading(false);
  }
  const colors = [
    "#c98888","#2b2ba7", "#ffae67", "#a0ff3a", "#0f3b54", "#6eadd1", "#5b0d6a", "#2b2b2b","#25979b"
  ];
  
  const usernameToColorMap = {};
  
  const getColorForUsername = (username) => {
    if (!usernameToColorMap[username]) {
      if (Object.keys(usernameToColorMap).length < colors.length) {
        usernameToColorMap[username] = colors[Object.keys(usernameToColorMap).length];
      } else {
        usernameToColorMap[username] = `#${Math.floor(Math.random()*16777215).toString(16)}`;
      }
    }
    return usernameToColorMap[username];
  };

  const handleMakeAdmin = async (username) => {
    await api.post(`http://127.0.0.1:8000/api/make-admin/`, {target_id:username, room_id:window.location.href.split("/").reverse()[0]}).then((response) => {
      toast.success("Successfully added ",username," as admin");
      fetchMembers();
    }).catch((error) => {
      toast.error(error.response.data?.detail);
    })
  }

  const handleImageChange = (e) => {
    setImageFiles([...imageFiles, ...Array.from(e.target.files)]);
    console.log(imageFiles);
  };

  const handleRemoveImage = (index) => {
    const updatedImages = [...imageFiles];
    updatedImages.splice(index, 1);
    setImageFiles(updatedImages);
  };

  const handleImageClick = (index, images) => {
    setCurrentImageIndex(index);
    setCurrentImages(images);
    setCarouselOpen(true);
    console.log(index)
    console.log(images);
  };

  const closeModal = () => {
    setCarouselOpen(false);
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % currentImages.length);
  };

  const goToPreviousImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + currentImages.length) % currentImages.length);
  };

  const startRecording = () => {
    setIsRecordingVisible(true);
    setIsRecording(true);
  };
  
  const stopRecording = () => {
    setIsRecording(false);
  };
  
  const onStop = (recordedBlob) => {
    setRecordedBlob(recordedBlob);
  };
  
  const cancelRecording = () => {
    setIsRecordingVisible(false);
    setRecordedBlob(null);
  };
  
  const acceptRecording = () => {
    setIsRecordingVisible(false);
    setRecordedBlob(null);
  };

  const audioRef = useRef(null);

  const handleTrackAudio = () =>{
    const ads = [];
    messages.map((message) => {
      if (message.voice?.length > 0) {
        ads.push(message.voice[0].id);
      }
    });

    setAudios(ads);
  }

  const handlePlay = (id) => {
    const nextAudios = audios.filter((audio) => audio > id)
    if (nextAudios.length > 0) {
      const nextAdudio = nextAudios[0]
      const audio = document.getElementById(nextAdudio);
      audio.scrollIntoView({behavior: "smooth"});
      audio.play();
    }
  }

  useEffect(() => {
    handleTrackAudio();
  }, [messages])

  if (loading) {
    return <h1>Loading...</h1>;
  }

  
  return (
    <>
      <Navbar />
      <ToastContainer />
      <MDBContainer fluid className="py-5" style={{ backgroundColor: "#eee" }}>
        <MDBRow className={carouselOpen?'blur-background':''}>
          <MDBCol md="3" lg="3" xl="3" className="mb-4 mb-md-0">
            <MDBCard>
              <MDBCardBody>
                <h1 className="font-weight-bold mb-3 text-center h4">
                  <span style={{ fontFamily: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif' }}>
                    <strong>{roomDetails.name}</strong>
                  </span>
                </h1>
                <h2 className="font-weight-bold mb-3 text-center text-center h5">Members</h2>
                <MDBContainer style={{ display: "flex", justifyContent: userIsAdmin(user.username) ? "space-between" : "center", marginTop: "10px", marginBottom: "10px" }}>
                  {
                    userIsAdmin(user.username) ? (
                      <MDBBtn className="btn btn-primary" size="sm"  onClick={handleToggleRemoveGroupModal}>
                        Remove Group
                      </MDBBtn>
                    ):null
                  }
                  <MDBBtn className="btn btn-danger" onClick={handleLeave}>
                    Leave Group
                  </MDBBtn>
                </MDBContainer>
                <MDBTypography listUnStyled className="mb-0">
                  <li className="p-2 border-bottom">
                    {members.map((member) => (
                      <a className="d-flex justify-content-center mb-4 text-center" style={{ flexDirection: "column", background: "#eee" }} key={member.id}>
                        <p className="fw-bold m-3 mb-1 text-center align-self-center">
                          {member.user.username}
                          {member.is_admin ? " (Admin) " : ""}
                        </p>
                        <span>
                          <p className="text-center align-self-center m-0">({member.user.email})</p>
                          {userIsAdmin(user.username) && user.username !== member.user.username ? (
                            <span>
                              <a className="text-danger" onClick={() => removeMember(member.user.username)} style={{ cursor: "pointer", textDecoration:'underline' }}>
                                Remove
                              </a>

                              {!userIsAdmin(member.user.username) &&<a className="text-success" onClick={() => handleMakeAdmin(member.user.username)} style={{ cursor: "pointer", textDecoration:'underline', marginLeft:'10px' }}>
                                Make Admin
                              </a>}
                            </span>
                            ):null}
                        </span>
                      </a>
                    ))}
                  </li>
                </MDBTypography>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>

          <MDBCol md="9" lg="9" xl="9">
            <MDBTypography listUnStyled style={{ height: "70vh", overflowY: "auto" }} className="message-container">
              {messages.map((data) => (
                <li
                  key={data?.id}
                  className={`d-flex ${data?.sender.username === user.username ? "justify-content-end sent" : "justify-content-start"} m-4`}
                  onMouseEnter={() => setHoveredMessageId(data?.id)}
                  onMouseLeave={() => setHoveredMessageId(null)}
                >
                  <MDBCard style={{ flex: ".8", position: "relative" }}>
                    <MDBCardHeader className="d-flex justify-content-between" style={{ padding: "1px" }}>
                      <p className="fw-bold mb-0" style={{ padding: "10px", color:getColorForUsername(data?.sender.username) }}>
                        {data?.sender.username === user.username ? `You (${data?.sender.username})` : `@${data?.sender.username}`}
                      </p>
                      <p className="text-muted small mb-0" style={data?.message_type !== 'text' ? { display:'none' } : { padding: '10px'}}>
                        <MDBIcon far icon="clock" /> {data?.sent ? data?.sentdate : new Date(data?.sentdate).toLocaleString()}
                      {hoveredMessageId === data?.id && (data?.sender.username === user.username || userIsAdmin(user.username)) && (data?.message_type == 'text') && (
                      <div
                        style={{
                         display:'inline-block',
                         width:'20px',
                         height:'20px',
                         marginLeft:'10px',
                         cursor:'pointer'
                        }}
                        onMouseEnter={() => setDropdownMessageId(id=>id===data?.id?null:data?.id)}
                        onMouseLeave={() => setDropdownMessageId(null)}
                      >
                        <MDBIcon fas icon="ellipsis-v" />
                      </div>
                    )}
                      </p>
                    </MDBCardHeader>
                    <MDBCardBody style={{ padding: '10px' }}>
                      <p className="mb-0" style={(data?.message_type === 'delete' || data?.message_type === 'decline' || (data?.message_type === 'member_remove')) ? { color: 'red', fontStyle: 'italic' } : data?.message_type === 'join' ? { color: 'green', fontWeight: 'bold' } : data?.message_type === 'leave' ? { color: '#e0ab19', fontWeight: 'bold', fontStyle: 'italic' } : data.message_type === 'admin' ? { color: '#41fc41', fontWeight: 'bold' } : null}>
                        {data?.message}
                      </p>
                      {
                        data.voice?.length > 0 && (
                          <div>
                            <audio id={data.voice[0].id} src={"http://127.0.0.1:8000" + data.voice[0].voice} controls onEnded={()=>handlePlay(data.voice[0].id)} />
                          </div>
                        )
                      }
                      {data.images?.length > 0 && (
                        <div className="image-grid-wrapper">
                          {data.images.length >= 5 ? (
                            <MDBRow className="mt-3" style={{ width: '60%', borderRadius: '30px', margin: '10px' }}>
                              {data.images.slice(0, 3).map((image, index) => (
                                <MDBCol md="5" className="" key={index} style={{ display: 'flex', justifyContent: 'flex-end', marginRight: '-15px', paddingTop: '5px', backgroundColor: '#3b71ca', borderRadius: index === 0 ? "10px 0px 0px 0px" : index === 1 ? "0px 10px 0px 0px" : "0px 0px 0px 10px", paddingBottom: index === 2 ? "5px" : "" }}>
                                  <MDBRipple rippleTag="a">
                                    <div className="position-relative" onClick={() => handleImageClick(index, data.images)}>
                                      <img
                                        src={"http://127.0.0.1:8000" + image.image}
                                        alt={`Image ${index + 1}`}
                                        className="uploaded-image-preview img-fluid img-responsive shadow-4-strong hover-overlay"
                                        style={{ height: '200px', width: '200px', cursor: 'pointer', borderRadius: '10px', padding: '3px', backgroundColor: '#3b71ca' }}
                                      />
                                      {/* <div className="overlay"></div> */}
                                    </div>
                                  </MDBRipple>
                                </MDBCol>
                              ))}
                              {data.images.length > 3 && (
                                <MDBCol md="5" className="" style={{ display: 'flex', justifyContent: 'center', paddingTop: '5px', backgroundColor: '#3b71ca', borderRadius: '0px 0px 10px 0px' }}>
                                  <MDBRipple rippleTag="a">  
                                    <div className="position-relative" onClick={() => handleImageClick(3, data.images)} style={{}}>
                                      <img
                                        src={"http://127.0.0.1:8000" + data.images[3].image}
                                        alt="Image 4"
                                        className="uploaded-image-preview img-fluid img-responsive shadow-4-strong hover-overlay"
                                        style={{ height: '200px', width: '200px', background: 'transparent', cursor: 'pointer', padding: '3px', borderRadius: '10px' }}
                                      />
                                      {data.images.length > 4 && (
                                        <div className="overlay img-fluid">
                                          +{data.images.length - 4}
                                        </div>
                                      )}
                                    </div>
                                  </MDBRipple>
                                </MDBCol>
                              )}
                            </MDBRow>
                          ) : (
                            <MDBRow style={{margin:'10px'}}>  
                              <MDBCol md="5" className="" style={{ display: 'flex', justifyContent: 'center',  backgroundColor: '#3b71ca', borderRadius: '10px' }}>
                                <MDBRipple rippleTag={"a"}>
                                  <div className="position-relative single-image-container" style={{margin:'5px'}} onClick={() => handleImageClick(0, data.images)} >
                                    <img
                                      src={"http://127.0.0.1:8000" + data.images[0].image}
                                      alt="Single Image"
                                      className="uploaded-image-preview img-fluid img-responsive shadow-4-strong hover-overlay"
                                      style={{ height: '200px', width: 'auto', cursor: 'pointer', borderRadius: '10px', padding: '0px', backgroundColor: '#3b71ca' }}
                                    />
                                  {data.images.length !== 1 && <div className="overlay img-fluid" md="5">
                                      {data.images.length-1}+
                                    </div>
                                    }
                                  </div>
                                </MDBRipple>
                              </MDBCol>
                            </MDBRow>
                          )}
                        </div>
                      )}

                    </MDBCardBody>
                    
                    {dropdownMessageId === data?.id && (
                      <div
                        onMouseEnter={() => setDropdownMessageId(data?.id)}
                        onMouseLeave={() => setDropdownMessageId(null)}
                        style={{
                          position: 'absolute',
                          top: '27px',
                          right: '15px',
                          backgroundColor: '#fff',
                          width:'300px',
                          border: '1px solid #eee',
                          borderRadius: '4px',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                          display:'flex',
                          flexDirection:'column'
                        }}
                      >
                        <p
                          style={{ margin: '10px', cursor: 'pointer',textAlign:'center' }}
                          onClick={() => handleDeleteMessage(data?.id)}
                          className="dp-btn"
                        >
                          Delete
                        </p>
                      </div>
                    )}
                  </MDBCard>
                </li>
              ))}
              {requests.map((request) => (
                <li key={request.id} className="d-flex justify-content-between m-4">
                  <MDBCard style={{ flex: ".8" }}>
                    <MDBCardHeader className="d-flex justify-content-between" style={{ padding: "1px" }}>
                      <p className="fw-bold mb-0" style={{ padding: "10px" }}>
                        {request.requester.full_name} ({request.requester.username})
                      </p>
                      <p className="text-muted small mb-0" style={{ padding: "10px" }}>
                        <MDBIcon far icon="clock" /> {new Date(request.sentdate).toLocaleString()}
                      </p>
                    </MDBCardHeader>
                    <MDBCardBody>
                      <p className="mb-0">{request.request_message}!</p>
                    </MDBCardBody>
                    <MDBCardFooter>
                      <MDBBtn color="success" style={{ borderRadius: "0px", marginRight: "8px" }} onClick={() => handleAcceptRequest(request.id)}>
                        Accept
                      </MDBBtn>
                      <MDBBtn color="danger" style={{ borderRadius: "0px" }} onClick={() => handleDeclineRequest(request.id)}>
                        Decline
                      </MDBBtn>
                    </MDBCardFooter>
                  </MDBCard>
                </li>
              ))}
              <div ref={scroller}></div>
            </MDBTypography>
            <div className="" style={{ width: "100%" }}>
              <MDBCard className="w-100 mb-2" style={{background:'transparent',boxShadow:'#eee 0px 0px'}}>
                <MDBCardBody style={{display:'flex', flexDirection:'row',padding:'0px', borderRadius:'20px',justifyContent:'space-between'}}>
                  <input
                    type="file"
                    onChange={handleImageChange}
                    multiple
                    accept="image/*"
                    style={{ display: "none" }}
                    id="imageUpload"
                  />
                  <label htmlFor="imageUpload" className="btn btn-secondary cbd-label" style={{margin:'0px', padding:'16px',borderRadius:'20px'}}>
                    <MDBIcon fas icon="paperclip" size="2x" />
                  </label>
                    {isRecordingVisible && (
                      <div className="audio-recorder" style={{display:isRecording?'block':'none', border:'1px solid #eee'}}>
                        <ReactMic
                          record={isRecording}
                          className="sound-wave"
                          onStop={onStop}
                          visualSetting="none"
                          style={{borderRadius:'20px'}}
                        />
                        <div className="recording-indicator">
                          {isRecording && 
                          <div style={{width:'100%', display:'flex',justifyContent:'center'}}>
                            <MDBSpinner grow color='primary'>
                              <span className='visually-hidden'>Loading...</span>
                            </MDBSpinner>
                            <h5 style={{color:'black', marginLeft:'10px'}}>
                              Recording ..
                            </h5>
                          </div>
                          }
                        </div>
                      </div>)}
                      {recordedBlob !== null && (
                        <div>
                          <audio ref={audioRef} src={recordedBlob.blobURL} controls />
                          {/* <MDBBtn onClick={() => {setRecordedBlob(null);setIsRecordingVisible(false);}}>
                            <MDBIcon fas icon="trash-alt" />
                          </MDBBtn> */}
                        </div>
                      )}


                  {!isRecordingVisible && <div className="controller" style={{}}>  
                    <textarea style={{width:'100%',height:'100%',paddingLeft:'10px'}} placeholder="Type a message..." value={messageInput} onChange={(e) => setMessageInput(e.target.value)}></textarea>
                  </div>}
                  {
                    !isRecordingVisible && (<MDBBtn onClick={()=>{setIsRecordingVisible(true)}}><FaMicrophone size={'24'}/></MDBBtn>)
                  }
                  <div style={{display:'flex'}}>
                    {
                      (isRecordingVisible && !isRecording) ? (
                        <MDBBtn style={{borderRadius:'0px'}} color="danger" onClick={cancelRecording}>{isRecording? (<FaTimes size={'24'}/>):(<FaTrash size={'24'} />) } Cancel </MDBBtn>
                      ) :null
                    }

                    {
                      isRecordingVisible && (
                        isRecording ? (<MDBBtn style={{borderRadius:'0px'}} onClick={stopRecording}><FaCheck size={'24'}/></MDBBtn>) : !isRecording && recordedBlob == null && (<MDBBtn onClick={startRecording} style={{display:'flex', justifyContent:'center',alignContent:'center',alignItems:'center'}}><FaMicrophone size={'24'}/>Start Recording</MDBBtn>)
                      )
                    }
                    <MDBBtn color="primary" onClick={handleSendMessage} className="snd-btn" disabled={!messageInput && imageFiles.length === 0 && recordedBlob == null}>
                      <MDBIcon fas icon="paper-plane" size="2x"/>
                    </MDBBtn>
                  </div>
                </MDBCardBody>
                  {imageFiles.length > 0 && (
                    <div className="d-flex flex-wrap mt-3">
                      {imageFiles.map((file, index) => (
                        <div key={index} className="position-relative m-1">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Image ${index + 1}`}
                            className="uploaded-image-preview"
                            style={{ width: "75px", height: "75px", objectFit: "cover", borderRadius: "8px" }}
                          />
                          <button
                            type="button"
                            className="btn btn-danger btn-sm position-absolute"
                            style={{ top: "0", right: "0" }}
                            onClick={() => handleRemoveImage(index)}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
              </MDBCard>
            </div>
          </MDBCol>
        </MDBRow>
        <MDBModal open={show} onClose={()=>setShow(false)} tabIndex='-1'>
          <MDBModalDialog>
            <MDBModalContent>
              <MDBModalHeader>
                <MDBModalTitle>Confirm Delete</MDBModalTitle>
                <MDBBtn className='btn-close' color='none' onClick={handleClose}></MDBBtn>
              </MDBModalHeader>
              <MDBModalBody>
                Do you really want to delete this group?
              </MDBModalBody>
              <MDBModalFooter>
                <MDBBtn color='secondary' onClick={handleClose}>
                  Close
                </MDBBtn>
                <MDBBtn color='danger' onClick={handleDelete}>
                  Delete
                </MDBBtn>
              </MDBModalFooter>
            </MDBModalContent>
          </MDBModalDialog>
        </MDBModal>
        <MDBModal open={carouselOpen} onClose={closeModal} size="lg">
          <MDBModalBody>
            <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '0 auto', width: '80%' }}>
              <span className='' color='white' onClick={closeModal} style={{ cursor: 'pointer' }}>
                <MDBIcon icon='times' size='2x' color="white" />
              </span>
            </div>
            <div className="d-flex align-items-center" style={{ width: '80%', margin: '0 auto', justifyContent: currentImages.length > 1 ? 'space-between' : 'center' }}>
              {currentImages.length > 1 && <MDBBtn color="primary" onClick={goToPreviousImage} style={{ zIndex: 1 }}>
                <MDBIcon icon="angle-left" size="2x" />
              </MDBBtn>}
              <Carousel defaultActiveIndex={currentImageIndex} activeIndex={currentImageIndex} controls={false} indicators={false} slide={false}>
                {currentImages.map((image, index) => (
                  <Carousel.Item itemId={index + 1} key={index}>
                      <Zoom>
                        <div style={{ width: '80%', height: '70vh', display: 'flex', alignContent: 'center', alignItems: 'center', margin: '20px auto', justifyContent: 'center' }}>
                            <img
                              src={"http://127.0.0.1:8000" + image.image}
                              alt={`Image ${index + 1}`}
                              className="img-fluid shadow-4-strong hover-overlay"
                              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                            />
                        </div>
                      </Zoom>
                  </Carousel.Item>
                ))}
              </Carousel>
              {currentImages.length > 1 && <MDBBtn color="primary" onClick={goToNextImage} style={{ zIndex: 1 }}>
                <MDBIcon icon="angle-right" size="2x" />
              </MDBBtn>}
            </div>
            <div className="d-flex justify-content-center mt-3">
              {currentImages.map((image, index) => (
                <div key={index} className="m-1" onClick={() => setCurrentImageIndex(index)} style={{ cursor: 'pointer' }}>
                  <img
                    src={"http://127.0.0.1:8000" + image.image}
                    alt={`Thumbnail ${index + 1}`}
                    className="img-thumbnail"
                    style={{
                      height: '50px',
                      width: '50px',
                      border: currentImageIndex === index ? '2px solid #3b71ca' : '2px solid transparent',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              ))}
            </div>
          </MDBModalBody>
        </MDBModal>


      </MDBContainer>
    </>
  );
}
