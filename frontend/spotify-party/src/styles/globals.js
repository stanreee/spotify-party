import styled from "styled-components";

export const theme = {
    lightGrayColor: "#5c5c5c",
    grayColor: "#212121",
    darkGrayColor: "#232931",
    blueColor: "#393E46",
    greenColor: "#4ECCA3",
    lightGreenColor: "#70cfaf",
    darkGreenColor: "#25c28f",
    blackColor: "#181818",
    whiteColor: "#EEEEEE",
    pinkColor: "#EC407A",
    orangeColor: "#E65100",
    purpleColor: "#4527A0",
    darkBlueColor: "#0D47A1",
    font1: "12px",
    font2: "14px",
    font3: "16px",
    font4: "20px",
    font5: "24px",
    font6: "36px",
    font7: "40px",
    font8: "48px"
}

export const Button = styled.button`
    width: ${props => props.width};
    height: ${props => props.height};
    margin-top: 10px;
    background-color: ${props => props.color ? props.color : theme.greenColor};
    border: ${props => props.borderColor ? "1px solid " + props.borderColor : "none"};
    border-radius: ${props => props.borderRadius ? props.borderRadius : "3px"};

    margin-left: ${props => props.marginLeft};
    margin-right: ${props => props.marginRight};

    color: ${props => props.fontColor ? props.fontColor : theme.whiteColor};
    font-size: ${props => props.fontSize};
    cursor: ${props => props.cursor ? props.cursor : "default"};
    font-weight: bold;

    transition: all ease 0.5s;

    :hover {
        background-color: ${props => props.hoverColor ? props.hoverColor : theme.lightGreenColor};
        color: ${props => props.fontHoverColor ? props.fontHoverColor : theme.whiteColor};
    }
`;

export const InputField = styled.input`
    width: ${props => props.width};
    height: ${props => props.height};
    font-size: ${props => props.fontSize};
    color: ${theme.whiteColor};
    text-align: center;
    border: none;
    border-bottom: solid 2px;
    border-color: ${theme.greenColor};
    background-color: rgba(0, 0, 0, 0);

    outline: none;
    
    ::placeholder {
        color: ${theme.lightGrayColor};
    }
`;

export const GenericBackground = styled.div`
    height: 100vh;
    width: 100vw;
    background-color: ${theme.blackColor};
`;

export const Body = styled.div`
    margin: 0px;
    padding: 0px;
    height: 100vh;
    width: 100vw;
    background-color: ${theme.blackColor};
    display: grid;
    place-items: center;
`;

export const Title = styled.h1`
    position: relative;
    text-align: center;
    margin: 0;
    color: ${theme.greenColor};
    font-size: ${props => props.fontSize};
    margin-bottom: 10px;
`;

const QueueInputDiv = styled.div`
    margin-top: 20px;
    display: flex;
    width: 85%;

    @media only screen and (max-width: 768px) {
        width: 90%;
    }
`;

export const QueueInputField = (width="100%", songURI, setSongURI, mediaPredicate, toast, handleClick) => <QueueInputDiv>
<InputField value={songURI} onChange={(e) => setSongURI(e.target.value)} fontSize={mediaPredicate ? "18px" : "24px"} height="75px" width={width} onBlur={(e) => e.target.placeholder = 'Copy a Spotify track link and paste it here!'} onFocus={(e) => e.target.placeholder = ''} placeholder="Copy a Spotify track link and paste it here!"></InputField>
<Button onClick={async () => { 
    const regExp = /^https:\/\/open.spotify.com\/track\/[a-z0-9A-Z]+\?si=[a-z0-9A-Z]*&*.*$/;
    if(!regExp.test(songURI)) {
        toast.error("Invalid URL.", {
            position: "bottom-center",
        });
        return;
    }
    handleClick().then((result) => {
        toast.success("Queued!", {
            position: "bottom-center"
        });
    }).catch(err => {
        toast.error("No Spotify song found from URL.", {
            position: "bottom-center"
        })
    });
    
    setSongURI("");
    }} borderRadius="0px" marginLeft="12px" height="65px" fontSize={mediaPredicate ? "18px" : "24px"} width="20%">Queue</Button>
</QueueInputDiv>;

export const Icon = styled.img`
    width: 100px;
    height: 100px;
    margin: 4px 8px;

    @media only screen and (max-height: 670px) {
        width: 75px;
        height: 75px;
    }
`;

// designed for mobile first, then desktop
export const TileWrapper = styled.div`

    background-color: ${props => props.backgroundColor};

    width: 100%;
    height: 20%;

    display: flex;
    margin-top: ${props => props.marginTop};

    h1 {
        color: ${theme.whiteColor};
        font-size: ${theme.font3};
    }

    h2 {
        color: ${theme.whiteColor};
        font-size: ${theme.font1};
        font-weight: normal;
    }

    transition: all ease 0.5s;

    cursor: ${(props) => props.hoverEffect ? "pointer" : "default"};

    @media only screen and (min-width: 768px) {
        height: 110px;
        width: 100%;

        h1 {
            font-size: ${theme.font4};
        }

        h2 {
            font-size: ${theme.font2};
            font-weight: normal;
        }
    }

    :hover {
        background-color: ${(props) => props.hoverEffect ? theme.grayColor : theme.blackColor};
    }
`;

const SongInfo = styled.div`
    margin-top: 10px;
    margin-left: 5px;
`;

export function InfoTile({backgroundColor=theme.blackColor, marginTop="0px", hoverEffect = false, onClick = () => {}, className, imgSrc, titleText, subTitleText}) {
    return <TileWrapper backgroundColor={backgroundColor} marginTop={marginTop} hoverEffect={hoverEffect} onClick={() => onClick()} className={className}>
            <div style={{display: "grid", placeItems: "center"}}>
                <Icon src={imgSrc}></Icon>
            </div>
            <SongInfo>
                <div>
                    <h1>{titleText}</h1>
                    {subTitleText.map((subtitle) => <h2>{subtitle}{"\n"}</h2>)}
                </div>
            </SongInfo>
        </TileWrapper>
}

export function getArtists(artists) {
    if(artists.length <= 0) return "Artists unavailable";
    var artistText = artists[0].name;
    for(var i = 1;  i < artists.length; i++) {
        artistText += ", " + artists[i].name;
    }
    return artistText;
}