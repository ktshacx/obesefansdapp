import {
  Box, 
  Button, 
  Text, 
  Image, 
  Alert, 
  AlertIcon, 
  CircularProgress, 
  CircularProgressLabel, 
  Skeleton, 
  SkeletonText, 
  Link, 
  AlertTitle, 
  AlertDescription, 
  FormControl, 
  FormLabel, 
  Input, 
  Progress, 
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure
} from '@chakra-ui/react';
import Head from 'next/head';
import { 
  useEffect, 
  useRef, 
  useState 
} from 'react';
import styles from '../styles/Home.module.css';
import { InjectedConnector } from '@web3-react/injected-connector';
import { Injected } from '../connector/Injected';
import { useWeb3React } from "@web3-react/core";
import presale_abi from '../abi/presale';
import web3 from "web3";

export default function Home() {
  const { active, account, library, activate, deactivate, chainId } = useWeb3React();

  const [error, setError] = useState(null);
  const [textError, setTextError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [price, setPrice] = useState(0);
  const [weiRaised, setWeiRaised] = useState(0);
  const [hardCap, setHardCap] = useState(0);
  const [contract, setContract] = useState([]);
  const [balance, setBalance] = useState(0);
  const [kcalBalance, setKcalBalance] = useState(0);
  const [contribution, setContribution] = useState(0);
  const [time, setTime] = useState(0);
  const [current, setCurrent] = useState(0);
  const [isEnded, setIsEnded] = useState(false);

  const [kcal, setKcal] = useState(0);
  const [bnb, setBnb] = useState(0);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  const address = "0xF8409CF8cE10f86dFD544747E701b44043c48628";

  async function connect() {
    if (active) {
      try {
        library.currentProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: library.utils.toHex(97) }],
        })
      } catch (e) {
        console.log(e)
      }
      return;
    }

    if(!window.ethereum) {
      setError("Please install an ethereum enabled wallet.")
      onOpen();
    }

    try {
      activate(Injected)
    } catch (ex) {
      console.log(ex)
    }
  }

  useEffect(() => {
    if (!account) {
      return;
    }


    if (chainId != 97) {
      setError("Please connect to Binance Testnet !!");
      onOpen()
      try {
        library.currentProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: library.utils.toHex(97) }],
        })
      } catch (e) {
        console.log(e)
        return;
      }
    } else {
      setError(null);
      onClose();
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
        contract.methods.checkContribution(account).call().then(res => {
          setContribution(res);
        })
        contract.methods.endICO().call().then(res => {
          setTime(res);
        })
      } catch (e) {
        console.log(e)
      }
    }
  }, [chainId, account])

  useEffect(() => {
    setCurrent(Date.now() / 1000)
  })

  useEffect(() => {
    if (balance / (10 ** 18) < kcal / price) {
      setTextError('Insufficient Balance');
    } else {
      setTextError(null);
    }
  }, [bnb])

  function buy() {
    if (kcal < 12500) {
      setTextError('$CLRS must be greater than 12500')
      return;
    } else {
      setTextError(null);
    }

    if (bnb > 100) {
      setTextError('$CLRS must be less than 125000000');
      return;
    } else {
      setTextError(null);
    }
    setLoading(true);
    contract.methods.buyTokens(account).send({ from: account, value: Math.floor(bnb * 10 ** 18) })
      .on('receipt', receipt => {
        setSuccess('Successfully bought $KCAL worth ' + bnb + ' BNB');
        onOpen();
        setLoading(false);
        contract.methods.checkContribution(account).call().then(res => {
          setContribution(res);
        })
        contract.methods.weiRaised().call().then(res => {
          setWeiRaised(res);
        })
        (async () => {
          var balance = await library.eth.getBalance(account);
          setBalance(balance);
        })();
      })
      .on('error', error => {
        setError(error.message)
        onOpen();
        setLoading(false);
      })
  }

  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function claim() {
    setLoading(true);
    if(contribution > 0){
    contract.methods.claimTokens().send({ from: account })
      .on('receipt', receipt => {
        contract.methods.checkContribution(account).call().then(res => {
          setContribution(res);
        })
        setSuccess('Successfully claimed token');
        onOpen();
        setLoading(false);
      })
      .on('error', error => {
        setError(error.message)
        onOpen()
        setLoading(false);
      })
    }else{
      setError("You can't claim. Your token balance is 0 $CLRS");
      onOpen();
      setLoading(false);
    }
  }

  function secondsToTime(e){
    const h = Math.floor(e / 3600).toString().padStart(2,'0'),
          m = Math.floor(e % 3600 / 60).toString().padStart(2,'0'),
          s = Math.floor(e % 60).toString().padStart(2,'0');
    
    return h + ':' + m + ':' + s;
    //return `${h}:${m}:${s}`;
  }

  return (
    <div>
      <Head>
        <title>ObeseFans Presale DAPP</title>
      </Head>
      <Box p={'10px'} fontSize={'20px'} display={'flex'} justifyContent={'space-between'}>ObeseFans <Text onClick={active ? deactivate : connect} width={['150px', 'auto', 'auto']} overflow={'hidden'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} padding={'10px'} background={'gray.700'} borderRadius={'xl'} fontSize={'15px'} _hover={{ backgroundColor: 'gray.600' }} cursor={'pointer'} display={'flex'} justifyContent={'center'} alignItems={'center'}><Image src="https://cdn3d.iconscout.com/3d/premium/thumb/binance-bnb-coin-4722067-3918006.png" width={'30px'} mr={'5px'}></Image>{active ? (balance / (10 ** 18)).toFixed(3) + " BNB" : "Connect"}</Text></Box>
      {error ? <Alert status='error'>
        <AlertIcon />
        <AlertDescription>{error}</AlertDescription>
      </Alert> : null}
      {success ? <Alert status='success'>
        <AlertIcon />
        <AlertDescription>{success}</AlertDescription>
      </Alert> : null}
      <Box display={'flex'} alignItems={'center'} minH={'90vh'} justifyContent={'center'}>
        <Box borderRadius={'lg'} bgColor={'gray.700'} w={'300px'}>
          <Text fontWeight={600} fontSize={'20px'} background={'cyan.500'} borderRadius={'10px 10px 0px 0px'} p={'10px 20px'}>Private Sale 1</Text>
          <Box display={'flex'} flexDirection={'column'} alignItems={'center'} justifyContent={'center'} p={'20px'}>
            <Image src='https://obesefans.com/assets/img/logo-white.png' width={'250px'}></Image>
            <Text fontWeight={600} fontSize={'20px'}>1 $KCAL = $0.0075</Text>
            <Text color={'gray.400'} fontSize={'15px'} fontWeight={'light'}>Buy before it sells out</Text>
            {active && chainId == 97 ? <Box mt={'20px'}>
              {time - current > 0 ? <Text align={'center'} fontWeight={'thin'} fontSize={'15px'}><b>Time Left</b>: {time && secondsToTime(time - current)}</Text> : <Text align={'center'} fontWeight={'thin'} fontSize={'15px'}>Presale is Ended</Text>}
              <Progress value={(((weiRaised / 10 ** 18) * price) / 100000000) * 100} size='lg' colorScheme='cyan' borderRadius={'lg'} />
              {hardCap == 0 ? <Skeleton h={'20px'}></Skeleton> : <Text align={'center'} mt={'10px'} fontWeight={'thin'} fontSize={'15px'}>${numberWithCommas((weiRaised / 10 ** 18).toFixed(2) * 300)} / ${numberWithCommas((hardCap / 10 ** 18) * 300)}</Text>}
              <Text align={'center'} mt={'10px'} fontWeight={'thin'} fontSize={'15px'}>{numberWithCommas(((weiRaised / 10 ** 18) * price).toFixed(2))} $KCAL / 100,000,000 $KCAL</Text>

              {textError ? <Alert status='error' mt={'10px'} borderRadius={'lg'}>
                <AlertIcon />
                <AlertDescription>{textError}</AlertDescription>
              </Alert> : null}

              {time - current > 0 ? <Box>
                <FormControl mt={'20px'}>
                  <FormLabel>Buying ($KCAL)</FormLabel>
                  <Input type={'number'} placeholder={'0'} value={kcal} onChange={() => {
                    setKcal(event.target.value);
                    setBnb(event.target.value / price);
                  }} min={0} oninput="this.value = Math.abs(this.value)" />
                </FormControl>

                <FormControl mt={'10px'}>
                  <FormLabel>Selling (BNB)</FormLabel>
                  <Input type={'number'} placeholder={'0'} value={bnb} />
                </FormControl>

                <Button colorScheme={'cyan'} mt={'10px'} width={'100%'} onClick={buy} disabled={textError || isLoading} isLoading={isLoading}>Buy $KCAL</Button>
              </Box>
                : <Button colorScheme={'cyan'} mt={'10px'} width={'100%'} onClick={claim} disabled={textError || isLoading} isLoading={isLoading}>Claim</Button>}

              <Text fontWeight={'thin'} mt={'20px'}><b>Your Balance:</b> {numberWithCommas(((contribution / 10 ** 18) * price).toFixed(2))} $KCAL</Text>
              <Text fontWeight={'thin'}>You can claim token after presale</Text>
            </Box> : <Button colorScheme={'orange'} mt={'10px'} width={'100%'} onClick={connect}>Connect Metamask</Button>}
          </Box>
        </Box>
      </Box>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        closeOnOverlayClick={false}
        closeOnEsc={false}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              {error ? "Error" : "Success"}
            </AlertDialogHeader>

            <AlertDialogBody>
              {error ? error : success}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button colorScheme={error ? 'red' : 'green'} ref={cancelRef} onClick={() => {
                onClose();
                if (error) {
                  setError(null);
                  onClose();
                }
                if (success) {
                  setSuccess(null);
                  onClose(null);
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
