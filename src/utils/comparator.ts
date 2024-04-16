import { Name } from '../authorization/authorization.type';

export const compareConfiguration = <T extends Name>(
  sourceConfigs: T[],
  targetConfigs: T[],
): T[] => {
  const missingElements: T[] = [];

  for (const sourceConfig of sourceConfigs) {
    const hasElement = containsName(
      sourceConfig.name,
      targetConfigs.map((config) => config.name),
    );

    if (!hasElement) {
      missingElements.push(sourceConfig);
    }
  }

  return missingElements;
};

const containsName = (sourceName: string, targetNames: string[]): boolean => {
  for (const targetDetail of targetNames) {
    if (sourceName == targetDetail) {
      return true;
    }
  }
  return false;
};

export const searchMatching = <T extends Name>(source: T, targets: T[]) => {
  for (const target of targets) {
    if (source.name == target.name) {
      return target;
    }
  }
  return undefined;
};
