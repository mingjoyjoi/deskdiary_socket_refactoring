import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

export function createTokenWithChannel(appID: string, uuid: string): string {
  const HOUR_TO_SECOND = 3600;
  const appCertificate: string = process.env.AGORA_APP_CERTIFICATE ?? '';
  const expirationTimeInSeconds = HOUR_TO_SECOND * 24;
  const role = RtcRole.PUBLISHER;
  const channel = uuid;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const expirationTimestamp = currentTimestamp + expirationTimeInSeconds;

  return RtcTokenBuilder.buildTokenWithUid(
    appID,
    appCertificate,
    channel,
    0,
    role,
    expirationTimestamp,
  );
}
