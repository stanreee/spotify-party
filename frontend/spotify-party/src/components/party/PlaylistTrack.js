import { InfoTile, getArtists } from "../../styles/globals";

import { toast } from "react-toastify";

function PlaylistTrack({setSongURI, marginTop, trackData}) {

    const handleTrackClick = () => {
        setSongURI(trackData.songHref + "?si=");
        toast.info("Track link entered!", {
            position: "bottom-center"
        });
    }

    return (
        <InfoTile marginTop={marginTop} hoverEffect={true} className="playlist-track-wrapper" onClick={() => handleTrackClick()} imgSrc={trackData.imgSrc} titleText={trackData.name} subTitleText={[getArtists(trackData.artists)]}></InfoTile>
    )
}

export default PlaylistTrack
