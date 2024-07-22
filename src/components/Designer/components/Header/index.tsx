import {
  EyeOutlined,
  LeftOutlined,
  RightOutlined,
  SaveOutlined,
  ShrinkOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Divider, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import './index.less';
import { Meta2dData } from '@meta2d/core';
interface IProps {
  handleSave?: (data: Meta2dData) => void
}
export default ({ handleSave }: IProps) => {
  const [scale, setScale] = useState(0);
  const navigate = useNavigate()
  useEffect(() => {
    const timer = setInterval(() => {
      if (window.meta2d) {
        clearInterval(timer);
        // 获取初始缩放比例
        scaleSubscriber(window.meta2d.store.data.scale);
        // 监听缩放
        // @ts-ignore
        meta2d.on('scale', scaleSubscriber);
      }
    }, 200);
  }, []);
  const scaleSubscriber = (val: number) => {
    setScale(Math.round(val * 100));
  };
  const onRedo = () => {
    console.log('window.meta2d', window.meta2d.redo);
    window.meta2d.redo();
  };

  const onUndo = () => {
    window.meta2d.undo();
  };

  const onScaleDefault = () => {
    window.meta2d.scale(1);
    window.meta2d.centerView();
  };

  const onScaleWindow = () => {
    window.meta2d.fitView();
  };

  function onSave() {
    let data = window.meta2d.data();
    handleSave && handleSave(data)
  }

  function onView() {
    navigate('/room-show')
  }

  return (
    <div className="app-header">
      <Tooltip title="撤回">
        <LeftOutlined onClick={onUndo} />
      </Tooltip>
      <Tooltip title="重做">
        <RightOutlined onClick={onRedo} />
      </Tooltip>
      <Divider type="vertical" />
      <div className="px-4 leading-10 w-10">{scale}%</div>
      <Tooltip title="100%视图">
        <SyncOutlined onClick={onScaleDefault} />
      </Tooltip>
      <Tooltip title="窗口大小">
        <ShrinkOutlined onClick={onScaleWindow} />
      </Tooltip>
      <Divider type="vertical" />
      <Tooltip title="保存">
        <SaveOutlined onClick={onSave} />
      </Tooltip>
      <Tooltip title="预览">
        <EyeOutlined onClick={onView} />
      </Tooltip>
    </div>
  );
};
