import { Body, Title, Button, InputField } from '../../styles/globals.js';
import BackIcon from '../left-back-arrow.png';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { createUser } from '../../api/FirebaseFunctions.js';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../Loading.js';

const JoinDiv = styled.div`
    display: flex;
    flex-direction: column;
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

function JoinGroup({auth, firestore, givenID}) {

    const [groupCode, setGroupCode] = useState('');
    const [displayName, setDisplayName] = useState('');

    const [partyName, setPartyName] = useState(null);

    const history = useHistory();

    const join = async (groupCode, displayName) => {
        
        // firestore add user to party document

        const partiesRef = firestore.collection("parties");
        const docRef = await partiesRef.doc(`${groupCode}`).get();

        const data = await docRef.data();

        if(docRef.exists && (Date.now() - data.createdAt < 86400000)) {
            // if(!localStorage.getItem(groupCode + "-uuid") || (localStorage.getItem(groupCode + "-uuid") === undefined)) { // user info does not already exist
            //     createUser(firestore, groupCode, displayName, false);
            // }else{
            //     console.log("Existing user info found");
            // }

            await createUser(firestore, groupCode, displayName, false);

            // TODO: need to find a better way to do this, because anybody can just skip this join process by manually putting in the group code into browser
            if(!givenID) history.push("/group/" + groupCode);
            else window.location.reload();
        }else{
            toast.error("Unable to find party given code.", {
                position: "bottom-center"
            });
        }
    }

    useEffect(() => {
        const getParty = async () => {
            const partiesRef = firestore.collection("parties");
            const docRef = await partiesRef.doc(`${givenID}`).get();
            const data = await docRef.data();

            setPartyName(data.name);
        }
        if(givenID) getParty();
    }, []);

    return (
        givenID && !partyName ? <Body><Loading></Loading></Body> : <Body>
            <Back onClick={() => history.push("/")} src={BackIcon}></Back>
            <div style={{width: "350px"}}>
                {givenID ? <Title>Join "{partyName}"</Title> : <Title fontSize="48px">Join a Party</Title>}
                <JoinDiv>
                    {!givenID && <InputField maxLength="6" onKeyDown={(e) => {if(e.key === " ") e.preventDefault()}} onChange={(e) => setGroupCode(e.target.value)} fontSize="18px" height="50px" width="100%" onBlur={(e) => e.target.placeholder = 'Enter party code'} onFocus={(e) => e.target.placeholder = ''} placeholder="Enter party code"></InputField>}
                    <InputField onChange={(e) => setDisplayName(e.target.value)} fontSize="18px" height="50px" width="100%" onBlur={(e) => e.target.placeholder = 'Enter your display name'} onFocus={(e) => e.target.placeholder = ''} placeholder="Enter your display name"></InputField>
                    <Button onClick={() => { 
                        if(groupCode.length !== 6 && !givenID) {
                            toast.error("Party codes must be a 6-character alphanumeric string.", {
                                position: "bottom-center"
                            })
                            return;
                        }
                        if(displayName.length < 2) {
                            toast.error("Your display name must be at least 2 characters long.", {
                                position: "bottom-center"
                            });
                            return;
                        }
                        if(!givenID) join(groupCode, displayName);
                        else join(givenID, displayName);
                        }} borderRadius="0px" height="50px" fontSize="18px" width="100%">Enter</Button>
                </JoinDiv>
                <ToastContainer />
            </div>
        </Body>
    )
}

export default JoinGroup
