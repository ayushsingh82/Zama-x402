'use client';

import { useEffect } from 'react';
// We'll handle SDK initialization in the component that needs it
// This ScriptLoader is now just a placeholder for future script loading if needed

export function ScriptLoader() {
  useEffect(() => {
    // This component is now a placeholder
    // The actual SDK initialization will be handled in ERC7984Demo component
    console.log('ScriptLoader component mounted');
  }, []);

  return null; // This component no longer loads external scripts
}
