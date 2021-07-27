import { useState, useEffect } from "react";
import { getPlaylist } from "../../api/spotify";

import PlaylistTrack from "./PlaylistTrack";
import Loading from "../Loading";

import icon from "./dog_pic.png";

function Playlist({setSongURI, playlistHref}) {

    const [tiles, setTiles] = useState(null);

    useEffect(() => {
        const fetchTrackData = async () => {
            const tileData = [];
            const data = await getPlaylist(playlistHref);
            for(var item of data.items) {
                if(item.is_local) continue;
                const handled = {
                    name: item.track.name,
                    imgSrc: item.track.album.images.length > 0 ? item.track.album.images[0].url : icon,
                    artists: item.track.artists,
                    songHref: item.track.external_urls.spotify,
                }
                tileData.push(handled);
            }

            setTiles(tileData);
        }

        fetchTrackData();
    }, [playlistHref])

    return (
        tiles ? (tiles.map((data, index) => index === 0 ? <PlaylistTrack setSongURI={setSongURI} marginTop={"0px"} trackData={data}></PlaylistTrack> : <PlaylistTrack setSongURI={setSongURI} trackData={data}></PlaylistTrack>)) : 
        <div style={{margin: "auto", display: "grid", placeItems: "center", height: "100%"}}>
                <Loading></Loading>
            </div>
    )
}

export default Playlist
