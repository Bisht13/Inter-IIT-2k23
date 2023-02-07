import { ChangeEvent, FormEvent, FunctionComponent, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Result } from '../../components';
import { Tag, useInvokeMutation } from '../../api';
import { MANAGE_STATE_ACTUAL_ID } from './ManageState';

export const SendData: FunctionComponent = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [invokeSnap, { isLoading, data }] = useInvokeMutation();

  const handleChange =
    (fn: Dispatch<SetStateAction<string>>) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      fn(event.target.value);
    };


  const handleSubmit = () => {
    invokeSnap({
      snapId: MANAGE_STATE_ACTUAL_ID,
      method: 'storeTestData',
      tags: [Tag.TestState],
    });
  };

  const changeAllowance = () => {
    invokeSnap({
      snapId: MANAGE_STATE_ACTUAL_ID,
      method: 'changeAllowance',
      tags: [Tag.TestState],
    });
  };

  const handleRevoke = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("title : ", title)
    console.log("description : ", description)
    invokeSnap({
      snapId: MANAGE_STATE_ACTUAL_ID,
      method: 'revoke',
      params: [title, description],
      tags: [Tag.TestState],
    });
  };

  return (
    <>
      <Button type="submit" id="sendManageState" disabled={isLoading} onClick={changeAllowance}>
          Update List
      </Button>
      <hr></hr>
      <Form onSubmit={handleRevoke} className="mb-3">
        <Form.Group>
          <Form.Label>Token Address</Form.Label>
          <Form.Control
            type="text"
            placeholder="address"
            value={title}
            onChange={handleChange(setTitle)}
            id="msgTitle"
            className="mb-2"
          />

          <Form.Label>Spender Address</Form.Label>
          <Form.Control
            type="text"
            placeholder="Description"
            value={description}
            onChange={handleChange(setDescription)}
            id="msgDescription"
            className="mb-2"
          />
        </Form.Group>

        <Button type="submit" id="sendManageState" disabled={isLoading}>
            Revoke
        </Button>
      </Form>

      <Result className="mb-3">
        <span id="sendManageStateResult">{JSON.stringify(data, null, 2)}</span>
      </Result>
    </>
  );
};
