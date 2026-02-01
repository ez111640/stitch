import React from 'react';

export const TitleCardPanel = ({ setActivePanel, setTutorialOpen, setTutorialStepIndex }) => (
    <div className="panel panel-title-card" onClick={() => setActivePanel('text')}>
        <div className="page-title">
            <span className="logo-text" aria-label="STITCH-UATION">STITCH-UATION</span>
            <span className="logo-tag">cross stitch pattern generator</span>
        </div>
        <button
            type="button"
            className="title-help"
            aria-label="Open how-to walkthrough"
            onClick={(event) => {
                event.stopPropagation();
                setTutorialOpen(true);
                setTutorialStepIndex(0);
            }}
        >
            ?
        </button>
    </div>
);

export const TextInputPanel = ({ activePanel, previewImage, setActivePanel, handleTextImageClick, clearTextBox, quillRef }) => (
    <div
        className={`panel panel-compact ${activePanel === 'text' ? 'panel-active' : ''} ${previewImage ? 'panel-muted panel-locked' : ''}`}
        onClick={() => {
            if (previewImage) return;
            setActivePanel('text');
        }}
    >
        <div className="panel-header">
            <div className="panel-title-row">
                <h2 className="panel-title">1) Type your text</h2>
                <span className="panel-help">
                    ?
                    <span className={`panel-tooltip ${previewImage ? '' : 'panel-tooltip-inactive'}`}>
                        {previewImage && (
                            <>
                                <span className="panel-tooltip-warning">Finish editing Box 2</span>
                                <span className="panel-tooltip-warning">Clear or Add to Hoop</span>
                            </>
                        )}
                        <span className="panel-tooltip-line">Type your text</span>
                        <span className="panel-tooltip-line">Click Convert to Image</span>
                    </span>
                </span>
            </div>
        </div>
        <div ref={quillRef} className="editor-surface" style={{ height: '240px' }}></div>
        <div className="action-row">
            <button type="button" onClick={handleTextImageClick} className="btn btn-primary" disabled={Boolean(previewImage)}>
                Convert to Image
            </button>
            <button type="button" onClick={clearTextBox} className="btn" disabled={Boolean(previewImage)}>
                Clear Text
            </button>
        </div>
    </div>
);

export const CustomizePanel = ({
    activePanel,
    previewImage,
    setActivePanel,
    fontFamily,
    setFontFamily,
    textColor,
    setTextColor,
    previewBend,
    handlePreviewBend,
    previewBackground,
    setPreviewBackground,
    letterSpacing,
    setLetterSpacing,
    previewImageSrc,
    addToHoop,
    resetCustomizeControls,
    clearPreviewBox
}) => (
    <div
        className={`panel panel-compact panel-span ${previewImage ? 'panel-has-preview' : ''} ${activePanel === 'customize' && previewImage ? 'panel-active' : ''}`}
        onClick={() => setActivePanel('customize')}
    >
        <div className="panel-header">
            <div className="panel-title-row">
                <h2 className="panel-title">2) Customize your image</h2>
                <span className="panel-help">
                    ?
                    <span className={`panel-tooltip ${!previewImage ? 'panel-tooltip-inactive' : ''}`}>
                        {!previewImage && (
                            <>
                                <span className="panel-tooltip-warning">Add text from Box 1</span>
                                <span className="panel-tooltip-warning">Click "Convert to Image"</span>
                            </>
                        )}
                        <span className="panel-tooltip-line">Choose font & color</span>
                        <span className="panel-tooltip-line">Adjust spacing & bend</span>
                        <span className="panel-tooltip-line">Add to hoop</span>
                    </span>
                </span>
            </div>
        </div>
        <div className="control-toolbar">
            <div className="control-group">
                <label htmlFor="fontFamily" className="control-label">Font</label>
                <select
                    id="fontFamily"
                    value={fontFamily}
                    onChange={(event) => setFontFamily(event.target.value)}
                    disabled={!previewImage}
                    className="control"
                >
                    <option value="Arial, sans-serif" style={{ fontFamily: 'Arial, sans-serif' }}>Arial</option>
                    <option value="'Helvetica Neue', sans-serif" style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>Helvetica Neue</option>
                    <option value="'Helvetica', sans-serif" style={{ fontFamily: 'Helvetica, sans-serif' }}>Helvetica</option>
                    <option value="'Segoe UI', sans-serif" style={{ fontFamily: 'Segoe UI, sans-serif' }}>Segoe UI</option>
                    <option value="'Calibri', sans-serif" style={{ fontFamily: 'Calibri, sans-serif' }}>Calibri</option>
                    <option value="'Cambria', serif" style={{ fontFamily: 'Cambria, serif' }}>Cambria</option>
                    <option value="'Candara', sans-serif" style={{ fontFamily: 'Candara, sans-serif' }}>Candara</option>
                    <option value="'Franklin Gothic Medium', sans-serif" style={{ fontFamily: 'Franklin Gothic Medium, sans-serif' }}>Franklin Gothic</option>
                    <option value="'Gill Sans', sans-serif" style={{ fontFamily: 'Gill Sans, sans-serif' }}>Gill Sans</option>
                    <option value="'Optima', sans-serif" style={{ fontFamily: 'Optima, sans-serif' }}>Optima</option>
                    <option value="'Futura', sans-serif" style={{ fontFamily: 'Futura, sans-serif' }}>Futura</option>
                    <option value="'Avenir Next', sans-serif" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Avenir Next</option>
                    <option value="'Century Gothic', sans-serif" style={{ fontFamily: 'Century Gothic, sans-serif' }}>Century Gothic</option>
                    <option value="'Palatino Linotype', serif" style={{ fontFamily: 'Palatino Linotype, serif' }}>Palatino Linotype</option>
                    <option value="'Baskerville', serif" style={{ fontFamily: 'Baskerville, serif' }}>Baskerville</option>
                    <option value="'Didot', serif" style={{ fontFamily: 'Didot, serif' }}>Didot</option>
                    <option value="'Rockwell', serif" style={{ fontFamily: 'Rockwell, serif' }}>Rockwell</option>
                    <option value="'Bookman', serif" style={{ fontFamily: 'Bookman, serif' }}>Bookman</option>
                    <option value="'Perpetua', serif" style={{ fontFamily: 'Perpetua, serif' }}>Perpetua</option>
                    <option value="'Copperplate', serif" style={{ fontFamily: 'Copperplate, serif' }}>Copperplate</option>
                    <option value="'Hoefler Text', serif" style={{ fontFamily: 'Hoefler Text, serif' }}>Hoefler Text</option>
                    <option value="'Lucida Bright', serif" style={{ fontFamily: 'Lucida Bright, serif' }}>Lucida Bright</option>
                    <option value="'Lucida Sans', sans-serif" style={{ fontFamily: 'Lucida Sans, sans-serif' }}>Lucida Sans</option>
                    <option value="'Lucida Console', monospace" style={{ fontFamily: 'Lucida Console, monospace' }}>Lucida Console</option>
                    <option value="'Consolas', monospace" style={{ fontFamily: 'Consolas, monospace' }}>Consolas</option>
                    <option value="'Monaco', monospace" style={{ fontFamily: 'Monaco, monospace' }}>Monaco</option>
                    <option value="'Comic Sans MS', cursive" style={{ fontFamily: 'Comic Sans MS, cursive' }}>Comic Sans MS</option>
                    <option value="'Brush Script MT', cursive" style={{ fontFamily: 'Brush Script MT, cursive' }}>Brush Script MT</option>
                    <option value="'Segoe Script', cursive" style={{ fontFamily: 'Segoe Script, cursive' }}>Segoe Script</option>
                    <option value="'Segoe Print', cursive" style={{ fontFamily: 'Segoe Print, cursive' }}>Segoe Print</option>
                    <option value="'Impact', sans-serif" style={{ fontFamily: 'Impact, sans-serif' }}>Impact</option>
                    <option value="'Tahoma', sans-serif" style={{ fontFamily: 'Tahoma, sans-serif' }}>Tahoma</option>
                    <option value="" disabled>──────────</option>
                    <option value="'Times New Roman', serif" style={{ fontFamily: 'Times New Roman, serif' }}>Times New Roman</option>
                    <option value="'Georgia', serif" style={{ fontFamily: 'Georgia, serif' }}>Georgia</option>
                    <option value="'Garamond', serif" style={{ fontFamily: 'Garamond, serif' }}>Garamond</option>
                    <option value="'Courier New', monospace" style={{ fontFamily: 'Courier New, monospace' }}>Courier New</option>
                    <option value="'Trebuchet MS', sans-serif" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>Trebuchet MS</option>
                    <option value="'Verdana', sans-serif" style={{ fontFamily: 'Verdana, sans-serif' }}>Verdana</option>
                    <option value="'Symbol', monospace" style={{ fontFamily: 'Symbol, monospace' }}>Symbol</option>
                </select>
            </div>
            <div className="control-group">
                <label htmlFor="textColor" className="control-label">Color</label>
                <input
                    id="textColor"
                    type="color"
                    value={textColor}
                    onChange={(event) => setTextColor(event.target.value)}
                    disabled={!previewImage}
                    className="color-input"
                />
            </div>
            <div className="control-group">
                <label className="control-label">Bend</label>
                <div className="bend-control">
                    <button
                        type="button"
                        className="btn btn-icon"
                        onClick={() => handlePreviewBend(-10)}
                        disabled={!previewImage}
                    >
                        −
                    </button>
                    <span className="control-value">{previewBend}°</span>
                    <button
                        type="button"
                        className="btn btn-icon"
                        onClick={() => handlePreviewBend(10)}
                        disabled={!previewImage}
                    >
                        +
                    </button>
                </div>
            </div>
            <div className="control-group">
                <label className="control-label">Preview background</label>
                <label className="control-toggle">
                    <input
                        type="checkbox"
                        checked={previewBackground === 'white'}
                        onChange={(event) => setPreviewBackground(event.target.checked ? 'white' : 'theme')}
                        disabled={!previewImage}
                    />
                    <span>Use white background</span>
                </label>
            </div>
            <div className="control-group">
                <label htmlFor="letterSpacing" className="control-label">Spacing</label>
                <div className="slider-control">
                    <input
                        id="letterSpacing"
                        type="range"
                        min="-2"
                        max="10"
                        step="1"
                        value={letterSpacing}
                        onChange={(event) => setLetterSpacing(Number(event.target.value))}
                        disabled={!previewImage}
                    />
                    <span className="control-value">{letterSpacing}px</span>
                </div>
            </div>
        </div>
        <div className="preview-box">
            {previewImage ? (
                <img src={previewImageSrc} alt="Preview" className="preview-image" />
            ) : (
                <div>Click “Convert to Image” to stage your text.</div>
            )}
        </div>
        <div className="action-row">
            <button type="button" onClick={addToHoop} disabled={!previewImage} className="btn btn-primary">
                Add to Hoop
            </button>
            <button type="button" onClick={resetCustomizeControls} disabled={!previewImage} className="btn btn-reset">
                Reset Colors
            </button>
            <button type="button" onClick={clearPreviewBox} className="btn">
                Clear Preview
            </button>
        </div>
    </div>
);

export const HoopPanel = ({
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

export const ComponentsPanel = ({
    activePanel,
    setActivePanel,
    componentsView,
    setComponentsView,
    components,
    premadeComponents,
    restoreComponentToBox1,
    restoreComponentToBox2,
    restoreComponentToBox3,
    deleteComponent,
    addComponentToHoop
}) => (
    <div
        className={`components-panel ${activePanel === 'components' ? 'panel-active' : ''}`}
        onClick={() => setActivePanel('components')}
    >
        <div className="components-layout">
            <div className="components-sidebar">
                <div className="components-header">
                    <div className="panel-title-row">
                        <h3>Components</h3>
                        <span
                            className="panel-help"
                            data-tooltip={"• Click Add to Hoop\n• Reuse saved components"}
                        >
                            ?
                        </span>
                    </div>
                </div>
                <div className="components-toggle">
                    <button
                        type="button"
                        className={`btn components-toggle-button ${componentsView === 'custom' ? 'is-active' : ''}`}
                        onClick={() => setComponentsView('custom')}
                    >
                        Custom
                    </button>
                    <button
                        type="button"
                        className={`btn components-toggle-button ${componentsView === 'premade' ? 'is-active' : ''}`}
                        onClick={() => setComponentsView('premade')}
                    >
                        Premade
                    </button>
                </div>
                <div className="components-nav">
                    <button type="button" className="btn" disabled>
                        Prev
                    </button>
                    <button type="button" className="btn" disabled>
                        Next
                    </button>
                </div>
            </div>
            <div className="components-content">
                {componentsView === 'custom' ? (
                    components.length === 0 ? (
                        <div className="components-empty">Converted items will appear here.</div>
                    ) : (
                        <div className="components-grid">
                            {components.map((component) => (
                                <div key={component.id} className="component-card">
                                    <div className="component-actions">
                                        <button
                                            type="button"
                                            className="component-chip"
                                            onClick={() => restoreComponentToBox1(component)}
                                            aria-label="Restore to box 1"
                                        >
                                            1
                                        </button>
                                        <button
                                            type="button"
                                            className="component-chip"
                                            onClick={() => restoreComponentToBox2(component)}
                                            aria-label="Restore to box 2"
                                        >
                                            2
                                        </button>
                                        <button
                                            type="button"
                                            className="component-chip"
                                            onClick={() => restoreComponentToBox3(component)}
                                            aria-label="Restore to box 3"
                                        >
                                            3
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        className="component-delete"
                                        onClick={() => deleteComponent(component.id)}
                                        aria-label="Delete component"
                                    >
                                        ×
                                    </button>
                                    <div className="component-thumb">
                                        <img src={component.src} alt="Component" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    <div className="components-grid">
                        {premadeComponents.map((component) => (
                            <div key={component.id} className="component-card premade-card">
                                <div className="component-thumb">
                                    <img src={component.src} alt={component.name} />
                                </div>
                                <div className="component-name">{component.name}</div>
                                <button
                                    type="button"
                                    className="btn component-add"
                                    onClick={() => addComponentToHoop(component)}
                                >
                                    Add to Hoop
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
);
