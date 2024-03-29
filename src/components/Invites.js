import { Box, Text, Button } from "@chakra-ui/react";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useState } from "react";
import {
  getDatabase,
  ref,
  set,
  onValue,
  off,
  get,
  child,
} from "firebase/database";
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
} from "@chakra-ui/react";

import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from "@chakra-ui/react";

function Invites({ user, uid, db }) {
  const [invites, setInvites] = useState(null);

  useEffect(() => {
    getInvites();
  }, []);

  const getInvites = () => {
    onValue(
      ref(db, "invites/" + user.email.replaceAll(".", " ")),
      (snapshot) => {
        if (snapshot.exists()) {
          setInvites(snapshot.val());
        }
      }
    );
  };

  const getGroup = async (groupuid) => {
    //console.log(uid)
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, "groups/" + groupuid));
    // onValue(ref(db, "groups/" + groupuid), (snapshot) => {
    //   if (snapshot.exists() && snapshot.val() != "none") {
    //     console.log(snapshot.val().name)
    //     return snapshot.val().name;
    //   }
    // });

    if (!snapshot.exists() || snapshot.val() == "none") {
        // console.log(snapshot.val().name)
        return snapshot.val().name;
    }
  }

  const joinTeam = async (groupuid) => {
    // console.log(groupuid)
    set(ref(db, "users/" + uid + "/group"), 
      groupuid
    );
    
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, "groups/" + groupuid + "/users"));
    // console.log("here: ", snapshot)
    if (snapshot.exists()) {
      set(ref(db, "groups/" + groupuid + "/users"), 
      snapshot.val().concat([{
        uid: uid,
        userName: user.displayName,
      }])
    );
    }
    
    set(ref(db, "invites/" + user.email.replaceAll(".", " ")), {})
  }

  return (
    <TableContainer overflowY="scroll">
      <Table variant="simple" colorScheme="whiteAlpha" mt="5">
        <TableCaption color="white" >All Your Invites</TableCaption>
        <Thead>
          <Tr>
            <Th color="white">User</Th>
            <Th color="white">Group Name</Th>
            <Th color="white" isNumeric>Join</Th>
          </Tr>
        </Thead>
        <Tbody>
          {invites ? (
            invites.map((invite) => {
              return (
                <Tr color="white" key={invite.inviter}>
                  <Td>{invite.inviter}</Td>
                  <Td>{invite.groupName}</Td>
                  <Td isNumeric>
                    <Button bgColor="#333" textColor="white" borderColor="#FF8360" _hover={{ bgColor: '#FF8360', textColor: 'white' }}   onClick={()=>joinTeam(invite.group)}>Join Team</Button>
                  </Td>
                </Tr>
              );
            })
          ) : (
            <Tr>
              <Td color="white">You have no invites</Td>
              <Td></Td>
              <Td isNumeric></Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

export default Invites;
