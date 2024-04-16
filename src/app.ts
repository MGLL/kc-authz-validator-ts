import { StageManagerFactory } from './stage/stage.manager';
import { compareStages } from './stage/stage.service';

const main = async () => {
  const stageManager = StageManagerFactory.getStageManager('default');

  for (let i = 0; i < stageManager.getStages().length - 1; i++) {
    const sourceStage = stageManager.getStage(i);
    const targetStage = stageManager.getStage(i + 1);
    await compareStages(sourceStage, targetStage);
  }
};

main();
