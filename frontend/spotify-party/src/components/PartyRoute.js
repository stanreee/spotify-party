import React from 'react'
import { useState, useEffect } from 'react';
import { queueSong, getSongDataArray, isLoggedInToSpotify, getCurrentPlayingSongData, skipSong } from '../api/spotify.js';
import styled from 'styled-components';
import { theme, GenericBackground, Title, Button, QueueInputField } from '../styles/globals';
import HeaderBar from './party/HeaderBar.js';

import { useParams } from 'react-router';

import InfoPage from './party/InfoPage.js';
import Loading from './Loading.js';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useHistory } from 'react-router';

import icon from './party/dog_pic.png';

import { v4 as uuidv4 } from 'uuid';
import CurrentlyPlaying from './party/CurrentlyPlaying.js';
import { isMemberOfParty } from '../api/FirebaseFunctions.js';
import JoinGroup from './home/JoinGroup.js';
import QueueASong from './party/QueueMenu/QueueASong.js';

const Body = styled.div`
    padding: 0px;
    height: 100vh;
    width: 100%;
    position: relative;
    background-color: ${theme.darkGrayColor};
`;

const Background = styled(GenericBackground)`
        display: grid;
        place-items: center;
`;

function PartyRoute({setId, auth, partyMembers, setPartyMembers, setDrawerOpen, drawerOpen, firebase, firestore}) {

    const [songURI, setSongURI] = useState(null);
    const [queue, setQueueData] = useState(null);
    const [snapshot, setSnapshot] = useState(null);
    const [skipVotes, setSkipVotes] = useState(null);
    const [neededVotes, setNeededVotes] = useState(null);
    const [partyData, setPartyData] = useState("waiting");

    const [isMember, setIsMember] = useState(null);

    const {id} = useParams();

    setId(id);

    const [playlistName, setPlaylistName] = useState("");
    const [playlistHref, setPlaylistHref] = useState("");

    const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
    const [canSkip, setCanSkip] = useState(true);

    const handleClick = async () => {
        const partiesRef = firestore.collection('parties');
        const doc = await partiesRef.doc(`${id}`);

        const songObject = {
            url: songURI,
            queued: false,
            queuedBy: localStorage.getItem(id + "-display"),
            queuedAt: Date.now(),
            uuid: uuidv4()
        }

        doc.update({
            queue: firebase.firestore.FieldValue.arrayUnion(songObject)
        })
    }

    const invalidParty = () => {
        if(partyData === "undefined" || partyData === "deleted" || partyData === "waiting") return partyData;
        return false;
    }

    // this function is run every 15 seconds using setInterval
    // but, any state variables are not updated and instead the function
    // uses the same state those variables were in the first time the
    // function is called
    async function updateOwnerPlayingData(updateNow) {
        const ref = firestore.collection('parties').doc(`${id}`);
        const doc = await ref.get();
        const data = await doc.data();

        if(data.owner.uuid !== auth.currentUser.uid) return;
        const songData = await getCurrentPlayingSongData();
        var currentlyObj = {
            trackName: songData.item ? songData.item.name : null,
            artists: songData.item ? songData.item.artists : null,
            img: songData.item ? (songData.item.album.images.length > 0 ? songData.item.album.images[0].url : icon) : null
        }

        if(currentlyObj.trackName === null) {
            currentlyObj = null;
        }

        if(updateNow) {

            if(data.owner.uuid === auth.currentUser.uid) {
                if(!currentlyObj || (data.currently === null || (data.currently.trackName !== currentlyObj.trackName && data.currently.artists !== currentlyObj.artists))) {
                    ref.update({
                        currently: currentlyObj,
                        skip_votes: 0,
                        skips: []
                    })
                }
            }
        }

        return currentlyObj;
    }

    useEffect(() => {
        async function getPartyData() {
            const partiesRef = firestore.collection('parties');
            const doc = await partiesRef.doc(`${id}`).get();
            const data = await doc.data();
            if(!data) {
                setPartyData("undefined");
                return;
            }
            setPartyData(data);
            isMemberOfParty(firestore, id).then(value => {
                setIsMember(value);
            })
            if(isLoggedInToSpotify()) {
                await updateOwnerPlayingData(true);
            }

            return data;
        }

        getPartyData();
        
    }, [])

    useEffect(() => {
        if(!isLoggedInToSpotify()) return;
        //if(partyData === "undefined" || partyData === "waiting" || partyData === "deleted") return;
        if(invalidParty()) return;
        var intervalId;

        async function doUpdate() {
            const ref = firestore.collection('parties').doc(`${id}`);
            const doc = await ref.get();
            const data = await doc.data();

            if(data.owner.uuid === auth.currentUser.uid) {
                intervalId = setInterval(async () => {
                    // gotta do this again because the other ones are not updated each interval
                    const ref = firestore.collection('parties').doc(`${id}`);
                    const doc = await ref.get();
                    const data = await doc.data();

                    const currently = await updateOwnerPlayingData(false);
                    if(!currently || (data.currently === null || (data.currently.trackName !== currently.trackName && data.currently.artists !== currently.artists))) {
                        ref.update({
                            currently: currently,
                            skip_votes: 0,
                            skips: []
                        })
                    }
                }, 15000);
            }
        }

        doUpdate();

        return () => {
            if(intervalId) clearInterval(intervalId);
        }
    }, [partyData])

    // checks when snapshot is updated (i.e. changes are made to firestore document), then updates queue accordingly
    useEffect(() => {
        if(invalidParty()) return;
        const handleQueueData = async() => {
            var q = snapshot.queue;
            const owner = snapshot.owner;
            var queueData = [];
            var urls = [];
            var queueList = [];
    
            var songsToQueue = [];
    
            var update = false;
    
            q.some((obj, index) => {
                if(index >= 50) return true;
                const url = obj.url;
                urls.push(url);
                queueList.push({
                    queuedBy: obj.queuedBy,
                    queuedAt: obj.queuedAt
                });
    
                const userUUID = auth.currentUser.uid;
    
                if(!obj.queued && userUUID === owner.uuid) {
                    const songObj = {
                        url: url,
                        uuid: obj.uuid
                    }
                    if(!(songObj in songsToQueue)) {
                        songsToQueue.push(songObj);
                    }
                    obj.queued = true;
                    if(!update) {
                        update = true;
                    }
                }
            })
    
            const deviceId = localStorage.getItem(id + "-device-id");
            songsToQueue.forEach(async (song) => {
                await queueSong(song.url, deviceId)
            })
    
            if(urls.length > 0) {
                const songs = await getSongDataArray(urls);
    
                for(var i = 0; i < songs.tracks.length; i++) {
                    const track = songs.tracks[i];
                    const songData = {
                        name: track.name,
                        artists: track.artists,
                        queuedBy: queueList[i].queuedBy,
                        queuedAt: queueList[i].queuedAt,
                        img: track.album && track.album.images.length > 0 ? track.album.images[0].url : icon
                    }
                    queueData.push(songData);
                }
            }
    
            if(update) {
                await firestore.collection('parties').doc(`${id}`).update({
                    queue: q
                })
            }
    
            setQueueData(queueData.reverse());
        }
        const getVotesNeeded = () => {
            return snapshot.members.length > 1 ? Math.ceil(snapshot.members.length / 2) : 1;
        }
        const handleVoteData = () => {
            const skip = async () => {
                if(snapshot.owner.uuid === auth.currentUser.uid) {
                    await firestore.collection('parties').doc(`${id}`).update({
                        skip_votes: 0,
                        skips: []
                    })
                    await skipSong(localStorage.getItem(id + "-device-id"));
                    await updateOwnerPlayingData(true);
                }
            }

            const votes = snapshot.skip_votes;
            if(votes >= getVotesNeeded()) {
                skip();
            }else{
                setSkipVotes(votes);
            }
        }
        const handleCurrentlyPlaying = () => {
            const current = snapshot.currently;
            setCurrentlyPlaying(current);
        }
        if(snapshot) {
            setPartyMembers(snapshot.members);
            if(isLoggedInToSpotify()) handleQueueData();
            handleVoteData();
            handleCurrentlyPlaying();
            setCanSkip(snapshot.can_skip);
            setNeededVotes(getVotesNeeded());
        }
    }, [partyData, snapshot])

    // starts a listener on firestore database
    useEffect(() => {
        if(invalidParty()) return;
        const unsubscribe = firestore.collection('parties').doc(`${id}`).onSnapshot(async (snapshot) => { // listen to changes made in collection document
            const data = await snapshot.data();
            setSnapshot(data);
            
        }) 

        const parties = firestore.collection('parties').onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                const docName = change.doc.id;
                if(change.type === "removed") {
                    if(docName === id) {
                        setPartyData("deleted");
                    }
                }
            })
        })
        return () => { 
            console.log("UNMOUNTING");
            unsubscribe();
            parties();
        };
    }, [partyData]);

    return (
    partyData === "waiting" ? <Background><Loading></Loading></Background> :
    partyData === "undefined" ? <InfoPage title="Group Not Found" subtitle=""></InfoPage> :
    partyData === "deleted" ? <InfoPage title="Your Group Was Deleted" subtitle="The group owner must have left."></InfoPage> : 
    isMember === null ? <Background><Loading></Loading></Background> : 
    <div>
        {isMember ? <div>
            <HeaderBar setDrawerOpen={setDrawerOpen} drawerOpen={drawerOpen}>{partyData.name}</HeaderBar>
        {isLoggedInToSpotify() ? 
        <Body className="body">
            <CurrentlyPlaying queue={queue} setQueueData={setQueueData} auth={auth} votesNeeded={neededVotes} setCanSkip={setCanSkip} canSkip={canSkip} partyMembers={partyMembers} currentlyPlaying={currentlyPlaying} firebase={firebase} firestore={firestore} id={id} skipVotes={skipVotes} partyMembers={partyMembers}></CurrentlyPlaying>
            <QueueASong setSongURI={setSongURI} songURI={songURI} handleClick={handleClick} playlistHref={playlistHref} setPlaylistHref={setPlaylistHref} playlistName={playlistName} setPlaylistName={setPlaylistName}></QueueASong>
            <ToastContainer></ToastContainer>

        </Body>
         : 
        <Body style={{backgroundColor: theme.blackColor, display: "grid", placeItems: "center"}}>
            <div style={{display: "grid", placeItems: "center"}}>
                <Title fontSize="48px">You aren't logged in with Spotify.</Title>
                <Title fontSize="24px">You can still queue tracks with Spotify links, but you can't view the queue history or view your playlists.</Title>
                <Title fontSize="18px">Fun fact! You can easily queue songs from your playlists if you're logged into Spotify, instead of having to find the Spotify link (also the UI here is really ugly lol).</Title>
                <div style={{display: "grid", placeItems: "center", width: "100vw"}}>{QueueInputField("100%", songURI, setSongURI, false, toast, handleClick)}</div>
                {canSkip ? <Button onClick={async () => {
                    const ref = firestore.collection('parties').doc(`${id}`);
                    const doc = await ref.get();
                    const data = await doc.data();
                    if(!data.skips.includes(auth.currentUser.uid)) {
                        ref.update({
                            skip_votes: firebase.firestore.FieldValue.increment(1),
                            skips: firebase.firestore.FieldValue.arrayUnion(auth.currentUser.uid)
                        })
                    }else{
                        toast.error("You already voted!", {
                            position: "bottom-center"
                        })
                    }
                }} borderRadius="0px" fontSize={theme.font4} width="50%" height="50px">Vote Skip ({skipVotes}/{neededVotes})</Button>
                :
                <Title style={{marginTop: "18px"}} fontSize="18px">Owner disabled skipping ability.</Title>
                }
                <ToastContainer />
            </div>
        </Body>}</div> : 
        <JoinGroup givenID={id} firestore={firestore}></JoinGroup>
        }
    </div>
        
    )
}

export default PartyRoute
