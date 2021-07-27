import { InfoTile, getArtists, theme } from "../../styles/globals";

import { useMediaPredicate } from "react-media-hook";

function millisToMinutesAndSeconds(ms){
    const hours = Math.floor((ms)/(60*60*1000));
    const hoursms=ms % (60*60*1000);
    const minutes = Math.floor((hoursms)/(60*1000));
    const minutesms=ms % (60*1000);
    const sec = Math.floor((minutesms)/(1000));
    return [hours,minutes,sec];
}


function QueueTrack({songData}) {

    

    const hours = millisToMinutesAndSeconds(Date.now() - songData.queuedAt)[0];
    const minutes = millisToMinutesAndSeconds(Date.now() - songData.queuedAt)[1];
    const seconds = millisToMinutesAndSeconds(Date.now() - songData.queuedAt)[2];

    const hoursText = hours > 0 ? (hours === 1 ? hours + " hr " : hours + " hrs ") : "";
    const minutesText = minutes + " min ";
    const secondsText = hours < 1 ? seconds + " sec " : "";

    const timeText = hoursText + minutesText + (hours >= 1 ? "" : "and ") + secondsText + " ago";

    const songText = (songData.name).split("(feat")[0];

    const titleText = useMediaPredicate("(max-width: 720px)") ? songText.substring(0, 30) + (songText.length > 30 ? "..." : "") : songText;

    return (
        <InfoTile backgroundColor={theme.blackColor} className="queue-track-wrapper" imgSrc={songData.img} titleText={titleText} subTitleText={[getArtists(songData.artists), "Queued by: " + songData.queuedBy, timeText]}></InfoTile>
    )
}

export default QueueTrack
