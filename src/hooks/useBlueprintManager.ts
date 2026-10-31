/**
 * Custom React hook managing the multi-event portfolio, active blueprint,
 * budget rebalancing, milestone task completion, and event synthesis.
 */

import { useState, useMemo, useCallback } from 'react';
import type { EventBlueprint, EventConstraints, BudgetBreakdown } from '../types/blueprint.ts';
import {
  PRESET_BLUEPRINTS,
  generateAlgorithmicBlueprint,
} from '../utils/blueprintEngine.ts';

export interface UseBlueprintManagerOptions {
  initialPresetId?: string | null;
}

export interface UseBlueprintManagerReturn {
  portfolioMap: Record<string, EventBlueprint>;
  portfolioList: EventBlueprint[];
  activeBlueprint: EventBlueprint;
  activePresetId: string | null;
  isLoadingAI: boolean;
  generationSource: string;
  toastMessage: string | null;
  selectBlueprint: (id: string) => void;
  createBlueprint: (constraints: EventConstraints, useAI: boolean) => Promise<void>;
  updateBudget: (updated: BudgetBreakdown) => void;
  toggleTask: (phaseId: string, taskId: string) => void;
  addTaskToMilestones: (task: EventBlueprint['milestones'][0]['tasks'][0]) => void;
  addInteractiveElement: (element: EventBlueprint['creativeConcept']['interactiveElements'][0]) => void;
  resetToDefault: () => void;
  showToast: (message: string) => void;
  clearToast: () => void;
}

export function useBlueprintManager({
  initialPresetId,
}: UseBlueprintManagerOptions = {}): UseBlueprintManagerReturn {
  const [portfolioMap, setPortfolioMap] = useState<Record<string, EventBlueprint>>(() => ({
    'preset-fusion-wedding': structuredClone(PRESET_BLUEPRINTS['preset-fusion-wedding']),
    'preset-30th-birthday': structuredClone(PRESET_BLUEPRINTS['preset-30th-birthday']),
    'preset-tech-gala': structuredClone(PRESET_BLUEPRINTS['preset-tech-gala']),
  }));

  const defaultId =
    initialPresetId && PRESET_BLUEPRINTS[initialPresetId]
      ? initialPresetId
      : 'preset-fusion-wedding';

  const [activePresetId, setActivePresetId] = useState<string | null>(defaultId);
  const [activeBlueprint, setActiveBlueprint] = useState<EventBlueprint>(
    () => portfolioMap[defaultId] || PRESET_BLUEPRINTS['preset-fusion-wedding']
  );

  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  const [generationSource, setGenerationSource] = useState<string>('preset');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const portfolioList = useMemo(() => Object.values(portfolioMap), [portfolioMap]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  }, []);

  const clearToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  const selectBlueprint = useCallback(
    (id: string) => {
      const selected = portfolioMap[id] || PRESET_BLUEPRINTS[id];
      if (selected) {
        setActiveBlueprint(selected);
        setActivePresetId(id);
        setGenerationSource('preset');
        showToast(`Switched to ${selected.constraints.eventName || selected.constraints.eventType}`);
      }
    },
    [portfolioMap, showToast]
  );

  const createBlueprint = useCallback(
    async (constraints: EventConstraints, useAI: boolean) => {
      if (useAI) {
        setIsLoadingAI(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000);

        try {
          const res = await fetch('/api/generate-blueprint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(constraints),
            signal: controller.signal,
          });

          if (res.ok) {
            const data = await res.json();
            if (data.blueprint) {
              const createdBp: EventBlueprint = data.blueprint;
              setActiveBlueprint(createdBp);
              setPortfolioMap((prev) => ({
                ...prev,
                [createdBp.constraints.id]: createdBp,
              }));
              setActivePresetId(createdBp.constraints.id);
              setGenerationSource(data.source || 'gemini-3.8-flash');
              showToast('AI synthesized a complete, execution-ready blueprint!');
              return;
            }
          }
        } catch (err) {
          console.error('Server-side AI synthesis timeout or error, utilizing algorithmic engine:', err);
        } finally {
          clearTimeout(timeoutId);
          setIsLoadingAI(false);
        }
      }

      // Algorithmic dynamic fallback
      const generated = generateAlgorithmicBlueprint(constraints);
      setActiveBlueprint(generated);
      setPortfolioMap((prev) => ({
        ...prev,
        [generated.constraints.id]: generated,
      }));
      setActivePresetId(generated.constraints.id);
      setGenerationSource('algorithmic-dynamic');
      showToast('Created event blueprint with forensic algorithmic engine!');
    },
    [showToast]
  );

  const updateBudget = useCallback((updated: BudgetBreakdown) => {
    setActiveBlueprint((prev) => {
      const nextBp: EventBlueprint = {
        ...prev,
        budgetBreakdown: updated,
      };
      setPortfolioMap((map) => ({
        ...map,
        [nextBp.constraints.id]: nextBp,
      }));
      return nextBp;
    });
  }, []);

  const toggleTask = useCallback((phaseId: string, taskId: string) => {
    setActiveBlueprint((prev) => {
      const updatedMilestones = prev.milestones.map((phase) => {
        if (phase.id === phaseId) {
          return {
            ...phase,
            tasks: phase.tasks.map((task) => {
              if (task.id === taskId) {
                return { ...task, completed: !task.completed };
              }
              return task;
            }),
          };
        }
        return phase;
      });

      const nextBp: EventBlueprint = { ...prev, milestones: updatedMilestones };
      setPortfolioMap((map) => ({
        ...map,
        [nextBp.constraints.id]: nextBp,
      }));
      return nextBp;
    });
  }, []);

  const addTaskToMilestones = useCallback((task: EventBlueprint['milestones'][0]['tasks'][0]) => {
    setActiveBlueprint((prev) => {
      const updatedMilestones = [...prev.milestones];
      if (updatedMilestones[0]) {
        updatedMilestones[0] = {
          ...updatedMilestones[0],
          tasks: [task, ...updatedMilestones[0].tasks],
        };
      }
      const nextBp = { ...prev, milestones: updatedMilestones };
      setPortfolioMap((map) => ({ ...map, [nextBp.constraints.id]: nextBp }));
      return nextBp;
    });
  }, []);

  const addInteractiveElement = useCallback((element: EventBlueprint['creativeConcept']['interactiveElements'][0]) => {
    setActiveBlueprint((prev) => {
      const nextBp: EventBlueprint = {
        ...prev,
        creativeConcept: {
          ...prev.creativeConcept,
          interactiveElements: [...prev.creativeConcept.interactiveElements, element],
        },
      };
      setPortfolioMap((map) => ({ ...map, [nextBp.constraints.id]: nextBp }));
      return nextBp;
    });
  }, []);

  const resetToDefault = useCallback(() => {
    const defaultBp = PRESET_BLUEPRINTS['preset-fusion-wedding'];
    setActiveBlueprint(defaultBp);
    setActivePresetId('preset-fusion-wedding');
    showToast('Reset workspace canvas to default template');
  }, [showToast]);

  return {
    portfolioMap,
    portfolioList,
    activeBlueprint,
    activePresetId,
    isLoadingAI,
    generationSource,
    toastMessage,
    selectBlueprint,
    createBlueprint,
    updateBudget,
    toggleTask,
    addTaskToMilestones,
    addInteractiveElement,
    resetToDefault,
    showToast,
    clearToast,
  };
}
