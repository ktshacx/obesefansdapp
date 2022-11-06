import { Box, Button, Text, Image, Alert, AlertIcon, CircularProgress, CircularProgressLabel, Skeleton, SkeletonText, Link, AlertTitle, AlertDescription, FormControl, FormLabel, Input, Progress, AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay, 
  useDisclosure} from '@chakra-ui/react';
import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import styles from '../styles/Home.module.css';
import { InjectedConnector } from '@web3-react/injected-connector';
import { Injected } from '../connector/Injected';
import { useWeb3React } from "@web3-react/core";
import presale_abi from '../abi/presale';
import web3 from "web3";

export default function Home() {
  const { active, account, library, activate, deactivate, chainId } = useWeb3React();

  const [error, setError] = useState();
  const [textError, setTextError] = useState();
  const [success, setSuccess] = useState();
  const [isLoading, setLoading] = useState(false);
  const [price, setPrice] = useState();
  const [weiRaised, setWeiRaised] = useState();
  const [hardCap, setHardCap] = useState();
  const [contract, setContract] = useState();
  const [balance, setBalance] = useState(0);
  const [kcalBalance, setKcalBalance] = useState(0);
  const [contribution, setContribution] = useState(0);
  const [time, setTime] = useState();
  const [current, setCurrent] = useState();

  const [kcal, setKcal] = useState(0);
  const [bnb, setBnb] = useState(0);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  const address = "0x9f4E15A2958eB69A56cD6453A8Dfdd9cf49F8C94";

  async function connect() {
    if(active) {
      try {
        library.currentProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: library.utils.toHex(97) }],
        })
      }catch(e) {
        console.log(e)
      }
      return;
    }
    try {
      activate(Injected, undefined, true);
    } catch (ex) {
      console.error(ex)
    }
  }

  useEffect(() => {
    if(!account){
      return;
    }


    if(chainId != 97){
      setError("Please connect to Binance Testnet !!");
      onOpen()
      try {
        library.currentProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: library.utils.toHex(97) }],
        })
      }catch(e) {
        console.log(e)
      }
    }else{
      setError(null);
      (async () => {
        var balance = await library.eth.getBalance(account);
        setBalance(balance);
      })()

      try {
        const contract = new library.eth.Contract(presale_abi, address);
        setContract(contract);
        contract.methods._rate().call().then(res => {
          setPrice(res);
        })
        contract.methods.weiRaised().call().then(res => {
          setWeiRaised(res);
        })
        contract.methods.hardCap().call().then(res => {
          setHardCap(res);
        })
        contract.methods.hardCap().call().then(res => {
          setHardCap(res);
        })
        contract.methods.checkContribution(account).call().then(res => {
          setContribution(res);
        })
        contract.methods.endICO().call().then(res => {
          setTime(res);
        })
      }catch(e){
        console.log(e)
      }
    }
  }, [chainId, account])

  useEffect(() => {
    setCurrent(Date.now() / 1000)
  })

  useEffect(() => {
    if(balance / (10 ** 18) < kcal / price) {
      setTextError('Insufficient Balance');
    }else{
      setTextError(null);
    }
  }, [bnb])

  function buy() {
    if(kcal < 10) {
      setTextError('$KCAL must be greater than 10')
      return;
    }else{
      setTextError(null);
    }

    if(bnb > 10) {
      setTextError('$KCAL must be less than 466850');
      return;
    }else{
      setTextError(null);
    }
    setLoading(true);
    contract.methods.buyTokens(account).send({from: account, value: Math.floor(bnb * 10 ** 18)})
    .on('receipt', receipt => {
      setSuccess('Successfully bought $KCAL worth ' + bnb + ' BNB');
      onOpen();
      contract.methods.checkContribution(account).call().then(res => {
        setContribution(res);
      })
      setLoading(false);
    })
    .on('error', error => {
      setError(error.message)
      onOpen();
      setLoading(false);
    })
  }

  return (
    <div>
      <Head>
        <title>ObeseFans Presale DAPP</title>
      </Head>
      <Box p={'10px'} fontSize={'20px'} display={'flex'} justifyContent={'space-between'}>ObeseFans <Text onClick={active ? deactivate : connect} width={['150px', 'auto', 'auto']} overflow={'hidden'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} padding={'10px'} background={'gray.700'} borderRadius={'xl'} fontSize={'15px'} _hover={{backgroundColor: 'gray.600'}} cursor={'pointer'} display={'flex'} justifyContent={'center'} alignItems={'center'}><Image src="https://cdn3d.iconscout.com/3d/premium/thumb/binance-bnb-coin-4722067-3918006.png" width={'30px'} ml={'10px'}></Image>{active ? (balance / (10 ** 18)).toFixed(3) + " BNB" : "Connect"}</Text></Box>
      {error ? <Alert status='error'>
        <AlertIcon/>
        <AlertDescription>{error}</AlertDescription>
      </Alert> : null }
      {success ? <Alert status='success'>
        <AlertIcon/>
        <AlertDescription>{success}</AlertDescription>
      </Alert> : null }
      <Box display={'flex'} alignItems={'center'} minH={'90vh'} justifyContent={'center'}>
        <Box borderRadius={'lg'} bgColor={'gray.700'} minW={'300px'}>
          <Text fontWeight={600} fontSize={'20px'} background={'cyan.500'} borderRadius={'10px 10px 0px 0px'} p={'10px 20px'}>Private Sale 1</Text>
          <Box display={'flex'} flexDirection={'column'} alignItems={'center'} justifyContent={'center'} p={'20px'}>
            <Image src='https://obesefans.com/wp-content/uploads/2022/10/bluetext.png' width={'250px'}></Image>
            <Text fontWeight={600} fontSize={'20px'}>1 $KCAL = $0.0075</Text>
            <Text color={'gray.400'} fontSize={'15px'} fontWeight={'light'}>Buy before it sells out</Text>
            {active && chainId == 97 ? <Box mt={'20px'}>
            <Text align={'center'} fontWeight={'thin'} fontSize={'15px'}><b>Time Left</b>: {new Date((time - current).toFixed(0) * 1000).toISOString().substr(11, 8)}</Text>
              <Progress value={(((weiRaised / 10 ** 18) * price) / 100000000) * 100} size='lg' colorScheme='cyan' borderRadius={'lg'}/>
              <Text align={'center'} mt={'10px'} fontWeight={'thin'} fontSize={'15px'}>{(weiRaised / 10 ** 18).toFixed(2)} BNB / {hardCap / 10 ** 18} BNB</Text>
              <Text align={'center'} mt={'10px'} fontWeight={'thin'} fontSize={'15px'}>{(weiRaised / 10 ** 18) * price} $KCAL / 100,000,000 $KCAL</Text>

              {textError ? <Alert status='error' mt={'10px'} borderRadius={'lg'}>
                <AlertIcon/>
                <AlertDescription>{textError}</AlertDescription>
              </Alert> : null }

              <FormControl mt={'20px'}>
                <FormLabel>Buying ($KCAL)</FormLabel>
                <Input type={'number'} placeholder={'0'} value={kcal} onChange={() => {
                  setKcal(event.target.value);
                  setBnb(event.target.value / price);
                }}/>
              </FormControl>
             
              <FormControl mt={'10px'}>
                <FormLabel>Selling (BNB)</FormLabel>
                <Input type={'number'} placeholder={'0'} value={bnb}/>
              </FormControl>

              <Button colorScheme={'cyan'} mt={'10px'} width={'100%'} onClick={buy} disabled={textError || isLoading} isLoading={isLoading}>Buy $KCAL</Button>
              <Text fontWeight={'thin'} mt={'20px'}><b>Your Balance:</b> {(contribution / 10 ** 18) * price} $KCAL</Text>
              <Text fontWeight={'thin'}>You can claim token after presale</Text>
            </Box> : <Button colorScheme={'orange'} mt={'10px'} width={'100%'} onClick={connect}>Connect Metamask</Button>}
          </Box>
        </Box>
      </Box>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogBody>
              {error ? error : success}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button colorScheme={error ? 'red' : 'green'} ref={cancelRef} onClick={() => {
                onClose();
                if(error) {
                  setError(null);
                }
                if(success) {
                  setSuccess(null);
                }
              }}>
                Ok
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </div>
  )
}
