import { Pen } from '@meta2d/core';
import { Dropdown, DropDownProps, MenuProps } from 'antd';
import { ItemType } from 'rc-menu/lib/interface';
import { PropsWithChildren, useMemo } from 'react';

interface MetaMenuProps extends PropsWithChildren<DropDownProps> {
  actived: Pen[];
  setActived: (p: Pen[]) => void;
  undoStatus: boolean;
}

function MetaMenu(props: MetaMenuProps) {
  const { undoStatus, actived, setActived, ...restProps } = props;
  const renderMenus = useMemo(() => {
    let items: MenuProps['items'] = [
      {
        label: `置顶`,
        key: 'top',
        disabled: !!!actived.length,
      },
      {
        label: `置底`,
        key: 'bottom',
        disabled: !!!actived.length,
      },
      {
        type: 'divider',
      },
    ];
    //锁定解锁

    let lockItem: ItemType = {
      label: '',
      key: '',
    };
    if (actived.length == 1) {
      if (actived[0].locked == 2) {
        lockItem = {
          label: '解锁',
          key: 'unlock',
        };
      } else {
        lockItem = {
          label: '锁定',
          key: 'lock',
        };
      }
    } else {
      lockItem = {
        label: '锁定',
        key: 'lock',
      };
    }
    lockItem.disabled = !!!actived.length;
    items.push(lockItem);
    //添加操作菜单项
    items = [
      ...items,
      {
        type: 'divider',
      },
      {
        label: '删除',
        key: 'delete',
      },
      {
        type: 'divider',
      },
      {
        label: (
          <div className="flex justify-between">
            <span>撤销</span>
            <span>Ctrl + Z</span>
          </div>
        ),
        key: 'undo',
      },
      {
        label: (
          <div className="flex justify-between">
            <span>重做</span>
            <span>Shift + X</span>
          </div>
        ),
        key: 'redo',
        disabled: !undoStatus,
      },
      {
        type: 'divider',
      },
      {
        label: (
          <div className="flex justify-between">
            <span>剪切</span>
            <span>Ctrl + X</span>
          </div>
        ),
        key: 'cut',
        disabled: !!!actived.length,
      },
      {
        label: (
          <div className="flex justify-between">
            <span>复制</span>
            <span>Ctrl + C</span>
          </div>
        ),
        key: 'copy',
        disabled: !!!actived.length,
      },
      {
        label: (
          <div className="flex justify-between">
            <span>粘贴</span>
            <span>Ctrl + V</span>
          </div>
        ),
        key: 'paste',
      },
    ];
    return items;
  }, [props.actived, props.undoStatus]);
  const onClick: MenuProps['onClick'] = ({ key }) => {
    const meta2d = window.meta2d;
    console.log('keykeykey', key, actived);
    if (key == 'delete') {
      if (actived && actived[0].connectedLines) {
        const lines: Pen[] = actived[0].connectedLines.map((line) => {
          return meta2d.findOne(line.lineId)!;
        });
        meta2d.delete(lines);
      }
      meta2d.delete(actived);
    }
    if (key == 'lock') {
      const _actived = actived.map((item) => {
        meta2d.setValue({
          id: item.id,
          locked: 2,
        });
        item.locked = 2;
        return item;
      });
      setActived(_actived);
    }
    if (key == 'unlock') {
      const _actived = actived.map((item) => {
        meta2d.setValue({
          id: item.id,
          locked: 0,
        });
        item.locked = 0;
        return item;
      });
      setActived(_actived);
    }
    switch (key) {
      case 'undo':
        meta2d.undo();
        break;
      case 'redo':
        meta2d.redo();
        break;
      case 'copy':
        meta2d.copy(actived);
        break;
      case 'paste':
        meta2d.paste();
        break;
      case 'cut':
        meta2d.cut(actived);
        break;
      case 'top':
        meta2d.top(actived[0]);
        meta2d.render();
        break;
      case 'bottom':
        meta2d.bottom(actived[0]);
        meta2d.render();
        break;
      case 'delete':
        meta2d.delete(actived);
        meta2d.render();
        break;
      default:
        break;
    }
  };

  return (
    <Dropdown
      overlayStyle={{
        width: 120,
      }}
      menu={{ items: renderMenus, onClick }}
      trigger={['contextMenu']}
      {...restProps}
    ></Dropdown>
  );
}

export default MetaMenu;
