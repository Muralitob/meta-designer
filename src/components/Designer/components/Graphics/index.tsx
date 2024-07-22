import { useCallback } from 'react';
import { graphicMenuItem } from '../..';
import './index.less';
interface GraphicProps {
  graphicMenu: graphicMenuItem[]
}
const Icons = ({ graphicMenu }: GraphicProps) => {
  const onDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, data: any) => {
    e.dataTransfer?.setData('Meta2d', JSON.stringify(data));
  }, []);

  return (
    <div className="aside">
      <div className="graphics">
        {graphicMenu.map((group) => {
          return (
            <div>
              <div className="title">{group.name}</div>
              <div className="group-list">
                {group.list.map((item) => {
                  return (
                    <div
                      className="graphic"
                      draggable
                      onDragStart={(e) => onDragStart(e, item.data)}
                    >
                      <img src={item.icon} alt="" />
                      <span>{item.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Icons;
