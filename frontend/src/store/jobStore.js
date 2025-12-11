import { create } from 'zustand';

export const useJobStore = create((set, get) => ({
  jobs: [],
  selectedJob: null,
  isLoading: false,
  error: null,
  
  setJobs: (jobs) => set({ jobs }),
  addJob: (job) => set((state) => ({ jobs: [job, ...state.jobs] })),
  updateJob: (jobId, updates) => set((state) => ({
    jobs: state.jobs.map(job => 
      job.id === jobId ? { ...job, ...updates } : job
    )
  })),
  setSelectedJob: (job) => set({ selectedJob: job }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  getJobById: (jobId) => {
    return get().jobs.find(job => job.id === jobId);
  },
  
  clearError: () => set({ error: null })
}));