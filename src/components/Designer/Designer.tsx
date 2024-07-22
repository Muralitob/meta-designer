import { Meta2dData, Pen } from '@meta2d/core';
import Graphics, { graphicMenuItem } from './components/Graphics';
import Header from './components/Header';
import Props from './components/Props';
import View from './components/View';
import './index.less';
import React, { useEffect, useState } from 'react';
export interface MetaPen extends Pen {
  skinType?: 'custom' | 'preset' | 'color';
  skin?: string;
}

type IDType = string | null;

interface DesignerProps {
  graphicMenu: graphicMenuItem[]
  renderPenProps?: () => React.ReactElement
  renderFileProps?: () => React.ReactElement
  handleSave?: (data: Meta2dData) => void
  onUpdate?: () => void
  onLoad?: () => void
  onActivePen?: () => void
}
function Designer({ graphicMenu, renderPenProps, renderFileProps, handleSave, onLoad, onUpdate, onActivePen }: DesignerProps) {
  const [renderPropsList, setRenderPropsList] = useState<Record<string, any>>({})
  useEffect(() => {
    let _renderPropsList = {

    }
    graphicMenu.map(group => {
      group.list.map((item) => {
        if (item.renderProps) {
          _renderPropsList[item.data.itemType] = item.renderProps
        }
      })
    })
    setRenderPropsList(_renderPropsList)
  }, [graphicMenu])

  return (
    <div className="bg-white h-full">
      <Header handleSave={handleSave} />
      <div className="designer">
        <Graphics graphicMenu={graphicMenu} />
        <View onLoad={onLoad} onUpdate={onUpdate} onActivePen={onActivePen} />
        <Props renderFileProps={renderFileProps} renderPenProps={renderPenProps} renderPropsList={renderPropsList} />
      </div>
    </div>
  );
}

export { Designer }
