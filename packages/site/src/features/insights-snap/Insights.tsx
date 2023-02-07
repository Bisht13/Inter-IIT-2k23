import { FunctionComponent } from 'react';
import { Button, Form, ButtonGroup } from 'react-bootstrap';
import { assert } from '@metamask/utils';
import { Snap, Result } from '../../components';
import { useInvokeMutation } from '../../api';
import { getSnapId } from '../../utils/id';
import { useLazyGetAccountsQuery, useLazyRequestQuery } from '../../api';

const INSIGHTS_SNAP_ID = 'npm:@metamask/test-snap-insights';
const INSIGHTS_SNAP_PORT = 8003;

export const Insights: FunctionComponent = () => {
  const [invokeSnap, { isLoading, data }] = useInvokeMutation();

  const handleSubmitAlert = (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    invokeSnap({
      snapId: getSnapId(INSIGHTS_SNAP_ID, INSIGHTS_SNAP_PORT),
      method: 'dialogAlert',
    });
  };

  const handleSubmitConf = (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    invokeSnap({
      snapId: getSnapId(INSIGHTS_SNAP_ID, INSIGHTS_SNAP_PORT),
      method: 'dialogConf',
    });
  };

  const handleSubmitPrompt = (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    invokeSnap({
      snapId: getSnapId(INSIGHTS_SNAP_ID, INSIGHTS_SNAP_PORT),
      method: 'dialogPrompt',
    });
  };

  return (
    <Snap
      name="2FA Snap"
      snapId={INSIGHTS_SNAP_ID}
      port={INSIGHTS_SNAP_PORT}
      testId="2FASnap"
    >
        <Button style={{marginRight: "10px"}}
          id="sendConfButton"
          onClick={handleSubmitConf}
          disabled={isLoading}
        >
          Setup 2FA
        </Button>
        <Button
          id="sendPromptButton"
          onClick={handleSubmitPrompt}
          disabled={isLoading}
        >
          Send Transaction
        </Button>

      {/* <Result>
        <span id="dialogResult">{JSON.stringify(data, null, 2)}</span>
      </Result> */}
    </Snap>
  );
};
