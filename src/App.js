import React, { useMemo } from 'react';
import { useWallet, WalletProvider } from '@tronweb3/tronwallet-adapter-react-hooks';
import { WalletDisconnectedError, WalletNotFoundError } from '@tronweb3/tronwallet-abstract-adapter';
import { Toaster, toast } from 'react-hot-toast';
import { TronLinkAdapter } from '@tronweb3/tronwallet-adapters';
import { WalletConnectAdapter } from '@tronweb3/tronwallet-adapter-walletconnect';
import { LedgerAdapter } from '@tronweb3/tronwallet-adapter-ledger';
import { Core } from '@walletconnect/core';
import { ChainNetwork } from '@tronweb3/tronwallet-abstract-adapter';

const appUrl = ''; // TODO: add url
const projectId = ''; // TODO: add project id

function AppContent() {
  const { select, connect, disconnect, signMessage, address, connected, wallet, wallets } = useWallet();

  console.log('Available wallets:', wallets);
  console.log('Current wallet:', wallet);
  console.log('Connection status:', connected);

  const handleConnect = async (walletName) => {
    try {
      console.log('Attempting to connect with:', walletName);
      
      if (connected && wallet?.adapter.name === walletName) {
        console.log('Wallet already connected:', wallet);
        toast.error('Wallet already connected');
        return;
      }
      
      console.log('Selecting wallet...');
      await select(walletName);
      console.log('Wallet selected');
      
      console.log('Connecting...');
      await connect();
      console.log('Connected successfully');
      
      toast.success('Wallet connected!');
    } catch (e) {
      console.error('Connection error:', e);
      console.error('Error stack:', e.stack);
      toast.error(`Error: ${e.message}`);
    }
  };

  const handleDisconnect = async () => {
    try {
      console.log('Attempting to disconnect...');
      if (!connected) {
        console.log('No wallet connected');
        toast.error('No wallet connected');
        return;
      }
      await disconnect();
      console.log('Disconnected successfully');
      toast.success('Wallet disconnected');
    } catch (e) {
      console.error('Disconnect error:', e);
      toast.error(e.message);
    }
  };

  const handleSignMessage = async () => {
    try {
      if (!connected) {
        toast.error('Please connect wallet first');
        return;
      }
      const message = 'Hello TRON!';
      const signature = await signMessage(message);
      console.log('Message signed:', signature);
      toast.success('Message signed!');
    } catch (e) {
      console.error('Signing error:', e);
      toast.error(`Signing error: ${e.message}`);
    }
  };

  const handleTransaction = async () => {
    try {
      if (!connected || !wallet) {
        toast.error('Please connect wallet first');
        return;
      }

      const transaction = {
        to: "", // TODO: add address
        value: 1000000, // 1 TRX
      };

      const result = await wallet.adapter.signAndSendTransaction(transaction);
      console.log('Transaction result:', result);
      toast.success('Transaction sent!');
    } catch (e) {
      console.error('Transaction error:', e);
      toast.error(`Transaction error: ${e.message}`);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h3>Debug Information:</h3>
        <pre>
          {JSON.stringify(
            {
              connected,
              walletName: wallet?.adapter?.name,
              address,
              availableWallets: wallets.map(w => w.adapter.name)
            },
            null,
            2
          )}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => handleConnect('WalletConnect')}
          style={{ marginRight: '10px' }}
        >
          Connect WalletConnect
        </button>
        
        <button 
          onClick={() => handleConnect('TronLink')}
          style={{ marginRight: '10px' }}
        >
          Connect TronLink
        </button>

        <button 
          onClick={() => handleConnect('Ledger')}
          style={{ marginRight: '10px' }}
        >
          Connect Ledger
        </button>
        
        <button 
          onClick={handleDisconnect}
          disabled={!connected}
          style={{ marginRight: '10px' }}
        >
          Disconnect
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handleSignMessage}
          disabled={!connected}
          style={{ marginRight: '10px' }}
        >
          Sign Message
        </button>

        <button 
          onClick={handleTransaction}
          disabled={!connected}
          style={{ marginRight: '10px' }}
        >
          Send Transaction
        </button>
      </div>
      
      <p>Connection Status: {connected ? 'Connected' : 'Disconnected'}</p>
      <p>Selected Wallet: {wallet?.adapter.name || 'None'}</p>
      <p>Address: {address || 'Not connected'}</p>
    </div>
  );
}

export function App() {
  const adapters = useMemo(() => {
    console.log('Initializing adapters...');
    
    const walletConnectAdapter = new WalletConnectAdapter({
      network: ChainNetwork.Mainnet,
      options: {
        projectId: projectId,
        relayUrl: 'wss://relay.walletconnect.com',
        core: new Core({
          projectId: projectId,
        }),
        metadata: {
          name: 'Energy App',
          description: 'Energy App WalletConnect',
          url: appUrl,
          icons: [`${appUrl}/favicon.ico`]
        },
        chains: ['tron:0x2b6653dc'],
        methods: ['personal_sign'],
        events: ['accountsChanged', 'chainChanged'],
        showQrModal: true,
      },
      web3ModalConfig: {
        projectId: projectId,
        themeMode: 'dark',
        themeVariables: {
          '--wcm-z-index': '1000',
        },
        enableExplorer: true,
        explorerRecommendedWalletIds: [
          'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // TronLink
          '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // TokenPocket
          '20459438007b75f4f4acb98bf29aa3b800550309646d375da5fd4aac6c2a2c66', // BitKeep
          '7674bb4e353bf52886768a3ddc2a4562ce2f4191c80831291218ebd90f5f5e26', // iToken
          '7674bb4e353bf52886768a3ddc2a4562ce2f4191c80831291218ebd90f5f5e26', // OKX Wallet
          '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
          'ef333840daf915aafdc4a004525502d6d49d77ff7e6547429c7c44892c152e98', // Ledger Live
          '19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927', // Infinity Wallet
          'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Cobo Wallet
          '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Klever
        ],
        explorerExcludedWalletIds: undefined, // Can add wallet IDs to exclude
      },
    });

    const ledgerAdapter = new LedgerAdapter({
      accountNumber: 0, // Account number to use
      confirmationsNumber: 1 // Number of confirmations for transactions
    });

    console.log('Ledger adapter initialized:', ledgerAdapter);
    
    const tronLinkAdapter = new TronLinkAdapter();
    console.log('TronLink adapter initialized:', tronLinkAdapter);

    return [tronLinkAdapter, walletConnectAdapter, ledgerAdapter];
  }, []);

  const onError = (e) => {
    console.error('Wallet error:', e);
    if (e instanceof WalletNotFoundError) {
      toast.error('Wallet not found');
    } else if (e instanceof WalletDisconnectedError) {
      toast.error('Wallet disconnected');
    } else {
      toast.error(e.message);
    }
  };

  return (
    <>
      <WalletProvider 
        autoConnect={false}
        onError={onError} 
        adapters={adapters}
        disableAutoConnectOnLoad={true}
      >
        <AppContent />
        <Toaster position="top-right" />
      </WalletProvider>
    </>
  );
}
