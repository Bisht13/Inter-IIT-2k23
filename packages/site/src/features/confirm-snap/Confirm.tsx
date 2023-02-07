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
  const [invokeSnap, { isLoading, data }] = useInvokeMutation();

  const handleCreate = () => {
    invokeSnap({
      snapId: getSnapId(CONFIRM_SNAP_ID, CONFIRM_SNAP_PORT),
      method: 'create',
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
