import styled from "styled-components";
import { theme, getArtists, Button } from "../../styles/globals";

import { useEffect, useState } from "react";
import { FormGroup, FormControlLabel, Switch, makeStyles, ThemeProvider, createTheme } from "@material-ui/core";

import "react-sliding-pane/dist/react-sliding-pane.css";
import Queue from "./Queue";
import QueuePane from "./QueuePane";

import { createGlobalStyle } from "styled-components";

const Wrapper = styled.div`
    width: 100%;
    height: 100%;
    background-color: ${(props) => props.showAlbum ? theme.blackColor : (props.currentlyPlaying ? props.bgColor : theme.blackColor)};
    background-image: url(${(props) => props.showAlbum && `${props.img}`});
    background-repeat: no-repeat;
    background-size: contain;
    background-position: 50% 50%;

    display: grid;
    place-items: center;

    transition: all ease 0.5s;
`;

const LocalStyle = createGlobalStyle`
    .MuiFormControlLabel-root {
        width: fit-content;
    }

    .slide-pane__overlay.overlay-after-open {
        background-color: rgba(0, 0, 0, 0.6);
    }

    .slide-pane__overlay {
        display: grid;
        place-items: center;
    }

    .slide-pane__header {
        display: inline;
        border-bottom: none;
        background-color: ${theme.blackColor};
    }

    .slide-pane {
        background-color: ${theme.blackColor};
        transition: transform ease 0.5s;
    }

    .slide-pane .slide-pane__title {
        font-size: ${theme.font6};
        color: ${theme.whiteColor};
        margin-top: 18px;
    }

    @media only screen and (max-width: 768px) {
        .slide-pane .slide-pane__title {
            font-size: ${theme.font5};
        }
    }

    .slide-pane__close {
        margin-left: 0px;
        float: right;
        margin-right: 10px;
        color: ${theme.whiteColor};
    }

    .slide-pane_from_bottom {
        height: 80vh;
    }

    .slide-pane_from_bottom.content-before-close {
        transform: translateY(110%);
    }

    .slide-pane__content {
        padding: 24px 24px;
        margin-right: 24px;
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
`;

const InnerContent = styled.div`

    opacity: ${props => props.showAlbum ? "0%" : "100%"};

    transition: all ease 0.5s;

    display: ${props => props.owner ? "flex" : "grid"};
    flex-direction: column;

    width: 100%;
    height: 100%;

    h1 {
        text-align: center;
        color: white;
        font-size: ${theme.font7};
        font-weight: bold;
    }

    h2 {
        text-align: center;
        color: white;
        font-size: ${theme.font5};
        font-weight: normal;
    }

    h3 {
        text-align: center;
        color: white;
        font-size: ${theme.font4};
        font-weight: normal;
    }

    h4{
        text-align: center;
        color: white;
        font-size: ${theme.font3};
        font-weight: normal;
    }

    @media only screen and (max-width: 768px) {
        h1 {
            font-size: 28px;
        }

        h2 {
            font-size: ${theme.font4};
        }

        h3 {
            font-size: ${theme.font3};
        }
    }
`;

const useStyles = makeStyles({
    switch: {
        "& .MuiTypography-root": {
            color: theme.whiteColor,
            fontFamily: "CircularStd",
            fontSize: theme.font3
        },
    },
    track: {
        backgroundColor: theme.greenColor
    },
})

const switchTheme = createTheme({
    overrides: {
        MuiSwitch: {
            track: {
                backgroundColor: theme.blackColor,
                "$checked$checked + &": {
                    opacity: 0.8,
                    backgroundColor: theme.greenColor
                }
            }
        }
    }
})

const BoxWrapper = styled.div`
    position: absolute;
    bottom: 2em;
    width: 100%;

    display: grid;
    place-items: center;

`;

const Box = styled.div`
    height: 50px;
    width: 50px;

    cursor: pointer;
`;

function CurrentlyPlaying({showAlbum, queue, setQueueData, auth, canSkip, votesNeeded, firebase, firestore, partyMembers, id, skipVotes, currentlyPlaying}) {

    const [voted, setVoted] = useState(false);
    const [owner, setOwner] = useState(false);

    const [open, setOpen] = useState(false);

    const ref = firestore.collection('parties').doc(`${id}`);

    const [backgroundColor, setBackgroundColor] = useState(undefined);

    const classes = useStyles();

    function getRandomColor() {
        const colours = [theme.darkBlueColor, theme.greenColor, theme.orangeColor, theme.pinkColor, theme.purpleColor]
        const random = colours[Math.floor(Math.random() * colours.length)];
        return random;
    }

    useEffect(() => {
        const checkVoted = async () => {
            const doc = await ref.get();
            const data = await doc.data();
            setOwner(auth.currentUser.uid === data.owner.uuid);
            if(data.skips.includes(auth.currentUser.uid)) {
                setVoted(true);
            }else{
                setVoted(false);
            }
        }

        checkVoted();

        if(currentlyPlaying) {
            setBackgroundColor(getRandomColor());
        }
    }, [currentlyPlaying])

    // need to figure out how to reset vote counter when new song plays
    const addVote = async () => {
        const doc = await ref.get();
        const data = await doc.data();
        if(!data.skips.includes(auth.currentUser.uid)) {
            ref.update({
                skip_votes: firebase.firestore.FieldValue.increment(1),
                skips: firebase.firestore.FieldValue.arrayUnion(auth.currentUser.uid)
            })
            setVoted(true);
        }
    }

    const toggleSkip = async () => {
        const doc = await ref.get();
        const data = await doc.data();
        await ref.update({
            can_skip: !data.can_skip
        })
    }

    const scrollTo = () => {
        var queue = document.getElementById("queue-a-song");
        queue.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    const MaterialSwitch = 
    <div style={{position: "relative", height: "0%", marginLeft: "6px", marginTop: "7vh"}}>
        <ThemeProvider theme={switchTheme}>
            <FormGroup style={{marginLeft: "8px"}}>
                <FormControlLabel
                    className={classes.switch}
                    control={<Switch color={theme.greenColor} checked={!canSkip} onChange={toggleSkip} />}
                    label="Disable participant skip ability"
                />
            </FormGroup>
        </ThemeProvider>
    </div>

    return (
        currentlyPlaying ? <Wrapper showAlbum={showAlbum} currentlyPlaying={true} bgColor={backgroundColor} img={currentlyPlaying.img}>
            <LocalStyle />
            <InnerContent showAlbum={showAlbum} owner={owner}>
                {owner && MaterialSwitch}
                <div style={{margin: "auto"}}>
                    <div style={{display: "grid", placeItems: "center"}}>
                        <h1>CURRENTLY PLAYING</h1>
                        <h2>{currentlyPlaying.trackName.split("(feat")[0]}</h2>
                        <h3>{getArtists(currentlyPlaying.artists)}</h3>
                        <div style={{display: canSkip ? "flex" : "grid", placeItems: canSkip ? "" : "center", width: "100%", marginTop: "10px", marginBottom: "15px"}}>
                            {canSkip && <Button cursor="pointer" onClick={() => addVote()} borderRadius={"1px"} hoverColor={theme.whiteColor} borderColor={theme.blackColor} style={{marginRight: "5px"}} fontHoverColor={theme.blackColor} fontColor={theme.whiteColor} color={voted ? theme.blueColor : "rgba(0, 0, 0, 0)"} fontSize={theme.font3} width="50%" height="40px">{voted ? "VOTED" : "VOTE SKIP"}</Button>}
                            <Button cursor="pointer" onClick={() => setOpen(true)} borderRadius={"1px"} hoverColor={backgroundColor} borderColor={theme.blackColor} style={{marginLeft: "5px"}} fontHoverColor={theme.whiteColor} fontColor={theme.blackColor} color="rgb(255, 255, 255)" fontSize={theme.font3} width="50%" height="40px">VIEW QUEUE HISTORY</Button>
                        </div>
                    </div>
                    {canSkip ? <h4>{skipVotes} votes ({votesNeeded + " vote(s) needed to skip"})</h4> : <h4>Skipping has been disabled by the group owner.</h4>}
                </div>
                <QueuePane
                    className="queue-pane"
                    isOpen={open}
                    from="bottom"
                    width="85%"
                    onRequestClose={() => setOpen(false)}
                    title="Queue History"
                >
                    <Queue queue={queue} setQueueData={setQueueData} firestore={firestore} id={id}></Queue>
                </QueuePane>
                <BoxWrapper>
                    <Box onClick={() => scrollTo()}>
                        <DownArrowIcon />
                    </Box>
                </BoxWrapper>
            </InnerContent>
        </Wrapper> : 
        <Wrapper currentlyPlaying={false}>
            <LocalStyle />
            <InnerContent owner={owner}>
                {owner && MaterialSwitch}
                <div style={{margin: "auto"}}>
                    <h2>The group owner is currently not playing anything.</h2>
                    <div style={{display: "grid", placeItems: "center", width: "100%", marginTop: "10px", marginBottom: "15px"}}>
                        <Button cursor="pointer" onClick={() => setOpen(true)} borderRadius={"1px"} hoverColor={theme.greenColor} borderColor={theme.blackColor} style={{marginLeft: "5px"}} fontHoverColor={theme.whiteColor} fontColor={theme.blackColor} color="rgb(255, 255, 255)" fontSize={theme.font3} width="50%" height="40px">VIEW QUEUE HISTORY</Button>
                    </div>
                </div>
                <BoxWrapper>
                    <Box onClick={() => scrollTo()}>
                        <DownArrowIcon />
                    </Box>
                </BoxWrapper>
                <QueuePane
                    className="queue-pane"
                    isOpen={open}
                    from="bottom"
                    width="85%"
                    onRequestClose={() => setOpen(false)}
                    title="Queue History"
                >
                    <Queue queue={queue} setQueueData={setQueueData} firestore={firestore} id={id}></Queue>
                </QueuePane>
            </InnerContent>
        </Wrapper>
    )
}

function DownArrowIcon() {
    return (
    <svg width="70" height="55" viewBox="-2.5 -5 75 60" preserveAspectRatio="none">
        <path d="M0,0 l35,45 l35,-45" fill="none" stroke="white" stroke-linecap="round" stroke-width="2.5" />
    </svg>
    );
}

export default CurrentlyPlaying
