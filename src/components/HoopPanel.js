import React from 'react';

const HoopPanel = ({
    activePanel,
    hoopImages,
    setActivePanel,
    hoopShape,
    setHoopShape,
    hoopSize,
    setHoopSize,
    circleSizes,
    ovalSizes,
    squareSizes,
    rectangleSizes,
    maxHoopSize,
    hoopWidth,
    hoopHeight,
    circleRef,
    selectedHoopId,
    setSelectedHoopId,
    handleHoopPointerDown,
    handleHoopPointerMove,
    handleHoopPointerUp,
    handleResizePointerDown,
    handleResizePointerMove,
    handleResizePointerUp,
    handleMakePattern,
    deleteSelectedHoopItem,
    clearHoop,
    clearHoopOpen,
    setClearHoopOpen,
    clearHoopPos,
    hoopActionsRef,
    clearHoopButtonRef,
    confirmClearHoop
}) => (
    <div
        className={`panel hoop-panel ${activePanel === 'hoop' && hoopImages.length > 0 ? 'panel-active' : ''} ${hoopImages.length > 0 ? 'panel-has-items' : ''}`}
        onClick={() => {
            if (hoopImages.length === 0) return;
            setActivePanel('hoop');
        }}
    >
        <div className="panel-header">
            <div className="panel-title-row">
                <h2 className="panel-title">3) Position in Hoop</h2>
                <span
                    className="panel-help"
                    data-tooltip={"• Drag items to position\n• Resize with corner handles\n• Make pattern when ready"}
                >
                    ?
                </span>
            </div>
        </div>
        <div className="panel-header-controls">
            <label htmlFor="hoopShape" className="control-label">Shape:</label>
            <select
                id="hoopShape"
                value={hoopShape}
                onChange={(event) => {
                    const nextShape = event.target.value;
                    setHoopShape(nextShape);
                    if (nextShape === 'oval') {
                        setHoopSize('5x7');
                    } else if (nextShape === 'rectangle') {
                        setHoopSize('6x8');
                    } else if (nextShape === 'square') {
                        setHoopSize('6');
                    } else {
                        setHoopSize('6');
                    }
                }}
                className="control"
            >
                <option value="circle">Circle</option>
                <option value="square">Square</option>
                <option value="oval">Oval</option>
                <option value="rectangle">Rectangle</option>
            </select>
            <label htmlFor="hoopSize" className="control-label">Hoop size:</label>
            <select
                id="hoopSize"
                value={hoopSize}
                onChange={(event) => setHoopSize(event.target.value)}
                className="control"
            >
                {(hoopShape === 'oval'
                    ? ovalSizes
                    : hoopShape === 'rectangle'
                        ? rectangleSizes
                        : hoopShape === 'square'
                            ? squareSizes
                            : circleSizes
                ).map((size) => (
                    <option key={size.value} value={size.value}>
                        {size.label}
                    </option>
                ))}
            </select>
        </div>
        <div
            className="hoop-stage"
            style={{
                width: `${maxHoopSize}px`,
                height: `${maxHoopSize}px`
            }}
        >
            <div
                ref={circleRef}
                className={`hoop-frame hoop-frame-${hoopShape}`}
                style={{
                    width: `${hoopWidth}px`,
                    height: `${hoopHeight}px`,
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                }}
            >
                {hoopImages.length === 0 ? (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        Add an item to begin positioning.
                    </div>
                ) : (
                    hoopImages.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedHoopId(item.id)}
                            style={{
                                position: 'absolute',
                                left: '50%',
                                top: '50%',
                                width: `${item.width}px`,
                                height: `${item.height}px`,
                                transform: `translate(calc(-50% + ${item.x}px), calc(-50% + ${item.y}px))`,
                                border: selectedHoopId === item.id ? '1px dotted #111' : '1px dotted transparent',
                                boxSizing: 'border-box'
                            }}
                        >
                            <img
                                src={item.src}
                                alt="Hoop item"
                                onPointerDown={handleHoopPointerDown(item.id)}
                                onPointerMove={handleHoopPointerMove}
                                onPointerUp={handleHoopPointerUp}
                                onPointerLeave={handleHoopPointerUp}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    cursor: 'grab',
                                    display: 'block'
                                }}
                            />
                            {[
                                { key: 'tl', left: '-6px', top: '-6px', cursor: 'nwse-resize', dirX: -1 },
                                { key: 'tr', right: '-6px', top: '-6px', cursor: 'nesw-resize', dirX: 1 },
                                { key: 'bl', left: '-6px', bottom: '-6px', cursor: 'nesw-resize', dirX: -1 },
                                { key: 'br', right: '-6px', bottom: '-6px', cursor: 'nwse-resize', dirX: 1 }
                            ].map((handle) => (
                                <div
                                    key={handle.key}
                                    onPointerDown={handleResizePointerDown(item.id, handle.dirX)}
                                    onPointerMove={handleResizePointerMove}
                                    onPointerUp={handleResizePointerUp}
                                    onPointerLeave={handleResizePointerUp}
                                    style={{
                                        position: 'absolute',
                                        width: '12px',
                                        height: '12px',
                                        background: '#ffffff',
                                        border: '1px solid #111',
                                        boxSizing: 'border-box',
                                        cursor: handle.cursor,
                                        display: selectedHoopId === item.id ? 'block' : 'none',
                                        ...('left' in handle ? { left: handle.left } : {}),
                                        ...('right' in handle ? { right: handle.right } : {}),
                                        ...('top' in handle ? { top: handle.top } : {}),
                                        ...('bottom' in handle ? { bottom: handle.bottom } : {})
                                    }}
                                />
                            ))}
                        </div>
                    ))
                )}
            </div>
        </div>
        <div className="action-row hoop-actions" ref={hoopActionsRef}>
            <button type="button" onClick={handleMakePattern} disabled={hoopImages.length === 0} className="btn btn-primary">
                Make Cross Stitch Pattern
            </button>
            <button type="button" onClick={deleteSelectedHoopItem} disabled={!selectedHoopId} className="btn">
                Remove Selected
            </button>
            <button
                type="button"
                onClick={clearHoop}
                disabled={hoopImages.length === 0}
                className="btn"
                ref={clearHoopButtonRef}
            >
                Clear Hoop
            </button>
            {clearHoopOpen && (
                <>
                    <div className="confirm-backdrop" onClick={() => setClearHoopOpen(false)}></div>
                    <div
                        className="confirm-popover"
                        style={{
                            left: `${clearHoopPos.left}px`,
                            top: `${clearHoopPos.top - 8}px`
                        }}
                    >
                        <div className="confirm-title">Clear all items?</div>
                        <div className="confirm-text">This cannot be undone.</div>
                        <div className="confirm-actions">
                            <button type="button" className="btn" onClick={() => setClearHoopOpen(false)}>
                                Cancel
                            </button>
                            <button type="button" className="btn btn-primary" onClick={confirmClearHoop}>
                                Clear
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    </div>
);

export default HoopPanel;
