import { useMetaStore } from '@/store/meta';
import { useSelections } from '@/store/selection';
import { Meta2d, Meta2dData, Pen } from '@meta2d/core';
import { message } from 'antd';
import { isObject } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { DeviceRect, linkItemAnchors, nonAnchors } from '../../utils/CustomRect';
import Menu from '../Menu';
interface IProps {
  roomId?: string;
}
export default ({ roomId }: IProps) => {
  const select = useSelections((state) => state.select);
  const selections = useSelections((state) => state.selections);
  const anchorStart = useRef('');
  const [actived, setActived] = useState<Pen[]>([{}]);
  const [undoStatus, setUndoStatus] = useState(false);
  const [data, setData] = useState<Meta2dData | null>(null);
  const cacheActivedRef = useRef<Pen[]>([]);
  const setSkin = useMetaStore((state) => state.setSkin);
  useEffect(() => {
    const meta2d = new Meta2d('meta2d', {
      rule: true,
    });
    meta2d.register({ deviceRect: DeviceRect });
    meta2d.registerAnchors({ deviceRect: linkItemAnchors });
    meta2d.registerAnchors({ rectangle: nonAnchors });
    meta2d.on('active', active);
    meta2d.on('inactive', inactive);
    meta2d.on('undo', () => {
      setUndoStatus(true);
    });
    meta2d.on('redo', () => {
      setUndoStatus(false);
    });
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
    const data = localStorage.getItem('metaData')
    if(data) {
      meta2d.open(JSON.parse(data))
    }
    window.meta2d = meta2d;
  }, []);

  useEffect(() => {
    if (window.meta2d && isObject(data) && data) {
      window.meta2d.open(data);
    }
  }, [data, window.meta2d]);
  const active = (pens?: Pen[]) => {
    setActived(pens!);
    cacheActivedRef.current = pens;
    select(pens);
  };
  async function getCabinetSkinList(itemType: string) {
    let { data } = await MachineRoomAPI.getCabinetSkinList({
      itemType,
    });
    setSkin(itemType, data.result);
  }
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
