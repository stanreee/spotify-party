import { useState, useEffect } from "react";
import PlaylistTile from "./PlaylistTile";

import icon from "./dog_pic.png";
import Loading from "../Loading";

import { getUserPlaylists } from "../../api/spotify";

import Playlist from "./Playlist";

function Playlists({setPlaylistName, setPlaylistHref, playlistHref, setSongURI}) {

    const [tiles, setTiles] = useState(null);

    const playlistClick = (href, curPlaylistName) => {
        setPlaylistName(curPlaylistName);
        setPlaylistHref(href);
    }

    useEffect(() => {

        const fetchPlaylistData = async () => {

            const playlistData = [];

            const data = await getUserPlaylists();
            for(var playlist of data.items) {
                const handled = {
                    playlistName: playlist.name,
                    songCount: playlist.tracks.total,
                    imgSrc: playlist.images.length > 0 ? playlist.images[0].url : icon,
                    tracksHref: playlist.tracks.href
                }
                playlistData.push(handled);
            }

            setTiles(playlistData);
        }

        if(playlistHref === "") {
            fetchPlaylistData();
        }
    }, [playlistHref])

    return (
        tiles ? 
            (playlistHref === "" ? tiles.map((data, index) => <PlaylistTile key={index} onClick={() => playlistClick(data.tracksHref, data.playlistName)} playlistData={data}></PlaylistTile>) : 
                    <Playlist setSongURI={setSongURI} playlistHref={playlistHref}></Playlist>
            ) : 
        <div style={{margin: "auto", display: "grid", placeItems: "center", height: "100%"}}>
                <Loading></Loading>
            </div>
    )
}

export default Playlists
