/* eslint-disable jsx-a11y/accessible-emoji */

import { encode, decode } from '@ethersproject/base64';
import { Button, Divider, List, Input } from 'antd';
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { Contract, ethers } from 'ethers';
import React, { useState } from 'react';
import { encrypt, EthEncryptedData } from 'eth-sig-util';
import { FC } from 'react';
import { Address } from '~~/components/common';

interface IExampleUIProps {
  userProvider: JsonRpcProvider | Web3Provider | undefined;
  purpose: string;
  setPurposeEvents: any;
  setPublicKeyEvents: any;
  setSecretEvents: any;
  address: string;
  mainnetProvider: any;
  localProvider: any;
  yourLocalBalance: any;
  price: any;
  tx: any;
  readContracts: Record<string, Contract>;
  writeContracts: Record<string, Contract>;
}

function stringifiableToHex(value: EthEncryptedData): string {
  return ethers.utils.hexlify(Buffer.from(JSON.stringify(value)));
}

export const ExampleUI: FC<IExampleUIProps> = (props) => {
  const { setPublicKeyEvents, setSecretEvents, address, mainnetProvider, tx, readContracts, writeContracts } = props;
  const [newSecret, setNewSecret] = useState('loading...');
  const [granteeAddr, setGranteeAddr] = useState(address || '0x00');

  return (
    <div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      <div style={{ border: '1px solid #cccccc', padding: 16, width: 400, margin: 'auto', marginTop: 64 }}>
        <h2>Fidelius:</h2>
        Your address:
        <Address address={address} ensProvider={mainnetProvider} fontSize={16} />
        <br />
        <Divider />
        <div style={{ margin: 8 }}>
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              const publicKey = await window.ethereum
                .request({
                  method: 'eth_getEncryptionPublicKey',
                  params: [address],
                })
                .then((base64: string) => decode(base64));
              tx(writeContracts.YourContract.register(publicKey), (update: any) => {
                console.log('📡 Transaction Update:', update);
                if (update && (update.status === 'confirmed' || update.status === 1)) {
                  console.log(' 🍾 Transaction ' + update.hash + ' finished!');
                  console.log(
                    ' ⛽️ ' +
                      update.gasUsed +
                      '/' +
                      (update.gasLimit || update.gas) +
                      ' @ ' +
                      parseFloat(update.gasPrice) / 1000000000 +
                      ' gwei'
                  );
                }
              });
            }}>
            Publish public key!
          </Button>
        </div>
        <Divider />
        Your Address:
        <Address address={address} ensProvider={mainnetProvider} fontSize={16} />
        <Divider />
        ENS Address Example:
        <Address
          address="0x34aA3F359A9D614239015126635CE7732c18fDF3" /* this will show as austingriffith.eth */
          ensProvider={mainnetProvider}
          fontSize={16}
        />
        <Divider />
        <h3>Tell secret</h3>
        Secret
        <Input
          onChange={(e) => {
            setNewSecret(e.target.value);
          }}
        />
        Address
        <Input
          onChange={(e) => {
            setGranteeAddr(e.target.value);
          }}
        />
        <Button
          style={{ marginTop: 8 }}
          onClick={async () => {
            const key = setPublicKeyEvents.find((e: any) => e.sender === granteeAddr).pubkey;
            const ciphertext = stringifiableToHex(
              encrypt(encode(key), { data: newSecret }, 'x25519-xsalsa20-poly1305')
            );
            tx(writeContracts.YourContract.addNewSecret(ciphertext, granteeAddr));
          }}>
          Add
        </Button>
      </div>
      <div style={{ width: 600, margin: 'auto', marginTop: 32, paddingBottom: 32 }}>
        <h2>Public keys:</h2>
        <List
          bordered
          dataSource={setPublicKeyEvents}
          renderItem={(item: any) => {
            return (
              <List.Item key={item.blockNumber + '_' + item.sender + '_' + item.purpose}>
                <Address address={item[0]} ensProvider={mainnetProvider} fontSize={16} /> =
                <Address address={item[1]} fontSize={16} />
              </List.Item>
            );
          }}
        />
      </div>
      <div style={{ width: 600, margin: 'auto', marginTop: 32, paddingBottom: 32 }}>
        <h2>Secrets:</h2>
        <List
          bordered
          dataSource={setSecretEvents}
          renderItem={(item: any) => {
            return (
              <List.Item key={item.blockNumber + '_' + item.sender + '_' + item.ciphertext}>
                {'Sent by '} <Address address={item.sender} fontSize={16} /> {' to '}{' '}
                {item.sender !== item.grantee ? <Address address={item.grantee} fontSize={16} /> : 'herself'}{' '}
                {item.grantee === address && (
                  <Button
                    onClick={async () => {
                      await window.ethereum.request({
                        method: 'eth_decrypt',
                        params: [item.ciphertext, window.ethereum.selectedAddress],
                      });
                    }}>
                    Decrypt
                  </Button>
                )}
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
};
