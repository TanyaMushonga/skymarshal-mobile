import { create } from 'zustand';
import type { Patrol, Drone } from '@/types/api';

export interface PatrolState {
  activePatrol: Patrol | null;
  selectedDrone: Drone | null;
  patrolDuration: number;
  isPatrolling: boolean;

  // Actions
  setActivePatrol: (patrol: Patrol | null) => void;
  setSelectedDrone: (drone: Drone | null) => void;
  startPatrol: (patrol: Patrol) => void;
  endPatrol: () => void;
  updateDuration: (seconds: number) => void;
}

export const usePatrolStore = create<PatrolState>((set) => ({
  activePatrol: null,
  selectedDrone: null,
  patrolDuration: 0,
  isPatrolling: false,

  setActivePatrol: (patrol) => {
    set({
      activePatrol: patrol,
      isPatrolling: !!patrol && patrol.status === 'ACTIVE',
    });
  },

  setSelectedDrone: (drone) => {
    set({ selectedDrone: drone });
  },

  startPatrol: (patrol) => {
    set({
      activePatrol: patrol,
      isPatrolling: true,
      patrolDuration: 0,
    });
  },

  endPatrol: () => {
    set({
      activePatrol: null,
      selectedDrone: null,
      isPatrolling: false,
      patrolDuration: 0,
    });
  },

  updateDuration: (seconds) => {
    set({ patrolDuration: seconds });
  },
}));
