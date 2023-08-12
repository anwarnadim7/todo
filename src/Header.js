import React, { useEffect, useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/storage';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import './Header.css';
import google from './google-logo.png';
import todologo from './todo-icon.png';

const Header = ({ user, handleSignIn, handleSignOut }) => {
  const [profilePictureURL, setProfilePictureURL] = useState(null);

  const handleSignOutClick = () => {
    handleSignOut();
  };

  useEffect(() => {
    const fetchProfilePictureURL = async () => {
      if (user) {
        try {
          const storageRef = firebase.storage().ref(`${user.uid}/profilePicture`);
          const downloadURL = await storageRef.getDownloadURL();
          setProfilePictureURL(downloadURL);
        } catch (error) {
          console.error('Error getting profile picture URL:', error);
        }
      }
    };

    fetchProfilePictureURL();
  }, [user]);

  return (
    <header className="header">
      <div className="header-title"><img src={todologo} alt='logo' style={{height:50}}/> <h1>Todo++</h1></div>
      <div className="user-info">
        {user ? (
          <>
            <span className="profile-name">Welcome, {user.displayName}!</span>
            {profilePictureURL && (
              <img className="profile-picture" src={profilePictureURL} alt="Profile" />
            )}
            <button className="sign-out-button" onClick={handleSignOutClick}>
              Sign Out
            </button>
          </>
        ) : (
          <button onClick={handleSignIn} className="sign-in-button">
            <img src={google} alt="google-icon" style={{height:15}}/>Sign In with Google
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;