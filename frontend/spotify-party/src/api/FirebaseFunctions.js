import { auth } from '../App';

export const isMemberOfParty = async (firestore, groupCode) => {
    const partiesRef = firestore.collection("parties");

    const doc = partiesRef.doc(`${groupCode}`);
    const docRef = await doc.get();

    const data = await docRef.data();
    const existingMembers = data.members;

    const exist = existingMembers.some(obj => obj.uuid === auth.currentUser.uid);

    if(exist) {
        console.log("user already member of party");
    }

    return exist;
}

export const deleteUser = async (FieldValue, firestore, groupCode) => {
    const partiesRef = firestore.collection("parties");

    const doc = partiesRef.doc(`${groupCode}`);
    
    const obj = {
        uuid: auth.currentUser.uid,
        name: localStorage.getItem(groupCode + "-display")
    }
    
    const docRef = await doc.get();

    const data = await docRef.data();

    if(data.owner.uuid === auth.currentUser.uid) {
        await doc.delete();
        return;
    }

    await doc.update({
        members: FieldValue.arrayRemove(obj)
    })
}

export const createUser = async (firestore, groupCode, displayName, owner) => {
    const partiesRef = firestore.collection("parties");

    const doc = partiesRef.doc(`${groupCode}`);
    const docRef = await doc.get();

    const data = await docRef.data();
    const existingMembers = data.members;
    const memberIDs = data.uids;

    var uuid = auth.currentUser.uid;

    var overwrite = false;

    var index = 0;
    for(const member of existingMembers) {
        if(member.uuid === uuid) {
            overwrite = true;
            break;
        }
        index += 1;
    }

    if(overwrite) {
        existingMembers[index].name = displayName;

        const memberObject = {
            name: displayName,
            uuid: uuid
        }

        if(uuid === data.owner.uuid) {
            owner = true;
        }

        if(!owner) {
            await doc.set({
                ...data,
                members: existingMembers
            })
        }else {
            await doc.set({
                ...data,
                members: existingMembers,
                owner: memberObject
            })
        }
        return memberObject;
    }

    const memberObject = {
        name: displayName,
        uuid: uuid
    }

    localStorage.setItem(groupCode + "-display", displayName);

    if(owner) {
        await doc.set({
            ...data,
            members: [...existingMembers, memberObject],
            owner: memberObject,
            uids: [...memberIDs, uuid]
        })
    }else {
        await doc.set({
            ...data,
            members: [...existingMembers, memberObject],
            uids: [...memberIDs, uuid]
        })
    }

    // if(localStorage.getItem(groupCode + "-uuid") !== null || localStorage.getItem(groupCode + "-uuid") !== undefined) {
    //     var overwrite = false;
    //     const uuid = localStorage.getItem(groupCode + "-uuid");
    //     var index = 0;
    //     for(const member of existingMembers) {
    //         if(member.uuid === uuid) {
    //             overwrite = true;
    //             break;
    //         }
    //         index += 1;
    //     }

    //     if(overwrite) {
    //         existingMembers[index].name = displayName;

    //         const memberObject = {
    //             name: displayName,
    //             uuid: uuid
    //         }

    //         if(uuid === data.owner.uuid) {
    //             owner = true;
    //         }

    //         if(!owner) {
    //             await doc.set({
    //                 ...data,
    //                 members: existingMembers
    //             })
    //         }else {
    //             await doc.set({
    //                 ...data,
    //                 members: existingMembers,
    //                 owner: memberObject
    //             })
    //         }
    //         return memberObject;
    //     }
    // }

    // const memberObject = {
    //     name: displayName,
    //     uuid: uuid
    // }

    // localStorage.setItem(groupCode + "-uuid", uuid);
    // localStorage.setItem(groupCode + "-display", displayName);

    // if(owner) {
    //     await doc.set({
    //         ...data,
    //         members: [...existingMembers, memberObject],
    //         owner: memberObject
    //     })
    // }else {
    //     await doc.set({
    //         ...data,
    //         members: [...existingMembers, memberObject]
    //     })
    // }

    return memberObject;
}