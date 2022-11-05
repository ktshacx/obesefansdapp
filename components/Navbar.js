import { Box, Text } from "@chakra-ui/react"
const { active, account, library, activate, deactivate } = useWeb3React();

export default function Navbar() {
    return (
        <Box p={'10px'} fontSize={'20px'} display={'flex'} justifyContent={'space-between'}>ObeseFans presale <Text width={['150px', 'auto', 'auto']} overflow={'hidden'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} padding={'10px'} background={'gray.700'} borderRadius={'xl'} fontSize={'15px'} _hover={{backgroundColor: 'gray.600'}} cursor={'pointer'}>Connect</Text></Box>
    )
}