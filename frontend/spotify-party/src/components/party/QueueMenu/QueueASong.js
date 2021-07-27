import styled from "styled-components";
import { theme, QueueInputField } from "../../../styles/globals";
import { toast } from "react-toastify";
import Playlists from "../Playlists";

import back from '../../left-back-arrow.png';

import { useMediaPredicate } from "react-media-hook";

const PlaylistDiv = styled.div`
    height: 80vh;
    width: 85%;
    overflow-y: scroll;
    
    ::-webkit-scrollbar {
        background-color: ${theme.blackColor};
        width: 10px;
    }

    ::-webkit-scrollbar-thumb{
        background-color: ${theme.lightGrayColor};
        transition: all 0.5s ease;
        width: 10px;
    }
`;

const Wrapper = styled.div`
    position: relative;
    height: 100vh;
    width: 100%;

    display: grid;
    place-items: center;

    background-color: ${theme.blackColor};
`;

const BackBar = styled.div`
    height: 65px;
    position: relative;
    background-color: ${theme.grayColor};

    h1 {
        color: white;
        text-align: center;
        line-height: 65px;
    }

    @media only screen and (max-width: 768px) {

        h1 {
            font-size: ${theme.font5};
        }
    }
`;

const Back = styled.img`
    position: absolute;
    height: 3.5em;
    width: 3.5em;
    filter: invert(100%) sepia(0%) saturate(7457%) hue-rotate(212deg) brightness(96%) contrast(110%);
    cursor: pointer;
    left: 0.5em;
    top: 0.2em;
`;

function QueueASong({setSongURI, songURI, handleClick, playlistHref, setPlaylistHref, playlistName, setPlaylistName}) {

    const mediaPredicate = useMediaPredicate("(max-width: 720px)");

    return (
        <Wrapper id="queue-a-song">
            {QueueInputField("100%", songURI, setSongURI, mediaPredicate, toast, handleClick)}
            <PlaylistDiv className="playlist-div">
                {playlistName && <BackBar>
                        <div style={{position: "relative"}}>
                            <Back src={back} onClick={() => {
                                setPlaylistName("");
                                setPlaylistHref("");
                            }}></Back>
                        </div>
                        <h1>{playlistName}</h1>
                    </BackBar>}
                <div>
                    <Playlists setSongURI={setSongURI} playlistHref={playlistHref} setPlaylistHref={setPlaylistHref} playlistName={playlistName} setPlaylistName={setPlaylistName}></Playlists>
                </div>
            </PlaylistDiv>
        </Wrapper>
    )
}

export default QueueASong
