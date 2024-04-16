import { Stage } from './stage';
import { compareClients } from '../client/client.service';
import { Client } from '../client/client';

export const compareStages = async (source: Stage, target: Stage) => {
  for (const sourceClient of source.clients) {
    const targetClient = searchClient(sourceClient, target.clients);
    if (targetClient != undefined) {
      await compareClients(sourceClient, targetClient);
    }
  }
};

const searchClient = (sourceClient: Client, targetClients: Client[]) => {
  for (const targetClient of targetClients) {
    if (sourceClient.equals(targetClient)) {
      return targetClient;
    }
  }
  return undefined;
};
