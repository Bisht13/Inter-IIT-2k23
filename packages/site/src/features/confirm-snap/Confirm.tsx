import {
  ChangeEvent,
  Dispatch,
  FunctionComponent,
  SetStateAction,
  useState,
} from 'react';
import { Button, Form } from 'react-bootstrap';
import { Result, Snap } from '../../components';
import { useInvokeMutation } from '../../api';
import { getSnapId } from '../../utils/id';
import { ethers } from 'ethers';

const CONFIRM_SNAP_ID = 'npm:@metamask/test-snap-confirm';
const CONFIRM_SNAP_PORT = 8004;

export const Confirm: FunctionComponent = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [textAreaContent, setTextAreaContent] = useState('');
  const [invokeSnap, { isLoading, data }] = useInvokeMutation();

  const provider = new ethers.providers.Web3Provider(window.ethereum as any);
  // await provider.send('eth_requestAccounts', []);
  const owner: ethers.providers.JsonRpcSigner = provider.getSigner();

  // const handleChange =
  //   (fn: Dispatch<SetStateAction<string>>) =>
  //   (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  //     fn(event.target.value);
  //   };

  const handleSubmit = () => {
    invokeSnap({
      snapId: getSnapId(CONFIRM_SNAP_ID, CONFIRM_SNAP_PORT),
      method: 'confirm',
      params: [owner as any, description, textAreaContent],
    });
  };

  const handleCreate = () => {
    invokeSnap({
      snapId: getSnapId(CONFIRM_SNAP_ID, CONFIRM_SNAP_PORT),
      method: 'create',
      // params: [owner as ethers.providers.JsonRpcSigner],
    });
  };

  return (
    <Snap
      name="Staking Snap"
      snapId={CONFIRM_SNAP_ID}
      port={CONFIRM_SNAP_PORT}
      testId="StakingSnap"
    >
    </Snap>
  );
};
