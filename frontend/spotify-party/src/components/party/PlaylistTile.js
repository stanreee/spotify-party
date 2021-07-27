import { InfoTile } from "../../styles/globals";

function PlaylistTile({onClick, playlistData}) {
    return (
        <InfoTile hoverEffect={true} className="playlist-wrapper" onClick={() => onClick()} imgSrc={playlistData.imgSrc} titleText={playlistData.playlistName} subTitleText={[playlistData.songCount + " tracks"]}></InfoTile>
    )
}

export default PlaylistTile
