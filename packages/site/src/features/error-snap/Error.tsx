import {
  ChangeEvent,
  Dispatch,
  FunctionComponent,
  SetStateAction,
  useState,
} from 'react';
import { Button, Form } from 'react-bootstrap';
import { ethers } from 'ethers';
import { Result, Snap } from '../../components';
import { useInvokeMutation } from '../../api';
import { getSnapId } from '../../utils/id';

const ERROR_SNAP_ID = 'npm:@metamask/test-snap-confirm';
const ERROR_SNAP_PORT = 8001;

export const ErrorSnap: FunctionComponent = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [textAreaContent, setTextAreaContent] = useState('');
  const [invokeSnap, { isLoading, data }] = useInvokeMutation();

  // const provider = new ethers.providers.Web3Provider(window.ethereum as any);
  // await provider.send('eth_requestAccounts', []);
  // const owner: ethers.providers.JsonRpcSigner = provider.getSigner();

  // const handleChange =
  //   (fn: Dispatch<SetStateAction<string>>) =>
  //   (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  //     fn(event.target.value);
  //   };

  const handleSubmit = () => {
    invokeSnap({
      snapId: getSnapId(ERROR_SNAP_ID, ERROR_SNAP_PORT),
      method: 'swap',
    });
  };

  const handleSend = () => {
    invokeSnap({
      snapId: getSnapId(ERROR_SNAP_ID, ERROR_SNAP_PORT),
      method: 'batchSend',
    });
  };

  const handleCreate = () => {
    invokeSnap({
      snapId: getSnapId(ERROR_SNAP_ID, ERROR_SNAP_PORT),
      method: 'create',
      // params: [owner as ethers.providers.JsonRpcSigner],
    });
  };

  const handleANS = () => {
    invokeSnap({
      snapId: getSnapId(ERROR_SNAP_ID, ERROR_SNAP_PORT),
      method: 'batchAave',
      // params: [owner as ethers.providers.JsonRpcSigner],
    });
  };

  return (
    <Snap
      name="Smart Contract Account Snap"
      snapId={ERROR_SNAP_ID}
      port={ERROR_SNAP_PORT}
      testId="smartContractAccountSnap"
    >
      {/* <Form onSubmit={handleSubmit} className="mb-3">
        <Form.Group>
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            placeholder="Title"
            value={title}
            onChange={handleChange(setTitle)}
            id="msgTitle"
            className="mb-2"
          />

          <Form.Label>Description</Form.Label>
          <Form.Control
            type="text"
            placeholder="Description"
            value={description}
            onChange={handleChange(setDescription)}
            id="msgDescription"
            className="mb-2"
          />

          <Form.Label>Textarea Content</Form.Label>
          <Form.Control
            type="text"
            placeholder="Textarea Content"
            value={textAreaContent}
            onChange={handleChange(setTextAreaContent)}
            id="msgTextarea"
            className="mb-3"
          />
        </Form.Group> */}
      <Button
        style={{ marginRight: '10px', marginBottom: "10px" }}
        type="submit"
        id="sendConfirmButton"
        disabled={isLoading}
        onClick={handleCreate}
      >
        Create SCA
      </Button>
      <Button
      style={{ marginRight: '10px' , marginBottom: "10px"}}
        type="submit"
        id="sendConfirmButton"
        disabled={isLoading}
        onClick={handleSubmit}
      >
        Swap Tokens
      </Button>
      <Button style={{marginBottom: "10px"}}
        type="submit"
        id="sendConfirmButton"
        disabled={isLoading}
        onClick={handleSend}
      >
        Batch Send
      </Button>

      {/* <Result>
        <span id="confirmResult">{JSON.stringify(data, null, 2)}</span>
      </Result> */}
    </Snap>
  );
};