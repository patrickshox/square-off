import { Player } from "../types"

function Rival(props: Player) {
    return (
        <div id="rival" style = {{left: `calc(${props.x}% - 35px)`, top: `calc(${props.y}% - 35px)`}}>
            <img src={props.photoUrl} />
        </div>
    )
}

export default Rival