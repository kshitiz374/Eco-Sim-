import React from 'react';
import { useStore } from './store/useStore';
import Wizard from './components/Wizard';
import Dashboard from './components/Dashboard';

function App() {
  const { step } = useStore();

  return (
    <>
      {step === 1 ? <Wizard /> : <Dashboard />}
    </>
  );
}

export default App;
