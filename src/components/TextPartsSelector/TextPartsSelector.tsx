import React, { CSSProperties, useEffect, useRef, useState } from 'react';
import { useDidMountEffect } from '../../hooks';
import { ITargetData, TextSelectionHandlerProps } from '../../models';
import CONSTANTS from '../../CONSTANTS';
import '../../assets/css/textPartsSelector.scss';

const TextPartsSelector: React.FC<TextSelectionHandlerProps> = (
  props,
): React.ReactElement => {
  const {
    affectedContent,
    targetContent,
    multiple = false,
    disabled = false,
    style,
    className,
    setTargetContent,
  } = props;

  const [affectedData, setAffectedData] = useState<string>(affectedContent);
  const [targetData, setTargetData] = useState<ITargetData[]>(
    targetContent || [],
  );
  const [affectedTextNode, setAffectedTextNode] = useState<React.ReactNode>([]);
  const [selectionData, setSelectionData] = useState<{
    [key: string]: boolean | number | null | any;
  }>({
    isDragging: false,
    draggingHandle: null,
  });

  const [hoverQuote, setHoverQuote] = useState<any>({
    id: targetData?.[0]?.id,
    isHover: false,
  });

  const setTargetAreaStyle = (
    index: number,
    targetArea: any[] | undefined,
  ): CSSProperties | undefined => {
    let style: { [key: string]: string | number } = {};
    targetArea?.forEach((item, i) => {
      if (index >= item.start && index <= item.end) {
        style = {
          ...style,
          backgroundColor:
            hoverQuote &&
            hoverQuote?.id !== null &&
            item.id !== hoverQuote?.id &&
            !hoverQuote?.isHover
              ? item?.color
                ? `${item?.color}20`
                : `${CONSTANTS.COLOR_LIST[i % CONSTANTS.COLOR_LIST.length]}20`
              : item?.color ??
                CONSTANTS.COLOR_LIST[i % CONSTANTS.COLOR_LIST.length],
          color: 'white',
        };
      }
    });
    return style;
  };

  const targetArea = (
    index,
    targetList,
    target,
  ): React.ReactElement | React.ReactFragment => {
    let res = (
      <span
        key={index}
        id={`${index}`}
        style={setTargetAreaStyle(index, targetData)}
        className={`char char${index}`}
        onMouseEnter={!disabled ? resizeHandler : () => undefined}
      >
        {target}
      </span>
    );
    targetList?.forEach((item) => {
      const id = `${item.id}-sel-handle-start`;
      // const id = `${item.id}`;
      if (item.start === index) {
        res = (
          <React.Fragment key={index}>
            {!disabled && (
              <span
                id={id}
                className="sel-handle sel-start"
                onMouseDown={selHandler}
                onMouseEnter={(e) => e.preventDefault()}
              >
                |
              </span>
            )}
            {res}
          </React.Fragment>
        );
        return;
      }
      if (item.end === index) {
        res = (
          <React.Fragment key={index}>
            {res}
            {!disabled && (
              <span
                id={id}
                className="sel-handle sel-end"
                onMouseDown={!disabled ? selHandler : () => undefined}
                onMouseEnter={
                  !disabled ? (e) => e.preventDefault() : () => undefined
                }
              >
                |
              </span>
            )}
          </React.Fragment>
        );
      }
    });
    return res;
  };

  const resizeHandler = (e): void => {
    e.stopPropagation();
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
    if (
      selectionData.isDragging &&
      targetData &&
      !['sel-handle-start', 'sel-handle-end'].includes(e.relatedTarget.id)
    ) {
      const direction =
        selectionData?.draggingHandle?.className === 'sel-handle sel-start'
          ? 'sel-start'
          : 'sel-end';

      if (direction === 'sel-start') {
        const newTargetData = targetData.map((item) => {
          if (selectionData?.draggingHandle?.id.includes(item.id)) {
            return {
              ...item,
              start:
                parseInt(e.target.id, 10) < item.end
                  ? parseInt(e.target.id, 10)
                  : item.end,
            };
          }
          return item;
        });

        setTargetData(newTargetData);
      }
      if (direction === 'sel-end') {
        const newTargetData = targetData.map((item) => {
          console.log({
            e,
            targetData,
            item,
            handle: selectionData?.draggingHandle?.id,
          });
          if (selectionData?.draggingHandle?.id.includes(item.id)) {
            return {
              ...item,
              end:
                parseInt(e.target.id, 10) > item.start
                  ? parseInt(e.target.id, 10)
                  : item.start,
            };
          }
          return item;
        });
        console.log({ e, newTargetData });
        setTargetData(newTargetData);
      }
    }
  };

  const selHandler = (e) => {
    setSelectionData({
      ...selectionData,
      isDragging: true,
      draggingHandle: e.target,
    });
    e.preventDefault();
    e.target.onselectstart = () => {
      return false;
    };
  };

  const mouseUpHandler = (): void => {
    if (!disabled) {
      setSelectionData({
        ...selectionData,
        isDragging: false,
      });
    }
  };

  useEffect(() => {
    if (!disabled) {
      document.addEventListener('mouseup', mouseUpHandler);
    }
    if (disabled) {
      document.removeEventListener('mouseup', mouseUpHandler);
    }
    return () => document.removeEventListener('mouseup', mouseUpHandler);
  }, [disabled]);

  useEffect(() => {
    const charNode = Array.from(affectedData || '', (target, i) =>
      targetArea(i, targetData, target),
    );
    setAffectedTextNode(charNode);
  }, [targetData, selectionData]);

  useDidMountEffect(() => {
    if (
      setTargetContent &&
      targetData &&
      !selectionData.isDragging &&
      !disabled
    ) {
      setTargetContent(targetData);
    }
  }, [selectionData.isDragging]);

  useDidMountEffect(() => {
    setTargetData(targetContent || []);
  }, [targetContent]);

  useDidMountEffect(() => {
    setAffectedData(affectedContent);
  }, [affectedContent]);

  return (
    <div
      className={className}
      style={style ?? { display: 'flex', overflow: 'break-word' }}
      onMouseEnter={(e) => {
        e.stopPropagation();
        e.preventDefault();
        e.nativeEvent.stopImmediatePropagation();
      }}
    >
      {affectedTextNode}
    </div>
  );
};

export default TextPartsSelector;