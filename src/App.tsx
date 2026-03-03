/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { UploadScreen } from './components/UploadScreen';
import { WrappedPlayer } from './components/WrappedPlayer';
import { GradeData, WrappedStat, WrappedMode } from './types';
import { generateStats } from './utils/statsGenerator';
import { MOCK_GRADES } from './data/mockData';

export default function App() {
  const [stats, setStats] = useState<WrappedStat[] | null>(null);

  const handleDataLoaded = (data: GradeData, mode: WrappedMode) => {
    const generatedStats = generateStats(data, mode);
    setStats(generatedStats);
  };

  const handleUseDemo = (mode: WrappedMode) => {
    const generatedStats = generateStats(MOCK_GRADES, mode);
    setStats(generatedStats);
  };

  return (
    <div className="w-full min-h-screen bg-black">
      {!stats ? (
        <UploadScreen onDataLoaded={handleDataLoaded} onUseDemo={handleUseDemo} />
      ) : (
        <WrappedPlayer stats={stats} onClose={() => setStats(null)} />
      )}
    </div>
  );
}
