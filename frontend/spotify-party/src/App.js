import PartyRoute from './components/PartyRoute.js';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import HomeRoute from './components/HomeRoute.js';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import CreateGroup from './components/home/CreateGroup.js';
import JoinGroup from './components/home/JoinGroup.js';

import { createGlobalStyle } from 'styled-components';
import { GenericBackground, theme } from './styles/globals.js';
import React, { useState, useEffect } from 'react';

import Drawer from './components/Drawer.js';

import { useHistory } from 'react-router';
import { styled } from '@material-ui/core';
import Loading from './components/Loading.js';

import constants from './constants/constants.js';

if(!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: `${constants.REACT_APP_API_KEY}`,
    authDomain: `${constants.REACT_APP_AUTH_DOMAIN}`,
    projectId: `${constants.REACT_APP_PROJECT_ID}`,
    storageBucket: `${constants.REACT_APP_STORAGE_BUCKET}`,
    messagingSenderId: `${constants.REACT_APP_MESSAGING_SENDER_ID}`,
    appId: `${constants.REACT_APP_APP_ID}`
  })
}else{
  firebase.app();
}

const firestore = firebase.firestore();

export const auth = firebase.auth();

function App() {

  const [authed, setAuthed] = useState(false);

  let search = window.location.search;
  let params = new URLSearchParams(search);

  var token = params.get('access_token');
  var refresh_token = params.get('refresh_token');

  const user = auth.currentUser;

  useEffect(() => {
    const handleAuthentication = async () => {
      if(!user) {
        try{
          await auth.signInAnonymously();
          console.log("successfully authenticated with firebase");
          setAuthed(true);
        }catch(error) {
          console.log("error signing in with firebase");
          console.log(error.code);
          console.log(error.message);
        }
      }else{
        console.log("already authenticated");
        setAuthed(true);
      }
    }

    handleAuthentication();
  }, [])

  

  if(token && (!localStorage.getItem("access-token") || localStorage.getItem("access-token") === "undefined")) {
    localStorage.setItem("access-token", token);
    localStorage.setItem("refresh-token", refresh_token);
    localStorage.setItem("timestamp", Date.now());
    console.log("stored tokens");
  }else{
    token = localStorage.getItem("access-token");
    refresh_token = localStorage.getItem("refresh-token");
  }

  const GlobalStyle = createGlobalStyle`

    @font-face {
      font-family: CircularStd;
      src: url(./fonts/CircularStd-Book.woff);
      font-weight: normal;
    }

    @font-face {
      font-family: CircularStd;
      src: url(./fonts/CircularStd-Medium.woff);
      font-weight: bold;
    }

    * {
      margin: 0;
      font-family: CircularStd, sans-serif;
      font-style: normal;
    }

    body {
      background-color: ${theme.blackColor};
      ::-webkit-scrollbar {
            background-color: ${theme.blackColor};
            width: 10px;
        }

        ::-webkit-scrollbar-thumb{
            background-color: ${theme.lightGrayColor};
            transition: all 0.5s ease;
            width: 10px;
        }
    }

    .MuiDrawer-paperAnchorLeft {
      background-color: ${theme.blackColor};

      span {
        color: ${theme.greenColor};
        font-family: CircularStd;
      }
      width: 20%;

      @media only screen and (max-width: 768px) {
        width: 70%;
      }

      @media only screen and (max-width: 1024px) and (min-width: 768px) {
        width: 40%;
      }
    }

    .MuiListItem-root members-drawer span {
      font-size: ${theme.font5};
    }
  `;

  const [open, setOpen] = useState(false);
  const [partyMembers, setPartyMembers] = useState([]);

  const [showAlbum, setShowAlbum] = useState(false);

  const history = useHistory();

  const Background = styled(GenericBackground)`
        display: grid;
        place-items: center;
  `;

  const [id, setId] = useState(null);

  return (
    <>
      <Router>
        
        {authed ? <div className="App">
          <React.Fragment>
            <GlobalStyle></GlobalStyle>
          </React.Fragment>
          <Switch>
            <Route path="/group/:id">
              <Drawer id={id} setShowAlbum={setShowAlbum} showAlbum={showAlbum} firebase={firebase} firestore={firestore} groupMembers={partyMembers} history={history} setOpen={setOpen} open={open}></Drawer>
              <PartyRoute showAlbum={showAlbum} setId={setId} auth={auth} partyMembers={partyMembers} setPartyMembers={setPartyMembers} setDrawerOpen={setOpen} drawerOpen={open} firebase={firebase} firestore={firestore}></PartyRoute>
            </Route>
            <Route exact path="/" children={<HomeRoute></HomeRoute>}></Route>
            <Route path="/create" children={<CreateGroup auth={auth} firestore={firestore}></CreateGroup>}></Route>
            <Route path="/join" children={<JoinGroup auth={auth} firestore={firestore}></JoinGroup>}></Route>
          </Switch>
        </div> : <Background style={{display: "grid", placeItems: "center"}}><Loading></Loading></Background>}
      </Router>
    </>
    
  );
}

export default App;
