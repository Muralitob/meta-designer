import { useSelections } from '@/store/selection';
import { Meta2d, Pen } from '@meta2d/core';
import { message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { DeviceRect, linkItemAnchors, nonAnchors } from '../../graphs/CustomRect';
import Menu from '../Menu';
interface IProps {
  onUpdate?: () => void
  onLoad?: () => void
  onActivePen?: () => void
}

export default ({ onLoad, onActivePen, onUpdate }: IProps) => {
  const select = useSelections((state) => state.select);
  const anchorStart = useRef('');
  const [actived, setActived] = useState<Pen[]>([{}]);
  const [undoStatus, setUndoStatus] = useState(false);
  const cacheActivedRef = useRef<Pen[]>([]);
  useEffect(() => {
    const meta2d = new Meta2d('meta2d', {
      rule: true,
    });
    window.meta2d = meta2d;
    meta2d.register({ deviceRect: DeviceRect });
    meta2d.registerAnchors({ deviceRect: linkItemAnchors });
    meta2d.registerAnchors({ rectangle: nonAnchors });
    meta2d.on('active', active);
    meta2d.on('inactive', inactive);
    const showContextMenu = (e) => { };
    const hideContextMenu = () => { };
    // 右键菜单
    meta2d.on('contextmenu', showContextMenu);
    // 点击画布
    meta2d.on('click', hideContextMenu);
    meta2d.on('undo', () => {
      setUndoStatus(true);
    });
    meta2d.on('redo', () => {
      setUndoStatus(false);
    });
    if(onUpdate) {
      meta2d.on('update', onUpdate)
    }
    meta2d.on('connectLine', (obj) => {
      setTimeout(() => {
        if (anchorStart.current == '') {
          anchorStart.current = obj.pen.itemType;
        } else {
          if (anchorStart.current == obj.pen.itemType) {
            anchorStart.current = '';
            message.warning('只有门和墙之间可以连接');
            meta2d.delete([obj.line]);
          } else {
            anchorStart.current = '';
          }
        }
      });
    });

    onLoad && onLoad()

  }, []);

  const active = (pens?: Pen[]) => {
    if (pens && pens.length == 1) {
      window.meta2d.setValue({
        id: pens[0]?.id,
        lineWidth: 5,
      });
      onActivePen && onActivePen()
    }
    setActived(pens!);
    cacheActivedRef.current = pens;
    select(pens);
  };

  const inactive = () => {
    if (cacheActivedRef.current.length == 1) {
      window.meta2d.setValue({
        id: cacheActivedRef.current[0]?.id,
        lineWidth: 1,
      });
    }
    setActived([]);
    select();
  };

  return (
    <Menu actived={actived} undoStatus={undoStatus} setActived={setActived}>
      <div className="main">
        <div className="meta2d" id="meta2d"></div>
      </div>
    </Menu>
  );
};
