import { Pen } from '@meta2d/core';
import Graphics from './components/Graphics';
import Header from './components/Header';
import Props from './components/Props';
import View from './components/View';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import './index.less';
export interface MetaPen extends Pen {
  skinType?: 'custom' | 'preset' | 'color';
  skin?: string;
}

function App() {
  return (
    <div className="bg-white h-full">
      <Header />

      <div className="designer">
        <Graphics />
        <View />
        <Props />
      </div>
    </div>
  );
}

export default App;
