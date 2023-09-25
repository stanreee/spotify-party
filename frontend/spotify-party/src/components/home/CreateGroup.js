import { Body, Title, Button, InputField, theme } from '../../styles/globals.js';
import BackIcon from '../left-back-arrow.png';
import styled from 'styled-components';
import Loading from '../Loading.js';

import { useState, useEffect } from 'react';
import { useHistory } from 'react-router';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { createUser } from '../../api/FirebaseFunctions.js';
import { getUserDevices, isLoggedInToSpotify } from '../../api/spotify.js';

import Select from "@material-ui/core/Select";
import MenuItem from '@material-ui/core/MenuItem';

import { FormControl, InputLabel } from '@material-ui/core';

import { makeStyles, withStyles } from '@material-ui/core';

import Tooltip from '@material-ui/core/Tooltip';

import { useMediaPredicate } from 'react-media-hook';

const ColumnDiv = styled.div`
    display: flex;
    flex-direction: column;
`;

const CreateDiv = styled.div`
    display: flex;
`;

const Back = styled.img`
    position: absolute;
    top: 0.1em;
    left: 0.5em;
    height: 5em;
    width: 5em;
    filter: invert(75%) sepia(27%) saturate(775%) hue-rotate(108deg) brightness(89%) contrast(87%);
    cursor: pointer;
`;

const useStyles = makeStyles({
    formControl: {
        "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
            borderColor: theme.greenColor
        }
    },
    select: {
        "&:after": {
            borderBottomColor: theme.whiteColor,
            borderWidth: "2px"
        },
        "&:before": {
            borderBottomColor: theme.greenColor
        },
        "& .MuiSvgIcon-root": {
            color: theme.greenColor
        },
        color: theme.whiteColor,
        textAlign: "center",
        fontFamily: "CircularStd"
    },
    input: {
        alignItems: "center"
    },
})

const BiggerTooltip = withStyles({
    tooltip: {
        fontSize: theme.font1,
    }
})(Tooltip)

const redirect = process.env.NODE_ENV === "production" ? process.env.SERVER_URL : "http://localhost:4000/login"

function CreateGroup({auth, firestore}) {

    const predicate = useMediaPredicate("(max-width: 720px)");

    let search = window.location.search;
    let params = new URLSearchParams(search);

    var token = params.get('access_token');
    var refresh_token = params.get('refresh_token');

    if(token && (!localStorage.getItem("access-token") || localStorage.getItem("access-token") === "undefined")) {
        localStorage.setItem("access-token", token);
        localStorage.setItem("refresh-token", refresh_token);
        localStorage.setItem("timestamp", Date.now());
        console.log("stored tokens");
    }else{
        token = localStorage.getItem("access-token");
        refresh_token = localStorage.getItem("refresh-token");
    }

    const [groupName, setGroupName] = useState('');
    const [displayName, setDisplayName] = useState('');

    const history = useHistory();
    const classes = useStyles();

    const [devices, setDevices] = useState(null);
    const [chosenDevice, setChosenDevice] = useState(null);

    const handleDropdownChange = (event) => {
        setChosenDevice(event.target.value)
    }

    useEffect(() => {
        const fetchDevices = async () => {
            const data = await getUserDevices();
            setDevices(data.devices);
        }

        if(isLoggedInToSpotify()) {
            fetchDevices();
        }
    }, [])

    if(isLoggedInToSpotify()) {
        async function createGroup(groupName) {
            function generateRandomString() {
                return Math.random().toString(20).substr(2, 6);
            }
    
            const partiesRef = firestore.collection("parties");
            var partyId = generateRandomString();

            while(partiesRef.doc(`${partyId}`).exists) {

                const docRef = await partiesRef.doc(`${partyId}`).get();

                const data = await docRef.data();

                if(Date.now() - data.createdAt > 86400000) { 
                    break;
                }

                partyId = generateRandomString();
            }

            console.log("CREATING GROUP WITH ID: " + partyId);

            await partiesRef.doc(`${partyId}`).set({
                name: groupName,
                queue: [],
                members: [],
                createdAt: Date.now(),
                skip_votes: 0,
                skips: [],
                currently: null,
                can_skip: true,
                uids: []
            })

            localStorage.setItem(partyId + "-device-id", chosenDevice);

            await createUser(firestore, partyId, displayName, true);

            history.push("/group/" + partyId);
        }

        // handle group creation process
        return <Body className="body">
            <Back onClick={() => history.push("/")} src={BackIcon}></Back>
            {devices ? <div style={{padding: "10px"}}>
                <Title fontSize="48px">Create Party</Title>
                <InputField maxLength="24" onChange={(e) => setGroupName(e.target.value)} fontSize={theme.font3} height="50px" width="100%" onBlur={(e) => e.target.placeholder = 'Enter party name'} onFocus={(e) => e.target.placeholder = ''} placeholder="Enter party name"></InputField>
                <FormControl className={classes.formControl} style={{marginTop: "10px", marginBottom: "10px", width: "100%"}}>
                    <InputLabel className={{input: classes.input}} style={{display: "inline-block", textAlign: "center", color: theme.lightGrayColor, fontFamily: "CircularStd", fontSize: `${theme.font3}`}}>Choose playback device</InputLabel>
                    <Select onChange={handleDropdownChange} className={classes.select} labelId="simple-select" variant="standard">
                        {devices.map(device => <MenuItem value={device.id}>{device.name}</MenuItem>)}
                    </Select>
                </FormControl>
                <h3 style={{color: theme.greenColor, fontSize: theme.font2, fontWeight: "normal", textAlign: "center"}}>
                    This is the device you'll be playing to. 
                    <span> </span>
                    <BiggerTooltip title="Try refreshing the page while playing a song on the desired device.">
                        <span onClick={() => {
                            if(predicate) {
                                toast.info("Try refreshing the page while playing a song on the desired device.", {
                                    position: "bottom-center"
                                })
                            }
                        }} style={{cursor: "pointer", color: theme.blackColor.greenColor, textDecoration: "underline"}}>Don't see your device?</span>
                    </BiggerTooltip>
                </h3>
                <CreateDiv>
                    <InputField onChange={(e) => setDisplayName(e.target.value)} fontSize={theme.font3} height="50px" width="100%" onBlur={(e) => e.target.placeholder = 'Enter your display name'} onFocus={(e) => e.target.placeholder = ''} placeholder="Enter your display name"></InputField>
                    <Button onClick={() => {
                        if(groupName.length < 3) {
                            toast.error("Party name must have at least 3 characters.", {
                                position: "bottom-center",
                            });
                            return;
                        }
                        if(displayName.length < 2) {
                            toast.error("Your display name must be at least 2 characters long.", {
                                position: "bottom-center"
                            });
                            return;
                        }
                        if(displayName.length > 12) {
                            toast.error("Your display name must be less than 12 characters long.", {
                                position: "bottom-center"
                            });
                            return;
                        }
                        if(chosenDevice === null) {
                            toast.error("Select a device to play to.", {
                                position: "bottom-center"
                            });
                            return;
                        }
                        createGroup(groupName);
                    }} borderRadius="0px" fontSize="18px" width="25%" marginLeft="5px">Create</Button>
                </CreateDiv>
                <ToastContainer />
            </div> : 
            <div style={{margin: "auto", display: "grid", placeItems: "center", height: "100%"}}>
                <Loading></Loading>
            </div>}
        </Body>;
    }

    const login = () => {
        window.location.href = redirect;
    }

    return (
        <Body>
            <Back onClick={() => history.push("/")} src={BackIcon}></Back>
            <div>
                <Title fontSize="48px">Create a Group</Title>
                <ColumnDiv>
                    <Button onClick={() => login()} borderRadius="0px" height="50px" fontSize="18px">Log In With Spotify</Button>
                </ColumnDiv>
            </div>
        </Body>
    )
}

export default CreateGroup
