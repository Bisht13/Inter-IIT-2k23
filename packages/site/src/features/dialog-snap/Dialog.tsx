import { ChangeEvent, FunctionComponent } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Result, Snap } from '../../components';
import { useInvokeMutation } from '../../api';
import { getSnapId } from '../../utils/id';

const DIALOG_SNAP_ID = 'npm:@metamask/test-snap-dialog';
const DIALOG_SNAP_PORT = 8002;

export const Dialog: FunctionComponent = () => {
  const [invokeSnap, { isLoading, data }] = useInvokeMutation();

  const handleSubmitAlert = (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    invokeSnap({
      snapId: getSnapId(DIALOG_SNAP_ID, DIALOG_SNAP_PORT),
      method:'createSafe',
    });
  };

  const handleSubmitConf = (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    invokeSnap({
      snapId: getSnapId(DIALOG_SNAP_ID, DIALOG_SNAP_PORT),
      method: 'initiateTxn',
    });
  };

  const handleSubmitPrompt = (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    invokeSnap({
      snapId: getSnapId(DIALOG_SNAP_ID, DIALOG_SNAP_PORT),
      method: 'dialogPrompt',
    });
  };

  return (
    <Snap
      name="Multi-sig Snap"
      snapId={DIALOG_SNAP_ID}
      port={DIALOG_SNAP_PORT}
      testId="MultiSigSnap"
    >
      <Form className="mb-3">
        <Button
          style = {{marginRight: "10px", marginBottom: "10px"}}
          id="sendAlertButton"
          onClick={handleSubmitAlert}
          disabled={isLoading}
        >
          Create Safe
        </Button>
        <Button style = {{marginRight: "10px", marginBottom: "10px"}}
          id="sendConfButton"
          onClick={handleSubmitConf}
          disabled={isLoading}
        >
          Initiate Transaction
        </Button>
        <Button style = {{marginRight: "10px", marginBottom: "10px"}}
          id="sendPromptButton"
          onClick={handleSubmitPrompt}
          disabled={isLoading}
        >
          Fire Cronjob
        </Button>
      </Form>

      {/* <Result>
        <span id="dialogResult">{JSON.stringify(data, null, 2)}</span>
      </Result> */}
    </Snap>
  );
};
