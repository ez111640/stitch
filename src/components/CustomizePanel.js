import React from 'react';

const CustomizePanel = ({
    activePanel,
    previewImage,
    previewText,
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
        className={`panel panel-compact panel-span ${(previewImage || previewText) ? 'panel-has-preview' : ''} ${activePanel === 'customize' && (previewImage || previewText) ? 'panel-active' : ''}`}
        onClick={() => setActivePanel('customize')}
        onMouseEnter={() => {
            if (previewImage || previewText) {
                setActivePanel('customize');
            }
        }}
    >
        <div className="panel-header">
            <div className="panel-title-row">
                <h2 className="panel-title">2) Customize your font</h2>
                <span className="panel-help">
                    ?
                    <span className={`panel-tooltip ${!previewImage ? 'panel-tooltip-inactive' : ''}`}>
                        {!previewImage && (
                            <>
                                <span className="panel-tooltip-warning">Add text from Box 1</span>
                                <span className="panel-tooltip-warning">Click "Customize Font"</span>
                            </>
                        )}
                        <span className="panel-tooltip-line">Choose font & color</span>
                        <span className="panel-tooltip-line">Adjust spacing & bend</span>
                        <span className="panel-tooltip-line">Add to hoop</span>
                    </span>
                </span>
            </div>
        </div>
        <div className="control-toolbar control-toolbar-tight">
            <div className="control-toolbar-row control-toolbar-row-primary">
                <div className="control-group control-group-solo">
                    <select
                        id="fontFamily"
                        value={fontFamily}
                        onChange={(event) => setFontFamily(event.target.value)}
                        disabled={!previewImage}
                        className="control control-font"
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
                <span className="control-toolbar-divider" aria-hidden="true">
                    |
                </span>
                <div className="control-group control-group-solo">
                    <input
                        id="textColor"
                        type="color"
                        value={textColor}
                        onChange={(event) => setTextColor(event.target.value)}
                        disabled={!previewImage}
                        className="color-input"
                    />
                </div>
                <span className="control-toolbar-divider" aria-hidden="true">
                    |
                </span>
                <div className="control-group">
                    <label className="control-label">Curve:</label>
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
                <div className="control-toolbar-spacer" />
            </div>
            <div className="control-toolbar-row control-toolbar-row-secondary">
                <div className="control-group control-group-solo">
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
                <span className="control-toolbar-divider" aria-hidden="true">
                    |
                </span>
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
        </div>
        <div className={`preview-box ${previewBackground === 'white' ? 'preview-box-white' : ''}`}>
            {previewImage ? (
                <img src={previewImageSrc} alt="Preview" className="preview-image" />
            ) : (
                <div>Click “Customize Font” to stage your text.</div>
            )}
        </div>
        <div className="action-row">
            <button
                type="button"
                onClick={addToHoop}
                disabled={(!previewImage && !previewText) || activePanel !== 'customize'}
                className="btn btn-primary"
            >
                Add to Hoop
            </button>
            <button
                type="button"
                onClick={resetCustomizeControls}
                disabled={(!previewImage && !previewText) || activePanel !== 'customize'}
                className="btn"
            >
                Reset Colors
            </button>
            <button
                type="button"
                onClick={clearPreviewBox}
                disabled={(!previewImage && !previewText) || activePanel !== 'customize'}
                className="btn"
            >
                Clear Preview
            </button>
        </div>
    </div>
);

export default CustomizePanel;
