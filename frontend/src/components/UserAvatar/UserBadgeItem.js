import { CloseIcon } from '@chakra-ui/icons'
import { Badge, Box } from '@chakra-ui/react'
import React from 'react'

const UserBadgeItem = ({ user, handleFunction, admin }) => {
  return (
    <Badge
     px={2}
      py={1}
      borderRadius="lg"
      m={1}
      mb={2}
      variant="solid"
      fontSize={12}
      colorScheme="orange"
      cursor="pointer"
      onClick={handleFunction}
    >
    {user.name}
    {admin === user._id && <span> (Admin)</span>}
      <CloseIcon pl={1} />
    </Badge>
  )
}

export default UserBadgeItem
