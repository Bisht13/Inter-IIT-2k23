import { FunctionComponent } from 'react';
import { Result, Snap } from '../../components';
import { Tag, useInvokeQuery } from '../../api';
import { getSnapId, useInstalled } from '../../utils';
import { SendData } from './SendData';
import { ClearData } from './ClearData';

export const MANAGE_STATE_ID = 'npm:@metamask/test-snap-managestate';
export const MANAGE_STATE_PORT = 8007;

export const MANAGE_STATE_ACTUAL_ID = getSnapId(
  MANAGE_STATE_ID,
  MANAGE_STATE_PORT,
);

export const ManageState: FunctionComponent = () => {
  const isInstalled = useInstalled(MANAGE_STATE_ACTUAL_ID);
  const { data: state } = useInvokeQuery(
    {
      snapId: MANAGE_STATE_ACTUAL_ID,
      method: 'retrieveTestData',
      tags: [Tag.TestState],
    },
    {
      skip: !isInstalled,
    },
  );

  const formatState = (state: any) => {
    console.log("state : ", state)
    let result = ``;
    for (let i = 0; i < state.length; i++) {
      let temp = `[${i}]: [ `;
      for (let j = 0; j < state[i].length; j++) {
        if(j === 0) {
          temp += state[i][j] + `: `;
        } else if(j === 1) {
        }
        else {
          temp += state[i][j] +  `, `;
        }
      }
      result += temp + ` ]\n`; 
    }
    return result;
  };

  return (
    <Snap
      name="Approval/Revoke Snap"
      snapId={MANAGE_STATE_ID}
      port={MANAGE_STATE_PORT}
      testId="ApprovalRevokeSnap"
    >
      <Result className="mb-3">
        <span id="retrieveManageStateResult">
          {
            state ? formatState(state.testState) : 'No data'
          }
        </span>
      </Result>

      <SendData />
      <ClearData />
    </Snap>
  );
};
