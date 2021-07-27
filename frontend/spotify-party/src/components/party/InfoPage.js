import styled from "styled-components";
import { theme } from "../../styles/globals";

const Body = styled.div`
    height: 100vh;
    width: 100vw;
    background-color: ${theme.blackColor};
    display: grid;
    place-items: center;

    h1{
        color: ${theme.greenColor};
        text-align: center;
        font-size: 48px;
    }

    h2 {
        color: ${theme.greenColor};
        font-weight: normal;
        text-align: center;
        font-size: 18px;
    }
`;

function InfoPage({title, subtitle}) {
    return (
        <Body>
            <div>
                <h1>{title}</h1>
                <h2>{subtitle}</h2>
            </div>
        </Body>
    )
}

export default InfoPage
