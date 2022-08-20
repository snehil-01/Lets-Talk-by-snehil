import { Avatar, Box, Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, Input, Menu, MenuButton, MenuDivider, MenuItem, MenuList,  Text, Toast, Tooltip, useDisclosure, useToast } from '@chakra-ui/react';
import React from 'react'
import { useState } from 'react';
import { BellIcon, ChevronDownIcon, Search2Icon, SpinnerIcon } from "@chakra-ui/icons";
import { ChatState } from '../../context/chatProvider';
import ProfileModal from './ProfileModal';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import ChatLoading from '../ChatLoading';
import UserListItem from '../UserAvatar/UserListItem';
import { Spinner } from "@chakra-ui/spinner";
import { getSender } from '../../config/ChatLogics';
import NotificationBadge from "react-notification-badge";
import { Effect } from "react-notification-badge";

const SideDrawer = () => {

const [search, setSearch] = useState("");
const [searchResult, setSearchResult] = useState([]);
const [loading, setLoading] = useState(false);
const [loadingChat, setLoadingChat] = useState(false);
  
const {
    setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats,
  } = ChatState();

    const history = useHistory();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history.push("/");
  };

const handleSearch = async () => {

if (!search) {
      toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }
try {
  setLoading(true);

  const config={
    headers:{
      Authorization: `Bearer ${user.token}`
    }
  };

  const {data}= await axios.get(`/api/user?search=${search}`,config)
  setLoading(false);
  setSearchResult(data);

} catch (error) {
  
toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });

}



}

const accessChat=async (userId)=>{

  try {

    setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const {data}=await axios.post('/api/chat',{userId},config);
  
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);

      setSelectedChat(data);
      setLoadingChat(false);
      onClose();

    } catch (error) {
    
       toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
  }

}

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="5px"
      >
        <Tooltip label="Search Users to chat" hasArrow placement='bottom-end'>

        <Button variant="ghost" onClick={onOpen}>
          {/* <i color='red' class="fa-solid fa-magnifying-glass"></i> */}
          <Search2Icon/>
          <Text d={{base:"none",md:"flex"}} px="4">
            Search User
          </Text>
        </Button>
        </Tooltip>
        <Text fontSize="2xl" fontFamily="Work sans">
          Lets-Talk
        </Text>
        <div>
          <Menu>
            <MenuButton p={1}>
              <NotificationBadge
                count={notification.length}
                effect={Effect.ROTATE_X}
              />
              <BellIcon  fontSize="2xl" m={1} />
            </MenuButton>   
            <MenuList pl={2}>
              {!notification.length && "No New Messages"}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `New Message in ${notif.chat.chatName}`
                    : `New Message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}

            </MenuList>         
          </Menu>
          <Menu>
            <MenuButton as={Button} bg="white" rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
            </MenuButton>   
            <MenuList>
                <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>{" "}
                </ProfileModal>
                <MenuDivider />
                <MenuItem onClick={logoutHandler}>Logout</MenuItem>
              
              
            </MenuList>
          </Menu>
        </div>
      </Box>
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
      <DrawerOverlay/>
      <DrawerContent>
        <DrawerHeader borderBottomWidth="1px"> Search Users</DrawerHeader>

        <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button 
              onClick={handleSearch}
              >
                Go
                </Button>
            </Box>
            {loading ?<ChatLoading />: 
            (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )
            }
             {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>

      </DrawerContent>
    </Drawer>

    </>
  )
}

export default SideDrawer
