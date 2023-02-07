import { Button, ButtonGroup } from 'react-bootstrap';
import { FunctionComponent } from 'react';
import { Result } from '../../components';
import { useInvokeMutation } from '../../api';
import { getSnapId } from '../../utils';
import { BIP_32_PORT, BIP_32_SNAP_ID } from './BIP32';

export const PublicKey: FunctionComponent = () => {
  const [invokeSnap, { isLoading, data }] = useInvokeMutation();

  const handleClick =
    (method: string, params: Record<string, unknown>) => () => {
      invokeSnap({
        snapId: getSnapId(BIP_32_SNAP_ID, BIP_32_PORT),
        method,
        params,
      });
    };

  return (
    <>
      <ButtonGroup className="mb-3">
        <Button
          id="bip32GetPublic"
          onClick={handleClick('getPublicKey', {
            path: ['m', "44'", "0'"],
            curve: 'secp256k1',
            compressed: false,
          })}
          disabled={isLoading}
        >
          Get Public Key
        </Button>
        <Button
          variant="secondary"
          id="bip32GetCompressedPublic"
          onClick={handleClick('getPublicKey', {
            path: ['m', "44'", "0'"],
            curve: 'secp256k1',
            compressed: true,
          })}
          disabled={isLoading}
        >
          Get Compressed Public Key
        </Button>
        <Button
          variant="light"
          id="bip32SendInvalid"
          onClick={handleClick('getPublicKey', {
            path: ['m', "44'", "1'"],
            curve: 'secp256k1',
          })}
          disabled={isLoading}
        >
          Send Invalid
        </Button>
      </ButtonGroup>
      <Result className="mb-3">
        <span id="bip32PublicKeyResult">{JSON.stringify(data, null, 2)}</span>
      </Result>
    </>
  );
};
