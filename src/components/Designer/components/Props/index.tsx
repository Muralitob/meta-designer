import { SelectionMode, useSelections } from '@/store/selection';
import { useEffect } from 'react';
import FileProps from './FileProps';
import './index.less';
import PenProps from './PenProps';

interface IProps {
  renderPenProps?: () => React.ReactElement
  renderFileProps?: () => React.ReactElement
  renderPropsList?: Record<string, any>
}

export default ({ renderFileProps, renderPenProps, renderPropsList }: IProps) => {
  const selections = useSelections((state) => state.selections);
  const select = useSelections((state) => state.select);
  useEffect(() => {
    return () => {
      select([]);
    };
  }, []);
  return (
    <div className="props f">
      {selections.mode === SelectionMode.File && (renderFileProps ? renderFileProps() : <FileProps />)}
      {selections.mode === SelectionMode.Pen && (renderPenProps ? renderPenProps() : <PenProps renderPropsList={renderPropsList} />)}
    </div>
  );
};
