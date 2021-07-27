import QueueTrack from './QueueTrack.js';
import Loading from '../Loading';

function Queue({queue}) {

    return (
        queue ? queue.map((track, index) => <QueueTrack key={index} songData={track}></QueueTrack>) : 
            <div style={{margin: "auto", display: "grid", placeItems: "center", height: "100%"}}>
                <Loading></Loading>
            </div>
    )
}

export default Queue
