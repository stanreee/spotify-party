import styled from 'styled-components';
import { theme } from '../../styles/globals';

import button from "./drawer-button.png";

const Wrapper = styled.div`
    z-index: 10;
    position: absolute;
    height: 6vh;
    width: 100%;
    background-color: rgba(78, 204, 163, 0);
    margin: auto;

    h1 {
        text-align: center;
        color: ${theme.whiteColor};
        font-size: ${theme.font6};
        top: 50%;
    }

    @media only screen and (max-width: 768px) {
        h1 {
            font-size: ${theme.font5};
        }
    }
`;

const DrawerButton = styled.img`
    position: absolute;
    width: 50px;
    height: 50px;

    margin-top: 2px;
    
    cursor: pointer;
`;

function HeaderBar(props) {
    return (
        <Wrapper>
            <div>
                <DrawerButton src={button} onClick={() => props.setDrawerOpen(!props.drawerOpen)}></DrawerButton>
            </div>
            <div style={{height: "100%", width: "100%", display: "grid", placeItems: "center"}}>
                <h1>{props.children}</h1>
            </div>
        </Wrapper>
    )
}

export default HeaderBar
