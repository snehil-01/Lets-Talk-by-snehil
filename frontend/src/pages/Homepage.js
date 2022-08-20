import React, { useEffect } from 'react'
import { Container,Box,Text, Tab, TabList, TabPanels, TabPanel, Tabs } from '@chakra-ui/react'
import Log from "../components/authentication/Log";
import Sign from "../components/authentication/Sign"
import { useHistory } from 'react-router-dom';

const Homepage = () => {

 const history=useHistory();

   useEffect(()=>{
   const user=JSON.parse(localStorage.getItem("userInfo"));
  
   
    if(user){
        history.push('/chats')
    }
},[history]);

  return (
    <Container maxW='x1' centerContent>
     <Box
     d='flex'
     justifyContent='center'
     p={3}
     bg="white"
     w="800px"
     m="40px 0 15px 0"
     borderRadius="lg"
     borderWidth="1px"
     >
        <Text fontSize='4xl' fontFamily='Work sans' color='black' textAlign='center'>Lets-Talk</Text>
    </Box> 
    <Box bg='white' w="800px" p={4} borderRadius="lg" borderWidth="1px" color='black'>
                <Tabs variant='soft-rounded' >
            <TabList mb="1em">
                <Tab width='50%'>Login</Tab>
                <Tab width='50%'>Sign Up</Tab>
            </TabList>
            <TabPanels>
                <TabPanel>
                 <Log/>
                </TabPanel>
                <TabPanel>
                 <Sign/>
                </TabPanel>
            </TabPanels>
            </Tabs>
    
    </Box>
    </Container>
  )
}

export default Homepage;
