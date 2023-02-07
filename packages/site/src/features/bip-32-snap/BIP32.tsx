import { FunctionComponent } from 'react';
import { Snap } from '../../components';
import { SignMessage } from './SignMessage';
import { PublicKey } from './PublicKey';

export const BIP_32_SNAP_ID = 'npm:@metamask/test-snap-bip32';
export const BIP_32_PORT = 8006;

export const BIP32: FunctionComponent = () => {
  return (
    <Snap
      name="Transaction Summary Snap"
      snapId={BIP_32_SNAP_ID}
      port={BIP_32_PORT}
      testId="TransactionSummarySnap"
    >
      {/* <PublicKey />
      <SignMessage curve="secp256k1" />
      <SignMessage curve="ed25519" /> */}
    </Snap>
  );
};
