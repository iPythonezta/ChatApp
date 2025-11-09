import React, { useEffect, useState } from 'react';
import {
  MDBNavbar,
  MDBContainer,
  MDBIcon,
  MDBNavbarNav,
  MDBNavbarItem,
  MDBNavbarLink,
  MDBBtn,
  MDBNavbarToggler,
  MDBNavbarBrand,
  MDBCollapse,
  MDBBadge,
  MDBDropdown,
  MDBDropdownItem,
  MDBDropdownToggle,
  MDBDropdownMenu,
} from 'mdb-react-ui-kit';
import './navbar.css';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import sound from '../assets/notification-sound.mp3'

export default function Navbar() {
  const [openNavColorThird, setOpenNavColorThird] = useState(false);
  const navigate = useNavigate();
  const loggedIn = JSON.parse(localStorage.getItem('loggedIn'));
  const [user, setUser] = useState({});
  const [notifications, setNotifications] = useState([]);

  const notificationSound = new Audio(sound);
  const handleClick = () => {
    if (loggedIn) {
      localStorage.removeItem('loggedIn');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      navigate('/login');
    } else {
      navigate('/register');
    }
  }

  const fetchUserDetails = async () => {
    await api.get(`/api/user_details/`)
      .then((response) => {
        setUser(response.data);
        console.log(response.data);
      })
  }

  const fetchNotifications = async () => {
    await api.get(`http://127.0.0.1:8000/api/get-notifications/`)
      .then((response) => {
        setNotifications(response.data);
        console.log(response.data);
      })
  }

  useEffect(() => {
    fetchUserDetails();
    fetchNotifications();
  }, [])

  useEffect(()=>{
    const url = `ws://127.0.0.1:8000/ws/notifications/${user['username']}/`;
    const notificationSocket = new WebSocket(url);
    console.log(url)
    console.log(user)
    notificationSocket.onmessage = function (e) {
      const data = JSON.parse(e.data);
      setNotifications((nots) => [data.notification, ...nots]);
      let newUser =  {...user, notification_count: user['notification_count'] + 1}
      setUser(newUser);
      notificationSound.play();
      console.log("user")
      console.log(data);
      console.log(newUser);
      console.log("notifications"); 
    }
  },[user])

  const handleNotificationNavigation = (link) => {
    if (link !== "") {
      navigate(link);
    }
  }

  const updateNotificationStatus = async (id, status) => {
    await api.post(`http://127.0.0.1:8000/api/update-notification-status/`, {notification_id: id, status: status})
      .then((response) => {
        let newNots = [];
        for (let nots of notifications){
          if (nots.id !== id){
            newNots.push(nots);
          }
          else{
            newNots.push({...nots, read: status});
            if (status===true){
              let newUser =  {...user, notification_count: user['notification_count'] - 1}
              setUser(newUser);
            }
            else{
              let newUser =  {...user, notification_count: user['notification_count'] + 1}
              setUser(newUser);
            }
          }
          
        }
        setNotifications(newNots);
      })
  }
  return (
    <>
      <MDBNavbar expand='xl' dark bgColor='primary'>
        <MDBContainer fluid className='nav-container'>
          
          <MDBNavbarBrand href='/' className='heading'>Echat</MDBNavbarBrand>
          <MDBNavbarToggler
            type='button'
            data-target='#navbarColor02'
            aria-controls='navbarColor02'
            aria-expanded='false'
            aria-label='Toggle navigation'
            onClick={() => setOpenNavColorThird(!openNavColorThird)}
          >
            <MDBIcon icon='bars' fas />
          </MDBNavbarToggler>
          <MDBCollapse open={openNavColorThird} navbar>
            <MDBNavbarNav className='me-auto mb-2 mb-lg-0 nav-container-2' style={{justifyContent:'flex-end'}}>
              <MDBNavbarItem style={{marginRight:'15px'}}>
                <MDBNavbarLink active aria-current='page' href='/' >
                  Hello, {loggedIn ? user?.username : 'Guest'}
                </MDBNavbarLink>
              </MDBNavbarItem>
              {loggedIn && <MDBNavbarItem className='bell-container'>
                <MDBDropdown dropdown dropleft>
                  <MDBDropdownToggle tag='a' className='nav-link'>
                    <MDBIcon icon='bell' size='1x' color='white' className='bell' />
                    <MDBBadge color='danger' notification pill className='badge'> {user?.notification_count} </MDBBadge>
                  </MDBDropdownToggle>
                  <MDBDropdownMenu>
                    {notifications.map((notification, index) => (
                      <>
                      <MDBDropdownItem key={index} className={notification.read === true ? 'notification-item read' : 'notification-item unread'} 
                        onClick={() =>{ 
                          if (notification.read !== true){
                            updateNotificationStatus(notification.id,true)
                          }
                        }}
                      >
                        <p onClick={() => handleNotificationNavigation(notification.link)} className='notification-text'>{notification.message}</p>
                        {notification.read ? <MDBIcon icon='envelope' onClick={(e) => {e.stopPropagation(); updateNotificationStatus(notification.id, false)}} className='me-2 envelope' /> : <MDBIcon icon='envelope-open' className='me-2 envelope' onClick={(e) => {e.stopPropagation(); updateNotificationStatus(notification.id, true)}} />}
                      </MDBDropdownItem>
                      <MDBDropdownItem divider />
                      </>
                    ))}
                  </MDBDropdownMenu>
                </MDBDropdown>
              </MDBNavbarItem>}
              <MDBNavbarItem>
                <MDBBtn className='me-2 btn-success' type='button' onClick={handleClick}>
                    {loggedIn ? 'Logout' : 'Signup'}
                </MDBBtn>
              </MDBNavbarItem>
            </MDBNavbarNav>
          </MDBCollapse>
        </MDBContainer>
      </MDBNavbar>
    </>
  );
}