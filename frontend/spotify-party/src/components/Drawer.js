import React from 'react'

import { FormGroup, FormControlLabel, Switch, Drawer as MUIDrawer, List, ListItem, ListItemText, makeStyles } from '@material-ui/core';

import { withStyles } from '@material-ui/styles';
import styled from 'styled-components';

import { theme } from '../styles/globals';

import { useHistory } from 'react-router';
import { deleteUser } from '../api/FirebaseFunctions';

import { toast, ToastContainer } from 'react-toastify';

const StyledItemText = withStyles({ 
    primary: {
        fontSize: theme.font5,
        fontWeight: "bold"
    }
})(ListItemText)

const useStyles = makeStyles({
    paper: {
        background: theme.blackColor
    },
    switch: {
        "& .MuiTypography-root": {
            color: theme.whiteColor,
            fontFamily: "CircularStd",
            fontSize: theme.font3
        },
    }
})

const MemberTitle = styled.h1`
    margin-top: 10px;
    color: ${theme.greenColor};
    text-align: center;
    font-weight: normal;
    font-size: ${theme.font4};
`;

const Members = styled.div`
    height: 350px;
    overflow-y: scroll;

    ::-webkit-scrollbar {
        background-color: rgb(0, 0, 0, 0);
        width: 5px;
    }

    ::-webkit-scrollbar-thumb{
        background-color: ${theme.greenColor};
        border-radius: 8px;
        transition: all 0.5s ease;
        width: 10px;
    }
`;

function Drawer({setShowAlbum, showAlbum, id, firebase, firestore, groupMembers, setOpen, open}) {

    const classes = useStyles();

    const history = useHistory();

    function handleClose() {
        setOpen(false);
    }

    async function goHome() {
        await deleteUser(firebase.firestore.FieldValue, firestore, id); // deletes user info from firebase. if the user was the owner of the group, deletes the group as well
        handleClose();
        history.push("/");
    }

    return (
        <MUIDrawer classes={{paper: classes.paper}} variant="temporary" width={400} onClose={() => handleClose()} open={open}>
            <ToastContainer></ToastContainer>
            <div style={{height: "100vh", display: "flex", flexDirection: "column", justifyContent: "space-between"}}>
                <div style={{flex: 3}}>
                    <List>
                        <ListItem button key={"Leave Group"}>
                            <ListItemText onClick={() => goHome()} primary={"Leave Group"}></ListItemText>
                        </ListItem>
                        <ListItem button key={"Toggle HUD"}>
                            <FormGroup style={{marginLeft: "8px"}}>
                                <FormControlLabel
                                    className={classes.switch}
                                    control={<Switch color={theme.greenColor} checked={showAlbum} onChange={() => {setShowAlbum(!showAlbum)}} />}
                                    label="Show Album Image"
                                />
                            </FormGroup>
                        </ListItem>
                    </List>
                </div>
                <div style={{flex: 1}}>
                    <List>
                        <ListItem divider key={"Group Members"}>
                            <StyledItemText primary={"Group Members"}></StyledItemText>
                        </ListItem>
                        <Members>
                            {groupMembers.map((member, index) => <MemberTitle key={index}>{member.name}</MemberTitle>)}
                        </Members>
                    </List>
                </div>
            </div>
        </MUIDrawer>
    )
}

export default Drawer
