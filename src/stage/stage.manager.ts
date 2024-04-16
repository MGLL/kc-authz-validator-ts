import { Stage } from './stage';
import { StageManager } from './stage.type';
import * as config from '../config/config.json';

export class StageManagerFactory {
  public static getStageManager(type: string): StageManager {
    switch (type.toLowerCase()) {
      case 'default':
        return DefaultStageManager.getInstance();
      default:
        throw new Error(`Unknown StageManager type: ${type}`);
    }
  }
}

class DefaultStageManager implements StageManager {
  private static instance: DefaultStageManager;
  stages: Stage[] = [];
  currentStage = 0;

  private constructor() {
    for (const stage of config.stages) {
      this.stages.push(Stage.fromConfig(stage));
    }
  }

  public static getInstance(): DefaultStageManager {
    if (!this.instance) {
      this.instance = new DefaultStageManager();
    }
    return this.instance;
  }

  getStages = () => {
    return this.stages;
  };

  getStage = (i: number) => {
    return this.stages[i];
  };

  logStages = () => {
    for (const stage of this.stages) {
      console.log(stage);
    }
  };

  getCurrentStage = () => {
    return this.stages[this.currentStage];
  };

  setCurrentStage(stageLevel: number): void {
    this.currentStage = stageLevel;
  }

  nextStage(): void {
    this.currentStage++;
  }
}
