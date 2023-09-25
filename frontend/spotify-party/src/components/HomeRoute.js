import styled from "styled-components";
import { Body, Button, theme, Title } from "../styles/globals";

import { useHistory } from 'react-router-dom';

import { isLoggedInToSpotify } from "../api/spotify";

import github from "./GitHub-Mark.png";

const ButtonsDiv = styled.div`
    display: flex;
    flex-direction: column;
    place-items: center;
`;

const GithubWrapper = styled.div`
    position: absolute;
    width: 100%;
    bottom: 4em;
`;

const GithubIcon = styled.img`
    position: absolute;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    transition: all 0.5s ease;
    right: 1em;

    cursor: pointer;

    :hover {
        width: 52px;
        height: 52px;
        filter: brightness(1.5);
    }
`;

function HomeRoute() {

    const history = useHistory();

    const redirect = process.env.NODE_ENV === "production" ? process.env.SERVER_URL + "/login" : "http://localhost:4000/login"

    const login = () => {
        window.location.href = redirect;
    }

    const logout = () => {
        localStorage.setItem("access-token", undefined);
        localStorage.setItem("refresh-token", undefined);
        history.push("/");
        window.location.reload(); 
    }

    return (
        <Body>
            <div style={{width: "365px"}}>
                <Title fontSize="48px">🎉Partify🎉</Title>
                <Title fontSize="17px">A web app designed for Spotify get togethers.</Title>
                <ButtonsDiv>
                    <Button borderRadius="0px" fontSize="18px" onClick={() => history.push("/join")} width="95%" height="50px">Join a Party</Button>
                    <Button borderRadius="0px" fontSize="18px" onClick={() => history.push("/create")} width="95%" height="50px">Create a Party</Button>
                    {isLoggedInToSpotify() ? 
                        <Button hoverColor={"#f44336"} color={theme.whiteColor} fontColor={theme.blackColor} borderRadius="0px" fontSize="18px" onClick={() => logout()} width="95%" height="50px">Logout of Spotify</Button>
                    :
                        <Button color={theme.whiteColor} fontColor={theme.blackColor} borderRadius="0px" fontSize="18px" onClick={() => login()} width="95%" height="50px">Login to Spotify</Button>
                    }
                </ButtonsDiv>
            </div>
            <GithubWrapper>
                <a rel="noreferrer" target="_blank" href="https://github.com/stanreee/spotify-party">
                    <GithubIcon src={github}></GithubIcon>
                </a>
            </GithubWrapper>
        </Body>
    )
}

export default HomeRoute
