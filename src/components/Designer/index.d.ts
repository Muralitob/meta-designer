import { Pen } from '@meta2d/core';
export interface graphicMenuItem {
  name: string;
  show: boolean,
  list: graphicItem[]
}

export interface graphicData extends Pen {
  width?: number;
  height?: number;
  /**类别 */
  itemType?: string;
  name?: string;
  //在画布上显示的图案
  image?: any;
}
export interface graphicItem {
  data: graphicData
  name?: string;
  icon?: string;
  id?: string;
  renderProps?: (changeValue: (key: string, value: any) => void, pen: any) => React.ReactElement
}

