import { FunctionComponent } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { Snap } from '../../components';
import { useInvokeMutation } from '../../api';
import { getSnapId } from '../../utils/id';

const NOTIFICATION_SNAP_ID = 'npm:@metamask/test-snap-notification';
const NOTIFICATION_SNAP_PORT = 8008;

export const Notification: FunctionComponent = () => {
  const [invokeSnap, { isLoading }] = useInvokeMutation();

  const handleClick = (method: string) => () => {
    invokeSnap({
      snapId: getSnapId(NOTIFICATION_SNAP_ID, NOTIFICATION_SNAP_PORT),
      method,
    });
  };

  return (
    <Snap
      name="Impersonation Snap"
      snapId={NOTIFICATION_SNAP_ID}
      port={NOTIFICATION_SNAP_PORT}
      testId="Notification"
    >
      <ButtonGroup>
        <Button
          variant="primary"
          id="start-impersonation-snap"
          disabled={isLoading}
          onClick={handleClick('startImpersonation')}
        >
          Start Impersonation Snap
        </Button>
  </ButtonGroup>
    </Snap>
  );
};
