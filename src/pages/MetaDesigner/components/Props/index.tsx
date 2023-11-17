import { SelectionMode, useSelections } from '@/store/selection';
import { useEffect } from 'react';
import FileProps from './FileProps';
import './index.less';
import PenProps from './PenProps';

export default () => {
  const selections = useSelections((state) => state.selections);
  const select = useSelections((state) => state.select);
  useEffect(() => {
    return () => {
      select([]);
    };
  }, []);
  return (
    <div className="props f">
      {selections.mode === SelectionMode.File && <FileProps />}
      {selections.mode === SelectionMode.Pen && <PenProps />}
    </div>
  );
};
