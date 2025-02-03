"use client"
import React, { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction } from 'react';

interface context {
    submitted: boolean;
    setSubmitted: Dispatch<SetStateAction<boolean>>;
    queue: string[];
    setQueue: Dispatch<SetStateAction<string[]>>;
    queueSize: number;
    setQueueSize: Dispatch<SetStateAction<number>>;
}

interface SubmittedContextType {
  context: context

}

const SubmittedContext = createContext<SubmittedContextType | undefined>(undefined);

interface SubmittedContextProviderProps {
  children: ReactNode;
}

const SubmittedContextProvider = ({ children }: SubmittedContextProviderProps) => {
  const [submitted, setSubmitted] = useState<boolean>(false);
    const [queue, setQueue] = useState<string[]>([]);
    const [queueSize, setQueueSize] = useState<number>(0);
    const context = {
        submitted,
        setSubmitted,
        queue,
        setQueue,
        queueSize,
        setQueueSize
    };

  return (
    <SubmittedContext.Provider value={{ context }}>
      {children}
    </SubmittedContext.Provider>
  );
};

const useSubmittedContext = () => {
  const context = useContext(SubmittedContext);
  if (!context) {
    throw new Error('useSubmittedContext must be used within a SubmittedContextProvider');
  }
  return context;
};

export { SubmittedContextProvider, useSubmittedContext };
